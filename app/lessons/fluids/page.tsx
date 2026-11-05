"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
import LessonQuizFeedback from "../LessonQuizFeedback";
import LessonHeader from "../LessonHeader";
import LessonProgressTracker from "../LessonProgressTracker";
import LessonQuizQuestion, {
  getQuizOptionClass,
  QUIZ_OPTION_BASE_CLASS,
  QUIZ_RETRY_BUTTON_CLASS,
  QUIZ_SUBMIT_BUTTON_CLASS,
} from "../LessonQuizQuestion";
import { useLessonQuizResult } from "../useLessonQuizResult";
import { useShuffledQuestionOrder } from "../quizRandomization";

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
  solution: {
    given: string;
    find: string;
    formula: string;
    substitution: string;
    calculation: string;
  };
  answer: string;
};

const fluidQuestions: Question[] = [
  // Pressure
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
    question: "What is the gauge pressure at a depth of 3 m in water? (ρ = 1000 kg/m³, g = 9.8 m/s²)",
    options: ["2,940 Pa", "29,400 Pa", "3,000 Pa", "98,000 Pa"],
    answer: 1,
    explanation: "P = ρgh = 1000 × 9.8 × 3 = 29,400 Pa.",
  },

  // Density and specific gravity
  {
    question: "A block has a mass of 500 kg and a volume of 2 m³. What is its density?",
    options: ["1000 kg/m³", "4 kg/m³", "2.5 kg/m³", "250 kg/m³"],
    answer: 3,
    explanation: "ρ = m / V = 500 kg / 2 m³ = 250 kg/m³.",
  },
  {
    question: "A substance has a specific gravity of 0.8. What is its density?",
    options: ["80 kg/m³", "1250 kg/m³", "800 kg/m³", "0.8 kg/m³"],
    answer: 2,
    explanation: "ρ = SG × ρ_water = 0.8 × 1000 kg/m³ = 800 kg/m³.",
  },
  {
    question: "What are the units of specific gravity?",
    options: ["No units (it is dimensionless)", "kg/m³", "N/m²", "m³/kg"],
    answer: 0,
    explanation: "Specific gravity is a ratio of two densities, so the units cancel and it has no units.",
  },
  {
    question: "Iron has a density of 7800 kg/m³. What is its specific gravity, and what happens in water?",
    options: ["0.78, it floats", "7.8, it sinks", "7.8, it floats", "78, it sinks"],
    answer: 1,
    explanation: "SG = 7800 / 1000 = 7.8. Since SG is greater than 1, iron is denser than water and sinks.",
  },
  {
    question: "An object has a density of 600 kg/m³ and is placed in water (1000 kg/m³). What happens?",
    options: ["It floats", "It sinks", "It has zero buoyant force", "It disappears"],
    answer: 0,
    explanation:
      "The object is less dense than water (specific gravity 0.6), so it floats. Part of the object stays above the surface.",
  },

  // Archimedes' principle
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
      "A 0.005 m³ object is fully submerged in water. What is the buoyant force? (ρ = 1000 kg/m³, g = 9.8 m/s²)",
    options: ["4.9 N", "490 N", "5 N", "49 N"],
    answer: 3,
    explanation: "Fᵦ = ρ g V = 1000 × 9.8 × 0.005 = 49 N.",
  },
  {
    question: "An object with a specific gravity of 0.6 floats in water. What fraction of it is submerged?",
    options: ["40%", "60%", "50%", "100%"],
    answer: 1,
    explanation:
      "A floating object displaces its own weight of fluid, so the submerged fraction equals ρobject / ρfluid = 0.6, or 60%.",
  },
  {
    question: "An object weighs 80 N in air. When fully submerged in water, the buoyant force is 30 N. What is its apparent weight?",
    options: ["110 N", "80 N", "50 N", "30 N"],
    answer: 2,
    explanation: "Apparent weight = actual weight − buoyant force = 80 − 30 = 50 N.",
  },

  // Rate of flow and continuity
  {
    question:
      "Water flows through a pipe of area 10 cm² at 2 m/s into a section of area 5 cm². What is the new speed?",
    options: ["1 m/s", "2 m/s", "4 m/s", "10 m/s"],
    answer: 2,
    explanation: "A₁v₁ = A₂v₂, so v₂ = (10 × 2) / 5 = 4 m/s.",
  },
  {
    question: "Water moves at 3 m/s through a pipe with a cross-sectional area of 0.002 m². What is the volume flow rate?",
    options: ["0.006 m³/s", "0.0006 m³/s", "1.5 m³/s", "6 m³/s"],
    answer: 0,
    explanation: "Q = A v = 0.002 × 3 = 0.006 m³/s, which is 6 L/s.",
  },
  {
    question: "A pipe narrows to half its original diameter. By what factor does the flow speed change?",
    options: ["It doubles", "It halves", "It stays the same", "It quadruples"],
    answer: 3,
    explanation:
      "Area depends on diameter squared, so half the diameter means one quarter of the area. By continuity, the speed becomes four times larger.",
  },

  // Bernoulli's principle
  {
    question: "For steady flow of an ideal fluid, where the fluid moves faster, its pressure is generally...",
    options: ["Higher", "Lower", "Always zero", "Unchanged in every situation"],
    answer: 1,
    explanation:
      "Bernoulli's equation links pressure, speed, and height. At the same height, faster flow corresponds to lower pressure under its ideal-flow assumptions.",
  },
  {
    question:
      "Water flows through a horizontal pipe. At point 1, P = 150,000 Pa and v = 1 m/s. At point 2, v = 5 m/s. What is the pressure at point 2? (ρ = 1000 kg/m³)",
    options: ["162,000 Pa", "149,000 Pa", "12,000 Pa", "138,000 Pa"],
    answer: 3,
    explanation:
      "P₂ = P₁ + ½ρ(v₁² − v₂²) = 150,000 + 500(1 − 25) = 150,000 − 12,000 = 138,000 Pa.",
  },
  {
    question: "Which set of assumptions does Bernoulli's equation make?",
    options: [
      "Steady, ideal, incompressible flow along a streamline",
      "A fluid at rest only",
      "A fluid with large viscous friction",
      "A gas compressed to a constant temperature",
    ],
    answer: 0,
    explanation:
      "Bernoulli's equation applies to steady flow of an ideal (frictionless), incompressible fluid along a streamline.",
  },

  // Torricelli's theorem
  {
    question: "Water leaves a hole 5 m below the surface of an open tank. What is the exit speed? (g = 9.8 m/s²)",
    options: ["5 m/s", "9.9 m/s", "49 m/s", "98 m/s"],
    answer: 1,
    explanation: "v = √(2gh) = √(2 × 9.8 × 5) = √98 ≈ 9.9 m/s.",
  },
  {
    question: "According to Torricelli's theorem, the exit speed of a fluid from a small hole depends mainly on what?",
    options: [
      "The density of the fluid and the width of the tank",
      "The mass of the fluid",
      "The volume of the tank",
      "The depth of the hole below the surface",
    ],
    answer: 3,
    explanation:
      "v = √(2gh) depends only on the depth h of the hole below the surface (and gravity), not on the fluid's density or the tank's size.",
  },
];
const fluidOptionCounts = fluidQuestions.map((question) => question.options.length);

const formulaCards = [
  { value: "P = F / A", label: "Pressure", detail: "Force per unit area" },
  { value: "ρ = m / V", label: "Density", detail: "Mass per unit volume" },
  { value: "SG = ρ / ρwater", label: "Specific gravity", detail: "Density relative to water" },
  { value: "Fᵦ = ρfluid g V", label: "Buoyant force", detail: "Weight of displaced fluid" },
  { value: "A₁v₁ = A₂v₂", label: "Continuity", detail: "Volume flow rate stays constant" },
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
    solution: {
      given: "Mass = 60 kg, total shoe contact area = 0.04 m², and g = 9.81 m/s².",
      find: "The pressure exerted on the floor.",
      formula: "P = F/A, with weight F = mg.",
      substitution: "F = (60 kg)(9.81 m/s²) = 588.6 N; P = 588.6 N / 0.04 m².",
      calculation: "P = 14,715 Pa ≈ 14.7 kPa.",
    },
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
    solution: {
      given: "Fresh water density ρ = 1000 kg/m³, depth h = 10 m, and g = 9.81 m/s².",
      find: "The gauge pressure at that depth.",
      formula: "Gauge pressure P = ρgh.",
      substitution: "P = (1000 kg/m³)(9.81 m/s²)(10 m).",
      calculation: "P = 98,100 Pa ≈ 98.1 kPa.",
    },
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
    solution: {
      given: "Mass = 2.4 kg, volume = 0.003 m³, and water density = 1000 kg/m³.",
      find: "The block's density, specific gravity, and whether it floats in water.",
      formula: "ρ = m/V; SG = ρ/ρwater.",
      substitution: "ρ = 2.4 kg / 0.003 m³; SG = 800 kg/m³ / 1000 kg/m³.",
      calculation: "ρ = 800 kg/m³ and SG = 0.8. Since SG < 1, it is less dense than water and floats.",
    },
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
    solution: {
      given: "ρblock = 2700 kg/m³, ρwater = 1000 kg/m³, V = 0.002 m³, and g = 9.81 m/s².",
      find: "The buoyant force and apparent weight when fully submerged.",
      formula: "Fb = ρwater gV; W = ρblock Vg; apparent weight = W − Fb.",
      substitution: "Fb = (1000)(9.81)(0.002); W = (2700)(0.002)(9.81); apparent weight = W − Fb.",
      calculation: "Fb = 19.62 N; W ≈ 52.97 N; apparent weight ≈ 33.35 N.",
    },
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
    solution: {
      given: "v₁ = 1.5 m/s, wide diameter = 4 cm, and narrow diameter = 2 cm.",
      find: "The volume flow rate and speed in the narrow section.",
      formula: "Q = A₁v₁; A = πr²; for steady incompressible flow, v₂ = Q/A₂.",
      substitution: "A₁ = π(0.02 m)²; Q = A₁(1.5 m/s); A₂ = π(0.01 m)²; v₂ = Q/A₂.",
      calculation: "A₁ ≈ 1.257×10⁻³ m², Q ≈ 1.885×10⁻³ m³/s, A₂ ≈ 3.142×10⁻⁴ m², and v₂ = 6.0 m/s.",
    },
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
    solution: {
      given: "Horizontal water flow: P₁ = 200,000 Pa, v₁ = 2 m/s, v₂ = 6 m/s, and ρ = 1000 kg/m³.",
      find: "The pressure in the narrow section.",
      formula: "At equal heights, P₁ + ½ρv₁² = P₂ + ½ρv₂².",
      substitution: "P₂ = 200,000 + ½(1000)(2² − 6²).",
      calculation: "P₂ = 200,000 − 16,000 = 184,000 Pa.",
    },
    answer: "P₂ = 184,000 Pa (lower pressure where the water moves faster)",
  },
};

function WorkedExample({ example }: { example: Example }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.04] p-5">
      <p className="text-sm font-semibold text-emerald-300">{example.title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{example.problem}</p>
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold transition hover:bg-white/5"
      >
        {open ? "Hide Solution" : "Show Solution"}
      </button>
      {open && (
        <div className="mt-4 space-y-3 rounded-xl bg-white/[0.03] p-4 text-sm leading-6">
          <div>
            <p className="font-semibold text-sky-300">Given</p>
            <p className="text-slate-400">{example.solution.given}</p>
          </div>
          <div>
            <p className="font-semibold text-sky-300">Find</p>
            <p className="text-slate-400">{example.solution.find}</p>
          </div>
          <div>
            <p className="font-semibold text-sky-300">Formula</p>
            <p className="text-slate-400">{example.solution.formula}</p>
          </div>
          <div>
            <p className="font-semibold text-sky-300">Substitution</p>
            <p className="text-slate-400">{example.solution.substitution}</p>
          </div>
          <div>
            <p className="font-semibold text-sky-300">Calculation</p>
            <p className="text-slate-400">{example.solution.calculation}</p>
          </div>
          <div>
            <p className="font-semibold text-emerald-300">Final Answer</p>
            <p className="font-bold text-emerald-300">{example.answer}</p>
          </div>
        </div>
      )}
    </div>
  );
}

const WATER_DENSITY = 1000;

/* ---------- Archimedes lab layout (pixels) ---------- */
const TANK_H = 360; // height of the tank box
const SURFACE_Y = 90; // y position of the fluid surface
const OBJ_SIZE = 96; // object is h-24 w-24 = 96px

/* ---------- Bernoulli simulator geometry (SVG units) ---------- */
const PIPE_X0 = 10;
const PIPE_X1 = 410;
const PIPE_LEN = PIPE_X1 - PIPE_X0;
const PIPE_CY = 150; // vertical centre of the pipe
const WIDE_H = 80; // half-height of the wide sections
const NARROW_H = 34; // half-height of the narrow section
const SPEED_RATIO = WIDE_H / NARROW_H; // continuity: narrower means faster
const LINE_FRACTIONS = [-0.8, -0.4, 0, 0.4, 0.8]; // where each streamline sits inside the pipe
const DOTS_PER_LINE = 8;
const TUBE_H = 52; // height of each pressure tube
const WIDE_TUBE_X = 60;
const NARROW_TUBE_X = 210;
const P_UPSTREAM = 200000; // Pa, pressure in the wide section (fixed)

function smoothstep(a: number, b: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

// Half-height of the pipe at horizontal position x: wide -> narrow -> wide
function halfHeight(x: number) {
  const down = smoothstep(110, 175, x);
  const up = smoothstep(245, 310, x);
  return WIDE_H - (WIDE_H - NARROW_H) * (down - up);
}

const PIPE_XS = Array.from({ length: PIPE_LEN / 4 + 1 }, (_, i) => PIPE_X0 + i * 4);

function linePath(fraction: number) {
  return PIPE_XS.map(
    (x, i) => `${i === 0 ? "M" : "L"}${x} ${(PIPE_CY + fraction * halfHeight(x)).toFixed(1)}`
  ).join(" ");
}

const PIPE_OUTLINE =
  linePath(-1) +
  " " +
  [...PIPE_XS]
    .reverse()
    .map((x) => `L${x} ${(PIPE_CY + halfHeight(x)).toFixed(1)}`)
    .join(" ") +
  " Z";

const STREAMLINE_PATHS = LINE_FRACTIONS.map((f) => linePath(f));

function initialDots(): number[][] {
  return LINE_FRACTIONS.map((_, i) => {
    const offset = (i * 0.37) % 1;
    return Array.from(
      { length: DOTS_PER_LINE },
      (_, j) => PIPE_X0 + ((j + offset) / DOTS_PER_LINE) * PIPE_LEN
    );
  });
}

export default function FluidsPage() {
  // Archimedes lab
  const [objectDensity, setObjectDensity] = useState(600);
  const [fluidDensity, setFluidDensity] = useState(1000);

  // Continuity lab
  const [areaIn, setAreaIn] = useState(8); // cm²
  const [areaOut, setAreaOut] = useState(4); // cm²
  const [speedIn, setSpeedIn] = useState(2); // m/s

  // Bernoulli demo
  const [flowSpeed, setFlowSpeed] = useState(2.5);
  const [dots, setDots] = useState<number[][]>(initialDots);
  const flowSpeedRef = useRef(flowSpeed);

  // Quiz
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const {
    saveState,
    saveMessage,
    passed,
    saveResult,
    resetResult,
  } = useLessonQuizResult();
  const [quizOrder, reshuffleQuiz] =
    useShuffledQuestionOrder(fluidOptionCounts);
  const quizAttempt = quizOrder.map(({ questionIndex, optionOrder }) => {
    const question = fluidQuestions[questionIndex];

    return {
      ...question,
      options: optionOrder.map((optionIndex) => question.options[optionIndex]),
      answer: optionOrder.indexOf(question.answer),
      questionIndex,
      originalOptions: question.options,
      optionOrder,
    };
  });

  // Keep the latest slider value available to the animation loop
  useEffect(() => {
    flowSpeedRef.current = flowSpeed;
  }, [flowSpeed]);

  // Animate the flow dots: they speed up wherever the pipe narrows
  useEffect(() => {
    let frame = 0;
    let last = performance.now();

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const baseSpeed = flowSpeedRef.current * 28; // SVG units per second in the wide section

      setDots((previous) =>
        previous.map((line) =>
          line.map((x) => {
            const next = x + baseSpeed * (WIDE_H / halfHeight(x)) * dt;
            return next > PIPE_X1 ? next - PIPE_LEN : next;
          })
        )
      );
      frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, []);

  // Derived values
  const isFloating = objectDensity < fluidDensity;
  const isSuspended = objectDensity === fluidDensity;
  const specificGravity = objectDensity / WATER_DENSITY;

  // Where the object sits in the tank:
  // - floating: the submerged fraction equals the density ratio, so it sinks lower as density rises
  // - equal density: hovers fully submerged in the middle
  // - denser than the fluid: rests on the bottom
  const objectTop = isFloating
    ? SURFACE_Y - (1 - objectDensity / fluidDensity) * OBJ_SIZE
    : isSuspended
    ? SURFACE_Y + (TANK_H - SURFACE_Y - OBJ_SIZE) / 2
    : TANK_H - OBJ_SIZE - 4;

  const speedOut = (areaIn * speedIn) / areaOut; // A1v1 = A2v2
  const flowRate = (areaIn / 10000) * speedIn; // Q = Av, m³/s
  // Bernoulli numbers (horizontal pipe, water): P1 + ½ρv1² = P2 + ½ρv2²
  const vWide = flowSpeed; // m/s
  const vNarrow = vWide * SPEED_RATIO; // m/s
  const pNarrow = P_UPSTREAM - 0.5 * WATER_DENSITY * (vNarrow ** 2 - vWide ** 2); // Pa
  const levelFor = (pressure: number) =>
    8 + Math.min(1, Math.max(0, (pressure - 140000) / 60000)) * (TUBE_H - 12);
  const wideLevel = levelFor(P_UPSTREAM);
  const narrowLevel = levelFor(pNarrow);
  const wideWallTop = PIPE_CY - WIDE_H;
  const narrowWallTop = PIPE_CY - NARROW_H;

  const score = quizAttempt.reduce(
    (total, question, index) => total + (answers[index] === question.answer ? 1 : 0),
    0
  );
  const answeredCount = Object.keys(answers).length;

  const resetQuiz = () => {
    setAnswers({});
    setSubmitted(false);
    resetResult();
    reshuffleQuiz();
  };

  const submitQuiz = () => {
    setSubmitted(true);
    void saveResult(
      "fluids",
      quizAttempt.map((_, index) => answers[index] ?? -1),
      quizAttempt.map((question) => ({
        question: question.question,
        choices: question.originalOptions,
        explanation: question.explanation,
        questionIndex: question.questionIndex,
        optionOrder: question.optionOrder,
      }))
    );
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
  return (
    <main className="flex h-full min-h-0 flex-col overflow-hidden bg-[#080D1B] text-[#F8FAFC]">

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div id="lesson-main-scroll" className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto w-full max-w-[1600px]">
        <LessonProgressTracker lessonSlug="fluids" />
        <LessonHeader
          module="Physics module 02"
          icon={<Droplets size={18} />}
          accentClass="text-sky-400"
          title={
            <>
              Fluids: <span className="text-sky-400">The Science of Flow</span>
            </>
          }
          description={
            <>
            Explore pressure, specific gravity, and density, why objects float or sink, how flow
            rate and continuity work, and how Bernoulli’s principle relates pressure to flow speed.
            </>
          }
        />

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
              <button
                type="button"
                onClick={() => {
                  setObjectDensity(600);
                  setFluidDensity(1000);
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5"
              >
                <RotateCcw size={14} /> Reset
              </button>
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

            <div>
              <div
                className="relative overflow-hidden rounded-2xl border border-sky-300/20 bg-[#080D1B]"
                style={{ height: TANK_H }}
              >
                {/* Water body (drawn over the object so the submerged part looks tinted) */}
                <div
                  className="pointer-events-none absolute inset-x-0 z-20 bg-sky-500/15"
                  style={{ top: SURFACE_Y, bottom: 0 }}
                />
                <div
                  className="pointer-events-none absolute inset-x-0 z-30 border-t-2 border-sky-300/70"
                  style={{ top: SURFACE_Y }}
                />
                <div
                  className="absolute left-4 z-30 text-xs font-semibold uppercase tracking-widest text-sky-300"
                  style={{ top: SURFACE_Y - 24 }}
                >
                  Fluid surface
                </div>
                <div className="absolute bottom-3 left-4 z-30 text-xs text-slate-500">Tank bottom</div>

                <motion.div
                  initial={false}
                  animate={{ y: objectTop, rotate: isFloating ? -4 : 0 }}
                  transition={{ type: "spring", stiffness: 70, damping: 12 }}
                  className="absolute left-1/2 top-0 z-10 -ml-12 flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-white/70 bg-violet-400/80 shadow-[0_0_45px_rgba(139,92,246,0.25)]"
                >
                  <span className="text-center text-xs font-black text-white">
                    OBJECT<br />{objectDensity}
                  </span>
                </motion.div>

                <div className="absolute bottom-3 right-4 z-30 text-xs text-slate-400">
                  Fluid: {fluidDensity} kg/m³
                </div>
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                Raise the object’s density and it sinks lower into the fluid. Once it is denser than
                the fluid, it drops to the bottom of the tank.
              </p>
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
              <button
                type="button"
                onClick={() => {
                  setAreaIn(8);
                  setAreaOut(4);
                  setSpeedIn(2);
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5"
              >
                <RotateCcw size={14} /> Reset
              </button>
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
          <div className="mb-6 grid gap-4 rounded-2xl border border-white/10 bg-[#080D1B] p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div>
              <h3 className="font-bold text-sky-300">Application: airflow around an airplane wing</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                The wing deflects air downward and creates a pressure distribution across its
                surfaces. Faster airflow over parts of the upper surface is associated with lower
                static pressure there; the pressure difference contributes to upward lift. The
                complete explanation also accounts for the air’s downward momentum change—there is
                no rule that air parcels must meet again at the wing’s trailing edge.
              </p>
            </div>
            <svg
              viewBox="0 0 360 150"
              role="img"
              aria-label="Airflow streamlines over and under an airplane wing, with lower pressure above and higher pressure below"
              className="w-full max-w-sm"
            >
              <defs>
                <marker id="wingFlowArrow" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="#7DD3FC" />
                </marker>
              </defs>
              <path d="M48 72 C112 20 228 24 314 68" fill="none" stroke="#7DD3FC" strokeWidth="2" markerEnd="url(#wingFlowArrow)" />
              <path d="M48 80 C120 48 232 48 314 75" fill="none" stroke="#7DD3FC" strokeWidth="2" markerEnd="url(#wingFlowArrow)" />
              <path d="M48 91 C130 106 224 105 314 91" fill="none" stroke="#A5B4FC" strokeWidth="2" markerEnd="url(#wingFlowArrow)" />
              <path d="M88 83 Q174 42 276 82 Q188 91 88 83Z" fill="#334155" stroke="#CBD5E1" strokeWidth="2" />
              <text x="180" y="19" fill="#7DD3FC" fontSize="12" textAnchor="middle">Faster flow · lower pressure</text>
              <text x="180" y="129" fill="#C4B5FD" fontSize="12" textAnchor="middle">Higher pressure below contributes to lift ↑</text>
            </svg>
          </div>
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="rounded-2xl border border-white/10 bg-[#080D1B] p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <label htmlFor="flowSpeed" className="text-sm text-slate-300">Flow speed (wide section)</label>
                <strong className="text-violet-300">{flowSpeed.toFixed(1)} m/s</strong>
              </div>
              <input
                id="flowSpeed"
                type="range"
                min="0.5"
                max="5"
                step="0.1"
                value={flowSpeed}
                onChange={(e) => setFlowSpeed(Number(e.target.value))}
                className="w-full accent-violet-400"
              />
              <button
                type="button"
                onClick={() => setFlowSpeed(2.5)}
                className="mt-3 inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5"
              >
                <RotateCcw size={14} /> Reset
              </button>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-xs text-slate-400">Wide: speed</p>
                  <p className="mt-1 text-xl font-bold text-sky-300">{vWide.toFixed(2)} m/s</p>
                </div>
                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-xs text-slate-400">Narrow: speed</p>
                  <p className="mt-1 text-xl font-bold text-violet-300">{vNarrow.toFixed(2)} m/s</p>
                </div>
                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-xs text-slate-400">Wide: pressure</p>
                  <p className="mt-1 text-xl font-bold text-sky-300">{(P_UPSTREAM / 1000).toFixed(1)} kPa</p>
                  <p className="text-xs text-slate-500">Fixed upstream pressure</p>
                </div>
                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-xs text-slate-400">Narrow: pressure</p>
                  <p className="mt-1 text-xl font-bold text-violet-300">{(pNarrow / 1000).toFixed(1)} kPa</p>
                  <p className="text-xs text-slate-500">{((pNarrow / P_UPSTREAM) * 100).toFixed(1)}% relative</p>
                </div>
              </div>
              <p className="mt-4 text-xs leading-5 text-slate-500">
                Assumes water (1000 kg/m³) in a horizontal pipe with 200 kPa in the wide section. The
                narrow-section speed follows continuity, and its pressure follows Bernoulli:
                P₂ = P₁ − ½ρ(v₂² − v₁²).
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#080D1B] p-4">
              <svg viewBox="0 0 420 260" role="img" aria-label="Water flowing through a pipe that narrows, with streamlines, moving dots and pressure tubes">
                {/* Pressure tubes */}
                <rect x={WIDE_TUBE_X - 9} y={wideWallTop - TUBE_H} width="18" height={TUBE_H} fill="none" stroke="#64748B" strokeWidth="2" />
                <rect x={WIDE_TUBE_X - 8} y={wideWallTop - wideLevel} width="16" height={wideLevel} fill="#38BDF8" fillOpacity=".7" />
                <rect x={NARROW_TUBE_X - 9} y={narrowWallTop - TUBE_H} width="18" height={TUBE_H} fill="none" stroke="#64748B" strokeWidth="2" />
                <rect x={NARROW_TUBE_X - 8} y={narrowWallTop - narrowLevel} width="16" height={narrowLevel} fill="#A78BFA" fillOpacity=".8" />
                <text x={WIDE_TUBE_X} y={wideWallTop - TUBE_H - 6} fill="#7DD3FC" fontSize="11" textAnchor="middle">
                  P₁ {(P_UPSTREAM / 1000).toFixed(0)} kPa
                </text>
                <text x={NARROW_TUBE_X} y={narrowWallTop - TUBE_H - 6} fill="#C4B5FD" fontSize="11" textAnchor="middle">
                  P₂ {(pNarrow / 1000).toFixed(0)} kPa
                </text>

                {/* Pipe */}
                <path d={PIPE_OUTLINE} fill="#17243A" stroke="#64748B" strokeWidth="2" />
                <path d={PIPE_OUTLINE} fill="#38BDF8" fillOpacity=".08" />

                {/* Streamlines */}
                {STREAMLINE_PATHS.map((d, i) => (
                  <path key={i} d={d} fill="none" stroke="#7DD3FC" strokeOpacity=".28" strokeWidth="1.5" />
                ))}

                {/* Moving dots: faster and more violet where the pipe is narrow */}
                {dots.map((line, i) =>
                  line.map((x, j) => {
                    const h = halfHeight(x);
                    const speedFactor = (WIDE_H / h - 1) / (SPEED_RATIO - 1); // 0 = wide, 1 = narrow
                    const hue = 195 + 80 * speedFactor;
                    return (
                      <circle
                        key={`${i}-${j}`}
                        cx={x}
                        cy={PIPE_CY + LINE_FRACTIONS[i] * h}
                        r="3.4"
                        fill={`hsl(${hue} 90% 68%)`}
                      />
                    );
                  })
                )}

                {/* Labels */}
                <text x="60" y="250" fill="#7DD3FC" fontSize="11" textAnchor="middle">Wide: slower, higher pressure</text>
                <text x="210" y="250" fill="#C4B5FD" fontSize="11" textAnchor="middle">Narrow: faster, lower pressure</text>
                <text x="350" y="250" fill="#7DD3FC" fontSize="11" textAnchor="middle">Flow →</text>
              </svg>
              <p className="mt-3 text-center text-xs text-slate-500">
                The dots speed up and spread out in the narrow section, and the streamlines squeeze
                together. Taller liquid in a tube means higher pressure.
              </p>
            </div>
          </div>
          <WorkedExample example={examples.bernoulli} />
        </section>

        {/* Quiz */}
        <section
          id="quiz"
          className="mb-12 scroll-mt-24 rounded-3xl border border-white/10 bg-[#111A2E] p-6 md:p-8"
        >
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-emerald-300">CHECK YOUR KNOWLEDGE</p>
              <h2 className="mt-2 text-2xl font-bold md:text-3xl">
                Fluids · {quizAttempt.length} questions
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Answer every question. Your score and explanations appear after submission.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-3">
                <p className="text-sm text-slate-300">Your score</p>
                <p className="text-2xl font-black text-emerald-300">
                  {submitted ? `${score} / ${quizAttempt.length}` : `${answeredCount} / ${quizAttempt.length}`}
                </p>
            </div>
          </div>

          <div className="mb-6 h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label="Quiz questions answered" aria-valuemin={0} aria-valuemax={quizAttempt.length} aria-valuenow={answeredCount}>
            <div className="h-full rounded-full bg-sky-400 transition-all" style={{ width: `${(answeredCount / quizAttempt.length) * 100}%` }} />
          </div>

          <div className="space-y-6">
            {quizAttempt.map((question, index) => (
              <LessonQuizQuestion key={index} number={index + 1}>
                <p className="font-semibold leading-6">
                  {question.question}
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {question.options.map((option, optionIndex) => {
                    const selected = answers[index] === optionIndex;
                    const correct = question.answer === optionIndex;
                    const optionState = submitted
                      ? correct
                        ? "correct"
                        : selected
                          ? "incorrect"
                          : "muted"
                      : selected
                        ? "selected"
                        : "default";

                    return (
                      <button
                        key={optionIndex}
                        type="button"
                        disabled={submitted}
                        onClick={() => setAnswers((previous) => ({ ...previous, [index]: optionIndex }))}
                        className={`${QUIZ_OPTION_BASE_CLASS} ${getQuizOptionClass(optionState)}`}
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
              </LessonQuizQuestion>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {!submitted ? (
              <button
                type="button"
                disabled={Object.keys(answers).length !== quizAttempt.length}
                onClick={submitQuiz}
                className={QUIZ_SUBMIT_BUTTON_CLASS}
              >
                Submit quiz <ArrowRight size={18} />
              </button>
            ) : (
              <button
                type="button"
                onClick={resetQuiz}
                className={QUIZ_RETRY_BUTTON_CLASS}
              >
                <RotateCcw size={18} /> Try again
              </button>
            )}
          </div>
          <LessonQuizFeedback
            saveState={saveState}
            passed={passed}
            message={saveMessage}
            onRetry={() =>
              void saveResult(
                "fluids",
                quizAttempt.map((_, index) => answers[index] ?? -1),
                quizAttempt.map((question) => ({
                  question: question.question,
                  choices: question.originalOptions,
                  explanation: question.explanation,
                  questionIndex: question.questionIndex,
                  optionOrder: question.optionOrder,
                }))
              )
            }
          />
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-slate-500">
          <Link href="/lessons/measurements-vectors" className="inline-flex items-center gap-2 text-sky-300 hover:text-sky-200">
            Previous lesson <ArrowLeft size={16} />
          </Link>
        </footer>
        </div>
        </div>
      </div>
    </main>
  );
}