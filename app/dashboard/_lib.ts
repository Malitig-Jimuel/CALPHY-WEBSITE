import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dashboardLessons = [
  { title: "Measurements & Vectors", slug: "measurements-vectors" },
  { title: "Fluids", slug: "fluids" },
  { title: "Temperature & Heat", slug: "temperature-heat" },
  { title: "Waves & Sound", slug: "waves-sound" },
  { title: "Light & Reflection", slug: "optics" },
  { title: "Electric Forces & Field", slug: "electricity" },
] as const;

export async function requireDashboardUser() {
  await connection();
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true },
  });

  if (!user) {
    redirect("/login");
  }

  return user;
}

export function getQuizTitle(quizId: string) {
  if (quizId === "dashboard-physics") return "Quick Physics Challenge";
  return (
    dashboardLessons.find((lesson) => lesson.slug === quizId)?.title ??
    "Physics quiz"
  );
}

export function getAssociatedLesson(quizId: string) {
  return quizId === "dashboard-physics"
    ? "Across all modules"
    : dashboardLessons.find((lesson) => lesson.slug === quizId)?.title ??
        "Physics module";
}

export function getAttemptReviewHref(attemptId: string) {
  return `/dashboard/quiz-history/${encodeURIComponent(attemptId)}`;
}

export function getAttemptPercentage(score: number, totalQuestions: number) {
  return totalQuestions > 0
    ? Math.round((score / totalQuestions) * 100)
    : 0;
}

export function getAttemptStatus(score: number, totalQuestions: number) {
  return getAttemptPercentage(score, totalQuestions) >= 60
    ? "Passed"
    : "Needs review";
}
