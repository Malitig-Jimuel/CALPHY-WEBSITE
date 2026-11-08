"use client";

import type { PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Lightbulb,
  RotateCcw,
  XCircle,
} from "lucide-react";
import LessonHeader from "../LessonHeader";
import LessonProgressTracker from "../LessonProgressTracker";
import LessonNavigation from "../LessonNavigation";
import LessonQuizFeedback from "../LessonQuizFeedback";
import {
  LessonQuizEligibilityNotice,
  useLessonQuizEligibility,
} from "../LessonQuizEligibility";
import LessonQuizQuestion, {
  getQuizOptionClass,
  QUIZ_OPTION_BASE_CLASS,
  QUIZ_RETRY_BUTTON_CLASS,
  QUIZ_SUBMIT_BUTTON_CLASS,
} from "../LessonQuizQuestion";
import { useLessonQuizResult } from "../useLessonQuizResult";
import { useShuffledQuestionOrder } from "../quizRandomization";

const baseUnits = [
  { quantity: "Length", symbol: "m", unit: "meter", dimension: "[L]" },
  { quantity: "Mass", symbol: "kg", unit: "kilogram", dimension: "[M]" },
  { quantity: "Time", symbol: "s", unit: "second", dimension: "[T]" },
  {
    quantity: "Electric current",
    symbol: "A",
    unit: "ampere",
    dimension: "[I]",
  },
  {
    quantity: "Thermodynamic temperature",
    symbol: "K",
    unit: "kelvin",
    dimension: "[Θ]",
  },
  {
    quantity: "Amount of substance",
    symbol: "mol",
    unit: "mole",
    dimension: "[N]",
  },
  {
    quantity: "Luminous intensity",
    symbol: "cd",
    unit: "candela",
    dimension: "[J]",
  },
];

const derivedUnits = [
  { quantity: "Area", name: "square meter", symbol: "m²", dimensions: "[L²]" },
  { quantity: "Volume", name: "cubic meter", symbol: "m³", dimensions: "[L³]" },
  { quantity: "Speed / velocity", name: "meter per second", symbol: "m/s", dimensions: "[LT⁻¹]" },
  { quantity: "Acceleration", name: "meter per second squared", symbol: "m/s²", dimensions: "[LT⁻²]" },
  { quantity: "Force", name: "newton", symbol: "N = kg·m/s²", dimensions: "[MLT⁻²]" },
  { quantity: "Pressure", name: "pascal", symbol: "Pa = N/m²", dimensions: "[ML⁻¹T⁻²]" },
  { quantity: "Energy", name: "joule", symbol: "J = N·m", dimensions: "[ML²T⁻²]" },
  { quantity: "Power", name: "watt", symbol: "W = J/s", dimensions: "[ML²T⁻³]" },
  { quantity: "Density", name: "kilogram per cubic meter", symbol: "kg/m³", dimensions: "[ML⁻³]" },
];

const prefixes = [
  { name: "giga", symbol: "G", factor: "10⁹", example: "1 GW = 1,000,000,000 W" },
  { name: "mega", symbol: "M", factor: "10⁶", example: "1 MJ = 1,000,000 J" },
  { name: "kilo", symbol: "k", factor: "10³", example: "1 km = 1,000 m" },
  { name: "centi", symbol: "c", factor: "10⁻²", example: "1 cm = 0.01 m" },
  { name: "milli", symbol: "m", factor: "10⁻³", example: "1 mm = 0.001 m" },
  { name: "micro", symbol: "µ", factor: "10⁻⁶", example: "1 µm = 0.000001 m" },
  { name: "nano", symbol: "n", factor: "10⁻⁹", example: "1 ns = 0.000000001 s" },
];

const dimensionalQuantities = [
  {
    quantity: "Velocity",
    symbol: "v",
    definition: "Displacement divided by elapsed time",
    relation: "v = Δx / Δt",
    derivation: "[v] = [L] / [T]",
    dimensions: "[LT⁻¹]",
  },
  {
    quantity: "Acceleration",
    symbol: "a",
    definition: "Change in velocity divided by elapsed time",
    relation: "a = Δv / Δt",
    derivation: "[a] = [LT⁻¹] / [T]",
    dimensions: "[LT⁻²]",
  },
  {
    quantity: "Force",
    symbol: "F",
    definition: "Mass multiplied by acceleration",
    relation: "F = ma",
    derivation: "[F] = [M][LT⁻²]",
    dimensions: "[MLT⁻²]",
  },
  {
    quantity: "Work",
    symbol: "W",
    definition: "Force multiplied by displacement along the force",
    relation: "W = Fd",
    derivation: "[W] = [MLT⁻²][L]",
    dimensions: "[ML²T⁻²]",
  },
  {
    quantity: "Energy",
    symbol: "E",
    definition: "Work transferred to or from a system",
    relation: "E = W",
    derivation: "[E] = [W]",
    dimensions: "[ML²T⁻²]",
  },
  {
    quantity: "Power",
    symbol: "P",
    definition: "Work done divided by elapsed time",
    relation: "P = W / t",
    derivation: "[P] = [ML²T⁻²] / [T]",
    dimensions: "[ML²T⁻³]",
  },
  {
    quantity: "Pressure",
    symbol: "p",
    definition: "Force acting per unit area",
    relation: "p = F / A",
    derivation: "[p] = [MLT⁻²] / [L²]",
    dimensions: "[ML⁻¹T⁻²]",
  },
  {
    quantity: "Density",
    symbol: "ρ",
    definition: "Mass per unit volume",
    relation: "ρ = m / V",
    derivation: "[ρ] = [M] / [L³]",
    dimensions: "[ML⁻³]",
  },
] as const;

const dimensionalEquations = [
  {
    equation: "v = u + at",
    consistent: true,
    explanation:
      "[v] and [u] are both [LT⁻¹]. Also, [a][t] = [LT⁻²][T] = [LT⁻¹], so every term has the dimensions of velocity.",
  },
  {
    equation: "x = v + t",
    consistent: false,
    explanation:
      "[x] is [L], while [v] is [LT⁻¹] and [t] is [T]. The terms on the right have different dimensions and cannot be added; they also do not match the left side.",
  },
  {
    equation: "F = ma",
    consistent: true,
    explanation:
      "[m][a] = [M][LT⁻²] = [MLT⁻²], which matches the dimensions of force [F].",
  },
] as const;

const quiz = [
  {
    question: "Which statement best describes a measurement?",
    choices: [
      "A numerical estimate without a unit",
      "A comparison of a quantity with an agreed unit",
      "A description that must include direction",
      "A value that is always exact",
    ],
    answer: 1,
    explanation:
      "Measurement compares an unknown physical quantity with a defined standard unit and reports a number with that unit.",
  },
  {
    question: "Which is a derived physical quantity?",
    choices: ["Time", "Electric current", "Volume", "Thermodynamic temperature"],
    answer: 2,
    explanation:
      "Volume is derived from length cubed, so its SI unit is m³. Time, current, and temperature are fundamental quantities.",
  },
  {
    question: "What is the SI base unit for mass?",
    choices: ["gram (g)", "kilogram (kg)", "newton (N)", "pound (lb)"],
    answer: 1,
    explanation:
      "The SI base unit of mass is the kilogram (kg), not the gram.",
  },
  {
    question: "Convert 1.25 km to meters.",
    choices: ["125 m", "1,250 m", "12,500 m", "0.00125 m"],
    answer: 1,
    explanation:
      "Since 1 km = 1,000 m, 1.25 km × 1,000 m/km = 1,250 m.",
  },
  {
    question: "A cyclist travels at 72 km/h. What is this speed in m/s?",
    choices: ["12 m/s", "18 m/s", "20 m/s", "25.92 m/s"],
    answer: 2,
    explanation:
      "Convert units: 72 km/h × (1,000 m / 1 km) × (1 h / 3,600 s) = 20 m/s.",
  },
  {
    question: "How many significant figures are in 0.004560?",
    choices: ["3", "4", "5", "6"],
    answer: 1,
    explanation:
      "Leading zeros are not significant. The digits 4, 5, 6, and the trailing zero after the decimal are significant: 4 figures.",
  },
  {
    question: "A set of readings is close together but far from the accepted value. The readings are:",
    choices: ["Accurate and precise", "Accurate but not precise", "Precise but not accurate", "Neither accurate nor precise"],
    answer: 2,
    explanation:
      "Precision describes how close repeated readings are to one another; accuracy describes closeness to the accepted value.",
  },
  {
    question: "Which row correctly lists the SI units of force, energy, power, and pressure, in that order?",
    choices: [
      "N, J, W, Pa",
      "J, N, Pa, W",
      "kg, m, s, K",
      "Pa, W, J, N",
    ],
    answer: 0,
    explanation:
      "Force is measured in newtons (N), energy in joules (J), power in watts (W), and pressure in pascals (Pa).",
  },
  {
    question: "Which is a likely systematic error?",
    choices: [
      "A balance that always reads 0.2 g too high",
      "Small unpredictable differences when reading a scale",
      "A value changing randomly between trials",
      "Rounding the final answer",
    ],
    answer: 0,
    explanation:
      "A consistent zero offset shifts measurements in the same direction each time, which is characteristic of systematic error.",
  },
  {
    question: "Which equation is dimensionally consistent?",
    choices: ["distance = speed + time", "v = u + at", "force = mass + acceleration", "speed = distance × time"],
    answer: 1,
    explanation:
      "Both v and u have dimensions [LT⁻¹]. Also, [a][t] = [LT⁻²][T] = [LT⁻¹], so each term has the same dimensions.",
  },
  {
    question: "Convert 250 cm to meters using a conversion factor.",
    choices: ["0.25 m", "2.5 m", "25 m", "250,000 m"],
    answer: 1,
    explanation:
      "250 cm × (1 m / 100 cm) = 2.50 m. The centimeter units cancel.",
  },
  {
    question: "Which metric-prefix pairing is correct?",
    choices: [
      "nano (n) = 10⁻⁶ and micro (µ) = 10⁻⁹",
      "nano (n) = 10⁻⁹ and micro (µ) = 10⁻⁹",
      "nano (n) = 10⁻⁹ and micro (µ) = 10⁻⁶",
      "nano (n) = 10⁹ and micro (µ) = 10⁶",
    ],
    answer: 2,
    explanation:
      "The nano prefix means 10⁻⁹, while micro means 10⁻⁶.",
  },
  {
    question: "Why is weight a vector quantity?",
    choices: [
      "Weight is the amount of matter in an object.",
      "Weight is measured only in kilograms.",
      "Weight has magnitude but no direction.",
      "Weight is a force, so it has magnitude and direction.",
    ],
    answer: 3,
    explanation:
      "Weight is the gravitational force on an object. As a force, it has magnitude and direction (toward the attracting body).",
  },
  {
    question: "A 10 N force points 30° above the positive x-axis. What are its components?",
    choices: [
      "Fx = 5.00 N, Fy = 8.66 N",
      "Fx = 8.66 N, Fy = 5.00 N",
      "Fx = 10.0 N, Fy = 5.00 N",
      "Fx = 8.66 N, Fy = −5.00 N",
    ],
    answer: 1,
    explanation:
      "Fx = F cos 30° = 10(0.866) = 8.66 N. Fy = F sin 30° = 10(0.5) = 5.00 N.",
  },
  {
    question: "A vector has components Ax = 6 m and Ay = 8 m. What is its magnitude?",
    choices: ["2 m", "7 m", "10 m", "14 m"],
    answer: 2,
    explanation:
      "A = √(Ax² + Ay²) = √(6² + 8²) = √100 = 10 m.",
  },
  {
    question: "For A = 2î + 6ĵ − 5k̂, which expression is the unit vector Â?",
    choices: [
      "(2î + 6ĵ − 5k̂) / 8.06 m",
      "(î + ĵ − k̂) / 3",
      "(2î + 6ĵ − 5k̂) / √65",
      "2î + 6ĵ − 5k̂",
    ],
    answer: 2,
    explanation:
      "The magnitude is √(2² + 6² + (−5)²) = √65 ≈ 8.06. Divide the vector by its magnitude to get Â = A/|A|.",
  },
  {
    question: "Which statement correctly describes the head-to-tail and parallelogram methods?",
    choices: [
      "Both methods require the vectors to be perpendicular.",
      "Head-to-tail places the next tail at the previous head; parallelogram starts both vectors at one tail and uses the diagonal.",
      "Head-to-tail joins the arrowheads; parallelogram subtracts the shorter vector.",
      "The parallelogram diagonal always points along the larger vector.",
    ],
    answer: 1,
    explanation:
      "For head-to-tail addition, translate each vector without changing its magnitude or direction so its tail meets the preceding head. For the parallelogram method, draw both vectors tail-to-tail and use the diagonal from their shared tail.",
  },
  {
    question: "A 2 m east vector is subtracted from a 5 m east vector. What is the result?",
    choices: ["7 m east", "3 m east", "3 m west", "10 m east"],
    answer: 1,
    explanation:
      "A − B = 5 east + (−2 east) = 3 m east. Subtraction adds the reversed vector.",
  },
  {
    question: "Two forces of 4 N and 6 N have an angle of 60° between them. What is the resultant magnitude?",
    choices: ["2.00 N", "8.72 N", "10.00 N", "6.08 N"],
    answer: 1,
    explanation:
      "For an angle θ between vectors, R² = A² + B² + 2AB cos θ. Thus R = √(4² + 6² + 2·4·6·cos 60°) = √76 ≈ 8.72 N.",
  },
  {
    question: "Can 6 m and 5 m/s be added as physical quantities?",
    choices: [
      "Yes; the sum is 11 m/s.",
      "Yes; the sum is 11 m.",
      "No; length and velocity have different dimensions and units.",
      "No; only vectors can be added.",
    ],
    answer: 2,
    explanation:
      "Physical quantities can be added only when they have compatible dimensions. Length [L] and velocity [LT⁻¹] are different kinds of quantities.",
  },
];
const quizOptionCounts = quiz.map((question) => question.choices.length);

type ConversionCategory = "length" | "speed" | "mass";
type ConversionUnit = {
  value: string;
  toBase: number;
};

const conversionUnits: Record<
  ConversionCategory,
  {
    label: string;
    units: readonly ConversionUnit[];
    defaultFrom: string;
    defaultTo: string;
  }
> = {
  length: {
    label: "Length",
    units: [
      { value: "km", toBase: 1000 },
      { value: "m", toBase: 1 },
      { value: "cm", toBase: 0.01 },
      { value: "mm", toBase: 0.001 },
    ],
    defaultFrom: "km",
    defaultTo: "m",
  },
  speed: {
    label: "Speed",
    units: [
      { value: "km/h", toBase: 1 / 3.6 },
      { value: "m/s", toBase: 1 },
    ],
    defaultFrom: "km/h",
    defaultTo: "m/s",
  },
  mass: {
    label: "Mass",
    units: [
      { value: "kg", toBase: 1 },
      { value: "g", toBase: 0.001 },
      { value: "mg", toBase: 0.000001 },
    ],
    defaultFrom: "kg",
    defaultTo: "g",
  },
};

function isConversionCategory(value: string): value is ConversionCategory {
  return Object.prototype.hasOwnProperty.call(conversionUnits, value);
}

const scalarVectorItems = [
  { quantity: "Distance", kind: "scalar", explanation: "Distance is path length; it has magnitude only." },
  { quantity: "Speed", kind: "scalar", explanation: "Speed is the rate of distance traveled and has magnitude only." },
  { quantity: "Velocity", kind: "vector", explanation: "Velocity describes displacement per time and includes direction." },
  { quantity: "Force", kind: "vector", explanation: "A force has magnitude and a direction of action." },
  { quantity: "Weight", kind: "vector", explanation: "Weight is the gravitational force, directed toward the attracting body." },
  { quantity: "Mass", kind: "scalar", explanation: "Mass measures inertia and has magnitude only." },
  { quantity: "Time", kind: "scalar", explanation: "Elapsed time has magnitude only." },
  { quantity: "Volume", kind: "scalar", explanation: "Volume measures three-dimensional space and has magnitude only." },
] as const;

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
    <div className="mb-5">
      <p className="text-xs font-bold uppercase tracking-widest text-sky-400">
        SECTION {number}
      </p>
      <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
        {title}
      </h2>
      <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400 sm:text-base">
        {subtitle}
      </p>
    </div>
  );
}

function WorkedExample({
  title,
  problem,
  steps,
  solution,
  answer,
}: {
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
}) {
  const [open, setOpen] = useState(false);

  return (
    <article className="rounded-2xl border border-white/10 bg-[#080D1B] p-5">
      <p className="text-sm font-bold text-orange-300">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{problem}</p>
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
            <p className="font-semibold text-sky-300">Key steps</p>
            <ol className="mt-1 list-inside list-decimal space-y-1 text-slate-400">
              {steps.map((step, index) => (
                <li key={`${index}-${step}`}>{step}</li>
              ))}
            </ol>
          </div>
          <div>
            <p className="font-semibold text-sky-300">Given</p>
            <p className="text-slate-400">{solution.given}</p>
          </div>
          <div>
            <p className="font-semibold text-sky-300">Find</p>
            <p className="text-slate-400">{solution.find}</p>
          </div>
          <div>
            <p className="font-semibold text-sky-300">Formula</p>
            <p className="text-slate-400">{solution.formula}</p>
          </div>
          <div>
            <p className="font-semibold text-sky-300">Substitution</p>
            <p className="text-slate-400">{solution.substitution}</p>
          </div>
          <div>
            <p className="font-semibold text-sky-300">Calculation</p>
            <p className="text-slate-400">{solution.calculation}</p>
          </div>
          <div>
            <p className="font-semibold text-emerald-300">Final Answer</p>
            <p className="font-bold text-emerald-300">{answer}</p>
          </div>
        </div>
      )}
    </article>
  );
}

function TableFrame({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      {children}
    </div>
  );
}

const tableClass = "w-full min-w-[560px] text-left text-sm";
const thClass = "bg-white/5 px-4 py-3 font-semibold text-slate-300";
const tdClass = "border-t border-white/5 px-4 py-3 text-slate-400";

export default function MeasurementsVectorsPage() {
  const { eligibility, error: eligibilityError, refresh: refreshEligibility } =
    useLessonQuizEligibility("measurements-vectors");
  const [magnitudeA, setMagnitudeA] = useState(8);
  const [angleA, setAngleA] = useState(30);
  const [magnitudeB, setMagnitudeB] = useState(6);
  const [angleB, setAngleB] = useState(120);
  const [draggingVector, setDraggingVector] = useState<"A" | "B" | null>(null);
  const [vectorOperation, setVectorOperation] = useState<"add" | "subtract">("add");
  const [showHeadToTail, setShowHeadToTail] = useState(false);
  const [showParallelogram, setShowParallelogram] = useState(false);
  const [conversionCategory, setConversionCategory] =
    useState<ConversionCategory>("length");
  const [conversionValue, setConversionValue] = useState("2.5");
  const [conversionFrom, setConversionFrom] = useState("km");
  const [conversionTo, setConversionTo] = useState("m");
  const [conversionResult, setConversionResult] = useState<string | null>(null);
  const [practiceAnswer, setPracticeAnswer] = useState<string | null>(null);
  const [scalarVectorAnswers, setScalarVectorAnswers] =
    useState<Record<string, "scalar" | "vector">>({});
  const [selectedDimensionIndex, setSelectedDimensionIndex] = useState(0);
  const [selectedEquationIndex, setSelectedEquationIndex] = useState(0);
  const [equationAnswer, setEquationAnswer] = useState<boolean | null>(null);
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
    useShuffledQuestionOrder(quizOptionCounts);
  const quizAttempt = quizOrder.map(({ questionIndex, optionOrder }) => {
    const question = quiz[questionIndex];

    return {
      ...question,
      choices: optionOrder.map((optionIndex) => question.choices[optionIndex]),
      answer: optionOrder.indexOf(question.answer),
      questionIndex,
      originalChoices: question.choices,
      optionOrder,
    };
  });
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const ax = magnitudeA * Math.cos(toRadians(angleA));
  const ay = magnitudeA * Math.sin(toRadians(angleA));
  const bx = magnitudeB * Math.cos(toRadians(angleB));
  const by = magnitudeB * Math.sin(toRadians(angleB));
  const operationSign = vectorOperation === "add" ? 1 : -1;
  const operationBx = operationSign * bx;
  const operationBy = operationSign * by;
  const rx = ax + operationBx;
  const ry = ay + operationBy;
  const resultant = Math.hypot(rx, ry);
  const resultantAngle = (Math.atan2(ry, rx) * 180) / Math.PI;
  const normalizedAngle = (resultantAngle + 360) % 360;
  const unitVectorYTerm =
    ry < 0
      ? `− ${Math.abs(ry).toFixed(2)} ĵ`
      : `+ ${ry.toFixed(2)} ĵ`;
  const graphCenter = 180;
  const graphScale = 3.5;
  const pointA = { x: graphCenter + ax * graphScale, y: graphCenter - ay * graphScale };
  const pointB = { x: graphCenter + bx * graphScale, y: graphCenter - by * graphScale };
  const pointOperationB = {
    x: graphCenter + operationBx * graphScale,
    y: graphCenter - operationBy * graphScale,
  };
  const pointR = { x: graphCenter + rx * graphScale, y: graphCenter - ry * graphScale };
  function startVectorDrag(event: ReactPointerEvent<SVGSVGElement>) {
    const vector = (event.target as Element)
      .closest("[data-vector]")
      ?.getAttribute("data-vector");
    if (vector !== "A" && vector !== "B") return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDraggingVector(vector);
  }

  function moveVectorFromPointer(event: ReactPointerEvent<SVGSVGElement>) {
    if (!draggingVector) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 360;
    const y = ((event.clientY - bounds.top) / bounds.height) * 360;
    const dx = x - graphCenter;
    const dy = graphCenter - y;
    const rawMagnitude = Math.hypot(dx, dy) / graphScale;
    const nextMagnitude = Math.min(20, rawMagnitude);
    const nextAngle =
      rawMagnitude < 0.05
        ? draggingVector === "A"
          ? angleA
          : angleB
        : (Math.atan2(dy, dx) * 180) / Math.PI;
    const normalizedNextAngle = (nextAngle + 360) % 360;

    if (draggingVector === "A") {
      setMagnitudeA(Math.round(nextMagnitude * 10) / 10);
      setAngleA(Math.round(normalizedNextAngle) % 360);
    } else {
      setMagnitudeB(Math.round(nextMagnitude * 10) / 10);
      setAngleB(Math.round(normalizedNextAngle) % 360);
    }
  }

  const score = quizAttempt.reduce(
    (total, question, index) =>
      total + (answers[index] === question.answer ? 1 : 0),
    0
  );
  const answeredCount = Object.keys(answers).length;

  function convertUnits() {
    const value = Number(conversionValue);
    if (!conversionValue.trim() || !Number.isFinite(value) || value < 0) {
      setConversionResult("Enter a finite, nonnegative value before converting.");
      return;
    }

    const units = conversionUnits[conversionCategory].units;
    const sourceUnit = units.find((unit) => unit.value === conversionFrom);
    const targetUnit = units.find((unit) => unit.value === conversionTo);
    if (!sourceUnit || !targetUnit) {
      setConversionResult("Choose valid units for the selected quantity.");
      return;
    }

    const converted = (value * sourceUnit.toBase) / targetUnit.toBase;
    if (!Number.isFinite(converted)) {
      setConversionResult("The converted value is outside the supported numeric range.");
      return;
    }
    setConversionResult(
      `${value} ${conversionFrom} = ${Number(converted.toPrecision(8))} ${conversionTo}`
    );
  }

  function isConversionError(result: string | null) {
    return (
      result?.startsWith("Enter a finite") === true ||
      result?.startsWith("Choose valid") === true ||
      result?.startsWith("The converted value") === true
    );
  }

  async function submitQuiz() {
    if (answeredCount !== quizAttempt.length || !eligibility?.eligible) return;
    const saved = await saveResult(
      "measurements-vectors",
      quizAttempt.map((_, index) => answers[index] ?? -1),
      quizAttempt.map((question) => ({
        question: question.question,
        choices: question.originalChoices,
        explanation: question.explanation,
        questionIndex: question.questionIndex,
        optionOrder: question.optionOrder,
      }))
    );
    if (saved) setSubmitted(true);
  }

  function resetQuiz() {
    setAnswers({});
    setSubmitted(false);
    resetResult();
    reshuffleQuiz();
  }

  return (
    <main className="flex h-full min-h-0 flex-col overflow-hidden bg-[#080D1B] text-slate-100">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div
          id="lesson-main-scroll"
          className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 sm:px-6 lg:px-10"
        >
          <div className="mx-auto w-full max-w-[1600px] space-y-10">
            <LessonProgressTracker lessonSlug="measurements-vectors" />
            <LessonHeader
              module="Physics module 01"
              icon={<BookOpen size={16} />}
              accentClass="text-sky-400"
              title={
                <>
                  Measurements <span className="text-sky-400">&amp; Vectors</span>
                </>
              }
              description="Build a reliable foundation in measurement, units, uncertainty, dimensional analysis, and two-dimensional vectors. Work through examples, try the interactive tools, then check your understanding."
            />

            <div className="rounded-xl border border-sky-400/15 bg-sky-400/5 p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-sky-300">
                <Lightbulb size={16} /> How to use this lesson
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Read the concept cards, follow the worked solutions line by
                line, and try the practice activities before using the lesson
                links in the sidebar to explore another topic.
              </p>
            </div>

            <section id="measurement" className="scroll-mt-6">
              <SectionHeading
                number="01"
                title="Introduction to Measurement"
                subtitle="Physics describes the natural world by measuring quantities and comparing observations with shared standards."
              />
              <div className="grid gap-5 lg:grid-cols-2">
                <article className="rounded-2xl border border-white/10 bg-[#10182B] p-6">
                  <h3 className="text-lg font-bold text-sky-300">What is measurement?</h3>
                  <p className="mt-3 leading-7 text-slate-300">
                    Measurement is the process of comparing an unknown quantity
                    with an agreed standard unit. A complete measurement has a
                    numerical value and a unit: 2.4 seconds, 0.75 kilograms, or
                    18 meters. The unit gives the value meaning and makes it
                    possible for other people to reproduce or compare the result.
                  </p>
                  <p className="mt-3 leading-7 text-slate-400">
                    Measurements matter because physical laws connect measurable
                    quantities. Engineers use them to design safe structures;
                    clinicians use them to monitor health; and scientists use
                    them to test models against observations.
                  </p>
                </article>
                <article className="rounded-2xl border border-white/10 bg-[#10182B] p-6">
                  <h3 className="text-lg font-bold text-violet-300">Classifying quantities</h3>
                  <p className="mt-3 leading-7 text-slate-300">
                    Fundamental quantities are defined independently, such as
                    length and time. Derived quantities combine fundamental
                    quantities: speed is distance divided by time, while area
                    is length multiplied by length. Quantities can also be
                    classified by direction: scalars have magnitude only;
                    vectors have magnitude and direction.
                  </p>
                  <p className="mt-3 leading-7 text-slate-400">
                    Everyday measurements include the temperature of a room,
                    the mass of groceries, the time for a trip, and the
                    displacement from home to school.
                  </p>
                </article>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <WorkedExample
                  title="Example · Fundamental or derived?"
                  problem="Classify a 12 m/s running speed."
                  steps={[
                    "Speed is calculated from distance divided by elapsed time.",
                    "Its SI units are meters per second, combining length and time.",
                    "Therefore speed is a derived quantity; its dimensions are [LT⁻¹].",
                  ]}
                  solution={{
                    given: "A running speed of 12 m/s.",
                    find: "Whether speed is fundamental or derived, and whether it is scalar or vector.",
                    formula: "Speed = distance ÷ elapsed time.",
                    substitution: "No distance or elapsed-time values are provided to substitute.",
                    calculation: "The unit m/s combines length and time ([LT⁻¹]), so speed is derived; speed alone is scalar.",
                  }}
                  answer="Classification: derived quantity; scalar if only speed (not velocity) is reported."
                />
                <WorkedExample
                  title="Example · Reading a measurement"
                  problem="A stopwatch records 8.42 s for a short event. Identify the measured quantity, value, and unit."
                  steps={[
                    "The instrument compares the event duration with its time scale.",
                    "The physical quantity is time; the numerical value is 8.42.",
                    "The unit is the second, symbol s.",
                  ]}
                  solution={{
                    given: "A stopwatch reading of 8.42 s.",
                    find: "The measured quantity, numerical value, and unit.",
                    formula: "No calculation formula is needed to identify the measurement.",
                    substitution: "Read the stopwatch value as 8.42 and its unit as seconds.",
                    calculation: "The measured quantity is elapsed time.",
                  }}
                  answer="Report: elapsed time = 8.42 s."
                />
              </div>
            </section>

            <section id="units" className="scroll-mt-6">
              <SectionHeading
                number="02"
                title="Units and Measurement Systems"
                subtitle="The SI system provides a consistent foundation for reporting measurements and building derived units."
              />
              <article className="rounded-2xl border border-white/10 bg-[#10182B] p-5 sm:p-6">
                <h3 className="mb-4 text-lg font-bold">Seven SI base quantities</h3>
                <TableFrame>
                  <table className={tableClass}>
                    <thead>
                      <tr>
                        <th className={thClass}>Base quantity</th>
                        <th className={thClass}>SI unit</th>
                        <th className={thClass}>Symbol</th>
                        <th className={thClass}>Dimension</th>
                      </tr>
                    </thead>
                    <tbody>
                      {baseUnits.map((unit) => (
                        <tr key={unit.symbol}>
                          <td className={tdClass}>{unit.quantity}</td>
                          <td className={tdClass}>{unit.unit}</td>
                          <td className={`${tdClass} font-mono text-sky-300`}>{unit.symbol}</td>
                          <td className={`${tdClass} font-mono`}>{unit.dimension}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TableFrame>
              </article>

              <article className="mt-5 rounded-2xl border border-white/10 bg-[#10182B] p-5 sm:p-6">
                <h3 className="mb-4 text-lg font-bold">Common derived SI units</h3>
                <TableFrame>
                  <table className={tableClass}>
                    <thead>
                      <tr>
                        <th className={thClass}>Quantity</th>
                        <th className={thClass}>Unit</th>
                        <th className={thClass}>Unit expression</th>
                        <th className={thClass}>Dimensions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {derivedUnits.map((unit) => (
                        <tr key={unit.quantity}>
                          <td className={tdClass}>{unit.quantity}</td>
                          <td className={tdClass}>{unit.name}</td>
                          <td className={`${tdClass} font-mono text-sky-300`}>{unit.symbol}</td>
                          <td className={`${tdClass} font-mono`}>{unit.dimensions}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TableFrame>
              </article>

              <article className="mt-5 rounded-2xl border border-white/10 bg-[#10182B] p-5 sm:p-6">
                <h3 className="mb-4 text-lg font-bold">Metric prefixes</h3>
                <TableFrame>
                  <table className={tableClass}>
                    <thead>
                      <tr>
                        <th className={thClass}>Prefix</th>
                        <th className={thClass}>Symbol</th>
                        <th className={thClass}>Factor</th>
                        <th className={thClass}>Example</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prefixes.map((prefix) => (
                        <tr key={prefix.name}>
                          <td className={tdClass}>{prefix.name}</td>
                          <td className={`${tdClass} font-mono text-sky-300`}>{prefix.symbol}</td>
                          <td className={`${tdClass} font-mono`}>{prefix.factor}</td>
                          <td className={tdClass}>{prefix.example}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TableFrame>
              </article>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <WorkedExample
                  title="Worked conversion · centimeters to meters"
                  problem="Convert 325 cm to meters."
                  steps={[
                    "Use the equality 1 m = 100 cm to create a factor equal to one.",
                    "325 cm × (1 m / 100 cm) = 3.25 m.",
                    "The centimeter units cancel, leaving meters.",
                  ]}
                  solution={{
                    given: "325 cm; 1 m = 100 cm.",
                    find: "The length in meters.",
                    formula: "Multiply by a conversion factor equal to one: (1 m / 100 cm).",
                    substitution: "325 cm × (1 m / 100 cm).",
                    calculation: "Cancel cm and calculate 325 ÷ 100 = 3.25 m.",
                  }}
                  answer="325 cm = 3.25 m."
                />
                <WorkedExample
                  title="Worked conversion · speed"
                  problem="Convert 90 km/h to m/s."
                  steps={[
                    "Write conversion factors: 90 km/h × (1,000 m / 1 km) × (1 h / 3,600 s).",
                    "Cancel km and h; calculate 90,000 / 3,600.",
                    "The remaining unit is m/s.",
                  ]}
                  solution={{
                    given: "90 km/h.",
                    find: "The speed in meters per second.",
                    formula: "Use 1 km = 1,000 m and 1 h = 3,600 s.",
                    substitution: "90 km/h × (1,000 m / 1 km) × (1 h / 3,600 s).",
                    calculation: "Cancel km and h; 90,000 ÷ 3,600 = 25 m/s.",
                  }}
                  answer="90 km/h = 25 m/s."
                />
              </div>

              <div className="mt-5 rounded-2xl border border-cyan-400/15 bg-cyan-400/5 p-5">
                <h3 className="font-bold text-cyan-300">Try a unit conversion</h3>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Convert lengths, speeds, or masses using equivalent base-unit
                  factors.
                </p>
                <div className="mt-4 flex flex-wrap items-end gap-3">
                  <label className="text-sm text-slate-300">
                    Quantity
                    <select
                      value={conversionCategory}
                      onChange={(event) => {
                        const nextCategory = event.target.value;
                        if (!isConversionCategory(nextCategory)) return;
                        setConversionCategory(nextCategory);
                        setConversionFrom(
                          conversionUnits[nextCategory].defaultFrom
                        );
                        setConversionTo(conversionUnits[nextCategory].defaultTo);
                        setConversionResult(null);
                      }}
                      className="mt-2 block rounded-xl border border-white/10 bg-[#080D1B] px-3 py-2 text-white"
                    >
                      {Object.entries(conversionUnits).map(([key, category]) => (
                        <option key={key} value={key}>{category.label}</option>
                      ))}
                    </select>
                  </label>
                  <label className="min-w-32 flex-1 text-sm text-slate-300">
                    Value
                    <input
                      type="number"
                      min="0"
                      step="any"
                      aria-describedby={
                        isConversionError(conversionResult)
                          ? "conversion-result"
                          : undefined
                      }
                      aria-invalid={isConversionError(conversionResult)}
                      value={conversionValue}
                      onChange={(event) => {
                        setConversionValue(event.target.value);
                        setConversionResult(null);
                      }}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-[#080D1B] px-3 py-2 text-white outline-none focus:border-cyan-300"
                    />
                  </label>
                  <label className="text-sm text-slate-300">
                    From
                    <select
                      value={conversionFrom}
                      onChange={(event) => {
                        setConversionFrom(event.target.value);
                        setConversionResult(null);
                      }}
                      className="mt-2 block rounded-xl border border-white/10 bg-[#080D1B] px-3 py-2 text-white"
                    >
                      {conversionUnits[conversionCategory].units.map((unit) => (
                        <option key={unit.value} value={unit.value}>{unit.value}</option>
                      ))}
                    </select>
                  </label>
                  <span className="pb-2 text-slate-500">to</span>
                  <label className="text-sm text-slate-300">
                    To
                    <select
                      value={conversionTo}
                      onChange={(event) => {
                        setConversionTo(event.target.value);
                        setConversionResult(null);
                      }}
                      className="mt-2 block rounded-xl border border-white/10 bg-[#080D1B] px-3 py-2 text-white"
                    >
                      {conversionUnits[conversionCategory].units.map((unit) => (
                        <option key={unit.value} value={unit.value}>{unit.value}</option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    onClick={convertUnits}
                    className="rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-200"
                  >
                    Convert
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const defaults = conversionUnits[conversionCategory];
                      setConversionValue(
                        conversionCategory === "length" ? "2.5" : "1"
                      );
                      setConversionFrom(defaults.defaultFrom);
                      setConversionTo(defaults.defaultTo);
                      setConversionResult(null);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
                  >
                    <RotateCcw size={14} /> Reset
                  </button>
                </div>
                {conversionResult && (
                  <p
                    id="conversion-result"
                    className="mt-4 rounded-xl bg-[#080D1B] p-3 text-sm font-semibold text-cyan-200"
                    aria-live="polite"
                    role={isConversionError(conversionResult) ? "alert" : undefined}
                  >
                    {conversionResult}
                  </p>
                )}
              </div>
            </section>

            <section id="uncertainty" className="scroll-mt-6">
              <SectionHeading
                number="03"
                title="Accuracy, Precision, and Uncertainty"
                subtitle="Measurements are observations with finite resolution, so good science reports their reliability rather than implying impossible exactness."
              />
              <div className="grid gap-5 lg:grid-cols-2">
                <article className="rounded-2xl border border-white/10 bg-[#10182B] p-6">
                  <h3 className="text-lg font-bold text-sky-300">Accuracy and precision</h3>
                  <p className="mt-3 leading-7 text-slate-300">
                    <strong className="text-white">Accuracy</strong> describes
                    closeness to an accepted or true value.{" "}
                    <strong className="text-white">Precision</strong> describes
                    how closely repeated measurements agree with one another.
                    Repeated readings can be precise but inaccurate if an
                    instrument has a consistent calibration offset.
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-[#080D1B] p-4">
                      <p className="font-bold text-emerald-300">Random error</p>
                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        Unpredictable variation, such as reaction time or
                        estimating between scale marks. Repeat and average
                        readings to reduce its effect.
                      </p>
                    </div>
                    <div className="rounded-xl bg-[#080D1B] p-4">
                      <p className="font-bold text-amber-300">Systematic error</p>
                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        A consistent bias, such as a scale with a nonzero
                        starting point. Check calibration and correct the cause.
                      </p>
                    </div>
                  </div>
                </article>
                <article className="rounded-2xl border border-white/10 bg-[#10182B] p-6">
                  <h3 className="text-lg font-bold text-violet-300">Significant figures</h3>
                  <p className="mt-3 leading-7 text-slate-300">
                    Significant figures communicate the precision supported by
                    a measured value. Nonzero digits are significant; zeros
                    between nonzero digits are significant; leading zeros only
                    locate the decimal point; and trailing zeros after a
                    decimal point are significant.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-400">
                    <li><strong className="text-white">0.00450</strong> has 3 significant figures (4, 5, 0).</li>
                    <li><strong className="text-white">2,030</strong> is ambiguous without notation; write 2.030 × 10³ for 4 significant figures.</li>
                    <li>For multiplication/division, round to the fewest significant figures in the inputs.</li>
                    <li>For addition/subtraction, round to the least precise decimal place.</li>
                  </ul>
                  <p className="mt-4 rounded-xl bg-[#080D1B] p-4 text-sm leading-6 text-slate-400">
                    Scientific notation writes a value as a number from 1 up
                    to (but not including) 10 multiplied by a power of ten.
                    For example, 0.00072 m = 7.2 × 10⁻⁴ m; the coefficient
                    shows two significant figures clearly.
                  </p>
                </article>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <WorkedExample
                  title="Worked example · rounding"
                  problem="Round 0.006384 to three significant figures."
                  steps={[
                    "Ignore the leading zeros; the first three significant digits are 6, 3, and 8.",
                    "The next digit is 4, which is less than 5, so the 8 does not change.",
                    "Keep the place value clear by using scientific notation if needed.",
                  ]}
                  solution={{
                    given: "0.006384, rounded to three significant figures.",
                    find: "The value rounded to three significant figures.",
                    formula: "Keep the first three significant digits and use the next digit to decide whether to round.",
                    substitution: "The first three significant digits are 6, 3, and 8; the next digit is 4.",
                    calculation: "Since 4 is less than 5, retain 8: 0.00638.",
                  }}
                  answer="0.006384 ≈ 0.00638 (3 significant figures)."
                />
                <WorkedExample
                  title="Worked example · multiplication and addition"
                  problem="Calculate 2.34 × 1.2 and 12.11 + 0.3, then round each result correctly."
                  steps={[
                    "Multiplication: 2.34 × 1.2 = 2.808; the least precise factor has 2 significant figures.",
                    "Round 2.808 to 2 significant figures: 2.8.",
                    "Addition: 12.11 + 0.3 = 12.41; the least precise addend is to the tenths place.",
                    "Round to the tenths place: 12.4.",
                  ]}
                  solution={{
                    given: "2.34 × 1.2 and 12.11 + 0.3.",
                    find: "Each result rounded according to the appropriate precision rule.",
                    formula: "For multiplication, use the fewest significant figures; for addition, use the least precise decimal place.",
                    substitution: "2.34 × 1.2 = 2.808 (2 significant figures); 12.11 + 0.3 = 12.41 (tenths place).",
                    calculation: "Round 2.808 to 2.8 and 12.41 to 12.4.",
                  }}
                  answer="2.34 × 1.2 = 2.8; 12.11 + 0.3 = 12.4."
                />
                <WorkedExample
                  title="Worked example · measured value"
                  problem="A ruler marked in millimeters gives a length of 12.4 cm. How should the result be reported?"
                  steps={[
                    "Record the value to the scale's supported resolution, rather than adding unsupported digits.",
                    "If the smallest readable interval is 0.1 cm, the last digit is uncertain by about half an interval.",
                    "State the uncertainty and unit so the precision is explicit.",
                  ]}
                  solution={{
                    given: "Measured length 12.4 cm; ruler divisions are 1 mm (0.1 cm).",
                    find: "A report that includes the reading uncertainty.",
                    formula: "For an ideal reading, uncertainty is about half the smallest interval.",
                    substitution: "Half of 0.1 cm is 0.05 cm.",
                    calculation: "Report the measured length with the uncertainty and unit: (12.4 ± 0.05) cm.",
                  }}
                  answer="A suitable report is (12.4 ± 0.05) cm, given 1 mm scale divisions and ideal reading."
                />
              </div>

              <div className="mt-5 rounded-2xl border border-violet-400/15 bg-violet-400/5 p-5">
                <h3 className="font-bold text-violet-300">Practice · significant figures</h3>
                <p className="mt-2 text-sm text-slate-300">
                  How many significant figures are in <strong>0.007020</strong>?
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["2", "3", "4", "5"].map((choice) => {
                    const selected = practiceAnswer === choice;
                    const correct = choice === "4";
                    const state = practiceAnswer
                      ? correct ? "correct" : selected ? "incorrect" : "muted"
                      : "default";
                    return (
                      <button
                        key={choice}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setPracticeAnswer(choice)}
                        className={`${QUIZ_OPTION_BASE_CLASS} ${getQuizOptionClass(state)}`}
                      >
                        {choice}
                      </button>
                    );
                  })}
                </div>
                {practiceAnswer && (
                  <p className="mt-3 text-sm leading-6 text-slate-300" aria-live="polite">
                    {practiceAnswer === "4"
                      ? "Correct. The significant digits are 7, 0, 2, and the trailing 0; leading zeros are not significant."
                      : "Not quite. Ignore the leading zeros; the zero between 7 and 2 and the trailing decimal zero both count."}
                  </p>
                )}
              </div>
            </section>

            <section id="dimensional-analysis" className="scroll-mt-6">
              <SectionHeading
                number="04"
                title="Dimensional Analysis"
                subtitle="Use the dimensions of physical quantities to derive dimensional formulas, check equations, and reason about relationships between measurements."
              />
              <div className="grid gap-5 lg:grid-cols-2">
                <article className="rounded-2xl border border-white/10 bg-[#10182B] p-6">
                  <h3 className="text-lg font-bold text-sky-300">
                    Quantities, units, and dimensions
                  </h3>
                  <p className="mt-3 leading-7 text-slate-300">
                    <strong className="text-white">Dimensional analysis</strong>{" "}
                    describes physical relationships using powers of
                    fundamental dimensions. It helps us check whether the two
                    sides of an equation could represent the same kind of
                    quantity, derive the dimensions of new quantities, and
                    catch mistakes before substituting numbers.
                  </p>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-400">
                    <li>
                      A <strong className="text-white">physical quantity</strong>{" "}
                      is a measurable property, such as a duration or a
                      distance.
                    </li>
                    <li>
                      A <strong className="text-white">unit</strong> is an
                      agreed standard used to report the quantity: seconds (s)
                      for duration or meters (m) for distance.
                    </li>
                    <li>
                      A <strong className="text-white">dimension</strong>{" "}
                      describes the quantity&apos;s physical nature: time has
                      dimension [T], while length has dimension [L]. Changing
                      from meters to centimeters changes the unit, not the
                      dimension.
                    </li>
                  </ul>
                </article>
                <article className="rounded-2xl border border-white/10 bg-[#10182B] p-6">
                  <h3 className="text-lg font-bold text-violet-300">
                    Fundamental dimensions
                  </h3>
                  <p className="mt-3 leading-7 text-slate-300">
                    In mechanics, most dimensional formulas are built from
                    mass [M], length [L], and time [T]. These are independent
                    building blocks: for example, velocity is length per
                    time, [LT⁻¹], and force combines mass, length, and time,
                    [MLT⁻²].
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {[
                      ["Mass", "[M]", "kilogram (kg)"],
                      ["Length", "[L]", "meter (m)"],
                      ["Time", "[T]", "second (s)"],
                      ["Temperature", "[Θ]", "kelvin (K)"],
                    ].map(([quantity, dimension, unit]) => (
                      <div
                        key={quantity}
                        className="rounded-xl bg-[#080D1B] p-4"
                      >
                        <p className="font-semibold text-white">{quantity}</p>
                        <p className="mt-1 font-mono text-sky-300">
                          {dimension}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">{unit}</p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-400">
                    Other SI base dimensions include electric current [I],
                    amount of substance [N], and luminous intensity [J].
                    Temperature is written [Θ] when thermal quantities are
                    involved.
                  </p>
                </article>
              </div>

              <article className="mt-5 rounded-2xl border border-white/10 bg-[#10182B] p-5 sm:p-6">
                <h3 className="mb-4 text-lg font-bold">
                  Common dimensional formulas and their derivations
                </h3>
                <TableFrame>
                  <table className={`${tableClass} min-w-[760px]`}>
                    <thead>
                      <tr>
                        <th className={thClass}>Quantity</th>
                        <th className={thClass}>Defining relation</th>
                        <th className={thClass}>Dimensional substitution</th>
                        <th className={thClass}>Dimensional formula</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dimensionalQuantities.map((quantity) => (
                        <tr key={quantity.quantity}>
                          <td className={tdClass}>{quantity.quantity}</td>
                          <td className={`${tdClass} font-mono text-slate-300`}>
                            {quantity.relation}
                          </td>
                          <td className={`${tdClass} font-mono text-slate-400`}>
                            {quantity.derivation}
                          </td>
                          <td className={`${tdClass} font-mono text-sky-300`}>
                            {quantity.dimensions}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TableFrame>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Area has dimension [L²] and volume [L³]. In each derivation,
                  substitute the dimensions of the quantities in the defining
                  equation and combine powers of the same base dimension.
                </p>
              </article>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <WorkedExample
                  title="Worked example · dimensions of velocity"
                  problem="Derive the dimensional formula for velocity from its defining equation."
                  steps={[
                    "Velocity is displacement divided by elapsed time.",
                    "Displacement has dimension [L], and time has dimension [T].",
                    "Therefore [v] = [L]/[T] = [LT⁻¹].",
                  ]}
                  solution={{
                    given: "Displacement Δx has dimension [L]; elapsed time Δt has dimension [T].",
                    find: "The dimensional formula for velocity [v].",
                    formula: "v = Δx / Δt.",
                    substitution: "[v] = [Δx] / [Δt] = [L] / [T].",
                    calculation: "[v] = [L][T]⁻¹ = [LT⁻¹].",
                  }}
                  answer="[v] = [LT⁻¹]."
                />
                <WorkedExample
                  title="Worked example · dimensions of acceleration"
                  problem="Derive the dimensional formula for acceleration from the change in velocity per unit time."
                  steps={[
                    "Acceleration is change in velocity divided by elapsed time.",
                    "Velocity has dimension [LT⁻¹], and time has dimension [T].",
                    "Therefore [a] = [LT⁻¹]/[T] = [LT⁻²].",
                  ]}
                  solution={{
                    given: "Velocity change Δv has dimension [LT⁻¹]; elapsed time Δt has dimension [T].",
                    find: "The dimensional formula for acceleration [a].",
                    formula: "a = Δv / Δt.",
                    substitution: "[a] = [Δv] / [Δt] = [LT⁻¹] / [T].",
                    calculation: "[a] = [L][T]⁻² = [LT⁻²].",
                  }}
                  answer="[a] = [LT⁻²]."
                />
                <WorkedExample
                  title="Worked example · Newton's second law"
                  problem="Use Newton's second law to derive the dimensions of force."
                  steps={[
                    "Newton's second law gives force as mass multiplied by acceleration.",
                    "Mass has dimension [M], and acceleration has dimension [LT⁻²].",
                    "Multiplying gives [F] = [MLT⁻²].",
                  ]}
                  solution={{
                    given: "Mass m has dimension [M]; acceleration a has dimension [LT⁻²].",
                    find: "The dimensional formula for force [F].",
                    formula: "F = ma.",
                    substitution: "[F] = [m][a] = [M][LT⁻²].",
                    calculation: "Combine the dimensions: [F] = [MLT⁻²].",
                  }}
                  answer="[F] = [MLT⁻²]."
                />
                <WorkedExample
                  title="Worked example · dimensions of work"
                  problem="Derive the dimensions of work from force and displacement."
                  steps={[
                    "Work is force multiplied by displacement in the direction of the force.",
                    "Force has dimension [MLT⁻²], and displacement has dimension [L].",
                    "Therefore [W] = [MLT⁻²][L] = [ML²T⁻²].",
                  ]}
                  solution={{
                    given: "Force F has dimension [MLT⁻²]; displacement d has dimension [L].",
                    find: "The dimensional formula for work [W].",
                    formula: "W = Fd.",
                    substitution: "[W] = [F][d] = [MLT⁻²][L].",
                    calculation: "Add the length exponents: [W] = [ML²T⁻²].",
                  }}
                  answer="[W] = [ML²T⁻²]."
                />
                <WorkedExample
                  title="Worked example · dimensions of power"
                  problem="Derive the dimensions of power from work done per unit time."
                  steps={[
                    "Power is work divided by elapsed time.",
                    "Work has dimension [ML²T⁻²], and time has dimension [T].",
                    "Therefore [P] = [ML²T⁻²]/[T] = [ML²T⁻³].",
                  ]}
                  solution={{
                    given: "Work W has dimension [ML²T⁻²]; elapsed time t has dimension [T].",
                    find: "The dimensional formula for power [P].",
                    formula: "P = W / t.",
                    substitution: "[P] = [W] / [t] = [ML²T⁻²] / [T].",
                    calculation: "Subtract one time exponent: [P] = [ML²T⁻³].",
                  }}
                  answer="[P] = [ML²T⁻³]."
                />
                <WorkedExample
                  title="Worked example · checking an equation"
                  problem="Check whether s = ut + ½at² is dimensionally consistent, where s is displacement."
                  steps={[
                    "Displacement s has dimension [L].",
                    "Initial velocity times time has dimensions [LT⁻¹][T] = [L].",
                    "Acceleration times time squared has dimensions [LT⁻²][T²] = [L].",
                    "Both terms on the right and the left side have dimension [L].",
                  ]}
                  solution={{
                    given: "s is displacement, u and v are velocities, a is acceleration, and t is time.",
                    find: "Whether s = ut + ½at² is dimensionally consistent.",
                    formula: "[s] = [L], [u] = [LT⁻¹], [a] = [LT⁻²], and [t] = [T].",
                    substitution: "[ut] = [LT⁻¹][T] = [L]; [at²] = [LT⁻²][T²] = [L].",
                    calculation: "The coefficient ½ is dimensionless, so each term on the right has dimension [L], matching s.",
                  }}
                  answer="Dimensionally consistent: every term has dimension [L]."
                />
              </div>

              <div className="mt-5 grid gap-5 lg:grid-cols-2">
                <article className="rounded-2xl border border-cyan-400/15 bg-cyan-400/5 p-5 sm:p-6">
                  <h3 className="font-bold text-cyan-300">
                    Explore a dimensional formula
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Select a quantity to see its definition, defining
                    relationship, and dimensional formula.
                  </p>
                  <label
                    htmlFor="dimension-quantity"
                    className="mt-4 block text-sm font-semibold text-slate-300"
                  >
                    Physical quantity
                  </label>
                  <select
                    id="dimension-quantity"
                    value={selectedDimensionIndex}
                    onChange={(event) =>
                      setSelectedDimensionIndex(Number(event.target.value))
                    }
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#080D1B] px-3 py-3 text-white outline-none focus:border-cyan-300"
                  >
                    {dimensionalQuantities.map((quantity, index) => (
                      <option key={quantity.quantity} value={index}>
                        {quantity.quantity}
                      </option>
                    ))}
                  </select>
                  <div
                    className="mt-4 rounded-xl bg-[#080D1B] p-4"
                    aria-live="polite"
                  >
                    <p className="text-sm text-slate-400">
                      {dimensionalQuantities[selectedDimensionIndex].definition}
                    </p>
                    <p className="mt-3 font-mono text-sm text-slate-300">
                      {dimensionalQuantities[selectedDimensionIndex].symbol} ·{" "}
                      {dimensionalQuantities[selectedDimensionIndex].relation}
                    </p>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Dimensional formula
                    </p>
                    <p className="mt-1 font-mono text-2xl font-black text-cyan-200">
                      {dimensionalQuantities[selectedDimensionIndex].dimensions}
                    </p>
                  </div>
                </article>

                <article className="rounded-2xl border border-violet-400/15 bg-violet-400/5 p-5 sm:p-6">
                  <h3 className="font-bold text-violet-300">
                    Practice · test dimensional consistency
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Decide whether the selected equation is dimensionally
                    consistent. Compare dimensions on both sides and make sure
                    terms being added have matching dimensions.
                  </p>
                  <label
                    htmlFor="dimension-equation"
                    className="mt-4 block text-sm font-semibold text-slate-300"
                  >
                    Equation to check
                  </label>
                  <select
                    id="dimension-equation"
                    value={selectedEquationIndex}
                    onChange={(event) => {
                      setSelectedEquationIndex(Number(event.target.value));
                      setEquationAnswer(null);
                    }}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#080D1B] px-3 py-3 font-mono text-white outline-none focus:border-violet-300"
                  >
                    {dimensionalEquations.map((item, index) => (
                      <option key={item.equation} value={index}>
                        {item.equation}
                      </option>
                    ))}
                  </select>
                  <p className="mt-4 font-mono text-lg font-bold text-white">
                    {dimensionalEquations[selectedEquationIndex].equation}
                  </p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {[
                      { label: "Consistent", value: true },
                      { label: "Not consistent", value: false },
                    ].map((choice) => {
                      const selected = equationAnswer === choice.value;
                      const correct =
                        dimensionalEquations[selectedEquationIndex]
                          .consistent === choice.value;
                      const state =
                        equationAnswer === null
                          ? "default"
                          : correct
                            ? "correct"
                            : selected
                              ? "incorrect"
                              : "muted";

                      return (
                        <button
                          key={choice.label}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => setEquationAnswer(choice.value)}
                          className={`${QUIZ_OPTION_BASE_CLASS} ${getQuizOptionClass(state)}`}
                        >
                          {choice.label}
                        </button>
                      );
                    })}
                  </div>
                  {equationAnswer !== null && (
                    <p
                      className="mt-4 rounded-xl bg-[#080D1B] p-4 text-sm leading-6 text-slate-300"
                      aria-live="polite"
                    >
                      <strong
                        className={
                          equationAnswer ===
                          dimensionalEquations[selectedEquationIndex].consistent
                            ? "text-emerald-300"
                            : "text-rose-300"
                        }
                      >
                        {equationAnswer ===
                        dimensionalEquations[selectedEquationIndex].consistent
                          ? "Correct. "
                          : "Not quite. "}
                      </strong>
                      {dimensionalEquations[selectedEquationIndex].explanation}
                    </p>
                  )}
                </article>
              </div>
            </section>

            <section id="vector-intro" className="scroll-mt-6">
              <SectionHeading
                number="05"
                title="Introduction to Scalars and Vectors"
                subtitle="Whether a quantity needs a direction determines how it should be described and calculated."
              />
              <TableFrame>
                <table className={tableClass}>
                  <thead>
                    <tr>
                      <th className={thClass}>Feature</th>
                      <th className={thClass}>Scalar</th>
                      <th className={thClass}>Vector</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className={tdClass}>Description</td><td className={tdClass}>Magnitude only</td><td className={tdClass}>Magnitude and direction</td></tr>
                    <tr><td className={tdClass}>Examples</td><td className={tdClass}>Mass, time, temperature, distance, speed, energy</td><td className={tdClass}>Displacement, velocity, acceleration, force</td></tr>
                    <tr><td className={tdClass}>Combination</td><td className={tdClass}>Ordinary signed arithmetic when appropriate</td><td className={tdClass}>Must account for direction and components</td></tr>
                    <tr><td className={tdClass}>Notation</td><td className={tdClass}>m, t, T, or an italic quantity symbol</td><td className={tdClass}>Bold vector A, arrow over A, or components (Ax, Ay)</td></tr>
                  </tbody>
                </table>
              </TableFrame>
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <WorkedExample
                  title="Worked example · scalar distance, vector displacement"
                  problem="A student walks 40 m east and then 30 m west."
                  steps={[
                    "Distance is the total path: 40 m + 30 m = 70 m.",
                    "Choose east as positive. Displacement is +40 m − 30 m = +10 m.",
                    "A positive result means the net direction is east.",
                  ]}
                  solution={{
                    given: "40 m east, then 30 m west.",
                    find: "Total distance traveled and net displacement.",
                    formula: "Distance = total path length; displacement = signed position change.",
                    substitution: "Distance = 40 m + 30 m; displacement = +40 m − 30 m (east positive).",
                    calculation: "Distance = 70 m; displacement = +10 m, which is east.",
                  }}
                  answer="Distance = 70 m; displacement = 10 m east."
                />
                <article className="rounded-2xl border border-cyan-400/15 bg-cyan-400/5 p-5">
                  <h3 className="font-bold text-cyan-300">Practice · scalar or vector?</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Classify each quantity. Remember: weight is a force, so it
                    is a vector; mass is a scalar.
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {scalarVectorItems.map((item) => {
                      const selected = scalarVectorAnswers[item.quantity];
                      return (
                        <div
                          key={item.quantity}
                          className="rounded-xl bg-[#080D1B] p-3"
                        >
                          <p className="text-sm font-semibold text-white">
                            {item.quantity}
                          </p>
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            {(["scalar", "vector"] as const).map((kind) => {
                              const state = selected
                                ? kind === item.kind
                                  ? "correct"
                                  : selected === kind
                                    ? "incorrect"
                                    : "muted"
                                : "default";
                              return (
                                <button
                                  key={kind}
                                  type="button"
                                  aria-pressed={selected === kind}
                                  onClick={() =>
                                    setScalarVectorAnswers((previous) => ({
                                      ...previous,
                                      [item.quantity]: kind,
                                    }))
                                  }
                                  className={`${QUIZ_OPTION_BASE_CLASS} ${getQuizOptionClass(state)}`}
                                >
                                  {kind === "scalar" ? "Scalar" : "Vector"}
                                </button>
                              );
                            })}
                          </div>
                          {selected && (
                            <p
                              className="mt-2 text-xs leading-5 text-slate-400"
                              aria-live="polite"
                            >
                              {selected === item.kind
                                ? `Correct. ${item.explanation}`
                                : `Not quite. ${item.explanation}`}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </article>
              </div>
            </section>

            <section id="components" className="scroll-mt-6">
              <SectionHeading
                number="06"
                title="Vector Representation and Components"
                subtitle="A vector can be drawn as a directed arrow or expressed as perpendicular components in a chosen coordinate system."
              />
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
                <article className="rounded-2xl border border-white/10 bg-[#10182B] p-5 sm:p-6">
                  <h3 className="text-lg font-bold text-sky-300">Magnitude, direction, and notation</h3>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
                    <li><strong className="text-white">Magnitude</strong> is the size or length of the vector and is nonnegative.</li>
                    <li><strong className="text-white">Direction</strong> is stated relative to a reference axis or compass direction.</li>
                    <li>In standard Cartesian axes, +x is right/east and +y is up/north; negative components point left/west or down/south.</li>
                    <li>For angle θ measured counterclockwise from +x, Ax = A cos θ and Ay = A sin θ.</li>
                    <li>Signs follow the quadrant: at 150°, x is negative and y is positive.</li>
                  </ul>
                </article>
                <div className="rounded-2xl border border-white/10 bg-[#10182B] p-4">
                  <svg viewBox="0 0 360 260" role="img" aria-label="Vector A resolved into positive x and y components at angle theta" className="mx-auto w-full max-w-lg">
                    <defs>
                      <marker id="componentArrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                        <path d="M0,0 L6,3 L0,6 Z" fill="#38BDF8" />
                      </marker>
                      <marker id="componentXArrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                        <path d="M0,0 L6,3 L0,6 Z" fill="#34D399" />
                      </marker>
                      <marker id="componentYArrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                        <path d="M0,0 L6,3 L0,6 Z" fill="#A78BFA" />
                      </marker>
                    </defs>
                    <line x1="40" y1="210" x2="330" y2="210" stroke="#64748B" />
                    <line x1="70" y1="235" x2="70" y2="25" stroke="#64748B" />
                    <line x1="70" y1="210" x2="255" y2="85" stroke="#38BDF8" strokeWidth="4" markerEnd="url(#componentArrow)" />
                    <line x1="70" y1="210" x2="255" y2="210" stroke="#34D399" strokeWidth="3" markerEnd="url(#componentXArrow)" />
                    <line x1="255" y1="210" x2="255" y2="85" stroke="#A78BFA" strokeWidth="3" markerEnd="url(#componentYArrow)" />
                    <line x1="255" y1="85" x2="255" y2="210" stroke="#64748B" strokeDasharray="5 5" />
                    <path d="M110 210 A40 40 0 0 0 103 187" fill="none" stroke="#FBBF24" strokeWidth="2" />
                    <text x="155" y="130" fill="#7DD3FC" fontSize="16">A</text>
                    <text x="155" y="232" fill="#6EE7B7" fontSize="14">Ax</text>
                    <text x="267" y="152" fill="#C4B5FD" fontSize="14">Ay</text>
                    <text x="112" y="195" fill="#FCD34D" fontSize="14">θ</text>
                    <text x="326" y="215" fill="#94A3B8" fontSize="12">+x</text>
                    <text x="64" y="22" fill="#94A3B8" fontSize="12">+y</text>
                  </svg>
                  <p className="text-center text-xs leading-5 text-slate-500">
                    The components form a right triangle; choose signs from the vector’s quadrant.
                  </p>
                </div>
              </div>
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <WorkedExample
                  title="Worked example · resolve a vector"
                  problem="A 20 m displacement points 35° north of east. Find east and north components."
                  steps={[
                    "Choose +x east and +y north; both components are positive.",
                    "Ax = A cos θ = 20 cos 35° = 16.38 m.",
                    "Ay = A sin θ = 20 sin 35° = 11.47 m.",
                    "Check magnitude: √(16.38² + 11.47²) ≈ 20.0 m.",
                  ]}
                  solution={{
                    given: "Displacement magnitude A = 20 m at θ = 35° north of east.",
                    find: "The east (Ax) and north (Ay) components.",
                    formula: "Ax = A cos θ; Ay = A sin θ.",
                    substitution: "Ax = 20 cos 35°; Ay = 20 sin 35°.",
                    calculation: "Ax ≈ 16.38 m and Ay ≈ 11.47 m; their components give a magnitude of about 20.0 m.",
                  }}
                  answer="Ax ≈ 16.4 m east; Ay ≈ 11.5 m north."
                />
                <WorkedExample
                  title="Worked example · reconstruct magnitude and direction"
                  problem="A vector has components Ax = −3 m and Ay = 4 m."
                  steps={[
                    "Magnitude A = √(Ax² + Ay²) = √(9 + 16) = 5 m.",
                    "The signs (−, +) place it in quadrant II.",
                    "Reference angle α = tan⁻¹(|4/−3|) ≈ 53.1°.",
                    "Measured counterclockwise from +x, θ = 180° − 53.1° = 126.9°.",
                  ]}
                  solution={{
                    given: "Ax = −3 m and Ay = 4 m.",
                    find: "The vector's magnitude and direction measured counterclockwise from +x.",
                    formula: "A = √(Ax² + Ay²); determine the angle using the component signs and reference angle.",
                    substitution: "A = √((-3)² + 4²); α = tan⁻¹(|4/−3|).",
                    calculation: "A = 5 m; the vector is in quadrant II, so θ = 180° − 53.1° = 126.9°.",
                  }}
                  answer="A = 5 m at 126.9° counterclockwise from +x."
                />
                <WorkedExample
                  title="Worked example · west of north"
                  problem="A vector points 30° west of north. Express its direction as a standard angle measured counterclockwise from +x."
                  steps={[
                    "Start from north, which is +y or 90° counterclockwise from +x.",
                    "Turn 30° toward west, which is the negative x direction.",
                    "The standard angle is 90° + 30° = 120°.",
                  ]}
                  solution={{
                    given: "Direction is 30° west of north.",
                    find: "The standard counterclockwise angle from +x.",
                    formula: "For a direction west of north in quadrant II, θ = 90° + the angle west of north.",
                    substitution: "θ = 90° + 30°.",
                    calculation: "θ = 120° counterclockwise from +x.",
                  }}
                  answer="30° west of north = 120° counterclockwise from +x."
                />
              </div>
              <section id="unit-vectors" className="mt-6 scroll-mt-6">
                <div className="mb-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-sky-400">
                    VECTOR REPRESENTATION
                  </p>
                  <h3 className="mt-2 text-xl font-black tracking-tight sm:text-2xl">
                    Unit Vectors
                  </h3>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <article className="rounded-2xl border border-white/10 bg-[#10182B] p-5 sm:p-6">
                    <h4 className="font-bold text-sky-300">
                      î, ĵ, and k̂ as direction markers
                    </h4>
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      The unit vectors î, ĵ, and k̂ point along the positive x-,
                      y-, and z-axes, respectively, and each has magnitude one.
                      A vector can be written as{" "}
                      <span className="font-mono text-white">
                        A = Axî + Ayĵ + Azk̂
                      </span>
                      . Add vectors by adding the coefficients of matching
                      unit vectors.
                    </p>
                    <p className="mt-3 rounded-xl bg-[#080D1B] p-3 font-mono text-sm leading-6 text-cyan-200">
                      (2î + 3ĵ) + (−î + 4ĵ) = î + 7ĵ
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-400">
                      In three dimensions, |A| = √(Ax² + Ay² + Az²). The
                      direction unit vector is Â = A / |A|, which has
                      magnitude one and points in A&apos;s direction.
                    </p>
                  </article>
                  <WorkedExample
                    title="Worked example · three-dimensional unit vector"
                    problem="For A = 2î + 6ĵ − 5k̂, find its magnitude and direction unit vector."
                    steps={[
                      "|A| = √(2² + 6² + (−5)²) = √65.",
                      "√65 ≈ 8.06, so the vector magnitude is 8.06.",
                      "Normalize by dividing every component by the magnitude: Â = A/|A|.",
                    ]}
                    solution={{
                      given: "A = 2î + 6ĵ − 5k̂.",
                      find: "The magnitude |A| and the direction unit vector Â.",
                      formula: "|A| = √(Ax² + Ay² + Az²); Â = A / |A|.",
                      substitution: "|A| = √(2² + 6² + (−5)²) = √65; Â = (2î + 6ĵ − 5k̂) / √65.",
                      calculation: "|A| ≈ 8.06; dividing A by √65 gives a vector of magnitude 1 in the same direction.",
                    }}
                    answer="|A| = √65 ≈ 8.06; Â = (2î + 6ĵ − 5k̂) / √65."
                  />
                </div>
              </section>
            </section>

            <section id="operations" className="scroll-mt-6">
              <SectionHeading
                number="07"
                title="Vector Operations"
                subtitle="Add vectors by combining like directions; subtract by adding the reversed vector. Component arithmetic works for any angle."
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <article className="rounded-2xl border border-white/10 bg-[#10182B] p-5">
                  <h3 className="font-bold text-sky-300">Head-to-tail method</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Draw the first vector to scale, then place the tail of the
                    next vector at the first arrowhead. The resultant runs from
                    the first tail to the final head. It is the graphical
                    version of vector addition.
                  </p>
                  <ol className="mt-3 list-inside list-decimal space-y-1 text-sm leading-6 text-slate-300">
                    <li>Choose a scale and draw the first vector from a starting point.</li>
                    <li>Translate the next vector so its tail touches the previous arrowhead; do not rotate or resize it.</li>
                    <li>For additional vectors, repeat the tail-to-head placement.</li>
                    <li>Draw the resultant from the first tail to the final arrowhead, then measure its magnitude and direction.</li>
                  </ol>
                </article>
                <article className="rounded-2xl border border-white/10 bg-[#10182B] p-5">
                  <h3 className="font-bold text-violet-300">Parallelogram method</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Place two vectors tail-to-tail, complete the parallelogram,
                    and draw its diagonal from the common tail. This diagonal
                    is their sum.
                  </p>
                  <ol className="mt-3 list-inside list-decimal space-y-1 text-sm leading-6 text-slate-300">
                    <li>Draw both vectors to scale from the same starting point.</li>
                    <li>Through each arrowhead, draw a line parallel to the other vector to complete the parallelogram.</li>
                    <li>Draw the diagonal from the shared tail to the opposite corner; that diagonal is the resultant.</li>
                    <li>Use the scale or components to determine the resultant magnitude and direction.</li>
                  </ol>
                </article>
                <article className="rounded-2xl border border-white/10 bg-[#10182B] p-5">
                  <h3 className="font-bold text-emerald-300">Component method</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Resolve each vector into x and y parts; add x parts to get
                    Rx and y parts to get Ry. Then use the Pythagorean theorem
                    and inverse tangent, with quadrant signs checked.
                  </p>
                </article>
                <article className="rounded-2xl border border-white/10 bg-[#10182B] p-5">
                  <h3 className="font-bold text-amber-300">Scalar multiplication</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Multiplying a vector by a positive scalar changes its
                    magnitude by that factor without changing direction. A
                    negative scalar also reverses direction: −2A is twice as
                    long as A and points oppositely.
                  </p>
                </article>
              </div>
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <WorkedExample
                  title="Worked example · collinear addition and subtraction"
                  problem="A person moves 9 m east and then 4 m west. Find the resultant displacement."
                  steps={[
                    "Set east positive: A = +9 m and B = −4 m.",
                    "R = A + B = 9 + (−4) = +5 m.",
                    "The positive sign indicates east.",
                  ]}
                  solution={{
                    given: "9 m east followed by 4 m west.",
                    find: "The resultant displacement.",
                    formula: "R = A + B, using signed components along the east-west line.",
                    substitution: "R = (+9 m) + (−4 m).",
                    calculation: "R = +5 m; positive is east.",
                  }}
                  answer="Resultant displacement = 5 m east."
                />
                <WorkedExample
                  title="Worked example · perpendicular force addition"
                  problem="A 3 N force acts east while a 4 N force acts north."
                  steps={[
                    "Rx = 3 N and Ry = 4 N.",
                    "R = √(Rx² + Ry²) = √(9 + 16) = 5 N.",
                    "θ = tan⁻¹(4/3) = 53.1° north of east.",
                  ]}
                  solution={{
                    given: "3 N east and 4 N north.",
                    find: "The resultant force magnitude and direction.",
                    formula: "R = √(Rx² + Ry²); θ = tan⁻¹(Ry/Rx).",
                    substitution: "R = √(3² + 4²); θ = tan⁻¹(4/3).",
                    calculation: "R = 5 N and θ = 53.1° north of east.",
                  }}
                  answer="Resultant force = 5 N at 53.1° north of east."
                />
                <WorkedExample
                  title="Worked example · head-to-tail construction"
                  problem="Draw the sum of 3 m east followed by 4 m north, then find the resultant."
                  steps={[
                    "Draw 3 m east to scale; place the tail of the 4 m north arrow at its head.",
                    "Draw R from the first tail to the final arrowhead. The legs form a right triangle.",
                    "R = √(3² + 4²) = 5 m and θ = tan⁻¹(4/3) = 53.1° north of east.",
                  ]}
                  solution={{
                    given: "3 m east followed head-to-tail by 4 m north.",
                    find: "The resultant vector's magnitude and direction.",
                    formula: "The perpendicular legs give R = √(Rx² + Ry²) and θ = tan⁻¹(Ry/Rx).",
                    substitution: "R = √(3² + 4²); θ = tan⁻¹(4/3).",
                    calculation: "Draw R from the first tail to the final arrowhead: R = 5 m at 53.1° north of east.",
                  }}
                  answer="Head-to-tail resultant = 5 m at 53.1° north of east."
                />
                <WorkedExample
                  title="Worked example · parallelogram construction"
                  problem="Two vectors of 5 N east and 6 N north share a tail. Find the parallelogram diagonal."
                  steps={[
                    "Draw both vectors from the same origin and complete the rectangle (a right-angle parallelogram).",
                    "The diagonal has components Rx = 5 N and Ry = 6 N.",
                    "R = √(5² + 6²) = √61 = 7.81 N.",
                    "θ = tan⁻¹(6/5) = 50.2° north of east.",
                  ]}
                  solution={{
                    given: "Two vectors, 5 N east and 6 N north, share a tail.",
                    find: "The parallelogram diagonal's magnitude and direction.",
                    formula: "Complete the parallelogram from a shared tail; its diagonal is the resultant. R = √(Rx² + Ry²); θ = tan⁻¹(Ry/Rx).",
                    substitution: "R = √(5² + 6²); θ = tan⁻¹(6/5).",
                    calculation: "R = √61 ≈ 7.81 N at 50.2° north of east.",
                  }}
                  answer="Parallelogram resultant = 7.81 N at 50.2° north of east."
                />
                <WorkedExample
                  title="Worked example · scalar multiplication"
                  problem="Vector A is 3 m at 30° above +x. Find 2A and −0.5A."
                  steps={[
                    "Multiplying by 2 doubles its magnitude: 2A is 6 m and keeps the 30° direction.",
                    "Multiplying by −0.5 scales the magnitude by 0.5 and reverses direction by 180°.",
                    "The reversed direction is 30° + 180° = 210°.",
                  ]}
                  solution={{
                    given: "A = 3 m at 30° above +x.",
                    find: "The vectors 2A and −0.5A.",
                    formula: "Scalar multiplication scales magnitude; a negative scalar reverses direction.",
                    substitution: "2A scales 3 m by 2; −0.5A scales it by 0.5 and rotates the direction by 180°.",
                    calculation: "2A = 6 m at 30°; −0.5A = 1.5 m at 210°.",
                  }}
                  answer="2A = 6 m at 30°; −0.5A = 1.5 m at 210°."
                />
              </div>

              <div className="mt-5 rounded-2xl border border-violet-400/15 bg-[#10182B] p-5 sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold">Interactive vector simulator</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-400">
                      Adjust the magnitudes and angles. Angles are measured
                      counterclockwise from +x; drag either arrowhead or use the
                      controls. The live result uses components.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMagnitudeA(8);
                      setAngleA(30);
                      setMagnitudeB(6);
                      setAngleB(120);
                      setVectorOperation("add");
                      setShowHeadToTail(false);
                      setShowParallelogram(false);
                    }}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5"
                  >
                    <RotateCcw size={14} /> Reset
                  </button>
                </div>
                <div className="mt-6 grid gap-5 lg:grid-cols-2">
                  <div className="space-y-4">
                    <VectorControl label="Vector A" magnitude={magnitudeA} angle={angleA} color="sky" onMagnitudeChange={setMagnitudeA} onAngleChange={setAngleA} />
                    <VectorControl label="Vector B" magnitude={magnitudeB} angle={angleB} color="violet" onMagnitudeChange={setMagnitudeB} onAngleChange={setAngleB} />
                    <fieldset className="rounded-xl border border-white/10 bg-[#080D1B] p-4">
                      <legend className="px-1 text-sm font-semibold text-slate-300">
                        Vector operation
                      </legend>
                      <div className="grid grid-cols-2 gap-2">
                        {([
                          ["add", "A + B"],
                          ["subtract", "A − B"],
                        ] as const).map(([operation, label]) => (
                          <button
                            key={operation}
                            type="button"
                            aria-pressed={vectorOperation === operation}
                            onClick={() => setVectorOperation(operation)}
                            className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                              vectorOperation === operation
                                ? "border-sky-300/40 bg-sky-300/10 text-sky-200"
                                : "border-white/10 text-slate-300 hover:bg-white/5"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </fieldset>
                    <fieldset className="rounded-xl border border-white/10 bg-[#080D1B] p-4">
                      <legend className="px-1 text-sm font-semibold text-slate-300">
                        Diagram overlays
                      </legend>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <label className="flex items-center gap-2 text-sm text-slate-300">
                          <input
                            type="checkbox"
                            checked={showHeadToTail}
                            onChange={(event) => setShowHeadToTail(event.target.checked)}
                            className="accent-sky-400"
                          />
                          Head-to-tail
                        </label>
                        <label className="flex items-center gap-2 text-sm text-slate-300">
                          <input
                            type="checkbox"
                            checked={showParallelogram}
                            onChange={(event) => setShowParallelogram(event.target.checked)}
                            className="accent-violet-400"
                          />
                          Parallelogram
                        </label>
                      </div>
                    </fieldset>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-[#080D1B] p-3">
                    <svg
                      viewBox="0 0 360 360"
                      role="group"
                      aria-label="Interactive vector diagram for A, B, and resultant R"
                      onPointerDown={startVectorDrag}
                      onPointerMove={moveVectorFromPointer}
                      onPointerUp={() => setDraggingVector(null)}
                      onPointerCancel={() => setDraggingVector(null)}
                      className="mx-auto w-full max-w-md"
                    >
                      <defs>
                        <marker id="simA" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#38BDF8" /></marker>
                        <marker id="simB" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#A78BFA" /></marker>
                        <marker id="simR" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#34D399" /></marker>
                        <marker id="simOverlayB" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#C4B5FD" /></marker>
                      </defs>
                      {Array.from({ length: 13 }, (_, index) => {
                        const position = 30 + index * 25;
                        return <g key={position}><line x1={position} y1="30" x2={position} y2="330" stroke="#243149" strokeWidth="0.7" /><line x1="30" y1={position} x2="330" y2={position} stroke="#243149" strokeWidth="0.7" /></g>;
                      })}
                      <line x1="25" y1={graphCenter} x2="337" y2={graphCenter} stroke="#64748b" />
                      <line x1={graphCenter} y1="335" x2={graphCenter} y2="23" stroke="#64748b" />
                      <g fill="none" strokeDasharray="4 4" strokeWidth="1.5" pointerEvents="none">
                        <line x1={pointA.x} y1={pointA.y} x2={pointA.x} y2={graphCenter} stroke="#38BDF8" strokeOpacity=".7" />
                        <line x1={pointA.x} y1={pointA.y} x2={graphCenter} y2={pointA.y} stroke="#38BDF8" strokeOpacity=".7" />
                        <line x1={pointB.x} y1={pointB.y} x2={pointB.x} y2={graphCenter} stroke="#A78BFA" strokeOpacity=".7" />
                        <line x1={pointB.x} y1={pointB.y} x2={graphCenter} y2={pointB.y} stroke="#A78BFA" strokeOpacity=".7" />
                      </g>
                      {vectorOperation === "subtract" && (
                        <>
                          <line
                            x1={graphCenter}
                            y1={graphCenter}
                            x2={pointOperationB.x}
                            y2={pointOperationB.y}
                            stroke="#C4B5FD"
                            strokeWidth="2"
                            strokeDasharray="5 4"
                            markerEnd="url(#simOverlayB)"
                            pointerEvents="none"
                          />
                          <text
                            x={pointOperationB.x + 7}
                            y={pointOperationB.y - 7}
                            fill="#C4B5FD"
                            fontSize="12"
                            fontWeight="bold"
                            pointerEvents="none"
                          >
                            −B
                          </text>
                        </>
                      )}
                      {showHeadToTail && (
                        <line
                          x1={pointA.x}
                          y1={pointA.y}
                          x2={pointR.x}
                          y2={pointR.y}
                          stroke="#C4B5FD"
                          strokeWidth="2"
                          strokeDasharray="6 4"
                          markerEnd="url(#simOverlayB)"
                          pointerEvents="none"
                        />
                      )}
                      {showParallelogram && (
                        <>
                          <line
                            x1={pointA.x}
                            y1={pointA.y}
                            x2={pointR.x}
                            y2={pointR.y}
                            stroke="#C4B5FD"
                            strokeWidth="2"
                            strokeDasharray="6 4"
                            pointerEvents="none"
                          />
                          <line
                            x1={pointOperationB.x}
                            y1={pointOperationB.y}
                            x2={pointR.x}
                            y2={pointR.y}
                            stroke="#38BDF8"
                            strokeWidth="2"
                            strokeDasharray="6 4"
                            pointerEvents="none"
                          />
                        </>
                      )}
                      <line x1={graphCenter} y1={graphCenter} x2={pointA.x} y2={pointA.y} stroke="#38BDF8" strokeWidth="3" markerEnd="url(#simA)" />
                      <line x1={graphCenter} y1={graphCenter} x2={pointB.x} y2={pointB.y} stroke="#A78BFA" strokeWidth="3" markerEnd="url(#simB)" />
                      <line x1={graphCenter} y1={graphCenter} x2={pointR.x} y2={pointR.y} stroke="#34D399" strokeWidth="3" markerEnd="url(#simR)" />
                      <circle
                        cx={pointA.x}
                        cy={pointA.y}
                        r="12"
                        fill="transparent"
                        pointerEvents="all"
                        data-vector="A"
                        aria-hidden="true"
                        style={{ cursor: draggingVector === "A" ? "grabbing" : "grab", touchAction: "none" }}
                      />
                      <circle
                        cx={pointB.x}
                        cy={pointB.y}
                        r="12"
                        fill="transparent"
                        pointerEvents="all"
                        data-vector="B"
                        aria-hidden="true"
                        style={{ cursor: draggingVector === "B" ? "grabbing" : "grab", touchAction: "none" }}
                      />
                      <text x={pointA.x + 7} y={pointA.y - 7} fill="#38BDF8" fontSize="12" fontWeight="bold" pointerEvents="none">A</text>
                      <text x={pointB.x + 7} y={pointB.y - 7} fill="#A78BFA" fontSize="12" fontWeight="bold" pointerEvents="none">B</text>
                      <text x={pointR.x + 7} y={pointR.y - 7} fill="#34D399" fontSize="12" fontWeight="bold" pointerEvents="none">R</text>
                      <circle cx={graphCenter} cy={graphCenter} r="3" fill="white" />
                    </svg>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <ResultCard label="Ax" value={`${ax.toFixed(2)} m`} />
                      <ResultCard label="Ay" value={`${ay.toFixed(2)} m`} />
                      <ResultCard label="Bx" value={`${bx.toFixed(2)} m`} />
                      <ResultCard label="By" value={`${by.toFixed(2)} m`} />
                      <ResultCard label="Rx" value={`${rx.toFixed(2)} m`} />
                      <ResultCard label="Ry" value={`${ry.toFixed(2)} m`} />
                      <ResultCard label="|R|" value={`${resultant.toFixed(2)} m`} />
                      <ResultCard label="Direction" value={resultant < 1e-10 ? "undefined" : `${normalizedAngle.toFixed(1)}°`} />
                      <div className="col-span-2 rounded-xl border border-white/10 bg-[#10182B] p-3 sm:col-span-4">
                        <p className="text-xs text-slate-500">
                          Result · {vectorOperation === "add" ? "A + B" : "A − B"}
                        </p>
                        <p className="mt-1 break-words font-mono text-sm font-bold text-emerald-300">
                          R = ({rx.toFixed(2)} î {unitVectorYTerm}) m
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="problems" className="scroll-mt-6">
              <SectionHeading
                number="08"
                title="Solving Vector Problems"
                subtitle="Translate the situation into a coordinate system, solve with components, and report a magnitude with a meaningful direction."
              />
              <div className="grid gap-4 lg:grid-cols-2">
                <WorkedExample
                  title="Displacement · two-dimensional journey"
                  problem="A hiker walks 120 m east and 50 m north. Find the displacement from the starting point."
                  steps={[
                    "Given: x = +120 m, y = +50 m. Required: resultant displacement.",
                    "R = √(120² + 50²) m = √16,900 m = 130 m.",
                    "θ = tan⁻¹(50/120) = 22.6° from east toward north.",
                  ]}
                  solution={{
                    given: "x = +120 m east and y = +50 m north.",
                    find: "The displacement magnitude and direction.",
                    formula: "R = √(x² + y²); θ = tan⁻¹(y/x).",
                    substitution: "R = √(120² + 50²); θ = tan⁻¹(50/120).",
                    calculation: "R = 130 m at 22.6° north of east.",
                  }}
                  answer="Displacement = 130 m at 22.6° north of east."
                />
                <WorkedExample
                  title="Velocity · position change over time"
                  problem="A runner changes position from x₁ = −10 m to x₂ = 26 m in 6 s along a straight track."
                  steps={[
                    "Δx = x₂ − x₁ = 26 − (−10) = +36 m.",
                    "Average velocity v = Δx/Δt = 36 m / 6 s = +6 m/s.",
                    "The positive sign indicates the +x direction.",
                  ]}
                  solution={{
                    given: "x₁ = −10 m, x₂ = 26 m, and Δt = 6 s.",
                    find: "The average velocity.",
                    formula: "Δx = x₂ − x₁; v̄ = Δx/Δt.",
                    substitution: "Δx = 26 − (−10) = +36 m; v̄ = 36 m / 6 s.",
                    calculation: "v̄ = +6 m/s, in the +x direction.",
                  }}
                  answer="Average velocity = 6 m/s in the +x direction."
                />
                <WorkedExample
                  title="Acceleration · change in velocity"
                  problem="A cart's velocity changes from 2 m/s east to 14 m/s east over 4 s."
                  steps={[
                    "Choose east as positive. Δv = 14 − 2 = +12 m/s.",
                    "Average acceleration a = Δv/Δt = 12 m/s / 4 s.",
                    "A positive result means acceleration is east.",
                  ]}
                  solution={{
                    given: "Initial velocity 2 m/s east, final velocity 14 m/s east, and elapsed time 4 s.",
                    find: "The average acceleration.",
                    formula: "ā = Δv/Δt.",
                    substitution: "Δv = 14 − 2 = +12 m/s; ā = 12 m/s / 4 s.",
                    calculation: "ā = 3 m/s² east.",
                  }}
                  answer="Average acceleration = 3 m/s² east."
                />
                <WorkedExample
                  title="Forces · opposing directions"
                  problem="A box experiences 18 N east and 7 N west. Find its net force."
                  steps={[
                    "Take east as positive: F₁ = +18 N and F₂ = −7 N.",
                    "Fnet = F₁ + F₂ = 18 − 7 = +11 N.",
                    "The net force points east; mass would be needed to find acceleration.",
                  ]}
                  solution={{
                    given: "18 N east and 7 N west.",
                    find: "The net force.",
                    formula: "Fnet = sum of signed forces along the east-west line.",
                    substitution: "Fnet = (+18 N) + (−7 N).",
                    calculation: "Fnet = +11 N, directed east; mass would be needed to find acceleration.",
                  }}
                  answer="Net force = 11 N east."
                />
              </div>
              <article className="mt-5 rounded-2xl border border-amber-400/15 bg-amber-400/5 p-5">
                <h3 className="font-bold text-amber-300">
                  Quantities must have compatible units before adding
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  The expression <span className="font-mono text-white">6 m + 5 m/s</span>{" "}
                  is not a valid sum: meters measure length ([L]), while meters
                  per second measure velocity ([LT⁻¹]). Convert units when they
                  represent the same dimension, but do not add unlike physical
                  quantities.
                </p>
              </article>
            </section>

            <section id="formula-reference" className="scroll-mt-6">
              <SectionHeading
                number="09"
                title="Formula Reference"
                subtitle="Use each relationship only when its assumptions fit the problem. Keep units consistent and include direction for vector quantities."
              />
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {[
                  ["Density", "ρ = m / V", "ρ: density; m: mass; V: volume. Use for uniform bulk density; SI unit kg/m³."],
                  ["Average speed", "v = d / t", "d: total path distance; t: elapsed time. Scalar; SI unit m/s."],
                  ["Average velocity", "v̄ = Δx / Δt", "Δx: displacement; Δt: elapsed time. Vector along the net position change; SI unit m/s."],
                  ["Average acceleration", "ā = Δv / Δt", "Δv: velocity change; Δt: elapsed time. Vector; SI unit m/s²."],
                  ["Vector components", "Ax = A cos θ; Ay = A sin θ", "A: magnitude; θ: angle counterclockwise from +x. Adjust signs for the vector's quadrant."],
                  ["Vector magnitude", "A = √(Ax² + Ay²)", "Ax, Ay: perpendicular components. Applies in a two-dimensional Cartesian coordinate system."],
                  ["Unit-vector components", "A = Axî + Ayĵ + Azk̂", "î, ĵ, k̂ are unit vectors along the positive x-, y-, and z-axes. Add vectors by combining like components."],
                  ["Three-dimensional magnitude", "|A| = √(Ax² + Ay² + Az²)", "Ax, Ay, Az: Cartesian components of a 3D vector."],
                  ["Direction unit vector", "Â = A / |A|", "Normalize a nonzero vector to get a magnitude-one vector in the same direction."],
                  ["Resultant magnitude", "R = √(Rx² + Ry²)", "Rx, Ry: summed components of all vectors. Applies to a 2D Cartesian resultant."],
                  ["Resultant direction", "θ = atan2(Ry, Rx)", "Returns the correct quadrant from components. A plain tan⁻¹(Ry/Rx) needs a quadrant check."],
                ].map(([name, formula, details]) => (
                  <article key={name} className="rounded-2xl border border-white/10 bg-[#10182B] p-5">
                    <h3 className="font-bold text-sky-300">{name}</h3>
                    <p className="mt-3 font-mono text-lg font-bold text-white">{formula}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{details}</p>
                  </article>
                ))}
              </div>
            </section>

            <section id="quiz" className="scroll-mt-6 rounded-3xl border border-white/10 bg-[#111A2E] p-5 sm:p-7 md:p-8">
              <LessonQuizEligibilityNotice
                eligibility={eligibility}
                error={eligibilityError}
                onRetry={() => void refreshEligibility()}
              />
              <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-emerald-300">CHECK YOUR KNOWLEDGE</p>
                  <h2 className="mt-2 text-2xl font-bold md:text-3xl">
                    Measurements &amp; Vectors · 20 questions
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
              <div className="space-y-5">
                {quizAttempt.map((item, index) => (
                  <LessonQuizQuestion key={item.question} number={index + 1}>
                    <p className="font-semibold leading-6">{item.question}</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {item.choices.map((choice, choiceIndex) => {
                        const selected = answers[index] === choiceIndex;
                        const correct = item.answer === choiceIndex;
                        const state = submitted
                          ? correct ? "correct" : selected ? "incorrect" : "muted"
                          : selected ? "selected" : "default";
                        return (
                          <button
                            key={choice}
                            type="button"
                            disabled={submitted}
                            aria-pressed={selected}
                            onClick={() => setAnswers((previous) => ({ ...previous, [index]: choiceIndex }))}
                            className={`${QUIZ_OPTION_BASE_CLASS} ${getQuizOptionClass(state)}`}
                          >
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5 text-xs font-bold">
                              {String.fromCharCode(65 + choiceIndex)}
                            </span>
                            <span className="flex-1">{choice}</span>
                            {submitted && correct && <CheckCircle2 size={18} className="shrink-0 text-emerald-300" />}
                            {submitted && selected && !correct && <XCircle size={18} className="shrink-0 text-rose-300" />}
                          </button>
                        );
                      })}
                    </div>
                    {submitted && (
                      <p className="mt-4 flex gap-2 text-sm leading-6 text-slate-400">
                        <CheckCircle2 size={16} className="mt-1 shrink-0 text-sky-300" />
                        {item.explanation}
                      </p>
                    )}
                  </LessonQuizQuestion>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {!submitted ? (
                  <>
                    <button
                      type="button"
                      disabled={
                        answeredCount !== quizAttempt.length ||
                        !eligibility?.eligible ||
                        saveState === "saving"
                      }
                      onClick={submitQuiz}
                      className={QUIZ_SUBMIT_BUTTON_CLASS}
                    >
                      Submit quiz <ArrowRight size={18} />
                    </button>
                    <span className="text-sm text-slate-400">
                      {answeredCount} / {quizAttempt.length} answered
                    </span>
                  </>
                ) : (
                  <button type="button" onClick={resetQuiz} className={QUIZ_RETRY_BUTTON_CLASS}>
                    <RotateCcw size={18} /> Try again
                  </button>
                )}
              </div>
              {submitted && (
                <div className="mt-5 rounded-xl border border-emerald-400/15 bg-emerald-400/5 p-4">
                  <p className="font-bold text-emerald-300">
                    {passed ? "Knowledge check passed" : "Keep practicing"}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    You scored {score} out of {quizAttempt.length}. A score of 12/20 (60%) or higher completes this module.
                  </p>
                </div>
              )}
              <LessonQuizFeedback
                saveState={saveState}
                passed={passed}
                message={saveMessage}
                onRetry={async () => {
                  if (await saveResult(
                    "measurements-vectors",
                    quizAttempt.map((_, index) => answers[index] ?? -1),
                    quizAttempt.map((question) => ({
                      question: question.question,
                      choices: question.originalChoices,
                      explanation: question.explanation,
                      questionIndex: question.questionIndex,
                      optionOrder: question.optionOrder,
                    }))
                  )) setSubmitted(true);
                }}
              />
            </section>

            <LessonNavigation
              lessonSlug="measurements-vectors"
              next={{ href: "/lessons/fluids", label: "Fluids" }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

function VectorControl({
  label,
  magnitude,
  angle,
  color,
  onMagnitudeChange,
  onAngleChange,
}: {
  label: string;
  magnitude: number;
  angle: number;
  color: "sky" | "violet";
  onMagnitudeChange: (value: number) => void;
  onAngleChange: (value: number) => void;
}) {
  const textColor = color === "sky" ? "text-sky-300" : "text-violet-300";
  const accentColor = color === "sky" ? "accent-sky-400" : "accent-violet-400";
  const magnitudeId = `${label.toLowerCase().replace(" ", "-")}-magnitude`;
  const angleId = `${label.toLowerCase().replace(" ", "-")}-angle`;

  return (
    <div className="rounded-xl border border-white/10 bg-[#080D1B] p-4">
      <div className="flex items-center justify-between gap-3">
        <h4 className={`font-bold ${textColor}`}>{label}</h4>
        <span className="font-mono text-sm text-white">
          {magnitude} m · {angle}°
        </span>
      </div>
      <label htmlFor={magnitudeId} className="mt-4 flex justify-between text-sm text-slate-400">
        Magnitude <span>{magnitude} m</span>
      </label>
      <input id={magnitudeId} type="range" min="0" max="20" step="0.1" value={magnitude} onChange={(event) => onMagnitudeChange(Number(event.target.value))} className={`mt-2 w-full ${accentColor}`} />
      <label htmlFor={angleId} className="mt-4 flex justify-between text-sm text-slate-400">
        Direction <span>{angle}°</span>
      </label>
      <input id={angleId} type="range" min="0" max="359" step="1" value={angle} onChange={(event) => onAngleChange(Number(event.target.value))} className={`mt-2 w-full ${accentColor}`} />
    </div>
  );
}

function ResultCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#10182B] p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 break-words font-mono text-sm font-bold text-emerald-300">{value}</p>
    </div>
  );
}
