import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BookOpen, Waves } from "lucide-react";

export const metadata: Metadata = {
  title: "About Calph++",
  description:
    "Learn about Calph++ and its interactive approach to physics education.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#080D1B] text-slate-100">
      <nav className="border-b border-white/10 bg-[#080D1B]/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link href="/" className="text-2xl font-black tracking-tight">
            Calph<span className="text-sky-400">++</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-sky-300"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Home
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8 md:py-20">
        <header className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#14223A] via-[#111A2E] to-[#101426] p-7 sm:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-300">
            Learn by doing
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Understand the why, not just the formula.
          </h1>
          <p className="mt-5 max-w-3xl leading-8 text-slate-300">
            Calph++ brings physics concepts to life with visual experiments,
            adjustable simulations, worked examples, and quizzes that help
            students check their understanding and learn at their own pace.
          </p>
        </header>

        <section className="mt-8 grid gap-5 sm:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-[#111A2E] p-6">
            <div className="mb-4 inline-flex rounded-xl bg-sky-400/10 p-3 text-sky-300">
              <Waves size={22} aria-hidden="true" />
            </div>
            <h2 className="text-lg font-bold">Visual learning</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Explore how physical quantities change through interactive
              demonstrations and simulations.
            </p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-[#111A2E] p-6">
            <div className="mb-4 inline-flex rounded-xl bg-violet-400/10 p-3 text-violet-300">
              <BookOpen size={22} aria-hidden="true" />
            </div>
            <h2 className="text-lg font-bold">Practice and review</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Check your knowledge with topic-based quizzes, explanations, and
              saved progress.
            </p>
          </article>
        </section>

        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/5"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Return to homepage
        </Link>
      </div>
    </main>
  );
}
