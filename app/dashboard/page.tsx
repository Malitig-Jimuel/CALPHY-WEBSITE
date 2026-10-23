
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
  Clock3,
  Flame,
  Lightbulb,
  Target,
  Zap,
  Trophy,
  History,
} from "lucide-react";
import DashboardChallenge from "./DashboardChallenge";

const lessons = [
  {
    number: "01",
    title: "Measurements & Vectors",
    description: "SI units, measurements, and vector operations.",
    slug: "measurements-vectors",
    href: "/lessons/measurements-vectors",
    icon: "ruler",
    color: "text-sky-400",
    background: "bg-sky-400/10",
  },
  {
    number: "02",
    title: "Fluids",
    description: "Pressure, buoyancy, and fluid behavior.",
    slug: "fluids",
    href: "/lessons/fluids",
    icon: "waves",
    color: "text-cyan-400",
    background: "bg-cyan-400/10",
  },
  {
    number: "03",
    title: "Temperature & Heat",
    description: "Temperature, heat transfer, and thermal energy.",
    slug: "temperature-heat",
    href: "/lessons/temperature-heat",
    icon: "thermometer",
    color: "text-orange-400",
    background: "bg-orange-400/10",
  },
  {
    number: "04",
    title: "Waves & Sound",
    description: "Wave motion, frequency, and sound.",
    slug: "waves-sound",
    href: "/lessons/waves-sound",
    icon: "audio",
    color: "text-violet-400",
    background: "bg-violet-400/10",
  },
  {
    number: "05",
    title: "Light & Reflection",
    description: "Mirrors, reflection, and image formation.",
    slug: "optics",
    href: "/lessons/optics",
    icon: "light",
    color: "text-yellow-400",
    background: "bg-yellow-400/10",
  },
  {
    number: "06",
    title: "Electric Forces & Field",
    description: "Electric charges, forces, and electric fields.",
    slug: "electricity",
    href: "/lessons/electricity",
    icon: "zap",
    color: "text-emerald-400",
    background: "bg-emerald-400/10",
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

  const latestAttempt = recentAttempts[0];

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);

  const getQuizName = (quizId: string) =>
    quizId === "dashboard-physics"
      ? "Quick Physics Challenge"
      : quizId.replace(/[-_]/g, " ");

  return (
    <main className="min-h-screen bg-[#080D1B] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
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
              href="/#topics"
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
                  href="/lessons/measurements-vectors"
                  className="inline-flex items-center gap-2 rounded-xl bg-sky-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-sky-300"
                >
                  Continue learning
                  <ArrowRight size={18} />
                </Link>

                <Link
                  href="#lessons"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 font-semibold text-slate-200 transition hover:bg-white/5"
                >
                  <BookOpen size={18} />
                  Explore modules
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

          <div className="rounded-2xl border border-white/10 bg-[#10182B] p-5 transition hover:border-emerald-400/30">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-emerald-400/10 p-3 text-emerald-400">
                <CheckCircle2 size={22} />
              </div>
              <span className="text-xs font-medium text-slate-500">
                COMPLETED
              </span>
            </div>
            <p className="mt-5 text-3xl font-black">
              {completedCount} / {lessons.length}
            </p>
            <p className="mt-1 text-sm text-slate-400">Completed modules</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#10182B] p-5 transition hover:border-violet-400/30">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-violet-400/10 p-3 text-violet-400">
                <Target size={22} />
              </div>
              <span className="text-xs font-medium text-slate-500">
                QUIZZES
              </span>
            </div>
            <p className="mt-5 text-3xl font-black">{totalAttempts}</p>
            <p className="mt-1 text-sm text-slate-400">Quiz attempts saved</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#10182B] p-5 transition hover:border-amber-400/30">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-amber-400/10 p-3 text-amber-300">
                <Trophy size={22} />
              </div>
              <span className="text-xs font-medium text-slate-500">
                RECENT AVERAGE
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
          </div>
        </section>

        {/* Progress */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-[#10182B] p-6 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Your learning journey</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Your progress is based on completed modules saved to your
                account.
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
            Complete a module using its lesson completion control to update
            your progress.
          </p>
        </section>

        {/* Lessons */}
        <section id="lessons" className="mt-12 scroll-mt-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400">
                Explore and learn
              </p>
              <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                Your Physics Modules
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Choose a topic to begin or continue studying.
              </p>
            </div>

            <span className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-400">
              {completedCount} of 6 completed
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {lessons.map((lesson) => {
              const isCompleted = completedSlugs.has(lesson.slug);

              return (
                <Link
                  key={lesson.number}
                  href={lesson.href}
                  className="group rounded-2xl border border-white/10 bg-[#10182B] p-5 transition duration-200 hover:-translate-y-1 hover:border-sky-400/40 hover:bg-[#131F36]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div
                      className={`rounded-xl p-3 ${lesson.background} ${lesson.color}`}
                    >
                      {lesson.icon === "ruler" && <BookOpen size={23} />}
                      {lesson.icon === "waves" && <Clock3 size={23} />}
                      {lesson.icon === "thermometer" && <Flame size={23} />}
                      {lesson.icon === "audio" && <Atom size={23} />}
                      {lesson.icon === "light" && <Lightbulb size={23} />}
                      {lesson.icon === "zap" && <Zap size={23} />}
                    </div>

                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                        <CheckCircle2 size={14} />
                        Completed
                      </span>
                    ) : (
                      <span className="text-sm font-bold tracking-widest text-slate-600">
                        {lesson.number}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-5 text-lg font-bold transition group-hover:text-sky-300">
                    {lesson.title}
                  </h3>

                  <p className="mt-2 min-h-12 text-sm leading-6 text-slate-400">
                    {lesson.description}
                  </p>

                  <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-sky-400">
                    {isCompleted ? "Review module" : "Open module"}
                    <ArrowRight
                      size={16}
                      className="transition group-hover:translate-x-1"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
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
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-violet-400/10 p-3 text-violet-300">
              <History size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-black">Recent Quiz History</h2>
              <p className="mt-1 text-sm text-slate-400">
                Your latest saved quiz results.
              </p>
            </div>
          </div>

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
                    <div
                      key={attempt.id}
                      className="flex flex-wrap items-center justify-between gap-4 p-5 transition hover:bg-white/[0.02] sm:px-6"
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
                    </div>
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
