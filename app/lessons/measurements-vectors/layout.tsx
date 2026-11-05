import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Measurements & Vectors",
  description:
    "Study measurement, units, significant figures, vectors, and motion with interactive physics lessons and quizzes.",
};

export default function MeasurementsVectorsLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return children;
}
