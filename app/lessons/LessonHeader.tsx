import type { ReactNode } from "react";

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
