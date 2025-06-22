"use client";
import React, { useState, useEffect } from "react";
import DynamicForm from "./form";
import axios from "axios";
import { achievementFormFields,FormField } from "../types/achievementFields";

// Define types for our forms
interface BasicFormData {
  fullName: string;
  registrationNumber: string;
  mobileNumber: string;
  email: string;
  achievementCategory: string;
  userImage: File;
}

// Generic type for achievement form data
type AchievementFormData = Record<string, any>;

// Combined data type
type CombinedFormData = BasicFormData & AchievementFormData;

export default function AchievementFormPage() {
  const [submissionData, setSubmissionData] = useState<CombinedFormData | null>(null);
  const [activeForm, setActiveForm] = useState<string>("basic");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<Partial<CombinedFormData>>({});

  useEffect(() => {
    const verifyToken = async () => {
      try {
        // extract token from the url

        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");
        if (!token) {
          throw new Error('No token found');
        }

        const response = await axios.post('/api/auth/decrypt-test', { token });
        setVerifiedEmail(response.data.payload.email);
      } catch (error) {
        console.error('Token verification failed:', error);
        // Redirect to login or show error
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);
  useEffect(()=>{setFormData(prev => ({ ...prev, studentMail: verifiedEmail }))},[verifiedEmail]); // Include verified email in form data

  if (isLoading) {
    return <div className="p-6 max-w-4xl mx-auto">
      <div className="text-center">Verifying user...</div>
    </div>;
  }

  if (!verifiedEmail) {
    return <div className="p-6 max-w-4xl mx-auto">
      <div className="text-center text-red-600">Email verification failed. Please try again.</div>
    </div>;
  } else{
  }

  // Form fields for the basic information
  const basicFormFields: FormField[] = [
    { name: "fullName", type: "text", label: "Full Name", required: true },
    { name: "registrationNumber", type: "text", label: "Registration Number", required: true },
    { name: "mobileNumber", type: "text", label: "Mobile Number", placeholder: "e.g., 9876543210", required: true },
    { name: "studentMail", type: "text", label: "Email Address", placeholder: verifiedEmail, required: true, blocked: true },
    { name: "userImage", type: "document", label: "User Image", required: true },
    { 
      name: "achievementCategory", 
      type: "option", 
      label: "Achievement Type", 
      options: [
        "ONLINE_COURSES", "OUTREACH_PROGRAMS", "EVENT_PARTICIPATION", "AWARDS",
        "SCHOLARSHIPS", "RESEARCH_PUBLICATION", "ACHIEVEMENTS", "INTERNSHIPS",
        "STARTUPS", "INNOVATIONS", "BUSINESS_EXAMS"
      ], 
      required: true 
    }
  ];

  // Store form data between steps
  const handleSubmit = async (achievementData: AchievementFormData) => {  
    const formDataToSend = new FormData();
    
    // Add basic information fields to the form data
    if (formData.fullName) formDataToSend.append("fullName", formData.fullName);
    if (formData.registrationNumber) formDataToSend.append("registrationNumber", formData.registrationNumber);
    if (formData.mobileNumber) formDataToSend.append("mobileNumber", formData.mobileNumber);
    if (formData.studentMail) formDataToSend.append("studentMail", formData.studentMail);
    if (formData.achievementCategory) formDataToSend.append("achievementCategory", formData.achievementCategory);
    
    // Add user image file if it exists
    if (formData.userImage instanceof File) {
      formDataToSend.append("userImage", formData.userImage);
    }
    
    // Handle achievement data - ensure it doesn't contain basic info fields
    const achievementDataClean = { ...achievementData };
    
    // Make sure achievement data doesn't contain any basic info
    const basicInfoFields = ["fullName", "registrationNumber", "mobileNumber", "studentMail", "achievementCategory", "userImage"];
    basicInfoFields.forEach(field => {
      if (field in achievementDataClean) {
        delete achievementDataClean[field];
      }
    });
    
    // Create a JSON-safe version of the achievement data
    const achievementDataJSON = { ...achievementDataClean };
    
    // Append all files in achievement data directly to FormData and update JSON representation
    Object.keys(achievementDataClean).forEach(key => {
      if (achievementDataClean[key] instanceof File) {
        const file = achievementDataClean[key] as File;
        // Append file directly to FormData with its field name
        formDataToSend.append(key, file);
        
        // Store only the file name in JSON representation (not the File object)
        achievementDataJSON[key] = key;
      }
    });
    
    console.log(achievementDataJSON);
    // Append the achievement data as JSON
    formDataToSend.append("AchievementData", JSON.stringify(achievementDataJSON));
    
    try {
      const response = await axios.post("/api/submitAchievement", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      if (response.status === 200) {
        setIsSubmitting(false);
        // For display purposes, combine both sets of data
        setSubmissionData({
          ...formData,
          ...achievementDataClean
        } as CombinedFormData);
        console.log("Submission successful!");
      } else {
        console.error("Submission failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      setIsSubmitting(false);
    }
  };
  

  // Handle the first form submission
  const handleBasicFormSubmit = (data: Record<string, any>) => {
    setFormData(prev => ({ 
      ...prev, 
      ...data,
      // studentMail: verifiedEmail // Include verified email in form data
    }));
    setActiveForm(data.achievementCategory);
  };
  
  // Handle the achievement specific form submission
  const handleAchievementFormSubmit = (data: AchievementFormData) => {
    setIsSubmitting(true);
    handleSubmit(data); // Trigger handleSubmit
  };
  
  // Handle going back to the basic form
  const handleBackToBasic = () => {
    setActiveForm("basic");
    // Pre-fill the basic form with previously submitted data
    setFormData(prev => ({ ...prev }));
  };
  
  // Handle form reset
  const handleReset = () => {
    setFormData({});
    setSubmissionData(null);
    setActiveForm("basic");
  };

  // Format file names for display in the success summary
  const formatFileData = (data: CombinedFormData) => {
    const formattedData = { ...data };
    
    // Format file objects to show just the name
    Object.entries(formattedData).forEach(([key, value]) => {
      if (value instanceof File) {
        formattedData[key] = `File: ${value.name}`;
      }
    });
    
    return formattedData;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-8 text-center">Achievement Submission Form</h1>
      
      {submissionData ? (
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <h2 className="text-xl font-semibold text-green-800 mb-4">Submission Successful!</h2>
          <div className="bg-white p-4 rounded-md shadow-sm">
            <h3 className="font-medium mb-2">Form Data Summary:</h3>
            <pre className="bg-gray-50 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(formatFileData(submissionData), null, 2)}
            </pre>
          </div>
          <button 
            onClick={handleReset}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Submit Another Achievement
          </button>
        </div>
      ) : (
        <>
          {activeForm === "basic" ? (
            <div className="mb-8">
              <DynamicForm
                title="Basic Information"
                fields={basicFormFields}
                submitButtonText="Continue to Achievement Details"
                onSubmit={handleBasicFormSubmit}
                initialValues={formData} // Pass previously submitted data as initial values
              />
            </div>
          ) : (
            <div>
              <div className="mb-4 flex items-center">
                <button 
                  onClick={handleBackToBasic}
                  className="text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  Back to Basic Information
                </button>
              </div>
              
              <DynamicForm
                title={`${activeForm.replace(/_/g, " ")} Details`}
                fields={achievementFormFields[activeForm]}
                submitButtonText={isSubmitting ? "Submitting..." : "Submit Achievement"}
                onSubmit={handleAchievementFormSubmit}
                initialValues={formData} // Pass previously submitted data as initial values
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
