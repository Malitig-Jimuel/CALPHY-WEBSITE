import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import DashboardPageShell, {
  DashboardPageFallback,
} from "../../_components/DashboardPageShell";
import {
  getAssociatedLesson,
  getAttemptPercentage,
  getAttemptStatus,
  getQuizTitle,
  requireDashboardUser,
} from "../../_lib";
import { prisma } from "@/lib/prisma";
import { lessons } from "../../../lessonModules";

function readChoices(choices: string | null) {
  if (!choices) return null;
  try {
    const parsed: unknown = JSON.parse(choices);
    return Array.isArray(parsed) &&
      parsed.every((choice) => typeof choice === "string")
      ? parsed
      : null;
  } catch {
    return null;
  }
}

async function QuizAttemptReviewContent({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const user = await requireDashboardUser();
  const { attemptId } = await params;
  const attempt = await prisma.quizAttempt.findFirst({
    where: { id: attemptId, userId: user.id },
    include: { answers: true },
  });

  if (!attempt) notFound();

  const orderedAnswers = [...attempt.answers].sort((left, right) => {
    const leftNumber = Number(left.questionId.match(/\d+/)?.[0] ?? 0);
    const rightNumber = Number(right.questionId.match(/\d+/)?.[0] ?? 0);
    return leftNumber - rightNumber;
  });
  const percentage = getAttemptPercentage(
    attempt.score,
    attempt.totalQuestions
  );
  const lesson = lessons.find(
    (item) => item.slug === attempt.quizId
  );

  return (
    <DashboardPageShell
      title="Quiz attempt review"
      description={`${getQuizTitle(attempt.quizId)} · ${getAssociatedLesson(attempt.quizId)} · ${new Intl.DateTimeFormat(
        "en-PH",
        { dateStyle: "full", timeStyle: "short" }
      ).format(attempt.createdAt)}`}
    >
      <section className="mb-6 grid gap-3 sm:grid-cols-3">
        <SummaryCard label="Score" value={`${attempt.score}/${attempt.totalQuestions}`} />
        <SummaryCard label="Percentage" value={`${percentage}%`} />
        <SummaryCard label="Result" value={getAttemptStatus(attempt.score, attempt.totalQuestions)} />
      </section>

      {lesson && (
        <Link
          href={`/lessons/${lesson.slug}`}
          className="mb-6 inline-flex min-h-10 items-center rounded-lg text-sm font-semibold text-sky-300 hover:text-sky-200"
        >
          Review {lesson.title}
        </Link>
      )}

      {orderedAnswers.length === 0 ? (
        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5 text-sm leading-6 text-amber-100/80">
          This saved attempt does not contain individual question records.
          Its score and date are available, but the original answers cannot be
          reconstructed.
        </div>
      ) : (
        <div className="space-y-4">
          {orderedAnswers.map((answer, index) => {
            const choices = readChoices(answer.choices);
            const questionWasGeneric = /^Question\s+\d+$/i.test(
              answer.questionText
            );
            const noQuestionSnapshot = questionWasGeneric;
            return (
              <article
                key={answer.id}
                className={`rounded-2xl border p-5 sm:p-6 ${
                  answer.isCorrect
                    ? "border-emerald-400/20 bg-emerald-400/[0.04]"
                    : "border-rose-400/20 bg-rose-400/[0.04]"
                }`}
              >
                <div className="flex items-start gap-3">
                  {answer.isCorrect ? (
                    <CheckCircle2
                      aria-label="Correct"
                      className="mt-0.5 shrink-0 text-emerald-300"
                      size={20}
                    />
                  ) : (
                    <XCircle
                      aria-label="Incorrect"
                      className="mt-0.5 shrink-0 text-rose-300"
                      size={20}
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                      Question {index + 1}
                    </p>
                    {noQuestionSnapshot ? (
                      <p className="mt-2 text-sm italic leading-6 text-slate-400">
                        The original question text was not saved for this
                        attempt.
                      </p>
                    ) : (
                      <h2 className="mt-2 font-semibold leading-6 text-slate-100">
                        {answer.questionText}
                      </h2>
                    )}
                    {choices && (
                      <ol className="mt-4 grid gap-2 sm:grid-cols-2">
                        {choices.map((choice, choiceIndex) => {
                          const isSelected = answer.selectedAnswer === choice;
                          const isCorrect = answer.correctAnswer === choice;
                          return (
                            <li
                              key={`${choiceIndex}-${choice}`}
                              className={`rounded-xl border px-3 py-2.5 text-sm leading-5 ${
                                isCorrect
                                  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"
                                  : isSelected
                                    ? "border-rose-400/30 bg-rose-400/10 text-rose-100"
                                    : "border-white/10 bg-[#080D1B] text-slate-400"
                              }`}
                            >
                              <span className="mr-2 font-bold">
                                {String.fromCharCode(65 + choiceIndex)}.
                              </span>
                              {choice}
                              {isSelected && (
                                <span className="ml-2 text-xs font-semibold">
                                  Your answer
                                </span>
                              )}
                              {isCorrect && (
                                <span className="ml-2 text-xs font-semibold">
                                  Correct answer
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ol>
                    )}
                    {!choices && (
                      <p className="mt-4 text-sm text-slate-500">
                        Answer choices were not stored for this attempt.
                      </p>
                    )}
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <AnswerCard label="Your answer" value={answer.selectedAnswer} />
                      <AnswerCard label="Correct answer" value={answer.correctAnswer} />
                    </div>
                    {answer.explanation && (
                      <p className="mt-4 rounded-xl border border-sky-400/15 bg-sky-400/5 p-4 text-sm leading-6 text-slate-300">
                        <strong className="text-sky-200">Explanation: </strong>
                        {answer.explanation}
                      </p>
                    )}
                    <p
                      className={`mt-4 text-sm font-bold ${
                        answer.isCorrect
                          ? "text-emerald-300"
                          : "text-rose-300"
                      }`}
                    >
                      {answer.isCorrect ? "Correct" : "Incorrect"}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </DashboardPageShell>
  );
}

export default function QuizAttemptReviewPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  return (
    <Suspense fallback={<DashboardPageFallback />}>
      <QuizAttemptReviewContent params={params} />
    </Suspense>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#10182B] p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-black text-sky-300">{value}</p>
    </div>
  );
}

function AnswerCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#080D1B] p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-2 break-words text-sm text-slate-200">{value}</p>
    </div>
  );
}
