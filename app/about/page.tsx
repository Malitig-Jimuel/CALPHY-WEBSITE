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
    short:
      "Diagrams and interactive models show how force, pressure, and frequency change a system.",
    description:
      "Use diagrams and interactive models to observe how quantities such as force, pressure, and wave frequency affect a system. Seeing relationships change makes abstract ideas easier to connect to physical behavior.",
    icon: Waves,
    accent: "text-sky-300",
    iconBackground: "bg-sky-400/10",
    border: "hover:border-sky-300/30",
  },
  {
    title: "Guided Practice",
    short: "Worked problems show each step, from known values to unit checks.",
    description:
      "Follow worked problems from the known values through equation selection, substitution, and unit checks. The guided steps make the reasoning visible so students can apply the same method to new questions.",
    icon: BookOpen,
    accent: "text-violet-300",
    iconBackground: "bg-violet-400/10",
    border: "hover:border-violet-300/30",
  },
  {
    title: "Knowledge Assessment",
    short:
      "Topic-based questions reveal which ideas are clear and which need review.",
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
    short: "Adjust values and watch motion, forces, or fluid behavior respond.",
    description:
      "Adjust values in a simulation and observe the resulting motion, forces, or fluid behavior. Experimenting with one variable at a time helps reveal how a model’s quantities are related.",
    icon: FlaskConical,
    accent: "text-cyan-300",
    iconBackground: "bg-cyan-400/10",
  },
  {
    title: "Worked Examples",
    short: "Complete solutions: givens, equation, substitution, and result check.",
    description:
      "Review complete solutions that identify the givens, select a suitable relationship, substitute values with units, and check the final result. Use the sequence as a guide while practicing independently.",
    icon: BookOpen,
    accent: "text-violet-300",
    iconBackground: "bg-violet-400/10",
  },
  {
    title: "Quizzes & Saved Progress",
    short:
      "Get instant feedback, then sign in to save scores and track finished lessons.",
    description:
      "Complete lesson quizzes for immediate feedback, then sign in to save attempts and revisit scores. Passing results mark lessons complete, making it easier to recognize finished topics and choose what to study next.",
    icon: Target,
    accent: "text-sky-300",
    iconBackground: "bg-sky-400/10",
  },
];

/* Every size uses min(vh, vw) so text shrinks to fit whichever dimension is
   tighter. The vw part keeps card paragraphs to about 3 lines, and the vh
   part keeps the total height inside one screen. Nothing scrolls. */
const TEXT_INTRO = "text-[clamp(0.65rem,min(1.6vh,1.1vw),1.2rem)] leading-snug";
const TEXT_BODY = "text-[clamp(0.6rem,min(1.5vh,1.1vw),1.15rem)] leading-snug";
const TEXT_CARD_TITLE =
  "text-[clamp(0.72rem,min(2vh,1.5vw),1.5rem)] leading-tight";
const TEXT_SECTION_TITLE =
  "text-[clamp(0.85rem,min(2.6vh,1.9vw),1.8rem)] leading-tight";
const TEXT_LABEL = "text-[clamp(0.5rem,min(1.3vh,0.9vw),0.75rem)]";
const ICON_BOX =
  "h-[clamp(1.5rem,min(4.2vh,3vw),3rem)] w-[clamp(1.5rem,min(4.2vh,3vw),3rem)]";

export default function AboutPage() {
  return (
    <main className="h-[100dvh] w-full overflow-hidden bg-[#080D1B] text-slate-100">
      <div className="mx-auto flex h-full w-full max-w-[1600px] flex-col gap-[1.2vh] px-3 py-[1.2vh] sm:px-6 lg:px-8">

        {/* INTRODUCTION */}
        <section
          aria-labelledby="project-title"
          className="relative isolate shrink-0 border-b border-white/10 pb-[1.2vh] text-center"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-32 w-full max-w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-cyan-500/[0.08] via-transparent to-violet-500/[0.08] blur-[80px]"
          />

          <p
            className={`font-bold uppercase tracking-[0.2em] text-cyan-300 ${TEXT_LABEL}`}
          >
            CALPH++ <span className="mx-1.5 text-slate-600">|</span> ABOUT THE
            PROJECT
          </p>

          <h1
            id="project-title"
            className="mt-0.5 text-[clamp(1.25rem,min(4.2vh,4.5vw),3rem)] font-black leading-tight tracking-tight"
          >
            Created by{" "}
            <span className="bg-gradient-to-r from-sky-300 via-cyan-200 to-violet-300 bg-clip-text text-transparent">
              BSIT-3B
            </span>
          </h1>

          <h2 className="text-[clamp(0.8rem,min(2.4vh,2.6vw),1.5rem)] font-bold leading-tight text-slate-100">
            Bringing Technology and Physics Together.
          </h2>

          <div
            className={`mx-auto mt-[1vh] grid max-w-7xl gap-x-8 gap-y-1 text-left text-slate-300 md:grid-cols-2 ${TEXT_INTRO}`}
          >
            <p>
              Calph++ is an interactive web-based learning platform developed
              by BSIT-3B as a final project for Calculus-based Physics 2. It
              combines information technology and physics education to give
              students a more engaging, visual, and interactive way to
              understand challenging concepts.
              <span className="hidden lg:inline">
                {" "}
                The project connects equations with clear explanations and
                observable examples.
              </span>
            </p>

            <p className="hidden md:block">
              Its lessons bring together concept reviews, practical
              illustrations, guided problem solving, and self-check quizzes.
              Students can explore at their own pace, test how ideas apply in
              different situations, and build confidence using physics rather
              than relying on memorized formulas alone.
            </p>
          </div>
        </section>

        {/* MAIN CONTENT: fills all remaining height */}
        <div className="grid min-h-0 w-full flex-1 grid-cols-2 gap-2 sm:gap-3 lg:gap-5">

          {/* LEARNING APPROACHES */}
          <section
            aria-labelledby="approach-heading"
            className="flex min-h-0 min-w-0 flex-col"
          >
            <div className="mb-[0.8vh] shrink-0">
              <p
                className={`hidden font-bold uppercase tracking-[0.16em] text-cyan-300 lg:block ${TEXT_LABEL}`}
              >
                Built for Understanding
              </p>

              <h2
                id="approach-heading"
                className={`font-black tracking-tight ${TEXT_SECTION_TITLE}`}
              >
                How We Support Learning
              </h2>
            </div>

            <div className="grid min-h-0 flex-1 grid-rows-3 gap-[1vh]">
              {learningApproaches.map((approach) => {
                const Icon = approach.icon;

                return (
                  <article
                    key={approach.title}
                    className={`flex min-h-0 items-center gap-[1.2vw] overflow-hidden rounded-xl border border-slate-700/60 ${approach.border} bg-[#10182B] px-[1.2vw] py-[0.8vh] transition-colors`}
                  >
                    <span
                      className={`inline-flex shrink-0 items-center justify-center rounded-lg ${ICON_BOX} ${approach.iconBackground} ${approach.accent}`}
                    >
                      <Icon className="h-[55%] w-[55%]" aria-hidden="true" />
                    </span>

                    <div className="min-w-0">
                      <h3
                        className={`font-bold text-slate-100 ${TEXT_CARD_TITLE}`}
                      >
                        {approach.title}
                      </h3>
                      <p className={`mt-[0.3vh] text-slate-400 ${TEXT_BODY}`}>
                        <span className="sm:hidden">{approach.short}</span>
                        <span className="hidden sm:inline">
                          {approach.description}
                        </span>
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* PLATFORM FEATURES */}
          <section
            aria-labelledby="offers-heading"
            className="flex min-h-0 min-w-0 flex-col"
          >
            <div className="mb-[0.8vh] shrink-0">
              <p
                className={`hidden font-bold uppercase tracking-[0.16em] text-cyan-300 lg:block ${TEXT_LABEL}`}
              >
                Designed for Discovery
              </p>

              <h2
                id="offers-heading"
                className={`font-black tracking-tight ${TEXT_SECTION_TITLE}`}
              >
                What Calph++ Offers
              </h2>
            </div>

            <div className="grid min-h-0 flex-1 grid-rows-3 gap-[1vh]">
              {platformFeatures.map((feature) => {
                const Icon = feature.icon;

                return (
                  <article
                    key={feature.title}
                    className="flex min-h-0 items-center gap-[1.2vw] overflow-hidden rounded-xl border border-slate-700/60 bg-[#10182B] px-[1.2vw] py-[0.8vh] transition-colors hover:border-slate-500/70"
                  >
                    <span
                      className={`inline-flex shrink-0 items-center justify-center rounded-lg ${ICON_BOX} ${feature.iconBackground} ${feature.accent}`}
                    >
                      <Icon className="h-[55%] w-[55%]" aria-hidden="true" />
                    </span>

                    <div className="min-w-0">
                      <h3
                        className={`font-bold text-slate-100 ${TEXT_CARD_TITLE}`}
                      >
                        {feature.title}
                      </h3>
                      <p className={`mt-[0.3vh] text-slate-400 ${TEXT_BODY}`}>
                        <span className="sm:hidden">{feature.short}</span>
                        <span className="hidden sm:inline">
                          {feature.description}
                        </span>
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>

        {/* ACADEMIC INFORMATION */}
        <section aria-labelledby="project-info-heading" className="shrink-0">
          <div className="rounded-xl border border-slate-700/60 bg-[#10182B] px-3 py-[1vh] sm:px-4">
            <div className="mb-[0.6vh] flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
              <h2
                id="project-info-heading"
                className="text-[clamp(0.7rem,min(1.9vh,1.4vw),1.15rem)] font-black tracking-tight"
              >
                Academic Information
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-[0.6vh] sm:grid-cols-4 sm:gap-4">
              {[
                ["Developed by", "BSIT-3B"],
                ["Subject Instructor", "John Micheal Mendoza"],
                ["Course", "Calculus-based Physics 2"],
                [
                  "Institution",
                  "First Asia Institute of Technology and Humanities",
                ],
              ].map(([label, value]) => (
                <div key={label} className="min-w-0">
                  <p className="text-[clamp(0.55rem,min(1.4vh,1vw),0.8rem)] text-slate-500">
                    {label}
                  </p>
                  <p className="text-[clamp(0.65rem,min(1.7vh,1.2vw),1rem)] font-semibold leading-tight text-slate-100">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section aria-labelledby="contact-heading" className="shrink-0">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-cyan-300/15 bg-[#10182B] px-3 py-[1vh] sm:px-4">
            <div className="min-w-0">
              <p
                className={`font-bold uppercase tracking-[0.16em] text-cyan-300 ${TEXT_LABEL}`}
              >
                HAVE QUESTIONS?
              </p>
              <h2
                id="contact-heading"
                className="text-[clamp(0.85rem,min(2.6vh,1.9vw),1.6rem)] font-black leading-tight tracking-tight"
              >
                We&apos;re Here to Help.
              </h2>
            </div>

            <div className="hidden min-w-0 flex-1 md:block">
              <p className={`text-slate-400 ${TEXT_BODY}`}>
                Questions about a lesson, quiz, or the platform? Email us with
                enough detail for us to help.
              </p>
              <a
                href="mailto:s2024100141@firstasia.edu.ph"
                className={`mt-0.5 inline-flex items-center gap-2 font-semibold text-cyan-200 underline decoration-cyan-200/30 underline-offset-4 transition hover:text-cyan-100 ${TEXT_BODY}`}
              >
                <Mail className="h-[1em] w-[1em]" aria-hidden="true" />
                s2024100141@firstasia.edu.ph
              </a>
            </div>

            <a
              href="mailto:s2024100141@firstasia.edu.ph"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-cyan-300 px-[1.2vw] py-[0.8vh] text-[clamp(0.65rem,min(1.7vh,1.2vw),1rem)] font-bold text-[#080D1B] transition hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
            >
              Contact Us
              <Mail className="h-[1.1em] w-[1.1em]" aria-hidden="true" />
            </a>
          </div>
        </section>

      </div>
    </main>
  );
}