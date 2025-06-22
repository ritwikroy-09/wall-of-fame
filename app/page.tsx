"use client";

import { Suspense } from "react";
import InteractiveHome from "./components/InteractiveHome";
import HomePage from "./components/HomePage";

export default function Home() {
  return (
    <Suspense fallback={<InteractiveHome isReturning={false} />}>
      <HomePage />
    </Suspense>
  );
}
