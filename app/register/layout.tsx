import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create a Calph++ account to save your physics quiz results and lesson progress.",
};

export default function RegisterLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return children;
}
