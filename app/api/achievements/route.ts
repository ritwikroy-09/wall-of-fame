import { NextRequest, NextResponse } from "next/server";
import { MongoClient, Binary, ObjectId } from "mongodb";
import { MONGO_URL } from "@/app/secrets";

const uri = MONGO_URL as string;
const client = new MongoClient(uri);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filter: any = {};
    const projection: any = {};
    if (searchParams.has("achievementCategory")) {
      filter.achievementCategory = searchParams.get("achievementCategory");
    }
    if (searchParams.has("professorEmail")) {
      filter.professorEmail = searchParams.get("professorEmail");
    }
    if (searchParams.has("approved")) {
      const approvedValue = searchParams.get("approved");
      if (approvedValue) {
        const approvedDate = new Date(approvedValue);
        if (!isNaN(approvedDate.getTime())) {
          filter.approved = { ...filter.approved, $gte: approvedDate };
        }
      }
    }
    if (searchParams.has("archived")) {
      filter.archived = searchParams.get("archived") === "true";
    }
    if (searchParams.has("_id")) {
      filter._id = new ObjectId(searchParams.get("_id") as string);
    }
    if (searchParams.has("whitelist")) {
      const whitelist = searchParams.get("whitelist")?.split(",") || [];
      whitelist.forEach((field) => {
        projection[field] = 1;
      });
    }
    if (searchParams.has("blacklist")) {
      const blacklist = searchParams.get("blacklist")?.split(",") || [];
      blacklist.forEach((field) => {
        projection[field] = 0;
      });
    }

    await client.connect();
    const db = client.db("Wall-Of-Fame");
    const achievements = await db
      .collection("achievers")
      .find(filter, { projection })
      .toArray();

    // Convert Binary data to base64 strings
    const processedAchievements = achievements.map((achievement) => {
      const processed = { ...achievement };

      // Convert userImage Binary to base64 if it exists and is Binary
      if (achievement.userImage?.data) {
        const imageData =
          achievement.userImage.data instanceof Binary
            ? achievement.userImage.data.buffer
            : achievement.userImage.data;

        processed.userImage = {
          data: Buffer.from(imageData).toString("base64"),
          contentType: achievement.userImage.contentType,
        };
      }

      // Convert certificateProof Binary to base64 if it exists and is Binary
      if (achievement.certificateProof?.data) {
        const certData =
          achievement.certificateProof.data instanceof Binary
            ? achievement.certificateProof.data.buffer
            : achievement.certificateProof.data;

        processed.certificateProof = {
          data: Buffer.from(certData).toString("base64"),
          contentType: achievement.certificateProof.contentType,
        };
      }

      return processed;
    });

    return NextResponse.json(
      { achievements: processedAchievements },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing achievements:", error);
    return NextResponse.json(
      { error: "Failed to fetch achievements" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Check if we're handling a batch update (array) or a single update
    if (Array.isArray(body)) {
      // BATCH UPDATE LOGIC
      if (body.length === 0) {
        return NextResponse.json(
          { error: "Empty array provided" },
          { status: 400 }
        );
      }
      
      // Validate each item in the array
      const invalidItems = body.filter(item => !item._id || Object.keys(item).length <= 1);
      if (invalidItems.length > 0) {
        return NextResponse.json(
          { 
            error: "Invalid items in batch update",
            invalidItems
          },
          { status: 400 }
        );
      }
      
      await client.connect();
      const db = client.db("Wall-Of-Fame");
      
      // Prepare batch operations
      const updateOperations = body.map(item => {
        const { _id, ...updateFields } = item;
        
        // Format date if approved field is present
        if (updateFields.approved) {
          updateFields.approved = new Date(updateFields.approved);
        }
        
        return {
          updateOne: {
            filter: { _id: new ObjectId(_id) },
            update: { $set: updateFields }
          }
        };
      });
      
      // Execute bulk operation
      const result = await db.collection("achievers").bulkWrite(updateOperations);
      
      return NextResponse.json(
        {
          message: "Batch update completed",
          matchedCount: result.matchedCount,
          modifiedCount: result.modifiedCount
        },
        { status: 200 }
      );
    } else {
      // SINGLE UPDATE LOGIC (EXISTING)
      const { _id, ...updateFields } = body;
      
      // Check if _id is provided
      if (!_id) {
        return NextResponse.json(
          { error: "Missing required field: _id" },
          { status: 400 }
        );
      }
      
      // Check if there are any fields to update
      if (Object.keys(updateFields).length === 0) {
        return NextResponse.json(
          { error: "No update fields provided" },
          { status: 400 }
        );
      }
      
      // Format date if approved field is present
      if (updateFields?.approved) {
        updateFields.approved = new Date(updateFields.approved);
      }
      
      await client.connect();
      const db = client.db("Wall-Of-Fame");
      
      // First check if document exists
      const documentExists = await db
        .collection("achievers")
        .findOne({ _id: new ObjectId(_id) });
        
      if (!documentExists) {
        return NextResponse.json(
          { error: "No document found with the given _id" },
          { status: 404 }
        );
      }
      
      // Proceed with update if document exists
      const result = await db
        .collection("achievers")
        .updateOne(
          { _id: new ObjectId(_id) },
          { $set: updateFields }
        );
      
      // We already checked for existence, so we only need to verify the update was successful
      if (result.acknowledged) {
        return NextResponse.json(
          { 
            message: "Achievement updated successfully",
            modifiedCount: result.modifiedCount
          },
          { status: 200 }
        );
      } else {
        throw new Error("Database operation not acknowledged");
      }
    }
  } catch (error: any) {
    console.error("Error updating achievement:", error);
    
    // Create a more detailed error response
    const errorMessage = error.message || "Unknown error";
    const errorCode = error.code || "UNKNOWN";
    
    return NextResponse.json(
      { 
        error: "Failed to update achievement", 
        details: errorMessage,
        code: errorCode,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
