"use client";

import { AlertCircle, CheckCircle2, LoaderCircle, LockKeyhole } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export type LessonQuizEligibilityState = {
  eligible: boolean;
  completed: boolean;
  prerequisiteTitle: string | null;
  allCompleted: boolean;
  saved: boolean;
};

async function fetchLessonQuizEligibility(
  lessonSlug: string
): Promise<LessonQuizEligibilityState> {
  const response = await fetch(
    `/api/lesson-quiz-eligibility?lessonSlug=${encodeURIComponent(lessonSlug)}`,
    { credentials: "same-origin", cache: "no-store" }
  );
  const result: unknown = await response.json();
  if (!response.ok || !result || typeof result !== "object") {
    const message =
      result &&
      typeof result === "object" &&
      "error" in result &&
      typeof result.error === "string"
        ? result.error
        : "Unable to verify quiz eligibility.";
    throw new Error(message);
  }

  const data = result as LessonQuizEligibilityState;
  if (
    typeof data.eligible !== "boolean" ||
    typeof data.completed !== "boolean" ||
    typeof data.allCompleted !== "boolean" ||
    typeof data.saved !== "boolean" ||
    (data.prerequisiteTitle !== null &&
      typeof data.prerequisiteTitle !== "string")
  ) {
    throw new Error("The quiz eligibility response was invalid.");
  }
  return data;
}

export function useLessonQuizEligibility(lessonSlug: string) {
  const [eligibility, setEligibility] =
    useState<LessonQuizEligibilityState | null>(null);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const data = await fetchLessonQuizEligibility(lessonSlug);
      setError("");
      setEligibility(data);
    } catch (requestError) {
      setEligibility(null);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to verify quiz eligibility."
      );
    }
  }, [lessonSlug]);

  useEffect(() => {
    let active = true;
    fetchLessonQuizEligibility(lessonSlug)
      .then((data) => {
        if (active) {
          setError("");
          setEligibility(data);
        }
      })
      .catch((requestError: unknown) => {
        if (active) {
          setEligibility(null);
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to verify quiz eligibility."
          );
        }
      });
    return () => {
      active = false;
    };
  }, [lessonSlug]);

  return { eligibility, error, refresh };
}

export function LessonQuizEligibilityNotice({
  eligibility,
  error,
  onRetry,
}: {
  eligibility: LessonQuizEligibilityState | null;
  error: string;
  onRetry: () => void;
}) {
  if (!eligibility && !error) {
    return (
      <p className="mb-5 flex items-center gap-2 rounded-xl border border-sky-300/15 bg-sky-400/5 p-4 text-sm text-slate-300">
        <LoaderCircle size={16} className="animate-spin text-sky-300" />
        Checking official quiz eligibility…
      </p>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="mb-5 rounded-xl border border-amber-300/20 bg-amber-400/5 p-4 text-sm text-slate-300"
      >
        <p className="flex items-start gap-2">
          <AlertCircle size={17} className="mt-0.5 shrink-0 text-amber-300" />
          <span>
            {error} Official submission is disabled until eligibility can be
            verified; your lesson and practice questions remain available.
          </span>
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-lg border border-white/10 px-3 py-2 font-semibold text-slate-200 transition hover:bg-white/5"
        >
          Check again
        </button>
      </div>
    );
  }

  if (eligibility?.eligible) {
    return eligibility.completed ? (
      <p className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-300/15 bg-emerald-400/5 p-4 text-sm text-emerald-200">
        <CheckCircle2 size={17} />
        This lesson is officially complete. You may retry the quiz for more
        practice.
      </p>
    ) : null;
  }

  return (
    <p
      role="status"
      className="mb-5 flex items-start gap-2 rounded-xl border border-amber-300/20 bg-amber-400/5 p-4 text-sm leading-6 text-amber-100"
    >
      <LockKeyhole size={17} className="mt-1 shrink-0 text-amber-300" />
      <span>
        You&apos;re free to study this lesson and practice these questions. To
        officially submit the quiz and save a score, complete and pass{" "}
        <strong>{eligibility?.prerequisiteTitle ?? "the previous lesson"}</strong>{" "}
        first.
      </span>
    </p>
  );
}
