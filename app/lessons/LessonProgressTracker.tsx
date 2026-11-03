"use client";

import { useEffect } from "react";

export default function LessonProgressTracker({
  lessonSlug,
}: {
  lessonSlug: string;
}) {
  useEffect(() => {
    let active = true;

    async function recordVisit() {
      try {
        const sessionResponse = await fetch("/api/auth/session", {
          credentials: "same-origin",
          cache: "no-store",
        });

        if (!sessionResponse.ok) {
          throw new Error("Unable to check the current session.");
        }

        const session = await sessionResponse.json();
        if (!active || !session?.user) return;

        const response = await fetch("/api/lesson-progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ lessonSlug, completed: false }),
        });

        if (!response.ok && response.status !== 401) {
          const result = await response.json();
          throw new Error(result.error || "Could not update lesson activity.");
        }
      } catch (error) {
        if (active) {
          console.error("Failed to record lesson visit:", error);
        }
      }
    }

    void recordVisit();
    return () => {
      active = false;
    };
  }, [lessonSlug]);

  return null;
}
