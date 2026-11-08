"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Radio, RotateCcw, Save, Square, Volume2, XCircle } from "lucide-react";
import LessonHeader from "../LessonHeader";
import LessonProgressTracker from "../LessonProgressTracker";
import LessonNavigation from "../LessonNavigation";
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
import { useShuffledQuestionOrder } from "../quizRandomization";

const questions = [
  { q: "A string has mass 0.020 kg and length 1.0 m. What is its linear mass density?", options: ["0.002 kg/m", "0.020 kg/m", "0.20 kg/m", "20 kg/m"], a: 1, why: "μ = m/L = 0.020 kg / 1.0 m = 0.020 kg/m." },
  { q: "A string has tension 80 N and linear mass density 0.020 kg/m. What is its wave speed?", options: ["4 m/s", "40 m/s", "63.2 m/s", "1600 m/s"], a: 2, why: "v = √(T/μ) = √(80/0.020) = √4000 ≈ 63.2 m/s." },
  { q: "A string fixed at both ends has length 0.50 m and wave speed 100 m/s. What is its fundamental frequency?", options: ["50 Hz", "100 Hz", "200 Hz", "400 Hz"], a: 1, why: "f₁ = v/(2L) = 100/(2 × 0.50) = 100 Hz." },
  { q: "Which statement correctly classifies sound frequencies?", options: ["Infrasonic is above 20 kHz", "Audible sound is approximately 20 Hz to 20 kHz", "Ultrasound is below 20 Hz", "Sonic sound has only one frequency"], a: 1, why: "Infrasonic sound is below about 20 Hz, audible sound is approximately 20 Hz–20 kHz, and ultrasound is above about 20 kHz." },
  { q: "A pure tone contains…", options: ["only one frequency", "only ultrasonic frequencies", "many unrelated frequencies", "no amplitude"], a: 0, why: "An ideal pure tone consists of a single frequency." },
  { q: "Which statement about sound amplitude and loudness is correct?", options: ["Greater amplitude generally means greater intensity and perceived loudness", "Amplitude determines pitch only", "Loudness is independent of amplitude", "Amplitude is the wave speed"], a: 0, why: "Greater amplitude generally carries greater intensity and is perceived as louder, although loudness also depends on frequency and the listener." },
  { q: "A sound wave carries 2 W of power through an area of 0.5 m² perpendicular to its travel. What is its intensity?", options: ["1 W/m²", "2 W/m²", "4 W/m²", "8 W/m²"], a: 2, why: "Intensity I = power/area = 2 W / 0.5 m² = 4 W/m²." },
  { q: "Which statement best relates pitch, harmonics, and timbre?", options: ["Pitch is mainly related to frequency; harmonic content helps determine timbre", "Pitch is set by amplitude only", "Timbre is the speed of sound", "Harmonics cannot affect sound quality"], a: 0, why: "Pitch is mainly associated with frequency. The relative strengths of a sound's fundamental and harmonics help give it its characteristic timbre." },
  { q: "Using v = 331.45 + 0.6T, what is the approximate speed of sound in air at 10°C?", options: ["331.45 m/s", "337.45 m/s", "343.45 m/s", "349.45 m/s"], a: 1, why: "v = 331.45 + 0.6(10) = 337.45 m/s." },
  { q: "For air at 30°C, use v = 331.45√(Tₖ/273), with Tₖ = T°C + 273.15. What is the approximate speed?", options: ["331.45 m/s", "343.0 m/s", "349.3 m/s", "365.0 m/s"], a: 2, why: "Tₖ = 30 + 273.15 = 303.15 K; v = 331.45√(303.15/273) ≈ 349.3 m/s." },
  { q: "For an ideal gas with γ = 1.4, R = 8.314 J/(mol·K), T = 300 K, and MW = 0.02897 kg/mol, what is v = √(γRT/MW)?", options: ["173 m/s", "287 m/s", "347 m/s", "1205 m/s"], a: 2, why: "v = √((1.4)(8.314)(300)/0.02897) ≈ 347 m/s. Temperature must be in kelvin and molar mass in kg/mol." },
  { q: "For an elastic medium with Young's modulus 2.0 × 10⁹ Pa and density 1000 kg/m³, what speed is predicted by v = √(Y/ρ)?", options: ["447 m/s", "1000 m/s", "1414 m/s", "2.0 × 10⁶ m/s"], a: 2, why: "v = √(Y/ρ) = √(2.0 × 10⁹ / 1000) = √(2.0 × 10⁶) ≈ 1414 m/s." },
  { q: "A 500 Hz source approaches a stationary observer at 20 m/s. If sound speed is 340 m/s, what frequency is observed?", options: ["472 Hz", "500 Hz", "531 Hz", "559 Hz"], a: 2, why: "For an approaching source and stationary observer, fₒ = fₛ[v/(v − vₛ)] = 500(340/320) = 531.25 Hz." },
  { q: "A stationary 500 Hz source is heard by an observer moving away at 10 m/s. If sound speed is 340 m/s, what is the observed frequency?", options: ["485 Hz", "500 Hz", "515 Hz", "529 Hz"], a: 0, why: "For an observer moving away, fₒ = fₛ[(v − vₒ)/v] = 500(330/340) ≈ 485 Hz." },
  { q: "When source and observer approach each other, which Doppler signs are used?", options: ["v − vₒ in the numerator and v + vₛ in the denominator", "v + vₒ in the numerator and v − vₛ in the denominator", "Plus signs in both numerator and denominator", "The observed frequency never changes"], a: 1, why: "Approaching motion raises observed frequency: observer velocity toward the source adds in the numerator and source velocity toward the observer subtracts in the denominator." },
  { q: "A distinct repeat of a sound heard after reflection is called a(n)…", options: ["interference", "reverberation", "echo", "harmonic"], a: 2, why: "An echo is a distinct reflected sound heard again after a delay." },
  { q: "What is reverberation?", options: ["A single tone with one frequency", "Sound persisting due to many reflections arriving close together", "A frequency above 20 kHz", "Cancellation of every sound wave"], a: 1, why: "Reverberation is the persistence or gradual decay of sound caused by many reflections that overlap in time." },
  { q: "When two sound waves overlap and reinforce or reduce one another, this is…", options: ["Doppler shift", "Interference", "Refraction only", "Thermal expansion"], a: 1, why: "Interference is superposition: waves can reinforce (constructive) or reduce one another (destructive) depending on phase." },
  { q: "A wave travels at 24 m/s and has a frequency of 6 Hz. What is its wavelength?", options: ["4 m", "18 m", "30 m", "0.25 m"], a: 0, why: "λ = v/f = 24 m/s ÷ 6 Hz = 4 m." },
  { q: "A periodic wave has frequency 50 Hz. What is its period?", options: ["50 s", "25 s", "0.5 s", "0.020 s"], a: 3, why: "T = 1/f = 1/50 s = 0.020 s." },
];
const quizOptionCounts = questions.map((question) => question.options.length);

type SaveState = "idle" | "saving" | "saved" | "guest" | "error";
type SoundSpeedMethod = "air-up-to-20" | "air-above-20" | "ideal-gas" | "elastic-medium";
type MotionDirection = "toward" | "away";

type WaveWorkedExampleData = {
  title: string;
  problem: string;
  given: string[];
  find: string;
  formula: string[];
  substitution: string[];
  calculation: string[];
  answer: string;
};

function WaveWorkedExample({
  example,
  accent = "sky",
}: {
  example: WaveWorkedExampleData;
  accent?: "sky" | "violet" | "amber" | "emerald";
}) {
  const [open, setOpen] = useState(false);
  const solutionId = `wave-solution-${example.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")}`;
  const accentText = {
    sky: "text-sky-300",
    violet: "text-violet-300",
    amber: "text-amber-300",
    emerald: "text-emerald-300",
  }[accent];

  return (
    <article className="rounded-2xl border border-white/10 bg-[#080D1B] p-5">
      <h3 className={`font-bold ${accentText}`}>{example.title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{example.problem}</p>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={solutionId}
        onClick={() => setOpen((currentlyOpen) => !currentlyOpen)}
        className={`mt-4 inline-flex min-h-10 items-center rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300`}
      >
        {open ? "Hide Solution" : "Show Solution"}
      </button>
      {open && (
        <div
          id={solutionId}
          className="mt-4 rounded-xl bg-white/[0.03] p-4 text-sm leading-6 text-slate-400"
        >
          <div className="space-y-3">
            <div>
              <p className="font-semibold text-slate-200">Given</p>
              {example.given.map((line) => <p key={line}>{line}</p>)}
            </div>
            <div>
              <p className="font-semibold text-slate-200">Find</p>
              <p>{example.find}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-200">Formula</p>
              {example.formula.map((line) => <p key={line}>{line}</p>)}
            </div>
            <div>
              <p className="font-semibold text-slate-200">Substitution</p>
              {example.substitution.map((line) => <p key={line}>{line}</p>)}
            </div>
            <div>
              <p className="font-semibold text-slate-200">Calculation</p>
              {example.calculation.map((line) => <p key={line}>{line}</p>)}
            </div>
            <div className="rounded-xl bg-emerald-400/5 p-3">
              <p className="font-semibold text-emerald-300">Final Answer</p>
              <p className="font-bold text-emerald-200">{example.answer}</p>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

function StringHarmonicDiagram({ harmonic }: { harmonic: 1 | 2 | 3 }) {
  const left = 48;
  const right = 312;
  const equilibrium = 78;
  const amplitude = 25;
  const path = Array.from({ length: 81 }, (_, index) => {
    const fraction = index / 80;
    const x = left + fraction * (right - left);
    const y = equilibrium - Math.sin(harmonic * Math.PI * fraction) * amplitude;
    return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(" ");
  const nodes = Array.from({ length: harmonic + 1 }, (_, index) => ({
    x: left + (index / harmonic) * (right - left),
    y: equilibrium,
  }));
  const antinodes = Array.from({ length: harmonic }, (_, index) => {
    const fraction = (index + 0.5) / harmonic;
    return {
      x: left + fraction * (right - left),
      y: equilibrium - Math.sin(harmonic * Math.PI * fraction) * amplitude,
    };
  });

  return (
    <article className="rounded-2xl border border-white/10 bg-[#080D1B] p-4 sm:p-5">
      <h3 className="font-bold text-violet-200">
        {["First", "Second", "Third"][harmonic - 1]} harmonic · {harmonic}{" "}
        {harmonic === 1 ? "loop" : "loops"}
      </h3>
      <svg
        viewBox="0 0 360 150"
        role="img"
        aria-label={`${harmonic === 1 ? "First" : harmonic === 2 ? "Second" : "Third"} harmonic standing wave on a string fixed at both ends; ${harmonic + 1} nodes and ${harmonic} antinodes.`}
        className="mt-3 w-full"
      >
        <line x1={left} y1="28" x2={right} y2="28" stroke="#64748B" />
        <line x1={left} y1="23" x2={left} y2="33" stroke="#64748B" strokeWidth="2" />
        <line x1={right} y1="23" x2={right} y2="33" stroke="#64748B" strokeWidth="2" />
        <text x="180" y="21" fill="#CBD5E1" fontSize="12" textAnchor="middle">String length L</text>
        <line x1={left} y1={equilibrium} x2={right} y2={equilibrium} stroke="#475569" strokeDasharray="4 5" />
        <path d={path} fill="none" stroke="#A78BFA" strokeWidth="3" strokeLinecap="round" />
        <line x1={left} y1="52" x2={left} y2="108" stroke="#CBD5E1" strokeWidth="3" />
        <line x1={right} y1="52" x2={right} y2="108" stroke="#CBD5E1" strokeWidth="3" />
        {nodes.map((node, index) => (
          <circle key={`node-${index}`} cx={node.x} cy={node.y} r="5" fill="#38BDF8" stroke="#E0F2FE" strokeWidth="1.5" />
        ))}
        {antinodes.map((antinode, index) => (
          <circle key={`antinode-${index}`} cx={antinode.x} cy={antinode.y} r="4.5" fill="#FBBF24" stroke="#FEF3C7" strokeWidth="1.5" />
        ))}
        <text x={left} y="124" fill="#CBD5E1" fontSize="10" textAnchor="middle">Fixed</text>
        <text x={right} y="124" fill="#CBD5E1" fontSize="10" textAnchor="middle">Fixed</text>
        <text x="180" y="143" fill="#C4B5FD" fontSize="12" textAnchor="middle">λ{harmonic} = {harmonic === 1 ? "2L" : harmonic === 2 ? "L" : "2L/3"}</text>
      </svg>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
        <span><span className="text-sky-300">●</span> Nodes</span>
        <span><span className="text-amber-300">●</span> Antinodes</span>
        <span className="text-slate-300">Each loop = λ{harmonic}/2</span>
      </div>
    </article>
  );
}

export default function WavesSoundPage() {
  const { eligibility, error: eligibilityError, refresh: refreshEligibility } =
    useLessonQuizEligibility("waves-sound");
  const [amplitude, setAmplitude] = useState(0.45);
  const [frequency, setFrequency] = useState(3);
  const [wavelength, setWavelength] = useState(2);
  const [fixedMediumMode, setFixedMediumMode] = useState(false);
  const [mediumWaveSpeed, setMediumWaveSpeed] = useState(6);
  const [wavePracticeAnswer, setWavePracticeAnswer] = useState<string | null>(null);
  const [waveCalculationAnswer, setWaveCalculationAnswer] = useState<string | null>(null);
  const [stringTension, setStringTension] = useState("80");
  const [stringMass, setStringMass] = useState("0.01");
  const [stringLength, setStringLength] = useState("0.65");
  const [soundSpeedMethod, setSoundSpeedMethod] =
    useState<SoundSpeedMethod>("air-up-to-20");
  const [airTemperatureC, setAirTemperatureC] = useState("20");
  const [gasGamma, setGasGamma] = useState("1.4");
  const [gasConstant, setGasConstant] = useState("8.314");
  const [gasMolarMass, setGasMolarMass] = useState("0.02897");
  const [gasTemperatureK, setGasTemperatureK] = useState("293.15");
  const [youngModulus, setYoungModulus] = useState("2e9");
  const [mediumDensity, setMediumDensity] = useState("1000");
  const [dopplerSourceFrequency, setDopplerSourceFrequency] = useState("500");
  const [soundSpeed, setSoundSpeed] = useState("343");
  const [observerSpeed, setObserverSpeed] = useState("0");
  const [sourceSpeed, setSourceSpeed] = useState("20");
  const [observerDirection, setObserverDirection] =
    useState<MotionDirection>("toward");
  const [sourceDirection, setSourceDirection] =
    useState<MotionDirection>("toward");
  const [toneFrequency, setToneFrequency] = useState(440);
  const [tonePlaying, setTonePlaying] = useState(false);
  const [toneMessage, setToneMessage] = useState("");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveMessage, setSaveMessage] = useState("");
  const [passed, setPassed] = useState<boolean | null>(null);
  const [quizOrder, reshuffleQuiz] =
    useShuffledQuestionOrder(quizOptionCounts);
  const quizAttempt = quizOrder.map(({ questionIndex, optionOrder }) => {
    const question = questions[questionIndex];

    return {
      ...question,
      options: optionOrder.map((optionIndex) => question.options[optionIndex]),
      a: optionOrder.indexOf(question.a),
      questionIndex,
      originalOptions: question.options,
      optionOrder,
    };
  });
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const score = quizAttempt.filter((q, i) => answers[i] === q.a).length;
  const answeredCount = Object.keys(answers).length;
  const cyclesAcrossDisplay = 4 / wavelength;
  const waveSamples = Math.max(121, Math.ceil(cyclesAcrossDisplay * 30) + 1);
  const wavePath = Array.from({ length: waveSamples }, (_, i) => {
    const fraction = i / (waveSamples - 1);
    const x = fraction * 480;
    const y = (
      90 - Math.sin(fraction * Math.PI * 2 * cyclesAcrossDisplay) * amplitude * 100
    ).toFixed(2);
    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
  }).join(" ");
  const waveSpeed = fixedMediumMode
    ? mediumWaveSpeed
    : frequency * wavelength;
  const stringTensionValue = Number(stringTension);
  const stringMassValue = Number(stringMass);
  const stringLengthValue = Number(stringLength);
  const stringInputsValid =
    stringTension.trim() !== "" &&
    stringMass.trim() !== "" &&
    stringLength.trim() !== "" &&
    Number.isFinite(stringTensionValue) &&
    Number.isFinite(stringMassValue) &&
    Number.isFinite(stringLengthValue) &&
    stringTensionValue > 0 &&
    stringMassValue > 0 &&
    stringLengthValue > 0;
  const stringLinearDensity = stringInputsValid
    ? stringMassValue / stringLengthValue
    : null;
  const stringWaveSpeed =
    stringInputsValid && stringLinearDensity !== null
      ? Math.sqrt(stringTensionValue / stringLinearDensity)
      : null;
  const stringFundamentalFrequency =
    stringInputsValid && stringWaveSpeed !== null
      ? stringWaveSpeed / (2 * stringLengthValue)
      : null;
  const stringResultsValid =
    stringLinearDensity !== null &&
    stringWaveSpeed !== null &&
    stringFundamentalFrequency !== null &&
    Number.isFinite(stringLinearDensity) &&
    Number.isFinite(stringWaveSpeed) &&
    Number.isFinite(stringFundamentalFrequency) &&
    stringLinearDensity > 0 &&
    stringWaveSpeed > 0 &&
    stringFundamentalFrequency > 0;

  const airTemperatureValue = Number(airTemperatureC);
  const gammaValue = Number(gasGamma);
  const gasConstantValue = Number(gasConstant);
  const molarMassValue = Number(gasMolarMass);
  const gasTemperatureValue = Number(gasTemperatureK);
  const youngModulusValue = Number(youngModulus);
  const mediumDensityValue = Number(mediumDensity);
  let calculatedSoundSpeed: number | null = null;
  let soundSpeedError = "";
  let soundSpeedSubstitution = "";

  if (soundSpeedMethod === "air-up-to-20") {
    if (
      !airTemperatureC.trim() ||
      !Number.isFinite(airTemperatureValue) ||
      airTemperatureValue < -273.15 ||
      airTemperatureValue > 20
    ) {
      soundSpeedError = "Enter an air temperature from −273.15°C through 20°C.";
    } else {
      calculatedSoundSpeed = 331.45 + 0.6 * airTemperatureValue;
      soundSpeedSubstitution = `v = 331.45 + 0.6(${airTemperatureValue}°C)`;
    }
  } else if (soundSpeedMethod === "air-above-20") {
    if (
      !airTemperatureC.trim() ||
      !Number.isFinite(airTemperatureValue) ||
      airTemperatureValue <= 20
    ) {
      soundSpeedError = "This approximation is for air temperatures above 20°C.";
    } else {
      const temperatureK = airTemperatureValue + 273.15;
      calculatedSoundSpeed = 331.45 * Math.sqrt(temperatureK / 273);
      soundSpeedSubstitution = `Tₖ = ${airTemperatureValue} + 273.15 = ${temperatureK.toFixed(2)} K; v = 331.45√(${temperatureK.toFixed(2)}/273)`;
    }
  } else if (soundSpeedMethod === "ideal-gas") {
    if (
      !gasGamma.trim() ||
      !gasConstant.trim() ||
      !gasMolarMass.trim() ||
      !gasTemperatureK.trim() ||
      !Number.isFinite(gammaValue) ||
      !Number.isFinite(gasConstantValue) ||
      !Number.isFinite(molarMassValue) ||
      !Number.isFinite(gasTemperatureValue) ||
      gammaValue <= 0 ||
      gasConstantValue <= 0 ||
      molarMassValue <= 0 ||
      gasTemperatureValue <= 0
    ) {
      soundSpeedError =
        "Enter positive values for γ, R, molar mass, and absolute temperature in kelvin.";
    } else {
      calculatedSoundSpeed = Math.sqrt(
        (gammaValue * gasConstantValue * gasTemperatureValue) /
          molarMassValue
      );
      soundSpeedSubstitution = `v = √((${gammaValue})(${gasConstantValue} J/(mol·K))(${gasTemperatureValue} K)/(${molarMassValue} kg/mol))`;
    }
  } else if (
    !youngModulus.trim() ||
    !mediumDensity.trim() ||
    !Number.isFinite(youngModulusValue) ||
    !Number.isFinite(mediumDensityValue) ||
    youngModulusValue <= 0 ||
    mediumDensityValue <= 0
  ) {
    soundSpeedError =
      "Enter positive values for Young’s modulus and density.";
  } else {
    calculatedSoundSpeed = Math.sqrt(
      youngModulusValue / mediumDensityValue
    );
    soundSpeedSubstitution = `v = √((${youngModulusValue} Pa)/(${mediumDensityValue} kg/m³))`;
  }

  if (
    calculatedSoundSpeed !== null &&
    !Number.isFinite(calculatedSoundSpeed)
  ) {
    calculatedSoundSpeed = null;
    soundSpeedError = "The selected values are outside the supported numeric range.";
  }

  const sourceFrequencyValue = Number(dopplerSourceFrequency);
  const dopplerSpeedValue = Number(soundSpeed);
  const observerSpeedValue = Number(observerSpeed);
  const sourceSpeedValue = Number(sourceSpeed);
  const observerTerm =
    observerDirection === "toward"
      ? dopplerSpeedValue + observerSpeedValue
      : dopplerSpeedValue - observerSpeedValue;
  const sourceTerm =
    sourceDirection === "toward"
      ? dopplerSpeedValue - sourceSpeedValue
      : dopplerSpeedValue + sourceSpeedValue;
  const dopplerInputsValid =
    dopplerSourceFrequency.trim() !== "" &&
    soundSpeed.trim() !== "" &&
    observerSpeed.trim() !== "" &&
    sourceSpeed.trim() !== "" &&
    Number.isFinite(sourceFrequencyValue) &&
    Number.isFinite(dopplerSpeedValue) &&
    Number.isFinite(observerSpeedValue) &&
    Number.isFinite(sourceSpeedValue) &&
    sourceFrequencyValue > 0 &&
    dopplerSpeedValue > 0 &&
    observerSpeedValue >= 0 &&
    sourceSpeedValue >= 0 &&
    observerSpeedValue < dopplerSpeedValue &&
    sourceSpeedValue < dopplerSpeedValue &&
    observerTerm > 0 &&
    sourceTerm > 0;
  const calculatedObservedFrequency = dopplerInputsValid
    ? sourceFrequencyValue * (observerTerm / sourceTerm)
    : null;
  const observedFrequency =
    calculatedObservedFrequency !== null &&
    Number.isFinite(calculatedObservedFrequency)
      ? calculatedObservedFrequency
      : null;
  const dopplerFormula = `fₒ = fₛ[(v ${observerDirection === "toward" ? "+" : "−"} vₒ)/(v ${sourceDirection === "toward" ? "−" : "+"} vₛ)]`;

  function changeWaveFrequency(nextFrequency: number) {
    setFrequency(nextFrequency);
    if (fixedMediumMode) {
      setWavelength(mediumWaveSpeed / nextFrequency);
    }
  }

  function changeMediumWaveSpeed(nextSpeed: number) {
    setMediumWaveSpeed(nextSpeed);
    setWavelength(nextSpeed / frequency);
  }

  function toggleFixedMediumMode() {
    if (fixedMediumMode) {
      setWavelength(Math.min(4, Math.max(0.5, wavelength)));
      setFixedMediumMode(false);
      return;
    }

    setMediumWaveSpeed(waveSpeed);
    setFixedMediumMode(true);
  }

  useEffect(() => {
    return () => {
      oscillatorRef.current?.stop();
      const context = audioContextRef.current;
      if (context && context.state !== "closed") void context.close();
    };
  }, []);

  function changeToneFrequency(value: number) {
    setToneFrequency(value);
    const context = audioContextRef.current;
    const oscillator = oscillatorRef.current;
    if (context && oscillator) {
      oscillator.frequency.setValueAtTime(value, context.currentTime);
    }
  }

  async function toggleTone() {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current = null;
      setTonePlaying(false);
      setToneMessage("Tone stopped.");
      return;
    }

    try {
      const context =
        audioContextRef.current ?? new window.AudioContext();
      audioContextRef.current = context;
      await context.resume();

      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = toneFrequency;
      gain.gain.value = 0.08;
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillatorRef.current = oscillator;
      setTonePlaying(true);
      setToneMessage("Playing a sine-wave tone. Stop playback before leaving this section.");
    } catch (error) {
      setTonePlaying(false);
      setToneMessage(
        error instanceof Error
          ? `Audio could not be started: ${error.message}`
          : "Audio could not be started in this browser."
      );
    }
  }

  async function saveResult(): Promise<boolean> {
    setSaveState("saving");
    setSaveMessage("");
    setPassed(null);

    try {
      const response = await fetch("/api/lesson-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          lessonSlug: "waves-sound",
          answers: quizAttempt.map((_, i) => answers[i] ?? -1),
          questions: quizAttempt.map((question) => ({
            question: question.q,
            choices: question.originalOptions,
            explanation: question.why,
            questionIndex: question.questionIndex,
            optionOrder: question.optionOrder,
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not save your quiz result.");
      }

      if (typeof result.saved !== "boolean" || typeof result.passed !== "boolean") {
        throw new Error("The quiz result could not be confirmed.");
      }

      setPassed(result.passed);
      setSaveState(result.saved ? "saved" : "guest");
      if (result.passed) {
        window.dispatchEvent(
          new CustomEvent("calph-official-lesson-passed", {
            detail: { lessonSlug: "waves-sound", passed: true },
          })
        );
      }
      if (result.saved) {
        window.dispatchEvent(
          new CustomEvent("calph-learning-progress-updated", {
            detail: {
              lessonSlug: "waves-sound",
              completed:
                typeof result.moduleCompleted === "boolean"
                  ? result.moduleCompleted
                  : result.passed,
            },
          })
        );
      }
      setSaveMessage(result.saved
        ? result.passed
          ? "Great job! This module is now marked as completed."
          : `Your attempt was saved. You need at least ${result.passPercent}% to complete this module, so review the explanations and try again.`
        : "Your score is shown for this session only. Register or log in to save quiz results and track progress.");
    } catch (error) {
      setSaveState("error");
      setSaveMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving your result."
      );
      return false;
    }
    return true;
  }

  async function handleSubmit() {
    if (!eligibility?.eligible) return;
    if (await saveResult()) setSubmitted(true);
  }

  async function handleRetrySave() {
    if (await saveResult()) setSubmitted(true);
  }

  function handleTryAgain() {
    setAnswers({});
    setSubmitted(false);
    setSaveState("idle");
    setSaveMessage("");
    setPassed(null);
    reshuffleQuiz();
  }

  return (
    <main className="flex h-full min-h-0 flex-col overflow-hidden bg-[#080D1B] text-[#F8FAFC]">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div id="lesson-main-scroll" className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto w-full max-w-[1600px]">
        <LessonProgressTracker lessonSlug="waves-sound" />
        <LessonHeader
          module="Physics module 04"
          icon={<Radio size={18} />}
          accentClass="text-violet-300"
          title={
            <>
              Waves <span className="text-violet-300">&amp; Sound</span>
            </>
          }
          description="Explore wave properties, see how amplitude and frequency change a wave, and connect sound to everyday life."
        />
        <section className="mb-10 grid gap-4 md:grid-cols-3">
          {[["v = fλ","Wave equation"],["f = 1/T","Frequency and period"],["Hz","Frequency unit"]].map(([v,l]) => <div key={l} className="rounded-2xl border border-white/10 bg-[#111A2E] p-6"><p className="text-sm text-slate-400">{l}</p><p className="mt-3 text-2xl font-bold text-violet-300">{v}</p></div>)}
        </section>

        <section className="mb-10 grid gap-6 lg:grid-cols-2">
          <article id="wave-basics" className="scroll-mt-28 rounded-3xl border border-white/10 bg-[#111A2E] p-6 md:p-8">
            <h2 className="text-2xl font-bold">1. Wave basics</h2>
            <div className="mt-5 space-y-4 leading-7 text-slate-300">
              <p><strong className="text-white">Amplitude:</strong> Maximum displacement from equilibrium; for sound, greater amplitude generally means louder sound.</p>
              <p><strong className="text-white">Wavelength (λ):</strong> Distance between matching points on consecutive waves.</p>
              <p><strong className="text-white">Frequency (f):</strong> Number of cycles each second, measured in hertz (Hz).</p>
              <p><strong className="text-white">Period (T):</strong> Time for one cycle. Frequency and period are reciprocals.</p>
              <p><strong className="text-white">Sound:</strong> A mechanical longitudinal wave. It needs a medium and cannot travel through a vacuum.</p>
              <p><strong className="text-white">Wave speed:</strong> In a uniform medium, wave speed v, frequency f, and wavelength λ satisfy v = fλ. Frequency is measured in hertz (Hz), period in seconds (s), wavelength in meters (m), and speed in meters per second (m/s).</p>
              <p><strong className="text-white">Energy:</strong> A wave transports energy through a medium or field; in a mechanical wave, particles oscillate about equilibrium rather than traveling with the wave over long distances.</p>
            </div>
          </article>
          <article id="wave-simulator" className="scroll-mt-28 rounded-3xl border border-white/10 bg-[#111A2E] p-6 md:p-8">
            <h2 className="text-2xl font-bold">2. Wave simulator</h2>
            <p className="mt-3 leading-7 text-slate-400">Adjust amplitude, frequency, and wavelength. In normal mode, speed is calculated from v = fλ, so changing frequency or wavelength independently also changes the modeled speed. Enable Fixed-Medium Mode to hold the medium&apos;s speed constant and calculate wavelength from λ = v/f. This is a visual model, not a measured sound signal.</p>
            <div className="mt-6 rounded-2xl border border-white/10 bg-[#080D1B] p-3">
              <svg viewBox="0 0 480 180" className="w-full" role="img" aria-label="Animated wave with adjustable amplitude and frequency">
                {[30,60,90,120,150].map(y => <line key={y} x1="0" x2="480" y1={y} y2={y} stroke="#334155" strokeWidth="1" strokeDasharray="4 6"/>)}
                <line x1="0" x2="480" y1="90" y2="90" stroke="#64748B"/>
                <motion.path d={wavePath} fill="none" stroke="#A78BFA" strokeWidth="3" strokeLinecap="round" animate={{ opacity: [0.75,1,0.75] }} transition={{ duration: 1.2, repeat: Infinity }}/>
              </svg>
            </div>
            <div className="mt-6 space-y-5">
              <div><label htmlFor="amp" className="mb-2 flex justify-between text-sm text-slate-300">Amplitude A <strong className="text-violet-300">{amplitude.toFixed(2)} m</strong></label><input id="amp" type="range" min="0.10" max="0.75" step="0.05" value={amplitude} onChange={e=>setAmplitude(Number(e.target.value))} className="w-full accent-violet-400"/></div>
              <div><label htmlFor="freq" className="mb-2 flex justify-between text-sm text-slate-300">Frequency f <strong className="text-violet-300">{frequency} Hz</strong></label><input id="freq" type="range" min="1" max="8" value={frequency} onChange={e=>changeWaveFrequency(Number(e.target.value))} className="w-full accent-violet-400"/></div>
              <div>
                <label htmlFor="wavelength" className="mb-2 flex justify-between text-sm text-slate-300">
                  Wavelength λ <strong className="text-violet-300">{wavelength.toFixed(2)} m</strong>
                </label>
                <input
                  id="wavelength"
                  type="range"
                  min="0.5"
                  max="4"
                  step="0.1"
                  value={Math.min(4, Math.max(0.5, wavelength))}
                  disabled={fixedMediumMode}
                  onChange={e=>setWavelength(Number(e.target.value))}
                  className="w-full accent-violet-400 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-describedby={fixedMediumMode ? "fixed-medium-note" : undefined}
                />
                {fixedMediumMode && (
                  <p className="mt-2 text-xs text-slate-500">
                    Wavelength is calculated from the selected speed and frequency in Fixed-Medium Mode.
                  </p>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <div className="rounded-xl border border-white/10 bg-[#10182B] p-3">
                  <p className="text-xs text-slate-500">Amplitude A</p>
                  <p className="mt-1 font-mono text-sm font-bold text-violet-300">{amplitude.toFixed(2)} m</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#10182B] p-3">
                  <p className="text-xs text-slate-500">Frequency f</p>
                  <p className="mt-1 font-mono text-sm font-bold text-violet-300">{frequency} Hz</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#10182B] p-3">
                  <p className="text-xs text-slate-500">Wavelength λ</p>
                  <p className="mt-1 font-mono text-sm font-bold text-emerald-300">{wavelength.toFixed(2)} m</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#10182B] p-3">
                  <p className="text-xs text-slate-500">Wave speed v = fλ</p>
                  <p className="mt-1 font-mono text-sm font-bold text-emerald-300">{waveSpeed.toFixed(1)} m/s</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#10182B] p-3">
                  <p className="text-xs text-slate-500">Period T = 1/f</p>
                  <p className="mt-1 font-mono text-sm font-bold text-emerald-300">{(1 / frequency).toFixed(3)} s</p>
                </div>
              </div>
              <div className="rounded-xl border border-violet-400/15 bg-violet-400/5 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-violet-200">Fixed-Medium Mode</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-400">
                      {fixedMediumMode
                        ? "On: wave speed stays fixed; frequency changes update wavelength using λ = v/f."
                        : "Off: choose frequency and wavelength independently; wave speed is calculated as v = fλ."}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={fixedMediumMode}
                    onClick={toggleFixedMediumMode}
                    className={`relative inline-flex min-h-11 items-center gap-3 rounded-xl border px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300 ${
                      fixedMediumMode
                        ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
                        : "border-white/15 bg-white/[0.03] text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`h-3 w-3 rounded-full ${
                        fixedMediumMode ? "bg-emerald-300" : "bg-slate-500"
                      }`}
                    />
                    {fixedMediumMode ? "Enabled" : "Disabled"}
                  </button>
                </div>
                {fixedMediumMode && (
                  <div className="mt-5 border-t border-white/10 pt-4">
                    <label htmlFor="medium-wave-speed" className="mb-2 flex flex-wrap justify-between gap-2 text-sm text-slate-300">
                      Medium wave speed
                      <strong className="text-emerald-300">{mediumWaveSpeed.toFixed(1)} m/s</strong>
                    </label>
                    <input
                      id="medium-wave-speed"
                      type="range"
                      min="0.5"
                      max="32"
                      step="0.1"
                      value={mediumWaveSpeed}
                      onChange={(event) =>
                        changeMediumWaveSpeed(Number(event.target.value))
                      }
                      className="w-full accent-emerald-400"
                    />
                    <p id="fixed-medium-note" className="mt-2 text-xs leading-5 text-slate-500">
                      Wave speed depends on the medium and its properties. Choose a speed for this
                      medium; while this mode is on, changing frequency changes wavelength so
                      v = fλ remains true.
                    </p>
                  </div>
                )}
              </div>
              <p className="rounded-xl bg-white/5 p-4 text-sm leading-6 text-slate-400">
                Compare the modes: in normal mode, frequency and wavelength set the modeled speed.
                In Fixed-Medium Mode, the medium determines the selected speed; increasing frequency
                makes wavelength shorter, while decreasing frequency makes it longer. Amplitude
                changes maximum displacement, not wave speed in this idealized model.
              </p>
              <div className="rounded-xl border border-sky-400/15 bg-sky-400/5 p-4">
                <h3 className="font-bold text-sky-200">Practice · frequency and wavelength</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Enable Fixed-Medium Mode and move the frequency slider. Observe the wavelength
                  change, then answer: if frequency increases while the speed stays constant, what
                  happens to wavelength?
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["It decreases", "It increases", "It stays the same"].map((choice) => {
                    const selected = wavePracticeAnswer === choice;
                    const correct = choice === "It decreases";
                    const optionState = wavePracticeAnswer === null
                      ? "default"
                      : correct
                        ? "correct"
                        : selected
                          ? "incorrect"
                          : "muted";

                    return (
                      <button
                        key={choice}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setWavePracticeAnswer(choice)}
                        className={`${QUIZ_OPTION_BASE_CLASS} ${getQuizOptionClass(optionState)}`}
                      >
                        {choice}
                      </button>
                    );
                  })}
                </div>
                {wavePracticeAnswer !== null && (
                  <p className="mt-3 text-sm leading-6 text-slate-300" aria-live="polite">
                    <strong className={wavePracticeAnswer === "It decreases" ? "text-emerald-300" : "text-rose-300"}>
                      {wavePracticeAnswer === "It decreases" ? "Correct. " : "Not quite. "}
                    </strong>
                    Since v = fλ and v is fixed, λ = v/f. Increasing f therefore decreases λ.
                    The fixed-medium simulator above lets you observe this relationship directly.
                  </p>
                )}
                <div className="mt-5 border-t border-white/10 pt-4">
                  <p className="text-sm leading-6 text-slate-300">
                    Calculation: a wave travels through a medium at 12 m/s with a frequency of 4 Hz.
                    What is its wavelength?
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    {["2 m", "3 m", "48 m"].map((choice) => {
                      const selected = waveCalculationAnswer === choice;
                      const correct = choice === "3 m";
                      const optionState = waveCalculationAnswer === null
                        ? "default"
                        : correct
                          ? "correct"
                          : selected
                            ? "incorrect"
                            : "muted";

                      return (
                        <button
                          key={choice}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => setWaveCalculationAnswer(choice)}
                          className={`${QUIZ_OPTION_BASE_CLASS} ${getQuizOptionClass(optionState)}`}
                        >
                          {choice}
                        </button>
                      );
                    })}
                  </div>
                  {waveCalculationAnswer !== null && (
                    <p className="mt-3 text-sm leading-6 text-slate-300" aria-live="polite">
                      <strong className={waveCalculationAnswer === "3 m" ? "text-emerald-300" : "text-rose-300"}>
                        {waveCalculationAnswer === "3 m" ? "Correct. " : "Not quite. "}
                      </strong>
                      λ = v/f = (12 m/s)/(4 Hz) = 3 m.
                    </p>
                  )}
                </div>
              </div>
              <button type="button" onClick={() => { setAmplitude(0.45); setFrequency(3); setWavelength(2); setFixedMediumMode(false); setMediumWaveSpeed(6); setWavePracticeAnswer(null); setWaveCalculationAnswer(null); }} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300">
                <RotateCcw size={15} /> Reset wave defaults
              </button>
            </div>
          </article>
        </section>

        <section id="wave-types" className="mb-10 scroll-mt-28 rounded-3xl border border-white/10 bg-[#111A2E] p-6 md:p-8">
          <p className="text-sm font-semibold text-violet-300">KEY CONCEPTS</p>
          <h2 className="mt-2 text-2xl font-bold">Wave Types and Propagation</h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <article className="rounded-2xl border border-white/10 bg-[#080D1B] p-5">
              <h3 className="font-bold text-sky-300">Transverse waves</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">The disturbance is perpendicular to the direction of propagation. Electromagnetic waves are transverse and can travel through vacuum; a wave on a stretched string is a mechanical example.</p>
              <svg viewBox="0 0 360 95" role="img" aria-label="Transverse wave with oscillation perpendicular to its direction of propagation" className="mt-3 w-full">
                <line x1="20" y1="48" x2="330" y2="48" stroke="#64748B" />
                <path d="M25 48 C45 8 65 8 85 48 S125 88 145 48 S185 8 205 48 S245 88 265 48 S305 8 325 48" fill="none" stroke="#38BDF8" strokeWidth="3" />
                <text x="332" y="52" fill="#CBD5E1" fontSize="12">propagation →</text>
                <text x="15" y="15" fill="#CBD5E1" fontSize="12">oscillation ↕</text>
              </svg>
            </article>
            <article className="rounded-2xl border border-white/10 bg-[#080D1B] p-5">
              <h3 className="font-bold text-violet-300">Longitudinal waves</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">The disturbance is parallel to propagation, producing compressions and rarefactions. Sound in air is longitudinal; the speed depends on the medium and its conditions.</p>
              <svg viewBox="0 0 360 95" role="img" aria-label="Longitudinal wave represented by compressions and rarefactions parallel to propagation" className="mt-3 w-full">
                {Array.from({ length: 28 }, (_, index) => {
                  const x = 20 + index * 11;
                  const compression = Math.cos((index / 27) * Math.PI * 4);
                  return <line key={index} x1={x + compression * 4} x2={x + compression * 4} y1="28" y2="67" stroke="#A78BFA" strokeWidth="2" />;
                })}
                <text x="20" y="87" fill="#CBD5E1" fontSize="12">particle oscillation and propagation →</text>
              </svg>
            </article>
          </div>
          <p className="mt-4 rounded-xl border border-violet-400/15 bg-violet-400/5 p-4 text-sm leading-6 text-slate-300">
            Mechanical waves require a medium because they propagate through interactions
            between its particles. Electromagnetic waves are oscillations of electric and
            magnetic fields and do not require a material medium.
          </p>
        </section>

        <section id="string-harmonics" className="mb-10 scroll-mt-28 rounded-3xl border border-violet-400/20 bg-[#111A2E] p-6 md:p-8">
          <p className="text-sm font-semibold text-violet-300">STANDING WAVES</p>
          <h2 className="mt-2 text-2xl font-bold md:text-3xl">3. Waves on a stretched string</h2>
          <p className="mt-3 max-w-4xl leading-7 text-slate-300">
            A string fixed at both ends can vibrate in standing-wave modes. Each fixed
            endpoint is a node, where displacement is zero. Antinodes lie between nodes
            and have the greatest displacement. A higher harmonic fits more loops along
            the same string, so the string length is not generally one wavelength.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {([1, 2, 3] as const).map((harmonic) => (
              <StringHarmonicDiagram key={harmonic} harmonic={harmonic} />
            ))}
          </div>
          <div className="mt-5 rounded-2xl border border-white/10 bg-[#080D1B] p-5">
            <h3 className="font-bold text-sky-300">Allowed wavelengths and frequencies</h3>
            <p className="mt-2 leading-7 text-slate-300">
              For a string fixed at both ends, an integer number n of half-wavelengths
              fits into its length:
            </p>
            <div className="mt-4 grid gap-3 text-center sm:grid-cols-3">
              <p className="rounded-xl bg-white/5 p-4 font-mono text-lg font-bold text-violet-200">L = nλₙ/2</p>
              <p className="rounded-xl bg-white/5 p-4 font-mono text-lg font-bold text-violet-200">λₙ = 2L/n</p>
              <p className="rounded-xl bg-white/5 p-4 font-mono text-lg font-bold text-violet-200">fₙ = nv/(2L)</p>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-400">
              L is string length (m), n = 1, 2, 3, … is the harmonic number, λₙ is
              that mode&apos;s wavelength (m), fₙ is its frequency (Hz), and v is wave
              speed along the string (m/s). Thus λ₁ = 2L, λ₂ = L, and λ₃ = 2L/3.
              The fundamental frequency is f₁ = v/(2L); ideal-string harmonics have
              frequencies fₙ = n f₁. Nodes occur at the endpoints and between adjacent
              loops; each loop is one half-wavelength, λₙ/2.
            </p>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <WaveWorkedExample
              accent="violet"
              example={{
                title: "Finding a harmonic wavelength",
                problem: "A string fixed at both ends is 0.80 m long. Find the wavelength of its second harmonic.",
                given: ["L = 0.80 m", "n = 2"],
                find: "The second-harmonic wavelength, λ₂.",
                formula: ["L = nλₙ/2", "λₙ = 2L/n"],
                substitution: ["λ₂ = 2(0.80 m)/2"],
                calculation: ["λ₂ = 0.80 m"],
                answer: "λ₂ = 0.80 m",
              }}
            />
            <WaveWorkedExample
              accent="violet"
              example={{
                title: "Finding a harmonic frequency",
                problem: "A string has length 0.75 m and supports waves traveling at 120 m/s. Find its third-harmonic frequency.",
                given: ["L = 0.75 m", "v = 120 m/s", "n = 3"],
                find: "The third-harmonic frequency, f₃.",
                formula: ["fₙ = nv/(2L)"],
                substitution: ["f₃ = (3)(120 m/s)/(2 × 0.75 m)"],
                calculation: ["f₃ = 360 m/s ÷ 1.50 m = 240 s⁻¹"],
                answer: "f₃ = 240 Hz",
              }}
            />
          </div>
          <div className="mt-6 rounded-2xl border border-violet-400/20 bg-[#080D1B] p-5 sm:p-6">
            <h3 className="text-lg font-bold text-violet-200">
              Interactive calculator · wave on a string
            </h3>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">
              For an ideal flexible string, the wave speed depends on tension T
              and linear mass density μ (mass per length). For total string mass
              m and length L, μ = m/L and v = √(T/μ) = √(TL/m). For a string
              fixed at both ends, its fundamental frequency is f₁ = v/(2L).
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {[
                {
                  id: "string-tension",
                  label: "Tension T",
                  unit: "N",
                  value: stringTension,
                  set: setStringTension,
                  min: "0.1",
                },
                {
                  id: "string-mass",
                  label: "String mass m",
                  unit: "kg",
                  value: stringMass,
                  set: setStringMass,
                  min: "0.0001",
                },
                {
                  id: "string-length",
                  label: "String length L",
                  unit: "m",
                  value: stringLength,
                  set: setStringLength,
                  min: "0.01",
                },
              ].map((input) => (
                <label key={input.id} htmlFor={input.id} className="text-sm text-slate-300">
                  {input.label} ({input.unit})
                  <input
                    id={input.id}
                    type="number"
                    min={input.min}
                    step="any"
                    value={input.value}
                    onChange={(event) => input.set(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#111A2E] px-3 py-3 text-white outline-none focus:border-violet-300"
                  />
                </label>
              ))}
            </div>
            {!stringInputsValid || !stringResultsValid ? (
              <p className="mt-4 text-sm text-rose-300" role="alert">
                Enter finite positive values that produce finite string calculations.
              </p>
            ) : stringLinearDensity !== null &&
              stringWaveSpeed !== null &&
              stringFundamentalFrequency !== null ? (
              <>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[
                    ["Linear density μ = m/L", `${stringLinearDensity.toPrecision(4)} kg/m`],
                    ["Wave speed v = √(T/μ)", `${stringWaveSpeed.toPrecision(4)} m/s`],
                    ["Fundamental f₁ = v/(2L)", `${stringFundamentalFrequency.toPrecision(4)} Hz`],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-white/10 bg-[#10182B] p-4">
                      <p className="text-xs leading-5 text-slate-400">{label}</p>
                      <p className="mt-2 break-words font-mono text-lg font-bold text-emerald-300">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-xl bg-white/[0.04] p-4 text-sm leading-6 text-slate-400">
                  <p className="font-semibold text-slate-200">Substitution</p>
                  <p>μ = {stringMassValue} kg / {stringLengthValue} m = {stringLinearDensity.toPrecision(4)} kg/m</p>
                  <p>v = √({stringTensionValue} N / {stringLinearDensity.toPrecision(4)} kg/m) = {stringWaveSpeed.toPrecision(4)} m/s</p>
                  <p>f₁ = {stringWaveSpeed.toPrecision(4)} m/s / (2 × {stringLengthValue} m) = {stringFundamentalFrequency.toPrecision(4)} Hz</p>
                </div>
              </>
            ) : null}
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <p className="rounded-xl bg-white/[0.04] p-4 text-sm leading-6 text-slate-400">
                At fixed μ, increasing tension raises speed as √T and raises the
                fundamental frequency.
              </p>
              <p className="rounded-xl bg-white/[0.04] p-4 text-sm leading-6 text-slate-400">
                At fixed tension and length, adding string mass raises μ and
                lowers wave speed and fundamental frequency.
              </p>
              <p className="rounded-xl bg-white/[0.04] p-4 text-sm leading-6 text-slate-400">
                For fixed mass and tension, increasing L lowers μ and raises v,
                but f₁ = ½√(T/(mL)) decreases overall.
              </p>
            </div>
          </div>
        </section>

        <section id="sample-problems" className="mb-10 scroll-mt-28 rounded-3xl border border-white/10 bg-[#111A2E] p-6 md:p-8">
          <p className="text-sm font-semibold text-orange-300">SAMPLE PROBLEMS</p>
          <h2 className="mt-2 text-2xl font-bold">Use the Wave Relationships</h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <WaveWorkedExample
              example={{
                title: "Finding wave speed",
                problem: "A wave has frequency 24 Hz and wavelength 0.75 m. Find its speed.",
                given: ["f = 24 Hz = 24 s⁻¹", "λ = 0.75 m"],
                find: "Wave speed v.",
                formula: ["v = fλ"],
                substitution: ["v = (24 s⁻¹)(0.75 m)"],
                calculation: ["v = 18 m/s"],
                answer: "v = 18 m/s",
              }}
            />
            <WaveWorkedExample
              accent="violet"
              example={{
                title: "Finding period from frequency",
                problem: "A tone has frequency 440 Hz. Find the time for one cycle.",
                given: ["f = 440 Hz = 440 s⁻¹"],
                find: "Period T.",
                formula: ["T = 1/f"],
                substitution: ["T = 1/(440 s⁻¹)"],
                calculation: ["T ≈ 0.00227 s = 2.27 ms"],
                answer: "T ≈ 2.27 × 10⁻³ s per cycle",
              }}
            />
            <WaveWorkedExample
              accent="amber"
              example={{
                title: "Comparing the fundamental and higher harmonics",
                problem: "A string has L = 0.75 m and wave speed v = 120 m/s. Find the first three harmonic frequencies and compare them.",
                given: ["L = 0.75 m", "v = 120 m/s"],
                find: "f₁, f₂, and f₃ and their ratios.",
                formula: ["fₙ = nv/(2L)", "fₙ = n f₁"],
                substitution: ["f₁ = (1)(120)/(2 × 0.75)", "f₂ = 2f₁; f₃ = 3f₁"],
                calculation: ["f₁ = 80 Hz", "f₂ = 160 Hz; f₃ = 240 Hz"],
                answer: "The first three harmonics are 80 Hz, 160 Hz, and 240 Hz (1:2:3)",
              }}
            />
            <WaveWorkedExample
              accent="sky"
              example={{
                title: "Relating frequency to pitch",
                problem: "Compare pure tones at 220 Hz and 440 Hz. Which has the higher pitch, and by what frequency ratio?",
                given: ["f₁ = 220 Hz", "f₂ = 440 Hz"],
                find: "Which tone has higher pitch and the ratio f₂/f₁.",
                formula: ["Pitch increases with frequency.", "Frequency ratio = f₂/f₁"],
                substitution: ["f₂/f₁ = (440 Hz)/(220 Hz)"],
                calculation: ["f₂/f₁ = 2"],
                answer: "The 440 Hz tone has the higher pitch and twice the frequency (one octave above in the usual musical scale).",
              }}
            />
            <WaveWorkedExample
              accent="violet"
              example={{
                title: "How harmonic content affects timbre",
                problem: "A piano and a guitar play the same note with a 220 Hz fundamental. Their second and higher harmonics have different relative strengths. Explain why the notes sound different.",
                given: ["Both fundamentals: f₁ = 220 Hz", "The instruments have different harmonic mixtures and amplitude envelopes."],
                find: "Explain the difference in perceived sound quality.",
                formula: ["For harmonic components, fₙ = n f₁"],
                substitution: ["Second harmonic: f₂ = 2(220 Hz) = 440 Hz", "Third harmonic: f₃ = 3(220 Hz) = 660 Hz"],
                calculation: ["The shared fundamental sets the same nominal pitch; differing harmonic amplitudes and how they change over time produce different tone colors."],
                answer: "The piano and guitar can have the same pitch but distinct timbres because their harmonic spectra and sound envelopes differ.",
              }}
            />
          </div>
        </section>

        <section
          id="speed-of-sound"
          className="mb-10 scroll-mt-28 rounded-3xl border border-cyan-400/20 bg-[#111A2E] p-6 md:p-8"
        >
          <p className="text-sm font-semibold text-cyan-300">SPEED OF SOUND</p>
          <h2 className="mt-2 text-2xl font-bold md:text-3xl">Sound Speed in Different Media</h2>
          <p className="mt-3 max-w-4xl leading-7 text-slate-300">
            Sound speed is determined by the medium and its physical properties.
            Choose a model below and enter values in the stated units. The air
            approximations use Celsius for T; the ideal-gas expression requires
            absolute temperature in kelvin.
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <article className="rounded-2xl border border-white/10 bg-[#080D1B] p-5">
              <h3 className="font-bold text-cyan-200">Air, up to 20°C</h3>
              <p className="mt-2 font-mono text-lg text-white">v = 331.45 + 0.6T</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                T is air temperature in degrees Celsius (°C); v is sound speed
                in meters per second (m/s). Use for T ≤ 20°C.
              </p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-[#080D1B] p-5">
              <h3 className="font-bold text-cyan-200">Air, above 20°C</h3>
              <p className="mt-2 font-mono text-lg text-white">v = 331.45√(Tₖ/273)</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Tₖ is absolute air temperature in kelvin (K), found from
                Tₖ = T°C + 273.15. The temperature entered below is °C and is
                converted before using this equation.
              </p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-[#080D1B] p-5">
              <h3 className="font-bold text-cyan-200">Ideal gas</h3>
              <p className="mt-2 font-mono text-lg text-white">v = √(γRT/MW)</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                γ is the dimensionless heat-capacity ratio; R is the universal
                gas constant (J/(mol·K)); T is absolute temperature (K); MW is
                molar mass (kg/mol); v is in m/s.
              </p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-[#080D1B] p-5">
              <h3 className="font-bold text-cyan-200">Elastic medium</h3>
              <p className="mt-2 font-mono text-lg text-white">v = √(Y/ρ)</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Y is Young’s modulus (pascals, Pa = N/m²); ρ is density
                (kg/m³); v is in m/s. This approximation is for a longitudinal
                wave in an idealized elastic medium.
              </p>
            </article>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="space-y-4 rounded-2xl border border-white/10 bg-[#080D1B] p-5">
              <label htmlFor="sound-speed-method" className="block text-sm text-slate-300">
                Calculation method
                <select
                  id="sound-speed-method"
                  value={soundSpeedMethod}
                  onChange={(event) =>
                    setSoundSpeedMethod(event.target.value as SoundSpeedMethod)
                  }
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#111A2E] px-4 py-3 text-white outline-none focus:border-cyan-300"
                >
                  <option value="air-up-to-20">Air · up to 20°C</option>
                  <option value="air-above-20">Air · above 20°C</option>
                  <option value="ideal-gas">Ideal gas</option>
                  <option value="elastic-medium">Elastic medium</option>
                </select>
              </label>

              {soundSpeedMethod === "air-up-to-20" ||
              soundSpeedMethod === "air-above-20" ? (
                <label htmlFor="air-temperature" className="block text-sm text-slate-300">
                  Air temperature (°C)
                  <input
                    id="air-temperature"
                    type="number"
                    step="any"
                    value={airTemperatureC}
                    onChange={(event) => setAirTemperatureC(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#111A2E] px-4 py-3 text-white outline-none focus:border-cyan-300"
                  />
                </label>
              ) : soundSpeedMethod === "ideal-gas" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { id: "gas-gamma", label: "γ (dimensionless)", value: gasGamma, set: setGasGamma },
                    { id: "gas-constant", label: "R (J/(mol·K))", value: gasConstant, set: setGasConstant },
                    { id: "gas-molar-mass", label: "MW (kg/mol)", value: gasMolarMass, set: setGasMolarMass },
                    { id: "gas-temperature", label: "T (K, absolute)", value: gasTemperatureK, set: setGasTemperatureK },
                  ].map((input) => (
                    <label key={input.id} htmlFor={input.id} className="text-sm text-slate-300">
                      {input.label}
                      <input
                        id={input.id}
                        type="number"
                        min="0"
                        step="any"
                        value={input.value}
                        onChange={(event) => input.set(event.target.value)}
                        className="mt-2 w-full rounded-xl border border-white/10 bg-[#111A2E] px-3 py-3 text-white outline-none focus:border-cyan-300"
                      />
                    </label>
                  ))}
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { id: "young-modulus", label: "Young’s modulus Y (Pa)", value: youngModulus, set: setYoungModulus },
                    { id: "medium-density", label: "Density ρ (kg/m³)", value: mediumDensity, set: setMediumDensity },
                  ].map((input) => (
                    <label key={input.id} htmlFor={input.id} className="text-sm text-slate-300">
                      {input.label}
                      <input
                        id={input.id}
                        type="number"
                        min="0"
                        step="any"
                        value={input.value}
                        onChange={(event) => input.set(event.target.value)}
                        className="mt-2 w-full rounded-xl border border-white/10 bg-[#111A2E] px-3 py-3 text-white outline-none focus:border-cyan-300"
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="flex min-h-56 flex-col justify-center rounded-2xl border border-cyan-400/20 bg-[#080D1B] p-5 sm:p-6">
              <p className="text-sm text-slate-400">Calculated sound speed</p>
              {soundSpeedError ? (
                <p className="mt-3 text-sm leading-6 text-rose-300" role="alert">
                  {soundSpeedError}
                </p>
              ) : calculatedSoundSpeed !== null ? (
                <>
                  <p className="mt-2 break-words text-3xl font-black text-cyan-300">
                    {calculatedSoundSpeed.toFixed(2)} m/s
                  </p>
                  <div className="mt-4 rounded-xl bg-white/[0.04] p-4 text-sm leading-6 text-slate-300">
                    <p className="font-semibold text-slate-100">Substitution</p>
                    <p className="mt-1 break-words font-mono text-xs sm:text-sm">
                      {soundSpeedSubstitution}
                    </p>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </section>

        <section
          id="doppler-effect"
          className="mb-10 scroll-mt-28 rounded-3xl border border-amber-400/20 bg-[#111A2E] p-6 md:p-8"
        >
          <p className="text-sm font-semibold text-amber-300">RELATIVE MOTION</p>
          <h2 className="mt-2 text-2xl font-bold md:text-3xl">The Doppler Effect</h2>
          <p className="mt-3 max-w-4xl leading-7 text-slate-300">
            The Doppler effect is a change in observed frequency caused by motion
            between a sound source and an observer through the medium. Approaching
            motion makes wavefronts arrive more frequently (higher pitch); moving
            apart makes them arrive less frequently (lower pitch). The formula
            assumes speeds are measured relative to the medium.
          </p>
          <div className="mt-5 rounded-2xl border border-white/10 bg-[#080D1B] p-5">
            <p className="font-mono text-2xl font-black text-amber-200 sm:text-3xl">
              fₒ = fₛ[(v ± vₒ)/(v ∓ vₛ)]
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {[
                ["fₒ", "Observed frequency (Hz)"],
                ["fₛ", "Source frequency (Hz)"],
                ["vₒ", "Observer speed relative to medium (m/s)"],
                ["vₛ", "Source speed relative to medium (m/s)"],
                ["v", "Sound speed in the medium (m/s)"],
              ].map(([symbol, meaning]) => (
                <div key={symbol} className="rounded-xl bg-white/[0.04] p-3">
                  <p className="font-mono font-bold text-amber-200">{symbol}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{meaning}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <p className="rounded-xl bg-emerald-400/5 p-4 text-sm leading-6 text-slate-300">
                <strong className="text-emerald-300">Approaching:</strong> use
                v + vₒ in the numerator if the observer moves toward the source;
                use v − vₛ in the denominator if the source moves toward the
                observer. Each makes the observed frequency higher.
              </p>
              <p className="rounded-xl bg-violet-400/5 p-4 text-sm leading-6 text-slate-300">
                <strong className="text-violet-300">Moving apart:</strong> use
                v − vₒ for an observer moving away and v + vₛ for a source
                moving away. Each makes the observed frequency lower. A
                stationary observer or source has speed zero.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div className="space-y-4 rounded-2xl border border-white/10 bg-[#080D1B] p-5">
              <h3 className="font-bold text-amber-200">Interactive Doppler calculator</h3>
              {[
                {
                  id: "doppler-source-frequency",
                  label: "Source frequency fₛ (Hz)",
                  value: dopplerSourceFrequency,
                  set: setDopplerSourceFrequency,
                },
                {
                  id: "doppler-sound-speed",
                  label: "Sound speed v (m/s)",
                  value: soundSpeed,
                  set: setSoundSpeed,
                },
                {
                  id: "doppler-observer-speed",
                  label: "Observer speed vₒ (m/s)",
                  value: observerSpeed,
                  set: setObserverSpeed,
                },
                {
                  id: "doppler-source-speed",
                  label: "Source speed vₛ (m/s)",
                  value: sourceSpeed,
                  set: setSourceSpeed,
                },
              ].map((input) => (
                <label key={input.id} htmlFor={input.id} className="block text-sm text-slate-300">
                  {input.label}
                  <input
                    id={input.id}
                    type="number"
                    min="0"
                    step="any"
                    value={input.value}
                    onChange={(event) => input.set(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#111A2E] px-3 py-3 text-white outline-none focus:border-amber-300"
                  />
                </label>
              ))}
              <div className="grid gap-4 sm:grid-cols-2">
                <label htmlFor="observer-direction" className="text-sm text-slate-300">
                  Observer motion
                  <select
                    id="observer-direction"
                    value={observerDirection}
                    onChange={(event) =>
                      setObserverDirection(event.target.value as MotionDirection)
                    }
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#111A2E] px-3 py-3 text-white"
                  >
                    <option value="toward">Toward source</option>
                    <option value="away">Away from source</option>
                  </select>
                </label>
                <label htmlFor="source-direction" className="text-sm text-slate-300">
                  Source motion
                  <select
                    id="source-direction"
                    value={sourceDirection}
                    onChange={(event) =>
                      setSourceDirection(event.target.value as MotionDirection)
                    }
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#111A2E] px-3 py-3 text-white"
                  >
                    <option value="toward">Toward observer</option>
                    <option value="away">Away from observer</option>
                  </select>
                </label>
              </div>
              {!dopplerInputsValid || observedFrequency === null ? (
                <p className="text-sm leading-6 text-rose-300" role="alert">
                  Enter a positive source frequency and sound speed, and nonnegative,
                  subsonic source and observer speeds that keep the result finite.
                </p>
              ) : (
                <div className="rounded-xl border border-amber-400/15 bg-amber-400/5 p-4" aria-live="polite">
                  <p className="text-sm text-slate-400">Observed frequency fₒ</p>
                  <p className="mt-1 text-3xl font-black text-amber-200">
                    {observedFrequency.toFixed(2)} Hz
                  </p>
                  <p className="mt-3 break-words font-mono text-xs leading-6 text-slate-300 sm:text-sm">
                    {dopplerFormula}
                    <br />
                    = {sourceFrequencyValue}[( {dopplerSpeedValue} {observerDirection === "toward" ? "+" : "−"} {observerSpeedValue} )/( {dopplerSpeedValue} {sourceDirection === "toward" ? "−" : "+"} {sourceSpeedValue} )]
                    <br />
                    = {sourceFrequencyValue}({observerTerm}/{sourceTerm})
                    <br />
                    = {observedFrequency.toFixed(2)} Hz
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {[
                {
                  title: "Approaching source · stationary observer",
                  description: "A 500 Hz source approaches at 20 m/s; the observer is stationary. Take v = 343 m/s.",
                  calculation: "fₒ = 500[343/(343 − 20)] = 500(343/323) ≈ 530.96 Hz.",
                },
                {
                  title: "Receding source · stationary observer",
                  description: "A 500 Hz source moves away at 20 m/s; the observer is stationary. Take v = 343 m/s.",
                  calculation: "fₒ = 500[343/(343 + 20)] = 500(343/363) ≈ 472.45 Hz.",
                },
                {
                  title: "Approaching observer · stationary source",
                  description: "A stationary 500 Hz source is heard by an observer moving toward it at 20 m/s. Take v = 343 m/s.",
                  calculation: "fₒ = 500[(343 + 20)/343] = 500(363/343) ≈ 529.15 Hz.",
                },
              ].map((example) => (
                <article key={example.title} className="rounded-2xl border border-white/10 bg-[#080D1B] p-5">
                  <h3 className="font-bold text-amber-200">{example.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{example.description}</p>
                  <p className="mt-3 rounded-xl bg-white/[0.04] p-3 font-mono text-xs leading-6 text-slate-300 sm:text-sm">
                    {example.calculation}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="sound-pitch" className="mb-10 scroll-mt-28 rounded-3xl border border-sky-400/20 bg-[#111A2E] p-6 md:p-8">
          <h2 className="text-2xl font-bold">4. Sound characteristics</h2>
          <p className="mt-3 leading-7 text-slate-300">
            A sound is often described by its pitch, loudness, quality (timbre), and
            duration. These characteristics arise from different aspects of the
            pressure wave and how it changes over time.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                title: "Pure tone",
                range: "One frequency",
                description: "An ideal sound containing a single frequency, like a clean sine-wave tone.",
                color: "text-sky-300",
              },
              {
                title: "Infrasonic",
                range: "Below 20 Hz",
                description: "Frequencies lower than the typical lower limit of human hearing; some large animals use them.",
                color: "text-violet-300",
              },
              {
                title: "Audible (sonic)",
                range: "About 20 Hz–20 kHz",
                description: "The approximate frequency range audible to a young, healthy human; hearing varies.",
                color: "text-emerald-300",
              },
              {
                title: "Ultrasonic",
                range: "Above 20 kHz",
                description: "Frequencies above typical human hearing, used in applications such as medical imaging and sonar.",
                color: "text-amber-300",
              },
            ].map((item) => (
              <article key={item.title} className="rounded-2xl border border-white/10 bg-[#080D1B] p-5">
                <h3 className={`font-bold ${item.color}`}>{item.title}</h3>
                <p className="mt-2 font-mono text-lg font-bold text-white">{item.range}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">{item.description}</p>
              </article>
            ))}
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <article className="rounded-2xl bg-[#080D1B] p-5">
              <h3 className="font-bold text-sky-300">Pitch and frequency</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Pitch is the perception of how high or low a sound is. For a
                periodic tone, a higher fundamental frequency is heard as a
                higher pitch and a lower frequency as a lower pitch. For example,
                440 Hz is higher in pitch than 220 Hz; at the same medium and
                conditions, the higher frequency also has the shorter wavelength
                because v = fλ.
              </p>
            </article>
            <article className="rounded-2xl bg-[#080D1B] p-5">
              <h3 className="font-bold text-violet-300">Loudness and intensity</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Amplitude describes the size of the pressure variation in a sound
                wave. Greater amplitude generally means greater intensity and is
                usually perceived as louder. Intensity I is the sound power P
                carried through each unit area A perpendicular to propagation:
                I = P/A, measured in watts per square meter (W/m²). Intensity is
                measurable; loudness is the listener&apos;s perception and also
                depends on frequency, distance, and hearing sensitivity.
              </p>
            </article>
            <article className="rounded-2xl bg-[#080D1B] p-5">
              <h3 className="font-bold text-amber-300">Quality or timbre</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Timbre is the tone color that lets us distinguish instruments
                and voices even when they play the same note at the same
                fundamental frequency. A piano and a guitar playing 220 Hz share
                a fundamental, but their overtones have different relative
                strengths and their sounds build and fade differently. Those
                spectral and time-envelope differences give each instrument its
                characteristic sound.
              </p>
            </article>
            <article className="rounded-2xl bg-[#080D1B] p-5">
              <h3 className="font-bold text-emerald-300">Duration</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Duration is how long a sound remains audible, from its onset to
                its decay or stop. A brief hand clap and a sustained violin note
                can have similar pitch yet differ strongly in duration and
                overall character. The sound source and the way it is played
                determine how quickly its amplitude rises and fades.
              </p>
            </article>
          </div>
          <div className="mt-5 rounded-2xl border border-violet-400/15 bg-violet-400/5 p-5">
            <h3 className="font-bold text-violet-200">Fundamental, harmonics, and overtones</h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              The fundamental is the lowest frequency in a periodic tone. For an
              ideal string fixed at both ends, harmonics are integer multiples
              of it: fₙ = n f₁. The second harmonic is 2f₁ and the third is 3f₁.
              An overtone is any component above the fundamental: the second
              harmonic is the first overtone, and the third harmonic is the
              second overtone. In general instruments, overtones need not all be
              exact integer multiples. The mix and strength of these components
              contribute to timbre, while the fundamental chiefly determines
              pitch.
            </p>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {[
              {
                title: "Echo",
                color: "text-sky-300",
                text: "A distinct repetition of a sound after it reflects from a surface and returns after a noticeable delay. Example: shouting toward a distant cliff and hearing the words return.",
              },
              {
                title: "Reverberation",
                color: "text-violet-300",
                text: "Sound that persists and gradually fades because many reflections arrive close together and overlap. Example: a clap lingering briefly in a large empty hall.",
              },
              {
                title: "Interference",
                color: "text-amber-300",
                text: "When sound waves overlap, they superpose. In-phase waves reinforce (constructive interference); out-of-phase waves can reduce the sound (destructive interference). Example: two speakers can make some locations louder and others quieter.",
              },
            ].map((item) => (
              <article key={item.title} className="rounded-2xl border border-white/10 bg-[#080D1B] p-5">
                <h3 className={`font-bold ${item.color}`}>{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{item.text}</p>
              </article>
            ))}
          </div>
          <div className="mt-5 rounded-2xl border border-white/10 bg-[#080D1B] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sky-300">Listen to frequency and pitch</h3>
                <p className="mt-1 text-sm text-slate-400">Generate a quiet sine tone using your browser. The demo frequency is not a calibrated sound-level measurement.</p>
              </div>
              <p className="font-mono text-lg font-bold text-violet-300">{toneFrequency} Hz</p>
            </div>
            <label htmlFor="tone-frequency" className="mt-4 flex justify-between text-sm text-slate-300">
              Tone frequency <span>{toneFrequency} Hz</span>
            </label>
            <input id="tone-frequency" type="range" min="110" max="880" step="1" value={toneFrequency} onChange={(event) => changeToneFrequency(Number(event.target.value))} className="mt-2 w-full accent-violet-400" />
            <button type="button" onClick={() => changeToneFrequency(440)} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300">
              <RotateCcw size={15} /> Reset tone frequency
            </button>
            <button type="button" onClick={() => void toggleTone()} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-violet-300/30 bg-violet-300/10 px-4 py-2 font-semibold text-violet-200 transition hover:bg-violet-300/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300">
              {tonePlaying ? <><Square size={16} /> Stop tone</> : <><Volume2 size={17} /> Play tone</>}
            </button>
            {toneMessage && <p role="status" aria-live="polite" className="mt-3 text-sm text-slate-400">{toneMessage}</p>}
          </div>
        </section>

        <section id="quiz" className="scroll-mt-28 rounded-3xl border border-white/10 bg-[#111A2E] p-6 md:p-8">
          <LessonQuizEligibilityNotice
            eligibility={eligibility}
            error={eligibilityError}
            onRetry={() => void refreshEligibility()}
          />
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-emerald-300">CHECK YOUR KNOWLEDGE</p>
              <h2 className="mt-2 text-2xl font-bold md:text-3xl">
                Waves &amp; Sound · {quizAttempt.length} questions
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
            {quizAttempt.map((q, i) => (
              <LessonQuizQuestion key={q.q} number={i + 1}>
                <p className="font-semibold leading-6">{q.q}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {q.options.map((option, j) => {
                    const selected = answers[i] === j;
                    const correct = q.a === j;
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
                        aria-pressed={selected}
                        onClick={() => setAnswers((previous) => ({ ...previous, [i]: j }))}
                        className={`${QUIZ_OPTION_BASE_CLASS} ${getQuizOptionClass(optionState)}`}
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5 text-xs font-bold">
                          {String.fromCharCode(65 + j)}
                        </span>
                        <span>{option}</span>
                        {submitted && correct && (
                          <CheckCircle2 size={17} className="ml-auto shrink-0 text-emerald-300" />
                        )}
                        {submitted && selected && !correct && (
                          <XCircle size={17} className="ml-auto shrink-0 text-rose-300" />
                        )}
                      </button>
                    );
                  })}
                </div>
                {submitted && (
                  <p className="mt-4 rounded-lg bg-white/5 p-3 text-sm leading-6 text-slate-400">
                    {q.why}
                  </p>
                )}
              </LessonQuizQuestion>
            ))}
          </div>
          <div className="mt-6">
            {!submitted ? (
              <button
                type="button"
                disabled={
                  Object.keys(answers).length !== quizAttempt.length ||
                  !eligibility?.eligible ||
                  saveState === "saving"
                }
                onClick={handleSubmit}
                className={QUIZ_SUBMIT_BUTTON_CLASS}
              >
                Submit quiz <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                disabled={saveState === "saving"}
                onClick={handleTryAgain}
                className={QUIZ_RETRY_BUTTON_CLASS}
              >
                <RotateCcw size={16} /> Try again
              </button>
            )}
          </div>

          {!submitted && saveState === "error" && (
            <div
              role="alert"
              className="mt-5 rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-slate-300"
            >
              <p>{saveMessage || "Could not save your result."}</p>
              <button
                type="button"
                onClick={() => void handleRetrySave()}
                className="mt-3 rounded-lg border border-white/10 px-4 py-2 font-semibold transition hover:bg-white/5"
              >
                Retry saving
              </button>
            </div>
          )}

          {submitted && (
            <div
              className={`mt-6 rounded-xl border p-4 ${
                saveState === "saved" && passed
                  ? "border-emerald-400/20 bg-emerald-400/5"
                  : saveState === "saved"
                    ? "border-amber-400/20 bg-amber-400/5"
                    : saveState === "error"
                      ? "border-red-400/20 bg-red-400/5"
                      : "border-white/10 bg-white/[0.02]"
              }`}
              aria-live="polite"
            >
              <div className="flex items-start gap-3">
                {saveState === "saved" && passed ? (
                  <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-400" />
                ) : saveState === "error" ? (
                  <XCircle className="mt-0.5 shrink-0 text-red-400" />
                ) : (
                  <Save className="mt-0.5 shrink-0 text-sky-400" />
                )}
                <div>
                  <p className="font-semibold">
                    {saveState === "saving"
                      ? "Saving your result..."
                      : saveState === "saved" && passed
                        ? "Result saved · Module completed"
                        : saveState === "saved"
                          ? "Result saved"
                          : saveState === "error"
                            ? "Could not save result"
                                : saveState === "guest"
                                  ? "Quiz result · Not saved"
                                  : "Quiz result"}
                  </p>
                  {saveMessage && <p className="mt-1 break-words text-sm leading-6 text-slate-400">{saveMessage}</p>}
                  {saveState === "guest" && (
                    <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                      <Link className="font-semibold text-sky-300 hover:text-sky-200" href="/register">
                        Create an account
                      </Link>
                      <Link className="font-semibold text-sky-300 hover:text-sky-200" href="/login">
                        Log in
                      </Link>
                    </p>
                  )}
                </div>
              </div>
              {saveState === "error" && (
                <button onClick={() => void handleRetrySave()} className="mt-4 rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/5">Retry saving</button>
              )}
            </div>
          )}
        </section>
        <LessonNavigation
          lessonSlug="waves-sound"
          previous={{ href: "/lessons/temperature-heat", label: "Temperature & Heat" }}
          next={{ href: "/lessons/optics", label: "Optics" }}
        />
        </div>
        </div>
      </div>
    </main>
  );
}