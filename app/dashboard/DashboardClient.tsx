"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { categories } from "../types/categories";
import { Search, Filter, Check, X, MessageCircle } from "lucide-react";
import { RemarksModal } from "./RemarksModal";
import { StudentDetailsModal } from "./StudentDetailsModal";
import { formatDistanceToNow } from "date-fns";
import { Achievement } from "@/app/types/achievements";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useSearchParams } from "next/navigation";
import axios from "axios";

export default function DashboardClient() {
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
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
      }
    };

    verifyToken();
  }, []);


  const fetchAchievements = async (email: string|null) => {
    try {
      const response = await fetch(
        // `/api/achievements?professorEmail=${email}&blacklist=userImage,certificateProof`,
        `/api/achievements?blacklist=userImage,certificateProof`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch achievements: ${response.statusText}`);
      }

      const data = await response.json();
      return data.achievements.map((achievement: any) => ({
        ...achievement,
        approved: achievement.approved ? new Date(achievement.approved) : null,
        studentMail: achievement.studentMail || null,
      }));
    } catch (error) {
      console.error("Error fetching achievements:", error);
      throw error; // Re-throw the error to handle it in the caller
    }
  };

  const fetchStudentDetails = async (submissionId: string, name: string) => {
    const response = await fetch(
      `/api/achievements?whitelist=description,title,userImage,certificateProof&_id=${submissionId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();
    if (!data.achievements[0].userImage) {
      throw new Error("User image not found");
    }
    return data.achievements[0];
  };

  const updateAchievement = async (
    submissionId: string,
    approved: Date | null,
    description: string,
    title: string,
    student: any,
    silent: boolean
  ) => {
    const response = await fetch("/api/achievements", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ _id: submissionId, approved, description, title }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to update achievement");
    }
    if (
      !silent &&
      student.studentMail &&
      data &&
      data.message &&
      data.message === "Achievement updated successfully"
    ) {
      //SEND MAIL TO USER
      const APPROVED = approved && approved.getFullYear() !== 2000;
      const response = await fetch("/api/sendMail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: student.studentMail,
          subject: "Achievement Status",
          html: `
            <p>Dear ${student.fullName},</p>
            <p>Your achievement ${
              APPROVED ? `titled <strong>${title}</strong>` : ""
            } has been ${APPROVED ? "approved" : "rejected"}.</p>
            ${
              APPROVED
                ? `<p><strong>Description:</strong> ${description}</p>`
                : ""
            }
            <p>If you have any questions, feel free to contact your professor at 
            <a href="mailto:${student.professorEmail}">${
            student.professorEmail
          }</a>.</p>
            <p>Best regards,<br/>${student.professorName}</p>
          `,
        }),
      });
      return data;
    }
  };

  const [isLoaded, setIsLoaded] = useState(false);
  const [submissions, setSubmissions] = useState<Achievement[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [remarksModal, setRemarksModal] = useState({
    isOpen: false,
    submissionId: null as string | null,
    studentMail: null as string | null,
    studentName: "",
    studentPhone: "",
  });
  const [selectedStudent, setSelectedStudent] = useState<Achievement | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isStudentLoading, setIsStudentLoading] = useState(false);

  // Initialize state after component mounts to avoid hydration mismatch
  useEffect(() => {
    const loadAchievements = async () => {
      try {
        // if (!email) {
        //   throw new Error("Email query parameter is missing.");
        // }

        const achievements = await fetchAchievements(verifiedEmail);
        setSubmissions(achievements);
      } catch (error: any) {
        setError(error.message || "An error occurred while loading achievements.");
      } finally {
        setIsLoaded(true); // Ensure loading state is updated even if an error occurs
      }
    };

    loadAchievements();
  }, [verifiedEmail]);

  const handleStatusChange = async (
    submissionId: string,
    status: string,
    description: string,
    title: string
  ) => {
    let approved: Date | null;
    if (status === "approved") {
      approved = new Date();
    } else if (status === "rejected") {
      approved = new Date(2000, 0, 1);
    } else {
      approved = null;
    }

    try {
      await updateAchievement(
        submissionId,
        approved,
        description,
        title,
        selectedStudent,
        false
      );
      setSubmissions(
        submissions.map((sub) =>
          sub._id === submissionId
            ? { ...sub, approved: approved, description }
            : sub
        )
      );
    } catch (error: any) {
      setError(error.message);
    }

    // Close the modal after status change
    setSelectedStudent(null);
  };

  const handleOpenRemarks = (
    submissionId: string,
    studentMail: string | null,
    studentName: string,
    studentPhone: string
  ) => {
    setRemarksModal({
      isOpen: true,
      submissionId: submissionId,
      studentMail: studentMail,
      studentName: studentName,
      studentPhone: studentPhone,
    });
    // Optionally close the details modal
    setSelectedStudent(null);
  };

  const handleCloseRemarks = () => {
    setRemarksModal({
      isOpen: false,
      submissionId: null,
      studentMail: null,
      studentName: "",
      studentPhone: "",
    });
  };

  const handleStudentClick = async (
    submissionId: string,
    approved: string,
    description: string
  ) => {
    try {
      const student = submissions.find((sub) => sub._id === submissionId);
      if (!student) return;
      await updateAchievement(
        submissionId,
        approved === "approved" ? new Date() : new Date(2000, 0, 1),
        description,
        student.title,
        student,
        true
      );
      setSubmissions(
        submissions.map((sub) =>
          sub._id === submissionId
            ? {
                ...sub,
                approved:
                  approved === "approved" ? new Date() : new Date(2000, 0, 1),
              }
            : sub
        )
      );
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleSendRemark = async (submissionId: string, remark: string) => {
    const submission = submissions.find((sub) => sub._id === submissionId);
    if (!submission) return;
    try {
      // Simulate sending remark
      await new Promise((resolve) => setTimeout(resolve, 200));
      setSuccessMessage("Remark sent successfully!");
      setRemarksModal({
        isOpen: false,
        submissionId: null,
        studentMail: null,
        studentName: "",
        studentPhone: "",
      });
    } catch (error: any) {
      setError(error.message);
    }
  };

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch =
      sub.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      sub.achievementCategory === selectedCategory;
    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "pending" && sub.approved === null) ||
      (selectedStatus === "approved" && sub.approved?.getFullYear() !== 2000) ||
      (selectedStatus === "rejected" && sub.approved?.getFullYear() === 2000);
    const matchesDateRange =
      !dateRange?.from ||
      !dateRange?.to ||
      (new Date(sub.submissionDate) >= dateRange.from &&
        new Date(sub.submissionDate) <= dateRange.to);
    return (
      matchesSearch && matchesCategory && matchesStatus && matchesDateRange
    );
  });

  if (!isLoaded) {
    return (
      <div className="min-h-screen fancy-bg p-2 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-3 sm:p-6 shadow-lg mb-6">
            <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-8">
                <div className="relative scale-75">
                  <div className="absolute -inset-8 rounded-full border border-black/[0.02] animate-[spin_8s_linear_infinite]" />
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-black/[0.03] animate-[spin_4s_linear_infinite]" />
                    <div className="absolute inset-2 rounded-full border border-black/[0.05] animate-[spin_6s_linear_infinite_reverse]" />
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-black/20 animate-[spin_2s_cubic-bezier(0.4,0,0.2,1)_infinite]" />
                    <div className="absolute inset-4 rounded-full border-2 border-transparent border-t-black/20 animate-[spin_2.5s_cubic-bezier(0.4,0,0.2,1)_infinite_reverse]" />
                    <div className="absolute inset-6 rounded-full border border-black/[0.02] animate-[spin_3s_linear_infinite]" />
                    <div className="absolute inset-8 rounded-full border border-black/[0.02] animate-[spin_5s_linear_infinite_reverse]" />
                    <div className="relative w-1.5 h-1.5">
                      <div className="absolute inset-0 rounded-full bg-black/40 animate-ping" />
                      <div className="relative w-1.5 h-1.5 rounded-full bg-black/80" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <h3 className="text-black/80 text-xs font-light tracking-[0.25em] uppercase">
                    Loading Dashboard
                  </h3>
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1 h-1 rounded-full bg-black/40 animate-[pulse_2s_cubic-bezier(0.4,0,0.2,1)_infinite]"
                        style={{ animationDelay: `${i * 300}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen fancy-bg p-2 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/50 backdrop-blur-sm rounded-lg p-3 sm:p-6 shadow-lg mb-6"
        >
          <h1 className="text-2xl sm:text-3xl font-display mb-4 sm:mb-6">
            Professor Dashboard
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <div className="relative">
              <Input
                placeholder="Search by name or reg. number"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </div>

            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories
                  .filter((cat) => cat !== "Overall TOP 10")
                  .map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <DateRangePicker
              date={dateRange}
              onDateChange={setDateRange}
              placeholder="Filter by date range"
              className="w-full"
            />
          </div>

          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <motion.div layout className="min-w-[800px] sm:min-w-full">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submission Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/30 backdrop-blur-sm divide-y divide-gray-200">
                  <AnimatePresence>
                    {filteredSubmissions.map((submission) => (
                      <motion.tr
                        key={submission._id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-black/5 transition-colors cursor-pointer"
                        onClick={async () => {
                          setIsStudentLoading(true);
                          try {
                            const studentDetails = await fetchStudentDetails(
                              submission._id,
                              submission.fullName
                            );
                            setSelectedStudent({
                              ...submission,
                              ...studentDetails,
                            });
                          } catch (error) {
                            setError("Failed to load student details");
                          } finally {
                            setIsStudentLoading(false);
                          }
                        }}
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {submission.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {submission.registrationNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {submission.achievementCategory}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDistanceToNow(
                            new Date(submission.submissionDate),
                            { addSuffix: true }
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${
                              submission.approved !== null &&
                              submission.approved.getFullYear() !== 2000
                                ? "bg-green-100 text-green-800"
                                : submission.approved !== null &&
                                  submission.approved.getFullYear() === 2000
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {submission.approved !== null &&
                            submission.approved.getFullYear() !== 2000
                              ? "Approved"
                              : submission.approved !== null &&
                                submission.approved.getFullYear() === 2000
                              ? "Rejected"
                              : "Pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4 flex space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className={`hover:bg-green-100 hover:text-green-800 ${
                              submission.approved &&
                              submission.approved?.getFullYear() !== 2000
                                ? "text-green-800 bg-green-100"
                                : ""
                            }`}
                            // if submission.approved?.getFullYear() !== 2000, green
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStudentClick(
                                submission._id,
                                "approved",
                                ""
                              );
                            }}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className={`hover:bg-red-100 hover:text-red-800  ${
                              submission.approved &&
                              submission.approved?.getFullYear() === 2000
                                ? "bg-red-100 text-red-800"
                                : ""
                            }`}
                            // if submission.approved?.getFullYear() !== 2000, green
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStudentClick(
                                submission._id,
                                "rejected",
                                ""
                              );
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="hover:bg-blue-100 hover:text-blue-800"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRemarksModal({
                                isOpen: true,
                                submissionId: submission._id as string,
                                studentMail: submission.studentMail,
                                studentName: submission.fullName,
                                studentPhone: submission.mobileNumber,
                              });
                            }}
                          >
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {error && (
        <div className="fixed inset-0 flex items-center justify-center z-[101] p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-h-[90vh] overflow-y-auto w-full max-w-4xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-display">Error</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setError(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="fixed inset-0 flex items-center justify-center z-[101] p-4">
          <div className="bg-green-100 rounded-lg shadow-xl p-6 max-h-[90vh] overflow-y-auto w-full max-w-4xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-display text-green-800">Success</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSuccessMessage(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-green-800">{successMessage}</p>
          </div>
        </div>
      )}

      {isStudentLoading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-[280px] backdrop-blur-sm">
            <div className="flex flex-col items-center gap-8">
              {/* Loading animation container - scaled down */}
              <div className="relative scale-75">
                {/* Outer decorative ring with rotation */}
                <div className="absolute -inset-8 rounded-full border border-black/[0.02] animate-[spin_8s_linear_infinite]" />

                {/* Main spinner group */}
                <div className="relative w-24 h-24 flex items-center justify-center">
                  {/* Background rings with animations */}
                  <div className="absolute inset-0 rounded-full border-2 border-black/[0.03] animate-[spin_4s_linear_infinite]" />
                  <div className="absolute inset-2 rounded-full border border-black/[0.05] animate-[spin_6s_linear_infinite_reverse]" />

                  {/* Spinning elements */}
                  <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-black/20 animate-[spin_2s_cubic-bezier(0.4,0,0.2,1)_infinite]" />
                  <div className="absolute inset-4 rounded-full border-2 border-transparent border-t-black/20 animate-[spin_2.5s_cubic-bezier(0.4,0,0.2,1)_infinite_reverse]" />

                  {/* Additional rotating rings */}
                  <div className="absolute inset-6 rounded-full border border-black/[0.02] animate-[spin_3s_linear_infinite]" />
                  <div className="absolute inset-8 rounded-full border border-black/[0.02] animate-[spin_5s_linear_infinite_reverse]" />

                  {/* Center dot with pulse */}
                  <div className="relative w-1.5 h-1.5">
                    <div className="absolute inset-0 rounded-full bg-black/40 animate-ping" />
                    <div className="relative w-1.5 h-1.5 rounded-full bg-black/80" />
                  </div>
                </div>
              </div>

              {/* Text container */}
              <div className="flex flex-col items-center gap-2">
                <h3 className="text-black/80 text-xs font-light tracking-[0.25em] uppercase">
                  Loading
                </h3>

                {/* Subtle animated dots */}
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1 h-1 rounded-full bg-black/40 animate-[pulse_2s_cubic-bezier(0.4,0,0.2,1)_infinite]"
                      style={{ animationDelay: `${i * 300}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedStudent && <StudentDetailsModal
        isOpen={selectedStudent !== null}
        onClose={() => setSelectedStudent(null)}
        student={selectedStudent}
        onStatusChange={handleStatusChange}
        onOpenRemarks={handleOpenRemarks}
      />}

      <RemarksModal
        isOpen={remarksModal.isOpen}
        onClose={handleCloseRemarks}
        submissionId={remarksModal.submissionId}
        studentMail={remarksModal.studentMail}
        studentName={remarksModal.studentName}
        studentPhone={remarksModal.studentPhone}
        onSendRemark={handleSendRemark}
      />
    </div>
  );
}
function setSelectedStudent(arg0: null): void {
  throw new Error("Function not implemented.");
}
