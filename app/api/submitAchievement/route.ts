import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, Binary } from 'mongodb';
import { EmailService } from '@/app/utils/EmailServices';
import { Blob } from 'buffer';
import { FormField,achievementFormFields } from '@/app/types/achievementFields';
import { MONGO_URL, NEXT_PUBLIC_SITE_URL } from '@/app/secrets';

// MongoDB connection
const uri = MONGO_URL as string;
const client = new MongoClient(uri);

// Define form field configurations
const basicFormFields: FormField[] = [
    { name: "fullName", required: true ,type: "text"},
    { name: "registrationNumber", required: true,type: "text" },
    { name: "mobileNumber", required: true,type: "text" },
    { name: "studentMail", required: true ,type: "text"},
    { name: "userImage", required: true, type: "document" },
    { name: "achievementCategory", required: true ,type: "text"},
    { name: "AchievementData", required: true ,type: "text"},
];

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const achievementCategory = formData.get('achievementCategory') as string;

        // Validate basic fields
        for (const field of basicFormFields) {
            if (field.required && !formData.get(field.name)) {
                return NextResponse.json(
                    { error: `Missing required field: ${field.name}` },
                    { status: 400 }
                );
            }
        }

        // Parse AchievementData from JSON
        const achievementDataJson = formData.get('AchievementData') as string;
        // console.log('AchievementData:', achievementDataJson);
        let AchievementDATA: Record<string, any>;
        try {
            AchievementDATA = JSON.parse(achievementDataJson);
        } catch (error) {
            return NextResponse.json(
                { error: 'Invalid JSON format in AchievementData' },
                { status: 400 }
            );
        }

        // Validate achievement-specific fields
        const specificFields = achievementFormFields[achievementCategory];
        if (!specificFields) {
            return NextResponse.json(
                { error: `Invalid achievement type: ${achievementCategory}` },
                { status: 400 }
            );
        }
        for (const field of specificFields) {
            if (field.required && !AchievementDATA[field.name]) {
                return NextResponse.json(
                    { error: `Missing required field: ${field.name}` },
                    { status: 400 }
                );
            }
        }

        // Process files and other fields
        const achievement: any = {};
        for (const field of [...basicFormFields, ...specificFields]) {
            const value = formData.get(field.name);
            if (value instanceof Blob) {
                const arrayBuffer = await value.arrayBuffer();
                achievement[field.name] = {
                    data: new Binary(new Uint8Array(arrayBuffer)),
                    contentType: value.type
                };
            } else if (field.name in AchievementDATA) {
                // Check if the value in AchievementDATA refers to a file field in formData
                const achievementValue = AchievementDATA[field.name];
                if (field.type === "document" && typeof achievementValue === "string") {
                    // Check if this string is referring to a file in formData
                    const fileValue = formData.get(achievementValue);
                    if (fileValue instanceof Blob) {
                        const arrayBuffer = await fileValue.arrayBuffer();
                        achievement[field.name] = {
                            data: new Binary(new Uint8Array(arrayBuffer)),
                            contentType: fileValue.type
                        };
                    } else {
                        achievement[field.name] = achievementValue;
                    }
                } else {
                    achievement[field.name] = achievementValue;
                }
            } else {
                achievement[field.name] = value;
            }
        }

        // Validate mobile number
        const mobileNumber = achievement.mobileNumber as string;
        const mobileNumberPattern = /^[0-9]{10}$/;
        if (!mobileNumberPattern.test(mobileNumber)) {
            return NextResponse.json(
                { error: 'Invalid mobile number. It must be a valid 10-digit phone number.' },
                { status: 400 }
            );
        }
        // Connect to MongoDB
        await client.connect();
        const db = client.db('Wall-Of-Fame');
        const collection = db.collection('achievers');
        // const counters = db.collection('counters');
        // const SEQ = await counters.findOneAndUpdate(
        //     { _id: "orderCounter" as any },
        //     { $inc: { seq: 1 } },
        //     { returnDocument: "after", upsert: true }
        // );
        // if (!SEQ || !SEQ.value?.seq) {
        //     throw new Error('Failed to retrieve order sequence number');
        // }
        achievement.order = 20;
        achievement.submissionDate = new Date();
        achievement.approved = null;
        achievement.overAllTop10 = false;
        achievement.archived = false;

        // Insert the achievement
        const result = await collection.insertOne(achievement);

        // Send email notification
        EmailService.sendEmail(
            "ritwikroy0907@gmail.com",//change to category based on mesh
            `Achievement approval for ${achievement.fullName}`,
            `<h1>Dear Professor,</h1>
            <p>One of your students, ${achievement.fullName}, has submitted an achievement for approval. Please review the details and provide your feedback.</p>
            <p><strong>Registration Number:</strong> ${achievement.registrationNumber}</p>
            <p><strong>Phone Number:</strong> +91 ${achievement.mobileNumber}</p>
            <p><strong>Achievement Type:</strong> ${achievementCategory}</p>
            <p><strong>Submission Date:</strong> ${achievement.submissionDate}</p>
            <p><a href="${NEXT_PUBLIC_SITE_URL}/dashboard">Click here</a> to approve or reject the achievement.</p>
            <p>Thank you!</p>`
        );

        return NextResponse.json({
            success: true,
            message: 'Achievement submitted successfully',
            documentId: result.insertedId
        });

    } catch (error: any) {
        console.error('Error submitting achievement:', error);
    
        if (error.name === 'MongoServerError' && error.code === 121) {
            console.error('Validation error details:', error.errInfo?.details);
            return NextResponse.json(
                { error: 'Validation failed', details: error.errInfo?.details },
                { status: 400 }
            );
        }
    
        return NextResponse.json(
            { error: `Database error: ${error.message}` },
            { status: 500 }
        );
        } finally {
        await client.close();
    }
}

// Set larger size limit for the API route
export const config = {
    api: {
        bodyParser: false,
        sizeLimit: '10mb'
    }
};