export interface FormField {
    name: string;
    type: "document" | "text" | "option";
    label?: string;
    placeholder?: string;
    required?: boolean;
    options?: string[];
    blocked?: boolean;
  }
  
// Form field configurations for each achievement type
export const achievementFormFields: Record<string, FormField[]> = {
  ONLINE_COURSES: [
    { name: "courseName", type: "text", label: "Course Name", required: true },
    { name: "courseCode", type: "text", label: "Course Code", required: true },
    { name: "startDate", type: "text", label: "Start Date", placeholder: "YYYY-MM-DD", required: true },
    { name: "endDate", type: "text", label: "End Date", placeholder: "YYYY-MM-DD", required: true },
    { name: "duration", type: "text", label: "Duration", placeholder: "e.g., 8 weeks", required: true },
    { name: "platform", type: "text", label: "Platform", placeholder: "e.g., Coursera, Udemy", required: true },
    { name: "certificatePDF", type: "document", label: "Certificate", required: true },
    { name: "title", type: "text", label: "Achievement Title", required: true },
    { name: "description", type: "text", label: "Achievement Description", placeholder: "Be careful, this will be visible publicly if accepted", required: true },
  ],
  OUTREACH_PROGRAMS: [
    { name: "activityName", type: "text", label: "Activity Name", required: true },
    { name: "organizingUnit", type: "text", label: "Organizing Unit", required: true },
    { name: "schemeName", type: "text", label: "Scheme Name", required: true },
    { name: "date", type: "text", label: "Date", placeholder: "YYYY-MM-DD", required: true },
    { name: "reportPDF", type: "document", label: "Report", required: true },
    { name: "title", type: "text", label: "Achievement Title", required: true },
    { name: "description", type: "text", label: "Achievement Description", placeholder: "Be careful, this will be visible publicly if accepted", required: true },
  ],
  EVENT_PARTICIPATION: [
    { name: "eventName", type: "text", label: "Event Name", required: true },
    { 
      name: "eventType", 
      type: "option", 
      label: "Event Type", 
      options: ["Workshop", "Seminar", "Competition", "Conference", "Hackathon", "Other"], 
      required: true 
    },
    { name: "date", type: "text", label: "Date", placeholder: "YYYY-MM-DD", required: true },
    { name: "certificatePDF", type: "document", label: "Certificate", required: true },
    { name: "title", type: "text", label: "Achievement Title", required: true },
    { name: "description", type: "text", label: "Achievement Description", placeholder: "Be careful, this will be visible publicly if accepted", required: true },
  ],
  AWARDS: [
    { name: "awardName", type: "text", label: "Award Name", required: true },
    { name: "organization", type: "text", label: "Organization", required: true },
    { name: "level", type: "text", label: "Level", required: true },
    { name: "date", type: "text", label: "Date", placeholder: "YYYY-MM-DD", required: true },
    { name: "amount", type: "text", label: "Amount", placeholder: "e.g., 10000", required: true },
    { name: "awardPdf", type: "document", label: "Award", required: true },
    { name: "title", type: "text", label: "Achievement Title", required: true },
    { name: "description", type: "text", label: "Achievement Description", placeholder: "Be careful, this will be visible publicly if accepted", required: true },
  ],
  SCHOLARSHIPS: [
    { name: "scholarshipName", type: "text", label: "Scholarship Name", required: true },
    { name: "issuingAuthority", type: "text", label: "Issuing Authority", required: true },
    { name: "amount", type: "text", label: "Amount", placeholder: "e.g., 20000", required: true },
    { name: "proofPDF", type: "document", label: "Proof", required: true },
    { name: "title", type: "text", label: "Achievement Title", required: true },
    { name: "description", type: "text", label: "Achievement Description", placeholder: "Be careful, this will be visible publicly if accepted", required: true },
  ],
  RESEARCH_PUBLICATION: [
    { name: "publicationTitle", type: "text", label: "Publication Title", required: true },
    { name: "journalName", type: "text", label: "Journal Name", required: true },
    { name: "publicationType", type: "text", label: "Publication Type", required: true },
    { name: "date", type: "text", label: "Date", placeholder: "YYYY-MM-DD", required: true },
    { name: "proofPDF", type: "document", label: "Proof", required: true },
    { name: "title", type: "text", label: "Achievement Title", required: true },
    { name: "description", type: "text", label: "Achievement Description", placeholder: "Be careful, this will be visible publicly if accepted", required: true },
  ],
  ACHIEVEMENTS: [
    { name: "achievementName", type: "text", label: "Achievement Name", required: true },
    { name: "date", type: "text", label: "Date", placeholder: "YYYY-MM-DD", required: true },
    { name: "proofPDF", type: "document", label: "Proof", required: true },
    { name: "title", type: "text", label: "Achievement Title", required: true },
    { name: "description", type: "text", label: "Achievement Description", placeholder: "Be careful, this will be visible publicly if accepted", required: true },
  ],
  INTERNSHIPS: [
    { name: "organization", type: "text", label: "Organization", required: true },
    { name: "startDate", type: "text", label: "Start Date", placeholder: "YYYY-MM-DD", required: true },
    { name: "endDate", type: "text", label: "End Date", placeholder: "YYYY-MM-DD", required: true },
    { name: "stipend", type: "text", label: "Stipend", placeholder: "e.g., 5000/month", required: true },
    { name: "internshipCertificatePdf", type: "document", label: "Internship Certificate", required: true },
    { name: "title", type: "text", label: "Achievement Title", required: true },
    { name: "description", type: "text", label: "Achievement Description", placeholder: "Be careful, this will be visible publicly if accepted", required: true },
  ],
  STARTUPS: [
    { name: "startupName", type: "text", label: "Startup Name", required: true },
    { name: "nature", type: "text", label: "Nature", required: true },
    { name: "yearCommenced", type: "text", label: "Year Commenced", placeholder: "e.g., 2023", required: true },
    { name: "certificate", type: "text", label: "Certificate", required: true },
    { name: "registrationLetterPdf", type: "document", label: "Registration Letter", required: true },
    { name: "title", type: "text", label: "Achievement Title", required: true },
    { name: "description", type: "text", label: "Achievement Description", placeholder: "Be careful, this will be visible publicly if accepted", required: true },
  ],
  INNOVATIONS: [
    { name: "innovationName", type: "text", label: "Innovation Name", required: true },
    { name: "nature", type: "text", label: "Nature", required: true },
    { name: "sanctionedAmount", type: "text", label: "Sanctioned Amount", required: true },
    { name: "receivedAmount", type: "text", label: "Received Amount", required: true },
    { name: "letterDate", type: "text", label: "Letter Date", placeholder: "YYYY-MM-DD", required: true },
    { name: "commercializationLetterPdf", type: "document", label: "Commercialization Letter", required: true },
    { name: "title", type: "text", label: "Achievement Title", required: true },
    { name: "description", type: "text", label: "Achievement Description", placeholder: "Be careful, this will be visible publicly if accepted", required: true },
  ],
  BUSINESS_EXAMS: [
    { name: "examName", type: "text", label: "Exam Name", required: true },
    { name: "type", type: "text", label: "Type", required: true },
    { name: "activityName", type: "text", label: "Activity Name", required: true },
    { name: "proofPDF", type: "document", label: "Proof", required: true },
    { name: "title", type: "text", label: "Achievement Title", required: true },
    { name: "description", type: "text", label: "Achievement Description", placeholder: "Be careful, this will be visible publicly if accepted", required: true },
  ],
};
