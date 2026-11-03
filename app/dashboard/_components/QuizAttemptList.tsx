"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, BookOpen, Search } from "lucide-react";

export type QuizAttemptListItem = {
  id: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  createdAt: string;
};

export default function QuizAttemptList({
  attempts,
  showFilters = false,
  showAnswerCounts = false,
}: {
  attempts: QuizAttemptListItem[];
  showFilters?: boolean;
  showAnswerCounts?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [lesson, setLesson] = useState("all");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  const lessonOptions = useMemo(
    () => [...new Set(attempts.map((attempt) => attempt.quizId))],
    [attempts]
  );
  const visibleAttempts = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    const sorted = [...attempts].sort(
      (left, right) =>
        new Date(right.createdAt).getTime() -
        new Date(left.createdAt).getTime()
    );
    const attemptNumbers = new Map<string, number>();
    const totals = new Map<string, number>();
    for (const attempt of sorted) {
      totals.set(attempt.quizId, (totals.get(attempt.quizId) ?? 0) + 1);
    }
    const numbered = sorted.map((attempt) => {
      const number = (attemptNumbers.get(attempt.quizId) ?? 0) + 1;
      attemptNumbers.set(attempt.quizId, number);
      return {
        ...attempt,
        chronologicalNumber:
          (totals.get(attempt.quizId) ?? number) - number + 1,
      };
    });
    return numbered
      .filter((attempt) => lesson === "all" || attempt.quizId === lesson)
      .filter((attempt) => {
        if (!search) return true;
        const searchable =
          `${getAttemptTitle(attempt.quizId)} ${getAssociatedLessonTitle(attempt.quizId)}`.toLocaleLowerCase();
        return searchable.includes(search);
      })
      .sort((left, right) => {
        const order =
          new Date(left.createdAt).getTime() -
          new Date(right.createdAt).getTime();
        return sort === "newest" ? -order : order;
      });
  }, [attempts, lesson, query, sort]);

  if (attempts.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#10182B] px-6 py-12 text-center">
        <BookOpen className="mx-auto text-slate-500" size={36} />
        <h2 className="mt-4 text-lg font-bold">No quiz attempts yet</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
          You haven&apos;t taken any quizzes yet. Start learning and test your
          knowledge!
        </p>
        <Link
          href="/dashboard"
          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-sky-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-sky-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
        >
          Go to dashboard <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div>
      {showFilters && (
        <div className="mb-5 grid gap-3 rounded-2xl border border-white/10 bg-[#10182B] p-4 sm:grid-cols-3">
          <label className="relative block sm:col-span-1">
            <span className="sr-only">Search quiz or lesson</span>
            <Search
              aria-hidden="true"
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search quizzes"
              className="min-h-11 w-full rounded-xl border border-white/10 bg-[#080D1B] py-2 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-300 focus:outline-none"
            />
          </label>
          <label className="text-sm text-slate-400">
            <span className="sr-only">Filter by quiz</span>
            <select
              value={lesson}
              onChange={(event) => setLesson(event.target.value)}
              className="min-h-11 w-full rounded-xl border border-white/10 bg-[#080D1B] px-3 text-sm text-white focus:border-sky-300 focus:outline-none"
            >
              <option value="all">All quizzes</option>
              {lessonOptions.map((quizId) => (
                <option key={quizId} value={quizId}>
                  {quizId === "dashboard-physics"
                    ? "Quick Physics Challenge"
                    : quizId.replace(/[-_]/g, " ")}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-slate-400">
            <span className="sr-only">Sort attempts</span>
            <select
              value={sort}
              onChange={(event) =>
                setSort(event.target.value as "newest" | "oldest")
              }
              className="min-h-11 w-full rounded-xl border border-white/10 bg-[#080D1B] px-3 text-sm text-white focus:border-sky-300 focus:outline-none"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </label>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#10182B]">
        {visibleAttempts.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-slate-400">
            No attempts match those filters.
          </p>
        ) : (
          <div className="divide-y divide-white/10">
            {visibleAttempts.map((attempt) => {
              const percentage =
                attempt.totalQuestions > 0
                  ? Math.round((attempt.score / attempt.totalQuestions) * 100)
                  : 0;
              const title = getAttemptTitle(attempt.quizId);
              const href = `/dashboard/quiz-history/${encodeURIComponent(attempt.id)}`;
              return (
                <Link
                  key={attempt.id}
                  href={href}
                  className="flex min-h-20 flex-wrap items-center justify-between gap-4 p-5 transition hover:bg-white/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-sky-300 sm:px-6"
                  aria-label={`Review attempt ${attempt.chronologicalNumber} of ${totalsForQuiz(attempts, attempt.quizId)}: ${title}, ${attempt.score} of ${attempt.totalQuestions}, ${percentage} percent`}
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <span className="rounded-xl bg-sky-400/10 p-3 text-sky-300">
                      <BookOpen size={20} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold capitalize text-slate-100">
                        {title}
                      </span>
                      <span className="mt-1 block text-xs text-slate-500">
                        {getAssociatedLessonTitle(attempt.quizId)}
                        {" · "}
                        {new Intl.DateTimeFormat("en-PH", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(attempt.createdAt))}
                        {" · "}
                        Attempt {attempt.chronologicalNumber} of{" "}
                        {totalsForQuiz(attempts, attempt.quizId)}
                      </span>
                    </span>
                  </div>
                  <span className="flex items-center gap-4">
                    <span className="text-right">
                      <span className="block font-bold text-slate-100">
                        {attempt.score}/{attempt.totalQuestions}
                      </span>
                      <span className="mt-1 block text-xs text-slate-400">
                        {percentage}%
                      </span>
                      {showAnswerCounts && (
                        <span className="mt-1 block text-xs text-slate-500">
                          {attempt.score} correct ·{" "}
                          {Math.max(attempt.totalQuestions - attempt.score, 0)}{" "}
                          incorrect
                        </span>
                      )}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                        percentage >= 60
                          ? "bg-emerald-400/10 text-emerald-300"
                          : "bg-amber-400/10 text-amber-300"
                      }`}
                    >
                      {percentage >= 60 ? "Passed" : "Needs review"}
                    </span>
                    <ArrowRight
                      aria-hidden="true"
                      size={17}
                      className="text-slate-500"
                    />
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function getAttemptTitle(quizId: string) {
  if (quizId === "dashboard-physics") return "Quick Physics Challenge";
  const titles: Record<string, string> = {
    "measurements-vectors": "Measurements & Vectors",
    fluids: "Fluids",
    "temperature-heat": "Temperature & Heat",
    "waves-sound": "Waves & Sound",
    optics: "Light & Reflection",
    electricity: "Electric Forces & Field",
  };
  return titles[quizId] ?? "Physics quiz";
}

function getAssociatedLessonTitle(quizId: string) {
  if (quizId === "dashboard-physics") return "Across all modules";
  return getAttemptTitle(quizId);
}

function totalsForQuiz(attempts: QuizAttemptListItem[], quizId: string) {
  return attempts.filter((attempt) => attempt.quizId === quizId).length;
}
