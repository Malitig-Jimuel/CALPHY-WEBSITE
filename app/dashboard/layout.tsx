import type { Metadata } from "next";
import type { ReactNode } from "react";
import AuthenticatedLearningLayout from "../AuthenticatedLearningLayout";

export const metadata: Metadata = {
  title: "Learning Activity",
  description:
    "Review your physics lesson progress and saved quiz results on Calph++.",
};

export default function DashboardLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <AuthenticatedLearningLayout>{children}</AuthenticatedLearningLayout>;
}
