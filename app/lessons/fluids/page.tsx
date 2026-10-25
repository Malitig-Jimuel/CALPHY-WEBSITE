"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Droplets,
  Gauge,
  RotateCcw,
  Waves,
  Wind,
  XCircle,
} from "lucide-react";

type Question = {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

type Example = {
  title: string;
  problem: string;
  steps: string[];
  answer: string;
};

const fluidQuestions: Question[] = [
  {
    question: "What is the SI unit of pressure?",
    options: ["Newton", "Joule", "Pascal", "Watt"],
    answer: 2,
    explanation: "Pressure is force divided by area. Its SI unit is the pascal (Pa), equal to N/m².",
  },
  {
    question: "A force of 100 N acts on an area of 2 m². What pressure is produced?",
    options: ["50 Pa", "200 Pa", "102 Pa", "25 Pa"],
    answer: 0,
    explanation: "P = F/A = 100 N / 2 m² = 50 Pa.",
  },
  {
    question: "A substance has a specific gravity of 0.8. What is its density?",
    options: ["800 kg/m³", "80 kg/m³", "1250 kg/m³", "0.8 kg/m³"],
    answer: 0,
    explanation: "ρ = SG × ρ_water = 0.8 × 1000 kg/m³ = 800 kg/m³.",
  },
  {
    question: "An object has a density of 600 kg/m³ and is placed in water (1000 kg/m³). What happens?",
    options: ["It sinks", "It floats", "It has zero buoyant force", "It disappears"],
    answer: 1,
    explanation:
      "The object is less dense than water (specific gravity 0.6), so it floats. Part of the object stays above the surface.",
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
    explanation: "The buoyant force equals the weight of the fluid displaced by the immersed object.",
  },
  {
    question:
      "Water flows through a pipe of area 10 cm² at 2 m/s into a section of area 5 cm². What is the new speed?",
    options: ["1 m/s", "2 m/s", "4 m/s", "10 m/s"],
    answer: 2,
    explanation: "A₁v₁ = A₂v₂, so v₂ = (10 × 2) / 5 = 4 m/s.",
  },
  {
    question: "For steady flow of an ideal fluid, where the fluid moves faster, its pressure is generally...",
    options: ["Higher", "Lower", "Always zero", "Unchanged in every situation"],
    answer: 1,
    explanation:
      "Bernoulli's equation links pressure, speed, and height. At the same height, faster flow corresponds to lower pressure under its ideal-flow assumptions.",
  },
  {
    question: "Water leaves a hole 5 m below the surface of an open tank. What is the exit speed? (g = 9.8 m/s²)",
    options: ["5 m/s", "9.9 m/s", "49 m/s", "98 m/s"],
    answer: 1,
    explanation: "v = √(2gh) = √(2 × 9.8 × 5) = √98 ≈ 9.9 m/s.",
  },
];

const formulaCards = [
  { value: "P = F / A", label: "Pressure", detail: "Force per unit area" },
  { value: "ρ = m / V", label: "Density", detail: "Mass per unit volume" },
  { value: "SG = ρ / ρwater", label: "Specific gravity", detail: "Density relative to water" },
  { value: "Fᵦ = ρfluid g V", label: "Buoyant force", detail: "Weight of displaced fluid" },
  { value: "A₁v₁ = A₂v₂", label: "Continuity", detail: "Volume flow rate stays constant" },
  { value: "v = √(2gh)", label: "Torricelli", detail: "Exit speed from a tank hole" },
];

const topicLinks = [
  { href: "#pressure-density", label: "Pressure, specific gravity, density" },
  { href: "#archimedes", label: "Archimedes’ principle" },
  { href: "#continuity", label: "Rate of flow and continuity" },
  { href: "#bernoulli", label: "Bernoulli’s principle" },
  { href: "#torricelli", label: "Torricelli’s theorem" },
  { href: "#quiz", label: "Quiz" },
];

const examples: Record<string, Example> = {
  pressure: {
    title: "Example 1: Pressure from a force",
    problem:
      "A 60 kg student stands on both feet. The total contact area of the shoes is 0.04 m². What pressure do they exert on the floor? (g = 9.81 m/s²)",
    steps: [
      "Find the weight: F = mg = 60 × 9.81 = 588.6 N",
      "Apply P = F / A = 588.6 / 0.04",
      "P = 14,715 Pa",
    ],
    answer: "P ≈ 14.7 kPa",
  },
  depth: {
    title: "Example 2: Pressure at a depth",
    problem:
      "A diver is 10 m below the surface of fresh water (ρ = 1000 kg/m³). What is the gauge pressure at that depth?",
    steps: [
      "Use P = ρgh",
      "P = 1000 × 9.81 × 10",
      "P = 98,100 Pa",
    ],
    answer: "P ≈ 98.1 kPa (about 1 atmosphere, on top of the air pressure above the water)",
  },
  density: {
    title: "Example: Density and specific gravity",
    problem:
      "A block has a mass of 2.4 kg and a volume of 0.003 m³. Find its density and specific gravity. Will it float in water?",
    steps: [
      "Density: ρ = m / V = 2.4 / 0.003 = 800 kg/m³",
      "Specific gravity: SG = ρ / ρwater = 800 / 1000 = 0.8",
      "SG is less than 1, so the block is less dense than water",
    ],
    answer: "ρ = 800 kg/m³, SG = 0.8, so it floats",
  },
  archimedes: {
    title: "Example: Buoyant force and apparent weight",
    problem:
      "An aluminum block (ρ = 2700 kg/m³) with a volume of 0.002 m³ is fully submerged in water. Find the buoyant force and its apparent weight in water. (g = 9.81 m/s²)",
    steps: [
      "Buoyant force: Fᵦ = ρwater g V = 1000 × 9.81 × 0.002 = 19.62 N",
      "Actual weight: W = ρblock V g = 2700 × 0.002 × 9.81 = 52.97 N",
      "Apparent weight = W − Fᵦ = 52.97 − 19.62 = 33.35 N",
    ],
    answer: "Fᵦ = 19.62 N, apparent weight ≈ 33.35 N",
  },
  continuity: {
    title: "Example: Flow rate and speed in a narrowing pipe",
    problem:
      "Water flows at 1.5 m/s through a pipe with a 4 cm diameter. The pipe narrows to a 2 cm diameter. Find the flow rate and the speed in the narrow section.",
    steps: [
      "Wide area: A₁ = π(0.02)² = 1.257 × 10⁻³ m²",
      "Flow rate: Q = A₁v₁ = 1.257 × 10⁻³ × 1.5 = 1.885 × 10⁻³ m³/s",
      "Narrow area: A₂ = π(0.01)² = 3.142 × 10⁻⁴ m²",
      "Speed: v₂ = Q / A₂ = 1.885 × 10⁻³ / 3.142 × 10⁻⁴ = 6.0 m/s",
    ],
    answer: "Q ≈ 1.89 L/s and v₂ = 6.0 m/s (halving the diameter quadruples the speed)",
  },
  bernoulli: {
    title: "Example: Pressure drop in a constriction",
    problem:
      "Water flows through a horizontal pipe. In the wide section the speed is 2 m/s and the pressure is 200,000 Pa. In the narrow section the speed is 6 m/s. What is the pressure there?",
    steps: [
      "Same height, so P₁ + ½ρv₁² = P₂ + ½ρv₂²",
      "P₂ = P₁ + ½ρ(v₁² − v₂²)",
      "P₂ = 200,000 + ½(1000)(2² − 6²) = 200,000 + 500(−32)",
      "P₂ = 200,000 − 16,000",
    ],
    answer: "P₂ = 184,000 Pa (lower pressure where the water moves faster)",
  },
  torricelli: {
    title: "Example: Exit speed and flow from a tank",
    problem:
      "A hole of area 1 cm² is made 3.2 m below the open surface of a water tank. Find the exit speed and the flow rate through the hole. (g = 9.81 m/s²)",
    steps: [
      "Exit speed: v = √(2gh) = √(2 × 9.81 × 3.2) = √62.78",
      "v ≈ 7.92 m/s",
      "Hole area: A = 1 cm² = 1 × 10⁻⁴ m²",
      "Flow rate: Q = Av = 1 × 10⁻⁴ × 7.92 = 7.92 × 10⁻⁴ m³/s",
    ],
    answer: "v ≈ 7.92 m/s and Q ≈ 0.79 L/s (ideal fluid, no friction losses)",
  },
};

function WorkedExample({ example }: { example: Example }) {
  return (
    <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.04] p-5">
      <p className="text-sm font-semibold text-emerald-300">{example.title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{example.problem}</p>
      <ol className="mt-3 space-y-1 text-sm leading-6 text-slate-400">
        {example.steps.map((step, i) => (
          <li key={i} className="flex gap-2">
            <span className="shrink-0 font-semibold text-emerald-300">{i + 1}.</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      <p className="mt-3 rounded-lg bg-white/5 px-3 py-2 text-sm font-semibold text-white">
        Answer: {example.answer}
      </p>
    </div>
  );
}

const G = 9.81;
const WATER_DENSITY = 1000;

export default function FluidsPage() {
  // Archimedes lab
  const [objectDensity, setObjectDensity] = useState(600);
  const [fluidDensity, setFluidDensity] = useState(1000);

  // Continuity lab
  const [areaIn, setAreaIn] = useState(8); // cm²
  const [areaOut, setAreaOut] = useState(4); // cm²
  const [speedIn, setSpeedIn] = useState(2); // m/s

  // Bernoulli demo
  const [flowSpeed, setFlowSpeed] = useState(50);

  // Torricelli lab
  const [tankHeight, setTankHeight] = useState(2); // m

  // Quiz
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  // Derived values
  const isFloating = objectDensity < fluidDensity;
  const isSuspended = objectDensity === fluidDensity;
  const specificGravity = objectDensity / WATER_DENSITY;

  const speedOut = (areaIn * speedIn) / areaOut; // A1v1 = A2v2
  const flowRate = (areaIn / 10000) * speedIn; // Q = Av, m³/s
  const torricelliSpeed = Math.sqrt(2 * G * tankHeight); // v = √(2gh)

  const score = fluidQuestions.reduce(
    (total, question, index) => total + (answers[index] === question.answer ? 1 : 0),
    0
  );

  const resetQuiz = () => {
    setAnswers({});
    setSubmitted(false);
  };

  const continuitySliders = [
    { id: "areaIn", label: "Area A₁", unit: "cm²", value: areaIn, set: setAreaIn, min: 2, max: 20 },
    { id: "areaOut", label: "Area A₂", unit: "cm²", value: areaOut, set: setAreaOut, min: 2, max: 20 },
    { id: "speedIn", label: "Speed v₁", unit: "m/s", value: speedIn, set: setSpeedIn, min: 1, max: 10 },
  ];

  // Pipe drawing for continuity (heights scale with area)
  const pipeInH = 20 + areaIn * 5;
  const pipeOutH = 20 + areaOut * 5;
  const midY = 90;
  const jetY = 45 + tankHeight * 25;
  const jetEndX = 130 + torricelliSpeed * 12;

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
            Explore pressure, specific gravity, and density, why objects float or sink, how flow
            rate and continuity work, and how Bernoulli’s principle leads to Torricelli’s theorem.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {topicLinks.map((topic) => (
              <a
                key={topic.href}
                href={topic.href}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:border-sky-400/50 hover:text-sky-300"
              >
                {topic.label}
              </a>
            ))}
          </div>
        </motion.header>

        <section className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {formulaCards.map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/10 bg-[#111A2E] p-6">
              <p className="text-sm text-slate-400">{item.label}</p>
              <p className="mt-3 text-2xl font-bold text-sky-300">{item.value}</p>
              <p className="mt-2 text-sm text-slate-500">{item.detail}</p>
            </div>
          ))}
        </section>

        {/* 1. Pressure, specific gravity, density */}
        <section id="pressure-density" className="mb-12 grid scroll-mt-24 gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-white/10 bg-[#111A2E] p-6 md:p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-violet-400/10 p-3 text-violet-300">
                <Waves size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold">1. Pressure in fluids</h2>
                <p className="mt-1 text-sm text-slate-400">Force distributed over an area</p>
              </div>
            </div>
            <p className="mb-3 leading-7 text-slate-300">
              Pressure measures how much perpendicular force acts on each unit of area.
              In a stationary liquid, pressure increases with depth.
            </p>
            <p className="mb-5 text-sm leading-6 text-slate-400">
              The same force can produce very different pressures: a sharp knife cuts easily because it
              concentrates the force on a tiny area. In a liquid, pressure at a given depth acts equally
              in all directions, and it depends only on depth and fluid density, not on the shape of the
              container.
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
            <WorkedExample example={examples.pressure} />
            <WorkedExample example={examples.depth} />
          </article>

          <article className="rounded-3xl border border-white/10 bg-[#111A2E] p-6 md:p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-sky-400/10 p-3 text-sky-300">
                <Droplets size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold">2. Density and specific gravity</h2>
                <p className="mt-1 text-sm text-slate-400">How much mass fits in a volume</p>
              </div>
            </div>
            <p className="mb-3 leading-7 text-slate-300">
              Density tells us how much mass is packed into a given volume. Specific gravity compares
              a substance’s density to the density of water, so it has no units.
            </p>
            <p className="mb-5 text-sm leading-6 text-slate-400">
              Specific gravity is handy because it gives a quick answer without doing any units
              conversions. Water is the reference at 1000 kg/m³ (SG = 1), so oil with SG 0.9 floats on
              water, while iron with SG about 7.9 sinks. Multiply SG by 1000 kg/m³ whenever you need the
              actual density.
            </p>
            <div className="rounded-xl border border-white/10 bg-[#080D1B] p-5">
              <p className="text-sm text-slate-400">Density</p>
              <p className="my-2 text-2xl font-bold text-sky-300">ρ = m / V</p>
              <div className="mt-4 border-t border-white/10 pt-4">
                <p className="text-sm text-slate-400">Specific gravity</p>
                <p className="my-2 text-2xl font-bold text-sky-300">SG = ρsubstance / ρwater</p>
                <p className="text-sm text-slate-400">
                  Water is about 1000 kg/m³, so a substance with SG = 0.8 has a density of 800 kg/m³.
                  SG &lt; 1 floats in water and SG &gt; 1 sinks.
                </p>
              </div>
            </div>
            <WorkedExample example={examples.density} />
          </article>
        </section>

        {/* 2. Archimedes */}
        <section
          id="archimedes"
          className="mb-12 scroll-mt-24 rounded-3xl border border-sky-400/20 bg-[#111A2E] p-6 md:p-8"
        >
          <div className="mb-6">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-sky-400">
              <Waves size={18} /> INTERACTIVE SIMULATION
            </div>
            <h2 className="text-2xl font-bold md:text-3xl">Archimedes’ Principle Lab</h2>
            <p className="mt-2 max-w-3xl leading-7 text-slate-400">
              A fluid pushes upward on an immersed object. This upward force is called{" "}
              <strong className="text-white">buoyancy</strong>, and by Archimedes’ principle it equals
              the weight of the fluid displaced. Change the object’s density and the fluid’s density to
              see whether the object floats, sinks, or stays neutrally buoyant.
            </p>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
              A floating object sinks only until the weight of the fluid it displaces equals its own
              weight. That is why the fraction of a floating object that is submerged equals{" "}
              <strong className="text-white">ρobject / ρfluid</strong>: an object with SG 0.6 floats with
              60% of its volume underwater. A fully submerged object also feels lighter, because its
              apparent weight is its actual weight minus the buoyant force.
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
                <p
                  className={`mt-2 text-2xl font-bold ${
                    isFloating ? "text-emerald-300" : isSuspended ? "text-amber-300" : "text-rose-300"
                  }`}
                >
                  {isFloating ? "It floats!" : isSuspended ? "Neutral buoyancy" : "It sinks!"}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Density comparison: {objectDensity} kg/m³ {isFloating ? "<" : isSuspended ? "=" : ">"}{" "}
                  {fluidDensity} kg/m³.
                  {isFloating
                    ? " The object is less dense than the fluid."
                    : isSuspended
                    ? " The object and fluid have equal densities."
                    : " The object is denser than the fluid."}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  Specific gravity (vs. water): <strong className="text-sky-300">{specificGravity.toFixed(2)}</strong>
                </p>
                {isFloating && (
                  <p className="mt-1 text-sm text-slate-400">
                    Submerged fraction: <strong className="text-sky-300">{((objectDensity / fluidDensity) * 100).toFixed(0)}%</strong>
                  </p>
                )}
              </div>
            </div>

            <div className="relative flex min-h-[330px] items-center justify-center overflow-hidden rounded-2xl border border-sky-300/20 bg-[#080D1B] p-4">
              <div className="absolute inset-x-0 top-[22%] border-t-2 border-sky-300/60" />
              <div className="absolute inset-x-0 top-[22%] bottom-0 bg-sky-500/15" />
              <div className="absolute left-4 top-4 text-xs font-semibold uppercase tracking-widest text-sky-300">
                Fluid surface
              </div>
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
          <WorkedExample example={examples.archimedes} />
        </section>

        {/* 3. Rate of flow and continuity */}
        <section
          id="continuity"
          className="mb-12 scroll-mt-24 rounded-3xl border border-sky-400/20 bg-[#111A2E] p-6 md:p-8"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-sky-400/10 p-3 text-sky-300">
              <Gauge size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold text-sky-300">3. RATE OF FLOW</p>
              <h2 className="mt-1 text-2xl font-bold md:text-3xl">Continuity Principle</h2>
            </div>
          </div>
          <p className="mb-3 max-w-3xl leading-7 text-slate-300">
            The volume flow rate is <strong>Q = A v</strong> (or V / t). For an incompressible fluid in a
            pipe, the same volume passes every point each second, so <strong>A₁v₁ = A₂v₂</strong>. A
            narrower pipe means faster flow.
          </p>
          <p className="mb-6 max-w-3xl text-sm leading-6 text-slate-400">
            Flow rate is measured in m³/s in SI units, and 1 m³/s equals 1000 L/s. Always convert areas
            to m² first (1 cm² = 10⁻⁴ m²). You see continuity every time you put your thumb over a
            garden hose: the opening gets smaller, so the water leaves faster. If the pipe has circular
            sections, remember that area depends on the diameter squared, so halving the diameter
            quadruples the speed.
          </p>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-5 rounded-2xl border border-white/10 bg-[#080D1B] p-5">
              {continuitySliders.map((s) => (
                <div key={s.id}>
                  <div className="mb-2 flex justify-between text-sm">
                    <label htmlFor={s.id} className="text-slate-300">{s.label}</label>
                    <strong className="text-sky-300">
                      {s.value} {s.unit}
                    </strong>
                  </div>
                  <input
                    id={s.id}
                    type="range"
                    min={s.min}
                    max={s.max}
                    value={s.value}
                    onChange={(e) => s.set(Number(e.target.value))}
                    className="w-full accent-sky-400"
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-xs text-slate-400">Speed v₂</p>
                  <p className="mt-1 text-xl font-bold text-violet-300">{speedOut.toFixed(2)} m/s</p>
                </div>
                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-xs text-slate-400">Flow rate Q</p>
                  <p className="mt-1 text-xl font-bold text-sky-300">{(flowRate * 1000).toFixed(2)} L/s</p>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#080D1B] p-4">
              <svg viewBox="0 0 420 180" role="img" aria-label="Pipe that changes cross-sectional area from A1 to A2">
                <rect x="10" y={midY - pipeInH / 2} width="190" height={pipeInH} fill="#17243A" stroke="#64748B" strokeWidth="2" />
                <rect x="220" y={midY - pipeOutH / 2} width="190" height={pipeOutH} fill="#17243A" stroke="#64748B" strokeWidth="2" />
                <path
                  d={`M200 ${midY - pipeInH / 2} L220 ${midY - pipeOutH / 2} L220 ${midY + pipeOutH / 2} L200 ${midY + pipeInH / 2} Z`}
                  fill="#17243A"
                  stroke="#64748B"
                  strokeWidth="2"
                />
                <rect x="12" y={midY - pipeInH / 2 + 3} width="186" height={Math.max(pipeInH - 6, 2)} fill="#38BDF8" fillOpacity=".25" />
                <rect x="222" y={midY - pipeOutH / 2 + 3} width="186" height={Math.max(pipeOutH - 6, 2)} fill="#8B5CF6" fillOpacity=".4" />
                <motion.path
                  key={`in-${speedIn}`}
                  d="M20 90 H190"
                  stroke="#7DD3FC"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="7 10"
                  animate={{ strokeDashoffset: [0, -34] }}
                  transition={{ duration: Math.max(0.25, 3 / speedIn), repeat: Infinity, ease: "linear" }}
                />
                <motion.path
                  key={`out-${speedOut}`}
                  d="M230 90 H400"
                  stroke="#C4B5FD"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="7 10"
                  animate={{ strokeDashoffset: [0, -34] }}
                  transition={{ duration: Math.max(0.25, 3 / speedOut), repeat: Infinity, ease: "linear" }}
                />
                <text x="105" y="170" fill="#7DD3FC" fontSize="11" textAnchor="middle">A₁ = {areaIn} cm², v₁ = {speedIn} m/s</text>
                <text x="315" y="170" fill="#C4B5FD" fontSize="11" textAnchor="middle">A₂ = {areaOut} cm², v₂ = {speedOut.toFixed(1)} m/s</text>
              </svg>
              <p className="mt-3 text-center text-xs text-slate-500">
                Pipe heights are drawn in proportion to the areas you choose.
              </p>
            </div>
          </div>
          <WorkedExample example={examples.continuity} />
        </section>

        {/* 4. Bernoulli */}
        <section
          id="bernoulli"
          className="mb-12 scroll-mt-24 rounded-3xl border border-violet-400/20 bg-[#111A2E] p-6 md:p-8"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-violet-400/10 p-3 text-violet-300">
              <Wind size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold text-violet-300">4. FLUIDS IN MOTION</p>
              <h2 className="mt-1 text-2xl font-bold md:text-3xl">Bernoulli’s Principle</h2>
            </div>
          </div>
          <p className="mb-3 max-w-3xl leading-7 text-slate-300">
            For steady flow of an ideal, incompressible fluid along a streamline, higher flow
            speed corresponds to lower static pressure when comparing points at the same height.
            Bernoulli’s equation: <strong>P + ½ρv² + ρgh = constant</strong>.
          </p>
          <p className="mb-6 max-w-3xl text-sm leading-6 text-slate-400">
            Bernoulli’s equation is really energy conservation for a moving fluid: pressure energy,
            kinetic energy, and potential energy per unit volume add up to the same total at every point
            along a streamline. It helps explain how airplane wings generate lift and how spray bottles
            pull liquid up a tube. Combine it with the continuity principle: a narrow section makes the
            fluid faster, and Bernoulli then tells you the pressure there is lower.
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
          <WorkedExample example={examples.bernoulli} />
        </section>

        {/* 5. Torricelli */}
        <section
          id="torricelli"
          className="mb-12 scroll-mt-24 rounded-3xl border border-violet-400/20 bg-[#111A2E] p-6 md:p-8"
        >
          <div className="mb-6">
            <p className="text-sm font-semibold text-violet-300">5. FLUID EXITING A TANK</p>
            <h2 className="mt-1 text-2xl font-bold md:text-3xl">Torricelli’s Theorem</h2>
            <p className="mt-3 max-w-3xl leading-7 text-slate-300">
              Applying Bernoulli’s equation between the open surface and a small hole at depth{" "}
              <strong>h</strong> gives the exit speed <strong>v = √(2gh)</strong>. It is the same speed an
              object would reach falling freely through height h.
            </p>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
              The derivation treats both the surface and the hole as open to the atmosphere, so the two
              pressures cancel, and the surface drops so slowly that its speed is almost zero. Notice
              that the exit speed does not depend on the density of the fluid or the width of the tank,
              only on the depth h of the hole below the surface. In real tanks, friction and the
              contraction of the jet make the actual flow a bit smaller than the ideal value, and as the
              tank drains, h decreases so the jet slows down.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
            <div className="rounded-2xl border border-white/10 bg-[#080D1B] p-5">
              <div className="mb-2 flex justify-between text-sm">
                <label htmlFor="tankHeight" className="text-slate-300">Depth of hole (h)</label>
                <strong className="text-violet-300">{tankHeight.toFixed(1)} m</strong>
              </div>
              <input
                id="tankHeight"
                type="range"
                min="0.5"
                max="5"
                step="0.5"
                value={tankHeight}
                onChange={(e) => setTankHeight(Number(e.target.value))}
                className="w-full accent-violet-400"
              />
              <p className="mt-5 text-sm text-slate-400">Exit speed</p>
              <p className="text-3xl font-bold text-violet-300">{torricelliSpeed.toFixed(2)} m/s</p>
              <p className="mt-2 text-xs text-slate-500">
                Assumes an ideal fluid, a small hole, and g = 9.81 m/s².
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#080D1B] p-4">
              <svg viewBox="0 0 300 200" role="img" aria-label="Water streaming from a hole in a tank">
                <rect x="20" y="20" width="110" height="160" fill="none" stroke="#64748B" strokeWidth="2" />
                <rect x="22" y="40" width="106" height="138" fill="#38BDF8" fillOpacity=".25" />
                <line x1="22" y1="40" x2="128" y2="40" stroke="#7DD3FC" strokeWidth="2" />
                <line x1="150" y1="40" x2="150" y2={jetY} stroke="#C4B5FD" strokeWidth="1" strokeDasharray="3 3" />
                <text x="156" y={(40 + jetY) / 2 + 4} fill="#C4B5FD" fontSize="11">h</text>
                <circle cx="130" cy={jetY} r="3" fill="#C4B5FD" />
                <path
                  d={`M130 ${jetY} Q ${130 + (jetEndX - 130) * 0.6} ${jetY} ${jetEndX} 180`}
                  stroke="#7DD3FC"
                  strokeWidth="3"
                  fill="none"
                />
                <line x1="10" y1="180" x2="290" y2="180" stroke="#64748B" strokeWidth="2" />
              </svg>
              <p className="mt-2 text-center text-xs text-slate-500">
                A deeper hole gives a faster, longer jet.
              </p>
            </div>
          </div>
          <WorkedExample example={examples.torricelli} />
        </section>

        {/* Quiz */}
        <section
          id="quiz"
          className="mb-12 scroll-mt-24 rounded-3xl border border-white/10 bg-[#111A2E] p-6 md:p-8"
        >
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-emerald-300">CHECK YOUR KNOWLEDGE</p>
              <h2 className="mt-2 text-2xl font-bold md:text-3xl">Fluids Quiz</h2>
              <p className="mt-2 text-slate-400">
                Answer all {fluidQuestions.length} questions to check your understanding.
              </p>
            </div>
            {submitted && (
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-3">
                <p className="text-sm text-slate-300">Your score</p>
                <p className="text-2xl font-black text-emerald-300">
                  {score} / {fluidQuestions.length}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {fluidQuestions.map((question, index) => (
              <div key={index} className="rounded-2xl border border-white/10 bg-[#080D1B] p-5">
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
                        key={optionIndex}
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