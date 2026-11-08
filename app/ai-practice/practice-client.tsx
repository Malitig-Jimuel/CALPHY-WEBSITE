"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  AlertCircle,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
  LoaderCircle,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import {
  practiceDifficulties,
  practiceLessons,
  practiceProblemTypes,
  type PracticeDifficulty,
  type PracticeLessonSlug,
  type PracticeProblemType,
} from "@/lib/aiPractice";

type PublicProblem = {
  token: string;
  generationSource: "local" | "groq";
  usage?: DailyUsage;
  title: string;
  topic: string;
  difficulty: PracticeDifficulty;
  problemType: PracticeProblemType;
  question: string;
  givenValues: string[];
  find: string;
  formulaHint: string;
  choices: string[];
  hint: string;
};

type Solution = {
  answer: string;
  steps: { label: string; detail: string }[];
  conceptExplanation: string;
};

type DailyUsage = {
  authenticated: boolean;
  timeZone: string;
  dailyAiAllowance: number;
  aiQuestionsUsed: number;
  aiQuestionsRemaining: number;
  localQuestionsUsed: number;
  totalQuestionsGenerated: number;
};

class PracticeRequestError extends Error {
  usage?: DailyUsage;
}

const fieldClass =
  "mt-2 min-h-12 w-full rounded-xl border border-white/10 bg-[#080D1B] px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-300/50 focus:ring-2 focus:ring-sky-300/15";
const primaryButtonClass =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-sky-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-sky-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 disabled:cursor-not-allowed disabled:opacity-50";
const secondaryButtonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.07] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 disabled:cursor-not-allowed disabled:opacity-50";

async function postPracticeRequest<T>(body: Record<string, unknown>): Promise<T> {
  const response = await fetch("/api/ai-practice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "error" in payload &&
      typeof payload.error === "string"
        ? payload.error
        : "The practice request could not be completed. Please try again.";
    const suggestions =
      payload && typeof payload === "object" && "suggestions" in payload &&
      Array.isArray(payload.suggestions)
        ? payload.suggestions.filter((item): item is string => typeof item === "string")
        : [];
    const requestError = new PracticeRequestError(
      suggestions.length ? `${message} Try: ${suggestions.join(", ")}.` : message
    );
    if (
      payload && typeof payload === "object" && "usage" in payload &&
      payload.usage && typeof payload.usage === "object" &&
      "authenticated" in payload.usage &&
      typeof payload.usage.authenticated === "boolean"
    ) {
      requestError.usage = payload.usage as DailyUsage;
    }
    throw requestError;
  }
  return payload as T;
}

export default function AIPracticeClient() {
  const [lessonSlug, setLessonSlug] =
    useState<PracticeLessonSlug>("measurements-vectors");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<PracticeDifficulty>("Medium");
  const [problemType, setProblemType] =
    useState<PracticeProblemType>("Numerical Problem Solving");
  const [problem, setProblem] = useState<PublicProblem | null>(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    message: string;
  } | null>(null);
  const [solution, setSolution] = useState<Solution | null>(null);
  const [solutionOpen, setSolutionOpen] = useState(false);
  const [loading, setLoading] = useState<"generate" | "check" | "solution" | null>(
    null
  );
  const [error, setError] = useState("");
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [usage, setUsage] = useState<DailyUsage | null>(null);
  const [usageError, setUsageError] = useState("");

  const selectedLesson = practiceLessons.find((item) => item.slug === lessonSlug)!;

  useEffect(() => {
    let active = true;
    postPracticeRequest<{ usage: DailyUsage }>({ action: "usage" })
      .then((result) => {
        if (active) {
          setUsage(result.usage);
          setUsageError("");
        }
      })
      .catch((requestError: unknown) => {
        if (active) {
          setUsageError(
            requestError instanceof Error
              ? requestError.message
              : "Daily usage could not be loaded."
          );
        }
      });
    return () => {
      active = false;
    };
  }, []);

  function clearProblem() {
    setProblem(null);
    setAnswer("");
    setSelectedChoice(null);
    setFeedback(null);
    setSolution(null);
    setSolutionOpen(false);
    setError("");
  }

  async function generateProblem(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const previousQuestion = problem?.question ?? "";
    setProblem(null);
    setLoading("generate");
    setError("");
    setFeedback(null);
    setSolution(null);
    setSolutionOpen(false);
    setAnswer("");
    setSelectedChoice(null);

    try {
      const generated = await postPracticeRequest<PublicProblem>({
        action: "generate",
        lessonSlug,
        topic,
        difficulty,
        problemType,
        previousQuestion,
        requestId: globalThis.crypto.randomUUID(),
      });
      setProblem(generated);
      if (generated.usage) setUsage(generated.usage);
    } catch (requestError) {
      if (requestError instanceof PracticeRequestError && requestError.usage) {
        setUsage(requestError.usage);
      }
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Problem generation failed. Please try again."
      );
    } finally {
      setLoading(null);
    }
  }

  async function checkAnswer() {
    if (!problem || (!answer.trim() && selectedChoice === null)) return;
    setLoading("check");
    setError("");
    try {
      const result = await postPracticeRequest<{
        correct: boolean;
        message: string;
      }>({
        action: "check",
        token: problem.token,
        answer: problem.choices.length ? undefined : answer.trim(),
        choiceIndex: problem.choices.length ? selectedChoice : undefined,
      });
      setFeedback(result);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Answer checking failed. Please try again."
      );
    } finally {
      setLoading(null);
    }
  }

  async function showSolution() {
    if (!problem) return;
    if (solution) {
      setSolutionOpen((open) => !open);
      return;
    }
    setLoading("solution");
    setError("");
    try {
      const result = await postPracticeRequest<Solution>({
        action: "solution",
        token: problem.token,
      });
      setSolution(result);
      setSolutionOpen(true);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "The solution could not be loaded. Please try again."
      );
    } finally {
      setLoading(null);
    }
  }

  return (
    <main className="min-h-0 flex-1 overflow-y-auto bg-[#080D1B] text-slate-100">
      <div className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        <header className="mb-7 rounded-3xl border border-white/10 bg-gradient-to-br from-[#14223A] via-[#111A2E] to-[#101426] p-6 sm:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/15 bg-sky-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-sky-200">
            <BrainCircuit size={15} aria-hidden="true" />
            Personalized practice
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
            AI Physics Practice
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
            Choose a lesson and topic for a fresh exercise. Numerical practice
            uses locally calculated and checked problems; conceptual and
            multiple-choice practice uses the AI tutor.
          </p>
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(17rem,0.78fr)_minmax(0,1.4fr)]">
          <section
            aria-labelledby="practice-settings-title"
            className="rounded-3xl border border-white/10 bg-[#111A2E] p-5 sm:p-6"
          >
            <div className="mb-5">
              <h2 id="practice-settings-title" className="text-lg font-bold">
                Practice settings
              </h2>
              <p className="mt-1 text-sm leading-5 text-slate-400">
                Focus the generated question on what you want to review.
              </p>
            </div>
            <section
              aria-labelledby="daily-practice-usage-title"
              className="mb-5 rounded-2xl border border-sky-300/10 bg-[#080D1B]/70 p-4"
            >
              <h3
                id="daily-practice-usage-title"
                className="text-sm font-bold text-slate-100"
              >
                Daily Practice Usage
              </h3>
              {usage?.authenticated ? (
                <>
                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    {usage.dailyAiAllowance} AI-assisted questions available daily
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-3 text-xs">
                    <span className="font-semibold text-slate-200">
                      {usage.aiQuestionsUsed} / {usage.dailyAiAllowance} AI questions used today
                    </span>
                    <span className="shrink-0 text-sky-200">
                      {usage.aiQuestionsRemaining} remaining
                    </span>
                  </div>
                  <div
                    className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"
                    role="progressbar"
                    aria-label="Daily AI-assisted question usage"
                    aria-valuemin={0}
                    aria-valuemax={usage.dailyAiAllowance}
                    aria-valuenow={Math.min(
                      usage.aiQuestionsUsed,
                      usage.dailyAiAllowance
                    )}
                  >
                    <div
                      className="h-full rounded-full bg-sky-300 transition-[width]"
                      style={{
                        width: `${Math.min(
                          100,
                          (usage.aiQuestionsUsed / usage.dailyAiAllowance) * 100
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    {usage.totalQuestionsGenerated} total questions generated
                    today, including {usage.localQuestionsUsed} local bonus
                    questions. Local numerical practice does not use this AI
                    allowance.
                  </p>
                </>
              ) : usage ? (
                <p className="mt-2 text-xs leading-5 text-slate-400">
                  Sign in to track your daily AI allowance. Locally generated
                  numerical questions remain available for practice.
                </p>
              ) : (
                <p
                  className="mt-2 text-xs leading-5 text-slate-500"
                  role={usageError ? "status" : undefined}
                >
                  {usageError || "Loading today's practice usage…"}
                </p>
              )}
            </section>
            <form onSubmit={(event) => void generateProblem(event)} className="space-y-4">
              <label className="block text-sm font-semibold text-slate-200">
                Lesson
                <span className="relative block">
                  <select
                    className={`${fieldClass} appearance-none pr-10`}
                    value={lessonSlug}
                    onChange={(event) => {
                      setLessonSlug(event.target.value as PracticeLessonSlug);
                      setTopic("");
                      clearProblem();
                    }}
                  >
                    {practiceLessons.map((lesson) => (
                      <option key={lesson.slug} value={lesson.slug}>
                        {lesson.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                </span>
              </label>

              <label className="block text-sm font-semibold text-slate-200">
                Topic or formula
                <span className="relative block">
                  <select
                    className={`${fieldClass} appearance-none pr-10`}
                    value={topic}
                    onChange={(event) => {
                      setTopic(event.target.value);
                      clearProblem();
                    }}
                    required
                  >
                    <option value="">Select a topic or formula</option>
                    {selectedLesson.topics.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                </span>
              </label>

              <label className="block text-sm font-semibold text-slate-200">
                Difficulty
                <select
                  className={fieldClass}
                  value={difficulty}
                  onChange={(event) =>
                    setDifficulty(event.target.value as PracticeDifficulty)
                  }
                >
                  {practiceDifficulties.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-semibold text-slate-200">
                Problem type
                <select
                  className={fieldClass}
                  value={problemType}
                  onChange={(event) =>
                    setProblemType(event.target.value as PracticeProblemType)
                  }
                >
                  {practiceProblemTypes.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>

              <button
                type="submit"
                disabled={loading !== null || !topic}
                className={`${primaryButtonClass} w-full`}
              >
                {loading === "generate" ? (
                  <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />
                ) : (
                  <Sparkles size={18} aria-hidden="true" />
                )}
                {loading === "generate" ? "Generating problem…" : "Generate Problem"}
              </button>
            </form>
            {problem && (
              <button
                type="button"
                onClick={() => void generateProblem()}
                disabled={loading !== null}
                className={`${secondaryButtonClass} mt-3 w-full`}
              >
                <RotateCcw size={16} aria-hidden="true" />
                Generate Another Problem
              </button>
            )}
            <p className="mt-4 text-xs leading-5 text-slate-500">
              Generated practice is a study aid. Review the stated assumptions,
              units, and calculations as you work.
            </p>
          </section>

          <section
            aria-label="Generated physics problem"
            aria-live="polite"
            className="min-w-0"
          >
            {error && (
              <div
                role="alert"
                className="mb-5 flex gap-3 rounded-2xl border border-rose-300/20 bg-rose-400/[0.08] p-4 text-sm leading-6 text-rose-100"
              >
                <AlertCircle size={18} className="mt-0.5 shrink-0 text-rose-300" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}
            {problem ? (
              <article className="rounded-3xl border border-white/10 bg-[#111A2E] p-5 sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-300">
                      {problem.topic}
                    </p>
                    <h2 className="mt-2 text-xl font-black leading-snug sm:text-2xl">
                      {problem.title}
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-semibold">
                    <span className="rounded-full border border-emerald-300/15 bg-emerald-400/[0.06] px-3 py-1.5 text-emerald-200">
                      {problem.generationSource === "local"
                        ? "Local verified"
                        : "AI tutor"}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-slate-300">
                      {problem.difficulty}
                    </span>
                    <span className="rounded-full border border-sky-300/15 bg-sky-400/10 px-3 py-1.5 text-sky-200">
                      {problem.problemType}
                    </span>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-white/[0.07] bg-[#080D1B]/70 p-4 sm:p-5">
                  <p className="whitespace-pre-line text-sm leading-7 text-slate-200 sm:text-base">
                    {problem.question}
                  </p>
                </div>

                {problem.givenValues.length > 0 && (
                  <div className="mt-5">
                    <h3 className="text-sm font-bold text-slate-200">Given values</h3>
                    <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                      {problem.givenValues.map((value, index) => (
                        <li
                          key={`${index}-${value}`}
                          className="rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2 text-sm leading-5 text-slate-300"
                        >
                          {value}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-4 rounded-xl border border-sky-300/10 bg-sky-400/[0.05] p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-sky-300">
                    Find
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-200">{problem.find}</p>
                </div>

                {problem.formulaHint && (
                  <details className="group mt-4 rounded-xl border border-white/[0.07] bg-white/[0.02]">
                    <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-slate-300 marker:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300">
                      <span className="inline-flex items-center gap-2">
                        Formula hint
                        <ChevronDown size={15} className="transition group-open:rotate-180" aria-hidden="true" />
                      </span>
                    </summary>
                    <p className="border-t border-white/[0.07] px-4 py-3 text-sm leading-6 text-slate-300">
                      {problem.formulaHint}
                    </p>
                  </details>
                )}

                <div className="mt-5">
                  <p className="text-sm font-bold text-slate-200">Your answer</p>
                  {problem.choices.length > 0 ? (
                    <div
                      role="radiogroup"
                      aria-label="Select an answer"
                      className="mt-3 grid gap-2 sm:grid-cols-2"
                    >
                        {problem.choices.map((choice, index) => (
                          <button
                            key={`${index}-${choice}`}
                            type="button"
                            role="radio"
                            aria-checked={selectedChoice === index}
                            onClick={() => {
                              setSelectedChoice(index);
                              setFeedback(null);
                            }}
                            className={`min-h-12 rounded-xl border px-4 py-3 text-left text-sm leading-5 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 ${
                              selectedChoice === index
                                ? "border-sky-300/60 bg-sky-400/10 text-sky-100"
                                : "border-white/10 bg-white/[0.02] text-slate-300 hover:bg-white/[0.05]"
                            }`}
                          >
                            <span className="mr-2 font-bold text-sky-300">
                              {String.fromCharCode(65 + index)}.
                            </span>
                            {choice}
                          </button>
                        ))}
                    </div>
                  ) : (
                    <label className="block">
                      <input
                        id="practice-answer"
                        aria-label="Your answer"
                        type="text"
                        value={answer}
                        onChange={(event) => {
                          setAnswer(event.target.value);
                          setFeedback(null);
                        }}
                        maxLength={160}
                        placeholder={
                          problem.problemType === "Conceptual Question"
                            ? "Write a short answer"
                            : "Enter a value and unit, e.g. 3.2 m/s"
                        }
                        className={fieldClass}
                      />
                    </label>
                  )}
                  <div className="mt-3 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => void checkAnswer()}
                      disabled={
                        loading !== null ||
                        (problem.choices.length > 0
                          ? selectedChoice === null
                          : !answer.trim())
                      }
                      className={primaryButtonClass}
                    >
                      {loading === "check" ? (
                        <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />
                      ) : (
                        <CheckCircle2 size={17} aria-hidden="true" />
                      )}
                      Check Answer
                    </button>
                    <button
                      type="button"
                      onClick={() => void showSolution()}
                      disabled={loading !== null}
                      className={secondaryButtonClass}
                    >
                      {loading === "solution" ? (
                        <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
                      ) : (
                        <ArrowRight size={16} aria-hidden="true" />
                      )}
                      {solutionOpen ? "Hide Solution" : "Show Solution"}
                    </button>
                    <button
                      type="button"
                      onClick={clearProblem}
                      disabled={loading !== null}
                      className={secondaryButtonClass}
                    >
                      <RotateCcw size={16} aria-hidden="true" />
                      Reset
                    </button>
                  </div>
                </div>

                {feedback && (
                  <div
                    role="status"
                    className={`mt-5 flex gap-3 rounded-2xl border p-4 text-sm leading-6 ${
                      feedback.correct
                        ? "border-emerald-300/20 bg-emerald-400/[0.07] text-emerald-100"
                        : "border-amber-300/20 bg-amber-400/[0.06] text-amber-100"
                    }`}
                  >
                    {feedback.correct ? (
                      <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-300" aria-hidden="true" />
                    ) : (
                      <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-300" aria-hidden="true" />
                    )}
                    <span>
                      <strong>{feedback.correct ? "Correct! " : "Not quite. "}</strong>
                      {feedback.message}
                      {!feedback.correct && (
                        <span className="mt-1 block text-amber-100/80">
                          Hint: {problem.hint}
                        </span>
                      )}
                    </span>
                  </div>
                )}

                {solutionOpen && solution && (
                  <section
                    aria-labelledby="solution-title"
                    className="mt-6 rounded-2xl border border-emerald-300/15 bg-emerald-400/[0.04] p-4 sm:p-5"
                  >
                    <h3 id="solution-title" className="text-base font-bold text-emerald-200">
                      Step-by-step solution
                    </h3>
                    <ol className="mt-4 space-y-4">
                      {solution.steps.map((step, index) => (
                        <li key={`${index}-${step.label}`} className="flex gap-3">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-300/10 text-xs font-bold text-emerald-200">
                            {index + 1}
                          </span>
                          <div>
                            <p className="text-sm font-bold text-slate-200">{step.label}</p>
                            <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-300">
                              {step.detail}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                    <div className="mt-5 rounded-xl border border-emerald-300/15 bg-[#080D1B]/70 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                        Final answer
                      </p>
                      <p className="mt-1 text-base font-bold text-emerald-100">
                        {solution.answer}
                      </p>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-slate-300">
                      {solution.conceptExplanation}
                    </p>
                  </section>
                )}
              </article>
            ) : (
              <div className="flex min-h-[22rem] flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-[#111A2E]/60 px-6 py-12 text-center">
                {loading === "generate" ? (
                  <LoaderCircle size={34} className="animate-spin text-sky-300" aria-hidden="true" />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-300/15 bg-sky-400/10 text-sky-300">
                    <Sparkles size={25} aria-hidden="true" />
                  </div>
                )}
                <h2 className="mt-5 text-lg font-bold">
                  {loading === "generate" ? "Building your exercise…" : "Your next practice problem"}
                </h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                  {loading === "generate"
                    ? "The tutor is preparing a lesson-focused question and checking its solution."
                    : "Choose a lesson, select a topic or formula, and generate a custom exercise. The answer stays hidden until you ask to see the solution."}
                </p>
                {loading !== "generate" && (
                  <p className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <ArrowRight size={14} aria-hidden="true" />
                    {selectedLesson.title}
                  </p>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
