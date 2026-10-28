"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Radio, RotateCcw, Volume2, VolumeX, XCircle } from "lucide-react";

const questions = [
  { q: "What is the unit of frequency?", options: ["Meter", "Hertz", "Second", "Decibel"], a: 1, why: "Frequency is measured in hertz (Hz), or cycles per second." },
  { q: "In a transverse wave, the disturbance moves...", options: ["Parallel to the wave's travel", "Perpendicular to the wave's travel", "In a circle only", "Not at all"], a: 1, why: "Transverse waves, like light, have a disturbance perpendicular to the direction of travel." },
  { q: "Sound is a ___ wave.", options: ["Transverse", "Longitudinal", "Electromagnetic", "Standing only"], a: 1, why: "Sound is longitudinal: particles vibrate parallel to the direction the wave travels, forming compressions and expansions." },
  { q: "Which wave requires a material medium?", options: ["Visible light", "Radio waves", "Sound waves", "X-rays"], a: 2, why: "Sound is a mechanical wave and needs a medium such as air, water, or a solid." },
  { q: "If frequency increases while wave speed stays constant, wavelength...", options: ["Increases", "Decreases", "Stays the same", "Becomes zero"], a: 1, why: "Since v = fλ, wavelength decreases when frequency increases at constant speed." },
  { q: "A wave travels at 340 m/s with a frequency of 170 Hz. What is its wavelength?", options: ["0.5 m", "2 m", "170 m", "510 m"], a: 1, why: "λ = v/f = 340/170 = 2 m." },
  { q: "A wave has frequency 500 Hz and wavelength 0.68 m. What is its speed?", options: ["340 m/s", "735 m/s", "0.00136 m/s", "500.68 m/s"], a: 0, why: "v = fλ = 500 × 0.68 = 340 m/s." },
  { q: "A 25 kHz sound is...", options: ["Infrasonic", "Audible (sonic)", "Ultrasonic", "Impossible"], a: 2, why: "Humans hear about 20 Hz to 20 kHz. Above 20 kHz is ultrasonic." },
  { q: "What is the speed of sound in air at 20 °C, using v = 331.45 + 0.6T?", options: ["331 m/s", "343 m/s", "352 m/s", "3.0 × 10⁸ m/s"], a: 1, why: "v = 331.45 + 0.6(20) ≈ 343 m/s." },
  { q: "An ambulance siren approaches you. The pitch you hear is...", options: ["Higher than the source", "Lower than the source", "The same", "Silent"], a: 0, why: "Doppler effect: an approaching source gives a higher observed frequency." },
  { q: "A wave has a frequency of 50 Hz. What is its period?", options: ["0.02 s", "0.2 s", "50 s", "2 s"], a: 0, why: "T = 1/f = 1/50 = 0.02 s." },
  { q: "Amplitude is the...", options: ["Distance between two crests", "Time for one cycle", "Maximum displacement from equilibrium", "Number of cycles per second"], a: 2, why: "Amplitude is the maximum displacement of a point on the wave from its equilibrium position." },
  { q: "An FM station broadcasts at 91.9 MHz. Radio waves travel at 3 × 10⁸ m/s. What is the distance between adjacent crests?", options: ["3.26 m", "0.326 m", "32.6 m", "0.00326 m"], a: 0, why: "λ = v/f = (3 × 10⁸)/(91.9 × 10⁶) ≈ 3.26 m." },
  { q: "A guitar string has tension 226 N, length 0.628 m and mass 0.208 g. What is the wave speed on it?", options: ["68 m/s", "340 m/s", "826 m/s", "1090 m/s"], a: 2, why: "μ = 0.000208/0.628 ≈ 3.31 × 10⁻⁴ kg/m, so v = √(226/3.31 × 10⁻⁴) ≈ 826 m/s." },
  { q: "Pitch is mainly related to a sound's...", options: ["Amplitude", "Frequency", "Speed", "Timbre"], a: 1, why: "Pitch is the perception of how high or low a sound is, and it is mainly set by frequency." },
  { q: "Loudness depends mainly on a sound wave's...", options: ["Frequency", "Wavelength", "Amplitude", "Medium color"], a: 2, why: "A larger amplitude carries more intensity and is heard as louder." },
  { q: "Two instruments play the same note at the same loudness but sound different. This difference is called...", options: ["Pitch", "Timbre (quality)", "Intensity", "Reverberation"], a: 1, why: "Timbre, or tone color, lets you tell sounds apart even when pitch and loudness match." },
  { q: "The speed of sound in air depends mainly on...", options: ["Frequency", "Wavelength", "Temperature", "Loudness"], a: 2, why: "Sound speed in air depends on temperature, not on frequency or wavelength." },
  { q: "A 415 Hz train horn approaches you at 44.7 m/s (speed of sound 343 m/s). What frequency do you hear?", options: ["367 Hz", "415 Hz", "477 Hz", "523 Hz"], a: 2, why: "f₀ = fₛ·v/(v − vₛ) = 415 × 343/(343 − 44.7) ≈ 477 Hz." },
  { q: "The same train horn (415 Hz) now moves away from you at 44.7 m/s. What frequency do you hear?", options: ["367 Hz", "415 Hz", "477 Hz", "343 Hz"], a: 0, why: "f₀ = fₛ·v/(v + vₛ) = 415 × 343/(343 + 44.7) ≈ 367 Hz." },
];

function band(f: number) {
  if (f < 20) return "Infrasonic (too low to hear)";
  if (f <= 20000) return "Sonic (audible)";
  return "Ultrasonic (too high to hear)";
}

export default function WavesSoundPage() {
  const [amplitude, setAmplitude] = useState(45);
  const [frequency, setFrequency] = useState(2);
  const [wavelength, setWavelength] = useState(2.5);
  const [phase, setPhase] = useState(0);
  const [tone, setTone] = useState(440);
  const [playing, setPlaying] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);

  const speed = frequency * wavelength;
  const score = questions.filter((q, i) => answers[i] === q.a).length;

  // Animated traveling wave (slowed down), respects reduced-motion
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      setPhase(((now - start) / 1000) * frequency * 0.4);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [frequency]);

  // Live pitch change while the tone is playing
  useEffect(() => {
    if (oscRef.current && ctxRef.current) oscRef.current.frequency.setValueAtTime(tone, ctxRef.current.currentTime);
  }, [tone]);

  const stopTone = () => {
    try { oscRef.current?.stop(); } catch {}
    oscRef.current = null;
    setPlaying(false);
  };
  useEffect(() => () => { try { oscRef.current?.stop(); ctxRef.current?.close(); } catch {} }, []);

  const toggleTone = () => {
    if (playing) return stopTone();
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    ctxRef.current = ctxRef.current ?? new Ctx();
    const osc = ctxRef.current.createOscillator();
    const gain = ctxRef.current.createGain();
    osc.type = "sine";
    osc.frequency.value = tone;
    gain.gain.value = 0.08; // keep it quiet
    osc.connect(gain).connect(ctxRef.current.destination);
    osc.start();
    oscRef.current = osc;
    setPlaying(true);
  };

  // x covers 10 m across 480 px; y = A sin(2π(x/λ − ft))
  const wavePath = Array.from({ length: 161 }, (_, i) => {
    const xm = (i / 160) * 10;
    const y = 90 - Math.sin(2 * Math.PI * (xm / wavelength - phase)) * amplitude;
    return `${i === 0 ? "M" : "L"} ${(i / 160) * 480} ${y.toFixed(1)}`;
  }).join(" ");
  const tonePath = Array.from({ length: 161 }, (_, i) => {
    const cycles = 2 + Math.log2(tone / 100) * 3; // visual only, grows with pitch
    return `${i === 0 ? "M" : "L"} ${(i / 160) * 480} ${(40 - Math.sin((i / 160) * Math.PI * 2 * cycles) * 28).toFixed(1)}`;
  }).join(" ");

  return (
    <main className="min-h-screen bg-[#080D1B] text-[#F8FAFC]">
      <nav className="sticky top-0 z-30 border-b border-white/10 bg-[#080D1B]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link href="/" className="text-xl font-black">Calph<span className="text-sky-400">++</span></Link>
          <Link href="/#topics" className="flex items-center gap-2 text-sm text-slate-300 hover:text-sky-400"><ArrowLeft size={16} /> All topics</Link>
        </div>
      </nav>
      <div className="mx-auto max-w-7xl px-5 py-10 md:py-16">
        <header className="mb-12">
          <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-violet-300"><Radio size={18} /> PHYSICS MODULE 04</p>
          <h1 className="text-4xl font-black sm:text-6xl">Waves <span className="text-violet-300">& Sound</span></h1>
          <p className="mt-5 max-w-3xl leading-7 text-slate-400">Explore wave properties, change a wave and watch its speed update, then hear how frequency becomes pitch.</p>
        </header>

        <section className="mb-10 grid gap-4 md:grid-cols-4">
          {[["v = fλ", "Wave speed"], ["f = 1/T", "Frequency and period"], ["v = 331.45 + 0.6T", "Speed of sound in air (°C)"], ["f₀ = fₛ (v ± vₒ)/(v ∓ vₛ)", "Doppler effect"]].map(([v, l]) => (
            <div key={l} className="rounded-2xl border border-white/10 bg-[#111A2E] p-6"><p className="text-sm text-slate-400">{l}</p><p className="mt-3 text-xl font-bold text-violet-300">{v}</p></div>
          ))}
        </section>

        <section className="mb-10 grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-white/10 bg-[#111A2E] p-6 md:p-8">
            <h2 className="text-2xl font-bold">Wave basics</h2>
            <div className="mt-5 space-y-4 leading-7 text-slate-300">
              <p><strong className="text-white">Wave:</strong> A disturbance that travels through matter or space and carries energy.</p>
              <p><strong className="text-white">Transverse:</strong> The disturbance is perpendicular to the direction of travel, like light or a shaken rope.</p>
              <p><strong className="text-white">Longitudinal:</strong> The disturbance is parallel to the direction of travel. Sound is longitudinal, made of compressions and expansions.</p>
              <p><strong className="text-white">Amplitude (A):</strong> Maximum displacement from equilibrium. For sound, greater amplitude generally means louder.</p>
              <p><strong className="text-white">Wavelength (λ):</strong> Length of one cycle, in meters.</p>
              <p><strong className="text-white">Period (T) and frequency (f):</strong> T is the time for one cycle; f is cycles per second (Hz). They are reciprocals.</p>
              <p><strong className="text-white">Sound:</strong> Needs a medium (gas, liquid, or solid) and cannot travel through a vacuum.</p>
            </div>
          </article>

          <article className="rounded-3xl border border-white/10 bg-[#111A2E] p-6 md:p-8">
            <h2 className="text-2xl font-bold">Wave simulator</h2>
            <p className="mt-3 leading-7 text-slate-400">Change amplitude, frequency, and wavelength. The motion is slowed down so you can see it. This is a visual model, not a measured signal.</p>
            <div className="mt-6 rounded-2xl border border-white/10 bg-[#080D1B] p-3">
              <svg viewBox="0 0 480 180" className="w-full" role="img" aria-label="Traveling wave with adjustable amplitude, frequency and wavelength">
                {[30, 60, 90, 120, 150].map(y => <line key={y} x1="0" x2="480" y1={y} y2={y} stroke="#334155" strokeWidth="1" strokeDasharray="4 6" />)}
                <line x1="0" x2="480" y1="90" y2="90" stroke="#64748B" />
                <path d={wavePath} fill="none" stroke="#A78BFA" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
            <div className="mt-6 space-y-5">
              <div><label htmlFor="amp" className="mb-2 flex justify-between text-sm text-slate-300">Amplitude <strong className="text-violet-300">{amplitude}%</strong></label><input id="amp" type="range" min="10" max="75" value={amplitude} onChange={e => setAmplitude(Number(e.target.value))} className="w-full accent-violet-400" /></div>
              <div><label htmlFor="freq" className="mb-2 flex justify-between text-sm text-slate-300">Frequency <strong className="text-violet-300">{frequency} Hz</strong></label><input id="freq" type="range" min="1" max="8" step="1" value={frequency} onChange={e => setFrequency(Number(e.target.value))} className="w-full accent-violet-400" /></div>
              <div><label htmlFor="wl" className="mb-2 flex justify-between text-sm text-slate-300">Wavelength <strong className="text-violet-300">{wavelength.toFixed(1)} m</strong></label><input id="wl" type="range" min="0.5" max="5" step="0.1" value={wavelength} onChange={e => setWavelength(Number(e.target.value))} className="w-full accent-violet-400" /></div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <p className="rounded-xl bg-white/5 p-4 text-slate-300">Period T = 1/f<br /><strong className="text-violet-300">{(1 / frequency).toFixed(2)} s</strong></p>
                <p className="rounded-xl bg-white/5 p-4 text-slate-300">Speed v = fλ<br /><strong className="text-violet-300">{speed.toFixed(2)} m/s</strong></p>
              </div>
              <p className="rounded-xl bg-white/5 p-4 text-sm leading-6 text-slate-400">Try this: raise the frequency without changing the wavelength. The speed goes up. In a real medium the speed is fixed, so a higher frequency forces a shorter wavelength.</p>
            </div>
          </article>
        </section>

        <section className="mb-10 rounded-3xl border border-sky-400/20 bg-[#111A2E] p-6 md:p-8">
          <h2 className="text-2xl font-bold">Sound frequency and pitch</h2>
          <p className="mt-3 max-w-3xl leading-7 text-slate-300">Pitch is how high or low a sound seems, and it follows frequency. Loudness follows amplitude and intensity. Press play and drag the slider to hear the pitch change. Keep your volume low.</p>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl bg-[#080D1B] p-5">
              <svg viewBox="0 0 480 80" className="w-full" role="img" aria-label="Tone waveform that gets denser as frequency rises"><path d={tonePath} fill="none" stroke="#7DD3FC" strokeWidth="2.5" strokeLinecap="round" /></svg>
              <p className="mt-2 text-sm text-slate-400">Display only: more cycles shown means higher frequency.</p>
            </div>
            <div className="space-y-4">
              <div><label htmlFor="tone" className="mb-2 flex justify-between text-sm text-slate-300">Tone frequency <strong className="text-sky-300">{tone} Hz</strong></label><input id="tone" type="range" min="100" max="2000" step="10" value={tone} onChange={e => setTone(Number(e.target.value))} className="w-full accent-sky-400" /></div>
              <div className="flex flex-wrap gap-2">
                {[["Low (130 Hz)", 130], ["C4 (262 Hz)", 262], ["A4 (440 Hz)", 440], ["Whistle (1800 Hz)", 1800]].map(([l, f]) => <button key={l} onClick={() => setTone(f as number)} className="rounded-lg border border-white/15 px-3 py-2 text-sm hover:border-sky-300/60">{l}</button>)}
              </div>
              <button onClick={toggleTone} className="flex items-center gap-2 rounded-xl bg-sky-300 px-5 py-3 font-bold text-slate-950">{playing ? <VolumeX size={18} /> : <Volume2 size={18} />}{playing ? "Stop tone" : "Play tone"}</button>
              <p className="text-sm text-slate-400">{band(tone)}. Humans hear roughly 20 Hz to 20 kHz; below is infrasonic and above is ultrasonic.</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#111A2E] p-6 md:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-semibold text-emerald-300">CHECK YOUR KNOWLEDGE</p><h2 className="mt-2 text-2xl font-bold">Waves & Sound Quiz</h2></div>{submitted && <p className="text-xl font-black text-emerald-300">{score} / {questions.length}</p>}</div>
          <div className="space-y-6">{questions.map((q, i) => (
            <div key={q.q} className="rounded-2xl border border-white/10 bg-[#080D1B] p-5">
              <p className="font-semibold">{i + 1}. {q.q}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">{q.options.map((o, j) => {
                const selected = answers[i] === j; const correct = q.a === j;
                return <button key={o} disabled={submitted} onClick={() => setAnswers(p => ({ ...p, [i]: j }))} className={`rounded-xl border p-4 text-left text-sm transition ${submitted && correct ? "border-emerald-400 bg-emerald-400/10" : submitted && selected ? "border-rose-400 bg-rose-400/10" : selected ? "border-violet-300 bg-violet-300/10" : "border-white/10 hover:border-violet-300/50"}`}>{String.fromCharCode(65 + j)}. {o} {submitted && correct && <CheckCircle2 size={16} className="ml-2 inline text-emerald-300" />}{submitted && selected && !correct && <XCircle size={16} className="ml-2 inline text-rose-300" />}</button>;
              })}</div>
              {submitted && <p className="mt-4 text-sm leading-6 text-slate-400">{q.why}</p>}
            </div>))}
          </div>
          <div className="mt-6">{!submitted
            ? <button disabled={Object.keys(answers).length !== questions.length} onClick={() => setSubmitted(true)} className="rounded-xl bg-violet-300 px-5 py-3 font-bold text-slate-950 disabled:opacity-40">Submit quiz <ArrowRight size={16} className="inline" /></button>
            : <button onClick={() => { setAnswers({}); setSubmitted(false); }} className="rounded-xl border border-white/15 px-5 py-3 font-semibold"><RotateCcw size={16} className="mr-2 inline" />Try again</button>}</div>
        </section>

        <footer className="mt-8 flex flex-wrap justify-between gap-4 border-t border-white/10 pt-6 text-sm">
          <Link href="/lessons/temperature-heat" className="text-sky-300 hover:text-sky-200"><ArrowLeft size={16} className="mr-2 inline" />Previous: Temperature & Heat</Link>
          <Link href="/#topics" className="text-sky-300 hover:text-sky-200">All topics <ArrowRight size={16} className="ml-2 inline" /></Link>
        </footer>
      </div>
    </main>
  );
}