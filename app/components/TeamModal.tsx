import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { TeamMember } from "../types/team";
import Image from "next/image";

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamMembers: TeamMember[];
}

export default function TeamModal({
  isOpen,
  onClose,
  teamMembers,
}: TeamModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className=" max-h-[90vh] w-[calc(100%-4rem)] max-w-4xl mx-auto overflow-y-auto bg-gradient-to-b from-white/95 to-white/90 backdrop-blur-md pt-6 md:p-8 rounded-lg border-0">
        <DialogTitle className="sr-only">Meet the SDC Team</DialogTitle>
        <div className="relative w-full ">
          <div className="absolute -top-10 md:-top-12 left-1/2 transform -translate-x-1/2 w-20 sm:w-24 h-20 sm:h-24">
            <Image
              src="/logo.png"
              alt="SDC Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h2 className="text-3xl sm:text-4xl font-display text-center mt-10 sm:mt-12 mb-2 text-black bg-clip-text">
            Meet the SDC Team
          </h2>
          <p className="text-center text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
            The awesome people behind Wall of Fame
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="relative group"
              >
                <div className="card-shine bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:shadow-xl">
                  <div className="relative w-full aspect-[3/4] bg-gray-100">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 25vw"
                      priority={true}
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-2 sm:p-3 bg-gradient-to-b from-transparent to-white/95">
                    <h3 className="text-base sm:text-lg font-handwriting text-center text-black bg-clip-text">
                      {member.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-center text-gray-600 mt-0.5">
                      {member.role}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
