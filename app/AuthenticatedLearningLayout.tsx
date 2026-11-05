import type { ReactNode } from "react";
import { Suspense } from "react";
import { connection } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { lessons } from "./lessonModules";
import AuthenticatedLearningShell from "./AuthenticatedLearningShell";

async function LearningLayoutContent({
  children,
}: Readonly<{ children: ReactNode }>) {
  await connection();
  const session = await auth();
  const user = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          name: true,
          lessonProgress: {
            where: { completed: true },
            select: { lessonSlug: true },
          },
        },
      })
    : null;

  const userName =
    user?.name?.trim() ||
    session?.user?.name?.trim() ||
    (session?.user ? "Physics learner" : null);
  const completedLessons = user?.lessonProgress.map((item) => item.lessonSlug) ?? [];
  const completedLessonSlugs = completedLessons.filter((slug) =>
    lessons.some((lesson) => lesson.slug === slug)
  );

  return (
    <AuthenticatedLearningShell
      userName={userName}
      isAuthenticated={Boolean(session?.user)}
      completedLessonSlugs={completedLessonSlugs}
    >
      {children}
    </AuthenticatedLearningShell>
  );
}

function LearningLayoutFallback() {
  return (
    <div
      role="status"
      className="flex h-dvh items-center justify-center bg-[#080D1B] text-sm font-medium text-slate-400"
    >
      Loading your learning space…
    </div>
  );
}

export default function AuthenticatedLearningLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <Suspense fallback={<LearningLayoutFallback />}>
      <LearningLayoutContent>{children}</LearningLayoutContent>
    </Suspense>
  );
}
