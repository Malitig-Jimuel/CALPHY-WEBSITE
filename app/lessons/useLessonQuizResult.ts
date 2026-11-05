"use client";

import { useState } from "react";

type SaveState = "idle" | "saving" | "saved" | "guest" | "error";
export type LessonQuizQuestionSnapshot = {
  question: string;
  choices: string[];
  explanation: string;
  questionIndex: number;
  optionOrder: number[];
};

export function useLessonQuizResult() {
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveMessage, setSaveMessage] = useState("");
  const [passed, setPassed] = useState<boolean | null>(null);

  async function saveResult(
    lessonSlug: string,
    answers: number[],
    questions: LessonQuizQuestionSnapshot[]
  ) {
    setSaveState("saving");
    setSaveMessage("");

    try {
      const response = await fetch("/api/lesson-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ lessonSlug, answers, questions }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not save your quiz result.");
      }

      if (
        typeof result.passed !== "boolean" ||
        typeof result.saved !== "boolean"
      ) {
        throw new Error("The quiz result could not be confirmed.");
      }

      setPassed(result.passed);
      setSaveState(result.saved ? "saved" : "guest");
      if (result.saved) {
        window.dispatchEvent(
          new CustomEvent("calph-learning-progress-updated", {
            detail: {
              lessonSlug,
              completed:
                typeof result.moduleCompleted === "boolean"
                  ? result.moduleCompleted
                  : result.passed,
            },
          })
        );
      }
      setSaveMessage(result.saved
        ? result.passed
          ? "Your result was saved and this module is complete."
          : "Your result was saved. Score at least 60% to complete this module."
        : "Your score is shown for this session only. Register or log in to save quiz results and track progress.");
    } catch (error) {
      setSaveState("error");
      setSaveMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving your result."
      );
    }
  }

  function resetResult() {
    setSaveState("idle");
    setSaveMessage("");
    setPassed(null);
  }

  return { saveState, saveMessage, passed, saveResult, resetResult };
}
