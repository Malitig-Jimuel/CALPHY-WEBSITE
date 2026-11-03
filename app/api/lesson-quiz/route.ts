import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidateQuizPages } from "@/lib/revalidateQuizPages";

const PASS_PERCENT = 60;

const lessonQuizzes: Record<string, number[]> = {
  "measurements-vectors": [
    1, 2, 1, 1, 2, 1, 2, 0, 0, 1, 1, 2, 3, 1, 2, 2, 1, 1, 1, 2,
  ],
  fluids: [2, 0, 1, 3, 2, 0, 1, 0, 2, 3, 1, 2, 2, 0, 3, 1, 3, 0, 1, 3],
  "temperature-heat": [
    1, 2, 1, 3, 0, 2, 1, 2, 3, 0, 2, 0, 2, 2, 1, 3, 0, 3, 1, 0,
  ],
  "waves-sound": [
    1, 1, 2, 0, 1, 2, 3, 0, 2, 3, 1, 2, 0, 1, 2, 3, 1, 0, 2, 3,
  ],
  optics: [1, 2, 3, 0, 1, 2, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2],
  electricity: [
    1, 2, 0, 1, 2, 0, 1, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0,
  ],
};

function isStringList(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "string" &&
        item.trim().length > 0 &&
        item.length <= 1000
    )
  );
}

function isIndexList(value: unknown): value is number[] {
  return (
    Array.isArray(value) &&
    value.length === 4 &&
    value.every(
      (item) =>
        typeof item === "number" &&
        Number.isInteger(item) &&
        item >= 0 &&
        item < 4
    ) &&
    new Set(value).size === 4
  );
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Please log in to save your quiz result." },
        { status: 401 }
      );
    }

    const body: unknown = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const { lessonSlug, answers, questions } = body as {
      lessonSlug?: unknown;
      answers?: unknown;
      questions?: unknown;
    };

    if (
      typeof lessonSlug !== "string" ||
      !Object.prototype.hasOwnProperty.call(lessonQuizzes, lessonSlug)
    ) {
      return NextResponse.json(
        { error: "Unknown lesson quiz." },
        { status: 400 }
      );
    }

    const correctIndexes = lessonQuizzes[lessonSlug];

    if (
      !Array.isArray(answers) ||
      answers.length !== correctIndexes.length ||
      !Array.isArray(questions) ||
      questions.length !== correctIndexes.length
    ) {
      return NextResponse.json(
        { error: "One or more submitted answers are invalid." },
        { status: 400 }
      );
    }

    const selectedIndexes: number[] = [];

    for (const answer of answers) {
      if (
        typeof answer !== "number" ||
        !Number.isInteger(answer) ||
        answer < -1 ||
        answer > 3
      ) {
        return NextResponse.json(
          { error: "One or more submitted answers are invalid." },
          { status: 400 }
        );
      }

      selectedIndexes.push(answer);
    }

    const questionSnapshots: {
      question: string;
      choices: string[];
      explanation: string;
      optionOrder: number[];
    }[] = [];

    for (const question of questions) {
      if (!question || typeof question !== "object") {
        return NextResponse.json(
          { error: "Question review data is invalid." },
          { status: 400 }
        );
      }

      const snapshot = question as Record<string, unknown>;
      const choices = snapshot.choices;

      if (
        typeof snapshot.question !== "string" ||
        snapshot.question.trim().length === 0 ||
        snapshot.question.length > 3000 ||
        typeof snapshot.explanation !== "string" ||
        snapshot.explanation.length > 4000 ||
        !isStringList(choices) ||
        choices.length !== 4
      ) {
        return NextResponse.json(
          { error: "Question review data is invalid." },
          { status: 400 }
        );
      }

      const normalizedOrder =
        snapshot.optionOrder === undefined
          ? [0, 1, 2, 3]
          : snapshot.optionOrder;

      if (!isIndexList(normalizedOrder)) {
        return NextResponse.json(
          { error: "Question choice order is invalid." },
          { status: 400 }
        );
      }

      questionSnapshots.push({
        question: snapshot.question,
        choices,
        explanation: snapshot.explanation,
        optionOrder: normalizedOrder,
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User account not found." },
        { status: 404 }
      );
    }

    // Score on the server.
    const answerRecords = correctIndexes.map((correctIndex, index) => {
      const snapshot = questionSnapshots[index];
      const displayedCorrectIndex =
        snapshot.optionOrder.indexOf(correctIndex);
      const selectedIndex = selectedIndexes[index];
      return {
        questionId: `q${index + 1}`,
        questionText: snapshot.question,
        selectedAnswer:
          selectedIndex < 0 ? "Not answered" : snapshot.choices[selectedIndex],
        correctAnswer: snapshot.choices[displayedCorrectIndex],
        choices: JSON.stringify(snapshot.choices),
        explanation: snapshot.explanation,
        isCorrect: selectedIndex === displayedCorrectIndex,
      };
    });

    const score = answerRecords.filter((answer) => answer.isCorrect).length;
    const percentage = Math.round((score / correctIndexes.length) * 100);
    const passed = percentage >= PASS_PERCENT;

    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: user.id,
        quizId: lessonSlug,
        score,
        totalQuestions: correctIndexes.length,
        answers: { create: answerRecords },
      },
    });

    // Completion rule: passing the lesson quiz completes the module.
    // A module that is already complete stays complete.
    const existingProgress = await prisma.lessonProgress.findUnique({
      where: {
        userId_lessonSlug: { userId: user.id, lessonSlug },
      },
      select: { completed: true },
    });

    let moduleCompleted = existingProgress?.completed ?? false;
    const now = new Date();

    if (passed && !moduleCompleted) {
      await prisma.lessonProgress.upsert({
        where: {
          userId_lessonSlug: { userId: user.id, lessonSlug },
        },
        create: {
          userId: user.id,
          lessonSlug,
          completed: true,
          completedAt: now,
          lastAccessedAt: now,
        },
        update: {
          completed: true,
          completedAt: now,
          lastAccessedAt: now,
        },
      });
      moduleCompleted = true;
    }

    revalidateQuizPages();

    return NextResponse.json(
      {
        message: "Quiz result saved successfully.",
        attempt: {
          id: attempt.id,
          quizId: attempt.quizId,
          score: attempt.score,
          totalQuestions: attempt.totalQuestions,
          percentage: Math.round((attempt.score / attempt.totalQuestions) * 100),
          createdAt: attempt.createdAt,
        },
        passed,
        moduleCompleted,
        passPercent: PASS_PERCENT,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to save lesson quiz result:", error);

    return NextResponse.json(
      { error: "Unable to save quiz result. Please try again." },
      { status: 500 }
    );
  }
}