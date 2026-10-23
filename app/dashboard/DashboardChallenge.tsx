
"use client";

import { useState } from "react";
import {
  CheckCircle2,
  RotateCcw,
  Save,
  XCircle,
} from "lucide-react";

const questions = [
  {
    question: "What is the SI unit of force?",
    options: ["Joule", "Newton", "Watt", "Pascal"],
    answer: 1,
    explanation:
      "Force is measured in newtons (N). One newton accelerates a 1 kg mass at 1 m/s².",
  },
  {
    question:
      "What happens to an object's acceleration if the net force increases while its mass stays constant?",
    options: [
      "Acceleration decreases",
      "Acceleration stays zero",
      "Acceleration increases",
      "Mass increases automatically",
    ],
    answer: 2,
    explanation:
      "Newton's second law is F = ma. With constant mass, a larger net force produces a larger acceleration.",
  },
  {
    question: "Which quantity is measured in hertz (Hz)?",
    options: ["Wavelength", "Frequency", "Force", "Temperature"],
    answer: 1,
    explanation:
      "Hertz measures frequency, or the number of cycles that occur per second.",
  },
  {
    question:
      "What type of mirror can produce an upright, virtual image that is smaller than the object?",
    options: [
      "Concave mirror in every situation",
      "Plane mirror",
      "Convex mirror",
      "None of these",
    ],
    answer: 2,
    explanation:
      "A convex mirror produces an upright, virtual, reduced image for a real object placed in front of it.",
  },
  {
    question: "What is the SI unit of temperature?",
    options: ["Celsius", "Kelvin", "Fahrenheit", "Joule"],
    answer: 1,
    explanation:
      "The kelvin (K) is the SI base unit of thermodynamic temperature.",
  },
];

type SaveState = "idle" | "saving" | "saved" | "error";

export default function DashboardChallenge() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveMessage, setSaveMessage] = useState("");
  const [attemptId, setAttemptId] = useState<string | null>(null);

  const currentQuestion = questions[questionIndex];
  const isCorrect = selectedAnswer === currentQuestion.answer;

  function chooseAnswer(index: number) {
    if (selectedAnswer !== null || finished) return;

    setSelectedAnswer(index);
    setAnswers((previous) => [...previous, index]);

    if (index === currentQuestion.answer) {
      setScore((previous) => previous + 1);
    }
  }

  async function saveResult(finalAnswers: number[]) {
    setSaveState("saving");
    setSaveMessage("");
    setAttemptId(null);

    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          quizSlug: "dashboard-physics",
          answers: finalAnswers.map((selectedAnswer) => ({
            selectedAnswer,
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not save your quiz result.");
      }

      setSaveState("saved");
      setSaveMessage("Your result has been saved to your account.");
      setAttemptId(result.attempt.id);
    } catch (error) {
      setSaveState("error");
      setSaveMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving your result."
      );
    }
  }

  async function nextQuestion() {
    if (selectedAnswer === null) return;

    if (questionIndex === questions.length - 1) {
      setFinished(true);
      await saveResult(answers);
      return;
    }

    setQuestionIndex((previous) => previous + 1);
    setSelectedAnswer(null);
  }

  function restartQuiz() {
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setScore(0);
    setFinished(false);
    setSaveState("idle");
    setSaveMessage("");
    setAttemptId(null);
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#10182B] p-5 sm:p-8">
      {finished ? (
        <div className="py-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-400/10 text-sky-300">
            <CheckCircle2 size={32} />
          </div>

          <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-sky-400">
            Challenge complete
          </p>

          <h3 className="mt-3 text-3xl font-black">
            You scored {score} / {questions.length}
          </h3>

          <p className="mt-2 text-lg font-bold text-sky-300">
            {Math.round((score / questions.length) * 100)}%
          </p>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">
            {score === questions.length
              ? "Excellent work! You answered every question correctly."
              : score >= 3
                ? "Good job! Review the explanations and keep improving."
                : "Keep practicing! Review the explanations and try again."}
          </p>

          <div
            className={`mx-auto mt-6 max-w-lg rounded-xl border p-4 text-left ${
              saveState === "saved"
                ? "border-emerald-400/20 bg-emerald-400/5"
                : saveState === "error"
                  ? "border-red-400/20 bg-red-400/5"
                  : "border-white/10 bg-white/[0.02]"
            }`}
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              {saveState === "saved" ? (
                <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-400" />
              ) : saveState === "error" ? (
                <XCircle className="mt-0.5 shrink-0 text-red-400" />
              ) : (
                <Save className="mt-0.5 shrink-0 text-sky-400" />
              )}

              <div>
                <p className="font-semibold">
                  {saveState === "saving"
                    ? "Saving your result..."
                    : saveState === "saved"
                      ? "Result saved"
                      : saveState === "error"
                        ? "Could not save result"
                        : "Quiz result"}
                </p>

                {saveMessage && (
                  <p className="mt-1 break-words text-sm leading-6 text-slate-400">
                    {saveMessage}
                  </p>
                )}

                {attemptId && (
                  <p className="mt-2 break-all text-xs text-slate-500">
                    Attempt ID: {attemptId}
                  </p>
                )}
              </div>
            </div>

            {saveState === "error" && (
              <button
                onClick={() => saveResult(answers)}
                className="mt-4 rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/5"
              >
                Retry saving
              </button>
            )}
          </div>

          <button
            onClick={restartQuiz}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-sky-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-sky-300"
          >
            <RotateCcw size={17} />
            Try again
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="rounded-full bg-violet-400/10 px-3 py-1.5 text-xs font-semibold text-violet-300">
              Question {questionIndex + 1} of {questions.length}
            </span>

            <span className="text-sm text-slate-400">
              Score: <strong className="text-white">{score}</strong>
            </span>
          </div>

          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-violet-400 transition-all duration-300"
              style={{
                width: `${((questionIndex + 1) / questions.length) * 100}%`,
              }}
            />
          </div>

          <h3 className="mt-7 text-xl font-bold leading-relaxed sm:text-2xl">
            {currentQuestion.question}
          </h3>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isAnswer = currentQuestion.answer === index;

              let optionStyle =
                "border-white/10 bg-white/[0.02] hover:border-sky-400/40 hover:bg-white/[0.04]";

              if (selectedAnswer !== null && isAnswer) {
                optionStyle =
                  "border-emerald-400/50 bg-emerald-400/10 text-emerald-200";
              } else if (isSelected && !isAnswer) {
                optionStyle =
                  "border-red-400/50 bg-red-400/10 text-red-200";
              }

              return (
                <button
                  key={option}
                  onClick={() => chooseAnswer(index)}
                  disabled={selectedAnswer !== null}
                  className={`flex min-h-14 items-center justify-between gap-3 rounded-xl border p-4 text-left text-sm font-medium transition disabled:cursor-default ${optionStyle}`}
                >
                  <span>
                    <span className="mr-3 text-xs text-slate-500">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    {option}
                  </span>

                  {selectedAnswer !== null && isAnswer && (
                    <CheckCircle2
                      size={19}
                      className="shrink-0 text-emerald-400"
                    />
                  )}

                  {isSelected && !isAnswer && (
                    <XCircle size={19} className="shrink-0 text-red-400" />
                  )}
                </button>
              );
            })}
          </div>

          {selectedAnswer !== null && (
            <div
              className={`mt-5 rounded-xl border p-4 ${
                isCorrect
                  ? "border-emerald-400/20 bg-emerald-400/5"
                  : "border-amber-400/20 bg-amber-400/5"
              }`}
              aria-live="polite"
            >
              <p
                className={`font-bold ${
                  isCorrect ? "text-emerald-300" : "text-amber-300"
                }`}
              >
                {isCorrect ? "Correct answer!" : "Not quite — keep learning!"}
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                {currentQuestion.explanation}
              </p>

              <button
                onClick={nextQuestion}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-sky-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-sky-300"
              >
                {questionIndex === questions.length - 1
                  ? "Finish and save results"
                  : "Next question"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
