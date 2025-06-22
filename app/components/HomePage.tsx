"use client";

import { useSearchParams } from "next/navigation";
import InteractiveHome from "./InteractiveHome";

export default function HomePage() {
  const searchParams = useSearchParams();
  const isReturning = searchParams.get("return") === "true";

  return <InteractiveHome isReturning={isReturning} />;
}
