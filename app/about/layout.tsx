import type { ReactNode } from "react";
import AuthenticatedLearningLayout from "../AuthenticatedLearningLayout";

export default function AboutLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <AuthenticatedLearningLayout>{children}</AuthenticatedLearningLayout>;
}
