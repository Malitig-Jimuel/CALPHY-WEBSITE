import { CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

export default function LessonQuizFeedback({
  saveState,
  passed,
  message,
  onRetry,
}: {
  saveState: "idle" | "saving" | "saved" | "guest" | "error";
  passed: boolean | null;
  message: string;
  onRetry: () => void;
}) {
  if (saveState === "idle") return null;

  return (
    <div
      className="mt-5 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm text-slate-300"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        {saveState === "saved" && passed ? (
          <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-400" size={18} />
        ) : saveState === "guest" ? (
          <CheckCircle2 className="mt-0.5 shrink-0 text-sky-400" size={18} />
        ) : saveState === "error" ? (
          <XCircle className="mt-0.5 shrink-0 text-rose-400" size={18} />
        ) : null}
        <div>
          <p className="font-semibold">
            {saveState === "saving"
              ? "Saving your result..."
              : saveState === "error"
                ? "Could not save your result"
                : saveState === "guest"
                  ? "Quiz result · Not saved"
                : passed
                  ? "Result saved · Module completed"
                  : "Result saved"}
          </p>
          {message && <p className="mt-1 leading-6 text-slate-400">{message}</p>}
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
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-lg border border-white/10 px-4 py-2 font-semibold transition hover:bg-white/5"
        >
          Retry saving
        </button>
      )}
    </div>
  );
}
