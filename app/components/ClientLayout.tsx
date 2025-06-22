"use client";
import CloseOnLogout from "@/app/components/CloseOnLogout"; 

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {/* <CloseOnLogout /> ✅ This will listen for WebSocket logout */}
            {children}
        </>
    );
}
