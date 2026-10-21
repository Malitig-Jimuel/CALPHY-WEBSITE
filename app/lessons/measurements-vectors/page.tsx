
"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Atom,
  BookOpen,
  CheckCircle2,
  RotateCcw,
  Ruler,
  Sigma,
  Target,
  XCircle,
} from "lucide-react";

const units = [
  { quantity: "Length", symbol: "m", name: "meter", dimension: "[L]" },
  { quantity: "Mass", symbol: "kg", name: "kilogram", dimension: "[M]" },
  { quantity: "Time", symbol: "s", name: "second", dimension: "[T]" },
  {
    quantity: "Temperature",
    symbol: "K",
    name: "kelvin",
    dimension: "[Θ]",
  },
  {
    quantity: "Electric current",
    symbol: "A",
    name: "ampere",
    dimension: "[I]",
  },
  {
    quantity: "Amount of substance",
    symbol: "mol",
    name: "mole",
    dimension: "[N]",
  },
  {
    quantity: "Luminous intensity",
    symbol: "cd",
    name: "candela",
    dimension: "[J]",
  },
];

const quiz = [
  {
    question: "What is the SI unit of force?",
    choices: ["Joule (J)", "Newton (N)", "Watt (W)", "Pascal (Pa)"],
    answer: 1,
    explanation:
      "Force is measured in newtons. From F = ma, its base units are kg·m/s².",
  },
  {
    question: "Which quantity is a vector?",
    choices: ["Mass", "Temperature", "Speed", "Displacement"],
    answer: 3,
    explanation:
      "Displacement has both magnitude and direction, so it is a vector.",
  },
  {
    question: "What is the dimensional formula of velocity?",
    choices: ["[LT⁻¹]", "[LT⁻²]", "[MLT⁻¹]", "[L²T⁻¹]"],
    answer: 0,
    explanation:
      "Velocity = displacement / time, so its dimension is [L]/[T] = [LT⁻¹].",
  },
  {
    question: "A 3 m vector points east and a 4 m vector points east. What is their resultant?",
    choices: ["1 m east", "7 m east", "5 m east", "12 m east"],
    answer: 1,
    explanation:
      "Parallel vectors pointing in the same direction add: 3 + 4 = 7 m east.",
  },
  {
    question: "Which equation is dimensionally consistent?",
    choices: ["distance = speed + time", "v = at", "force = mass + acceleration", "speed = distance × time"],
    answer: 1,
    explanation:
      "Acceleration multiplied by time has units (m/s²)(s) = m/s, which matches velocity.",
  },
];

export default function MeasurementsVectorsPage() {
  const [magnitudeA, setMagnitudeA] = useState(8);
  const [angleA, setAngleA] = useState(30);
  const [magnitudeB, setMagnitudeB] = useState(6);
  const [angleB, setAngleB] = useState(120);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const ax = magnitudeA * Math.cos(toRadians(angleA));
  const ay = magnitudeA * Math.sin(toRadians(angleA));
  const bx = magnitudeB * Math.cos(toRadians(angleB));
  const by = magnitudeB * Math.sin(toRadians(angleB));

  const rx = ax + bx;
  const ry = ay + by;
  const resultant = Math.sqrt(rx * rx + ry * ry);
  const resultantAngle =
    ((Math.atan2(ry, rx) * 180) / Math.PI + 360) % 360;

  const score = quiz.reduce(
    (total, item, index) =>
      total + (answers[index] === item.answer ? 1 : 0),
    0
  );

  const graphCenter = 180;
  const scale = 5.5;
  const pointA = {
    x: graphCenter + ax * scale,
    y: graphCenter - ay * scale,
  };
  const pointB = {
    x: graphCenter + bx * scale,
    y: graphCenter - by * scale,
  };
  const pointR = {
    x: graphCenter + rx * scale,
    y: graphCenter - ry * scale,
  };

  function resetSimulator() {
    setMagnitudeA(8);
    setAngleA(30);
    setMagnitudeB(6);
    setAngleB(120);
  }

  return (
    <main className="min-h-screen bg-[#080D1B] text-slate-100">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#080D1B]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="rounded-xl bg-sky-400 p-2 text-slate-950">
              <Atom size={24} />
            </div>
            <span className="text-xl font-black">
              Calph<span className="text-sky-400">++</span>
            </span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to home
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
          <div className="flex items-center gap-2 text-sm font-semibold text-sky-400">
            <BookOpen size={16} />
            PHYSICS MODULE 01
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 max-w-3xl text-4xl font-black tracking-tight sm:text-6xl"
          >
            Measurements
            <br />
            <span className="text-sky-400">& Vectors</span>
          </motion.h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            Learn how physicists measure the world, describe quantities, and
            combine vectors. Explore the concepts, experiment with the
            simulator, and test what you know.
          </p>

          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-sky-300">
              <Ruler className="mr-2 inline" size={15} />
              SI units
            </span>
            <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-violet-300">
              <Sigma className="mr-2 inline" size={15} />
              Dimensional analysis
            </span>
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-emerald-300">
              <Target className="mr-2 inline" size={15} />
              Vector simulation
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="h-fit rounded-2xl border border-white/10 bg-[#10182B] p-5 lg:sticky lg:top-24">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
            On this page
          </p>
          <nav className="mt-4 space-y-2 text-sm">
            <a href="#measurements" className="block rounded-lg px-3 py-2 text-slate-300 hover:bg-white/5 hover:text-sky-300">
              01. Measurements
            </a>
            <a href="#dimensions" className="block rounded-lg px-3 py-2 text-slate-300 hover:bg-white/5 hover:text-sky-300">
              02. Dimensional analysis
            </a>
            <a href="#vectors" className="block rounded-lg px-3 py-2 text-slate-300 hover:bg-white/5 hover:text-sky-300">
              03. Vector simulator
            </a>
            <a href="#quiz" className="block rounded-lg px-3 py-2 text-slate-300 hover:bg-white/5 hover:text-sky-300">
              04. Knowledge check
            </a>
          </nav>
          <div className="mt-6 rounded-xl bg-sky-400/10 p-4">
            <p className="text-sm font-bold text-sky-300">Learning tip</p>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              Experiment with the vector angles before taking the quiz.
              Observe how direction changes the resultant.
            </p>
          </div>
        </aside>

        <div className="min-w-0 space-y-10">
          <section id="measurements" className="scroll-mt-28">
            <SectionHeading
              number="01"
              title="Measurements & SI Units"
              subtitle="Every measurement needs a numerical value and a unit."
            />

            <div className="mt-5 rounded-2xl border border-white/10 bg-[#10182B] p-6">
              <p className="leading-7 text-slate-300">
                A physical quantity describes something that can be measured.
                For example, 5 meters describes a length: <strong>5</strong> is
                the numerical value and <strong>meter</strong> is the unit.
                Scientists use the International System of Units (SI) so
                measurements can be communicated consistently.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  ["Scalar", "Magnitude only", "Mass, time, temperature"],
                  ["Vector", "Magnitude and direction", "Displacement, velocity, force"],
                ].map(([name, meaning, examples]) => (
                  <div
                    key={name}
                    className="rounded-xl border border-white/10 bg-[#080D1B] p-4"
                  >
                    <p className="font-bold text-sky-300">{name}</p>
                    <p className="mt-2 text-sm text-slate-200">{meaning}</p>
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      {examples}
                    </p>
                  </div>
                ))}
              </div>

              <h3 className="mt-8 text-lg font-bold">The 7 SI base units</h3>
              <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full min-w-[460px] text-left text-sm">
                  <thead className="bg-white/5 text-slate-400">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Quantity</th>
                      <th className="px-4 py-3 font-semibold">Unit</th>
                      <th className="px-4 py-3 font-semibold">Symbol</th>
                    </tr>
                  </thead>
                  <tbody>
                    {units.map((unit) => (
                      <tr key={unit.symbol} className="border-t border-white/5">
                        <td className="px-4 py-3 text-slate-200">{unit.quantity}</td>
                        <td className="px-4 py-3 text-slate-400">{unit.name}</td>
                        <td className="px-4 py-3 font-mono font-bold text-sky-300">{unit.symbol}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-5 rounded-xl border border-sky-400/20 bg-sky-400/5 p-4 text-sm leading-6 text-slate-300">
                <strong className="text-sky-300">Derived units:</strong>{" "}
                Speed is measured in m/s, force in newtons (N), and energy in
                joules (J). Derived units are combinations of base units.
              </div>
            </div>
          </section>

          <section id="dimensions" className="scroll-mt-28">
            <SectionHeading
              number="02"
              title="Dimensional Analysis"
              subtitle="Use dimensions to check whether a physical equation makes sense."
            />

            <div className="mt-5 rounded-2xl border border-white/10 bg-[#10182B] p-6">
              <p className="leading-7 text-slate-300">
                Dimensional analysis represents quantities using base
                dimensions such as length [L], mass [M], and time [T]. In a
                physically consistent equation, both sides must have the same
                dimensions, and you can only add quantities with matching
                dimensions.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-300">
                    Consistent
                  </p>
                  <p className="mt-3 font-mono text-lg text-white">v = u + at</p>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    Each term has dimensions of velocity, [LT⁻¹].
                  </p>
                </div>
                <div className="rounded-xl border border-rose-400/20 bg-rose-400/5 p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-rose-300">
                    Inconsistent
                  </p>
                  <p className="mt-3 font-mono text-lg text-white">d = v + t</p>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    Distance [L] cannot equal velocity [LT⁻¹] plus time [T].
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-xl bg-[#080D1B] p-5">
                <p className="font-bold text-slate-100">Try this example</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Check the equation d = vt. Velocity has units m/s and time
                  has units s, so (m/s)(s) = m. The right side has the same
                  dimension as distance. The equation is dimensionally
                  consistent.
                </p>
              </div>
            </div>
          </section>

          <section id="vectors" className="scroll-mt-28">
            <SectionHeading
              number="03"
              title="Interactive Vector Simulator"
              subtitle="Change the magnitude and direction of two vectors to see their resultant."
            />

            <div className="mt-5 rounded-2xl border border-white/10 bg-[#10182B] p-5 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold">Vector addition</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Angles are measured counterclockwise from the positive x-axis.
                  </p>
                </div>
                <button
                  onClick={resetSimulator}
                  className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-white/5"
                >
                  <RotateCcw size={14} />
                  Reset
                </button>
              </div>

              <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <div className="space-y-5">
                  <VectorControl
                    label="Vector A"
                    color="text-sky-300"
                    magnitude={magnitudeA}
                    angle={angleA}
                    onMagnitudeChange={setMagnitudeA}
                    onAngleChange={setAngleA}
                  />
                  <VectorControl
                    label="Vector B"
                    color="text-violet-300"
                    magnitude={magnitudeB}
                    angle={angleB}
                    onMagnitudeChange={setMagnitudeB}
                    onAngleChange={setAngleB}
                  />
                </div>

                <div className="overflow-hidden rounded-xl border border-white/10 bg-[#080D1B] p-2 sm:p-4">
                  <svg
                    viewBox="0 0 360 360"
                    role="img"
                    aria-label="Vector addition diagram showing vectors A, B, and their resultant R"
                    className="w-full"
                  >
                    {Array.from({ length: 13 }, (_, i) => {
                      const pos = 30 + i * 25;
                      return (
                        <g key={i}>
                          <line x1={pos} y1="30" x2={pos} y2="330" stroke="#243149" strokeWidth="0.7" />
                          <line x1="30" y1={pos} x2="330" y2={pos} stroke="#243149" strokeWidth="0.7" />
                        </g>
                      );
                    })}

                    <line x1="25" y1={graphCenter} x2="337" y2={graphCenter} stroke="#64748b" strokeWidth="1.2" />
                    <line x1={graphCenter} y1="335" x2={graphCenter} y2="23" stroke="#64748b" strokeWidth="1.2" />
                    <text x="338" y={graphCenter - 7} fill="#94a3b8" fontSize="11">+x</text>
                    <text x={graphCenter + 7} y="22" fill="#94a3b8" fontSize="11">+y</text>

                    <defs>
                      <marker id="arrowA" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
                        <path d="M0,0 L6,3 L0,6 Z" fill="#38BDF8" />
                      </marker>
                      <marker id="arrowB" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
                        <path d="M0,0 L6,3 L0,6 Z" fill="#A78BFA" />
                      </marker>
                      <marker id="arrowR" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
                        <path d="M0,0 L6,3 L0,6 Z" fill="#34D399" />
                      </marker>
                    </defs>

                    <line
                      x1={graphCenter}
                      y1={graphCenter}
                      x2={pointA.x}
                      y2={pointA.y}
                      stroke="#38BDF8"
                      strokeWidth="3"
                      markerEnd="url(#arrowA)"
                    />
                    <line
                      x1={graphCenter}
                      y1={graphCenter}
                      x2={pointB.x}
                      y2={pointB.y}
                      stroke="#A78BFA"
                      strokeWidth="3"
                      markerEnd="url(#arrowB)"
                    />
                    <line
                      x1={graphCenter}
                      y1={graphCenter}
                      x2={pointR.x}
                      y2={pointR.y}
                      stroke="#34D399"
                      strokeWidth="3"
                      markerEnd="url(#arrowR)"
                    />

                    <text x={pointA.x + 7} y={pointA.y - 7} fill="#38BDF8" fontSize="12" fontWeight="bold">A</text>
                    <text x={pointB.x + 7} y={pointB.y - 7} fill="#A78BFA" fontSize="12" fontWeight="bold">B</text>
                    <text x={pointR.x + 7} y={pointR.y - 7} fill="#34D399" fontSize="12" fontWeight="bold">R</text>
                    <circle cx={graphCenter} cy={graphCenter} r="3" fill="white" />
                  </svg>

                  <div className="flex flex-wrap justify-center gap-4 pb-2 text-xs">
                    <span className="text-sky-300">━ A</span>
                    <span className="text-violet-300">━ B</span>
                    <span className="text-emerald-300">━ Resultant R</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <ResultCard label="Rₓ" value={`${rx.toFixed(2)} m`} />
                <ResultCard label="Rᵧ" value={`${ry.toFixed(2)} m`} />
                <ResultCard label="Magnitude |R|" value={`${resultant.toFixed(2)} m`} />
                <ResultCard label="Direction θ" value={`${resultantAngle.toFixed(1)}°`} />
              </div>

              <div className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4 text-sm leading-6 text-slate-300">
                <strong className="text-emerald-300">What is happening?</strong>{" "}
                The simulator resolves each vector into horizontal and vertical
                components, adds the components, and calculates the resultant
                magnitude and direction. Try making the vectors point in
                opposite directions and observe how the resultant changes.
              </div>
            </div>
          </section>

          <section id="quiz" className="scroll-mt-28">
            <SectionHeading
              number="04"
              title="Knowledge Check"
              subtitle="Test your understanding of units, dimensions, and vectors."
            />

            <div className="mt-5 rounded-2xl border border-white/10 bg-[#10182B] p-5 sm:p-7">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-400">
                  {Object.keys(answers).length} of {quiz.length} answered
                </p>
                <p className="text-sm font-semibold text-sky-300">
                  {quiz.length} questions
                </p>
              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-sky-400 transition-all"
                  style={{ width: `${(Object.keys(answers).length / quiz.length) * 100}%` }}
                />
              </div>

              <div className="mt-7 space-y-8">
                {quiz.map((item, index) => (
                  <div key={item.question}>
                    <p className="font-semibold leading-6">
                      <span className="mr-2 text-sky-400">{String(index + 1).padStart(2, "0")}.</span>
                      {item.question}
                    </p>

                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {item.choices.map((choice, choiceIndex) => {
                        const selected = answers[index] === choiceIndex;
                        const correct = item.answer === choiceIndex;
                        const showResult = submitted;

                        let choiceStyle =
                          "border-white/10 bg-[#080D1B] hover:border-sky-400/40";

                        if (selected && !submitted) {
                          choiceStyle = "border-sky-400 bg-sky-400/10";
                        } else if (showResult && correct) {
                          choiceStyle = "border-emerald-400/50 bg-emerald-400/10";
                        } else if (showResult && selected && !correct) {
                          choiceStyle = "border-rose-400/50 bg-rose-400/10";
                        }

                        return (
                          <button
                            key={choice}
                            disabled={submitted}
                            onClick={() =>
                              setAnswers((previous) => ({
                                ...previous,
                                [index]: choiceIndex,
                              }))
                            }
                            className={`flex items-center justify-between gap-3 rounded-xl border p-3 text-left text-sm transition ${choiceStyle}`}
                          >
                            <span>{choice}</span>
                            {showResult && correct && (
                              <CheckCircle2 className="shrink-0 text-emerald-400" size={17} />
                            )}
                            {showResult && selected && !correct && (
                              <XCircle className="shrink-0 text-rose-400" size={17} />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {submitted && (
                      <p className="mt-3 rounded-lg bg-white/5 p-3 text-sm leading-6 text-slate-400">
                        {item.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {submitted ? (
                <div className="mt-8 rounded-xl border border-sky-400/20 bg-sky-400/5 p-5">
                  <p className="text-sm font-semibold text-sky-300">Your result</p>
                  <p className="mt-2 text-3xl font-black">
                    {score} / {quiz.length}
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    {score === quiz.length
                      ? "Excellent! You answered every question correctly."
                      : "Review the explanations above, then try again to improve your score."}
                  </p>
                  <button
                    onClick={() => {
                      setAnswers({});
                      setSubmitted(false);
                    }}
                    className="mt-5 flex items-center gap-2 rounded-xl bg-sky-400 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-sky-300"
                  >
                    <RotateCcw size={16} />
                    Try again
                  </button>
                </div>
              ) : (
                <button
                  disabled={Object.keys(answers).length !== quiz.length}
                  onClick={() => setSubmitted(true)}
                  className="mt-8 w-full rounded-xl bg-sky-400 px-5 py-3.5 font-bold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Check my answers
                </button>
              )}
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-7">
            <p className="text-sm text-slate-500">
              Module 01 · Measurements & Vectors
            </p>
            <Link
              href="/"
              className="rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold hover:bg-white/5"
            >
              Back to all topics
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function SectionHeading({
  number,
  title,
  subtitle,
}: {
  number: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-sky-400">
        SECTION {number}
      </p>
      <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">{subtitle}</p>
    </div>
  );
}

function VectorControl({
  label,
  color,
  magnitude,
  angle,
  onMagnitudeChange,
  onAngleChange,
}: {
  label: string;
  color: string;
  magnitude: number;
  angle: number;
  onMagnitudeChange: (value: number) => void;
  onAngleChange: (value: number) => void;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#080D1B] p-4">
      <div className="flex items-center justify-between gap-3">
        <h4 className={`font-bold ${color}`}>{label}</h4>
        <span className="font-mono text-sm text-white">
          {magnitude} m · {angle}°
        </span>
      </div>

      <label className="mt-5 flex items-center justify-between text-sm text-slate-400">
        Magnitude
        <span>{magnitude} m</span>
      </label>
      <input
        type="range"
        min="0"
        max="20"
        step="1"
        value={magnitude}
        onChange={(event) => onMagnitudeChange(Number(event.target.value))}
        className="mt-3 w-full accent-sky-400"
      />

      <label className="mt-5 flex items-center justify-between text-sm text-slate-400">
        Direction
        <span>{angle}°</span>
      </label>
      <input
        type="range"
        min="0"
        max="359"
        step="1"
        value={angle}
        onChange={(event) => onAngleChange(Number(event.target.value))}
        className="mt-3 w-full accent-violet-400"
      />
    </div>
  );
}

function ResultCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#080D1B] p-3 sm:p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-2 break-words font-mono text-sm font-bold text-emerald-300 sm:text-base">
        {value}
      </p>
    </div>
  );
}
