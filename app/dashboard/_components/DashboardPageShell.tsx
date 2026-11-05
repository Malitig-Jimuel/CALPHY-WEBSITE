import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function DashboardPageShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="flex h-full min-h-0 flex-col overflow-hidden bg-[#080D1B] text-slate-100">
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 sm:px-6 lg:px-10">
          <div className="mx-auto w-full max-w-[1500px]">
            <header className="mb-8 border-b border-white/10 pb-6">
              <Link
                href="/home"
                className="mb-5 inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-medium text-sky-300 transition hover:text-sky-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-300"
              >
                <ArrowLeft size={17} /> Back to Home
              </Link>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                {title}
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
                {description}
              </p>
            </header>
            {children}
          </div>
      </div>
    </main>
  );
}

export function DashboardPageFallback() {
  return (
    <main className="h-full overflow-y-auto bg-[#080D1B] px-5 py-10 text-slate-100">
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="h-10 w-48 rounded-xl bg-white/10" />
        <div className="mt-8 h-20 rounded-2xl bg-white/10" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="h-32 rounded-2xl bg-white/10" />
          <div className="h-32 rounded-2xl bg-white/10" />
        </div>
      </div>
    </main>
  );
}
