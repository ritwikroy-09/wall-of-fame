"use client";

import { Suspense } from "react";
import DashboardClient from "./DashboardClient";

export default function DashboardPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <DashboardClient />
    </Suspense>
  );
}

// Simple loading component
function LoadingState() {
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
