"use client";

import { useState } from "react";
import type { DragEvent as ReactDragEvent } from "react";
import { ArrowRight, CheckCircle2, RotateCcw, XCircle, Zap } from "lucide-react";
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

/* ---------- Shared styles ---------- */
const card = "rounded-3xl border border-white/10 bg-[#111A2E] p-6 md:p-8";
const inputClass =
  "w-full rounded-xl border border-slate-700 bg-[#080D1B] px-3 py-2 text-slate-100 outline-none focus:border-sky-400";
const formulaBox = "my-4 rounded-xl bg-slate-900 p-4 text-center font-mono text-xl";
const quizFocus =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300";

/* ---------- Helpers ---------- */
const K = 8.99e9; // Coulomb's constant (N·m²/C²)
const MICRO = 1e-6; // μC -> C
const ELEMENTARY_CHARGE = 1.602e-19;

// Turn text from an input box into a number (empty text becomes NaN)
function parseInput(text: string): number {
  return text.trim() === "" ? NaN : Number(text);
}

const superscripts: Record<string, string> = {
  "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
  "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻",
};

// Readable numbers: normal decimals for mid-sized values, scientific notation otherwise
function formatValue(n: number): string {
  if (n === 0) return "0";
  const abs = Math.abs(n);
  if (abs >= 1e4 || abs < 1e-3) {
    const [mantissa, exponent] = n.toExponential(3).split("e");
    const sup = String(Number(exponent))
      .split("")
      .map((c) => superscripts[c] ?? c)
      .join("");
    return `${mantissa} × 10${sup}`;
  }
  return Number(n.toPrecision(4)).toString();
}

function NumberField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (text: string) => void;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-slate-300">{label}</span>
      <input
        className={inputClass}
        type="number"
        step="any"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

function ChargeTransferActivity() {
  const [electronsTransferred, setElectronsTransferred] = useState(0);
  const chargeA = -6 + electronsTransferred;
  const chargeB = 2 - electronsTransferred;
  const totalCharge = chargeA + chargeB;

  return (
    <div className="mt-5 rounded-2xl border border-violet-300/20 bg-[#080D1B] p-5">
      <h3 className="font-semibold text-violet-200">Interactive: transfer electrons</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        Initially object A has −6e and object B has +2e. Move up to six
        electrons from A to B. Losing electrons makes A more positive; gaining
        electrons makes B more negative.
      </p>
      <label htmlFor="electron-transfer" className="mt-4 block text-sm text-slate-300">
        Electrons transferred from A to B: <strong className="text-violet-200">{electronsTransferred}</strong>
        <input
          id="electron-transfer"
          type="range"
          min="0"
          max="6"
          step="1"
          value={electronsTransferred}
          onChange={(event) => setElectronsTransferred(Number(event.target.value))}
          className="mt-3 w-full accent-violet-400"
        />
      </label>
      <div className="mt-4 grid gap-3 sm:grid-cols-3" aria-live="polite">
        <div className="rounded-xl bg-white/[0.04] p-3">
          <p className="text-xs text-slate-400">Before · A + B</p>
          <p className="mt-1 text-sm font-bold text-slate-100">−6e + 2e = −4e</p>
        </div>
        <div className="rounded-xl bg-white/[0.04] p-3">
          <p className="text-xs text-slate-400">After · object A</p>
          <p className="mt-1 text-sm font-bold text-sky-200">{chargeA > 0 ? "+" : ""}{chargeA}e = {formatValue(chargeA * ELEMENTARY_CHARGE)} C</p>
        </div>
        <div className="rounded-xl bg-white/[0.04] p-3">
          <p className="text-xs text-slate-400">After · object B</p>
          <p className="mt-1 text-sm font-bold text-amber-200">{chargeB > 0 ? "+" : ""}{chargeB}e = {formatValue(chargeB * ELEMENTARY_CHARGE)} C</p>
        </div>
      </div>
      <p className="mt-3 text-sm font-semibold text-emerald-300" aria-live="polite">
        Total after transfer: {totalCharge}e = {formatValue(totalCharge * ELEMENTARY_CHARGE)} C (unchanged)
      </p>
    </div>
  );
}

const materialTypes = [
  { material: "Copper", type: "conductor", reason: "Copper has mobile electrons and is widely used for electrical wires." },
  { material: "Aluminum", type: "conductor", reason: "Aluminum conducts charge readily and is used in power lines." },
  { material: "Silver", type: "conductor", reason: "Silver is an excellent electrical conductor." },
  { material: "Gold", type: "conductor", reason: "Gold conducts electricity and resists corrosion." },
  { material: "Rubber", type: "insulator", reason: "Rubber resists charge motion and can insulate wires." },
  { material: "Plastic", type: "insulator", reason: "Most plastics are poor conductors and are used as insulation." },
  { material: "Wood", type: "insulator", reason: "Dry wood is generally a poor conductor compared with metals." },
] as const;

function MaterialClassificationActivity() {
  const [materialIndex, setMaterialIndex] = useState(0);
  const [answer, setAnswer] = useState<"conductor" | "insulator" | null>(null);
  const material = materialTypes[materialIndex];
  const correct = answer === material.type;

  return (
    <div className="mt-5 rounded-2xl border border-sky-300/20 bg-[#080D1B] p-5">
      <h3 className="font-semibold text-sky-200">Try it: classify a material</h3>
      <label htmlFor="classify-material" className="mt-3 block text-sm text-slate-300">
        Material
        <select
          id="classify-material"
          value={materialIndex}
          onChange={(event) => {
            setMaterialIndex(Number(event.target.value));
            setAnswer(null);
          }}
          className={`${inputClass} mt-2`}
        >
          {materialTypes.map((item, index) => (
            <option key={item.material} value={index}>{item.material}</option>
          ))}
        </select>
      </label>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {(["conductor", "insulator"] as const).map((classification) => (
          <button
            key={classification}
            type="button"
            aria-pressed={answer === classification}
            onClick={() => setAnswer(classification)}
            className={`rounded-xl border px-3 py-3 text-sm font-semibold capitalize transition ${
              answer === classification
                ? correct
                  ? "border-emerald-300 bg-emerald-400/10 text-emerald-200"
                  : "border-rose-300 bg-rose-400/10 text-rose-200"
                : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]"
            }`}
          >
            {classification}
          </button>
        ))}
      </div>
      {answer && (
        <p role="status" aria-live="polite" className={`mt-3 text-sm leading-6 ${correct ? "text-emerald-200" : "text-rose-200"}`}>
          {correct ? "Correct. " : `Not quite—${material.material} is a ${material.type}. `}
          {material.reason}
        </p>
      )}
    </div>
  );
}

const coulombChallenges = [
  { title: "Picocoulomb charges", q1: 2, q2: -3, unit: "pC", scale: 1e-12, distance: 0.01 },
  { title: "Nanocoulomb charges", q1: 4, q2: -2, unit: "nC", scale: 1e-9, distance: 0.2 },
  { title: "Microcoulomb charges", q1: 3, q2: 5, unit: "μC", scale: 1e-6, distance: 0.3 },
] as const;

function CoulombPractice() {
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const challenge = coulombChallenges[challengeIndex];
  const q1C = challenge.q1 * challenge.scale;
  const q2C = challenge.q2 * challenge.scale;
  const force = (K * Math.abs(q1C * q2C)) / challenge.distance ** 2;
  const submittedAnswer = parseInput(answer);
  const correct =
    Number.isFinite(submittedAnswer) &&
    Math.abs(submittedAnswer - force) <= Math.max(Math.abs(force) * 0.02, 1e-15);

  function chooseChallenge(value: string) {
    setChallengeIndex(Number(value));
    setAnswer("");
    setChecked(false);
  }

  return (
    <div className="mt-6 rounded-2xl border border-sky-300/20 bg-[#080D1B] p-5">
      <h3 className="font-semibold text-sky-200">Coulomb&apos;s law practice · mixed charge units</h3>
      <label htmlFor="coulomb-practice" className="mt-3 block text-sm text-slate-300">
        Challenge
        <select id="coulomb-practice" value={challengeIndex} onChange={(event) => chooseChallenge(event.target.value)} className={`${inputClass} mt-2`}>
          {coulombChallenges.map((item, index) => <option key={item.title} value={index}>{item.title}</option>)}
        </select>
      </label>
      <p className="mt-3 text-sm leading-6 text-slate-300">
        Find the force magnitude for q₁ = {challenge.q1} {challenge.unit}, q₂ = {challenge.q2} {challenge.unit},
        and r = {challenge.distance} m. Enter your answer in newtons (N).
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <label htmlFor="coulomb-practice-answer" className="text-sm text-slate-300">
          Force magnitude (N)
          <input id="coulomb-practice-answer" type="number" step="any" value={answer} onChange={(event) => { setAnswer(event.target.value); setChecked(false); }} className={`${inputClass} mt-2`} />
        </label>
        <button type="button" onClick={() => setChecked(true)} disabled={!Number.isFinite(submittedAnswer)} className="self-end rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-40">
          Check answer
        </button>
      </div>
      {checked && (
        <div role="status" aria-live="polite" className={`mt-4 rounded-xl p-4 text-sm leading-6 ${correct ? "bg-emerald-400/10 text-emerald-200" : "bg-rose-400/10 text-rose-200"}`}>
          <p className="font-bold">{correct ? "Correct!" : "Not quite. Here is the calculation:"}</p>
          <p className="mt-1">q₁ = {challenge.q1} × {challenge.scale.toExponential(0)} C = {formatValue(q1C)} C</p>
          <p>q₂ = {challenge.q2} × {challenge.scale.toExponential(0)} C = {formatValue(q2C)} C</p>
          <p>F = k|q₁q₂|/r² = (8.99 × 10⁹)|({formatValue(q1C)})({formatValue(q2C)})|/({challenge.distance})²</p>
          <p>F = {formatValue(force)} N. The interaction is attractive because the charges have opposite signs.</p>
        </div>
      )}
    </div>
  );
}

const circuitChallenges = [
  {
    title: "Find current",
    prompt: "A 12 V battery is connected to a 4 Ω resistor. Find the current in amperes.",
    value: 3,
    steps: ["Given: V = 12 V and R = 4 Ω.", "Formula: I = V/R.", "Substitute: I = 12 V / 4 Ω.", "Calculate: I = 3 A."],
    unit: "A",
  },
  {
    title: "Find voltage",
    prompt: "A 2.5 A current passes through an 8 Ω resistor. Find the voltage in volts.",
    value: 20,
    steps: ["Given: I = 2.5 A and R = 8 Ω.", "Formula: V = IR.", "Substitute: V = (2.5 A)(8 Ω).", "Calculate: V = 20 V."],
    unit: "V",
  },
  {
    title: "Find resistance",
    prompt: "A 24 V source drives a 3 A current. Find the resistance in ohms.",
    value: 8,
    steps: ["Given: V = 24 V and I = 3 A.", "Formula: R = V/I.", "Substitute: R = 24 V / 3 A.", "Calculate: R = 8 Ω."],
    unit: "Ω",
  },
  {
    title: "Resistance increases",
    prompt: "A 12 V source is first connected to 5 Ω, then to 10 Ω. What is the new current in amperes?",
    value: 1.2,
    steps: ["Initial current: I₁ = 12 V / 5 Ω = 2.4 A.", "The resistance doubles while voltage is fixed, so current halves.", "New current: I₂ = 12 V / 10 Ω = 1.2 A."],
    unit: "A",
  },
  {
    title: "Compare two circuits",
    prompt: "At 12 V, circuit A has 4 Ω and circuit B has 8 Ω. Find the current in circuit A in amperes.",
    value: 3,
    steps: ["Circuit A: Iₐ = V/Rₐ = 12 V / 4 Ω = 3 A.", "Circuit B: Iᵦ = 12 V / 8 Ω = 1.5 A.", "The lower-resistance circuit carries more current at the same voltage."],
    unit: "A",
  },
] as const;

function CircuitPractice() {
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const challenge = circuitChallenges[challengeIndex];
  const parsedAnswer = parseInput(answer);
  const correct =
    Number.isFinite(parsedAnswer) &&
    Math.abs(parsedAnswer - challenge.value) <= Math.max(Math.abs(challenge.value) * 0.01, 0.01);

  function chooseChallenge(value: string) {
    setChallengeIndex(Number(value));
    setAnswer("");
    setChecked(false);
  }

  return (
    <section id="circuit-practice" className={`${card} mt-8 scroll-mt-28`}>
      <p className="text-sm font-semibold text-emerald-300">OHM&apos;S LAW CHALLENGES</p>
      <h2 className="mt-2 text-2xl font-bold">Practice simple circuits</h2>
      <label htmlFor="circuit-challenge" className="mt-4 block text-sm text-slate-300">
        Choose a challenge
        <select id="circuit-challenge" value={challengeIndex} onChange={(event) => chooseChallenge(event.target.value)} className={`${inputClass} mt-2`}>
          {circuitChallenges.map((item, index) => <option key={item.title} value={index}>{item.title}</option>)}
        </select>
      </label>
      <p className="mt-4 font-semibold leading-7 text-slate-100">{challenge.prompt}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <label htmlFor="circuit-challenge-answer" className="text-sm text-slate-300">
          Answer ({challenge.unit})
          <input id="circuit-challenge-answer" type="number" step="any" value={answer} onChange={(event) => { setAnswer(event.target.value); setChecked(false); }} className={`${inputClass} mt-2`} />
        </label>
        <button type="button" onClick={() => setChecked(true)} disabled={!Number.isFinite(parsedAnswer)} className="self-end rounded-xl bg-emerald-400 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-40">
          Check answer
        </button>
      </div>
      {checked && (
        <div role="status" aria-live="polite" className={`mt-4 rounded-xl p-4 text-sm leading-6 ${correct ? "bg-emerald-400/10 text-emerald-200" : "bg-rose-400/10 text-rose-200"}`}>
          <p className="font-bold">{correct ? "Correct!" : `Not quite. The answer is ${challenge.value} ${challenge.unit}.`}</p>
          <ol className="mt-2 list-inside list-decimal space-y-1">
            {challenge.steps.map((step) => <li key={step}>{step}</li>)}
          </ol>
        </div>
      )}
    </section>
  );
}

function SeriesParallelComparison() {
  const [voltageInput, setVoltageInput] = useState("12");
  const [firstResistanceInput, setFirstResistanceInput] = useState("6");
  const [secondResistanceInput, setSecondResistanceInput] = useState("12");
  const voltage = parseInput(voltageInput);
  const firstResistance = parseInput(firstResistanceInput);
  const secondResistance = parseInput(secondResistanceInput);
  const valid =
    Number.isFinite(voltage) &&
    voltage >= 0 &&
    Number.isFinite(firstResistance) &&
    firstResistance > 0 &&
    Number.isFinite(secondResistance) &&
    secondResistance > 0;
  const seriesResistance = firstResistance + secondResistance;
  const parallelResistance =
    (firstResistance * secondResistance) /
    (firstResistance + secondResistance);

  return (
    <section id="series-parallel" className={`${card} mt-8 scroll-mt-28`}>
      <h2 className="mb-3 text-xl font-semibold text-emerald-300">Series vs. parallel circuits</h2>
      <p className="mb-5 text-sm leading-6 text-slate-400">
        In series there is one path, so the same current passes through every
        resistor and resistances add. In parallel there are multiple paths:
        each branch has the same voltage, branch currents add, and the total
        equivalent resistance is lower than either individual resistance.
        Adding another resistor in series raises Rₑq; adding a new parallel
        branch lowers Rₑq and increases the total current drawn from a fixed
        voltage source.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        <NumberField label="Source voltage V (V)" value={voltageInput} onChange={setVoltageInput} />
        <NumberField label="Resistor R₁ (Ω)" value={firstResistanceInput} onChange={setFirstResistanceInput} />
        <NumberField label="Resistor R₂ (Ω)" value={secondResistanceInput} onChange={setSecondResistanceInput} />
      </div>
      {!valid ? (
        <p role="alert" className="mt-4 text-sm text-rose-200">Enter a non-negative voltage and positive resistor values.</p>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2" aria-live="polite">
          <div className="rounded-xl bg-slate-900 p-4">
            <h3 className="font-semibold text-sky-200">Series</h3>
            <p className="mt-2 text-sm text-slate-300">Rₑq = R₁ + R₂ = {formatValue(firstResistance)} + {formatValue(secondResistance)} = {formatValue(seriesResistance)} Ω</p>
            <p className="mt-1 text-sm text-slate-300">Total I = V/Rₑq = {formatValue(voltage)}/{formatValue(seriesResistance)} = {formatValue(voltage / seriesResistance)} A</p>
            <p className="mt-2 text-xs leading-5 text-slate-400">Adding a series resistor increases total resistance and reduces total current at fixed voltage.</p>
          </div>
          <div className="rounded-xl bg-slate-900 p-4">
            <h3 className="font-semibold text-violet-200">Parallel</h3>
            <p className="mt-2 text-sm text-slate-300">1/Rₑq = 1/R₁ + 1/R₂, so Rₑq = {formatValue(parallelResistance)} Ω</p>
            <p className="mt-1 text-sm text-slate-300">Total I = V/Rₑq = {formatValue(voltage / parallelResistance)} A</p>
            <p className="mt-2 text-xs leading-5 text-slate-400">Branch currents are V/R₁ = {formatValue(voltage / firstResistance)} A and V/R₂ = {formatValue(voltage / secondResistance)} A; they add to the total.</p>
          </div>
        </div>
      )}
    </section>
  );
}

type Question = { q: string; options: string[]; answer: number; why: string };

const questions: Question[] = [
  {
    q: "Which set gives the approximate masses of a proton, neutron, and electron in the correct order?",
    options: [
      "9.11 × 10⁻³¹ kg, 1.675 × 10⁻²⁷ kg, 1.673 × 10⁻²⁷ kg",
      "1.673 × 10⁻²⁷ kg, 1.675 × 10⁻²⁷ kg, 9.11 × 10⁻³¹ kg",
      "1.675 × 10⁻²⁷ kg, 9.11 × 10⁻³¹ kg, 1.673 × 10⁻²⁷ kg",
      "1.602 × 10⁻¹⁹ kg, 1.602 × 10⁻¹⁹ kg, 1.602 × 10⁻¹⁹ kg",
    ],
    answer: 1,
    why: "A proton has mass 1.673 × 10⁻²⁷ kg, a neutron 1.675 × 10⁻²⁷ kg, and an electron 9.11 × 10⁻³¹ kg.",
  },
  {
    q: "Which choice correctly gives the charge of each particle?",
    options: [
      "Proton: negative; electron: positive; neutron: no net charge",
      "Proton: positive; electron: neutral; neutron: negative",
      "Proton: positive; electron: negative; neutron: no net charge",
      "Proton: neutral; electron: negative; neutron: positive",
    ],
    answer: 2,
    why: "A proton is positive, an electron is negative, and a neutron has no net electric charge.",
  },
  {
    q: "What is the SI unit of electric charge?",
    options: ["Coulomb (C)", "Newton (N)", "Joule (J)", "Volt (V)"],
    answer: 0,
    why: "Electric charge is measured in coulombs (C).",
  },
  {
    q: "What is the magnitude of the charge of one proton or one electron?",
    options: ["9.11 × 10⁻³¹ C", "1.602 × 10⁻¹⁹ C", "1.602 × 10¹⁹ C", "1.602 × 10⁻²⁷ C"],
    answer: 1,
    why: "The elementary charge is about 1.602 × 10⁻¹⁹ C (9.11 × 10⁻³¹ is the electron's mass in kg).",
  },
  {
    q: "About how many elementary charges (electrons) make up one coulomb?",
    options: ["8.99 × 10⁹", "1.602 × 10⁻¹⁹", "6.24 × 10¹⁸", "9.11 × 10⁻³¹"],
    answer: 2,
    why: "1 C = 1 / (1.602 × 10⁻¹⁹) ≈ 6.24 × 10¹⁸ elementary charges.",
  },
  {
    q: "Which statement describes conservation of charge?",
    options: [
      "Charge can be transferred, but the total charge of an isolated system stays constant.",
      "Charge is destroyed whenever two objects touch.",
      "Charge can be created freely inside an isolated system.",
      "The total charge doubles whenever charge is transferred.",
    ],
    answer: 0,
    why: "Charge can neither be created nor destroyed, only transferred, so the total charge does not change.",
  },
  {
    q: "What does quantization of charge mean?",
    options: [
      "Charge can have any decimal value.",
      "Any charge found in nature is a whole-number multiple of the elementary charge.",
      "Every charge is exactly one coulomb.",
      "Every charge is always positive.",
    ],
    answer: 1,
    why: "The only charges that occur in nature are integral multiples of the electronic charge e.",
  },
  {
    q: "Which pair of particles attracts each other?",
    options: ["A proton and an electron", "Two protons", "Two electrons", "A proton and a neutron"],
    answer: 0,
    why: "Unlike charges attract. Two protons or two electrons are like charges, so they repel.",
  },
  {
    q: "Which statement about conductors and insulators is correct?",
    options: [
      "Insulators let charge move more easily than conductors.",
      "Conductors let charge move readily; insulators conduct it poorly.",
      "Both conductors and insulators block all charge movement.",
      "Conductors block charge while insulators let it flow freely.",
    ],
    answer: 1,
    why: "Conductors readily conduct electric charge, while insulators conduct it poorly.",
  },
  {
    q: "Two resistors of 6 Ω and 3 Ω are connected in series. What is their equivalent resistance?",
    options: [
      "2 Ω",
      "3 Ω",
      "9 Ω",
      "18 Ω",
    ],
    answer: 2,
    why: "Series resistances add: Rₑq = R₁ + R₂ = 6 Ω + 3 Ω = 9 Ω.",
  },
  {
    q: "A current of 2.5 A passes through an 8 Ω resistor. What is the voltage across it?",
    options: [
      "0.31 V",
      "3.2 V",
      "20 V",
      "80 V",
    ],
    answer: 2,
    why: "Using V = IR, V = (2.5 A)(8 Ω) = 20 V.",
  },
  {
    q: "A 12 V source is connected across a 4 Ω resistor. What current flows?",
    options: ["0.33 A", "2 A", "3 A", "48 A"],
    answer: 2,
    why: "Ohm's law gives I = V/R = 12 V / 4 Ω = 3 A.",
  },
  {
    q: "In F = k|q₁q₂|/r², what does r represent?",
    options: [
      "The radius of the nucleus",
      "The resistance of the wire",
      "The distance between the two charges",
      "The number of electrons in either charge",
    ],
    answer: 2,
    why: "r is the distance between the two point charges, in meters.",
  },
  {
    q: "If the distance between two charges is doubled, what happens to the force between them?",
    options: ["It becomes one-fourth as large", "It is cut in half", "It doubles", "It becomes four times as large"],
    answer: 0,
    why: "The force is inversely proportional to r². Doubling r makes r² four times larger, so F becomes 1/4.",
  },
  {
    q: "Two charges of +1.0 C and −1.0 C are 1.0 km apart. What is the magnitude of the force between them?",
    options: ["8.99 × 10⁹ N", "8.99 × 10³ N", "8.99 × 10⁶ N", "8.99 × 10⁻³ N"],
    answer: 1,
    why: "r = 1.0 km = 1000 m, so F = (8.99 × 10⁹)(1.0)(1.0) / (1000)² = 8.99 × 10³ N (attractive).",
  },
  {
    q: "The electric field at a point is the force on a small test charge divided by what?",
    options: ["The mass of the test charge", "The distance squared", "The magnitude of the test charge", "The electric potential energy"],
    answer: 2,
    why: "E = F / |q₀|: force divided by the magnitude of the test charge.",
  },
  {
    q: "If resistance doubles while voltage stays constant, what happens to current in an ohmic circuit?",
    options: [
      "It becomes half as large",
      "It doubles",
      "It stays the same",
      "It becomes four times as large",
    ],
    answer: 0,
    why: "From I = V/R, with V fixed current is inversely proportional to resistance. Doubling R halves the current.",
  },
  {
    q: "What is the SI unit of electric field intensity?",
    options: ["Newton·meter squared per coulomb squared (N·m²/C²)", "Newton per coulomb (N/C)", "Coulomb per newton (C/N)", "Newton times coulomb (N·C)"],
    answer: 1,
    why: "Force (N) divided by charge (C) gives newtons per coulomb (N/C).",
  },
  {
    q: "A negative test charge is placed in an electric field. The force on it points…",
    options: [
      "in the same direction as the field",
      "perpendicular to the field",
      "opposite to the field direction",
      "the force is always zero",
    ],
    answer: 2,
    why: "The field direction is the direction of force on a positive test charge, so a negative charge feels a force the opposite way.",
  },
  {
    q: "A force of 0.60 N acts on a +3.0 μC test charge. What is the electric-field magnitude?",
    options: ["2.0 × 10⁵ N/C", "2.0 × 10⁻⁶ N/C", "5.0 × 10⁻⁶ N/C", "1.8 × 10⁻⁶ N/C"],
    answer: 0,
    why: "E = F/|q₀| = 0.60 N/(3.0 × 10⁻⁶ C) = 2.0 × 10⁵ N/C.",
  },
];
const quizOptionCounts = questions.map((question) => question.options.length);

export default function ElectrostaticsLesson() {
  const { eligibility, error: eligibilityError, refresh: refreshEligibility } =
    useLessonQuizEligibility("electricity");
  /* Coulomb calculator (inputs kept as text so empty/invalid input can be detected) */
  const [q1, setQ1] = useState("2");
  const [q2, setQ2] = useState("-3");
  const [distance, setDistance] = useState("0.5");

  /* Electric field calculator */
  const [electricField, setElectricField] = useState("2");
  const [testCharge, setTestCharge] = useState("2");
  const [voltageInput, setVoltageInput] = useState("12");
  const [resistanceInput, setResistanceInput] = useState("6");
  const [batteryVoltageInput, setBatteryVoltageInput] = useState("9");
  const [resistorResistanceInput, setResistorResistanceInput] = useState("100");
  const [bulbResistanceInput, setBulbResistanceInput] = useState("20");
  const [circuitComponents, setCircuitComponents] = useState<CircuitComponent[]>([]);
  const [nextCircuitId, setNextCircuitId] = useState(0);
  const [showCoulombSolution, setShowCoulombSolution] = useState(false);
  const [showFieldSolution, setShowFieldSolution] = useState(false);

  /* Quiz: answers maps question index -> chosen option index */
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

  /* ----- Coulomb's law calculation ----- */
  const q1Num = parseInput(q1);
  const q2Num = parseInput(q2);
  const rNum = parseInput(distance);

  const coulombErrors: string[] = [];
  if (!Number.isFinite(q1Num)) coulombErrors.push("Enter a valid number for q₁ (μC).");
  if (!Number.isFinite(q2Num)) coulombErrors.push("Enter a valid number for q₂ (μC).");
  if (!Number.isFinite(rNum)) coulombErrors.push("Enter a valid number for the distance r (m).");
  else if (rNum <= 0) coulombErrors.push("Distance r must be greater than zero (it cannot be zero or negative).");

  const coulombValid = coulombErrors.length === 0;
  const force = coulombValid ? (K * Math.abs(q1Num * MICRO * (q2Num * MICRO))) / (rNum * rNum) : NaN;

  let interaction = "—";
  if (coulombValid) {
    if (q1Num === 0 || q2Num === 0) interaction = "No electrostatic force (a charge is zero)";
    else if (q1Num * q2Num > 0) interaction = "Repulsive (like charges)";
    else interaction = "Attractive (unlike charges)";
  }

  /* ----- Electric field calculation ----- */
  const eNum = parseInput(electricField);
  const q0Num = parseInput(testCharge);

  const fieldErrors: string[] = [];
  if (!Number.isFinite(eNum)) fieldErrors.push("Enter a valid number for E (N/C).");
  else if (eNum < 0) fieldErrors.push("Enter E as a magnitude (zero or positive). The test charge sign sets the force direction.");
  if (!Number.isFinite(q0Num)) fieldErrors.push("Enter a valid number for q₀ (μC).");

  const fieldValid = fieldErrors.length === 0;
  const fieldForce = fieldValid ? eNum * Math.abs(q0Num * MICRO) : NaN;

  let fieldDirection = "—";
  if (fieldValid) {
    if (fieldForce === 0) fieldDirection = "No force (E or q₀ is zero), so there is no direction.";
    else if (q0Num > 0) fieldDirection = "Positive test charge: the force is in the same direction as the electric field.";
    else fieldDirection = "Negative test charge: the force is opposite to the electric field direction.";
  }

  /* ----- Quiz scoring (only meaningful after submission) ----- */
  const score = quizAttempt.filter((item, i) => answers[i] === item.answer).length;
  const answeredCount = Object.keys(answers).length;
  const missed = quizAttempt
    .map((_, index) => index)
    .filter((index) => answers[index] !== quizAttempt[index].answer);

  function chooseAnswer(questionIndex: number, optionIndex: number) {
    if (submitted) return; // answers are locked after submission
    setAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
  }

  function resetQuiz() {
    setAnswers({});
    setSubmitted(false);
    resetResult();
    reshuffleQuiz();
    document.getElementById("quiz")?.scrollIntoView({ behavior: "smooth" });
  }

  async function submitQuiz() {
    if (!eligibility?.eligible) return;
    const saved = await saveResult(
      "electricity",
      quizAttempt.map((_, index) => answers[index] ?? -1),
      quizAttempt.map((question) => ({
        question: question.q,
        choices: question.originalOptions,
        explanation: question.why,
        questionIndex: question.questionIndex,
        optionOrder: question.optionOrder,
      }))
    );
    if (saved) setSubmitted(true);
  }

  function renderOhmsLawCalculator() {
    const voltage = parseInput(voltageInput);
    const resistance = parseInput(resistanceInput);
    const valid =
      Number.isFinite(voltage) &&
      voltage >= 0 &&
      Number.isFinite(resistance) &&
      resistance > 0;
    const current = valid ? voltage / resistance : NaN;
    const power = valid ? voltage * current : NaN;

    return (
      <div>
        <div className="grid gap-4 md:grid-cols-2">
          <NumberField
            label="Voltage V (volts)"
            value={voltageInput}
            onChange={setVoltageInput}
            hint="Use zero or a positive voltage."
          />
          <NumberField
            label="Resistance R (ohms)"
            value={resistanceInput}
            onChange={setResistanceInput}
            hint="Resistance must be greater than zero."
          />
        </div>
        <button type="button" onClick={() => { setVoltageInput("12"); setResistanceInput("6"); }} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300">
          <RotateCcw size={15} /> Reset defaults
        </button>
        {!valid ? (
          <p role="alert" className="mt-4 rounded-xl border border-rose-400/30 bg-rose-400/5 p-3 text-sm text-rose-200">
            Enter a non-negative voltage and a positive resistance.
          </p>
        ) : (
          <div aria-live="polite" className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-900 p-4">
              <p className="text-xs text-slate-400">Current I = V/R</p>
              <p className="mt-1 text-xl font-bold text-sky-200">{formatValue(current)} A</p>
              <p className="mt-1 text-xs text-slate-500">{formatValue(voltage)} V ÷ {formatValue(resistance)} Ω</p>
            </div>
            <div className="rounded-xl bg-slate-900 p-4">
              <p className="text-xs text-slate-400">Power P = VI</p>
              <p className="mt-1 text-xl font-bold text-emerald-200">{formatValue(power)} W</p>
            </div>
            <div className="rounded-xl bg-slate-900 p-4">
              <p className="text-xs text-slate-400">Relationship</p>
              <p className="mt-1 text-sm leading-6 text-slate-200">At fixed V, increasing R decreases I.</p>
            </div>
          </div>
        )}
        <p className="mt-4 text-xs leading-5 text-slate-500">
          This ideal calculation assumes a constant resistance and does not model
          temperature-dependent changes or a component&apos;s nonlinear behavior.
        </p>
      </div>
    );
  }

  type CircuitComponentKind = "battery" | "resistor" | "bulb";
  type CircuitComponent = { id: number; kind: CircuitComponentKind };

  const circuitPalette: {
    kind: CircuitComponentKind;
    title: string;
    detail: string;
  }[] = [
    { kind: "battery", title: "Battery", detail: "Series-aiding source" },
    { kind: "resistor", title: "Resistor", detail: "Editable resistance" },
    { kind: "bulb", title: "Light bulb", detail: "Editable resistance" },
  ];

  function renderCircuitBuilder() {
    const batteryVoltage = parseInput(batteryVoltageInput);
    const resistorResistance = parseInput(resistorResistanceInput);
    const bulbResistance = parseInput(bulbResistanceInput);
    const circuitErrors: string[] = [];
    if (!Number.isFinite(batteryVoltage) || batteryVoltage < 0) {
      circuitErrors.push("Battery voltage must be a valid value of zero or greater.");
    }
    if (!Number.isFinite(resistorResistance) || resistorResistance <= 0) {
      circuitErrors.push("Resistor resistance must be greater than zero.");
    }
    if (!Number.isFinite(bulbResistance) || bulbResistance <= 0) {
      circuitErrors.push("Bulb resistance must be greater than zero.");
    }
    const circuitValid = circuitErrors.length === 0;

    function addComponent(kind: CircuitComponentKind) {
      setCircuitComponents((current) => [
        ...current,
        { id: nextCircuitId, kind },
      ]);
      setNextCircuitId((current) => current + 1);
    }

    function beginDrag(
      event: ReactDragEvent<HTMLButtonElement>,
      kind: CircuitComponentKind
    ) {
      event.dataTransfer.setData("text/plain", kind);
      event.dataTransfer.effectAllowed = "copy";
    }

    function dropComponent(event: ReactDragEvent<HTMLDivElement>) {
      event.preventDefault();
      const kind = event.dataTransfer.getData("text/plain");
      if (
        kind === "battery" ||
        kind === "resistor" ||
        kind === "bulb"
      ) {
        addComponent(kind);
      }
    }

    const batteryCount = circuitComponents.filter((item) => item.kind === "battery").length;
    const resistorCount = circuitComponents.filter((item) => item.kind === "resistor").length;
    const bulbCount = circuitComponents.filter((item) => item.kind === "bulb").length;
    const sourceVoltage = circuitValid ? batteryCount * batteryVoltage : NaN;
    const equivalentResistance = circuitValid
      ? resistorCount * resistorResistance + bulbCount * bulbResistance
      : NaN;
    const current =
      circuitValid && batteryCount > 0 && equivalentResistance > 0
        ? sourceVoltage / equivalentResistance
        : 0;
    const bulbPower = circuitValid ? current * current * bulbResistance : 0;
    const referenceBulbPower = (9 * 9) / 20;
    const bulbBrightness = Math.min(1, bulbPower / referenceBulbPower);

    return (
      <section id="circuit-builder" className={`${card} mt-8 scroll-mt-28`}>
        <h2 className="mb-3 text-xl font-semibold text-emerald-300">
          Drag-and-drop circuit builder
        </h2>
        <p className="mb-5 text-sm leading-6 text-slate-400">
          Drag a component into the series-loop workbench, or select its button
          for keyboard and touch access. Batteries are modeled as ideal
          series-aiding sources; resistors and bulbs use the editable model
          values below. The simulator is an introductory DC model, not a
          detailed filament or transient simulation.
        </p>
        <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Battery", "Provides potential difference (voltage) that drives charge around a closed path."],
            ["Resistor", "Limits current and converts electrical energy to other forms, such as heat."],
            ["Bulb", "Uses electrical power to produce light; more current at fixed resistance means greater power and brightness."],
            ["Connecting wires", "Provide a conducting path that completes the circuit; ideal wires have negligible resistance."],
          ].map(([name, description]) => (
            <div key={name} className="rounded-xl bg-slate-900 p-3">
              <p className="font-semibold text-emerald-200">{name}</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">{description}</p>
            </div>
          ))}
        </div>
        <div className="mb-5 grid gap-4 md:grid-cols-3">
          <NumberField label="Battery voltage (V)" value={batteryVoltageInput} onChange={setBatteryVoltageInput} hint="Use zero or a positive voltage." />
          <NumberField label="Resistor resistance (Ω)" value={resistorResistanceInput} onChange={setResistorResistanceInput} hint="Must be greater than zero." />
          <NumberField label="Bulb resistance (Ω)" value={bulbResistanceInput} onChange={setBulbResistanceInput} hint="Must be greater than zero." />
        </div>
        <button type="button" onClick={() => { setBatteryVoltageInput("9"); setResistorResistanceInput("100"); setBulbResistanceInput("20"); setCircuitComponents([]); }} className="mb-5 inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300">
          <RotateCcw size={15} /> Reset simulator defaults
        </button>
        {circuitErrors.length > 0 && <div role="alert" className="mb-5 rounded-xl border border-rose-400/30 bg-rose-400/5 p-3 text-sm text-rose-200">{circuitErrors.map((message) => <p key={message}>{message}</p>)}</div>}
        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div>
            <h3 className="mb-3 font-semibold text-slate-200">Components</h3>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {circuitPalette.map((item) => (
                <button
                  key={item.kind}
                  type="button"
                  draggable
                  onDragStart={(event) => beginDrag(event, item.kind)}
                  onClick={() => addComponent(item.kind)}
                  className="rounded-xl border border-white/10 bg-[#080D1B] p-4 text-left transition hover:border-emerald-300/30 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
                  aria-label={`Add ${item.title} to the circuit`}
                >
                  <span className="block font-semibold text-emerald-200">{item.title}</span>
                  <span className="mt-1 block text-xs text-slate-400">{item.kind === "battery" ? `${circuitValid ? formatValue(batteryVoltage) : "—"} V · ` : item.kind === "resistor" ? `${circuitValid ? formatValue(resistorResistance) : "—"} Ω · ` : `${circuitValid ? formatValue(bulbResistance) : "—"} Ω · `}{item.detail} · drag or select</span>
                </button>
              ))}
            </div>
          </div>
          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={dropComponent}
            className="min-h-56 rounded-2xl border-2 border-dashed border-slate-600 bg-slate-950/70 p-4"
            role="group"
            aria-label="Series circuit workbench. Drop components here."
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold text-slate-200">Series-loop workbench</h3>
              <button
                type="button"
                onClick={() => setCircuitComponents([])}
                disabled={circuitComponents.length === 0}
                className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Clear circuit
              </button>
            </div>
            {circuitComponents.length === 0 ? (
              <p className="mt-8 rounded-xl bg-white/5 p-4 text-center text-sm text-slate-400">
                Add at least one battery and one resistor or bulb to complete a loop.
              </p>
            ) : (
              <>
                <div className="mt-5 flex min-h-24 flex-wrap items-center justify-center gap-2 rounded-xl border-4 border-slate-600 p-3">
                  {circuitComponents.map((item, index) => {
                    const paletteItem = circuitPalette.find((entry) => entry.kind === item.kind);
                    return (
                      <div key={item.id} className="flex items-center gap-2">
                        {index > 0 && <span aria-hidden="true" className="text-emerald-300">→</span>}
                        <div
                          className={`rounded-lg border px-3 py-2 text-center ${item.kind === "bulb" && bulbBrightness > 0 ? "border-amber-300/60" : "border-white/10 bg-[#111A2E]"}`}
                          style={item.kind === "bulb" && bulbBrightness > 0 ? {
                            backgroundColor: `rgba(252, 211, 77, ${bulbBrightness * 0.3})`,
                            boxShadow: `0 0 ${bulbBrightness * 24}px rgba(252, 211, 77, ${bulbBrightness * 0.65})`,
                          } : undefined}
                        >
                          <p className="text-xs font-bold text-slate-200">{paletteItem?.title}</p>
                          <p className="text-[11px] text-slate-400">{item.kind === "battery" ? `${circuitValid ? formatValue(batteryVoltage) : "—"} V` : item.kind === "resistor" ? `${circuitValid ? formatValue(resistorResistance) : "—"} Ω` : `${circuitValid ? formatValue(bulbResistance) : "—"} Ω`}</p>
                        </div>
                        <button
                          type="button"
                          aria-label={`Remove ${paletteItem?.title}`}
                          onClick={() => setCircuitComponents((current) => current.filter((part) => part.id !== item.id))}
                          className="rounded p-1 text-slate-500 hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-300"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-2 text-center text-xs text-slate-500">
                  Components are connected in series; the outer border represents the return wire.
                </p>
              </>
            )}
            <div aria-live="polite" className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-xs text-slate-400">Source voltage</p>
                <p className="mt-1 font-bold text-sky-200">{circuitValid ? `${formatValue(sourceVoltage)} V` : "—"}</p>
              </div>
              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-xs text-slate-400">Series resistance</p>
                <p className="mt-1 font-bold text-violet-200">{circuitValid ? `${formatValue(equivalentResistance)} Ω` : "—"}</p>
              </div>
              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-xs text-slate-400">Circuit current</p>
                <p className="mt-1 font-bold text-emerald-200">{circuitValid ? `${formatValue(current)} A` : "—"}</p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              {circuitValid && bulbCount > 0 && batteryCount > 0 && equivalentResistance > 0
                ? `Rₑq = ${resistorCount}(${formatValue(resistorResistance)} Ω) + ${bulbCount}(${formatValue(bulbResistance)} Ω) = ${formatValue(equivalentResistance)} Ω; I = V/Rₑq = ${formatValue(sourceVoltage)} V / ${formatValue(equivalentResistance)} Ω = ${formatValue(current)} A. Bulb power is approximately ${formatValue(bulbPower)} W each.`
                : circuitValid
                  ? "A closed path with a source and resistance is required for nonzero current."
                  : "Correct the component values above to calculate current and bulb power."}
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              At fixed bulb resistance, brightness follows the bulb&apos;s power P = I²R (also P = VI): changing voltage or resistance changes current, and therefore the bulb&apos;s modeled brightness. A real filament&apos;s resistance changes as it heats.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <main className="flex h-full min-h-0 flex-col overflow-hidden bg-[#080D1B] text-slate-100">

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div id="lesson-main-scroll" className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto w-full max-w-[1600px]">
        <LessonProgressTracker lessonSlug="electricity" />
        <LessonHeader
          module="Lesson 06 · Physics 2"
          icon={<Zap size={18} />}
          accentClass="text-emerald-300"
          title="Electric Forces & Electric Field"
          description={
            <>
            Learn electric charge, how charges interact, Coulomb’s law, and electric field
            intensity, following the Electrostatics lecture reference.
            </>
          }
        />

        {/* ---------- 1. Electric charge ---------- */}
        <section id="electric-charge" className={`${card} scroll-mt-28`}>
          <h2 className="mb-3 text-xl font-semibold text-sky-300">1. Electric charge</h2>
          <p className="leading-7 text-slate-300">
            Electric charge is a property of matter that tells us whether something has more or
            fewer electrons than protons. It is the most basic quantity in an electric circuit.
            The SI unit of charge is the <b className="text-white">coulomb (C)</b>.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl bg-slate-900 p-4">
              <p className="font-semibold text-emerald-300">Proton</p>
              <p className="mt-1 text-sm text-slate-300">Positive charge: +1.602 × 10⁻¹⁹ C</p>
            </div>
            <div className="rounded-xl bg-slate-900 p-4">
              <p className="font-semibold text-violet-300">Electron</p>
              <p className="mt-1 text-sm text-slate-300">Negative charge: −1.602 × 10⁻¹⁹ C</p>
            </div>
            <div className="rounded-xl bg-slate-900 p-4">
              <p className="font-semibold text-sky-300">Neutron</p>
              <p className="mt-1 text-sm text-slate-300">No net electric charge</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-400">
            <b className="text-slate-200">Elementary charge:</b> the proton and the electron have
            equal charge magnitudes, e = 1.602 × 10⁻¹⁹ C, but opposite signs. Their charges cancel
            in a neutral atom; a proton is positive and an electron negative. The coulomb is a large unit:
            1 C ≈ 1 / (1.602 × 10⁻¹⁹) ≈ 6.24 × 10¹⁸ elementary charges, so lab values are usually
            in picocoulombs (pC = 10⁻¹² C), nanocoulombs (nC = 10⁻⁹ C), or microcoulombs (μC = 10⁻⁶ C).
          </p>
          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <div className="rounded-2xl bg-slate-900 p-5">
              <h3 className="font-semibold text-sky-200">Atomic structure</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                The nucleus contains positive protons and neutral neutrons. Negative electrons
                surround the nucleus. Protons and electrons have the same charge magnitude e
                because charge is quantized in elementary units, but their signs are opposite.
                A neutral atom has equal numbers of protons and electrons.
              </p>
              <ul className="mt-3 space-y-2 text-sm text-slate-400">
                <li>Proton mass: <strong className="text-slate-200">1.673 × 10⁻²⁷ kg</strong></li>
                <li>Neutron mass: <strong className="text-slate-200">1.675 × 10⁻²⁷ kg</strong></li>
                <li>Electron mass: <strong className="text-slate-200">9.11 × 10⁻³¹ kg</strong></li>
              </ul>
            </div>
            <div className="rounded-2xl bg-slate-900 p-5">
              <svg viewBox="0 0 320 180" role="img" aria-label="Atom diagram showing protons and neutrons in a nucleus with electrons around it" className="mx-auto h-40 w-full max-w-sm">
                <ellipse cx="160" cy="90" rx="125" ry="48" fill="none" stroke="#38BDF8" strokeOpacity=".6" strokeWidth="2" transform="rotate(-28 160 90)" />
                <ellipse cx="160" cy="90" rx="125" ry="48" fill="none" stroke="#A78BFA" strokeOpacity=".6" strokeWidth="2" transform="rotate(28 160 90)" />
                <circle cx="160" cy="90" r="13" fill="#34D399" />
                <circle cx="146" cy="83" r="11" fill="#F472B6" />
                <circle cx="174" cy="81" r="11" fill="#34D399" />
                <circle cx="160" cy="103" r="11" fill="#F472B6" />
                <circle cx="40" cy="52" r="7" fill="#60A5FA" />
                <circle cx="278" cy="126" r="7" fill="#60A5FA" />
                <text x="144" y="87" fill="#0F172A" fontSize="10" fontWeight="bold">p⁺</text>
                <text x="168" y="85" fill="#0F172A" fontSize="10" fontWeight="bold">n⁰</text>
                <text x="155" y="107" fill="#0F172A" fontSize="10" fontWeight="bold">p⁺</text>
                <text x="22" y="38" fill="#BFDBFE" fontSize="12">e⁻</text>
                <text x="280" y="116" fill="#BFDBFE" fontSize="12">e⁻</text>
                <text x="116" y="166" fill="#CBD5E1" fontSize="12">Nucleus: protons + neutrons</text>
              </svg>
              <p className="text-center text-xs text-slate-500">Schematic — not to scale.</p>
            </div>
          </div>
        </section>

        {/* ---------- 2. Properties of charge ---------- */}
        <section id="charge-properties" className="mt-8 scroll-mt-28">
          <h2 className="mb-3 text-xl font-semibold text-violet-300">2. Properties of electric charge</h2>
          <div className="grid gap-5 md:grid-cols-3">
            <div className={card}>
              <h3 className="mb-2 font-semibold text-white">Conservation of charge</h3>
              <p className="text-sm leading-6 text-slate-300">
                Charge can neither be created nor destroyed, only transferred. The total charge
                of an isolated system stays constant.
              </p>
            </div>
            <div className={card}>
              <h3 className="mb-2 font-semibold text-white">Quantization of charge</h3>
              <p className="text-sm leading-6 text-slate-300">
                Charges in nature come only in whole-number multiples of the elementary charge,
                e = 1.602 × 10⁻¹⁹ C.
              </p>
            </div>
            <div className={card}>
              <h3 className="mb-2 font-semibold text-white">Interaction of charges</h3>
              <p className="text-sm leading-6 text-slate-300">
                <b className="text-white">Like charges repel</b> (+ and +, or − and −).{" "}
                <b className="text-white">Unlike charges attract</b> (+ and −).
              </p>
            </div>
          </div>
          <ChargeTransferActivity />
        </section>

        {/* ---------- Conductors and insulators ---------- */}
        <section id="conductors-insulators" className={`${card} mt-8 scroll-mt-28`}>
          <h2 className="mb-3 text-xl font-semibold text-sky-300">Conductors and insulators</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-slate-900 p-4">
              <h3 className="font-semibold text-white">Conductors</h3>
              <p className="mt-1 text-sm leading-6 text-slate-300">
                Charge moves through them readily. Examples: copper, aluminum, silver, and gold.
                That is why they are used in electrical wiring.
              </p>
            </div>
            <div className="rounded-xl bg-slate-900 p-4">
              <h3 className="font-semibold text-white">Insulators</h3>
              <p className="mt-1 text-sm leading-6 text-slate-300">
                Charge moves through them poorly. Examples: rubber, many plastics, and wood. They
                coat wires to keep charge from going where it is not wanted.
              </p>
            </div>
          </div>
          <MaterialClassificationActivity />
        </section>

        {/* ---------- 3. Coulomb's law ---------- */}
        <section id="coulombs-law" className={`${card} mt-8 scroll-mt-28`}>
          <h2 className="mb-3 text-xl font-semibold text-sky-300">3. Coulomb’s law</h2>
          <p className="leading-7 text-slate-300">
            Coulomb’s law gives the electric force between two point charges. The force is
            directly proportional to the magnitudes of the charges and inversely proportional to
            the square of the distance between them.
          </p>
          <p className={`${formulaBox} text-sky-200`}>F = k |q₁q₂| / r²</p>
          <div className="grid gap-4 md:grid-cols-2">
            <ul className="space-y-1 text-sm text-slate-300">
              <li><b className="text-white">F</b> = magnitude of the electric force (N)</li>
              <li><b className="text-white">k</b> = Coulomb’s constant ≈ 8.99 × 10⁹ N·m²/C²</li>
              <li><b className="text-white">q₁</b> = first charge (C)</li>
              <li><b className="text-white">q₂</b> = second charge (C)</li>
              <li><b className="text-white">r</b> = distance between the charges (m)</li>
            </ul>
            <p className="rounded-xl bg-slate-900 p-4 text-sm leading-6 text-slate-300">
              The formula gives only the <b className="text-white">magnitude</b> of the force. The
              signs of the charges tell you the type: same signs → repulsive, opposite signs →
              attractive.
            </p>
          </div>

          <h3 className="mb-2 mt-5 font-semibold text-white">How to solve a Coulomb’s law problem</h3>
          <ol className="list-decimal space-y-1 pl-5 text-sm leading-6 text-slate-300">
            <li>Identify the given values (q₁, q₂, and r).</li>
            <li>Convert the charges to coulombs when necessary (1 μC = 10⁻⁶ C).</li>
            <li>Convert the distance to meters when necessary (1 km = 1000 m).</li>
            <li>Substitute the values into F = k|q₁q₂|/r².</li>
            <li>Calculate the force magnitude.</li>
            <li>Use the charge signs to decide if the force is attractive or repulsive.</li>
          </ol>

          <div className="mt-5 rounded-xl border border-slate-700 bg-slate-900/70 p-4 text-sm leading-7 text-slate-300">
            <p className="font-semibold text-sky-300">Worked example (from the lecture)</p>
            <p>Two objects with charges +1.0 C and −1.0 C are 1.0 km apart. Find the force magnitude.</p>
            <button type="button" aria-expanded={showCoulombSolution} onClick={() => setShowCoulombSolution((shown) => !shown)} className="mt-3 inline-flex min-h-10 items-center rounded-lg border border-sky-300/30 px-3 py-2 text-sm font-semibold text-sky-200 hover:bg-sky-300/10">
              {showCoulombSolution ? "Hide Solution" : "Show Solution"}
            </button>
            {showCoulombSolution && <ol className="mt-3 space-y-1">
              <li><b className="text-white">Given:</b> q₁ = +1.0 C, q₂ = −1.0 C, r = 1.0 km = 1000 m; k = 8.99 × 10⁹ N·m²/C².</li>
              <li><b className="text-white">Find:</b> Force magnitude F and whether the force is attractive or repulsive.</li>
              <li><b className="text-white">Formula:</b> F = k|q₁q₂|/r².</li>
              <li><b className="text-white">Substitution:</b> F = (8.99 × 10⁹ N·m²/C²)|(+1.0 C)(−1.0 C)|/(1000 m)².</li>
              <li><b className="text-white">Calculation:</b> F = (8.99 × 10⁹ N·m²)/(1.0 × 10⁶ m²) = 8.99 × 10³ N.</li>
              <li className="rounded-lg bg-emerald-400/5 p-2 font-semibold text-emerald-300"><b>Final Answer:</b> F = 8.99 × 10³ N, attractive because the charges have opposite signs.</li>
            </ol>}
          </div>
        </section>

        {/* ---------- Coulomb calculator ---------- */}
        <section id="coulomb-calculator" className={`${card} mt-8 scroll-mt-28`}>
          <h2 className="mb-2 text-2xl font-semibold">Interactive Coulomb’s law calculator</h2>
          <p className="mb-5 text-sm text-slate-400">
            Enter each charge in microcoulombs (μC), including its sign, and the separation in
            meters (m). The calculated force is a magnitude; the signs decide attraction or
            repulsion.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            <NumberField label="Charge q₁ (μC)" value={q1} onChange={setQ1} hint="Use a minus sign for negative charge" />
            <NumberField label="Charge q₂ (μC)" value={q2} onChange={setQ2} hint="Use a minus sign for negative charge" />
            <NumberField label="Distance r (m)" value={distance} onChange={setDistance} hint="Must be greater than 0" />
          </div>
          <button type="button" onClick={() => { setQ1("2"); setQ2("-3"); setDistance("0.5"); }} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300">
            <RotateCcw size={15} /> Reset defaults
          </button>

          {coulombErrors.length > 0 && (
            <div role="alert" className="mt-4 rounded-xl border border-amber-400/40 bg-amber-400/10 p-3 text-sm text-amber-200">
              {coulombErrors.map((msg) => (
                <p key={msg}>{msg}</p>
              ))}
            </div>
          )}

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl bg-slate-900 p-4">
              <p className="text-xs text-slate-400">Force magnitude</p>
              <p className="mt-1 wrap-break-word text-2xl font-bold text-sky-200">
                {coulombValid ? `${formatValue(force)} N` : "—"}
              </p>
            </div>
            <div className="rounded-xl bg-slate-900 p-4">
              <p className="text-xs text-slate-400">Interaction</p>
              <p className="mt-1 text-lg font-bold">{interaction}</p>
            </div>
            <div className="rounded-xl bg-slate-900 p-4">
              <p className="text-xs text-slate-400">Distance effect</p>
              <p className="mt-1 text-sm text-slate-200">Doubling r reduces the force to one-fourth.</p>
            </div>
          </div>
          {coulombValid && (
            <div className="mt-4 rounded-xl bg-slate-900 p-4 text-sm leading-6 text-slate-300" aria-live="polite">
              <p className="font-semibold text-sky-200">Live substitution</p>
              <p>q₁ = {formatValue(q1Num)} μC = {formatValue(q1Num * MICRO)} C; q₂ = {formatValue(q2Num)} μC = {formatValue(q2Num * MICRO)} C.</p>
              <p>F = k|q₁q₂|/r² = (8.99 × 10⁹)|({formatValue(q1Num * MICRO)})({formatValue(q2Num * MICRO)})|/({formatValue(rNum)} m)² = {formatValue(force)} N.</p>
              <p>Same-sign charges repel; opposite-sign charges attract. This interaction is {interaction.toLowerCase()}.</p>
            </div>
          )}
          <p className="mt-3 text-xs text-slate-500">
            This is an idealized point-charge calculation; real systems may include additional
            charges and forces.
          </p>
          <CoulombPractice />
        </section>

        {/* ---------- 4. Electric field intensity ---------- */}
        <section id="electric-field" className={`${card} mt-8 scroll-mt-28`}>
          <h2 className="mb-3 text-xl font-semibold text-violet-300">4. Electric field intensity</h2>
          <p className="leading-7 text-slate-300">
            The electric field at a point is the electrostatic force felt by a small test charge
            placed there, divided by the size of that charge. It tells us how strongly a charge
            would be pushed or pulled at that point.
          </p>
          <p className={`${formulaBox} text-violet-200`}>E = F / |q₀|</p>
          <ul className="space-y-1 text-sm text-slate-300">
            <li><b className="text-white">E</b> = electric field intensity (N/C)</li>
            <li><b className="text-white">F</b> = magnitude of the electric force (N)</li>
            <li><b className="text-white">q₀</b> = test charge; the formula uses its magnitude |q₀| (C)</li>
          </ul>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <p className="rounded-xl bg-slate-900 p-3 text-sm text-slate-300">
              The field is a vector. Its direction is the direction of the force on a <b className="text-white">positive</b> test charge.
            </p>
            <p className="rounded-xl bg-slate-900 p-3 text-sm text-slate-300">
              A <b className="text-white">positive</b> test charge feels a force <b className="text-white">along</b> the field.
            </p>
            <p className="rounded-xl bg-slate-900 p-3 text-sm text-slate-300">
              A <b className="text-white">negative</b> test charge feels a force <b className="text-white">opposite</b> to the field.
            </p>
          </div>
          <p className="mt-3 text-sm text-slate-400">
            To find E, divide the force magnitude by the absolute value of the test charge. To go
            the other way, F = E|q₀|.
          </p>

          <div className="mt-5 rounded-xl border border-slate-700 bg-slate-900/70 p-4 text-sm leading-7 text-slate-300">
            <p className="font-semibold text-violet-300">Worked example (from the lecture)</p>
            <p>A spot has an electric field of magnitude 2.0 N/C. Find the force on a charge placed there if (a) q₀ = +18 × 10⁻⁸ C and (b) q₀ = −24 × 10⁻⁸ C.</p>
            <button type="button" aria-expanded={showFieldSolution} onClick={() => setShowFieldSolution((shown) => !shown)} className="mt-3 inline-flex min-h-10 items-center rounded-lg border border-violet-300/30 px-3 py-2 text-sm font-semibold text-violet-200 hover:bg-violet-300/10">
              {showFieldSolution ? "Hide Solution" : "Show Solution"}
            </button>
            {showFieldSolution && <ol className="mt-3 space-y-1">
              <li><b className="text-white">Given:</b> E = 2.0 N/C; (a) q₀ = +18 × 10⁻⁸ C; (b) q₀ = −24 × 10⁻⁸ C.</li>
              <li><b className="text-white">Find:</b> Force magnitude and direction for each test charge.</li>
              <li><b className="text-white">Formula:</b> F = E|q₀|; a positive charge feels force with the field, and a negative charge against it.</li>
              <li><b className="text-white">Substitution:</b> (a) F = (2.0 N/C)|+18 × 10⁻⁸ C|; (b) F = (2.0 N/C)|−24 × 10⁻⁸ C|.</li>
              <li><b className="text-white">Calculation:</b> (a) F = 3.6 × 10⁻⁷ N; (b) F = 4.8 × 10⁻⁷ N.</li>
              <li className="rounded-lg bg-emerald-400/5 p-2 font-semibold text-emerald-300"><b>Final Answer:</b> (a) 3.6 × 10⁻⁷ N along the field; (b) 4.8 × 10⁻⁷ N opposite the field.</li>
            </ol>}
          </div>
          <div className="mt-4 rounded-xl border border-violet-300/20 bg-slate-900/70 p-4 text-sm leading-7 text-slate-300">
            <p className="font-semibold text-violet-300">Electric-field example</p>
            <p>Given a force magnitude F = 0.60 N on a positive test charge q₀ = +3.0 μC, find E.</p>
            <ol className="mt-2 space-y-1">
              <li><b className="text-white">Formula:</b> E = F/|q₀|.</li>
              <li><b className="text-white">Substitution:</b> q₀ = 3.0 × 10⁻⁶ C; E = 0.60 N/(3.0 × 10⁻⁶ C).</li>
              <li><b className="text-white">Calculation:</b> E = 2.0 × 10⁵ N/C.</li>
              <li><b className="text-emerald-300">Answer:</b> E = 2.0 × 10⁵ N/C, in the direction of the force because q₀ is positive.</li>
            </ol>
            <p className="mt-2 text-xs text-slate-400">A negative test charge in this field would feel a force in the opposite direction.</p>
          </div>
        </section>

        {/* ---------- Electric field calculator ---------- */}
        <section id="test-charge-force" className={`${card} mt-8 scroll-mt-28`}>
          <h2 className="mb-2 text-xl font-semibold">Force on a test charge in an electric field</h2>
          <p className="mb-4 text-sm text-slate-400">
            Use F = E|q₀| for the force magnitude. The magnitude is never negative; the sign of
            the test charge decides whether the force points with or against the field.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <NumberField label="Electric field E (N/C)" value={electricField} onChange={setElectricField} hint="Magnitude of the field (0 or greater)" />
            <NumberField label="Test charge q₀ (μC)" value={testCharge} onChange={setTestCharge} hint="Use a minus sign for a negative charge" />
          </div>
          <button type="button" onClick={() => { setElectricField("2"); setTestCharge("2"); }} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300">
            <RotateCcw size={15} /> Reset defaults
          </button>

          {fieldErrors.length > 0 && (
            <div role="alert" className="mt-4 rounded-xl border border-amber-400/40 bg-amber-400/10 p-3 text-sm text-amber-200">
              {fieldErrors.map((msg) => (
                <p key={msg}>{msg}</p>
              ))}
            </div>
          )}

          <div className="mt-4 rounded-xl bg-slate-900 p-4">
            <p className="text-xs text-slate-400">Force magnitude</p>
            <p className="wrap-break-word text-2xl font-bold text-violet-200">
              {fieldValid ? `${formatValue(fieldForce)} N` : "—"}
            </p>
            <p className="mt-1 text-sm text-slate-400">{fieldDirection}</p>
          </div>
        </section>

        <section id="ohms-law" className={`${card} mt-8 scroll-mt-28`}>
          <h2 className="mb-3 text-xl font-semibold text-sky-300">
            Ohm&apos;s law calculator
          </h2>
          <p className="mb-5 text-sm leading-6 text-slate-400">
            For an ohmic component at constant physical conditions, V = IR.
            Enter voltage and resistance to calculate current and electrical
            power. Resistance must be greater than zero.
          </p>
          <div className="mb-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl bg-slate-900 p-4">
              <p className="text-sm font-bold text-sky-200">Voltage · V</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">Potential difference that transfers energy to charge, measured in volts (V).</p>
            </div>
            <div className="rounded-xl bg-slate-900 p-4">
              <p className="text-sm font-bold text-emerald-200">Current · I</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">Rate of charge flow, measured in amperes (A).</p>
            </div>
            <div className="rounded-xl bg-slate-900 p-4">
              <p className="text-sm font-bold text-violet-200">Resistance · R</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">Opposition to current, measured in ohms (Ω).</p>
            </div>
          </div>
          <p className={`${formulaBox} text-sky-200`}>V = IR &nbsp; · &nbsp; I = V/R &nbsp; · &nbsp; R = V/I</p>
          {renderOhmsLawCalculator()}
        </section>

        {renderCircuitBuilder()}
        <CircuitPractice />
        <SeriesParallelComparison />

        {/* ---------- Quiz ---------- */}
        <section id="quiz" className={`${card} mt-8 scroll-mt-28`}>
          <LessonQuizEligibilityNotice
            eligibility={eligibility}
            error={eligibilityError}
            onRetry={() => void refreshEligibility()}
          />
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-emerald-300">
                CHECK YOUR KNOWLEDGE
              </p>
              <h2 className="mt-2 text-2xl font-bold md:text-3xl">
                Electricity · {quizAttempt.length} questions
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

          <div className="mb-6 rounded-xl bg-[#080D1B] p-4 text-sm leading-6 text-slate-400">
            Choose one answer for every question. Submit to review missed answers and explanations.
          </div>

          {submitted && (
            <div
              role="status"
              className="mb-6 rounded-xl border border-white/10 bg-[#080D1B] p-4 text-sm leading-7 text-slate-300"
            >
              {missed.length === 0 ? (
                <p className="font-semibold text-emerald-300">
                  Perfect score! Every answer was correct.
                </p>
              ) : (
                <p>
                  <span className="font-semibold text-rose-300">
                    Review these questions:
                  </span>{" "}
                  {missed.map((index) => (
                    <a
                      key={index}
                      href={`#quiz-q-${index + 1}`}
                      className={`mr-3 font-semibold text-sky-300 underline hover:text-sky-200 ${quizFocus}`}
                    >
                      Q{index + 1}
                    </a>
                  ))}
                </p>
              )}
            </div>
          )}

          <div className="space-y-6">
            {quizAttempt.map((item, i) => {
              const selected = answers[i];
              const isMissed = submitted && selected !== item.answer;

              return (
                <LessonQuizQuestion key={item.q} number={i + 1}>
                  <div
                    id={`quiz-q-${i + 1}`}
                    className={`scroll-mt-24 rounded-xl border p-4 ${
                      isMissed
                        ? "border-rose-400/50 bg-rose-400/5"
                        : "border-white/10 bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p
                        id={`quiz-label-${i}`}
                        className="font-semibold leading-7"
                      >
                        {item.q}
                      </p>
                      {isMissed && (
                        <span className="rounded-full bg-rose-400/10 px-3 py-1 text-xs font-semibold text-rose-300">
                          Incorrect
                        </span>
                      )}
                    </div>

                  <div
                    role="radiogroup"
                    aria-labelledby={`quiz-label-${i}`}
                    className="mt-4 grid gap-3 sm:grid-cols-2"
                  >
                    {item.options.map((option, oi) => {
                      const selectedOption = selected === oi;
                      const correctOption = item.answer === oi;
                      const optionState = submitted
                        ? correctOption
                          ? "correct"
                          : selectedOption
                            ? "incorrect"
                            : "muted"
                        : selectedOption
                          ? "selected"
                          : "default";
                      return (
                        <button
                          key={`${i}-${oi}`}
                          type="button"
                          role="radio"
                          aria-checked={selectedOption}
                          disabled={submitted}
                          aria-describedby={`quiz-label-${i}`}
                          onClick={() => chooseAnswer(i, oi)}
                          className={`${QUIZ_OPTION_BASE_CLASS} ${getQuizOptionClass(optionState)} ${quizFocus}`}
                        >
                          <span className="mr-2 font-bold text-slate-400">
                            {String.fromCharCode(65 + oi)}.
                          </span>
                          {option}
                          {submitted && correctOption && (
                            <>
                              <CheckCircle2
                                size={16}
                                aria-hidden="true"
                                className="ml-2 inline text-emerald-300"
                              />
                              <span className="sr-only"> (correct answer)</span>
                            </>
                          )}
                          {submitted && selectedOption && !correctOption && (
                            <>
                              <XCircle
                                size={16}
                                aria-hidden="true"
                                className="ml-2 inline text-rose-300"
                              />
                              <span className="sr-only">
                                {" "}
                                (your answer, incorrect)
                              </span>
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {submitted && (
                    <div className="mt-4 rounded-xl bg-white/[0.03] p-4">
                      <p className="text-sm font-semibold text-emerald-300">
                        Explanation
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        {item.why}
                      </p>
                    </div>
                  )}
                  </div>
                </LessonQuizQuestion>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {!submitted ? (
              <button
                type="button"
                disabled={
                  answeredCount !== quizAttempt.length ||
                  !eligibility?.eligible ||
                  saveState === "saving"
                }
                onClick={submitQuiz}
                className={`${QUIZ_SUBMIT_BUTTON_CLASS} ${quizFocus}`}
              >
                Submit quiz <ArrowRight size={16} className="ml-1 inline" />
              </button>
            ) : (
              <button
                type="button"
                onClick={resetQuiz}
                className={`${QUIZ_RETRY_BUTTON_CLASS} ${quizFocus}`}
              >
                <RotateCcw size={16} className="mr-2 inline" />
                Try again
              </button>
            )}
          </div>
          <LessonQuizFeedback
            saveState={saveState}
            passed={passed}
            message={saveMessage}
            onRetry={async () => {
              if (await saveResult(
                "electricity",
                quizAttempt.map((_, index) => answers[index] ?? -1),
                quizAttempt.map((question) => ({
                  question: question.q,
                  choices: question.originalOptions,
                  explanation: question.why,
                  questionIndex: question.questionIndex,
                  optionOrder: question.optionOrder,
                }))
              )) setSubmitted(true);
            }}
          />
        </section>

        <LessonNavigation
          lessonSlug="electricity"
          previous={{ href: "/lessons/optics", label: "Light & Reflection" }}
          finalLesson
        />
        </div>
        </div>
      </div>
    </main>
  );
}