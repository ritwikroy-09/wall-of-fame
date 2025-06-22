export interface Achievement {
    _id: string;
    fullName: string;
    registrationNumber: string;
    mobileNumber: string;
    studentMail: string | null;
    achievementCategory: string;
    professorName: string;
    professorEmail: string;
    userImage: {data: string, contentType: string};
    imageUrl: string;
    certificateProof: {data: string, contentType: string};
    certificateUrl: string;
    submissionDate: Date;
    remarks: string;
    approved: Date | null;
    overAllTop10: boolean;
    archived: boolean;
    title: string;
    description: string;
    order: number;
    AchievementData: Record<string, any>;
}
