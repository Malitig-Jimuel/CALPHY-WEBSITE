"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

type LessonLink = {
  href: string;
  label: string;
};

export default function LessonNavigation({
  previous,
  next,
  lessonSlug,
  finalLesson = false,
}: {
  previous?: LessonLink;
  next?: LessonLink;
  lessonSlug: string;
  finalLesson?: boolean;
}) {
  const [allCompleted, setAllCompleted] = useState(false);
  const [progressError, setProgressError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCourseProgress() {
      try {
        const response = await fetch(
          `/api/lesson-quiz-eligibility?lessonSlug=${encodeURIComponent(lessonSlug)}`,
          { credentials: "same-origin", cache: "no-store" }
        );
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Could not load lesson completion.");
        }
        if (typeof result.allCompleted !== "boolean") {
          throw new Error("Course completion could not be confirmed.");
        }

        if (active) setAllCompleted(result.allCompleted);
      } catch (error) {
        if (active) {
          const message =
            error instanceof Error
              ? error.message
              : "Could not load lesson completion.";
          setProgressError(message);
          console.error("Failed to load course completion for navigation:", error);
        }
      }
    }

    void loadCourseProgress();
    const handlePassedQuiz = (event: Event) => {
      const detail = (event as CustomEvent<{ passed?: boolean }>).detail;
      if (detail?.passed) void loadCourseProgress();
    };
    window.addEventListener("calph-official-lesson-passed", handlePassedQuiz);
    return () => {
      active = false;
      window.removeEventListener("calph-official-lesson-passed", handlePassedQuiz);
    };
  }, [lessonSlug]);

  return (
    <footer className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm">
      <div className="min-w-0">
        {previous ? (
          <Link
            href={previous.href}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sky-300 transition hover:bg-white/5 hover:text-sky-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Previous: {previous.label}</span>
          </Link>
        ) : (
          <span className="inline-flex min-h-11 items-center px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Lesson 1 of 6
          </span>
        )}
      </div>

      <div className="ml-auto flex min-w-0 flex-col items-end gap-2">
        {finalLesson ? (
          allCompleted ? (
            <div className="flex flex-col items-end gap-3 text-right sm:flex-row sm:items-center">
              <p
                role="status"
                className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-300"
              >
                <CheckCircle2 size={18} aria-hidden="true" />
                Congratulations! You&apos;ve completed all six physics lessons.
              </p>
              <Link
                href="/home"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-2.5 font-bold text-slate-950 transition hover:bg-emerald-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
              >
                Return to Home
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <p className="inline-flex min-h-11 items-center gap-2 px-3 text-right text-sm text-slate-400">
              {progressError || "Pass the quiz to complete all six lessons."}
            </p>
          )
        ) : next ? (
          <Link
            href={next.href}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-sky-400 px-5 py-2.5 font-bold text-slate-950 transition hover:bg-sky-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
          >
            Next: {next.label}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        ) : null}
      </div>
    </footer>
  );
}
