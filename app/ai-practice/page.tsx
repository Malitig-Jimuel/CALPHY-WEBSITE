import type { Metadata } from "next";
import AIPracticeClient from "./practice-client";

export const metadata: Metadata = {
  title: "AI Physics Practice",
  description:
    "Generate and solve custom physics practice problems across all six Calph++ lessons.",
};

export default function AIPracticePage() {
  return <AIPracticeClient />;
}
