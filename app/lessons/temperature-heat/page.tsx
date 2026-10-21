
"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Flame,
  RotateCcw,
  Thermometer,
  Waves,
  XCircle,
  Zap,
} from "lucide-react";

const questions = [
  {
    question: "Which temperature scale starts at absolute zero?",
    options: ["Celsius", "Fahrenheit", "Kelvin", "All of them"],
    answer: 2,
    explanation:
      "Kelvin begins at absolute zero, the theoretical lowest possible temperature: 0 K.",
  },
  {
    question: "What is the approximate value of 0°C in Kelvin?",
    options: ["0 K", "100 K", "273.15 K", "32 K"],
    answer: 2,
    explanation: "Convert Celsius to Kelvin using K = °C + 273.15. Therefore, 0°C = 273.15 K.",
  },
  {
    question: "Which heat-transfer process can occur through empty space?",
    options: ["Conduction", "Convection", "Radiation", "Conduction and convection only"],
    answer: 2,
    explanation:
      "Radiation transfers energy through electromagnetic waves and does not require a material medium.",
  },
  {
    question: "What is the formula for heat energy when there is no phase change?",
    options: ["Q = mcΔT", "P = F/A", "v = d/t", "F = ma"],
    answer: 0,
    explanation:
      "Q = mcΔT, where m is mass, c is specific heat capacity, and ΔT is the temperature change.",
  },
  {
    question: "How much heat is needed to warm 2 kg of water by 5°C? Use c = 4200 J/(kg·°C).",
    options: ["4,200 J", "21,000 J", "42,000 J", "84,000 J"],
    answer: 2,
    explanation: "Q = mcΔT = 2 × 4200 × 5 = 42,000 J.",
  },
];

const heatMethods = [
  {
    title: "Conduction",
    subtitle: "Transfer through direct contact",
    description:
      "Energy moves between neighboring particles without the material as a whole flowing. Metals are generally good thermal conductors.",
    example: "A metal spoon becomes warm in hot soup.",
    icon: Zap,
    color: "text-orange-300",
    background: "bg-orange-400/10",
  },
  {
    title: "Convection",
    subtitle: "Transfer through fluid movement",
    description:
      "In liquids and gases, warmer, less-dense fluid often rises while cooler, denser fluid sinks, creating circulation.",
    example: "Water circulates as it heats in a pot.",
    icon: Waves,
    color: "text-sky-300",
    background: "bg-sky-400/10",
  },
  {
    title: "Radiation",
    subtitle: "Transfer by electromagnetic waves",
    description:
      "Thermal energy can travel through space as electromagnetic radiation, including infrared radiation.",
    example: "Energy from the Sun warms Earth's surface.",
    icon: Flame,
    color: "text-violet-300",
    background: "bg-violet-400/10",
  },
];

export default function TemperatureHeatPage() {
  const [celsius, setCelsius] = useState(25);
  const [heatMethod, setHeatMethod] = useState(0);
  const [mass, setMass] = useState(1);
  const [specificHeat, setSpecificHeat] = useState(4200);
  const [initialTemp, setInitialTemp] = useState(20);
  const [finalTemp, setFinalTemp] = useState(50);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const kelvin = celsius + 273.15;
  const fahrenheit = (celsius * 9) / 5 + 32;
  const heat = mass * specificHeat * (finalTemp - initialTemp);
  const score = questions.reduce(
    (total, question, index) =>
      total + (answers[index] === question.answer ? 1 : 0),
    0
  );

  function resetQuiz() {
    setAnswers({});
    setSubmitted(false);
  }

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
          <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-orange-300">
            <Thermometer size={18} /> PHYSICS MODULE 03
          </div>
          <h1 className="max-w-4xl text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">
            Temperature <span className="text-orange-300">& Heat</span>
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-400 md:text-lg">
            Understand temperature, explore how heat moves, and calculate thermal
            energy using interactive physics tools.
          </p>
        </motion.header>

        <section className="mb-12 grid gap-4 md:grid-cols-3">
          {[
            { formula: "K = °C + 273.15", title: "Kelvin conversion" },
            { formula: "Q = mcΔT", title: "Thermal energy" },
            { formula: "Heat → cooler object", title: "Natural heat flow" },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-white/10 bg-[#111A2E] p-6"
            >
              <p className="text-sm text-slate-400">{item.title}</p>
              <p className="mt-3 text-xl font-bold text-orange-300">{item.formula}</p>
            </div>
          ))}
        </section>

        <section className="mb-12 grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-white/10 bg-[#111A2E] p-6 md:p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-orange-400/10 p-3 text-orange-300">
                <Thermometer size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold">1. Temperature</h2>
                <p className="mt-1 text-sm text-slate-400">How hot or cold something is</p>
              </div>
            </div>
            <p className="leading-7 text-slate-300">
              Temperature describes the thermal state of a system. Heat, in contrast,
              is energy transferred because of a temperature difference. Heat naturally
              flows from a higher-temperature object to a lower-temperature one.
            </p>
            <div className="mt-5 space-y-3 text-sm leading-6 text-slate-400">
              <p><strong className="text-white">Celsius (°C):</strong> Commonly used in everyday life.</p>
              <p><strong className="text-white">Fahrenheit (°F):</strong> Used in some countries, including the United States.</p>
              <p><strong className="text-white">Kelvin (K):</strong> The SI unit of thermodynamic temperature.</p>
            </div>
            <div className="mt-6 rounded-xl border border-white/10 bg-[#080D1B] p-4">
              <p className="text-sm text-slate-400">Remember</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                A temperature difference of 1°C is equal in size to a difference of 1 K.
                Kelvin temperatures do not use a degree symbol.
              </p>
            </div>
          </article>

          <article className="rounded-3xl border border-white/10 bg-[#111A2E] p-6 md:p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-sky-400/10 p-3 text-sky-300">
                <Waves size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold">2. Heat transfer</h2>
                <p className="mt-1 text-sm text-slate-400">Three ways thermal energy moves</p>
              </div>
            </div>

            <div className="space-y-4">
              {heatMethods.map((method, index) => {
                const Icon = method.icon;
                const active = heatMethod === index;
                return (
                  <button
                    key={method.title}
                    type="button"
                    onClick={() => setHeatMethod(index)}
                    className={`flex w-full items-start gap-4 rounded-xl border p-4 text-left transition ${
                      active
                        ? "border-orange-300/40 bg-white/[0.05]"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className={`rounded-lg p-2 ${method.background} ${method.color}`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{method.title}</p>
                      <p className="mt-1 text-xs text-slate-400">{method.subtitle}</p>
                      {active && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="overflow-hidden"
                        >
                          <p className="mt-3 text-sm leading-6 text-slate-300">
                            {method.description}
                          </p>
                          <p className="mt-2 text-sm text-orange-200">
                            Example: {method.example}
                          </p>
                        </motion.div>
                      )}
                    </div>
                    <ArrowRight size={16} className="mt-1 shrink-0 text-slate-500" />
                  </button>
                );
              })}
            </div>
          </article>
        </section>

        <section className="mb-12 rounded-3xl border border-orange-400/20 bg-[#111A2E] p-6 md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-orange-400/10 p-3 text-orange-300">
              <Thermometer size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold text-orange-300">INTERACTIVE TOOL 01</p>
              <h2 className="mt-1 text-2xl font-bold md:text-3xl">Temperature Converter</h2>
            </div>
          </div>

          <p className="mb-6 leading-7 text-slate-400">
            Move the slider to change the temperature in Celsius. The Fahrenheit and
            Kelvin values update automatically.
          </p>

          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="rounded-2xl border border-white/10 bg-[#080D1B] p-6">
              <div className="mb-4 flex items-center justify-between gap-4">
                <label htmlFor="celsius" className="text-sm text-slate-300">
                  Temperature in Celsius
                </label>
                <span className="text-2xl font-black text-orange-300">{celsius}°C</span>
              </div>
              <input
                id="celsius"
                type="range"
                min="-100"
                max="200"
                step="1"
                value={celsius}
                onChange={(event) => setCelsius(Number(event.target.value))}
                className="w-full accent-orange-400"
              />
              <div className="mt-2 flex justify-between text-xs text-slate-500">
                <span>-100°C</span>
                <span>200°C</span>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-xs text-slate-400">Fahrenheit</p>
                  <p className="mt-2 text-xl font-bold text-sky-300">
                    {fahrenheit.toFixed(2)}°F
                  </p>
                </div>
                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-xs text-slate-400">Kelvin</p>
                  <p className="mt-2 text-xl font-bold text-violet-300">
                    {kelvin.toFixed(2)} K
                  </p>
                </div>
              </div>
            </div>

            <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#080D1B] p-6">
              <motion.div
                animate={{
                  height: `${Math.max(25, Math.min(150, 25 + (celsius + 100) * 0.42))}px`,
                }}
                transition={{ type: "spring", stiffness: 100, damping: 18 }}
                className="relative w-10 rounded-full border-2 border-slate-300 bg-slate-800"
              >
                <motion.div
                  animate={{
                    height: `${Math.max(10, Math.min(135, 10 + (celsius + 100) * 0.4))}px`,
                  }}
                  className="absolute bottom-1 left-1 right-1 rounded-full bg-gradient-to-t from-orange-600 to-yellow-300"
                />
              </motion.div>
              <div className="mt-4 h-4 w-16 rounded-full bg-orange-400 shadow-[0_0_25px_rgba(251,146,60,0.4)]" />
              <p className="mt-5 text-sm text-slate-400">Illustrative thermometer</p>
              <p className="mt-1 text-3xl font-black text-orange-300">{celsius}°C</p>
              <p className="mt-2 text-center text-xs text-slate-500">
                The visual is illustrative, not a calibrated instrument.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12 rounded-3xl border border-violet-400/20 bg-[#111A2E] p-6 md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-violet-400/10 p-3 text-violet-300">
              <Flame size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold text-violet-300">INTERACTIVE TOOL 02</p>
              <h2 className="mt-1 text-2xl font-bold md:text-3xl">Specific Heat Calculator</h2>
            </div>
          </div>

          <p className="mb-6 leading-7 text-slate-400">
            Calculate the thermal energy absorbed or released when an object's temperature
            changes without a phase change.
          </p>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-5 rounded-2xl border border-white/10 bg-[#080D1B] p-5">
              <div>
                <label htmlFor="mass" className="mb-2 block text-sm text-slate-300">
                  Mass: <strong className="text-violet-300">{mass.toFixed(1)} kg</strong>
                </label>
                <input
                  id="mass"
                  type="range"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={mass}
                  onChange={(event) => setMass(Number(event.target.value))}
                  className="w-full accent-violet-400"
                />
              </div>

              <div>
                <label htmlFor="specificHeat" className="mb-2 block text-sm text-slate-300">
                  Material
                </label>
                <select
                  id="specificHeat"
                  value={specificHeat}
                  onChange={(event) => setSpecificHeat(Number(event.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-[#111A2E] px-4 py-3 text-white outline-none focus:border-violet-400"
                >
                  <option value={4200}>Water — 4200 J/(kg·°C)</option>
                  <option value={900}>Aluminum — 900 J/(kg·°C)</option>
                  <option value={450}>Iron/steel — 450 J/(kg·°C)</option>
                  <option value={385}>Copper — 385 J/(kg·°C)</option>
                </select>
              </div>

              <div>
                <label htmlFor="initialTemp" className="mb-2 block text-sm text-slate-300">
                  Initial temperature: <strong>{initialTemp}°C</strong>
                </label>
                <input
                  id="initialTemp"
                  type="range"
                  min="-50"
                  max="100"
                  value={initialTemp}
                  onChange={(event) => setInitialTemp(Number(event.target.value))}
                  className="w-full accent-violet-400"
                />
              </div>

              <div>
                <label htmlFor="finalTemp" className="mb-2 block text-sm text-slate-300">
                  Final temperature: <strong>{finalTemp}°C</strong>
                </label>
                <input
                  id="finalTemp"
                  type="range"
                  min="-50"
                  max="200"
                  value={finalTemp}
                  onChange={(event) => setFinalTemp(Number(event.target.value))}
                  className="w-full accent-violet-400"
                />
              </div>
            </div>

            <div className="flex flex-col justify-center rounded-2xl border border-violet-400/20 bg-[#080D1B] p-6">
              <p className="text-sm text-slate-400">Formula</p>
              <p className="my-3 text-3xl font-black text-violet-300">Q = mcΔT</p>
              <p className="text-sm leading-6 text-slate-400">
                ΔT = {finalTemp} − {initialTemp} = {finalTemp - initialTemp}°C
              </p>
              <div className="mt-6 border-t border-white/10 pt-5">
                <p className="text-sm text-slate-400">
                  {heat > 0 ? "Heat absorbed" : heat < 0 ? "Heat released" : "No net heat transfer"}
                </p>
                <p className={`mt-2 break-words text-3xl font-black ${heat < 0 ? "text-sky-300" : "text-violet-300"}`}>
                  {heat.toLocaleString("en-US", { maximumFractionDigits: 2 })} J
                </p>
                <p className="mt-3 text-xs leading-5 text-slate-500">
                  A positive Q means energy is absorbed; a negative Q means energy is released.
                  This calculation assumes constant specific heat and no phase change.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12 rounded-3xl border border-white/10 bg-[#111A2E] p-6 md:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-emerald-300">CHECK YOUR KNOWLEDGE</p>
              <h2 className="mt-2 text-2xl font-bold md:text-3xl">Temperature & Heat Quiz</h2>
              <p className="mt-2 text-slate-400">
                Answer all five questions to see your score and explanations.
              </p>
            </div>
            {submitted && (
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-3">
                <p className="text-sm text-slate-300">Your score</p>
                <p className="text-2xl font-black text-emerald-300">
                  {score} / {questions.length}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {questions.map((question, index) => (
              <div
                key={question.question}
                className="rounded-2xl border border-white/10 bg-[#080D1B] p-5"
              >
                <p className="font-semibold leading-6">
                  <span className="mr-2 text-orange-300">
                    {String(index + 1).padStart(2, "0")}.
                  </span>
                  {question.question}
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {question.options.map((option, optionIndex) => {
                    const selected = answers[index] === optionIndex;
                    const correct = question.answer === optionIndex;
                    let style =
                      "border-white/10 bg-white/[0.03] hover:border-orange-300/50";
                    if (selected) style = "border-orange-300 bg-orange-300/10";
                    if (submitted && correct)
                      style = "border-emerald-400 bg-emerald-400/10";
                    if (submitted && selected && !correct)
                      style = "border-rose-400 bg-rose-400/10";

                    return (
                      <button
                        key={option}
                        type="button"
                        disabled={submitted}
                        onClick={() =>
                          setAnswers((previous) => ({
                            ...previous,
                            [index]: optionIndex,
                          }))
                        }
                        className={`flex items-center gap-3 rounded-xl border p-4 text-left text-sm transition disabled:cursor-default ${style}`}
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5 text-xs font-bold">
                          {String.fromCharCode(65 + optionIndex)}
                        </span>
                        <span>{option}</span>
                        {submitted && correct && (
                          <CheckCircle2 size={18} className="ml-auto shrink-0 text-emerald-300" />
                        )}
                        {submitted && selected && !correct && (
                          <XCircle size={18} className="ml-auto shrink-0 text-rose-300" />
                        )}
                      </button>
                    );
                  })}
                </div>
                {submitted && (
                  <p className="mt-4 flex gap-2 text-sm leading-6 text-slate-400">
                    <CheckCircle2 size={16} className="mt-1 shrink-0 text-sky-300" />
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
                disabled={Object.keys(answers).length !== questions.length}
                onClick={() => setSubmitted(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-300 px-5 py-3 font-bold text-slate-950 transition hover:bg-orange-200 disabled:cursor-not-allowed disabled:opacity-40"
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
          <div className="flex flex-wrap gap-4">
            <Link
              href="/lessons/fluids"
              className="inline-flex items-center gap-2 text-sky-300 hover:text-sky-200"
            >
              <ArrowLeft size={16} /> Previous: Fluids
            </Link>
            <Link
              href="/#topics"
              className="inline-flex items-center gap-2 text-sky-300 hover:text-sky-200"
            >
              All topics <ArrowRight size={16} />
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
