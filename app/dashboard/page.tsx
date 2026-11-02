
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  Atom,
  BookOpen,
  LogOut,
  ArrowRight,
  CheckCircle2,
  Flame,
  Lightbulb,
  Target,
  Zap,
  Trophy,
  History,
  ChevronRight,
} from "lucide-react";
import DashboardChallenge from "./DashboardChallenge";
import LessonSidebar from "../lessons/LessonSidebar";

const lessons = [
  {
    title: "Measurements & Vectors",
    slug: "measurements-vectors",
  },
  {
    title: "Fluids",
    slug: "fluids",
  },
  {
    title: "Temperature & Heat",
    slug: "temperature-heat",
  },
  {
    title: "Waves & Sound",
    slug: "waves-sound",
  },
  {
    title: "Light & Reflection",
    slug: "optics",
  },
  {
    title: "Electric Forces & Field",
    slug: "electricity",
  },
];

function DashboardLoading() {
  return (
    <main className="min-h-screen bg-[#080D1B] px-5 py-10 text-slate-100">
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="h-12 w-48 rounded-xl bg-white/10" />
        <div className="mt-12 h-56 rounded-3xl bg-white/10" />
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          <div className="h-28 rounded-2xl bg-white/10" />
          <div className="h-28 rounded-2xl bg-white/10" />
          <div className="h-28 rounded-2xl bg-white/10" />
        </div>
      </div>
    </main>
  );
}

async function DashboardContent() {
  await connection();

  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      lessonProgress: {
        select: {
          lessonSlug: true,
          completed: true,
          lastAccessedAt: true,
          completedAt: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const [recentAttempts, totalAttempts] = await Promise.all([
    prisma.quizAttempt.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        quizId: true,
        score: true,
        totalQuestions: true,
        createdAt: true,
      },
    }),
    prisma.quizAttempt.count({
      where: { userId: user.id },
    }),
  ]);

  const displayName =
    user.name?.trim() || session.user.name?.trim() || "Physics learner";
  const firstName = displayName.split(" ")[0];

  const completedSlugs = new Set(
    user.lessonProgress
      .filter((progress) => progress.completed)
      .map((progress) => progress.lessonSlug)
  );

  const completedCount = lessons.filter((lesson) =>
    completedSlugs.has(lesson.slug)
  ).length;

  const progressPercent = Math.round(
    (completedCount / lessons.length) * 100
  );
  const mostRecentlyAccessedUnfinishedLesson = user.lessonProgress
    .filter((progress) => !progress.completed)
    .sort(
      (left, right) =>
        right.lastAccessedAt.getTime() - left.lastAccessedAt.getTime()
    )[0];
  const nextLesson =
    lessons.find(
      (lesson) =>
        lesson.slug === mostRecentlyAccessedUnfinishedLesson?.lessonSlug
    ) ?? lessons.find((lesson) => !completedSlugs.has(lesson.slug));
  const learningAction = nextLesson
    ? {
        label: user.lessonProgress.length > 0 ? "Continue Learning" : "Start Learning",
        href: `/lessons/${nextLesson.slug}`,
      }
    : {
        label: "Review Lessons",
        href: `/lessons/${lessons[0].slug}`,
      };

  const recentAverage =
    recentAttempts.length > 0
      ? Math.round(
          (recentAttempts.reduce(
            (sum, attempt) =>
              sum +
              (attempt.totalQuestions > 0
                ? attempt.score / attempt.totalQuestions
                : 0),
            0
          ) /
            recentAttempts.length) *
            100
        )
      : null;

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);

  const getQuizName = (quizId: string) =>
    quizId === "dashboard-physics"
      ? "Quick Physics Challenge"
      : lessons.find((lesson) => lesson.slug === quizId)?.title ??
        quizId.replace(/[-_]/g, " ");

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-[#080D1B] text-slate-100">
      <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] md:grid-rows-1 md:grid-cols-[250px_minmax(0,1fr)]">
        <LessonSidebar />
        <div className="min-w-0 overflow-y-auto overscroll-contain px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto w-full max-w-[1600px]">
        {/* Navigation */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="rounded-xl bg-sky-400 p-2.5 text-slate-950">
              <Atom size={25} />
            </div>
            <span className="text-2xl font-black tracking-tight">
              Calph<span className="text-sky-400">++</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden rounded-xl px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white sm:block"
            >
              Home
            </Link>

            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 transition hover:border-red-400/30 hover:bg-red-400/10 hover:text-red-300">
                <LogOut size={16} />
                Log out
              </button>
            </form>
          </div>
        </header>

        {/* Welcome banner */}
        <section className="relative mt-8 overflow-hidden rounded-3xl border border-sky-400/20 bg-gradient-to-br from-[#132746] via-[#101A30] to-[#101426] p-6 sm:p-10">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 right-1/4 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-sky-300">
                <Atom size={14} />
                Your learning space
              </div>

              <h1 className="mt-5 text-3xl font-black leading-tight sm:text-5xl">
                Welcome back, {firstName}!
              </h1>

              <p className="mt-4 max-w-xl leading-7 text-slate-400">
                Every great discovery starts with a question. Explore physics,
                practice what you learn, and build your understanding one
                lesson at a time.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href={learningAction.href}
                  className="inline-flex items-center gap-2 rounded-xl bg-sky-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-sky-300"
                >
                  {learningAction.label}
                  <ArrowRight size={18} />
                </Link>

              </div>
            </div>

            <div className="hidden rounded-3xl border border-white/10 bg-white/5 p-7 md:block">
              <Atom size={88} strokeWidth={1} className="text-sky-300" />
              <p className="mt-4 text-center text-sm font-semibold text-sky-200">
                Think. Explore. Discover.
              </p>
            </div>
          </div>
        </section>

        {/* Real database statistics */}
        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-[#10182B] p-5 transition hover:border-sky-400/30">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-sky-400/10 p-3 text-sky-400">
                <BookOpen size={22} />
              </div>
              <span className="text-xs font-medium text-slate-500">
                AVAILABLE
              </span>
            </div>
            <p className="mt-5 text-3xl font-black">{lessons.length}</p>
            <p className="mt-1 text-sm text-slate-400">Physics modules</p>
          </div>

          <Link
            href="/dashboard/progress"
            aria-label={`View module progress: ${completedCount} of ${lessons.length} completed`}
            className="group rounded-2xl border border-white/10 bg-[#10182B] p-5 transition hover:border-emerald-400/30 hover:bg-[#131e34] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
          >
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-emerald-400/10 p-3 text-emerald-400">
                <CheckCircle2 size={22} />
              </div>
              <span className="flex items-center gap-1 text-xs font-medium text-slate-500 group-hover:text-emerald-300">
                COMPLETED <ChevronRight size={14} />
              </span>
            </div>
            <p className="mt-5 text-3xl font-black">
              {completedCount} / {lessons.length}
            </p>
            <p className="mt-1 text-sm text-slate-400">Completed modules</p>
          </Link>

          <Link
            href="/dashboard/quiz-attempts"
            aria-label={`View ${totalAttempts} saved quiz attempts`}
            className="group rounded-2xl border border-white/10 bg-[#10182B] p-5 transition hover:border-violet-400/30 hover:bg-[#131e34] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
          >
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-violet-400/10 p-3 text-violet-400">
                <Target size={22} />
              </div>
              <span className="flex items-center gap-1 text-xs font-medium text-slate-500 group-hover:text-violet-300">
                QUIZZES <ChevronRight size={14} />
              </span>
            </div>
            <p className="mt-5 text-3xl font-black">{totalAttempts}</p>
            <p className="mt-1 text-sm text-slate-400">Quiz attempts saved</p>
          </Link>

          <Link
            href="/dashboard/performance"
            aria-label={`View quiz performance analytics, recent average ${recentAverage === null ? "not available" : `${recentAverage}%`}`}
            className="group rounded-2xl border border-white/10 bg-[#10182B] p-5 transition hover:border-amber-400/30 hover:bg-[#131e34] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
          >
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-amber-400/10 p-3 text-amber-300">
                <Trophy size={22} />
              </div>
              <span className="flex items-center gap-1 text-xs font-medium text-slate-500 group-hover:text-amber-300">
                RECENT AVERAGE <ChevronRight size={14} />
              </span>
            </div>
            <p className="mt-5 text-3xl font-black">
              {recentAverage === null ? "—" : `${recentAverage}%`}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              {recentAverage === null
                ? "Complete a quiz to get started"
                : `Based on ${recentAttempts.length} recent ${
                    recentAttempts.length === 1 ? "attempt" : "attempts"
                  }`}
            </p>
          </Link>
        </section>

        {/* Progress */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-[#10182B] p-6 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Your learning journey</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Pass a lesson quiz with at least 60% to complete its module.
              </p>
            </div>
            <div className="rounded-xl bg-sky-400/10 p-3 text-sky-400">
              <Flame size={24} />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between text-sm">
            <span className="text-slate-300">Module overview</span>
            <span className="font-bold text-sky-300">
              {completedCount} of {lessons.length} completed ({progressPercent}%)
            </span>
          </div>

          <div
            className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/10"
            role="progressbar"
            aria-label="Module completion"
            aria-valuemin={0}
            aria-valuemax={lessons.length}
            aria-valuenow={completedCount}
          >
            <div
              className="h-full rounded-full bg-sky-400 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <p className="mt-3 text-xs text-slate-500">
            Quiz results are saved to your account and update this progress
            automatically.
          </p>
        </section>

        {/* Formula and study tip */}
        <section className="mt-12 grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-amber-300/15 bg-gradient-to-br from-[#292317] to-[#15182A] p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-300/10 p-3 text-amber-300">
                <Lightbulb size={23} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-amber-300">
                  Formula spotlight
                </p>
                <h2 className="mt-1 text-xl font-bold">Newton&apos;s Second Law</h2>
              </div>
            </div>

            <div className="my-7 rounded-xl border border-white/10 bg-black/20 py-6 text-center">
              <p className="text-4xl font-black tracking-wider text-amber-200 sm:text-5xl">
                F = ma
              </p>
              <p className="mt-3 text-sm text-slate-400">
                Force = mass × acceleration
              </p>
            </div>

            <p className="text-sm leading-7 text-slate-300">
              <strong className="text-white">Example:</strong> A 2 kg object
              accelerates at 3 m/s². The net force is 2 × 3 = 6 N.
            </p>
            <p className="mt-3 text-xs text-slate-500">
              F = force in newtons · m = mass in kilograms · a = acceleration
              in m/s²
            </p>
          </div>

          <div className="rounded-2xl border border-sky-400/15 bg-gradient-to-br from-[#14283B] to-[#101426] p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-sky-400/10 p-3 text-sky-300">
                <Zap size={23} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-sky-300">
                  Study tip
                </p>
                <h2 className="mt-1 text-xl font-bold">
                  Understand, don&apos;t just memorize
                </h2>
              </div>
            </div>

            <p className="mt-5 text-sm leading-7 text-slate-300">
              Physics becomes easier when you connect formulas to real-life
              situations. Identify the known values, choose the right
              equation, substitute carefully, and check your units.
            </p>

            <Link
              href="/lessons/measurements-vectors"
              className="mt-6 inline-flex items-center gap-2 font-semibold text-sky-300 transition hover:text-sky-200"
            >
              Start with the basics
              <ArrowRight size={17} />
            </Link>
          </div>
        </section>

        {/* Quiz challenge */}
        <section id="challenge" className="mt-12 scroll-mt-8">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-400">
              Test yourself
            </p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Quick Physics Challenge
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Answer the questions and see how well you understand physics.
            </p>
          </div>

          <DashboardChallenge />
        </section>

        {/* Recent quiz history */}
        <section className="mt-12">
          <Link
            href="/dashboard/quiz-history"
            className="group mb-5 flex items-center justify-between gap-3 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-300"
            aria-label="View complete recent quiz history"
          >
            <span className="flex items-center gap-3">
              <span className="rounded-xl bg-violet-400/10 p-3 text-violet-300">
                <History size={22} />
              </span>
              <span>
                <span className="block text-2xl font-black">
                  Recent Quiz History
                </span>
                <span className="mt-1 block text-sm text-slate-400">
                  Your latest lesson and challenge quiz results.
                </span>
              </span>
            </span>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-violet-300 opacity-80 transition group-hover:opacity-100">
              View all <ChevronRight size={17} />
            </span>
          </Link>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#10182B]">
            {recentAttempts.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <Target className="mx-auto text-slate-500" size={34} />
                <p className="mt-4 font-semibold text-slate-200">
                  No quiz attempts yet
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  Complete the Physics Challenge above. Your saved results will
                  appear here.
                </p>
                <Link
                  href="#challenge"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-sky-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-sky-300"
                >
                  Take a quiz
                  <ArrowRight size={16} />
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {recentAttempts.map((attempt) => {
                  const percentage =
                    attempt.totalQuestions > 0
                      ? Math.round(
                          (attempt.score / attempt.totalQuestions) * 100
                        )
                      : 0;

                  return (
                    <Link
                      key={attempt.id}
                      href={`/dashboard/quiz-history/${encodeURIComponent(attempt.id)}`}
                      className="flex flex-wrap items-center justify-between gap-4 p-5 transition hover:bg-white/[0.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-sky-300 sm:px-6"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="rounded-xl bg-sky-400/10 p-3 text-sky-300">
                          <BookOpen size={20} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-100">
                            {getQuizName(attempt.quizId)}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {formatDate(attempt.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-slate-100">
                            {attempt.score}/{attempt.totalQuestions}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {percentage}%
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                            percentage >= 75
                              ? "bg-emerald-400/10 text-emerald-300"
                              : percentage >= 50
                                ? "bg-amber-400/10 text-amber-300"
                                : "bg-red-400/10 text-red-300"
                          }`}
                        >
                          {percentage >= 75
                            ? "Great job"
                            : percentage >= 50
                              ? "Keep practicing"
                              : "Review topics"}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {totalAttempts > recentAttempts.length && (
              <p className="border-t border-white/10 px-6 py-3 text-xs text-slate-500">
                Showing the latest {recentAttempts.length} of {totalAttempts}{" "}
                quiz attempts.
              </p>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-14 border-t border-white/10 py-7 text-center">
          <Link href="/" className="text-lg font-black">
            Calph<span className="text-sky-400">++</span>
          </Link>
          <p className="mt-2 text-xs text-slate-500">
            Learn physics. Explore ideas. Understand the world.
          </p>
        </footer>
          </div>
          </div>
        </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}
