
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const QUIZ_ID = "dashboard-physics";

const questions = [
  {
    id: "q1",
    text: "What is the SI unit of force?",
    options: ["Joule", "Newton", "Watt", "Pascal"],
    correctIndex: 1,
  },
  {
    id: "q2",
    text: "What happens to acceleration if net force increases while mass stays constant?",
    options: [
      "Acceleration decreases",
      "Acceleration stays zero",
      "Acceleration increases",
      "Mass increases automatically",
    ],
    correctIndex: 2,
  },
  {
    id: "q3",
    text: "Which quantity is measured in hertz (Hz)?",
    options: ["Wavelength", "Frequency", "Force", "Temperature"],
    correctIndex: 1,
  },
  {
    id: "q4",
    text: "Which mirror produces an upright, virtual, smaller image?",
    options: [
      "Concave mirror in every situation",
      "Plane mirror",
      "Convex mirror",
      "None of these",
    ],
    correctIndex: 2,
  },
  {
    id: "q5",
    text: "What is the SI unit of temperature?",
    options: ["Celsius", "Kelvin", "Fahrenheit", "Joule"],
    correctIndex: 1,
  },
];

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

    const data = body as Record<string, unknown>;

    if (
      data.quizSlug !== QUIZ_ID ||
      !Array.isArray(data.answers) ||
      data.answers.length !== questions.length
    ) {
      return NextResponse.json(
        { error: "Invalid quiz submission." },
        { status: 400 }
      );
    }

    const selectedIndexes: number[] = [];

    for (const answer of data.answers) {
      if (
        !answer ||
        typeof answer !== "object" ||
        !Number.isInteger(
          (answer as Record<string, unknown>).selectedAnswer
        )
      ) {
        return NextResponse.json(
          { error: "One or more submitted answers are invalid." },
          { status: 400 }
        );
      }

      const selected = (answer as Record<string, unknown>).selectedAnswer;

      if (typeof selected !== "number" || selected < 0 || selected > 3) {
        return NextResponse.json(
          { error: "Answer choices must be between 0 and 3." },
          { status: 400 }
        );
      }

      selectedIndexes.push(selected);
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

    const answerRecords = questions.map((question, index) => ({
      questionId: question.id,
      questionText: question.text,
      selectedAnswer: question.options[selectedIndexes[index]],
      correctAnswer: question.options[question.correctIndex],
      isCorrect: selectedIndexes[index] === question.correctIndex,
    }));

    const score = answerRecords.filter((answer) => answer.isCorrect).length;

    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: user.id,
        quizId: QUIZ_ID,
        score,
        totalQuestions: questions.length,
        answers: {
          create: answerRecords,
        },
      },
      include: {
        answers: true,
      },
    });

    return NextResponse.json(
      {
        message: "Quiz result saved successfully.",
        attempt: {
          id: attempt.id,
          quizId: attempt.quizId,
          score: attempt.score,
          totalQuestions: attempt.totalQuestions,
          percentage: Math.round(
            (attempt.score / attempt.totalQuestions) * 100
          ),
          createdAt: attempt.createdAt,
          answers: attempt.answers,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to save quiz result:", error);

    return NextResponse.json(
      { error: "Unable to save quiz result. Please try again." },
      { status: 500 }
    );
  }
}
