import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Electricity",
  description:
    "Study electric forces, charge, Coulomb's law, and electric fields with Calph++ physics lessons and quizzes.",
};

export default function ElectricityLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return children;
}
