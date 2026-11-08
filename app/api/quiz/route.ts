import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidateQuizPages } from "@/lib/revalidateQuizPages";

const QUIZ_ID = "dashboard-physics";

const questions = [
  {
    id: "q1",
    text: "A displacement is 3 m east and 4 m north. What is its magnitude?",
    options: ["1 m", "5 m", "7 m", "12 m"],
    correctIndex: 1,
    explanation: "The perpendicular components give |d| = √(3² + 4²) = 5 m.",
  },
  {
    id: "q2",
    text: "A 120 m distance is traveled in 20 s. What is the average speed?",
    options: ["0.17 m/s", "6 m/s", "100 m/s", "2,400 m/s"],
    correctIndex: 1,
    explanation: "Average speed is total distance divided by time: 120 m / 20 s = 6 m/s.",
  },
  {
    id: "q3",
    text: "Which statement correctly distinguishes a scalar from a vector?",
    options: [
      "A scalar has magnitude and direction; a vector has only magnitude.",
      "A vector has magnitude and direction; a scalar has magnitude only.",
      "Both always have direction.",
      "Neither has magnitude.",
    ],
    correctIndex: 1,
    explanation: "Displacement and velocity are vectors; distance, speed, and mass are scalars.",
  },
  {
    id: "q4",
    text: "A 120 N force acts uniformly on an area of 0.040 m². What pressure does it produce?",
    options: ["3 Pa", "48 Pa", "3,000 Pa", "30,000 Pa"],
    correctIndex: 2,
    explanation: "Pressure P = F/A = 120 N / 0.040 m² = 3.0 × 10³ Pa.",
  },
  {
    id: "q5",
    text: "Water of density 1,000 kg/m³ displaces 0.0020 m³. What buoyant force acts on it? Use g = 9.8 m/s².",
    options: ["0.20 N", "1.96 N", "19.6 N", "196 N"],
    correctIndex: 2,
    explanation: "Archimedes' principle gives FB = ρgV = (1,000)(9.8)(0.0020) = 19.6 N.",
  },
  {
    id: "q6",
    text: "For steady incompressible flow, a pipe's cross-sectional area is reduced to half. What happens to flow speed?",
    options: ["It is halved.", "It doubles.", "It stays the same.", "It becomes four times larger."],
    correctIndex: 1,
    explanation: "Continuity requires A₁v₁ = A₂v₂. Halving area makes speed double to conserve volume flow rate.",
  },
  {
    id: "q7",
    text: "How much heat is needed to raise 0.20 kg of water by 5.0 K? Use c = 4,200 J/(kg·K).",
    options: ["420 J", "4,200 J", "21,000 J", "42,000 J"],
    correctIndex: 1,
    explanation: "Q = mcΔT = (0.20 kg)(4,200 J/(kg·K))(5.0 K) = 4,200 J.",
  },
  {
    id: "q8",
    text: "What is 27.0°C in kelvin?",
    options: ["246.15 K", "273.15 K", "300.15 K", "310.15 K"],
    correctIndex: 2,
    explanation: "T(K) = T(°C) + 273.15 = 27.0 + 273.15 = 300.15 K.",
  },
  {
    id: "q9",
    text: "Which heat-transfer process can occur through a vacuum?",
    options: ["Conduction only", "Convection only", "Radiation", "Conduction and convection"],
    correctIndex: 2,
    explanation: "Radiation transfers energy using electromagnetic waves and does not require matter, so it travels through a vacuum.",
  },
  {
    id: "q10",
    text: "A wave has frequency 5.0 Hz and wavelength 0.40 m. What is its speed?",
    options: ["0.080 m/s", "2.0 m/s", "5.4 m/s", "12.5 m/s"],
    correctIndex: 1,
    explanation: "Wave speed v = fλ = (5.0 Hz)(0.40 m) = 2.0 m/s.",
  },
  {
    id: "q11",
    text: "In a fixed medium, wave speed stays constant. If frequency doubles, what happens to wavelength?",
    options: ["It doubles.", "It halves.", "It stays unchanged.", "It becomes four times larger."],
    correctIndex: 1,
    explanation: "Since v = fλ and v is fixed, wavelength λ = v/f is inversely proportional to frequency.",
  },
  {
    id: "q12",
    text: "A sound wave has a period of 0.25 s. What is its frequency?",
    options: ["0.25 Hz", "2 Hz", "4 Hz", "25 Hz"],
    correctIndex: 2,
    explanation: "Frequency is the reciprocal of period: f = 1/T = 1/0.25 s = 4 Hz.",
  },
  {
    id: "q13",
    text: "A sound wave has frequency 25 kHz. How is it classified?",
    options: ["Infrasonic", "Audible", "Ultrasonic", "A pure tone below hearing range"],
    correctIndex: 2,
    explanation: "Ultrasound has frequency greater than about 20 kHz; 25 kHz is above that limit.",
  },
  {
    id: "q14",
    text: "Light travels from air (n₁ = 1.00) into glass (n₂ = 1.50) at 30° to the normal. What is its refracted angle approximately?",
    options: ["19.5°", "30.0°", "48.6°", "60.0°"],
    correctIndex: 0,
    explanation: "Snell's law gives sin θ₂ = (n₁/n₂)sin 30° = 1/3, so θ₂ ≈ 19.5°. It bends toward the normal.",
  },
  {
    id: "q15",
    text: "A convex lens has f = +10 cm and an object is do = 30 cm away. What is the image distance?",
    options: ["−15 cm", "−7.5 cm", "+15 cm", "+30 cm"],
    correctIndex: 2,
    explanation: "1/di = 1/f − 1/do = 1/10 − 1/30 = 1/15 cm⁻¹, so di = +15 cm.",
  },
  {
    id: "q16",
    text: "A light ray strikes a plane mirror at 35° to the normal. What is its reflection angle?",
    options: ["0°", "35°", "55°", "70°"],
    correctIndex: 1,
    explanation: "The law of reflection states that the angle of reflection equals the angle of incidence, both measured from the normal.",
  },
  {
    id: "q17",
    text: "What is the net charge of an object that has three extra electrons?",
    options: ["+4.806 × 10⁻¹⁹ C", "−4.806 × 10⁻¹⁹ C", "−1.602 × 10⁻¹⁹ C", "0 C"],
    correctIndex: 1,
    explanation: "Each electron carries −e, so q = −3(1.602 × 10⁻¹⁹ C) = −4.806 × 10⁻¹⁹ C.",
  },
  {
    id: "q18",
    text: "Two charges, +2.0 nC and −3.0 nC, are 0.30 m apart. What is the force magnitude? Use k = 8.99 × 10⁹ N·m²/C².",
    options: ["6.0 × 10⁻⁸ N", "6.0 × 10⁻⁷ N", "1.8 × 10⁻⁶ N", "6.0 × 10⁻⁵ N"],
    correctIndex: 1,
    explanation: "F = k|q₁q₂|/r² = (8.99 × 10⁹)(6.0 × 10⁻¹⁸)/(0.30²) ≈ 6.0 × 10⁻⁷ N. Opposite signs attract.",
  },
  {
    id: "q19",
    text: "A 0.60 N force acts on a +3.0 μC test charge. What is the electric-field magnitude?",
    options: ["2.0 × 10⁻⁶ N/C", "2.0 × 10⁵ N/C", "5.0 × 10⁻⁶ N/C", "1.8 × 10⁻⁶ N/C"],
    correctIndex: 1,
    explanation: "E = F/|q₀| = 0.60 N/(3.0 × 10⁻⁶ C) = 2.0 × 10⁵ N/C.",
  },
  {
    id: "q20",
    text: "Two 4 Ω resistors are in series with a 12 V ideal source. What current flows?",
    options: ["0.67 A", "1.5 A", "3.0 A", "6.0 A"],
    correctIndex: 1,
    explanation: "Series resistance is 4 Ω + 4 Ω = 8 Ω, so I = V/R = 12 V/8 Ω = 1.5 A.",
  },
];

type SubmittedAnswer = {
  questionId: number;
  selectedOptionId: number;
  optionOrder: number[];
};

function isSubmittedAnswer(value: unknown): value is SubmittedAnswer {
  if (!value || typeof value !== "object") return false;
  const answer = value as Record<string, unknown>;

  return (
    typeof answer.questionId === "number" &&
    Number.isInteger(answer.questionId) &&
    typeof answer.selectedOptionId === "number" &&
    Number.isInteger(answer.selectedOptionId) &&
    Array.isArray(answer.optionOrder) &&
    answer.optionOrder.length === 4 &&
    answer.optionOrder.every(
      (index) =>
        typeof index === "number" &&
        Number.isInteger(index) &&
        index >= 0 &&
        index < 4
    ) &&
    new Set(answer.optionOrder).size === 4
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

    const data = body as Record<string, unknown>;

    if (
      data.quizSlug !== QUIZ_ID ||
      !Array.isArray(data.answers) ||
      data.answers.length !== questions.length ||
      !data.answers.every(isSubmittedAnswer)
    ) {
      return NextResponse.json(
        { error: "Invalid quiz submission." },
        { status: 400 }
      );
    }

    const submittedAnswers = data.answers;
    const seenQuestionIds = new Set(
      submittedAnswers.map((answer) => answer.questionId)
    );

    if (
      seenQuestionIds.size !== questions.length ||
      submittedAnswers.some(
        (answer) =>
          answer.questionId < 0 ||
          answer.questionId >= questions.length ||
          answer.selectedOptionId < 0 ||
          answer.selectedOptionId >= questions[answer.questionId].options.length
      )
    ) {
      return NextResponse.json(
        { error: "Question or answer order is invalid." },
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
      return NextResponse.json(
        { error: "User account not found." },
        { status: 404 }
      );
    }

    const answerRecords = submittedAnswers.map((submitted) => {
      const question = questions[submitted.questionId];
      const displayedChoices = submitted.optionOrder.map(
        (optionIndex) => question.options[optionIndex]
      );

      return {
        questionId: question.id,
        questionText: question.text,
        selectedAnswer: question.options[submitted.selectedOptionId],
        correctAnswer: question.options[question.correctIndex],
        choices: JSON.stringify(displayedChoices),
        explanation: question.explanation,
        isCorrect: submitted.selectedOptionId === question.correctIndex,
      };
    });

    const score = answerRecords.filter((answer) => answer.isCorrect).length;

    if (!user) {
      return NextResponse.json({
        saved: false,
        score,
        totalQuestions: questions.length,
      });
    }

    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: user.id,
        quizId: QUIZ_ID,
        score,
        totalQuestions: questions.length,
        answers: { create: answerRecords },
      },
      include: { answers: true },
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
