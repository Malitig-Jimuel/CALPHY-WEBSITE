
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Atom,
  Zap,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Droplets,
  Flame,
  Lightbulb,
  LockKeyhole,
  Radio,
  Waves,
} from "lucide-react";

const topics = [
  {
    number: "01",
    title: "Measurements & Vectors",
    description:
      "Explore SI units, dimensional analysis, scalars, vectors, and vector addition.",
    icon: Atom,
    href: "/lessons/measurements-vectors",
    available: true,
    color: "sky",
    label: "Interactive lesson",
  },
  {
    number: "02",
    title: "Fluids",
    description:
      "Discover density, pressure, buoyancy, Archimedes' principle, and Bernoulli's principle.",
    icon: Droplets,
    href: "/lessons/fluids",
    available: true,
    color: "cyan",
    label: "Interactive lesson",
  },
  {
    number: "03",
    title: "Temperature & Heat",
    description:
      "Explore temperature scales, linear thermal expansion, specific heat capacity, and heat calculations.",
    icon: Flame,
    href: "/lessons/temperature-heat",
    available: true,
    color: "orange",
    label: "Interactive lesson",
  },
  {
    number: "04",
    title: "Waves & Sound",
    description:
      "Explore wave types, frequency, wavelength, wave speed, sound, and the Doppler effect.",
    icon: Radio,
    href: "/lessons/waves-sound",
    available: true,
    color: "violet",
    label: "Interactive lesson",
  },
  {
    number: "05",
    title: "Light & Reflection",
    description:
      "Study the nature of light, the law of reflection, plane mirrors, and spherical mirrors.",
    icon: Lightbulb,
    href: "/lessons/optics",
    available: true,
    color: "amber",
    label: "Interactive lesson",
  },
  {
    number: "06",
    title: "Electric Forces & Electric Field",
    description:
      "Learn about electric charge, attraction and repulsion, Coulomb’s law, and electric field intensity.",
    icon: Zap,
    href: "/lessons/electricity",
    available: true,
    color: "emerald",
    label: "Interactive lesson",
  },
];

const colorStyles: Record<
  string,
  { icon: string; glow: string; number: string }
> = {
  sky: {
    icon: "bg-sky-400/10 text-sky-300 group-hover:bg-sky-400/20",
    glow: "group-hover:border-sky-400/40",
    number: "text-sky-300",
  },
  cyan: {
    icon: "bg-cyan-400/10 text-cyan-300 group-hover:bg-cyan-400/20",
    glow: "group-hover:border-cyan-400/40",
    number: "text-cyan-300",
  },
  orange: {
    icon: "bg-orange-400/10 text-orange-300 group-hover:bg-orange-400/20",
    glow: "group-hover:border-orange-400/40",
    number: "text-orange-300",
  },
  violet: {
    icon: "bg-violet-400/10 text-violet-300 group-hover:bg-violet-400/20",
    glow: "group-hover:border-violet-400/40",
    number: "text-violet-300",
  },
  amber: {
    icon: "bg-amber-400/10 text-amber-300 group-hover:bg-amber-400/20",
    glow: "group-hover:border-amber-400/40",
    number: "text-amber-300",
  },
  emerald: {
    icon: "bg-emerald-400/10 text-emerald-300 group-hover:bg-emerald-400/20",
    glow: "group-hover:border-emerald-400/40",
    number: "text-emerald-300",
  },
};

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#080D1B] text-[#F8FAFC]">
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-[#080D1B]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link href="/" className="text-2xl font-black tracking-tight">
            Calph<span className="text-sky-400">++</span>
          </Link>

          <div className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            <Link href="#topics" className="transition hover:text-sky-400">
              Lessons
            </Link>
            <Link href="#about" className="transition hover:text-sky-400">
              About
            </Link>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold transition hover:border-sky-400/40 hover:bg-sky-400/10"
          >
            Dashboard <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      <section className="relative mx-auto max-w-7xl px-5 pb-20 pt-20 md:pb-28 md:pt-28">
        <div className="pointer-events-none absolute left-1/2 top-10 -z-0 h-72 w-72 -translate-x-1/2 rounded-full bg-sky-500/10 blur-[100px]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-4xl"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-sm font-semibold text-sky-300">
            <Atom size={16} /> Interactive Physics Learning
          </div>

          <h1 className="text-5xl font-black leading-[1.08] tracking-tight sm:text-6xl md:text-7xl">
            Physics made
            <br />
            <span className="bg-gradient-to-r from-sky-300 via-cyan-300 to-violet-400 bg-clip-text text-transparent">
              easier to explore.
            </span>
          </h1>

          <p className="mt-7 max-w-2xl text-base leading-8 text-slate-400 md:text-lg">
            Learn physics beyond memorizing formulas. Explore interactive
            simulations, understand the concepts, and test your knowledge
            through quizzes with Calph++.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="#topics"
              className="inline-flex items-center gap-2 rounded-xl bg-sky-400 px-6 py-3.5 font-bold text-slate-950 transition hover:bg-sky-300"
            >
              Explore lessons <ArrowRight size={18} />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 font-semibold transition hover:bg-white/10"
            >
              Get started <ChevronRight size={18} />
            </Link>
          </div>

          <div className="mt-12 grid max-w-2xl grid-cols-3 gap-4 border-t border-white/10 pt-7">
            <div>
              <p className="text-2xl font-black text-sky-300">06</p>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Physics topics
              </p>
            </div>
            <div>
              <p className="text-2xl font-black text-violet-300">Labs</p>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Interactive simulations
              </p>
            </div>
            <div>
              <p className="text-2xl font-black text-emerald-300">Quizzes</p>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Practice and review
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      <section id="topics" className="scroll-mt-24 border-t border-white/10 bg-[#0B1222]">
        <div className="mx-auto max-w-7xl px-5 py-20 md:py-24">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-400">
                Learning modules
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                Explore Physics
              </h2>
              <p className="mt-3 max-w-2xl leading-7 text-slate-400">
                Choose any topic to start learning through interactive explanations, calculators, and quizzes.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-400">
              <CheckCircle2 size={15} className="text-emerald-300" />
              {topics.filter((topic) => topic.available).length} of {topics.length} lessons available
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((topic, index) => {
              const Icon = topic.icon;
              const styles = colorStyles[topic.color];

              const cardContent = (
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className={`group flex h-full flex-col rounded-2xl border border-white/10 bg-[#111A2E] p-6 transition duration-300 ${
                    topic.available
                      ? `hover:-translate-y-1 hover:bg-[#142039] ${styles.glow}`
                      : "opacity-75"
                  }`}
                >
                  <div className="mb-6 flex items-start justify-between">
                    <div className={`rounded-xl p-3 ${styles.icon}`}>
                      <Icon size={24} />
                    </div>
                    <span className={`text-sm font-black ${styles.number}`}>
                      {topic.number}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold">{topic.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-6 text-slate-400">
                    {topic.description}
                  </p>

                  <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                    <span
                      className={`text-xs font-semibold ${
                        topic.available ? "text-emerald-300" : "text-slate-500"
                      }`}
                    >
                      {topic.label}
                    </span>

                    {topic.available ? (
                      <ArrowRight
                        size={18}
                        className="text-sky-300 transition group-hover:translate-x-1"
                      />
                    ) : (
                      <LockKeyhole size={16} className="text-slate-500" />
                    )}
                  </div>
                </motion.div>
              );

              return topic.available ? (
                <Link
                  key={topic.number}
                  href={topic.href}
                  className="block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                >
                  {cardContent}
                </Link>
              ) : (
                <div key={topic.number} aria-label={`${topic.title}, coming soon`}>
                  {cardContent}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="about" className="border-t border-white/10">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 md:grid-cols-2 md:items-center md:py-24">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-300">
              Learn by doing
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Understand the why, not just the formula.
            </h2>
            <p className="mt-5 leading-8 text-slate-400">
              Calph++ brings physics concepts to life with visual experiments,
              adjustable simulations, worked examples, and quizzes that help
              you check your understanding.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#111A2E] p-5">
              <div className="mb-4 inline-flex rounded-xl bg-sky-400/10 p-3 text-sky-300">
                <Waves size={22} />
              </div>
              <h3 className="font-bold">Visual learning</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Explore how physical quantities change through interactive demonstrations.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#111A2E] p-5">
              <div className="mb-4 inline-flex rounded-xl bg-violet-400/10 p-3 text-violet-300">
                <BookOpen size={22} />
              </div>
              <h3 className="font-bold">Practice and review</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Check your knowledge with topic-based quizzes and explanations.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-7 text-sm text-slate-500">
          <Link href="/" className="text-lg font-black text-white">
            Calph<span className="text-sky-400">++</span>
          </Link>
          <p>Learn physics by exploring. © 2026 Calph++</p>
        </div>
      </footer>
    </main>
  );
}
