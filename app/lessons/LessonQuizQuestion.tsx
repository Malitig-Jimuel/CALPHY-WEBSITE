import type { ReactNode } from "react";

export default function LessonQuizQuestion({
  number,
  children,
}: {
  number: number;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#080D1B] p-5 sm:p-6">
      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-sky-300">
        Question {String(number).padStart(2, "0")}
      </p>
      {children}
    </div>
  );
}

export const QUIZ_OPTION_BASE_CLASS =
  "flex min-h-12 items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm leading-6 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 disabled:cursor-default";

export function getQuizOptionClass(
  state: "default" | "selected" | "correct" | "incorrect" | "muted"
) {
  switch (state) {
    case "selected":
      return "border-sky-400 bg-sky-400/10 text-slate-100";
    case "correct":
      return "border-emerald-400/60 bg-emerald-400/10 text-emerald-100";
    case "incorrect":
      return "border-rose-400/60 bg-rose-400/10 text-rose-100";
    case "muted":
      return "border-white/10 bg-white/[0.02] text-slate-500";
    default:
      return "border-white/10 bg-white/[0.03] text-slate-200 hover:border-sky-300/50 hover:bg-white/5";
  }
}

export const QUIZ_SUBMIT_BUTTON_CLASS =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-sky-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-sky-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 disabled:cursor-not-allowed disabled:opacity-40";

export const QUIZ_RETRY_BUTTON_CLASS =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/15 px-5 py-3 font-semibold text-slate-200 transition hover:border-sky-300/50 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 disabled:cursor-not-allowed disabled:opacity-40";
