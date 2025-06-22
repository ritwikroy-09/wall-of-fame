import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";

interface RemarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissionId: string | null;
  studentMail: string | null;
  studentName: string;
  studentPhone: string;
  onSendRemark: (submissionId: string, remark: string) => void;
}

export function RemarksModal({
  isOpen,
  onClose,
  submissionId,
  studentMail,
  studentName,
  studentPhone,
  onSendRemark,
}: RemarksModalProps) {
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (submissionId !== null) {
      if (!studentMail) {
        setError(`Student email not found. Please contact ${studentName} at ${studentPhone}`);
        return;
      }

      try {
        const response = await fetch('/api/sendMail', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: studentMail,
            subject: 'New Remark regarding your Wall Of Fame Submission',
            html: `
              <p>Dear ${studentName},</p>
              <p>You have received a new remark regarding your achievement submission:</p>
              <p><strong>Remarks:</strong> ${remarks}</p>
              <p>If you have any questions, feel free to contact your professor at <a href="mailto:ritwikroy0907@gmail.com">ritwikroy0907@gmail.com</a>.</p>
              <p>Best regards,</p>
            `,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to send email');
        }

        onSendRemark(submissionId, remarks);
        handleClose();
      } catch (error : any) {
        console.error('Error sending remark:', error);
        setError(error.message || 'Failed to send email');
      }
    }
  };

  const handleClose = () => {
    setRemarks("");
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
            className="fixed inset-0 bg-black/50 z-[100]"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 flex items-center justify-center z-[101] p-4"
          >
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-display">Add Remarks</h2>
                <Button variant="ghost" size="icon" onClick={handleClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                <Textarea
                  placeholder="Enter your remarks here..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="min-h-[150px]"
                />

                {error && <p className="text-red-500">{error}</p>}

                <div className="flex justify-end gap-2">
                  <Button variant="outline" type="button" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleSend}>
                    Send Remark
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
