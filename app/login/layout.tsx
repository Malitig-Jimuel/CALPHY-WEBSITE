import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to Calph++ to continue your physics lessons and track your progress.",
};

export default function LoginLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return children;
}
