import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Temperature & Heat",
  description:
    "Explore temperature, thermal expansion, heat transfer, and specific heat capacity in Calph++ physics lessons.",
};

export default function TemperatureHeatLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return children;
}
