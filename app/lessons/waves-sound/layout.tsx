import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Waves & Sound",
  description:
    "Learn wave motion, frequency, wavelength, sound, and wave relationships with Calph++ interactive physics lessons.",
};

export default function WavesSoundLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return children;
}
