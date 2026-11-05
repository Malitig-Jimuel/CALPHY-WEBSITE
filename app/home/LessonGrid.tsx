"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { lessons, moduleAccentClasses } from "../lessonModules";

export default function LessonGrid({
  moduleProgress,
}: {
  moduleProgress: Array<{
    slug: string;
    completed: boolean;
  }>;
}) {
  const progressBySlug = new Map(
    moduleProgress.map((progress) => [progress.slug, progress.completed] as const)
  );

  return (
    <div id="lessons" className="mt-5 scroll-mt-6">
      <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lessons.map((lesson, index) => {
          const Icon = lesson.icon;
          const accent = moduleAccentClasses[lesson.accent];
          const isCompleted = progressBySlug.get(lesson.slug) ?? false;
          const StatusIcon = isCompleted ? CheckCircle2 : Circle;
          const status = isCompleted ? "Completed" : "Not Completed";

          return (
            <Link
              key={lesson.slug}
              href={`/lessons/${lesson.slug}`}
              aria-label={`${lesson.title}, ${status}. ${
                isCompleted ? "Review lesson" : "Start lesson"
              }`}
              className={`group flex min-h-80 flex-col overflow-hidden rounded-2xl border border-slate-700/60 bg-[#10182B] transition duration-200 hover:-translate-y-1 hover:border-sky-300/30 hover:bg-[#121D32] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 ${accent.border}`}
            >
              <span
                className={`relative flex aspect-video w-full shrink-0 items-center justify-between overflow-hidden bg-gradient-to-br ${accent.visual} px-5`}
                aria-hidden="true"
              >
                <Image
                  src={`/images/${lesson.slug}.jpg`}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-[#080D1B]/80 via-[#080D1B]/25 to-[#080D1B]/20" />
                <span className="absolute -right-4 -top-10 text-[8rem] font-black leading-none tracking-tighter text-white/[0.07]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  className={`relative z-10 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/30 backdrop-blur ${accent.icon}`}
                >
                  <Icon size={25} strokeWidth={1.7} />
                </span>
                <span className="relative z-10 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-[11px] font-semibold text-slate-100 backdrop-blur">
                  {lesson.category}
                </span>
              </span>

              <span className="flex flex-1 flex-col p-5">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                    isCompleted ? "text-emerald-300" : "text-slate-400"
                  }`}
                >
                  <StatusIcon size={15} aria-hidden="true" />
                  {status}
                </span>
                <span className="mt-2 text-lg font-bold leading-snug text-slate-100">
                  {lesson.title}
                </span>
                <span className="mt-2 flex-1 text-sm leading-6 text-slate-400">
                  {lesson.description}
                </span>
                <span
                  className={`mt-5 inline-flex min-h-9 items-center justify-center gap-2 rounded-lg px-3 text-xs font-bold transition ${
                    isCompleted
                      ? "bg-sky-400/15 text-sky-100 group-hover:bg-sky-400/25"
                      : "bg-sky-400 text-slate-950 hover:bg-sky-300"
                  }`}
                >
                  {isCompleted ? "Review Lesson" : "Start Lesson"}
                  <ArrowRight size={14} aria-hidden="true" />
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
