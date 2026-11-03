import { Suspense } from "react";
import DashboardPageShell from "../_components/DashboardPageShell";
import { DashboardPageFallback } from "../_components/DashboardPageShell";
import QuizAttemptList, {
  type QuizAttemptListItem,
} from "../_components/QuizAttemptList";
import { requireDashboardUser } from "../_lib";
import { prisma } from "@/lib/prisma";

async function QuizHistoryContent() {
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
      title="Recent quiz history"
      description="Open an attempt to see the questions and answers saved for that quiz."
    >
      <p className="mb-4 text-sm text-slate-400">
        {attempts.length} {attempts.length === 1 ? "saved result" : "saved results"}.
        Correct and incorrect totals are shown with each attempt.
      </p>
      <QuizAttemptList attempts={list} showFilters showAnswerCounts />
    </DashboardPageShell>
  );
}

export default function QuizHistoryPage() {
  return (
    <Suspense fallback={<DashboardPageFallback />}>
      <QuizHistoryContent />
    </Suspense>
  );
}
