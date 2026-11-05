import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Fluids",
  description:
    "Learn fluid pressure, buoyancy, flow, Bernoulli's principle, and related physics through interactive lessons and quizzes.",
};

export default function FluidsLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return children;
}
