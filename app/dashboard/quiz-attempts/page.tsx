import { Suspense } from "react";
import DashboardPageShell from "../_components/DashboardPageShell";
import { DashboardPageFallback } from "../_components/DashboardPageShell";
import QuizAttemptList, {
  type QuizAttemptListItem,
} from "../_components/QuizAttemptList";
import { requireDashboardUser } from "../_lib";
import { prisma } from "@/lib/prisma";

async function QuizAttemptsContent() {
  const user = await requireDashboardUser();
  const attempts = await prisma.quizAttempt.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      quizId: true,
      score: true,
      totalQuestions: true,
      createdAt: true,
    },
  });
  const list: QuizAttemptListItem[] = attempts.map((attempt) => ({
    ...attempt,
    createdAt: attempt.createdAt.toISOString(),
  }));

  return (
    <DashboardPageShell
      title="Quiz attempts saved"
      description="Browse your saved attempts, compare scores, and open any attempt to review your answers."
    >
      <p className="mb-4 text-sm text-slate-400">
        {attempts.length} {attempts.length === 1 ? "attempt" : "attempts"} ·
        Newest first
      </p>
      <QuizAttemptList attempts={list} showFilters />
    </DashboardPageShell>
  );
}

export default function QuizAttemptsPage() {
  return (
    <Suspense fallback={<DashboardPageFallback />}>
      <QuizAttemptsContent />
    </Suspense>
  );
}
