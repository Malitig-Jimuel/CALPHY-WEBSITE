"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, Radio, RotateCcw, Save, Square, Volume2, XCircle } from "lucide-react";
import LessonHeader from "../LessonHeader";
import LessonProgressTracker from "../LessonProgressTracker";
import LessonQuizQuestion, {
  getQuizOptionClass,
  QUIZ_OPTION_BASE_CLASS,
  QUIZ_RETRY_BUTTON_CLASS,
  QUIZ_SUBMIT_BUTTON_CLASS,
} from "../LessonQuizQuestion";
import { useShuffledQuestionOrder } from "../quizRandomization";

const questions = [
  { q: "What is the unit of frequency?", options: ["Meter", "Hertz", "Second", "Decibel"], a: 1, why: "Frequency is measured in hertz (Hz), or cycles per second." },
  { q: "If frequency increases while wave speed stays constant, wavelength...", options: ["Increases", "Decreases", "Stays the same", "Becomes zero"], a: 1, why: "Since v = fλ, wavelength decreases when frequency increases at constant speed." },
  { q: "Which wave requires a material medium?", options: ["Visible light", "Radio waves", "Sound waves", "X-rays"], a: 2, why: "Sound is a mechanical wave and needs a medium such as air, water, or a solid." },
  { q: "What does amplitude relate to in a sound wave?", options: ["Loudness", "Pitch only", "Wave speed only", "Wavelength only"], a: 0, why: "Greater sound-wave amplitude generally corresponds to greater sound intensity and perceived loudness." },
  { q: "A wave travels at 340 m/s with a frequency of 170 Hz. What is its wavelength?", options: ["0.5 m", "2 m", "170 m", "510 m"], a: 1, why: "λ = v/f = 340/170 = 2 m." },
  { q: "Which statement correctly describes a transverse wave?", options: ["Its particles oscillate parallel to propagation", "It can only travel in solids", "Its particles oscillate perpendicular to propagation", "It has no wavelength"], a: 2, why: "In a transverse wave, the oscillation is perpendicular to the direction the wave propagates. Electromagnetic waves are transverse." },
  { q: "A periodic wave has frequency 50 Hz. What is its period?", options: ["50 s", "25 s", "0.5 s", "0.020 s"], a: 3, why: "T = 1/f = 1/50 s = 0.020 s." },
  { q: "A wave travels at 24 m/s and has a frequency of 6 Hz. What is its wavelength?", options: ["4 m", "18 m", "30 m", "0.25 m"], a: 0, why: "λ = v/f = 24 m/s ÷ 6 Hz = 4 m." },
  { q: "What is the amplitude of an oscillating wave?", options: ["Distance traveled in one period", "Number of cycles per second", "Maximum displacement from equilibrium", "Speed of propagation"], a: 2, why: "Amplitude is the maximum displacement of the medium or field from its equilibrium value." },
  { q: "The perceived pitch of a pure tone is most directly associated with its…", options: ["amplitude", "wavelength only", "intensity", "frequency"], a: 3, why: "Pitch is primarily associated with frequency: a higher frequency is heard as a higher pitch." },
  { q: "What is the wavelength of a wave?", options: ["The time for one cycle", "The distance between successive points in the same phase, such as crest to crest", "The maximum displacement from equilibrium", "The number of cycles per second"], a: 1, why: "Wavelength is the distance between successive points in the same phase, such as two neighboring crests." },
  { q: "A wave has a frequency of 5 Hz and a wavelength of 2 m. What is its speed?", options: ["2.5 m/s", "7 m/s", "10 m/s", "20 m/s"], a: 2, why: "Using v = fλ, v = (5 Hz)(2 m) = 10 m/s." },
  { q: "Which change makes a sound louder, without necessarily changing its pitch?", options: ["Increasing its amplitude", "Increasing its wavelength", "Decreasing its frequency", "Changing its direction"], a: 0, why: "Greater amplitude corresponds to greater sound intensity and is perceived as greater loudness; pitch is associated with frequency." },
  { q: "A listener hears a higher-pitched tone. Which wave property is higher?", options: ["Amplitude", "Frequency", "Wave speed in every medium", "Distance traveled"], a: 1, why: "A higher pitch corresponds to a higher frequency." },
  { q: "Sound enters a different medium. Which property remains the same at the boundary?", options: ["Wave speed", "Wavelength", "Frequency", "Amplitude"], a: 2, why: "The source sets the frequency, which stays constant as the wave crosses a boundary. Speed and wavelength can change." },
  { q: "An echo is produced when sound waves…", options: ["are absorbed by a surface", "change into light", "stop vibrating", "reflect from a surface"], a: 3, why: "An echo is reflected sound that returns to the listener after bouncing off a surface." },
  { q: "In which material does sound generally travel fastest?", options: ["A vacuum", "A solid", "A gas", "It travels at the same speed in all materials"], a: 1, why: "Sound generally travels fastest through solids, where particles are closely coupled. It cannot travel through a vacuum." },
  { q: "Which unit is commonly used to express sound level?", options: ["Decibel (dB)", "Hertz (Hz)", "Meter (m)", "Second (s)"], a: 0, why: "Sound level is commonly expressed in decibels (dB); frequency is measured in hertz." },
  { q: "Resonance occurs when a periodic driving frequency is close to an object's…", options: ["maximum displacement", "wave speed", "natural frequency", "wavelength"], a: 2, why: "Resonance produces a large response when the driving frequency matches or is close to the system's natural frequency." },
  { q: "Sound traveling through air is primarily which type of wave?", options: ["Transverse electromagnetic", "Transverse mechanical", "Longitudinal electromagnetic", "Longitudinal mechanical"], a: 3, why: "Sound in air is a longitudinal mechanical wave: air particles oscillate parallel to the direction the wave travels." },
];
const quizOptionCounts = questions.map((question) => question.options.length);

type SaveState = "idle" | "saving" | "saved" | "guest" | "error";

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
  const [amplitude, setAmplitude] = useState(0.45);
  const [frequency, setFrequency] = useState(3);
  const [wavelength, setWavelength] = useState(2);
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
  const wavePath = Array.from({ length: 121 }, (_, i) => {
    const x = i * 4;
    const cyclesAcrossDisplay = 4 / wavelength;
    const y = (
      90 - Math.sin((i / 120) * Math.PI * 2 * cyclesAcrossDisplay) * amplitude * 100
    ).toFixed(2);
    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
  }).join(" ");
  const waveSpeed = frequency * wavelength;

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

  async function saveResult() {
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
    }
  }

  function handleSubmit() {
    setSubmitted(true);
    void saveResult();
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
            <p className="mt-3 leading-7 text-slate-400">Adjust amplitude, frequency, and wavelength. The display spans 4 m; speed is calculated from v = fλ, so changing frequency or wavelength independently also changes the modeled speed. This is a visual model, not a measured sound signal.</p>
            <div className="mt-6 rounded-2xl border border-white/10 bg-[#080D1B] p-3">
              <svg viewBox="0 0 480 180" className="w-full" role="img" aria-label="Animated wave with adjustable amplitude and frequency">
                {[30,60,90,120,150].map(y => <line key={y} x1="0" x2="480" y1={y} y2={y} stroke="#334155" strokeWidth="1" strokeDasharray="4 6"/>)}
                <line x1="0" x2="480" y1="90" y2="90" stroke="#64748B"/>
                <motion.path d={wavePath} fill="none" stroke="#A78BFA" strokeWidth="3" strokeLinecap="round" animate={{ opacity: [0.75,1,0.75] }} transition={{ duration: 1.2, repeat: Infinity }}/>
              </svg>
            </div>
            <div className="mt-6 space-y-5">
              <div><label htmlFor="amp" className="mb-2 flex justify-between text-sm text-slate-300">Amplitude A <strong className="text-violet-300">{amplitude.toFixed(2)} m</strong></label><input id="amp" type="range" min="0.10" max="0.75" step="0.05" value={amplitude} onChange={e=>setAmplitude(Number(e.target.value))} className="w-full accent-violet-400"/></div>
              <div><label htmlFor="freq" className="mb-2 flex justify-between text-sm text-slate-300">Frequency f <strong className="text-violet-300">{frequency} Hz</strong></label><input id="freq" type="range" min="1" max="8" value={frequency} onChange={e=>setFrequency(Number(e.target.value))} className="w-full accent-violet-400"/></div>
              <div><label htmlFor="wavelength" className="mb-2 flex justify-between text-sm text-slate-300">Wavelength λ <strong className="text-violet-300">{wavelength.toFixed(1)} m</strong></label><input id="wavelength" type="range" min="0.5" max="4" step="0.1" value={wavelength} onChange={e=>setWavelength(Number(e.target.value))} className="w-full accent-violet-400"/></div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-[#10182B] p-3">
                  <p className="text-xs text-slate-500">Wave speed v = fλ</p>
                  <p className="mt-1 font-mono text-sm font-bold text-emerald-300">{waveSpeed.toFixed(1)} m/s</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#10182B] p-3">
                  <p className="text-xs text-slate-500">Period T = 1/f</p>
                  <p className="mt-1 font-mono text-sm font-bold text-emerald-300">{(1 / frequency).toFixed(3)} s</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#10182B] p-3">
                  <p className="text-xs text-slate-500">Wavelength</p>
                  <p className="mt-1 font-mono text-sm font-bold text-emerald-300">{wavelength.toFixed(1)} m</p>
                </div>
              </div>
              <p className="rounded-xl bg-white/5 p-4 text-sm leading-6 text-slate-400">For waves traveling in the same medium at fixed speed, increasing frequency requires a shorter wavelength. Amplitude changes the maximum displacement, not the wave speed in this idealized model.</p>
              <button type="button" onClick={() => { setAmplitude(0.45); setFrequency(3); setWavelength(2); }} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300">
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

        <section id="sound-pitch" className="mb-10 scroll-mt-28 rounded-3xl border border-sky-400/20 bg-[#111A2E] p-6 md:p-8">
          <h2 className="text-2xl font-bold">4. Sound characteristics</h2>
          <p className="mt-3 leading-7 text-slate-300">
            A sound is often described by its pitch, loudness, quality (timbre), and
            duration. These characteristics arise from different aspects of the
            pressure wave and how it changes over time.
          </p>
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
                wave. Greater amplitude generally means greater sound intensity
                (power carried per unit area) and is usually perceived as louder.
                Intensity is a measurable physical quantity; loudness is the
                listener&apos;s perception and also depends on frequency, distance,
                and hearing sensitivity.
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
                disabled={Object.keys(answers).length !== quizAttempt.length}
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
                <button onClick={() => void saveResult()} className="mt-4 rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/5">Retry saving</button>
              )}
            </div>
          )}
        </section>
        <footer className="mt-8 flex flex-wrap justify-between gap-4 border-t border-white/10 pt-6 text-sm"><Link href="/lessons/temperature-heat" className="text-sky-300 hover:text-sky-200"><ArrowLeft size={16} className="mr-2 inline"/>Previous: Temperature & Heat</Link></footer>
        </div>
        </div>
      </div>
    </main>
  );
}