import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle, Clock3 } from "lucide-react";
import DashboardPageShell, {
  DashboardPageFallback,
} from "../_components/DashboardPageShell";
import {
  dashboardLessons,
  requireDashboardUser,
} from "../_lib";
import { prisma } from "@/lib/prisma";

async function DashboardProgressContent() {
  const user = await requireDashboardUser();
  const progress = await prisma.lessonProgress.findMany({
    where: { userId: user.id },
    select: {
      lessonSlug: true,
      completed: true,
      completedAt: true,
      lastAccessedAt: true,
    },
  });
  const progressBySlug = new Map(
    progress.map((item) => [item.lessonSlug, item])
  );
  const completed = dashboardLessons.filter(
    (lesson) => progressBySlug.get(lesson.slug)?.completed
  ).length;
  const inProgress = dashboardLessons.filter((lesson) => {
    const item = progressBySlug.get(lesson.slug);
    return item && !item.completed;
  }).length;
  const notStarted = dashboardLessons.length - completed - inProgress;

  return (
    <DashboardPageShell
      title="Module progress"
      description="Your completion status across the six physics modules, based on your saved lesson activity."
    >
      <section className="mb-6 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Completed", value: completed, color: "text-emerald-300" },
          { label: "In progress", value: inProgress, color: "text-sky-300" },
          { label: "Not started", value: notStarted, color: "text-slate-300" },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-white/10 bg-[#10182B] p-5"
          >
            <p className="text-sm text-slate-400">{item.label}</p>
            <p className={`mt-2 text-3xl font-black ${item.color}`}>
              {item.value}
            </p>
          </div>
        ))}
      </section>

      <section className="mb-6 rounded-2xl border border-sky-400/15 bg-sky-400/5 p-4 text-sm leading-6 text-sky-100/80">
        <p className="font-semibold text-sky-200">
          {completed}/{dashboardLessons.length} modules completed
        </p>
        <p className="mt-1">
          The current tracker records lesson visits and quiz completion, not
          partial section progress. A module is complete after a passing quiz
          score (60% or higher).
        </p>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {dashboardLessons.map((lesson, index) => {
          const item = progressBySlug.get(lesson.slug);
          const isComplete = item?.completed ?? false;
          const status = isComplete
            ? "Completed"
            : item
              ? "In Progress"
              : "Not Started";
          const StatusIcon = isComplete
            ? CheckCircle2
            : item
              ? Clock3
              : Circle;
          return (
            <article
              key={lesson.slug}
              className="rounded-2xl border border-white/10 bg-[#10182B] p-5 sm:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-sky-400">
                    MODULE {String(index + 1).padStart(2, "0")}
                  </p>
                  <h2 className="mt-2 text-lg font-bold">{lesson.title}</h2>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
                    isComplete
                      ? "bg-emerald-400/10 text-emerald-300"
                      : item
                        ? "bg-sky-400/10 text-sky-300"
                        : "bg-white/5 text-slate-400"
                  }`}
                >
                  <StatusIcon size={14} />
                  {status}
                </span>
              </div>
              {isComplete ? (
                <div className="mt-5">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Module completion</span>
                    <span>100%</span>
                  </div>
                  <div
                    className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"
                    role="progressbar"
                    aria-label={`${lesson.title} completion`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={100}
                  >
                    <div className="h-full w-full rounded-full bg-emerald-400" />
                  </div>
                  <p className="mt-3 text-xs text-slate-500">
                    {item?.completedAt
                      ? `Completed ${new Intl.DateTimeFormat("en-PH", {
                          dateStyle: "medium",
                        }).format(item.completedAt)}`
                      : "Completion date unavailable"}
                  </p>
                </div>
              ) : (
                <p className="mt-5 min-h-10 text-sm leading-5 text-slate-400">
                  {item?.lastAccessedAt
                    ? `Last visited ${new Intl.DateTimeFormat("en-PH", {
                        dateStyle: "medium",
                      }).format(item.lastAccessedAt)}. Partial lesson progress is not tracked.`
                    : "Open this lesson to begin tracking activity."}
                </p>
              )}
              <Link
                href={`/lessons/${lesson.slug}`}
                className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-semibold text-sky-300 transition hover:text-sky-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-300"
              >
                {isComplete ? "Review module" : "Open module"}
                <ArrowRight size={16} />
              </Link>
            </article>
          );
        })}
      </div>
    </DashboardPageShell>
  );
}

export default function DashboardProgressPage() {
  return (
    <Suspense fallback={<DashboardPageFallback />}>
      <DashboardProgressContent />
    </Suspense>
  );
}
