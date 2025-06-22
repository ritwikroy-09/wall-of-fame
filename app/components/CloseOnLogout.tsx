"use client";
import { useEffect } from "react";

export default function CloseOnLogout() {
    useEffect(() => {
        console.log("🔗 Connecting to WebSocket server...");
        const socket = new WebSocket("ws://localhost:8080");            
        // const socket = new WebSocket("wss://uncovered-well-minute.glitch.me");


        socket.onopen = () => {
            console.log("✅ Connected to WebSocket server");
        };

        socket.onmessage = (event) => {
            console.log("📩 WebSocket Message Received:", event.data);
            
            if (event.data === "logout") {
                console.log("🚀 Logout event received! Checking if this tab should close...");

                // Get the current URL
                const currentUrl = window.location.href;

                // ✅ Keep ONLY "http://localhost:3002" open
                if (currentUrl === "http://localhost:3002") {
                    console.log("🛑 This tab should stay open. Ignoring logout event.");
                    return;
                }

                // ✅ Close all other tabs (including "http://localhost:3002/*")
                setTimeout(() => {
                    console.log("🛑 Closing this tab...");
                    window.close();
                }, 200); // Delay for better debugging
            }
        };

        socket.onerror = (error) => {
            console.error("❌ WebSocket Error:", error);
        };

        socket.onclose = () => {
            console.log("🔴 Disconnected from WebSocket server");
        };

        return () => {
            socket.close();
        };
    }, []);

    return null;
}
