import { Suspense } from "react";
import HomeContent, { HomeContentFallback } from "./HomeContent";

export default function HomePage() {
  return (
    <Suspense fallback={<HomeContentFallback />}>
      <HomeContent />
    </Suspense>
  );
}
