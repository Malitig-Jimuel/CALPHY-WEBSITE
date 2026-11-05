"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Atom,
  ChevronRight,
} from "lucide-react";

export default function HomePage({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <main className="flex min-h-[calc(100dvh-4rem)] flex-col overflow-x-hidden bg-[#080D1B] text-[#F8FAFC]">
      {/* Full-height Hero */}
      <section className="relative flex flex-1 items-center justify-center overflow-hidden px-5 py-8 sm:py-10 md:min-h-0 md:py-4 lg:py-6">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/[0.08] blur-[120px]" />
        <div className="pointer-events-none absolute left-[8%] top-[18%] h-48 w-48 rounded-full bg-violet-500/[0.06] blur-[100px]" />
        <div className="pointer-events-none absolute bottom-[10%] right-[8%] h-56 w-56 rounded-full bg-cyan-500/[0.06] blur-[100px]" />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-[7%] top-[17%] hidden text-5xl font-light text-sky-300/[0.12] lg:block"
        >
          +
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-[10%] top-[23%] hidden text-6xl font-light text-violet-300/[0.12] lg:block"
        >
          ∑
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[16%] left-[15%] hidden text-4xl font-light text-cyan-300/[0.12] lg:block"
        >
          λ
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[20%] right-[13%] hidden text-5xl font-light text-sky-300/[0.12] lg:block"
        >
          E = mc²
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center text-center"
        >
          <div className="mb-5 inline-flex items-center justify-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-sm font-semibold text-sky-300 shadow-lg shadow-sky-500/[0.04] md:mb-4">
            <Atom size={16} />
            Interactive Physics Learning
          </div>

          <h1 className="max-w-5xl text-5xl font-black leading-[1.08] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
            Physics made
            <br />
            <span className="bg-gradient-to-r from-sky-300 via-cyan-300 to-violet-400 bg-clip-text text-transparent">
              easier to explore.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-slate-400 sm:text-lg md:mt-4 md:text-xl">
            Learn physics beyond memorizing formulas. Explore interactive
            simulations, understand the concepts, and test your knowledge
            through quizzes with Calph++.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-4 md:mt-6">
            <Link
              href="/lessons/measurements-vectors"
              className="inline-flex items-center gap-2 rounded-xl bg-sky-400 px-6 py-3.5 font-bold text-slate-950 shadow-lg shadow-sky-500/10 transition hover:-translate-y-0.5 hover:bg-sky-300"
            >
              Explore lessons <ArrowRight size={18} />
            </Link>

            <Link
              href={isAuthenticated ? "/home" : "/register"}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 font-semibold transition hover:-translate-y-0.5 hover:bg-white/10"
            >
              Get started <ChevronRight size={18} />
            </Link>
          </div>

          <div className="mx-auto mt-8 grid w-full max-w-3xl grid-cols-3 gap-3 border-t border-white/10 pt-5 sm:gap-6 md:mt-6 md:pt-4">
            <div className="flex flex-col items-center">
              <p className="text-2xl font-black text-sky-300 sm:text-3xl">
                06
              </p>
              <p className="mt-2 text-center text-xs text-slate-500 sm:text-sm">
                Physics topics
              </p>
            </div>

            <div className="flex flex-col items-center">
              <p className="text-2xl font-black text-violet-300 sm:text-3xl">
                06
              </p>
              <p className="mt-2 text-center text-xs text-slate-500 sm:text-sm">
                Interactive simulations
              </p>
            </div>

            <div className="flex flex-col items-center">
              <p className="text-2xl font-black text-emerald-300 sm:text-3xl">
                06
              </p>
              <p className="mt-2 text-center text-xs text-slate-500 sm:text-sm">
                Physics quizzes
              </p>
            </div>
          </div>

          {!isAuthenticated && (
            <section
              aria-labelledby="progress-prompt-title"
              className="mx-auto mt-5 w-full max-w-3xl rounded-2xl border border-sky-300/15 bg-[#10182B]/90 px-4 py-3 text-left sm:flex sm:items-center sm:justify-between sm:gap-5"
            >
              <div>
                <h2
                  id="progress-prompt-title"
                  className="text-sm font-bold text-white sm:text-base"
                >
                  Track Your Learning Progress
                </h2>
                <p className="mt-1 text-xs leading-5 text-slate-400 sm:text-sm">
                  Want to save your quiz scores, review previous attempts, and
                  keep track of your completed lessons? Log in to your account
                  to access your personal learning progress.
                </p>
              </div>
              <div className="mt-3 flex shrink-0 flex-wrap gap-2 sm:mt-0">
                <Link
                  href="/login"
                  className="inline-flex min-h-10 items-center justify-center rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="inline-flex min-h-10 items-center justify-center rounded-lg bg-sky-400 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-sky-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
                >
                  Create an Account
                </Link>
              </div>
            </section>
          )}

        </motion.div>
      </section>

    </main>
  );
}