import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import SiteNavbar from "./SiteNavbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Calph++ | Interactive Physics Learning",
    template: "%s | Calph++",
  },
  description:
    "Learn physics through interactive lessons, visual simulations, worked examples, and quizzes on Calph++.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Suspense
          fallback={
            <div
              aria-hidden="true"
              className="h-0 shrink-0"
            />
          }
        >
          <SiteNavbar />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
