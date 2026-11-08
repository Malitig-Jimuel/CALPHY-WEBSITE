"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
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
import LessonQuizFeedback from "../LessonQuizFeedback";
import {
  LessonQuizEligibilityNotice,
  useLessonQuizEligibility,
} from "../LessonQuizEligibility";
import LessonHeader from "../LessonHeader";
import LessonProgressTracker from "../LessonProgressTracker";
import LessonNavigation from "../LessonNavigation";
import LessonQuizQuestion, {
  getQuizOptionClass,
  QUIZ_OPTION_BASE_CLASS,
  QUIZ_RETRY_BUTTON_CLASS,
  QUIZ_SUBMIT_BUTTON_CLASS,
} from "../LessonQuizQuestion";
import { useLessonQuizResult } from "../useLessonQuizResult";
import { useShuffledQuestionOrder } from "../quizRandomization";

type HeatTransferMode = "conduction" | "convection" | "radiation";
type TemperatureScale = "C" | "F" | "K";

const THERMOMETER_MIN_CELSIUS = -50;
const THERMOMETER_MAX_CELSIUS = 150;
const THERMOMETER_TICKS = Array.from({ length: 9 }, (_, index) =>
  THERMOMETER_MIN_CELSIUS + index * 25
);

function convertFromCelsius(value: number, scale: TemperatureScale) {
  if (scale === "F") return (value * 9) / 5 + 32;
  if (scale === "K") return value + 273.15;
  return value;
}

function convertToCelsius(value: number, scale: TemperatureScale) {
  if (scale === "F") return ((value - 32) * 5) / 9;
  if (scale === "K") return value - 273.15;
  return value;
}

function formatScaleTemperature(value: number, scale: TemperatureScale) {
  const suffix = scale === "K" ? "K" : `°${scale}`;
  return `${Number(value.toFixed(1))}${suffix}`;
}

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
const quizOptionCounts = questions.map((question) => question.options.length);

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
    given: ["TF = 98.6°F"],
    find: "The temperature in degrees Celsius, TC.",
    formula: "TC = 5/9 (TF − 32)",
    substitution: "TC = 5/9 (98.6 − 32)",
    calculation: "TC = 5/9 × 66.6 = 37.0",
    answer: "TC = 37.0°C",
  },
  {
    title: "Example 2: Celsius to Fahrenheit",
    problem:
      "A time and temperature sign on a bank indicates that the outdoor temperature is −20.0°C. Find the corresponding temperature on the Fahrenheit scale.",
    given: ["TC = −20.0°C"],
    find: "The temperature in degrees Fahrenheit, TF.",
    formula: "TF = 9/5 TC + 32",
    substitution: "TF = 9/5 (−20.0) + 32",
    calculation: "TF = −36.0 + 32 = −4.0",
    answer: "TF = −4.0°F",
  },
  {
    title: "Example 3: Gold engagement ring",
    problem:
      "A gold engagement ring has an inner diameter of 1.5 × 10⁻² m and a temperature of 27°C. The ring falls into a sink of hot water whose temperature is 49°C. What is the change in the diameter of the hole in the ring?",
    given: [
      "D₀ = 1.5 × 10⁻² m",
      "T₀ = 27°C",
      "Tf = 49°C",
      "αgold = 14 × 10⁻⁶ °C⁻¹",
    ],
    find: "The change in the diameter of the ring's hole, ΔD.",
    formula: "ΔD = αD₀ΔT",
    substitution: "ΔD = (14 × 10⁻⁶ °C⁻¹)(1.5 × 10⁻² m)(49 − 27)°C",
    calculation: "ΔD = 4.62 × 10⁻⁶ m = 4.62 μm",
    answer: "ΔD = 4.62 μm",
  },
  {
    title: "Example 4: Heating water",
    problem: "What is the energy required to raise the temperature of 0.500 kg of water by 3.00°C?",
    given: ["m = 0.500 kg", "c = 4186 J/(kg·°C)", "ΔT = 3.00°C"],
    find: "The heat energy, Q, required.",
    formula: "Q = mcΔT",
    substitution: "Q = (0.500 kg)(4186 J/(kg·°C))(3.00°C)",
    calculation: "Q = 6,279 J",
    answer: "Q = 6,279 J",
  },
  {
    title: "Example 5: The jogger",
    problem:
      "In a half hour, a 65-kg jogger can generate 8.0 × 10⁵ J of heat. If the heat were not removed, how much would the jogger's body temperature increase? (c = 3500 J/(kg·C°))",
    given: ["m = 65 kg", "Q = 8.0 × 10⁵ J", "c = 3500 J/(kg·°C)"],
    find: "The jogger's body-temperature increase, ΔT.",
    formula: "Q = mcΔT, so ΔT = Q/(mc)",
    substitution: "ΔT = (8.0 × 10⁵ J)/((65 kg)(3500 J/(kg·°C)))",
    calculation: "ΔT = 3.516…°C ≈ 3.52°C",
    answer: "ΔT = 3.52°C",
  },
];

export default function TemperatureHeatPage() {
  const { eligibility, error: eligibilityError, refresh: refreshEligibility } =
    useLessonQuizEligibility("temperature-heat");
  // Temperature converter
  const [celsius, setCelsius] = useState(25);
  const [fahrenheitInput, setFahrenheitInput] = useState(98.6);
  const [heatTransferMode, setHeatTransferMode] =
    useState<HeatTransferMode>("conduction");
  const [thermometerCelsius, setThermometerCelsius] = useState(22);
  const [thermometerScale, setThermometerScale] =
    useState<TemperatureScale>("C");
  const [targetTemperatureCelsius, setTargetTemperatureCelsius] = useState(37);

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
  const [openExamples, setOpenExamples] = useState<Set<number>>(() => new Set());

  function toggleExample(index: number) {
    setOpenExamples((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function resetTemperatureConverter() {
    setCelsius(25);
    setFahrenheitInput(98.6);
  }

  function resetExpansionCalculator() {
    setExpMaterial(6);
    setLength0(0.015);
    setExpT0(27);
    setExpTf(49);
  }

  function resetSpecificHeatCalculator() {
    setMass(1);
    setSpecificHeat(4186);
    setInitialTemp(20);
    setFinalTemp(50);
  }

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
    useShuffledQuestionOrder(quizOptionCounts);
  const quizAttempt = quizOrder.map(({ questionIndex, optionOrder }) => {
    const question = questions[questionIndex];

    return {
      ...question,
      options: optionOrder.map((optionIndex) => question.options[optionIndex]),
      answer: optionOrder.indexOf(question.answer),
      questionIndex,
      originalOptions: question.options,
      optionOrder,
    };
  });

  const kelvin = celsius + 273.15;
  const fahrenheit = (celsius * 9) / 5 + 32;
  const fahrenheitValid =
    Number.isFinite(fahrenheitInput) && fahrenheitInput >= -459.67;
  const celsiusFromF = fahrenheitValid
    ? (5 / 9) * (fahrenheitInput - 32)
    : Number.NaN;
  const thermoFraction = Math.max(0, Math.min(1, (celsius + 273.15) / 473.15));
  const thermometerFraction = Math.max(
    0,
    Math.min(
      1,
      (thermometerCelsius - THERMOMETER_MIN_CELSIUS) /
        (THERMOMETER_MAX_CELSIUS - THERMOMETER_MIN_CELSIUS)
    )
  );
  const thermometerReading = convertFromCelsius(
    thermometerCelsius,
    thermometerScale
  );
  const targetTemperature = convertFromCelsius(
    targetTemperatureCelsius,
    thermometerScale
  );
  const thermometerTicks = THERMOMETER_TICKS.map((tickCelsius) => ({
    celsius: tickCelsius,
    y: 270 - ((tickCelsius - THERMOMETER_MIN_CELSIUS) / 200) * 220,
    label: formatScaleTemperature(
      convertFromCelsius(tickCelsius, thermometerScale),
      thermometerScale
    ),
  }));
  const targetReached = Math.abs(
    thermometerCelsius - targetTemperatureCelsius
  ) <= 0.5;

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
  const score = quizAttempt.reduce(
    (total, question, index) =>
      total + (answers[index] === question.answer ? 1 : 0),
    0
  );

  function resetQuiz() {
    setAnswers({});
    setSubmitted(false);
    resetResult();
    reshuffleQuiz();
  }

  async function submitQuiz() {
    if (!eligibility?.eligible) return;
    const saved = await saveResult(
      "temperature-heat",
      quizAttempt.map((_, index) => answers[index] ?? -1),
      quizAttempt.map((question) => ({
        question: question.question,
        choices: question.originalOptions,
        explanation: question.explanation,
        questionIndex: question.questionIndex,
        optionOrder: question.optionOrder,
      }))
    );
    if (saved) setSubmitted(true);
  }

  return (
    <main className="flex h-full min-h-0 flex-col overflow-hidden bg-[#080D1B] text-[#F8FAFC]">

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div id="lesson-main-scroll" className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto w-full max-w-[1600px]">
        <LessonProgressTracker lessonSlug="temperature-heat" />
        <LessonHeader
          module="Physics module 03"
          icon={<Thermometer size={18} />}
          accentClass="text-orange-300"
          title={
            <>
              Temperature <span className="text-orange-300">&amp; Heat</span>
            </>
          }
          description={
            <>
            Learn what temperature and heat mean, convert between temperature scales,
            explore thermal expansion, and calculate heat using specific heat capacity.
            </>
          }
        />

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

        <section id="temperature-heat" className="mb-12 scroll-mt-28 grid gap-6 lg:grid-cols-2">
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

        <section
          id="heat-transfer"
          className="mb-12 scroll-mt-28 rounded-3xl border border-orange-400/20 bg-[#111A2E] p-6 md:p-8"
        >
          <div className="mb-5">
            <p className="text-sm font-semibold text-orange-300">KEY CONCEPTS</p>
            <h2 className="mt-2 text-2xl font-bold md:text-3xl">
              Heat Transfer Demonstration
            </h2>
            <p className="mt-3 max-w-4xl leading-7 text-slate-400">
              Net heat transfer is from higher to lower temperature. Select a
              mechanism to see how energy moves; the diagrams are qualitative,
              not measurements of a transfer rate.
            </p>
          </div>
          <div
            role="group"
            aria-label="Select a heat-transfer mechanism"
            className="grid gap-3 sm:grid-cols-3"
          >
            {(["conduction", "convection", "radiation"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                aria-pressed={heatTransferMode === mode}
                onClick={() => setHeatTransferMode(mode)}
                className={`rounded-xl border px-4 py-3 text-left font-semibold capitalize transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300 ${
                  heatTransferMode === mode
                    ? "border-orange-300/50 bg-orange-300/10 text-orange-200"
                    : "border-white/10 text-slate-300 hover:bg-white/5"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setHeatTransferMode("conduction")}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
          >
            <RotateCcw size={15} aria-hidden="true" />
            Reset demonstration
          </button>
          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-center">
            <div className="rounded-2xl border border-white/10 bg-[#080D1B] p-4">
              {heatTransferMode === "conduction" ? (
                <svg viewBox="0 0 360 150" role="img" aria-label="Thermal energy moving through a solid from its hot end toward its cool end" className="w-full">
                  <defs>
                    <linearGradient id="conductionGradient">
                      <stop offset="0%" stopColor="#F97316" />
                      <stop offset="100%" stopColor="#38BDF8" />
                    </linearGradient>
                  </defs>
                  <rect x="35" y="58" width="290" height="34" rx="17" fill="url(#conductionGradient)" opacity=".75" />
                  {[70, 120, 170, 220, 270].map((x) => <circle key={x} cx={x} cy="75" r="7" fill="#F8FAFC" opacity=".8" />)}
                  <path d="M75 112 H286" stroke="#FDBA74" strokeWidth="3" markerEnd="url(#heatTransferArrow)" />
                  <text x="50" y="42" fill="#FDBA74" fontSize="13">Hot end</text>
                  <text x="276" y="42" fill="#7DD3FC" fontSize="13">Cool end</text>
                  <defs><marker id="heatTransferArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#FDBA74" /></marker></defs>
                </svg>
              ) : heatTransferMode === "convection" ? (
                <svg viewBox="0 0 360 150" role="img" aria-label="Convection currents circulating in a heated fluid" className="w-full">
                  <rect x="66" y="22" width="228" height="108" rx="14" fill="#1E293B" stroke="#64748B" strokeWidth="2" />
                  <path d="M110 100 C75 48 135 28 174 47" fill="none" stroke="#FB923C" strokeWidth="4" markerEnd="url(#convectionArrow)" />
                  <path d="M185 48 C235 25 282 62 250 104" fill="none" stroke="#38BDF8" strokeWidth="4" markerEnd="url(#convectionArrow)" />
                  <path d="M240 108 C195 133 131 126 111 101" fill="none" stroke="#A78BFA" strokeWidth="4" markerEnd="url(#convectionArrow)" />
                  <circle cx="180" cy="111" r="11" fill="#F97316" />
                  <text x="180" y="18" fill="#CBD5E1" fontSize="12" textAnchor="middle">Fluid circulates as warm, less-dense regions rise</text>
                  <defs><marker id="convectionArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#A78BFA" /></marker></defs>
                </svg>
              ) : (
                <svg viewBox="0 0 360 150" role="img" aria-label="Thermal radiation traveling as electromagnetic waves from a warm source to an object" className="w-full">
                  <circle cx="70" cy="75" r="30" fill="#F97316" />
                  <path d="M110 75 C123 45 136 105 149 75 S175 45 188 75 S214 105 227 75 S253 45 266 75" fill="none" stroke="#FDBA74" strokeWidth="4" />
                  <rect x="282" y="47" width="35" height="56" rx="6" fill="#475569" stroke="#CBD5E1" strokeWidth="2" />
                  <text x="70" y="126" fill="#FDBA74" fontSize="12" textAnchor="middle">Warm source</text>
                  <text x="300" y="126" fill="#CBD5E1" fontSize="12" textAnchor="middle">Object</text>
                </svg>
              )}
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#080D1B] p-5">
              {heatTransferMode === "conduction" ? (
                <>
                  <h3 className="font-bold text-orange-200">Conduction</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Energy is transferred through microscopic interactions between
                    neighboring particles, without bulk motion of the material.
                    Metals conduct well; insulation reduces conduction.
                  </p>
                  <p className="mt-3 text-sm text-slate-400">Example: a metal spoon warms along its length when one end is in hot liquid.</p>
                </>
              ) : heatTransferMode === "convection" ? (
                <>
                  <h3 className="font-bold text-sky-200">Convection</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    In fluids, temperature differences can create density
                    differences and buoyant motion. The moving fluid transports
                    internal energy; convection cannot occur in a vacuum.
                  </p>
                  <p className="mt-3 text-sm text-slate-400">Example: warm water rises and cooler water sinks as water is heated from below.</p>
                </>
              ) : (
                <>
                  <h3 className="font-bold text-violet-200">Thermal radiation</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Matter emits and absorbs electromagnetic radiation. Radiation
                    can transfer energy through empty space, so it does not
                    require particle contact or a material medium.
                  </p>
                  <p className="mt-3 text-sm text-slate-400">Example: energy from the Sun reaches Earth through space.</p>
                </>
              )}
            </div>
          </div>
        </section>

        <section id="temperature-converter" className="mb-12 scroll-mt-28 rounded-3xl border border-orange-400/20 bg-[#111A2E] p-6 md:p-8">
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
                  min="-273.15"
                  max="200"
                  step="0.01"
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
                    min="-459.67"
                    step="any"
                    value={Number.isFinite(fahrenheitInput) ? fahrenheitInput : ""}
                    onChange={(event) =>
                      setFahrenheitInput(
                        event.target.value === ""
                          ? Number.NaN
                          : Number(event.target.value)
                      )
                    }
                    className="w-32 rounded-xl border border-white/10 bg-[#111A2E] px-4 py-2 text-white outline-none focus:border-orange-300"
                  />
                  <span className="text-sm text-slate-400">°F =</span>
                  <span className="text-xl font-bold text-orange-300">
                    {fahrenheitValid ? `${celsiusFromF.toFixed(2)}°C` : "—"}
                  </span>
                </div>
                {!fahrenheitValid && (
                  <p role="alert" className="mt-2 text-xs text-amber-300">
                    Enter a temperature at or above absolute zero (−459.67°F).
                  </p>
                )}
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
          <button
            type="button"
            onClick={resetTemperatureConverter}
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
          >
            <RotateCcw size={15} aria-hidden="true" />
            Reset converter
          </button>
        </section>

        <section
          id="thermometer-simulation"
          className="mb-12 scroll-mt-28 rounded-3xl border border-orange-400/20 bg-[#111A2E] p-6 md:p-8"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-orange-400/10 p-3 text-orange-300">
              <Thermometer size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold text-orange-300">
                INTERACTIVE SIMULATION
              </p>
              <h2 className="mt-1 text-2xl font-bold md:text-3xl">
                Graduated Thermometer
              </h2>
            </div>
          </div>
          <p className="mb-6 max-w-4xl leading-7 text-slate-400">
            A thermometer measures temperature by using a{" "}
            <strong className="text-slate-200">thermometric property</strong>—a
            physical property that changes predictably with temperature. In a
            liquid-in-glass thermometer, the liquid expands when warmed and
            contracts when cooled, so its level rises or falls in the narrow
            tube. This graduated thermometer is a simplified educational model,
            not a calibrated instrument.
          </p>

          <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
            <div className="space-y-5 rounded-2xl border border-white/10 bg-[#080D1B] p-5 sm:p-6">
              <fieldset>
                <legend className="mb-3 text-sm font-semibold text-slate-300">
                  Temperature scale
                </legend>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    ["C", "Celsius (°C)"],
                    ["F", "Fahrenheit (°F)"],
                    ["K", "Kelvin (K)"],
                  ] as const).map(([scale, label]) => (
                    <button
                      key={scale}
                      type="button"
                      aria-pressed={thermometerScale === scale}
                      onClick={() => setThermometerScale(scale)}
                      className={`min-h-11 rounded-xl border px-3 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300 ${
                        thermometerScale === scale
                          ? "border-orange-300/50 bg-orange-300/10 text-orange-200"
                          : "border-white/10 text-slate-300 hover:bg-white/5"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div>
                <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                  <label htmlFor="thermometer-temperature" className="text-sm text-slate-300">
                    Set temperature <span className="text-slate-500">(°C control)</span>
                  </label>
                  <strong className="text-2xl font-black text-orange-300" aria-live="polite">
                    {formatScaleTemperature(thermometerReading, thermometerScale)}
                  </strong>
                </div>
                <input
                  id="thermometer-temperature"
                  type="range"
                  min={THERMOMETER_MIN_CELSIUS}
                  max={THERMOMETER_MAX_CELSIUS}
                  step="0.5"
                  value={thermometerCelsius}
                  onChange={(event) =>
                    setThermometerCelsius(Number(event.target.value))
                  }
                  className="w-full accent-orange-400"
                  aria-valuetext={formatScaleTemperature(
                    thermometerReading,
                    thermometerScale
                  )}
                />
                <div className="mt-2 flex justify-between text-xs text-slate-500">
                  <span>{formatScaleTemperature(convertFromCelsius(-50, thermometerScale), thermometerScale)}</span>
                  <span>{formatScaleTemperature(convertFromCelsius(150, thermometerScale), thermometerScale)}</span>
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold text-slate-300">
                  Temperature presets
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Cold environment", celsius: -20 },
                    { label: "Freezing water", celsius: 0 },
                    { label: "Room temperature", celsius: 22 },
                    { label: "Hot environment", celsius: 60 },
                    { label: "Boiling water", celsius: 100 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      aria-pressed={thermometerCelsius === preset.celsius}
                      onClick={() => setThermometerCelsius(preset.celsius)}
                      className={`rounded-lg border px-3 py-2 text-xs transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300 ${
                        thermometerCelsius === preset.celsius
                          ? "border-orange-300/50 bg-orange-300/10 text-orange-200"
                          : "border-white/10 text-slate-300 hover:border-orange-300/50 hover:text-orange-200"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/10 pt-5">
                <h3 className="font-bold text-orange-200">
                  Practice · reach the target
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Set a target temperature, then adjust the thermometer until
                  its reading is within 0.5°C of the target.
                </p>
                <label
                  htmlFor="thermometer-target"
                  className="mt-4 block text-sm text-slate-300"
                >
                  Target temperature ({thermometerScale === "K" ? "K" : `°${thermometerScale}`})
                </label>
                <input
                  id="thermometer-target"
                  type="number"
                  min={convertFromCelsius(THERMOMETER_MIN_CELSIUS, thermometerScale)}
                  max={convertFromCelsius(THERMOMETER_MAX_CELSIUS, thermometerScale)}
                  step="0.1"
                  value={Number(targetTemperature.toFixed(1))}
                  onChange={(event) => {
                    const targetInScale = Number(event.target.value);
                    if (!event.target.value || !Number.isFinite(targetInScale)) return;
                    const targetInCelsius = convertToCelsius(
                      targetInScale,
                      thermometerScale
                    );
                    setTargetTemperatureCelsius(
                      Math.max(
                        THERMOMETER_MIN_CELSIUS,
                        Math.min(THERMOMETER_MAX_CELSIUS, targetInCelsius)
                      )
                    );
                  }}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#111A2E] px-4 py-3 text-white outline-none focus:border-orange-300 sm:max-w-xs"
                />
                <p
                  className={`mt-3 text-sm font-semibold ${
                    targetReached ? "text-emerald-300" : "text-amber-200"
                  }`}
                  aria-live="polite"
                  role="status"
                >
                  {targetReached
                    ? `Target reached! The thermometer is at ${formatScaleTemperature(thermometerReading, thermometerScale)}.`
                    : thermometerCelsius < targetTemperatureCelsius
                      ? `Keep warming: set the thermometer to ${formatScaleTemperature(targetTemperature, thermometerScale)}.`
                      : `Cool it down: set the thermometer to ${formatScaleTemperature(targetTemperature, thermometerScale)}.`}
                </p>
              </div>
            </div>

            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#080D1B] p-4 sm:p-6">
              <p className="mb-2 text-sm font-semibold text-slate-300">
                Liquid-in-glass thermometer
              </p>
              <svg
                viewBox="0 0 280 350"
                role="img"
                aria-label={`Graduated thermometer reading ${formatScaleTemperature(thermometerReading, thermometerScale)}. The liquid level changes with temperature.`}
                className="h-auto w-full max-w-[280px]"
              >
                <defs>
                  <linearGradient id="thermometerLiquidGradient" x1="0" x2="0" y1="1" y2="0">
                    <stop offset="0%" stopColor="#EA580C" />
                    <stop offset="100%" stopColor="#FDE047" />
                  </linearGradient>
                  <clipPath id="thermometerLiquidClip">
                    <rect x="112" y="34" width="36" height="250" rx="18" />
                    <circle cx="130" cy="292" r="31" />
                  </clipPath>
                </defs>
                <rect
                  x="104"
                  y="26"
                  width="52"
                  height="266"
                  rx="26"
                  fill="#1E293B"
                  stroke="#CBD5E1"
                  strokeWidth="3"
                />
                <circle
                  cx="130"
                  cy="292"
                  r="39"
                  fill="#1E293B"
                  stroke="#CBD5E1"
                  strokeWidth="3"
                />
                <motion.rect
                  initial={false}
                  animate={{
                    y: 270 - thermometerFraction * 220,
                    height: 30 + thermometerFraction * 220,
                  }}
                  transition={{ type: "spring", stiffness: 90, damping: 20 }}
                  x="112"
                  width="36"
                  rx="18"
                  fill="url(#thermometerLiquidGradient)"
                  clipPath="url(#thermometerLiquidClip)"
                />
                <circle cx="130" cy="292" r="29" fill="url(#thermometerLiquidGradient)" />
                {thermometerTicks.map((tick) => (
                  <g key={tick.celsius}>
                    <line
                      x1={tick.celsius % 50 === 0 ? 75 : 84}
                      y1={tick.y}
                      x2="101"
                      y2={tick.y}
                      stroke={tick.celsius % 50 === 0 ? "#CBD5E1" : "#64748B"}
                      strokeWidth={tick.celsius % 50 === 0 ? "2" : "1.5"}
                    />
                    {tick.celsius % 50 === 0 && (
                      <text
                        x="68"
                        y={tick.y + 4}
                        fill="#94A3B8"
                        fontSize="10"
                        textAnchor="end"
                      >
                        {tick.label}
                      </text>
                    )}
                  </g>
                ))}
                <motion.line
                  initial={false}
                  animate={{
                    y1: 270 - thermometerFraction * 220,
                    y2: 270 - thermometerFraction * 220,
                  }}
                  transition={{ type: "spring", stiffness: 90, damping: 20 }}
                  x1="158"
                  x2="178"
                  stroke="#FDBA74"
                  strokeWidth="2"
                />
                <text x="184" y="177" fill="#FDBA74" fontSize="10">
                  liquid level
                </text>
              </svg>
              <p className="mt-1 text-3xl font-black text-orange-300" aria-live="polite">
                {formatScaleTemperature(thermometerReading, thermometerScale)}
              </p>
              <p className="mt-2 text-center text-xs leading-5 text-slate-500">
                Graduations update when the scale changes. The illustrated liquid
                level rises as temperature increases and falls as it decreases.
              </p>
            </div>
          </div>
          <div className="mt-5 rounded-xl border border-orange-400/15 bg-orange-400/5 p-4">
            <p className="text-sm leading-6 text-slate-300">
              Scale conversion uses{" "}
              <strong className="text-orange-200">°F = (°C × 9/5) + 32</strong>{" "}
              and <strong className="text-orange-200">K = °C + 273.15</strong>.
              Changing the scale converts the same physical temperature; it
              does not change the thermometer’s actual temperature.
            </p>
          </div>
        </section>

        <section id="thermal-expansion" className="mb-12 scroll-mt-28 rounded-3xl border border-sky-400/20 bg-[#111A2E] p-6 md:p-8">
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
          <button
            type="button"
            onClick={resetExpansionCalculator}
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
          >
            <RotateCcw size={15} aria-hidden="true" />
            Reset calculator
          </button>
        </section>

        <section id="specific-heat" className="mb-12 scroll-mt-28 rounded-3xl border border-violet-400/20 bg-[#111A2E] p-6 md:p-8">
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
          <button
            type="button"
            onClick={resetSpecificHeatCalculator}
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
          >
            <RotateCcw size={15} aria-hidden="true" />
            Reset calculator
          </button>
        </section>

        <section id="worked-examples" className="mb-12 scroll-mt-28 rounded-3xl border border-white/10 bg-[#111A2E] p-6 md:p-8">
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
              const open = openExamples.has(index);
              return (
                <div key={example.title} className="rounded-2xl border border-white/10 bg-[#080D1B] p-5">
                  <p className="font-semibold text-orange-300">{example.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{example.problem}</p>
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={`temperature-example-solution-${index}`}
                    onClick={() => toggleExample(index)}
                    className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
                  >
                    {open ? "Hide Solution" : "Show Solution"}
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        id={`temperature-example-solution-${index}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 space-y-3 rounded-xl bg-white/[0.03] p-4 text-sm leading-6 text-slate-400">
                          <div>
                            <p className="font-semibold text-orange-300">Given</p>
                            {example.given.map((value) => <p key={value}>{value}</p>)}
                          </div>
                          <div>
                            <p className="font-semibold text-orange-300">Find</p>
                            <p>{example.find}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-orange-300">Formula</p>
                            <p>{example.formula}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-orange-300">Substitution</p>
                            <p>{example.substitution}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-orange-300">Calculation</p>
                            <p>{example.calculation}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-orange-300">Final Answer</p>
                            <p className="text-lg font-bold text-emerald-300">{example.answer}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        <section id="quiz" className="mb-12 scroll-mt-28 rounded-3xl border border-white/10 bg-[#111A2E] p-6 md:p-8">
          <LessonQuizEligibilityNotice
            eligibility={eligibility}
            error={eligibilityError}
            onRetry={() => void refreshEligibility()}
          />
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-emerald-300">CHECK YOUR KNOWLEDGE</p>
              <h2 className="mt-2 text-2xl font-bold md:text-3xl">
                Temperature &amp; Heat · {quizAttempt.length} questions
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
              <LessonQuizQuestion key={question.question} number={index + 1}>
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
                        key={option}
                        type="button"
                        disabled={submitted}
                        onClick={() =>
                          setAnswers((previous) => ({
                            ...previous,
                            [index]: optionIndex,
                          }))
                        }
                        className={`${QUIZ_OPTION_BASE_CLASS} ${getQuizOptionClass(optionState)}`}
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
            onRetry={async () => {
              if (await saveResult(
                "temperature-heat",
                quizAttempt.map((_, index) => answers[index] ?? -1),
                quizAttempt.map((question) => ({
                  question: question.question,
                  choices: question.originalOptions,
                  explanation: question.explanation,
                  questionIndex: question.questionIndex,
                  optionOrder: question.optionOrder,
                }))
              )) setSubmitted(true);
            }}
          />
        </section>

        <LessonNavigation
          lessonSlug="temperature-heat"
          previous={{ href: "/lessons/fluids", label: "Fluids" }}
          next={{ href: "/lessons/waves-sound", label: "Waves & Sound" }}
        />
        </div>
        </div>
      </div>
    </main>
  );
}