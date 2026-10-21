"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, Radio, RotateCcw, Waves, XCircle } from "lucide-react";

const questions = [
  { q: "What is the unit of frequency?", options: ["Meter", "Hertz", "Second", "Decibel"], a: 1, why: "Frequency is measured in hertz (Hz), or cycles per second." },
  { q: "If frequency increases while wave speed stays constant, wavelength...", options: ["Increases", "Decreases", "Stays the same", "Becomes zero"], a: 1, why: "Since v = fλ, wavelength decreases when frequency increases at constant speed." },
  { q: "Which wave requires a material medium?", options: ["Visible light", "Radio waves", "Sound waves", "X-rays"], a: 2, why: "Sound is a mechanical wave and needs a medium such as air, water, or a solid." },
  { q: "What does amplitude relate to in a sound wave?", options: ["Loudness", "Pitch only", "Wave speed only", "Wavelength only"], a: 0, why: "Greater sound-wave amplitude generally corresponds to greater sound intensity and perceived loudness." },
  { q: "A wave travels at 340 m/s with a frequency of 170 Hz. What is its wavelength?", options: ["0.5 m", "2 m", "170 m", "510 m"], a: 1, why: "λ = v/f = 340/170 = 2 m." },
];

export default function WavesSoundPage() {
  const [amplitude, setAmplitude] = useState(45);
  const [frequency, setFrequency] = useState(3);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const score = questions.filter((q, i) => answers[i] === q.a).length;
  const wavePath = Array.from({ length: 121 }, (_, i) => {
    const x = i * 4;
    const y = 90 - Math.sin((i / 120) * Math.PI * 2 * frequency) * amplitude;
    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
  }).join(" ");

  return (
    <main className="min-h-screen bg-[#080D1B] text-[#F8FAFC]">
      <nav className="sticky top-0 z-30 border-b border-white/10 bg-[#080D1B]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link href="/" className="text-xl font-black">Calph<span className="text-sky-400">++</span></Link>
          <Link href="/#topics" className="flex items-center gap-2 text-sm text-slate-300 hover:text-sky-400"><ArrowLeft size={16}/> All topics</Link>
        </div>
      </nav>
      <div className="mx-auto max-w-7xl px-5 py-10 md:py-16">
        <header className="mb-12">
          <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-violet-300"><Radio size={18}/> PHYSICS MODULE 04</p>
          <h1 className="text-4xl font-black sm:text-6xl">Waves <span className="text-violet-300">& Sound</span></h1>
          <p className="mt-5 max-w-3xl leading-7 text-slate-400">Explore wave properties, see how amplitude and frequency change a wave, and connect sound to everyday life.</p>
        </header>

        <section className="mb-10 grid gap-4 md:grid-cols-3">
          {[["v = fλ","Wave equation"],["f = 1/T","Frequency and period"],["Hz","Frequency unit"]].map(([v,l]) => <div key={l} className="rounded-2xl border border-white/10 bg-[#111A2E] p-6"><p className="text-sm text-slate-400">{l}</p><p className="mt-3 text-2xl font-bold text-violet-300">{v}</p></div>)}
        </section>

        <section className="mb-10 grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-white/10 bg-[#111A2E] p-6 md:p-8">
            <h2 className="text-2xl font-bold">1. Wave basics</h2>
            <div className="mt-5 space-y-4 leading-7 text-slate-300">
              <p><strong className="text-white">Amplitude:</strong> Maximum displacement from equilibrium; for sound, greater amplitude generally means louder sound.</p>
              <p><strong className="text-white">Wavelength (λ):</strong> Distance between matching points on consecutive waves.</p>
              <p><strong className="text-white">Frequency (f):</strong> Number of cycles each second, measured in hertz (Hz).</p>
              <p><strong className="text-white">Period (T):</strong> Time for one cycle. Frequency and period are reciprocals.</p>
              <p><strong className="text-white">Sound:</strong> A mechanical longitudinal wave. It needs a medium and cannot travel through a vacuum.</p>
            </div>
          </article>
          <article className="rounded-3xl border border-white/10 bg-[#111A2E] p-6 md:p-8">
            <h2 className="text-2xl font-bold">2. Wave simulator</h2>
            <p className="mt-3 leading-7 text-slate-400">Adjust amplitude and frequency to see the wave change. This is a visual model, not a measured sound signal.</p>
            <div className="mt-6 rounded-2xl border border-white/10 bg-[#080D1B] p-3">
              <svg viewBox="0 0 480 180" className="w-full" role="img" aria-label="Animated wave with adjustable amplitude and frequency">
                {[30,60,90,120,150].map(y => <line key={y} x1="0" x2="480" y1={y} y2={y} stroke="#334155" strokeWidth="1" strokeDasharray="4 6"/>)}
                <line x1="0" x2="480" y1="90" y2="90" stroke="#64748B"/>
                <motion.path d={wavePath} fill="none" stroke="#A78BFA" strokeWidth="3" strokeLinecap="round" animate={{ opacity: [0.75,1,0.75] }} transition={{ duration: 1.2, repeat: Infinity }}/>
              </svg>
            </div>
            <div className="mt-6 space-y-5">
              <div><label htmlFor="amp" className="mb-2 flex justify-between text-sm text-slate-300">Amplitude <strong className="text-violet-300">{amplitude}%</strong></label><input id="amp" type="range" min="10" max="75" value={amplitude} onChange={e=>setAmplitude(Number(e.target.value))} className="w-full accent-violet-400"/></div>
              <div><label htmlFor="freq" className="mb-2 flex justify-between text-sm text-slate-300">Frequency <strong className="text-violet-300">{frequency} cycles</strong></label><input id="freq" type="range" min="1" max="8" value={frequency} onChange={e=>setFrequency(Number(e.target.value))} className="w-full accent-violet-400"/></div>
              <p className="rounded-xl bg-white/5 p-4 text-sm leading-6 text-slate-400">Higher frequency means more cycles over the same distance. In a given medium, if wave speed is constant, a higher frequency means a shorter wavelength.</p>
            </div>
          </article>
        </section>

        <section className="mb-10 rounded-3xl border border-sky-400/20 bg-[#111A2E] p-6 md:p-8">
          <h2 className="text-2xl font-bold">3. Sound and pitch</h2>
          <p className="mt-3 leading-7 text-slate-300">Pitch describes how high or low a sound seems and is related to frequency. Loudness is related to sound intensity and amplitude. The speed of sound depends on the medium and its conditions.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2"><div className="rounded-2xl bg-[#080D1B] p-5"><p className="font-bold text-sky-300">Higher pitch</p><p className="mt-2 text-sm text-slate-400">Higher frequency, like a whistle.</p></div><div className="rounded-2xl bg-[#080D1B] p-5"><p className="font-bold text-violet-300">Lower pitch</p><p className="mt-2 text-sm text-slate-400">Lower frequency, like a bass note.</p></div></div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#111A2E] p-6 md:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-semibold text-emerald-300">CHECK YOUR KNOWLEDGE</p><h2 className="mt-2 text-2xl font-bold">Waves & Sound Quiz</h2></div>{submitted && <p className="text-xl font-black text-emerald-300">{score} / {questions.length}</p>}</div>
          <div className="space-y-6">{questions.map((q,i)=><div key={q.q} className="rounded-2xl border border-white/10 bg-[#080D1B] p-5"><p className="font-semibold">{i+1}. {q.q}</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{q.options.map((o,j)=>{const selected=answers[i]===j;const correct=q.a===j;return <button key={o} disabled={submitted} onClick={()=>setAnswers(p=>({...p,[i]:j}))} className={`rounded-xl border p-4 text-left text-sm transition ${submitted&&correct?"border-emerald-400 bg-emerald-400/10":submitted&&selected?"border-rose-400 bg-rose-400/10":selected?"border-violet-300 bg-violet-300/10":"border-white/10 hover:border-violet-300/50"}`}>{String.fromCharCode(65+j)}. {o} {submitted&&correct&&<CheckCircle2 size={16} className="ml-2 inline text-emerald-300"/>}{submitted&&selected&&!correct&&<XCircle size={16} className="ml-2 inline text-rose-300"/>}</button>})}</div>{submitted&&<p className="mt-4 text-sm leading-6 text-slate-400">{q.why}</p>}</div>)}</div>
          <div className="mt-6">{!submitted?<button disabled={Object.keys(answers).length!==questions.length} onClick={()=>setSubmitted(true)} className="rounded-xl bg-violet-300 px-5 py-3 font-bold text-slate-950 disabled:opacity-40">Submit quiz <ArrowRight size={16} className="inline"/></button>:<button onClick={()=>{setAnswers({});setSubmitted(false)}} className="rounded-xl border border-white/15 px-5 py-3 font-semibold"><RotateCcw size={16} className="mr-2 inline"/>Try again</button>}</div>
        </section>
        <footer className="mt-8 flex flex-wrap justify-between gap-4 border-t border-white/10 pt-6 text-sm"><Link href="/lessons/temperature-heat" className="text-sky-300 hover:text-sky-200"><ArrowLeft size={16} className="mr-2 inline"/>Previous: Temperature & Heat</Link><Link href="/#topics" className="text-sky-300 hover:text-sky-200">All topics <ArrowRight size={16} className="ml-2 inline"/></Link></footer>
      </div>
    </main>
  );
}
