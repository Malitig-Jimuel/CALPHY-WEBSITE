"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CircleDot,
  Flame,
  Gauge,
  RotateCcw,
  Ruler,
  Thermometer,
  XCircle,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Content based on: PHYSICS 2 LEC 04 – Temperature and Heat (PPT)    */
/* ------------------------------------------------------------------ */

const questions = [
  {
    question: "According to the lecture, temperature is a measure of the ______ of the atoms or molecules in a substance.",
    options: [
      "total mass",
      "average kinetic energy",
      "total potential energy",
      "volume",
    ],
    answer: 1,
    explanation:
      "Temperature is a measure of the average kinetic energy of the atoms or molecules in a substance.",
  },
  {
    question: "Which statement best describes heat?",
    options: [
      "The amount of temperature stored inside an object",
      "A measure of how cold a substance is",
      "Energy that flows from a higher-temperature object to a lower-temperature object because of the temperature difference",
      "The average speed of molecules in a gas only",
    ],
    answer: 2,
    explanation:
      "Heat is energy that flows from a higher-temperature object to a lower-temperature object because of the difference in temperatures. Its SI unit is the joule (J).",
  },
  {
    question: "Which statement agrees with the lecture's note about heat?",
    options: [
      "A hot object stores a large amount of heat",
      "Nothing can be said to have heat or store heat; heat flows from one place to another",
      "Cold objects contain no energy at all",
      "Heat is created whenever temperature is measured",
    ],
    answer: 1,
    explanation:
      "The word “heat” only refers to the energy actually in transit from hot to cold. Objects have internal energy; heat is the flow.",
  },
  {
    question: "A system is in thermal equilibrium when…",
    options: [
      "its temperature is exactly 0°C",
      "its mass stops changing",
      "all of its parts have the same volume",
      "the net exchange of internal energy is zero, so no heat flows between regions",
    ],
    answer: 3,
    explanation:
      "If no heat flows from one region to another (net exchange of internal energy is zero), the whole system is in thermal equilibrium.",
  },
  {
    question: "On the Celsius scale, the ice point and the steam point of water are at…",
    options: ["0°C and 100°C", "32°C and 212°C", "0°C and 273.15°C", "−273.15°C and 0°C"],
    answer: 0,
    explanation:
      "The ice (freezing) point of water is 0°C and the steam (boiling) point is 100°C. The Celsius scale was formerly called the centigrade scale.",
  },
  {
    question: "A healthy person has an oral temperature of 98.6°F. What is this on the Celsius scale?",
    options: ["35°C", "36°C", "37°C", "38°C"],
    answer: 2,
    explanation: "TC = 5/9 (TF − 32) = 5/9 (98.6 − 32) = 37°C.",
  },
  {
    question: "A bank sign shows an outdoor temperature of −20.0°C. What is this in Fahrenheit?",
    options: ["−68°F", "−4°F", "4°F", "12°F"],
    answer: 1,
    explanation: "TF = 9/5 TC + 32 = 9/5 (−20.0) + 32 = −36 + 32 = −4°F.",
  },
  {
    question: "Which equation converts Celsius to Fahrenheit?",
    options: [
      "TF = 5/9 TC + 32",
      "TF = TC + 273.15",
      "TF = 9/5 TC + 32",
      "TF = 9/5 (TC − 32)",
    ],
    answer: 2,
    explanation:
      "Celsius to Fahrenheit: TF = 9/5 TC + 32. Fahrenheit to Celsius: TC = 5/9 (TF − 32).",
  },
  {
    question: "What is 100°C on the Kelvin scale?",
    options: ["100 K", "173.15 K", "273.15 K", "373.15 K"],
    answer: 3,
    explanation: "TK = TC + 273.15 = 100 + 273.15 = 373.15 K (the steam point of water).",
  },
  {
    question: "What is absolute zero (0 K) in degrees Celsius?",
    options: ["−273.15°C", "−100°C", "0°C", "−32°C"],
    answer: 0,
    explanation:
      "From TK = TC + 273.15, 0 K corresponds to TC = −273.15°C. It is the lowest point of the Kelvin scale.",
  },
  {
    question: "A property that changes with temperature, which thermometers use to measure temperature, is called a…",
    options: [
      "thermal equilibrium",
      "specific heat",
      "thermometric property",
      "expansion coefficient",
    ],
    answer: 2,
    explanation:
      "All thermometers make use of the change in some physical property with temperature. That property is called a thermometric property.",
  },
  {
    question: "Which equation gives the change in length of a solid when its temperature changes by ΔT?",
    options: ["ΔL = αL₀ΔT", "Q = mcΔT", "ΔL = L₀ / αΔT", "TK = TC + 273.15"],
    answer: 0,
    explanation:
      "Linear thermal expansion: ΔL = αL₀ΔT, where α is the coefficient of linear expansion, L₀ is the original length, and ΔT is the temperature change.",
  },
  {
    question: "What happens to a hole in a piece of solid material when the material is heated?",
    options: [
      "It shrinks, because the surrounding material expands inward",
      "It stays exactly the same size",
      "It expands, just as if it were filled with the surrounding material",
      "It disappears",
    ],
    answer: 2,
    explanation:
      "A hole expands when heated and contracts when cooled, just as if it were filled with the material that surrounds it.",
  },
  {
    question:
      "A gold ring has an inner diameter of 1.5 × 10⁻² m at 27°C and falls into hot water at 49°C. With α = 14 × 10⁻⁶ (C°)⁻¹, what is the change in the diameter of the hole?",
    options: ["0.462 μm", "1.50 μm", "4.62 μm", "46.2 μm"],
    answer: 2,
    explanation:
      "ΔD = αD₀ΔT = (14 × 10⁻⁶)(1.5 × 10⁻²)(49 − 27) = 4.62 × 10⁻⁶ m = 4.62 μm.",
  },
  {
    question: "In Q = mcΔT, what does c stand for?",
    options: [
      "The speed of light",
      "The specific heat capacity of the substance",
      "The change in temperature",
      "The coefficient of linear expansion",
    ],
    answer: 1,
    explanation:
      "c is the specific heat capacity: the amount of heat per unit mass required to raise the temperature by one degree Celsius.",
  },
  {
    question: "According to the lecture, what is the specific heat of water?",
    options: ["2 000 J/(kg·°C)", "2 020 J/(kg·°C)", "3 500 J/(kg·°C)", "4 186 J/(kg·°C)"],
    answer: 3,
    explanation:
      "Water: 4 186 J/(kg·°C). Ice: 2 000 J/(kg·°C). Steam: 2 020 J/(kg·°C).",
  },
  {
    question: "When the temperature of a substance decreases, what are the signs of ΔT and Q?",
    options: [
      "Both negative; energy flows out of the system",
      "Both positive; energy flows into the system",
      "ΔT negative, Q positive",
      "ΔT positive, Q negative",
    ],
    answer: 0,
    explanation:
      "When temperature increases, ΔT and Q are positive (energy flows into the system). When it decreases, ΔT and Q are negative (energy flows out).",
  },
  {
    question: "What is the energy required to raise the temperature of 0.500 kg of water by 3.00°C? (c = 4 186 J/(kg·°C))",
    options: ["1 256 J", "4 186 J", "12 558 J", "6 279 J"],
    answer: 3,
    explanation: "Q = mcΔT = (0.500)(4 186)(3.00) = 6 279 J.",
  },
  {
    question:
      "A 65-kg jogger generates 8.0 × 10⁵ J of heat in a half hour. If the heat were not removed, by how much would the body temperature increase? (c = 3 500 J/(kg·C°))",
    options: ["0.35°C", "3.52°C", "35.2°C", "352°C"],
    answer: 1,
    explanation:
      "ΔT = Q / (mc) = 8.0 × 10⁵ / (65 × 3 500) = 3.52°C.",
  },
  {
    question: "Which is the correct value of the calorie in joules?",
    options: ["1 cal = 4.186 J", "1 cal = 418.6 J", "1 cal = 1 J", "1 cal = 0.4186 J"],
    answer: 0,
    explanation:
      "One calorie is the energy needed to raise the temperature of 1 gram of water by 1 Celsius degree: 1 cal = 4.186 J. (The British thermal unit, Btu, is for 1 pound of water by 1 Fahrenheit degree.)",
  },
];

const keyIdeas = [
  {
    title: "Thermometer",
    subtitle: "A device that measures temperature",
    description:
      "Thermometers are devices used to measure the temperature of an object or a system. All thermometers make use of the change in some physical property with temperature. A property that changes with temperature is called a thermometric property.",
    example: "The liquid in a thermometer changes its volume as the temperature changes.",
    icon: Gauge,
    color: "text-orange-300",
    background: "bg-orange-400/10",
  },
  {
    title: "Linear Thermal Expansion",
    subtitle: "ΔL = αL₀ΔT",
    description:
      "The increase in any dimension of a solid is called linear expansion, linear in the sense that the expansion occurs along a line. The length L₀ of an object changes by ΔL when its temperature changes by ΔT. α is the coefficient of linear expansion, with common unit 1/C° or (C°)⁻¹.",
    example: "A rod that is heated by ΔT gets longer by ΔL.",
    icon: Ruler,
    color: "text-sky-300",
    background: "bg-sky-400/10",
  },
  {
    title: "Expansion of a Hole",
    subtitle: "Holes expand when heated",
    description:
      "A hole in a piece of solid material expands when heated and contracts when cooled, just as if it were filled with the material that surrounds it.",
    example: "The hole in a gold ring gets slightly bigger when the ring is dropped in hot water.",
    icon: CircleDot,
    color: "text-violet-300",
    background: "bg-violet-400/10",
  },
];

// Specific heat capacities from the lecture, J/(kg·°C)
const materials = [
  { label: "Water", value: 4186 },
  { label: "Ice", value: 2000 },
  { label: "Steam", value: 2020 },
  { label: "Human body (jogger example)", value: 3500 },
];

// Coefficients of linear expansion α, in (C°)⁻¹, from Table 12.1 in the lecture (× 10⁻⁶)
const expansionMaterials = [
  { label: "Aluminum", alpha: 23 },
  { label: "Brass", alpha: 19 },
  { label: "Concrete", alpha: 12 },
  { label: "Copper", alpha: 17 },
  { label: "Glass (common)", alpha: 8.5 },
  { label: "Glass (Pyrex)", alpha: 3.3 },
  { label: "Gold", alpha: 14 },
  { label: "Iron or steel", alpha: 12 },
  { label: "Lead", alpha: 29 },
  { label: "Nickel", alpha: 13 },
  { label: "Quartz (fused)", alpha: 0.5 },
  { label: "Silver", alpha: 19 },
];

const examples = [
  {
    title: "Example 1: Fahrenheit to Celsius",
    problem:
      "A healthy person has an oral temperature of 98.6°F. What would this reading be on the Celsius scale?",
    steps: ["TC = 5/9 (TF − 32)", "TC = 5/9 (98.6 − 32)"],
    answer: "TC = 37°C",
  },
  {
    title: "Example 2: Celsius to Fahrenheit",
    problem:
      "A time and temperature sign on a bank indicates that the outdoor temperature is −20.0°C. Find the corresponding temperature on the Fahrenheit scale.",
    steps: ["TF = 9/5 TC + 32", "TF = 9/5 (−20.0) + 32"],
    answer: "TF = −4°F",
  },
  {
    title: "Example 3: Gold engagement ring",
    problem:
      "A gold engagement ring has an inner diameter of 1.5 × 10⁻² m and a temperature of 27°C. The ring falls into a sink of hot water whose temperature is 49°C. What is the change in the diameter of the hole in the ring?",
    steps: [
      "Given: D₀ = 1.5 × 10⁻² m, T₀ = 27°C, Tf = 49°C, α(gold) = 14 × 10⁻⁶ (C°)⁻¹",
      "ΔD = αD₀ΔT",
      "ΔD = (14 × 10⁻⁶)(1.5 × 10⁻²)(49 − 27)",
    ],
    answer: "ΔD = 4.62 μm",
  },
  {
    title: "Example 4: Heating water",
    problem: "What is the energy required to raise the temperature of 0.500 kg of water by 3.00°C?",
    steps: ["Given: m = 0.500 kg, c(water) = 4186 J/(kg·°C), ΔT = 3.00°C", "Q = mcΔT = (0.500)(4186)(3.00)"],
    answer: "Q = 6 279 J",
  },
  {
    title: "Example 5: The jogger",
    problem:
      "In a half hour, a 65-kg jogger can generate 8.0 × 10⁵ J of heat. If the heat were not removed, how much would the jogger's body temperature increase? (c = 3500 J/(kg·C°))",
    steps: ["Given: m = 65 kg, Q = 8.0 × 10⁵ J, c = 3500 J/(kg·C°)", "Q = mcΔT, so ΔT = Q / (mc)", "ΔT = 8.0 × 10⁵ / (65 × 3500)"],
    answer: "ΔT = 3.52°C",
  },
];

export default function TemperatureHeatPage() {
  // Temperature converter
  const [celsius, setCelsius] = useState(25);
  const [fahrenheitInput, setFahrenheitInput] = useState(98.6);

  // Key ideas accordion
  const [activeIdea, setActiveIdea] = useState(0);

  // Linear expansion calculator
  const [expMaterial, setExpMaterial] = useState(6); // Gold
  const [length0, setLength0] = useState(0.015);
  const [expT0, setExpT0] = useState(27);
  const [expTf, setExpTf] = useState(49);

  // Specific heat calculator
  const [mass, setMass] = useState(1);
  const [specificHeat, setSpecificHeat] = useState(4186);
  const [initialTemp, setInitialTemp] = useState(20);
  const [finalTemp, setFinalTemp] = useState(50);

  // Worked examples
  const [openExample, setOpenExample] = useState<number | null>(null);

  // Quiz
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const kelvin = celsius + 273.15;
  const fahrenheit = (celsius * 9) / 5 + 32;
  const celsiusFromF = (5 / 9) * (fahrenheitInput - 32);
  const thermoFraction = Math.max(0, Math.min(1, (celsius + 273.15) / 473.15));

  const alpha = expansionMaterials[expMaterial].alpha * 1e-6;
  const deltaL = alpha * length0 * (expTf - expT0); // meters
  const formatLength = (meters: number) => {
    const abs = Math.abs(meters);
    if (abs < 1e-3) return `${(meters * 1e6).toFixed(2)} μm`;
    if (abs < 1) return `${(meters * 1e3).toFixed(3)} mm`;
    return `${meters.toFixed(4)} m`;
  };

  const heat = mass * specificHeat * (finalTemp - initialTemp);

  const answeredCount = Object.keys(answers).length;
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
            Learn what temperature and heat mean, convert between temperature scales,
            explore thermal expansion, and calculate heat using specific heat capacity.
          </p>
        </motion.header>

        <section className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { formula: "TF = 9/5 TC + 32", title: "Celsius to Fahrenheit" },
            { formula: "TK = TC + 273.15", title: "Celsius to Kelvin" },
            { formula: "ΔL = αL₀ΔT", title: "Linear thermal expansion" },
            { formula: "Q = mcΔT", title: "Heat and specific heat capacity" },
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
                <p className="mt-1 text-sm text-slate-400">Average kinetic energy of particles</p>
              </div>
            </div>
            <p className="leading-7 text-slate-300">
              Temperature is a measure of the <em>average kinetic energy</em> of the atoms
              or molecules in a substance.
            </p>
            <div className="mt-5 space-y-3 text-sm leading-6 text-slate-400">
              <p>
                <strong className="text-white">Celsius (°C):</strong> Formerly called the
                centigrade scale. The ice (freezing) point of water is 0°C and the steam
                (boiling) point is 100°C.
              </p>
              <p>
                <strong className="text-white">Fahrenheit (°F):</strong> Converts with
                TF = 9/5 TC + 32 and TC = 5/9 (TF − 32). Water freezes at 32°F and boils at 212°F.
              </p>
              <p>
                <strong className="text-white">Kelvin (K):</strong> TK = TC + 273.15. Absolute
                zero is 0 K, or −273.15°C.
              </p>
            </div>
            <div className="mt-6 rounded-xl border border-white/10 bg-[#080D1B] p-4">
              <p className="text-sm text-slate-400">Remember</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                One kelvin equals one Celsius degree, so a temperature difference of 1°C is
                equal in size to a difference of 1 K. Kelvin temperatures do not use a
                degree symbol.
              </p>
            </div>
          </article>

          <article className="rounded-3xl border border-white/10 bg-[#111A2E] p-6 md:p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-sky-400/10 p-3 text-sky-300">
                <Flame size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold">2. Heat</h2>
                <p className="mt-1 text-sm text-slate-400">Energy in transit from hot to cold</p>
              </div>
            </div>
            <p className="leading-7 text-slate-300">
              Heat is energy that flows from a higher-temperature object to a
              lower-temperature object because of the difference in temperatures. It is the
              net transfer of internal energy from one region to another. The SI unit of
              heat is the joule (J).
            </p>
            <div className="mt-5 space-y-3 text-sm leading-6 text-slate-400">
              <p>
                <strong className="text-white">Energy:</strong> A system has energy if it has
                the ability to do work. Energy comes in two basic forms, kinetic energy of
                motion and potential energy of position, and energy is conserved.
              </p>
              <p>
                <strong className="text-white">Thermal equilibrium:</strong> If the net
                exchange of internal energy is zero (no heat flows), the whole system is in
                thermal equilibrium.
              </p>
              <p>
                <strong className="text-white">Other units:</strong> 1 calorie (cal) = 4.186 J,
                the energy to raise 1 gram of water by 1 Celsius degree. The British thermal
                unit (Btu) is the heat to raise 1 pound of water by 1 Fahrenheit degree.
              </p>
            </div>
            <div className="mt-6 rounded-xl border border-white/10 bg-[#080D1B] p-4">
              <p className="text-sm text-slate-400">Remember</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Nothing can be said to have heat or store heat. Instead, we say heat flows
                from one place to another.
              </p>
            </div>
          </article>

          <article className="rounded-3xl border border-white/10 bg-[#111A2E] p-6 md:p-8 lg:col-span-2">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-violet-400/10 p-3 text-violet-300">
                <Ruler size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold">3. Thermometers & thermal expansion</h2>
                <p className="mt-1 text-sm text-slate-400">Tap a topic to read more</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {keyIdeas.map((idea, index) => {
                const Icon = idea.icon;
                const active = activeIdea === index;
                return (
                  <button
                    key={idea.title}
                    type="button"
                    onClick={() => setActiveIdea(index)}
                    className={`flex w-full flex-col items-start gap-3 rounded-xl border p-4 text-left transition ${
                      active
                        ? "border-orange-300/40 bg-white/[0.05]"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex w-full items-center gap-3">
                      <div className={`rounded-lg p-2 ${idea.background} ${idea.color}`}>
                        <Icon size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{idea.title}</p>
                        <p className="mt-1 text-xs text-slate-400">{idea.subtitle}</p>
                      </div>
                      <ArrowRight size={16} className="shrink-0 text-slate-500" />
                    </div>
                  </button>
                );
              })}
            </div>

            <motion.div
              key={activeIdea}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 rounded-xl border border-white/10 bg-[#080D1B] p-5"
            >
              <p className="font-semibold text-orange-300">{keyIdeas[activeIdea].title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {keyIdeas[activeIdea].description}
              </p>
              <p className="mt-3 text-sm text-orange-200">
                Example: {keyIdeas[activeIdea].example}
              </p>
            </motion.div>
          </article>
        </section>

        <section className="mb-12 rounded-3xl border border-orange-400/20 bg-[#111A2E] p-6 md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-orange-400/10 p-3 text-orange-300">
              <Thermometer size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold text-orange-300">INTERACTIVE TOOL 01</p>
              <h2 className="mt-1 text-2xl font-bold md:text-3xl">Temperature Scale Converter</h2>
            </div>
          </div>

          <p className="mb-6 leading-7 text-slate-400">
            Move the slider to change the temperature in Celsius. The Fahrenheit
            (TF = 9/5 TC + 32) and Kelvin (TK = TC + 273.15) values update automatically.
          </p>

          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/10 bg-[#080D1B] p-6">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <label htmlFor="celsius" className="text-sm text-slate-300">
                    Temperature in Celsius
                  </label>
                  <span className="text-2xl font-black text-orange-300">
                    {Number.isInteger(celsius) ? celsius : celsius.toFixed(2)}°C
                  </span>
                </div>
                <input
                  id="celsius"
                  type="range"
                  min="-273"
                  max="200"
                  step="1"
                  value={celsius}
                  onChange={(event) => setCelsius(Number(event.target.value))}
                  className="w-full accent-orange-400"
                />
                <div className="mt-2 flex justify-between text-xs text-slate-500">
                  <span>-273°C</span>
                  <span>200°C</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    { label: "Absolute zero", value: -273.15 },
                    { label: "Ice point", value: 0 },
                    { label: "Body temp", value: 37 },
                    { label: "Steam point", value: 100 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setCelsius(preset.value)}
                      className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 transition hover:border-orange-300/50 hover:text-orange-200"
                    >
                      {preset.label}
                    </button>
                  ))}
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

              <div className="rounded-2xl border border-white/10 bg-[#080D1B] p-6">
                <label htmlFor="fahrenheit" className="mb-3 block text-sm text-slate-300">
                  Fahrenheit to Celsius: TC = 5/9 (TF − 32)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="fahrenheit"
                    type="number"
                    value={fahrenheitInput}
                    onChange={(event) => setFahrenheitInput(Number(event.target.value))}
                    className="w-32 rounded-xl border border-white/10 bg-[#111A2E] px-4 py-2 text-white outline-none focus:border-orange-300"
                  />
                  <span className="text-sm text-slate-400">°F =</span>
                  <span className="text-xl font-bold text-orange-300">
                    {celsiusFromF.toFixed(2)}°C
                  </span>
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  Try 98.6°F, the oral temperature of a healthy person.
                </p>
              </div>
            </div>

            <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#080D1B] p-6">
              <motion.div
                animate={{ height: `${25 + thermoFraction * 125}px` }}
                transition={{ type: "spring", stiffness: 100, damping: 18 }}
                className="relative w-10 rounded-full border-2 border-slate-300 bg-slate-800"
              >
                <motion.div
                  animate={{ height: `${10 + thermoFraction * 125}px` }}
                  className="absolute bottom-1 left-1 right-1 rounded-full bg-gradient-to-t from-orange-600 to-yellow-300"
                />
              </motion.div>
              <div className="mt-4 h-4 w-16 rounded-full bg-orange-400 shadow-[0_0_25px_rgba(251,146,60,0.4)]" />
              <p className="mt-5 text-sm text-slate-400">Illustrative thermometer</p>
              <p className="mt-1 text-3xl font-black text-orange-300">
                {Number.isInteger(celsius) ? celsius : celsius.toFixed(2)}°C
              </p>
              <p className="mt-2 text-center text-xs text-slate-500">
                The visual is illustrative, not a calibrated instrument.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12 rounded-3xl border border-sky-400/20 bg-[#111A2E] p-6 md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-sky-400/10 p-3 text-sky-300">
              <Ruler size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold text-sky-300">INTERACTIVE TOOL 02</p>
              <h2 className="mt-1 text-2xl font-bold md:text-3xl">Linear Thermal Expansion Calculator</h2>
            </div>
          </div>

          <p className="mb-6 leading-7 text-slate-400">
            Compute the change in length (or diameter of a hole) using ΔL = αL₀ΔT. The
            default values are the gold engagement ring example from the lecture.
          </p>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-5 rounded-2xl border border-white/10 bg-[#080D1B] p-5">
              <div>
                <label htmlFor="expMaterial" className="mb-2 block text-sm text-slate-300">
                  Material (coefficient of linear expansion α)
                </label>
                <select
                  id="expMaterial"
                  value={expMaterial}
                  onChange={(event) => setExpMaterial(Number(event.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-[#111A2E] px-4 py-3 text-white outline-none focus:border-sky-400"
                >
                  {expansionMaterials.map((material, index) => (
                    <option key={material.label} value={index}>
                      {material.label} — {material.alpha} × 10⁻⁶ (C°)⁻¹
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="length0" className="mb-2 block text-sm text-slate-300">
                  Original length / diameter L₀:{" "}
                  <strong className="text-sky-300">{length0.toFixed(3)} m</strong>
                </label>
                <input
                  id="length0"
                  type="range"
                  min="0.005"
                  max="10"
                  step="0.005"
                  value={length0}
                  onChange={(event) => setLength0(Number(event.target.value))}
                  className="w-full accent-sky-400"
                />
              </div>

              <div>
                <label htmlFor="expT0" className="mb-2 block text-sm text-slate-300">
                  Initial temperature T₀: <strong>{expT0}°C</strong>
                </label>
                <input
                  id="expT0"
                  type="range"
                  min="-50"
                  max="100"
                  value={expT0}
                  onChange={(event) => setExpT0(Number(event.target.value))}
                  className="w-full accent-sky-400"
                />
              </div>

              <div>
                <label htmlFor="expTf" className="mb-2 block text-sm text-slate-300">
                  Final temperature Tf: <strong>{expTf}°C</strong>
                </label>
                <input
                  id="expTf"
                  type="range"
                  min="-50"
                  max="200"
                  value={expTf}
                  onChange={(event) => setExpTf(Number(event.target.value))}
                  className="w-full accent-sky-400"
                />
              </div>
            </div>

            <div className="flex flex-col justify-center rounded-2xl border border-sky-400/20 bg-[#080D1B] p-6">
              <p className="text-sm text-slate-400">Formula</p>
              <p className="my-3 text-3xl font-black text-sky-300">ΔL = αL₀ΔT</p>
              <p className="text-sm leading-6 text-slate-400">
                ΔT = {expTf} − {expT0} = {expTf - expT0}°C
              </p>
              <div className="mt-6 border-t border-white/10 pt-5">
                <p className="text-sm text-slate-400">
                  {deltaL > 0 ? "Expansion (ΔL)" : deltaL < 0 ? "Contraction (ΔL)" : "No change in length"}
                </p>
                <p className={`mt-2 break-words text-3xl font-black ${deltaL < 0 ? "text-violet-300" : "text-sky-300"}`}>
                  {formatLength(deltaL)}
                </p>
                <p className="mt-3 text-xs leading-5 text-slate-500">
                  Final size = L₀ + ΔL = {(length0 + deltaL).toFixed(6)} m. A hole expands or
                  contracts just like the material around it.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12 rounded-3xl border border-violet-400/20 bg-[#111A2E] p-6 md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-violet-400/10 p-3 text-violet-300">
              <Flame size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold text-violet-300">INTERACTIVE TOOL 03</p>
              <h2 className="mt-1 text-2xl font-bold md:text-3xl">Specific Heat Calculator</h2>
            </div>
          </div>

          <p className="mb-6 leading-7 text-slate-400">
            The heat Q that must be supplied or removed to change the temperature of a
            substance of mass m by an amount ΔT is Q = mcΔT, where c is the specific heat
            capacity (unit: J/(kg·°C)).
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
                  max="100"
                  step="0.1"
                  value={mass}
                  onChange={(event) => setMass(Number(event.target.value))}
                  className="w-full accent-violet-400"
                />
              </div>

              <div>
                <label htmlFor="specificHeat" className="mb-2 block text-sm text-slate-300">
                  Substance
                </label>
                <select
                  id="specificHeat"
                  value={specificHeat}
                  onChange={(event) => setSpecificHeat(Number(event.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-[#111A2E] px-4 py-3 text-white outline-none focus:border-violet-400"
                >
                  {materials.map((material) => (
                    <option key={material.label} value={material.value}>
                      {material.label} — {material.value.toLocaleString("en-US")} J/(kg·°C)
                    </option>
                  ))}
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
                  {heat > 0
                    ? "ΔT and Q are positive: energy flows into the system"
                    : heat < 0
                    ? "ΔT and Q are negative: energy flows out of the system"
                    : "No net heat transfer"}
                </p>
                <p className={`mt-2 break-words text-3xl font-black ${heat < 0 ? "text-sky-300" : "text-violet-300"}`}>
                  {heat.toLocaleString("en-US", { maximumFractionDigits: 2 })} J
                </p>
                <p className="mt-3 text-xs leading-5 text-slate-500">
                  ≈ {(heat / 4.186).toLocaleString("en-US", { maximumFractionDigits: 1 })} cal
                  (1 cal = 4.186 J). This calculation assumes constant specific heat and
                  no change of phase.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12 rounded-3xl border border-white/10 bg-[#111A2E] p-6 md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-emerald-400/10 p-3 text-emerald-300">
              <BookOpen size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-300">WORKED EXAMPLES</p>
              <h2 className="mt-1 text-2xl font-bold md:text-3xl">Solved problems from the lecture</h2>
            </div>
          </div>

          <div className="space-y-4">
            {examples.map((example, index) => {
              const open = openExample === index;
              return (
                <div key={example.title} className="rounded-2xl border border-white/10 bg-[#080D1B] p-5">
                  <p className="font-semibold text-orange-300">{example.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{example.problem}</p>
                  <button
                    type="button"
                    onClick={() => setOpenExample(open ? null : index)}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold transition hover:bg-white/5"
                  >
                    {open ? "Hide solution" : "Show solution"}
                  </button>
                  {open && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 rounded-xl bg-white/[0.03] p-4"
                    >
                      <div className="space-y-1 text-sm leading-6 text-slate-400">
                        {example.steps.map((step) => (
                          <p key={step}>{step}</p>
                        ))}
                      </div>
                      <p className="mt-3 text-lg font-bold text-emerald-300">{example.answer}</p>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="mb-12 rounded-3xl border border-white/10 bg-[#111A2E] p-6 md:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-emerald-300">CHECK YOUR KNOWLEDGE</p>
              <h2 className="mt-2 text-2xl font-bold md:text-3xl">Temperature & Heat Quiz</h2>
              <p className="mt-2 text-slate-400">
                Answer all {questions.length} questions to see your score and explanations.
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

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {!submitted ? (
              <>
                <button
                  type="button"
                  disabled={answeredCount !== questions.length}
                  onClick={() => setSubmitted(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-300 px-5 py-3 font-bold text-slate-950 transition hover:bg-orange-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Submit quiz <ArrowRight size={18} />
                </button>
                <span className="text-sm text-slate-400">
                  {answeredCount} / {questions.length} answered
                </span>
              </>
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