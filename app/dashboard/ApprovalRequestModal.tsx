import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Send } from "lucide-react";

interface ApprovalRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissionId: string | null;
  studentName: string;
  achievementTitle: string;
  onSendRequest: (professorEmail: string, message: string) => Promise<void>;
}

export function ApprovalRequestModal({
  isOpen,
  onClose,
  submissionId,
  studentName,
  achievementTitle,
  onSendRequest,
}: ApprovalRequestModalProps) {
  const [professorEmail, setProfessorEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendRequest = async () => {
    if (!professorEmail) {
      setError("Professor email is required");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(professorEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSendRequest(professorEmail, message);
      handleClose();
    } catch (error: any) {
      setError(error.message || "Failed to send approval request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setProfessorEmail("");
    setMessage("");
    setError(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[101] h-screen"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 flex items-center justify-center z-[102] p-4"
          >
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-display">Request Approval</h2>
                <Button variant="ghost" size="icon" onClick={handleClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Professor Email
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter professor's email address"
                    value={professorEmail}
                    onChange={(e) => setProfessorEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Achievement Details
                  </label>
                  <div className="bg-gray-50 p-3 rounded-md text-sm">
                    <p>
                      <span className="font-medium">Student:</span>{" "}
                      {studentName}
                    </p>
                    <p>
                      <span className="font-medium">Achievement:</span>{" "}
                      {achievementTitle || "Untitled Achievement"}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message (Optional)
                  </label>
                  <Textarea
                    placeholder="Add a message for the professor..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="flex justify-end gap-2">
                  <Button variant="outline" type="button" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSendRequest}
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                        Sending...
                      </div>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Request
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
