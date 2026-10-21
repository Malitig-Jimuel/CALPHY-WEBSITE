
"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Droplets,
  RotateCcw,
  Waves,
  Wind,
  XCircle,
} from "lucide-react";

const fluidQuestions = [
  {
    question: "An object has a density of 600 kg/m³ and is placed in water (1000 kg/m³). What happens?",
    options: ["It sinks", "It floats", "It has zero buoyant force", "It disappears"],
    answer: 1,
    explanation:
      "The object is less dense than water, so it floats. Part of the object stays above the surface.",
  },
  {
    question: "What is the SI unit of pressure?",
    options: ["Newton", "Joule", "Pascal", "Watt"],
    answer: 2,
    explanation: "Pressure is force divided by area. Its SI unit is the pascal (Pa), equal to N/m².",
  },
  {
    question: "What does Archimedes' principle state?",
    options: [
      "Pressure is always zero in a liquid",
      "A fluid's temperature never changes",
      "An immersed object experiences an upward force equal to the weight of fluid displaced",
      "Objects in water always float",
    ],
    answer: 2,
    explanation:
      "The buoyant force equals the weight of the fluid displaced by the immersed object.",
  },
  {
    question: "For steady flow of an ideal fluid, where the fluid moves faster, its pressure is generally...",
    options: ["Higher", "Lower", "Always zero", "Unchanged in every situation"],
    answer: 1,
    explanation:
      "Bernoulli's equation links pressure, speed, and height. At the same height, faster flow corresponds to lower pressure under its ideal-flow assumptions.",
  },
  {
    question: "A force of 100 N acts on an area of 2 m². What pressure is produced?",
    options: ["50 Pa", "200 Pa", "102 Pa", "25 Pa"],
    answer: 0,
    explanation: "P = F/A = 100 N / 2 m² = 50 Pa.",
  },
];

export default function FluidsPage() {
  const [objectDensity, setObjectDensity] = useState(600);
  const [fluidDensity, setFluidDensity] = useState(1000);
  const [flowSpeed, setFlowSpeed] = useState(50);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const isFloating = objectDensity < fluidDensity;
  const isSuspended = objectDensity === fluidDensity;
  const score = fluidQuestions.reduce(
    (total, question, index) => total + (answers[index] === question.answer ? 1 : 0),
    0
  );

  const resetQuiz = () => {
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <main className="min-h-screen bg-[#080D1B] text-[#F8FAFC]">
      <nav className="sticky top-0 z-30 border-b border-white/10 bg-[#080D1B]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link href="/" className="text-xl font-black tracking-tight">
            Calph<span className="text-sky-400">++</span>
          </Link>
          <Link
            href="/#topics"
            className="flex items-center gap-2 text-sm text-slate-300 transition hover:text-sky-400"
          >
            <ArrowLeft size={16} /> All topics
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-5 py-10 md:py-16">
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-sky-400">
            <Droplets size={18} /> PHYSICS MODULE 02
          </div>
          <h1 className="max-w-4xl text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">
            Fluids: <span className="text-sky-400">The Science of Flow</span>
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-400 md:text-lg">
            Explore how liquids and gases exert pressure, why objects float or sink,
            and how moving fluids behave.
          </p>
        </motion.header>

        <section className="mb-12 grid gap-4 md:grid-cols-3">
          {[
            { value: "ρ = m / V", label: "Density", detail: "Mass per unit volume" },
            { value: "P = F / A", label: "Pressure", detail: "Force per unit area" },
            { value: "Fᵦ = ρfluid g V", label: "Buoyant force", detail: "Weight of displaced fluid" },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/10 bg-[#111A2E] p-6">
              <p className="text-sm text-slate-400">{item.label}</p>
              <p className="mt-3 text-2xl font-bold text-sky-300">{item.value}</p>
              <p className="mt-2 text-sm text-slate-500">{item.detail}</p>
            </div>
          ))}
        </section>

        <section className="mb-12 grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-white/10 bg-[#111A2E] p-6 md:p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-sky-400/10 p-3 text-sky-300">
                <Droplets size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold">1. Density and buoyancy</h2>
                <p className="mt-1 text-sm text-slate-400">Why things float or sink</p>
              </div>
            </div>
            <p className="mb-5 leading-7 text-slate-300">
              Density tells us how much mass is packed into a given volume. A fluid pushes
              upward on an immersed object; this upward force is called <strong>buoyancy</strong>.
            </p>
            <div className="space-y-3 text-sm leading-6 text-slate-400">
              <p><strong className="text-white">Archimedes’ principle:</strong> The buoyant force equals the weight of the fluid displaced.</p>
              <p><strong className="text-white">Less dense:</strong> An object generally floats.</p>
              <p><strong className="text-white">More dense:</strong> An object generally sinks.</p>
              <p><strong className="text-white">Equal density:</strong> An object can remain suspended when fully immersed.</p>
            </div>
          </article>

          <article className="rounded-3xl border border-white/10 bg-[#111A2E] p-6 md:p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-violet-400/10 p-3 text-violet-300">
                <Waves size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold">2. Pressure in fluids</h2>
                <p className="mt-1 text-sm text-slate-400">Force distributed over an area</p>
              </div>
            </div>
            <p className="mb-5 leading-7 text-slate-300">
              Pressure measures how much perpendicular force acts on each unit of area.
              In a stationary liquid, pressure increases with depth.
            </p>
            <div className="rounded-xl border border-white/10 bg-[#080D1B] p-5">
              <p className="text-sm text-slate-400">Pressure formula</p>
              <p className="my-3 text-3xl font-bold text-violet-300">P = F / A</p>
              <p className="text-sm text-slate-400">
                P = pressure (Pa), F = force (N), A = area (m²)
              </p>
              <div className="mt-5 border-t border-white/10 pt-4">
                <p className="font-semibold text-white">Liquid pressure due to depth</p>
                <p className="my-2 text-xl font-bold text-violet-300">P = ρgh</p>
                <p className="text-sm text-slate-400">
                  Gauge pressure: ρ is fluid density, g is gravitational acceleration, and h is depth.
                </p>
              </div>
            </div>
          </article>
        </section>

        <section className="mb-12 rounded-3xl border border-sky-400/20 bg-[#111A2E] p-6 md:p-8">
          <div className="mb-6">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-sky-400">
              <Waves size={18} /> INTERACTIVE SIMULATION
            </div>
            <h2 className="text-2xl font-bold md:text-3xl">Archimedes’ Principle Lab</h2>
            <p className="mt-2 max-w-3xl leading-7 text-slate-400">
              Change the object's density and the fluid's density. Observe whether the object
              floats, sinks, or remains neutrally buoyant.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-7">
              <div>
                <div className="mb-3 flex justify-between gap-4 text-sm">
                  <label htmlFor="objectDensity" className="text-slate-300">Object density</label>
                  <strong className="text-sky-300">{objectDensity} kg/m³</strong>
                </div>
                <input
                  id="objectDensity"
                  type="range"
                  min="200"
                  max="1600"
                  step="50"
                  value={objectDensity}
                  onChange={(e) => setObjectDensity(Number(e.target.value))}
                  className="w-full accent-sky-400"
                />
              </div>
              <div>
                <div className="mb-3 flex justify-between gap-4 text-sm">
                  <label htmlFor="fluidDensity" className="text-slate-300">Fluid density</label>
                  <strong className="text-sky-300">{fluidDensity} kg/m³</strong>
                </div>
                <input
                  id="fluidDensity"
                  type="range"
                  min="600"
                  max="1400"
                  step="50"
                  value={fluidDensity}
                  onChange={(e) => setFluidDensity(Number(e.target.value))}
                  className="w-full accent-sky-400"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Water is approximately 1000 kg/m³ at room temperature.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#080D1B] p-5">
                <p className="text-sm text-slate-400">Result</p>
                <p className={`mt-2 text-2xl font-bold ${isFloating ? "text-emerald-300" : isSuspended ? "text-amber-300" : "text-rose-300"}`}>
                  {isFloating ? "It floats!" : isSuspended ? "Neutral buoyancy" : "It sinks!"}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Density comparison: {objectDensity} kg/m³ {isFloating ? "<" : isSuspended ? "=" : ">"} {fluidDensity} kg/m³.
                  {isFloating
                    ? " The object is less dense than the fluid."
                    : isSuspended
                    ? " The object and fluid have equal densities."
                    : " The object is denser than the fluid."}
                </p>
              </div>
            </div>

            <div className="relative flex min-h-[330px] items-center justify-center overflow-hidden rounded-2xl border border-sky-300/20 bg-[#080D1B] p-4">
              <div className="absolute inset-x-0 top-[22%] border-t-2 border-sky-300/60" />
              <div className="absolute inset-x-0 top-[22%] bottom-0 bg-sky-500/15" />
              <div className="absolute left-4 top-4 text-xs font-semibold uppercase tracking-widest text-sky-300">Fluid surface</div>
              <motion.div
                animate={{
                  y: isFloating ? -55 : isSuspended ? 5 : 65,
                  rotate: isFloating ? -5 : isSuspended ? 0 : 8,
                }}
                transition={{ type: "spring", stiffness: 90, damping: 13 }}
                className="relative z-10 flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-white/70 bg-violet-400/80 shadow-[0_0_45px_rgba(139,92,246,0.25)]"
              >
                <span className="text-center text-xs font-black text-white">
                  OBJECT<br />{objectDensity}
                </span>
              </motion.div>
              <div className="absolute bottom-4 right-4 text-xs text-slate-400">Fluid: {fluidDensity} kg/m³</div>
            </div>
          </div>
        </section>

        <section className="mb-12 rounded-3xl border border-violet-400/20 bg-[#111A2E] p-6 md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-violet-400/10 p-3 text-violet-300">
              <Wind size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold text-violet-300">3. FLUIDS IN MOTION</p>
              <h2 className="mt-1 text-2xl font-bold md:text-3xl">Bernoulli’s Principle</h2>
            </div>
          </div>
          <p className="mb-6 max-w-3xl leading-7 text-slate-300">
            For steady flow of an ideal, incompressible fluid along a streamline, higher flow
            speed corresponds to lower static pressure when comparing points at the same height.
          </p>
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="rounded-2xl border border-white/10 bg-[#080D1B] p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <label htmlFor="flowSpeed" className="text-sm text-slate-300">Flow speed</label>
                <strong className="text-violet-300">{flowSpeed}%</strong>
              </div>
              <input
                id="flowSpeed"
                type="range"
                min="10"
                max="100"
                value={flowSpeed}
                onChange={(e) => setFlowSpeed(Number(e.target.value))}
                className="w-full accent-violet-400"
              />
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-xs text-slate-400">Relative speed</p>
                  <p className="mt-1 text-xl font-bold text-sky-300">{flowSpeed}%</p>
                </div>
                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-xs text-slate-400">Relative pressure</p>
                  <p className="mt-1 text-xl font-bold text-violet-300">{110 - flowSpeed}%</p>
                </div>
              </div>
              <p className="mt-4 text-xs leading-5 text-slate-500">
                Illustrative relative values only, not measured physical pressure.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#080D1B] p-4">
              <svg viewBox="0 0 420 180" role="img" aria-label="Illustration of fluid flowing through a narrow pipe">
                <defs>
                  <linearGradient id="fluidGradient" x1="0" x2="1">
                    <stop offset="0%" stopColor="#38BDF8" stopOpacity=".25" />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity=".8" />
                  </linearGradient>
                </defs>
                <path d="M10 25 H110 Q150 25 175 65 H245 Q270 25 310 25 H410 V155 H310 Q270 155 245 115 H175 Q150 155 110 155 H10 Z" fill="#17243A" stroke="#64748B" strokeWidth="2" />
                <path d="M10 60 H130 Q160 60 180 78 H240 Q260 60 290 60 H410 V120 H290 Q260 120 240 102 H180 Q160 120 130 120 H10 Z" fill="url(#fluidGradient)" />
                {Array.from({ length: 5 }).map((_, index) => (
                  <motion.path
                    key={index}
                    d={`M${20 + index * 8} 90 H${385 - index * 8}`}
                    stroke="#7DD3FC"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="7 10"
                    animate={{ strokeDashoffset: [0, -34] }}
                    transition={{ duration: Math.max(0.35, 2.2 - flowSpeed / 60), repeat: Infinity, ease: "linear" }}
                  />
                ))}
                <text x="82" y="48" fill="#CBD5E1" fontSize="11" textAnchor="middle">Wider</text>
                <text x="210" y="50" fill="#CBD5E1" fontSize="11" textAnchor="middle">Narrower</text>
                <text x="82" y="145" fill="#7DD3FC" fontSize="11" textAnchor="middle">Slower</text>
                <text x="210" y="145" fill="#C4B5FD" fontSize="11" textAnchor="middle">Faster</text>
              </svg>
              <p className="mt-3 text-center text-xs text-slate-500">
                In a constriction, ideal fluid flow speeds up as the cross-sectional area decreases.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12 rounded-3xl border border-white/10 bg-[#111A2E] p-6 md:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-emerald-300">CHECK YOUR KNOWLEDGE</p>
              <h2 className="mt-2 text-2xl font-bold md:text-3xl">Fluids Quiz</h2>
              <p className="mt-2 text-slate-400">Answer all five questions to check your understanding.</p>
            </div>
            {submitted && (
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-3">
                <p className="text-sm text-slate-300">Your score</p>
                <p className="text-2xl font-black text-emerald-300">{score} / {fluidQuestions.length}</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {fluidQuestions.map((question, index) => (
              <div key={question.question} className="rounded-2xl border border-white/10 bg-[#080D1B] p-5">
                <p className="font-semibold leading-6">
                  <span className="mr-2 text-sky-400">{String(index + 1).padStart(2, "0")}.</span>
                  {question.question}
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {question.options.map((option, optionIndex) => {
                    const selected = answers[index] === optionIndex;
                    const correct = question.answer === optionIndex;
                    let optionStyle = "border-white/10 bg-white/[0.03] hover:border-sky-300/50";
                    if (selected) optionStyle = "border-sky-400 bg-sky-400/10";
                    if (submitted && correct) optionStyle = "border-emerald-400 bg-emerald-400/10";
                    if (submitted && selected && !correct) optionStyle = "border-rose-400 bg-rose-400/10";

                    return (
                      <button
                        key={option}
                        type="button"
                        disabled={submitted}
                        onClick={() => setAnswers((previous) => ({ ...previous, [index]: optionIndex }))}
                        className={`flex items-center gap-3 rounded-xl border p-4 text-left text-sm transition disabled:cursor-default ${optionStyle}`}
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5 text-xs font-bold text-slate-300">
                          {String.fromCharCode(65 + optionIndex)}
                        </span>
                        <span>{option}</span>
                        {submitted && correct && <CheckCircle2 className="ml-auto shrink-0 text-emerald-300" size={18} />}
                        {submitted && selected && !correct && <XCircle className="ml-auto shrink-0 text-rose-300" size={18} />}
                      </button>
                    );
                  })}
                </div>
                {submitted && (
                  <p className="mt-4 flex gap-2 text-sm leading-6 text-slate-400">
                    <CheckCircle2 className="mt-1 shrink-0 text-sky-300" size={16} />
                    {question.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {!submitted ? (
              <button
                type="button"
                disabled={Object.keys(answers).length !== fluidQuestions.length}
                onClick={() => setSubmitted(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-sky-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Submit quiz <ArrowRight size={18} />
              </button>
            ) : (
              <button
                type="button"
                onClick={resetQuiz}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 font-semibold transition hover:bg-white/5"
              >
                <RotateCcw size={18} /> Try again
              </button>
            )}
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-slate-500">
          <p>Calph++ · Learn physics by exploring.</p>
          <Link href="/lessons/measurements-vectors" className="inline-flex items-center gap-2 text-sky-300 hover:text-sky-200">
            Previous lesson <ArrowLeft size={16} />
          </Link>
        </footer>
      </div>
    </main>
  );
}
