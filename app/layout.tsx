import "./globals.css";
import { Inter } from "next/font/google";
import ClientLayout from "@/app/components/ClientLayout"; 

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <ClientLayout> {/* ✅ Wrap everything in ClientLayout */}
                    {children}
                </ClientLayout>
            </body>
        </html>
    );
}
