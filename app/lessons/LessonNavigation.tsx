import Link from "next/link";

export default function LessonNavigation() {
  return (
    <nav className="sticky top-0 z-30 border-b border-white/10 bg-[#080D1B]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link href="/" className="text-xl font-black tracking-tight">
          Calph<span className="text-sky-400">++</span>
        </Link>
        <div className="flex items-center gap-5">
          <Link
            href="/dashboard"
            className="text-sm text-slate-300 transition hover:text-sky-400"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
}
