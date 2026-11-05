"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  Activity,
  Atom,
  BookOpen,
  ChevronDown,
  History,
  House,
  Info,
  LogOut,
  Menu,
  UserRound,
  X,
} from "lucide-react";
import { lessons } from "./lessonModules";

type Props = Readonly<{
  children: ReactNode;
  userName: string | null;
  isAuthenticated: boolean;
  completedLessonSlugs: string[];
}>;

const auxiliaryLinks = [
  { label: "Quiz History", href: "/dashboard/quiz-history", icon: History },
  { label: "Performance", href: "/dashboard/performance", icon: Activity },
  { label: "About", href: "/about", icon: Info },
  { label: "Profile", href: "/profile", icon: UserRound },
];

export default function AuthenticatedLearningShell({
  children,
  userName,
  isAuthenticated,
  completedLessonSlugs,
}: Props) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLessonsExpanded, setIsLessonsExpanded] = useState(true);
  const [completedSlugs, setCompletedSlugs] = useState(completedLessonSlugs);
  const firstName = userName?.split(/\s+/)[0] || "Guest";

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setCompletedSlugs(completedLessonSlugs);
    });

    return () => cancelAnimationFrame(frame);
  }, [completedLessonSlugs]);

  useEffect(() => {
    function handleProgressUpdate(event: Event) {
      const { lessonSlug, completed } = (
        event as CustomEvent<{ lessonSlug?: unknown; completed?: unknown }>
      ).detail ?? {};

      if (
        typeof lessonSlug !== "string" ||
        typeof completed !== "boolean" ||
        !lessons.some((lesson) => lesson.slug === lessonSlug)
      ) {
        return;
      }

      setCompletedSlugs((current) =>
        completed
          ? current.includes(lessonSlug)
            ? current
            : [...current, lessonSlug]
          : current.filter((slug) => slug !== lessonSlug)
      );
    }

    function handleProgressReset() {
      setCompletedSlugs([]);
    }

    window.addEventListener("calph-learning-progress-updated", handleProgressUpdate);
    window.addEventListener("calph-learning-progress-reset", handleProgressReset);

    return () => {
      window.removeEventListener(
        "calph-learning-progress-updated",
        handleProgressUpdate
      );
      window.removeEventListener(
        "calph-learning-progress-reset",
        handleProgressReset
      );
    };
  }, []);

  const completedCount = completedSlugs.length;
  const progressPercent = Math.round((completedCount / lessons.length) * 100);
  const homeHref = isAuthenticated ? "/home" : "/";

  function isLinkActive(href: string) {
    if (href === "/home") return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function sidebarContent(isMobile = false) {
    return (
      <>
        <Link
          href={homeHref}
          onClick={() => isMobile && setIsMobileMenuOpen(false)}
          className="flex items-center gap-3 rounded-xl px-2 py-2 text-lg font-black tracking-tight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-400/10 text-sky-300">
            <Atom size={20} aria-hidden="true" />
          </span>
          <span>
            Calph<span className="text-sky-300">++</span>
          </span>
        </Link>

        <div className="mt-5 rounded-2xl border border-sky-300/10 bg-[#10182B] p-4">
          <p className="truncate text-sm font-bold text-white">
            {firstName}&apos;s Space
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            {isAuthenticated
              ? "Keep building your physics knowledge."
              : "Log in to save your learning progress."}
          </p>
        </div>

        <nav aria-label="Learning navigation" className="mt-5 min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <Link
            href={homeHref}
            onClick={() => isMobile && setIsMobileMenuOpen(false)}
            aria-current={isLinkActive("/home") ? "page" : undefined}
            className={`flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 ${
              isLinkActive("/home")
                ? "bg-sky-400/10 text-sky-200"
                : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
            }`}
          >
            <House size={17} aria-hidden="true" />
            Home
          </Link>

          <div className="mt-1">
            <button
              type="button"
              aria-expanded={isLessonsExpanded}
              onClick={() => setIsLessonsExpanded((expanded) => !expanded)}
              className={`flex min-h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 ${
                pathname.startsWith("/lessons")
                  ? "bg-sky-400/10 text-sky-200"
                  : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              <BookOpen size={17} aria-hidden="true" />
              <span className="flex-1">Lessons</span>
              <ChevronDown
                size={16}
                className={`transition-transform ${isLessonsExpanded ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>
            {isLessonsExpanded && (
              <div className="ml-3 mt-1 space-y-1 border-l border-slate-700/70 pl-2">
                {lessons.map((lesson, index) => {
                  const Icon = lesson.icon;
                  const href = `/lessons/${lesson.slug}`;
                  const active = pathname === href;

                  return (
                    <Link
                      key={lesson.slug}
                      href={href}
                      onClick={() => isMobile && setIsMobileMenuOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`flex min-h-10 items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium leading-4 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 ${
                        active
                          ? "bg-sky-400/10 text-sky-200"
                          : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-100"
                      }`}
                    >
                      <Icon size={15} className="shrink-0 text-sky-300" aria-hidden="true" />
                      <span className="min-w-0 flex-1">{lesson.title}</span>
                      <span className="text-[10px] text-slate-600">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-3 space-y-1 border-t border-white/[0.07] pt-3">
            {auxiliaryLinks.map((item) => {
              const Icon = item.icon;
              const active = isLinkActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => isMobile && setIsMobileMenuOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 ${
                    active
                      ? "bg-sky-400/10 text-sky-200"
                      : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-100"
                  }`}
                >
                  <Icon size={17} aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {isAuthenticated ? (
          <button
            type="button"
            onClick={() => void signOut({ redirectTo: "/" })}
            className="mt-3 flex min-h-10 shrink-0 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-400 transition hover:bg-red-400/10 hover:text-red-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
          >
            <LogOut size={17} aria-hidden="true" />
            Log Out
          </button>
        ) : (
          <Link
            href="/login"
            onClick={() => isMobile && setIsMobileMenuOpen(false)}
            className="mt-3 flex min-h-10 shrink-0 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-sky-300 transition hover:bg-sky-400/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
          >
            <UserRound size={17} aria-hidden="true" />
            Log In
          </Link>
        )}

        {isAuthenticated && (
          <div className="mt-4 shrink-0 rounded-2xl border border-sky-300/10 bg-[#10182B] p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-sky-200">
              Learning progress
            </p>
            <p className="mt-2 text-2xl font-black text-white">
              {completedCount}/{lessons.length}
            </p>
            <p className="mt-1 text-xs text-slate-400">modules completed</p>
            <div
              className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"
              role="progressbar"
              aria-label="Learning progress"
              aria-valuemin={0}
              aria-valuemax={lessons.length}
              aria-valuenow={completedCount}
            >
              <div
                className="h-full rounded-full bg-sky-300 transition-[width]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="flex h-dvh min-h-0 overflow-hidden bg-[#080D1B] text-slate-100">
      <aside className="hidden h-full w-56 shrink-0 flex-col border-r border-slate-700/50 bg-[#0B1222] p-4 md:flex lg:w-64">
        {sidebarContent()}
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex h-14 shrink-0 items-center border-b border-slate-700/50 bg-[#080D1B] px-4 md:hidden">
          <button
            type="button"
            aria-label="Open learning navigation"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-learning-sidebar"
            onClick={() => setIsMobileMenuOpen(true)}
            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl border border-white/10 text-slate-200 transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
          >
            <Menu size={20} aria-hidden="true" />
          </button>
          <span className="ml-3 text-sm font-semibold text-slate-300">
            Learning navigation
          </span>
        </div>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <button
            type="button"
            aria-label="Close learning navigation"
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute inset-0 bg-slate-950/70"
          />
          <aside
            id="mobile-learning-sidebar"
            aria-label="Learning navigation"
            className="absolute inset-y-0 left-0 flex w-[min(19rem,88vw)] flex-col border-r border-slate-700/60 bg-[#0B1222] p-4 shadow-2xl"
          >
            <div className="mb-2 flex items-center justify-end">
              <button
                type="button"
                aria-label="Close learning navigation"
                onClick={() => setIsMobileMenuOpen(false)}
                className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl text-slate-300 transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            {sidebarContent(true)}
          </aside>
        </div>
      )}
    </div>
  );
}
