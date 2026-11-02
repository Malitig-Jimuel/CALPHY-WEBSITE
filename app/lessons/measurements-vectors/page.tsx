"use client";

import Link from "next/link";
import type { PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Lightbulb,
  RotateCcw,
  Ruler,
  Sigma,
  Target,
  XCircle,
} from "lucide-react";
import LessonHeader from "../LessonHeader";
import LessonNavigation from "../LessonNavigation";
import LessonSidebar from "../LessonSidebar";
import LessonProgressTracker from "../LessonProgressTracker";
import LessonQuizFeedback from "../LessonQuizFeedback";
import LessonQuizQuestion, {
  getQuizOptionClass,
  QUIZ_OPTION_BASE_CLASS,
  QUIZ_RETRY_BUTTON_CLASS,
  QUIZ_SUBMIT_BUTTON_CLASS,
} from "../LessonQuizQuestion";
import { useLessonQuizResult } from "../useLessonQuizResult";

const lessonSections = [
  { id: "measurement", label: "Measurement & quantities" },
  { id: "units", label: "SI units & conversion" },
  { id: "uncertainty", label: "Accuracy & uncertainty" },
  { id: "dimensions", label: "Dimensional analysis" },
  { id: "vector-intro", label: "Scalars & vectors" },
  { id: "components", label: "Vector representation" },
  { id: "operations", label: "Vector operations" },
  { id: "problems", label: "Solving vector problems" },
  { id: "formula-reference", label: "Formula reference" },
  { id: "quiz", label: "Quiz" },
];

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
    question: "Round 12.746 to three significant figures.",
    choices: ["12.7", "12.74", "12.8", "13.0"],
    answer: 0,
    explanation:
      "Keep 1, 2, and 7. The next digit is 4, so the 7 stays unchanged: 12.7.",
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
    question: "Which quantity is a scalar?",
    choices: ["Displacement", "Acceleration", "Speed", "Force"],
    answer: 2,
    explanation:
      "Speed has magnitude only. Displacement, acceleration, and force require both magnitude and direction.",
  },
  {
    question: "Which quantity must include direction to be fully described?",
    choices: ["Mass", "Temperature", "Energy", "Velocity"],
    answer: 3,
    explanation:
      "Velocity is a vector. A statement such as 12 m/s east includes both its magnitude and direction.",
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
    question: "A vector points directly along the negative y-axis. What is its direction measured counterclockwise from +x?",
    choices: ["90°", "180°", "270°", "360°"],
    answer: 2,
    explanation:
      "Starting from +x, a counterclockwise rotation of 270° points along −y.",
  },
  {
    question: "A student walks 3 m east and then 4 m north. What is the magnitude of the displacement?",
    choices: ["1 m", "5 m", "7 m", "12 m"],
    answer: 1,
    explanation:
      "The perpendicular components give R = √(3² + 4²) = 5 m. Distance traveled is 7 m, but displacement magnitude is 5 m.",
  },
  {
    question: "A 5 m east vector is subtracted by a 2 m east vector. What is the result?",
    choices: ["7 m east", "3 m east", "3 m west", "10 m east"],
    answer: 1,
    explanation:
      "A − B = 5 east + (−2 east) = 3 m east. Subtraction adds the reversed vector.",
  },
  {
    question: "Two forces, 6 N east and 8 N north, act at right angles. What is the resultant magnitude?",
    choices: ["2 N", "10 N", "14 N", "48 N"],
    answer: 1,
    explanation:
      "The components are perpendicular, so R = √(6² + 8²) = √100 = 10 N.",
  },
  {
    question: "A 12 N vector points west. What are its x- and y-components if east is +x?",
    choices: ["(12 N, 0 N)", "(0 N, 12 N)", "(−12 N, 0 N)", "(0 N, −12 N)"],
    answer: 2,
    explanation:
      "West is the negative x-direction, so Ax = −12 N and Ay = 0 N.",
  },
];

type UnitKey = "km" | "m" | "cm" | "mm";
const lengthFactors: Record<UnitKey, number> = {
  km: 1000,
  m: 1,
  cm: 0.01,
  mm: 0.001,
};

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
  answer,
}: {
  title: string;
  problem: string;
  steps: string[];
  answer: string;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#080D1B] p-5">
      <p className="text-sm font-bold text-orange-300">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{problem}</p>
      <ol className="mt-4 space-y-2 text-sm leading-6 text-slate-400">
        {steps.map((step, index) => (
          <li key={step} className="flex gap-3">
            <span className="font-bold text-sky-300">{index + 1}.</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      <p className="mt-4 rounded-xl border border-emerald-400/15 bg-emerald-400/5 p-3 text-sm font-bold text-emerald-300">
        {answer}
      </p>
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
  const [magnitudeA, setMagnitudeA] = useState(8);
  const [angleA, setAngleA] = useState(30);
  const [magnitudeB, setMagnitudeB] = useState(6);
  const [angleB, setAngleB] = useState(120);
  const [draggingVector, setDraggingVector] = useState<"A" | "B" | null>(null);
  const [conversionValue, setConversionValue] = useState("2.5");
  const [conversionFrom, setConversionFrom] = useState<UnitKey>("km");
  const [conversionTo, setConversionTo] = useState<UnitKey>("m");
  const [conversionResult, setConversionResult] = useState<string | null>(null);
  const [practiceAnswer, setPracticeAnswer] = useState<string | null>(null);
  const [identificationAnswer, setIdentificationAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const {
    saveState,
    saveMessage,
    passed,
    saveResult,
    resetResult,
  } = useLessonQuizResult();
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const ax = magnitudeA * Math.cos(toRadians(angleA));
  const ay = magnitudeA * Math.sin(toRadians(angleA));
  const bx = magnitudeB * Math.cos(toRadians(angleB));
  const by = magnitudeB * Math.sin(toRadians(angleB));
  const rx = ax + bx;
  const ry = ay + by;
  const resultant = Math.hypot(rx, ry);
  const resultantAngle = (Math.atan2(ry, rx) * 180) / Math.PI;
  const normalizedAngle = (resultantAngle + 360) % 360;
  const graphCenter = 180;
  const graphScale = 3.5;
  const pointA = { x: graphCenter + ax * graphScale, y: graphCenter - ay * graphScale };
  const pointB = { x: graphCenter + bx * graphScale, y: graphCenter - by * graphScale };
  const pointR = { x: graphCenter + rx * graphScale, y: graphCenter - ry * graphScale };
  function startVectorDrag(event: ReactPointerEvent<SVGSVGElement>) {
    const vector = (event.target as Element)
      .closest("[data-vector]")
      ?.getAttribute("data-vector");
    if (vector !== "A" && vector !== "B") return;

    event.preventDefault();
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
      setAngleA(Math.round(normalizedNextAngle));
    } else {
      setMagnitudeB(Math.round(nextMagnitude * 10) / 10);
      setAngleB(Math.round(normalizedNextAngle));
    }
  }

  const score = quiz.reduce(
    (total, question, index) =>
      total + (answers[index] === question.answer ? 1 : 0),
    0
  );
  const answeredCount = Object.keys(answers).length;

  function convertUnits() {
    const value = Number(conversionValue);
    if (!conversionValue.trim() || !Number.isFinite(value)) {
      setConversionResult("Enter a valid finite number before converting.");
      return;
    }

    const converted =
      (value * lengthFactors[conversionFrom]) / lengthFactors[conversionTo];
    setConversionResult(
      `${value} ${conversionFrom} = ${Number(converted.toPrecision(8))} ${conversionTo}`
    );
  }

  function submitQuiz() {
    if (answeredCount !== quiz.length) return;
    setSubmitted(true);
    void saveResult(
      "measurements-vectors",
      quiz.map((_, index) => answers[index] ?? -1),
      quiz.map((question) => ({
        question: question.question,
        choices: question.choices,
        explanation: question.explanation,
      }))
    );
  }

  function resetQuiz() {
    setAnswers({});
    setSubmitted(false);
    resetResult();
  }

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-[#080D1B] text-slate-100">
      <LessonNavigation />
      <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] md:grid-rows-1 md:grid-cols-[250px_minmax(0,1fr)]">
        <LessonSidebar sections={lessonSections} />
        <div
          id="lesson-main-scroll"
          className="min-w-0 overflow-y-auto overscroll-contain px-4 py-6 sm:px-6 lg:px-10"
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
              description="Build a reliable foundation in measurement, units, uncertainty, dimensional reasoning, and two-dimensional vectors. Work through examples, try the interactive tools, then check your understanding."
            >
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-sky-300">
                  <Ruler className="mr-2 inline" size={15} />
                  Measurement
                </span>
                <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-violet-300">
                  <Sigma className="mr-2 inline" size={15} />
                  Units & dimensions
                </span>
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-emerald-300">
                  <Target className="mr-2 inline" size={15} />
                  Vector simulation
                </span>
              </div>
            </LessonHeader>

            <div className="rounded-xl border border-sky-400/15 bg-sky-400/5 p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-sky-300">
                <Lightbulb size={16} /> How to use this lesson
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Read the concept cards, follow the worked solutions line by
                line, and try the practice activities before using the section
                navigation to revisit topics.
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
                  answer="90 km/h = 25 m/s."
                />
              </div>

              <div className="mt-5 rounded-2xl border border-cyan-400/15 bg-cyan-400/5 p-5">
                <h3 className="font-bold text-cyan-300">Try a unit conversion</h3>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Convert a length by multiplying by the source-to-meter factor
                  and dividing by the target-to-meter factor.
                </p>
                <div className="mt-4 flex flex-wrap items-end gap-3">
                  <label className="min-w-32 flex-1 text-sm text-slate-300">
                    Value
                    <input
                      type="number"
                      step="any"
                      value={conversionValue}
                      onChange={(event) => setConversionValue(event.target.value)}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-[#080D1B] px-3 py-2 text-white outline-none focus:border-cyan-300"
                    />
                  </label>
                  <label className="text-sm text-slate-300">
                    From
                    <select
                      value={conversionFrom}
                      onChange={(event) => setConversionFrom(event.target.value as UnitKey)}
                      className="mt-2 block rounded-xl border border-white/10 bg-[#080D1B] px-3 py-2 text-white"
                    >
                      {Object.keys(lengthFactors).map((unit) => <option key={unit}>{unit}</option>)}
                    </select>
                  </label>
                  <span className="pb-2 text-slate-500">to</span>
                  <label className="text-sm text-slate-300">
                    Unit
                    <select
                      value={conversionTo}
                      onChange={(event) => setConversionTo(event.target.value as UnitKey)}
                      className="mt-2 block rounded-xl border border-white/10 bg-[#080D1B] px-3 py-2 text-white"
                    >
                      {Object.keys(lengthFactors).map((unit) => <option key={unit}>{unit}</option>)}
                    </select>
                  </label>
                  <button
                    type="button"
                    onClick={convertUnits}
                    className="rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-200"
                  >
                    Convert
                  </button>
                </div>
                {conversionResult && (
                  <p className="mt-4 rounded-xl bg-[#080D1B] p-3 text-sm font-semibold text-cyan-200" aria-live="polite">
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

            <section id="dimensions" className="scroll-mt-6">
              <SectionHeading
                number="04"
                title="Dimensional Analysis"
                subtitle="Dimensions describe the physical nature of a quantity and let us test equations and convert units without relying on memorized shortcuts."
              />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  ["Length", "[L]"],
                  ["Mass", "[M]"],
                  ["Time", "[T]"],
                  ["Velocity", "[LT⁻¹]"],
                  ["Acceleration", "[LT⁻²]"],
                  ["Force", "[MLT⁻²]"],
                ].map(([quantity, dimension]) => (
                  <div key={quantity} className="rounded-xl border border-white/10 bg-[#10182B] p-4">
                    <p className="text-sm text-slate-400">{quantity}</p>
                    <p className="mt-2 font-mono text-lg font-bold text-sky-300">{dimension}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 rounded-xl border border-sky-400/15 bg-sky-400/5 p-4 text-sm leading-6 text-slate-300">
                An equation is dimensionally consistent only when every term
                being added has the same dimensions and both sides of the
                equation have matching dimensions. Dimensional analysis checks
                consistency but cannot determine dimensionless constants or
                prove that a physically correct equation has the right form.
              </p>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <WorkedExample
                  title="Worked example 1 · check an equation"
                  problem="Test whether s = ut + ½at² is dimensionally consistent."
                  steps={[
                    "[s] = [L].",
                    "[ut] = [LT⁻¹][T] = [L].",
                    "[at²] = [LT⁻²][T²] = [L]; the factor ½ is dimensionless.",
                    "Both terms on the right and the left side have dimension [L].",
                  ]}
                  answer="The equation is dimensionally consistent."
                />
                <WorkedExample
                  title="Worked example 2 · infer a period relation"
                  problem="Suppose a period T depends on length L and gravitational acceleration g as T ∝ Lᵃgᵇ. Find a and b."
                  steps={[
                    "[T] = [L]ᵃ[LT⁻²]ᵇ = [L]ᵃ⁺ᵇ[T]⁻²ᵇ.",
                    "Match time powers: −2b = 1, so b = −½.",
                    "Match length powers: a + b = 0, so a = ½.",
                  ]}
                  answer="T ∝ √(L/g). Dimensional analysis does not determine the dimensionless constant."
                />
                <WorkedExample
                  title="Worked example 3 · convert acceleration units"
                  problem="Convert 36 km/h² to m/s²."
                  steps={[
                    "Use 36 km/h² × (1,000 m / 1 km) × (1 h / 3,600 s)².",
                    "The units cancel to m/s².",
                    "Numerically, 36 × 1,000 / 3,600² = 0.002777…",
                  ]}
                  answer="36 km/h² ≈ 2.78 × 10⁻³ m/s²."
                />
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
                  answer="Distance = 70 m; displacement = 10 m east."
                />
                <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/5 p-5">
                  <h3 className="font-bold text-cyan-300">Practice · identify a vector</h3>
                  <p className="mt-2 text-sm text-slate-300">
                    Which listed quantity must include direction?
                  </p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {["Mass", "Displacement", "Temperature", "Energy"].map((choice) => {
                      const selected = identificationAnswer === choice;
                      const state = identificationAnswer
                        ? choice === "Displacement" ? "correct" : selected ? "incorrect" : "muted"
                        : "default";
                      return (
                        <button
                          key={choice}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => setIdentificationAnswer(choice)}
                          className={`${QUIZ_OPTION_BASE_CLASS} ${getQuizOptionClass(state)}`}
                        >
                          {choice}
                        </button>
                      );
                    })}
                  </div>
                  {identificationAnswer && (
                    <p className="mt-3 text-sm leading-6 text-slate-300" aria-live="polite">
                      {identificationAnswer === "Displacement"
                        ? "Correct: displacement describes the change in position and needs a direction."
                        : "Try again: mass, temperature, and energy are scalars; displacement requires direction."}
                    </p>
                  )}
                </div>
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
                  answer="A = 5 m at 126.9° counterclockwise from +x."
                />
              </div>
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
                </article>
                <article className="rounded-2xl border border-white/10 bg-[#10182B] p-5">
                  <h3 className="font-bold text-violet-300">Parallelogram method</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Place two vectors tail-to-tail, complete the parallelogram,
                    and draw its diagonal from the common tail. This diagonal
                    is their sum.
                  </p>
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
                      onPointerLeave={() => setDraggingVector(null)}
                      className="mx-auto w-full max-w-md"
                    >
                      <defs>
                        <marker id="simA" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#38BDF8" /></marker>
                        <marker id="simB" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#A78BFA" /></marker>
                        <marker id="simR" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#34D399" /></marker>
                      </defs>
                      {Array.from({ length: 13 }, (_, index) => {
                        const position = 30 + index * 25;
                        return <g key={position}><line x1={position} y1="30" x2={position} y2="330" stroke="#243149" strokeWidth="0.7" /><line x1="30" y1={position} x2="330" y2={position} stroke="#243149" strokeWidth="0.7" /></g>;
                      })}
                      <line x1="25" y1={graphCenter} x2="337" y2={graphCenter} stroke="#64748b" />
                      <line x1={graphCenter} y1="335" x2={graphCenter} y2="23" stroke="#64748b" />
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
                      <ResultCard label="Rx" value={`${rx.toFixed(2)} m`} />
                      <ResultCard label="Ry" value={`${ry.toFixed(2)} m`} />
                      <ResultCard label="|R|" value={`${resultant.toFixed(2)} m`} />
                      <ResultCard label="Direction" value={resultant < 1e-10 ? "undefined" : `${normalizedAngle.toFixed(1)}°`} />
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
                  answer="Net force = 11 N east."
                />
              </div>
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
                    {submitted ? `${score} / ${quiz.length}` : `${answeredCount} / ${quiz.length}`}
                  </p>
                </div>
              </div>
              <div className="mb-6 h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label="Quiz questions answered" aria-valuemin={0} aria-valuemax={quiz.length} aria-valuenow={answeredCount}>
                <div className="h-full rounded-full bg-sky-400 transition-all" style={{ width: `${(answeredCount / quiz.length) * 100}%` }} />
              </div>
              <div className="space-y-5">
                {quiz.map((item, index) => (
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
                      disabled={answeredCount !== quiz.length}
                      onClick={submitQuiz}
                      className={QUIZ_SUBMIT_BUTTON_CLASS}
                    >
                      Submit quiz <ArrowRight size={18} />
                    </button>
                    <span className="text-sm text-slate-400">
                      {answeredCount} / {quiz.length} answered
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
                    {score >= 12 ? "Knowledge check passed" : "Keep practicing"}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    You scored {score} out of {quiz.length}. A score of 12/20 (60%) or higher completes this module.
                  </p>
                </div>
              )}
              <LessonQuizFeedback
                saveState={saveState}
                passed={passed}
                message={saveMessage}
                onRetry={() =>
                  void saveResult(
                    "measurements-vectors",
                    quiz.map((_, index) => answers[index] ?? -1),
                    quiz.map((question) => ({
                      question: question.question,
                      choices: question.choices,
                      explanation: question.explanation,
                    }))
                  )
                }
              />
            </section>

            <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-7 text-sm">
              <p className="text-slate-500">Module 01 · Measurements &amp; Vectors</p>
              <Link
                href="/dashboard"
                className="rounded-xl border border-white/10 px-4 py-3 font-semibold text-slate-200 transition hover:bg-white/5"
              >
                Back to all topics
              </Link>
            </footer>
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
      <input id={magnitudeId} type="range" min="0" max="20" step="1" value={magnitude} onChange={(event) => onMagnitudeChange(Number(event.target.value))} className={`mt-2 w-full ${accentColor}`} />
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
