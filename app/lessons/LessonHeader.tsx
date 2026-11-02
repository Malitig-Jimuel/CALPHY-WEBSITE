import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LessonHeader({
  module,
  title,
  description,
  accentClass,
  icon,
  children,
}: {
  module: string;
  title: ReactNode;
  description: ReactNode;
  accentClass: string;
  icon: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="mb-10 rounded-3xl border border-white/10 bg-gradient-to-br from-[#14223A] via-[#111A2E] to-[#101426] p-6 sm:p-8 md:mb-12 md:p-10">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-sky-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-300"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        All Topics
      </Link>
      <div
        className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] ${accentClass}`}
      >
        {icon}
        {module}
      </div>
      <h1
        className="mt-5 max-w-4xl text-3xl font-black leading-tight tracking-tight text-slate-100 sm:text-4xl md:text-5xl"
      >
        {title}
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
        {description}
      </p>
      {children && <div className="mt-6">{children}</div>}
    </header>
  );
}
