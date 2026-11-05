import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react";
import DashboardPageShell, {
  DashboardPageFallback,
} from "../_components/DashboardPageShell";
import PerformanceChart, {
  type PerformancePoint,
} from "../_components/PerformanceChart";
import {
  getAssociatedLesson,
  getAttemptPercentage,
  getQuizTitle,
  requireDashboardUser,
} from "../_lib";
import { prisma } from "@/lib/prisma";
import { lessons } from "../../lessonModules";

type AttemptRecord = {
  id: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  createdAt: Date;
};

function averagePercentage(attempts: AttemptRecord[]) {
  return attempts.length
    ? attempts.reduce(
        (sum, attempt) =>
          sum +
          (attempt.totalQuestions > 0
            ? attempt.score / attempt.totalQuestions
            : 0),
        0
      ) / attempts.length
    : null;
}

async function PerformanceContent() {
  const user = await requireDashboardUser();
  const attempts = await prisma.quizAttempt.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      quizId: true,
      score: true,
      totalQuestions: true,
      createdAt: true,
    },
  });
  const recentAttempts = attempts.slice(0, 10);
  const recentAverage = averagePercentage(recentAttempts);
  const attemptPercentages = attempts.map((attempt) =>
    getAttemptPercentage(attempt.score, attempt.totalQuestions)
  );
  const highest = attempts.length ? Math.max(...attemptPercentages) : null;
  const lowest = attempts.length ? Math.min(...attemptPercentages) : null;
  const mostRecent = attempts[0] ?? null;
  const chartPoints: PerformancePoint[] = [...attempts]
    .reverse()
    .map((attempt) => ({
      id: attempt.id,
      title: getQuizTitle(attempt.quizId),
      lesson: getAssociatedLesson(attempt.quizId),
      date: attempt.createdAt.toISOString(),
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      percentage: getAttemptPercentage(
        attempt.score,
        attempt.totalQuestions
      ),
    }));

  const lessonBreakdown = lessons.map((lesson) => {
    const lessonAttempts = attempts.filter(
      (attempt) => attempt.quizId === lesson.slug
    );
    const average = averagePercentage(lessonAttempts);
    const scores = lessonAttempts.map((attempt) =>
      getAttemptPercentage(attempt.score, attempt.totalQuestions)
    );
    return {
      ...lesson,
      count: lessonAttempts.length,
      average: average === null ? null : Math.round(average * 100),
      highest: scores.length ? Math.max(...scores) : null,
    };
  });
  const attemptedLessons = lessonBreakdown.filter((lesson) => lesson.count > 0);
  const bestLesson =
    attemptedLessons.length > 0
      ? [...attemptedLessons].sort(
          (left, right) => (right.average ?? 0) - (left.average ?? 0)
        )[0]
      : null;
  const previousAttempt = attempts[1] ?? null;
  const recentTrend =
    mostRecent && previousAttempt
      ? (mostRecent.totalQuestions > 0
          ? mostRecent.score / mostRecent.totalQuestions
          : 0) -
        (previousAttempt.totalQuestions > 0
          ? previousAttempt.score / previousAttempt.totalQuestions
          : 0)
      : null;

  return (
    <DashboardPageShell
      title="Performance"
      description="Explore your quiz scores over time and see how your overall average is calculated."
    >
      {attempts.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#10182B] px-6 py-12 text-center">
          <h2 className="text-lg font-bold">No performance data yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
            Your chart and score summaries will appear after you complete and
            save a quiz.
          </p>
          <Link
            href="/home"
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-sky-400 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-sky-300"
          >
            Go to Home <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard
              label={`Overall average · latest ${recentAttempts.length}`}
              value={`${Math.round((recentAverage ?? 0) * 100)}%`}
            />
            <MetricCard label="Total quiz attempts" value={`${attempts.length}`} />
            <MetricCard label="Highest score" value={`${highest}%`} />
            <MetricCard label="Lowest score" value={`${lowest}%`} />
            <MetricCard
              label="Most recent score"
              value={`${getAttemptPercentage(
                mostRecent!.score,
                mostRecent!.totalQuestions
              )}%`}
            />
          </section>

          <div className="mt-6">
            <PerformanceChart points={chartPoints} />
          </div>

          <section className="mt-6 rounded-2xl border border-white/10 bg-[#10182B] p-5 sm:p-6">
            <h2 className="text-lg font-bold">How your average is calculated</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Your average is the arithmetic mean of your
              most recent ten saved quiz percentages (or all attempts if you
              have fewer than ten). Each attempt percentage is its score
              divided by its question count; the final average is rounded to a
              whole percent.
            </p>
            <div className="mt-4 rounded-xl border border-sky-400/15 bg-sky-400/5 p-4">
              <p className="font-mono text-sm font-bold text-sky-200">
                Average = sum of included quiz percentages ÷ included attempts
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Included attempts: {recentAttempts.length} of {attempts.length}
                {" · "}
                Average shown: {Math.round((recentAverage ?? 0) * 100)}%
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {recentAttempts.map((attempt) => (
                  <li
                    key={attempt.id}
                    className="rounded-lg border border-white/10 bg-[#080D1B] px-3 py-2 text-xs text-slate-300"
                  >
                    {attempt.score}/{attempt.totalQuestions} ={" "}
                    {attempt.totalQuestions > 0
                      ? (
                          (attempt.score / attempt.totalQuestions) *
                          100
                        ).toFixed(2)
                      : "0.00"}
                    %
                  </li>
                ))}
              </ul>
              <p className="mt-4 border-t border-white/10 pt-3 text-xs leading-5 text-slate-500">
                Example (illustrative only): scores of 80%, 90%, and 70% give
                (80 + 90 + 70) ÷ 3 = 80%. These example scores are not student
                data.
              </p>
            </div>
          </section>

          {(recentTrend !== null || bestLesson) && (
            <section className="mt-6 rounded-2xl border border-white/10 bg-[#10182B] p-5 sm:p-6">
              <h2 className="text-lg font-bold">Performance insights</h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                {recentTrend !== null && (
                  <li className="flex items-start gap-2">
                    {recentTrend >= 0 ? (
                      <TrendingUp
                        className="mt-0.5 shrink-0 text-emerald-300"
                        size={18}
                      />
                    ) : (
                      <TrendingDown
                        className="mt-0.5 shrink-0 text-amber-300"
                        size={18}
                      />
                    )}
                    <span>
                      Your latest score is{" "}
                      {recentTrend === 0
                        ? "the same as"
                        : recentTrend > 0
                          ? "higher than"
                          : "lower than"}{" "}
                      your previous attempt (
                      {getAttemptPercentage(
                        mostRecent!.score,
                        mostRecent!.totalQuestions
                      )}
                      % vs.{" "}
                      {getAttemptPercentage(
                        previousAttempt!.score,
                        previousAttempt!.totalQuestions
                      )}
                      %).
                    </span>
                  </li>
                )}
                {bestLesson && (
                  <li className="flex items-start gap-2">
                    <TrendingUp
                      className="mt-0.5 shrink-0 text-sky-300"
                      size={18}
                    />
                    <span>
                      Your highest average among attempted modules is{" "}
                      <strong className="text-white">{bestLesson.title}</strong>{" "}
                      at {bestLesson.average}% across {bestLesson.count}{" "}
                      {bestLesson.count === 1 ? "attempt" : "attempts"}.
                    </span>
                  </li>
                )}
              </ul>
            </section>
          )}

          <section className="mt-6 rounded-2xl border border-white/10 bg-[#10182B]">
            <div className="border-b border-white/10 p-5 sm:px-6">
              <h2 className="text-lg font-bold">Performance by module</h2>
              <p className="mt-1 text-sm text-slate-400">
                Averages and best scores include every saved attempt for each
                lesson.
              </p>
            </div>
            <div className="divide-y divide-white/10">
              {lessonBreakdown.map((lesson) => (
                <div
                  key={lesson.slug}
                  className="flex flex-wrap items-center justify-between gap-4 p-5 sm:px-6"
                >
                  <div>
                    <p className="font-semibold">{lesson.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {lesson.count}{" "}
                      {lesson.count === 1 ? "attempt" : "attempts"}
                    </p>
                  </div>
                  <div className="flex items-center gap-5 text-right">
                    <div>
                      <p className="text-xs text-slate-500">Average</p>
                      <p className="mt-1 font-bold text-sky-300">
                        {lesson.average === null ? "—" : `${lesson.average}%`}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Highest</p>
                      <p className="mt-1 font-bold text-emerald-300">
                        {lesson.highest === null ? "—" : `${lesson.highest}%`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {attempts.some(
              (attempt) => attempt.quizId === "dashboard-physics"
            ) && (
              <p className="border-t border-white/10 p-5 text-sm text-slate-400 sm:px-6">
                Quick Physics Challenge attempts are mixed-topic quizzes and
                are included in the chart and overall average, but not in an
                individual lesson breakdown.
              </p>
            )}
          </section>
        </>
      )}
    </DashboardPageShell>
  );
}

export default function PerformancePage() {
  return (
    <Suspense fallback={<DashboardPageFallback />}>
      <PerformanceContent />
    </Suspense>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#10182B] p-4 sm:p-5">
      <p className="min-h-10 text-xs leading-5 text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-black text-sky-300">{value}</p>
    </article>
  );
}
