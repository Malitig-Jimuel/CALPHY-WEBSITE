import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Optics",
  description:
    "Explore reflection, mirrors, image formation, and optics equations with interactive lessons and examples.",
};

export default function OpticsLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return children;
}
