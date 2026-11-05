import type { Metadata } from "next";
import {
  BookOpen,
  CheckCircle2,
  FlaskConical,
  Mail,
  Target,
  Waves,
} from "lucide-react";

export const metadata: Metadata = {
  title: { absolute: "About Calph++" },
  description:
    "Learn about Calph++, a physics learning platform developed by BSIT-3B for Calculus-based Physics 2.",
};

const learningApproaches = [
  {
    title: "Visual Learning",
    description:
      "Use diagrams and interactive models to observe how quantities such as force, pressure, and wave frequency affect a system. Seeing relationships change makes abstract ideas easier to connect to physical behavior.",
    icon: Waves,
    accent: "text-sky-300",
    iconBackground: "bg-sky-400/10",
    border: "hover:border-sky-300/30",
  },
  {
    title: "Guided Practice",
    description:
      "Follow worked problems from the known values through equation selection, substitution, and unit checks. The guided steps make the reasoning visible so students can apply the same method to new questions.",
    icon: BookOpen,
    accent: "text-violet-300",
    iconBackground: "bg-violet-400/10",
    border: "hover:border-violet-300/30",
  },
  {
    title: "Knowledge Assessment",
    description:
      "Try topic-based questions to find out which ideas are clear and which need another look. Explanations and saved results help learners reflect on mistakes and see their progress over time.",
    icon: CheckCircle2,
    accent: "text-emerald-300",
    iconBackground: "bg-emerald-400/10",
    border: "hover:border-emerald-300/30",
  },
];

const platformFeatures = [
  {
    title: "Interactive Simulations",
    description:
      "Adjust values in a simulation and observe the resulting motion, forces, or fluid behavior. Experimenting with one variable at a time helps reveal how a model’s quantities are related.",
    icon: FlaskConical,
    accent: "text-cyan-300",
    iconBackground: "bg-cyan-400/10",
  },
  {
    title: "Worked Examples",
    description:
      "Review complete solutions that identify the givens, select a suitable relationship, substitute values with units, and check the final result. Use the sequence as a guide while practicing independently.",
    icon: BookOpen,
    accent: "text-violet-300",
    iconBackground: "bg-violet-400/10",
  },
  {
    title: "Quizzes & Saved Progress",
    description:
      "Complete lesson quizzes for immediate feedback, then sign in to save attempts and revisit scores. Passing results mark lessons complete, making it easier to recognize finished topics and choose what to study next.",
    icon: Target,
    accent: "text-sky-300",
    iconBackground: "bg-sky-400/10",
  },
];

export default function AboutPage() {
  return (
    <main className="h-full min-h-0 overflow-y-auto bg-[#080D1B] text-slate-100">
      <div className="flex min-h-full w-full flex-col justify-between gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <section
          aria-labelledby="project-title"
          className="relative isolate w-full border-b border-white/10 pb-4 text-center"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-40 w-full max-w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-cyan-500/[0.08] via-transparent to-violet-500/[0.08] blur-[80px]"
          />
          <div className="relative mx-auto w-full max-w-6xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300 sm:text-xs">
              CALPH++ <span className="mx-1.5 text-slate-600">|</span> ABOUT
              THE PROJECT
            </p>
            <h1
              id="project-title"
              className="mx-auto mt-2 text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl"
            >
              Created by{" "}
              <span className="bg-gradient-to-r from-sky-300 via-cyan-200 to-violet-300 bg-clip-text text-transparent">
                BSIT-3B
              </span>
            </h1>
            <h2 className="mx-auto mt-1 text-base font-bold leading-snug text-slate-100 sm:text-lg lg:text-xl">
              Bringing Technology and Physics Together.
            </h2>
            <div className="mx-auto mt-3 grid max-w-6xl gap-2 text-left text-xs leading-5 text-slate-300 sm:text-sm sm:leading-6 xl:grid-cols-2 xl:gap-6">
              <p>
                Calph++ is an interactive web-based learning platform developed
                by BSIT-3B as a final project for Calculus-based Physics 2. It
                combines information technology and physics education to
                provide students with a more engaging, visual, and interactive
                way to understand challenging concepts. The project is designed
                to make the subject’s mathematical ideas easier to approach by
                connecting equations with clear explanations and observable
                examples.
              </p>
              <p>
                Its lessons bring together concept reviews, practical
                illustrations, guided problem solving, and self-check quizzes.
                Students can explore at their own pace, test how ideas apply in
                different situations, and build confidence using physics rather
                than relying on memorized formulas alone.
              </p>
            </div>
          </div>
        </section>

        <div className="grid w-full gap-4 lg:grid-cols-2">
          <section aria-labelledby="approach-heading" className="flex min-w-0 flex-col">
            <h2
              id="approach-heading"
              className="text-lg font-black tracking-tight sm:text-xl"
            >
              How We Support Learning
            </h2>
            <div className="mt-3 grid flex-1 auto-rows-fr gap-2">
              {learningApproaches.map((approach) => {
                const Icon = approach.icon;

                return (
                  <article
                    key={approach.title}
                    className={`flex h-full items-start gap-3 rounded-xl border border-slate-700/60 ${approach.border} bg-[#10182B] p-3 transition-colors sm:p-4`}
                  >
                    <span
                      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${approach.iconBackground} ${approach.accent}`}
                    >
                      <Icon size={17} aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-100">
                        {approach.title}
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-slate-400 sm:text-sm">
                        {approach.description}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section aria-labelledby="offers-heading" className="flex min-w-0 flex-col">
            <div className="flex flex-wrap items-baseline gap-x-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-300">
                Designed for Discovery
              </p>
              <h2
                id="offers-heading"
                className="text-lg font-black tracking-tight sm:text-xl"
              >
                What Calph++ Offers
              </h2>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-400 sm:text-sm">
              A connected set of learning tools helps students explore a
              concept, practice applying it, and keep track of their progress.
            </p>
            <div className="mt-3 grid flex-1 auto-rows-fr gap-2">
              {platformFeatures.map((feature) => {
                const Icon = feature.icon;

                return (
                  <article
                    key={feature.title}
                    className="flex h-full items-start gap-3 rounded-xl border border-slate-700/60 bg-[#10182B] p-3 transition-colors hover:border-slate-500/70 sm:p-4"
                  >
                    <span
                      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${feature.iconBackground} ${feature.accent}`}
                    >
                      <Icon size={17} aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-100">
                        {feature.title}
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-slate-400 sm:text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>

        <section
          aria-labelledby="contact-heading"
          className="w-full"
        >
          <div className="grid gap-2 rounded-xl border border-cyan-300/15 bg-[#10182B] p-3 sm:gap-4 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center md:p-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-300">
                HAVE QUESTIONS?
              </p>
              <h2
                id="contact-heading"
                className="mt-0.5 text-lg font-black tracking-tight"
              >
                We&apos;re Here to Help.
              </h2>
            </div>
            <div>
              <p className="text-xs leading-5 text-slate-400 sm:text-sm">
                Have a question about a lesson, quiz, or using the platform?
                Send us your feedback or concerns by email, and include enough
                detail for us to understand how we can help.
              </p>
              <a
                href="mailto:s2024100141@firstasia.edu.ph"
                className="mt-1 inline-flex min-h-8 items-center gap-2 text-xs font-semibold text-cyan-200 underline decoration-cyan-200/30 underline-offset-4 transition hover:text-cyan-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300 sm:text-sm"
              >
                <Mail size={14} aria-hidden="true" />
                s2024100141@firstasia.edu.ph
              </a>
            </div>
            <a
              href="mailto:s2024100141@firstasia.edu.ph"
              className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 py-2 text-sm font-bold text-[#080D1B] transition hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
            >
              Contact Us
              <Mail size={15} aria-hidden="true" />
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
