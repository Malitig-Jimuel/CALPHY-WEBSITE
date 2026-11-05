import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Activity, ArrowRight, Atom, Lightbulb } from "lucide-react";
import QuickPhysicsChallenge from "./QuickPhysicsChallenge";
import LessonGrid from "./LessonGrid";
import { lessons } from "../lessonModules";

const formulaSpotlights: Record<
  (typeof lessons)[number]["slug"],
  {
    title: string;
    formula: string;
    meaning: string;
    example: string;
    variables: string;
  }
> = {
  "measurements-vectors": {
    title: "Average speed",
    formula: "v = d / t",
    meaning: "Speed = distance ÷ time",
    example: "A 120 m trip in 20 s has an average speed of 6 m/s.",
    variables: "v = speed · d = distance · t = time",
  },
  fluids: {
    title: "Pressure",
    formula: "P = F / A",
    meaning: "Pressure = force ÷ area",
    example: "A 60 N force over 3 m² produces a pressure of 20 Pa.",
    variables: "P = pressure · F = force · A = area",
  },
  "temperature-heat": {
    title: "Heat and specific heat capacity",
    formula: "Q = mcΔT",
    meaning: "Heat energy = mass × specific heat × temperature change",
    example: "Heating 0.5 kg of water by 2°C takes 4,200 J (c = 4,200 J/kg·°C).",
    variables:
      "Q = heat energy · m = mass · c = specific heat capacity · ΔT = temperature change",
  },
  "waves-sound": {
    title: "Wave equation",
    formula: "v = fλ",
    meaning: "Wave speed = frequency × wavelength",
    example: "A 4 Hz wave with a 0.5 m wavelength travels at 2 m/s.",
    variables: "v = wave speed · f = frequency · λ = wavelength",
  },
  optics: {
    title: "Mirror equation",
    formula: "1/f = 1/do + 1/di",
    meaning: "Relates focal length to object and image distances",
    example: "With f = 10 cm and do = 30 cm, the image distance is di = 15 cm.",
    variables: "f = focal length · do = object distance · di = image distance",
  },
  electricity: {
    title: "Electric field intensity",
    formula: "E = F / |q₀|",
    meaning: "Electric field = force ÷ test-charge magnitude",
    example: "A 12 N force on a 2 C test charge gives E = 6 N/C.",
    variables: "E = electric field · F = force · q₀ = test charge",
  },
};

export function HomeContentFallback() {
  return (
    <main className="h-full overflow-y-auto bg-[#080D1B] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px] animate-pulse">
        <div className="h-5 w-36 rounded bg-white/10" />
        <div className="mt-4 h-10 w-80 max-w-full rounded-xl bg-white/10" />
        <div className="mt-3 h-5 w-96 max-w-full rounded bg-white/10" />
        <div className="mt-8 h-7 w-64 rounded bg-white/10" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson) => (
            <div key={lesson.slug} className="h-56 rounded-2xl bg-white/5" />
          ))}
        </div>
      </div>
    </main>
  );
}

export default async function HomeContent() {
  await connection();
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/home");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      lessonProgress: {
        select: {
          lessonSlug: true,
          completed: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login?callbackUrl=/home");
  }

  const firstName =
    (user.name?.trim() || session.user.name?.trim() || "Physics learner").split(
      /\s+/
    )[0];
  const progressBySlug = new Map(
    user.lessonProgress.map((progress) => [progress.lessonSlug, progress] as const)
  );
  const nextLesson = lessons.find(
    (lesson) => !progressBySlug.get(lesson.slug)?.completed
  );
  const moduleProgress = lessons.map((lesson) => ({
    slug: lesson.slug,
    completed: Boolean(progressBySlug.get(lesson.slug)?.completed),
  }));
  const formulaSpotlightLesson = nextLesson ?? lessons[0];
  const formulaSpotlight = formulaSpotlights[formulaSpotlightLesson.slug];

  return (
    <main className="h-full min-h-0 overflow-y-auto overscroll-contain bg-[#080D1B] text-slate-100">
      <div className="mx-auto w-full px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
        <header className="grid gap-6 border-b border-white/10 pb-6 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-sky-300">
              <Atom size={15} aria-hidden="true" />
              Your Learning Space
            </p>
            <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
              My Lessons
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Choose a topic and continue your journey through physics.
            </p>
          </div>
          <div className="lg:text-right">
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              Welcome back, {firstName}!
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base lg:ml-auto">
              Continue exploring physics and building your understanding.
            </p>
          </div>
        </header>

        <section aria-label="Physics lessons" className="mt-6">
          <LessonGrid moduleProgress={moduleProgress} />
        </section>

        <section className="mt-9 grid gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-700/60 bg-[#10182B] p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
                <Lightbulb size={20} aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-amber-300">
                  Formula spotlight · {formulaSpotlightLesson.title}
                </p>
                <h2 className="mt-1 text-lg font-bold">
                  {formulaSpotlight.title}
                </h2>
              </div>
            </div>
            <div className="my-4 rounded-xl border border-white/10 bg-[#080D1B] px-4 py-5 text-center">
              <p className="text-3xl font-black tracking-wide text-amber-200 sm:text-4xl">
                {formulaSpotlight.formula}
              </p>
              <p className="mt-2 text-sm text-slate-400">
                {formulaSpotlight.meaning}
              </p>
            </div>
            <p className="text-sm leading-6 text-slate-300">
              <strong className="text-white">Example:</strong>{" "}
              {formulaSpotlight.example}
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              {formulaSpotlight.variables}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-700/60 bg-[#10182B] p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                <Activity size={20} aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">
                  Study tip
                </p>
                <h2 className="mt-1 text-lg font-bold">
                  Understand, don&apos;t just memorize
                </h2>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-400">
              Connect formulas to real situations: identify known values,
              choose the right equation, substitute carefully, and check your
              units.
            </p>
          </article>
        </section>

        <section id="challenge" className="mt-9 scroll-mt-6">
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">
              Test yourself
            </p>
            <h2 className="mt-2 text-xl font-black sm:text-2xl">
              Quick Physics Challenge
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Answer the questions and see how well you understand physics.
            </p>
          </div>
          <QuickPhysicsChallenge />
        </section>

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 py-5 text-xs text-slate-500">
          <span>Calph++ · Learn physics by exploring.</span>
          <Link
            href="/dashboard/performance"
            className="inline-flex min-h-10 items-center gap-1 font-semibold text-slate-400 transition hover:text-sky-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-300"
          >
            View performance
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </footer>
      </div>
    </main>
  );
}
