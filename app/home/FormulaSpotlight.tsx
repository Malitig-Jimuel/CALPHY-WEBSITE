"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ChevronDown, Lightbulb } from "lucide-react";

export type SpotlightFormula = {
  title: string;
  formula: string;
  meaning: string;
  example: string;
  variables: string;
  units: string;
  application: string;
  workedExample: {
    given: string;
    calculation: string;
    answer: string;
  };
};

export default function FormulaSpotlight({
  lessonTitle,
  lessonHref,
  spotlight,
}: {
  lessonTitle: string;
  lessonHref: string;
  spotlight: SpotlightFormula;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section
      aria-labelledby="formula-spotlight-heading"
      className="overflow-hidden rounded-2xl border border-amber-300/20 bg-gradient-to-br from-[#171B2D] via-[#10182B] to-[#10182B] shadow-lg shadow-amber-950/10"
    >
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls="formula-spotlight-details"
        onClick={() => setExpanded((open) => !open)}
        className="group w-full p-5 text-left transition hover:bg-white/[0.025] focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-amber-300 sm:p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
              <Lightbulb size={20} aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-300">
                Formula Spotlight
              </p>
              <h2 id="formula-spotlight-heading" className="mt-1 text-lg font-bold sm:text-xl">
                Discover a physics formula
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-400">
                A quick introduction from {lessonTitle}. Click to explore how it works.
              </p>
            </div>
          </div>
          <span
            className={`inline-flex min-h-9 shrink-0 items-center gap-2 rounded-lg border border-amber-300/25 bg-amber-300/5 px-3 text-xs font-bold text-amber-200 transition group-hover:bg-amber-300/10 ${
              expanded ? "sm:mt-1" : "sm:mt-1"
            }`}
          >
            {expanded ? "Close formula" : "Click to explore"}
            <ChevronDown
              size={16}
              aria-hidden="true"
              className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
            />
          </span>
        </div>
        <div className="mt-5 rounded-xl border border-white/10 bg-[#080D1B]/80 px-4 py-5 text-center sm:py-6">
          <p className="text-3xl font-black tracking-wide text-amber-200 sm:text-4xl">
            {spotlight.formula}
          </p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Featured formula · {lessonTitle}
          </p>
        </div>
      </button>

      <div
        id="formula-spotlight-details"
        aria-hidden={!expanded}
        inert={!expanded}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="border-t border-white/10 px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-[#080D1B]/70 p-4">
                <h3 className="font-bold text-amber-200">{spotlight.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{spotlight.meaning}.</p>
                <p className="mt-3 text-sm leading-6 text-slate-400">{spotlight.variables}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  <strong className="text-slate-200">SI units:</strong> {spotlight.units}
                </p>
              </div>
              <div className="rounded-xl bg-[#080D1B]/70 p-4">
                <h3 className="font-bold text-amber-200">What it describes</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{spotlight.example}</p>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  <strong className="text-slate-200">Real-world connection:</strong>{" "}
                  {spotlight.application}
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-emerald-300/15 bg-emerald-300/[0.04] p-4">
              <h3 className="font-bold text-emerald-200">Worked example</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                <strong className="text-white">Given:</strong> {spotlight.workedExample.given}
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-300">
                <strong className="text-white">Calculation:</strong>{" "}
                {spotlight.workedExample.calculation}
              </p>
              <p className="mt-1 text-sm font-bold leading-6 text-emerald-200">
                <strong className="text-white">Answer:</strong> {spotlight.workedExample.answer}
              </p>
            </div>
            <Link
              href={lessonHref}
              className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg bg-amber-300 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-amber-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
            >
              Explore {lessonTitle}
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
