"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, Radio, RotateCcw, Save, Square, Volume2, XCircle } from "lucide-react";
import LessonHeader from "../LessonHeader";
import LessonNavigation from "../LessonNavigation";
import LessonSidebar from "../LessonSidebar";
import LessonProgressTracker from "../LessonProgressTracker";
import LessonQuizQuestion, {
  getQuizOptionClass,
  QUIZ_OPTION_BASE_CLASS,
  QUIZ_RETRY_BUTTON_CLASS,
  QUIZ_SUBMIT_BUTTON_CLASS,
} from "../LessonQuizQuestion";

const lessonSections = [
  { id: "wave-basics", label: "Lesson Overview" },
  { id: "wave-simulator", label: "Wave simulator" },
  { id: "wave-types", label: "Wave types" },
  { id: "sample-problems", label: "Sample Problems" },
  { id: "sound-pitch", label: "Sound & pitch" },
  { id: "quiz", label: "Quiz" },
];

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
];

type SaveState = "idle" | "saving" | "saved" | "error";

export default function WavesSoundPage() {
  const [amplitude, setAmplitude] = useState(45);
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
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const score = questions.filter((q, i) => answers[i] === q.a).length;
  const answeredCount = Object.keys(answers).length;
  const wavePath = Array.from({ length: 121 }, (_, i) => {
    const x = i * 4;
    const cyclesAcrossDisplay = 4 / wavelength;
    const y = (
      90 - Math.sin((i / 120) * Math.PI * 2 * cyclesAcrossDisplay) * amplitude
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
          answers: questions.map((_, i) => answers[i] ?? -1),
          questions: questions.map((question) => ({
            question: question.q,
            choices: question.options,
            explanation: question.why,
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not save your quiz result.");
      }

      setPassed(result.passed);
      setSaveState("saved");
      setSaveMessage(
        result.passed
          ? "Great job! This module is now marked as completed on your dashboard."
          : `Your attempt was saved. You need at least ${result.passPercent}% to complete this module, so review the explanations and try again.`
      );
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
  }

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-[#080D1B] text-[#F8FAFC]">
      <LessonNavigation />
      <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] md:grid-rows-1 md:grid-cols-[250px_minmax(0,1fr)]">
        <LessonSidebar sections={lessonSections} accentClass="text-violet-300" />
        <div id="lesson-main-scroll" className="min-w-0 overflow-y-auto overscroll-contain px-4 py-6 sm:px-6 lg:px-10">
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
              <div><label htmlFor="amp" className="mb-2 flex justify-between text-sm text-slate-300">Amplitude <strong className="text-violet-300">{amplitude}%</strong></label><input id="amp" type="range" min="10" max="75" value={amplitude} onChange={e=>setAmplitude(Number(e.target.value))} className="w-full accent-violet-400"/></div>
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

        <section id="sample-problems" className="mb-10 scroll-mt-28 rounded-3xl border border-white/10 bg-[#111A2E] p-6 md:p-8">
          <p className="text-sm font-semibold text-orange-300">SAMPLE PROBLEMS</p>
          <h2 className="mt-2 text-2xl font-bold">Use the Wave Relationships</h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <article className="rounded-2xl border border-white/10 bg-[#080D1B] p-5">
              <h3 className="font-bold text-sky-300">Finding wave speed</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">A wave has frequency 24 Hz and wavelength 0.75 m. Find its speed.</p>
              <ol className="mt-3 list-inside list-decimal space-y-2 text-sm leading-6 text-slate-400">
                <li>Given: f = 24 Hz; λ = 0.75 m. Find v.</li>
                <li>Use v = fλ for a periodic wave.</li>
                <li>Substitute: v = (24 s⁻¹)(0.75 m) = 18 m/s.</li>
              </ol>
              <p className="mt-4 rounded-xl bg-emerald-400/5 p-3 text-sm font-bold text-emerald-300">Answer: 18 m/s</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-[#080D1B] p-5">
              <h3 className="font-bold text-violet-300">Finding period from frequency</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">A tone has frequency 440 Hz. Find the time for one cycle.</p>
              <ol className="mt-3 list-inside list-decimal space-y-2 text-sm leading-6 text-slate-400">
                <li>Given: f = 440 Hz. Find T.</li>
                <li>Use T = 1/f because period and frequency are reciprocals.</li>
                <li>T = 1/440 s = 0.00227 s = 2.27 ms.</li>
              </ol>
              <p className="mt-4 rounded-xl bg-emerald-400/5 p-3 text-sm font-bold text-emerald-300">Answer: 2.27 ms per cycle</p>
            </article>
          </div>
        </section>

        <section id="sound-pitch" className="mb-10 scroll-mt-28 rounded-3xl border border-sky-400/20 bg-[#111A2E] p-6 md:p-8">
          <h2 className="text-2xl font-bold">3. Sound and pitch</h2>
          <p className="mt-3 leading-7 text-slate-300">Pitch describes how high or low a sound seems and is related to frequency. Loudness is related to sound intensity and amplitude. The speed of sound depends on the medium and its conditions.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2"><div className="rounded-2xl bg-[#080D1B] p-5"><p className="font-bold text-sky-300">Higher pitch</p><p className="mt-2 text-sm text-slate-400">Higher frequency, like a whistle.</p></div><div className="rounded-2xl bg-[#080D1B] p-5"><p className="font-bold text-violet-300">Lower pitch</p><p className="mt-2 text-sm text-slate-400">Lower frequency, like a bass note.</p></div></div>
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
                Waves &amp; Sound · {questions.length} questions
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Answer every question. Your score and explanations appear after submission.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-3">
              <p className="text-sm text-slate-300">Your score</p>
              <p className="text-2xl font-black text-emerald-300">
                {submitted ? `${score} / ${questions.length}` : `${answeredCount} / ${questions.length}`}
              </p>
            </div>
          </div>
          <div className="mb-6 h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label="Quiz questions answered" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={answeredCount}>
            <div className="h-full rounded-full bg-sky-400 transition-all" style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
          </div>
          <div className="space-y-5">
            {questions.map((q, i) => (
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
                disabled={Object.keys(answers).length !== questions.length}
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
                            : "Quiz result"}
                  </p>
                  {saveMessage && <p className="mt-1 break-words text-sm leading-6 text-slate-400">{saveMessage}</p>}
                  {saveState === "saved" && (
                    <Link href="/dashboard" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-sky-300 hover:text-sky-200">View dashboard <ArrowRight size={15} /></Link>
                  )}
                </div>
              </div>
              {saveState === "error" && (
                <button onClick={() => void saveResult()} className="mt-4 rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/5">Retry saving</button>
              )}
            </div>
          )}
        </section>
        <footer className="mt-8 flex flex-wrap justify-between gap-4 border-t border-white/10 pt-6 text-sm"><Link href="/lessons/temperature-heat" className="text-sky-300 hover:text-sky-200"><ArrowLeft size={16} className="mr-2 inline"/>Previous: Temperature & Heat</Link><Link href="/dashboard" className="text-sky-300 hover:text-sky-200">All topics <ArrowRight size={16} className="ml-2 inline"/></Link></footer>
        </div>
        </div>
      </div>
    </main>
  );
}