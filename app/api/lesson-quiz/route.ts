import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidateQuizPages } from "@/lib/revalidateQuizPages";
import {
  isLessonSlug,
  prerequisiteFor,
  readGuestQuizProgress,
  writeGuestQuizProgress,
} from "@/lib/lessonQuizSequence";
import { LESSON_QUIZ_PASS_PERCENT } from "../../lessons/lessonQuizPassing";

const lessonQuizzes: Record<string, number[]> = {
  "measurements-vectors": [
    1, 2, 1, 1, 2, 1, 2, 0, 0, 1, 1, 2, 3, 1, 2, 2, 1, 1, 1, 2,
  ],
  fluids: [2, 0, 1, 3, 2, 0, 1, 0, 2, 3, 1, 2, 2, 0, 3, 1, 3, 0, 1, 3],
  "temperature-heat": [
    1, 2, 1, 3, 0, 2, 1, 2, 3, 0, 2, 0, 2, 2, 1, 3, 0, 3, 1, 0,
  ],
  "waves-sound": [
    1, 2, 1, 1, 0, 0, 2, 0, 1, 2, 2, 2, 2, 0, 1, 2, 1, 1, 0, 3,
  ],
  optics: [1, 2, 3, 0, 1, 2, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2],
  electricity: [
    1, 2, 0, 1, 2, 0, 1, 0, 1, 2, 2, 2, 2, 0, 1, 2, 0, 1, 2, 0,
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
      questionIndex: number;
      question: string;
      choices: string[];
      explanation: string;
      optionOrder: number[];
    }[] = [];
    const seenQuestionIndexes = new Set<number>();

    for (const question of questions) {
      if (!question || typeof question !== "object") {
        return NextResponse.json(
          { error: "Question review data is invalid." },
          { status: 400 }
        );
      }

      const snapshot = question as Record<string, unknown>;
      const choices = snapshot.choices;
      const questionIndex = snapshot.questionIndex;

      if (
        typeof questionIndex !== "number" ||
        !Number.isInteger(questionIndex) ||
        questionIndex < 0 ||
        questionIndex >= correctIndexes.length ||
        seenQuestionIndexes.has(questionIndex) ||
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

      seenQuestionIndexes.add(questionIndex);
      const normalizedOrder = snapshot.optionOrder;

      if (!isIndexList(normalizedOrder)) {
        return NextResponse.json(
          { error: "Question choice order is invalid." },
          { status: 400 }
        );
      }

      questionSnapshots.push({
        questionIndex,
        question: snapshot.question,
        choices,
        explanation: snapshot.explanation,
        optionOrder: normalizedOrder,
      });
    }

    if (seenQuestionIndexes.size !== correctIndexes.length) {
      return NextResponse.json(
        { error: "Question order is invalid." },
        { status: 400 }
      );
    }

    const user = session?.user?.id
      ? await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { id: true },
        })
      : null;

    if (session?.user?.id && !user) {
      return NextResponse.json({ error: "User account not found." }, { status: 404 });
    }

    if (!isLessonSlug(lessonSlug)) {
      return NextResponse.json({ error: "Unknown lesson quiz." }, { status: 400 });
    }

    const prerequisite = prerequisiteFor(lessonSlug);
    if (prerequisite) {
      const completedPrerequisite = user
        ? await prisma.lessonProgress.findUnique({
            where: {
              userId_lessonSlug: {
                userId: user.id,
                lessonSlug: prerequisite.slug,
              },
            },
            select: { completed: true },
          }).then((progress) => progress?.completed ?? false)
        : readGuestQuizProgress(request).has(prerequisite.slug);

      if (!completedPrerequisite) {
        return NextResponse.json(
          {
            error: `Pass ${prerequisite.title}'s quiz before officially submitting this quiz. You can still study and practice this lesson.`,
            prerequisiteTitle: prerequisite.title,
          },
          { status: 403 }
        );
      }
    }

    const answerRecords = questionSnapshots.map((snapshot, index) => {
      const selectedIndex = selectedIndexes[index];
      const questionCorrectIndex = correctIndexes[snapshot.questionIndex];
      const displayedCorrectIndex =
        snapshot.optionOrder.indexOf(questionCorrectIndex);
      const displayedChoices = snapshot.optionOrder.map(
        (optionIndex) => snapshot.choices[optionIndex]
      );
      return {
        questionId: `q${snapshot.questionIndex + 1}`,
        questionText: snapshot.question,
        selectedAnswer:
          selectedIndex < 0
            ? "Not answered"
            : displayedChoices[selectedIndex],
        correctAnswer: displayedChoices[displayedCorrectIndex],
        choices: JSON.stringify(displayedChoices),
        explanation: snapshot.explanation,
        isCorrect: selectedIndex === displayedCorrectIndex,
      };
    });

    const score = answerRecords.filter((answer) => answer.isCorrect).length;
    const percentage = Math.round((score / correctIndexes.length) * 100);
    const passed = percentage >= LESSON_QUIZ_PASS_PERCENT;

    if (!user) {
      const response = NextResponse.json({
        saved: false,
        score,
        totalQuestions: correctIndexes.length,
        passed,
        moduleCompleted: false,
        passPercent: LESSON_QUIZ_PASS_PERCENT,
      });
      if (passed) {
        const completed = readGuestQuizProgress(request);
        completed.add(lessonSlug);
        writeGuestQuizProgress(response, request, completed);
        response.headers.set("Cache-Control", "no-store");
      }
      return response;
    }

    const { attempt, moduleCompleted } = await prisma.$transaction(async (transaction) => {
      const savedAttempt = await transaction.quizAttempt.create({
        data: {
          userId: user.id,
          quizId: lessonSlug,
          score,
          totalQuestions: correctIndexes.length,
          answers: { create: answerRecords },
        },
      });

      const existingProgress = await transaction.lessonProgress.findUnique({
        where: {
          userId_lessonSlug: { userId: user.id, lessonSlug },
        },
        select: { completed: true },
      });

      let completed = existingProgress?.completed ?? false;
      if (passed && !completed) {
        await transaction.lessonProgress.upsert({
          where: {
            userId_lessonSlug: { userId: user.id, lessonSlug },
          },
          create: {
            userId: user.id,
            lessonSlug,
            completed: true,
            completedAt: new Date(),
            lastAccessedAt: new Date(),
          },
          update: {
            completed: true,
            completedAt: new Date(),
            lastAccessedAt: new Date(),
          },
        });
        completed = true;
      }

      return { attempt: savedAttempt, moduleCompleted: completed };
    });

    revalidateQuizPages();

    return NextResponse.json(
      {
        message: "Quiz result saved successfully.",
        saved: true,
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
        passPercent: LESSON_QUIZ_PASS_PERCENT,
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