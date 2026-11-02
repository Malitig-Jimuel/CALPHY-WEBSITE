"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AudioLines,
  ChevronDown,
  Droplets,
  Lightbulb,
  Ruler,
  Thermometer,
  Zap,
} from "lucide-react";

export type LessonSectionLink = {
  id: string;
  label: string;
};

const lessons = [
  {
    title: "Measurements & Vectors",
    href: "/lessons/measurements-vectors",
    icon: Ruler,
    color: "text-sky-300",
    background: "bg-sky-400/10",
  },
  {
    title: "Fluids",
    href: "/lessons/fluids",
    icon: Droplets,
    color: "text-cyan-300",
    background: "bg-cyan-400/10",
  },
  {
    title: "Temperature & Heat",
    href: "/lessons/temperature-heat",
    icon: Thermometer,
    color: "text-orange-300",
    background: "bg-orange-400/10",
  },
  {
    title: "Waves & Sound",
    href: "/lessons/waves-sound",
    icon: AudioLines,
    color: "text-violet-300",
    background: "bg-violet-400/10",
  },
  {
    title: "Light & Reflection",
    href: "/lessons/optics",
    icon: Lightbulb,
    color: "text-amber-300",
    background: "bg-amber-400/10",
  },
  {
    title: "Electric Forces & Field",
    href: "/lessons/electricity",
    icon: Zap,
    color: "text-emerald-300",
    background: "bg-emerald-400/10",
  },
];

export default function LessonSidebar({
  sections = [],
  accentClass = "text-sky-300",
}: {
  sections?: LessonSectionLink[];
  accentClass?: string;
}) {
  const pathname = usePathname();
  const activeLesson = lessons.find((lesson) => lesson.href === pathname);
  const [sectionsExpanded, setSectionsExpanded] = useState(true);
  const [activeSection, setActiveSection] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    if (!activeLesson || sections.length === 0) return;
    const scrollContainer = document.getElementById("lesson-main-scroll");
    if (!scrollContainer) return;

    let frame = 0;
    const updateActiveSection = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const activationPoint =
          scrollContainer.getBoundingClientRect().top + 140;
        let currentSection = sections[0]?.id ?? "";

        for (const section of sections) {
          const element = document.getElementById(section.id);
          if (element && element.getBoundingClientRect().top <= activationPoint) {
            currentSection = section.id;
          }
        }

        if (
          scrollContainer.scrollTop + scrollContainer.clientHeight >=
          scrollContainer.scrollHeight - 4
        ) {
          currentSection = sections[sections.length - 1]?.id ?? currentSection;
        }

        setActiveSection(currentSection);
      });
    };

    updateActiveSection();
    scrollContainer.addEventListener("scroll", updateActiveSection, {
      passive: true,
    });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      cancelAnimationFrame(frame);
      scrollContainer.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [activeLesson, sections]);

  const lessonLinks = (
    <nav aria-label="Physics lessons" className="mt-3 space-y-1">
      {lessons.map((lesson, index) => {
        const Icon = lesson.icon;
        const isActive = lesson.href === pathname;

        return (
          <div key={lesson.href}>
            <div className="flex items-center gap-1">
              <Link
                href={lesson.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 ${
                  isActive
                    ? "border-sky-400/20 bg-sky-400/10 text-sky-200"
                    : "border-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${lesson.background} ${lesson.color}`}
                >
                  <Icon size={17} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">{lesson.title}</span>
                <span className="text-xs text-slate-500">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </Link>
              {isActive && sections.length > 0 && (
                <button
                  type="button"
                  aria-label={
                    sectionsExpanded ? "Collapse lesson sections" : "Expand lesson sections"
                  }
                  aria-expanded={sectionsExpanded}
                  onClick={() => setSectionsExpanded((expanded) => !expanded)}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300"
                >
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${sectionsExpanded ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  />
                </button>
              )}
            </div>
            {isActive && sectionsExpanded && sections.length > 0 && (
              <nav
                aria-label={`${lesson.title} sections`}
                className="ml-7 mt-1 space-y-1 border-l border-white/10 pl-3"
              >
                {sections.map((section) => {
                  const isCurrentSection = activeSection === section.id;

                  return (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      aria-current={isCurrentSection ? "location" : undefined}
                      onClick={(event) => {
                        event.preventDefault();
                        const container =
                          document.getElementById("lesson-main-scroll");
                        const target = document.getElementById(section.id);

                        if (container && target) {
                          const top =
                            target.getBoundingClientRect().top -
                            container.getBoundingClientRect().top +
                            container.scrollTop;
                          container.scrollTo({ top, behavior: "smooth" });
                          window.history.replaceState(null, "", `#${section.id}`);
                          setActiveSection(section.id);
                        }
                      }}
                      className={`block rounded-lg px-3 py-2 text-xs leading-5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300 ${
                        isCurrentSection
                          ? `${accentClass} bg-white/5 font-semibold`
                          : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                      }`}
                    >
                      {section.label}
                    </a>
                  );
                })}
              </nav>
            )}
          </div>
        );
      })}
    </nav>
  );

  return (
    <>
      <aside className="hidden h-full min-h-0 overflow-y-auto overscroll-contain border-r border-white/10 bg-[#0B1222] p-4 md:block">
        <p className="px-2 text-xs font-bold uppercase tracking-widest text-slate-500">
          Physics lessons
        </p>
        {lessonLinks}
      </aside>
      <details className="group mx-4 mt-4 rounded-2xl border border-white/10 bg-[#10182B] p-4 md:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 [&::-webkit-details-marker]:hidden">
          <span>Physics lessons</span>
          <ChevronDown
            size={16}
            className="transition-transform group-open:rotate-180"
            aria-hidden="true"
          />
        </summary>
        {lessonLinks}
      </details>
    </>
  );
}
