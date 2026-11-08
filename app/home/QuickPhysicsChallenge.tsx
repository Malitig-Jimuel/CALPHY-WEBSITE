"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Save,
  XCircle,
} from "lucide-react";
import { useShuffledQuestionOrder } from "../lessons/quizRandomization";

const questions = [
  {
    topic: "Measurements & Vectors",
    question: "A displacement is 3 m east and 4 m north. What is its magnitude?",
    options: ["1 m", "5 m", "7 m", "12 m"],
    answer: 1,
    explanation: "The perpendicular components give |d| = √(3² + 4²) = 5 m.",
  },
  {
    topic: "Measurements & Vectors",
    question: "A 120 m distance is traveled in 20 s. What is the average speed?",
    options: ["0.17 m/s", "6 m/s", "100 m/s", "2,400 m/s"],
    answer: 1,
    explanation: "Average speed is total distance divided by time: 120 m / 20 s = 6 m/s.",
  },
  {
    topic: "Measurements & Vectors",
    question: "Which statement correctly distinguishes a scalar from a vector?",
    options: [
      "A scalar has magnitude and direction; a vector has only magnitude.",
      "A vector has magnitude and direction; a scalar has magnitude only.",
      "Both always have direction.",
      "Neither has magnitude.",
    ],
    answer: 1,
    explanation: "Displacement and velocity are vectors; distance, speed, and mass are scalars.",
  },
  {
    topic: "Fluids",
    question: "A 120 N force acts uniformly on an area of 0.040 m². What pressure does it produce?",
    options: ["3 Pa", "48 Pa", "3,000 Pa", "30,000 Pa"],
    answer: 2,
    explanation: "Pressure P = F/A = 120 N / 0.040 m² = 3.0 × 10³ Pa.",
  },
  {
    topic: "Fluids",
    question: "Water of density 1,000 kg/m³ displaces 0.0020 m³. What buoyant force acts on it? Use g = 9.8 m/s².",
    options: ["0.20 N", "1.96 N", "19.6 N", "196 N"],
    answer: 2,
    explanation: "Archimedes' principle gives FB = ρgV = (1,000)(9.8)(0.0020) = 19.6 N.",
  },
  {
    topic: "Fluids",
    question: "For steady incompressible flow, a pipe's cross-sectional area is reduced to half. What happens to flow speed?",
    options: ["It is halved.", "It doubles.", "It stays the same.", "It becomes four times larger."],
    answer: 1,
    explanation: "Continuity requires A₁v₁ = A₂v₂. Halving area makes speed double to conserve volume flow rate.",
  },
  {
    topic: "Temperature & Heat",
    question: "How much heat is needed to raise 0.20 kg of water by 5.0 K? Use c = 4,200 J/(kg·K).",
    options: ["420 J", "4,200 J", "21,000 J", "42,000 J"],
    answer: 1,
    explanation: "Q = mcΔT = (0.20 kg)(4,200 J/(kg·K))(5.0 K) = 4,200 J.",
  },
  {
    topic: "Temperature & Heat",
    question: "What is 27.0°C in kelvin?",
    options: ["246.15 K", "273.15 K", "300.15 K", "310.15 K"],
    answer: 2,
    explanation: "T(K) = T(°C) + 273.15 = 27.0 + 273.15 = 300.15 K.",
  },
  {
    topic: "Temperature & Heat",
    question: "Which heat-transfer process can occur through a vacuum?",
    options: ["Conduction only", "Convection only", "Radiation", "Conduction and convection"],
    answer: 2,
    explanation: "Radiation transfers energy using electromagnetic waves and does not require matter, so it travels through a vacuum.",
  },
  {
    topic: "Waves & Sound",
    question: "A wave has frequency 5.0 Hz and wavelength 0.40 m. What is its speed?",
    options: ["0.080 m/s", "2.0 m/s", "5.4 m/s", "12.5 m/s"],
    answer: 1,
    explanation: "Wave speed v = fλ = (5.0 Hz)(0.40 m) = 2.0 m/s.",
  },
  {
    topic: "Waves & Sound",
    question: "In a fixed medium, wave speed stays constant. If frequency doubles, what happens to wavelength?",
    options: ["It doubles.", "It halves.", "It stays unchanged.", "It becomes four times larger."],
    answer: 1,
    explanation: "Since v = fλ and v is fixed, wavelength λ = v/f is inversely proportional to frequency.",
  },
  {
    topic: "Waves & Sound",
    question: "A sound wave has a period of 0.25 s. What is its frequency?",
    options: ["0.25 Hz", "2 Hz", "4 Hz", "25 Hz"],
    answer: 2,
    explanation: "Frequency is the reciprocal of period: f = 1/T = 1/0.25 s = 4 Hz.",
  },
  {
    topic: "Waves & Sound",
    question: "A sound wave has frequency 25 kHz. How is it classified?",
    options: ["Infrasonic", "Audible", "Ultrasonic", "A pure tone below hearing range"],
    answer: 2,
    explanation: "Ultrasound has frequency greater than about 20 kHz; 25 kHz is above that limit.",
  },
  {
    topic: "Light & Reflection",
    question: "Light travels from air (n₁ = 1.00) into glass (n₂ = 1.50) at 30° to the normal. What is its refracted angle approximately?",
    options: ["19.5°", "30.0°", "48.6°", "60.0°"],
    answer: 0,
    explanation: "Snell's law gives sin θ₂ = (n₁/n₂)sin 30° = 1/3, so θ₂ ≈ 19.5°. It bends toward the normal.",
  },
  {
    topic: "Light & Reflection",
    question: "A convex lens has f = +10 cm and an object is do = 30 cm away. What is the image distance?",
    options: ["−15 cm", "−7.5 cm", "+15 cm", "+30 cm"],
    answer: 2,
    explanation: "1/di = 1/f − 1/do = 1/10 − 1/30 = 1/15 cm⁻¹, so di = +15 cm.",
  },
  {
    topic: "Light & Reflection",
    question: "A light ray strikes a plane mirror at 35° to the normal. What is its reflection angle?",
    options: ["0°", "35°", "55°", "70°"],
    answer: 1,
    explanation: "The law of reflection states that the angle of reflection equals the angle of incidence, both measured from the normal.",
  },
  {
    topic: "Electric Forces & Electric Field",
    question: "What is the net charge of an object that has three extra electrons?",
    options: ["+4.806 × 10⁻¹⁹ C", "−4.806 × 10⁻¹⁹ C", "−1.602 × 10⁻¹⁹ C", "0 C"],
    answer: 1,
    explanation: "Each electron carries −e, so q = −3(1.602 × 10⁻¹⁹ C) = −4.806 × 10⁻¹⁹ C.",
  },
  {
    topic: "Electric Forces & Electric Field",
    question: "Two charges, +2.0 nC and −3.0 nC, are 0.30 m apart. What is the force magnitude? Use k = 8.99 × 10⁹ N·m²/C².",
    options: ["6.0 × 10⁻⁸ N", "6.0 × 10⁻⁷ N", "1.8 × 10⁻⁶ N", "6.0 × 10⁻⁵ N"],
    answer: 1,
    explanation: "F = k|q₁q₂|/r² = (8.99 × 10⁹)(6.0 × 10⁻¹⁸)/(0.30²) ≈ 6.0 × 10⁻⁷ N. Opposite signs attract.",
  },
  {
    topic: "Electric Forces & Electric Field",
    question: "A 0.60 N force acts on a +3.0 μC test charge. What is the electric-field magnitude?",
    options: ["2.0 × 10⁻⁶ N/C", "2.0 × 10⁵ N/C", "5.0 × 10⁻⁶ N/C", "1.8 × 10⁻⁶ N/C"],
    answer: 1,
    explanation: "E = F/|q₀| = 0.60 N/(3.0 × 10⁻⁶ C) = 2.0 × 10⁵ N/C.",
  },
  {
    topic: "Electric Forces & Electric Field",
    question: "Two 4 Ω resistors are in series with a 12 V ideal source. What current flows?",
    options: ["0.67 A", "1.5 A", "3.0 A", "6.0 A"],
    answer: 1,
    explanation: "Series resistance is 4 Ω + 4 Ω = 8 Ω, so I = V/R = 12 V/8 Ω = 1.5 A.",
  },
] as const;

type SaveState = "idle" | "saving" | "saved" | "guest" | "error";
const questionOptionCounts = questions.map((question) => question.options.length);

export default function QuickPhysicsChallenge() {
  const router = useRouter();
  const [questionOrder, reshuffleQuestions] =
    useShuffledQuestionOrder(questionOptionCounts);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Array<number | null>>(
    () => Array(questions.length).fill(null)
  );
  const [finished, setFinished] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveMessage, setSaveMessage] = useState("");
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const saveLock = useRef(false);

  const challengeQuestions = questionOrder.map(
    ({ questionIndex: originalIndex, optionOrder }) => ({
      ...questions[originalIndex],
      options: optionOrder.map(
        (optionIndex) => questions[originalIndex].options[optionIndex]
      ),
      answer: optionOrder.indexOf(questions[originalIndex].answer),
      questionId: originalIndex,
      optionOrder,
    })
  );
  const currentQuestion = challengeQuestions[questionIndex];
  const selectedAnswer = answers[questionIndex];
  const answeredCount = answers.filter((answer) => answer !== null).length;
  const score = challengeQuestions.reduce(
    (total, question, index) =>
      total + (answers[index] === question.answer ? 1 : 0),
    0
  );

  function chooseAnswer(index: number) {
    if (finished) return;
    setAnswers((previous) =>
      previous.map((answer, question) =>
        question === questionIndex ? index : answer
      )
    );
  }

  async function saveResult(finalAnswers: number[]) {
    if (saveLock.current) return;
    saveLock.current = true;
    setSaveState("saving");
    setSaveMessage("");
    setAttemptId(null);

    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          quizSlug: "dashboard-physics",
          answers: challengeQuestions.map((question, index) => ({
            questionId: question.questionId,
            selectedOptionId: question.optionOrder[finalAnswers[index]],
            optionOrder: question.optionOrder,
          })),
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Could not save your pre-test result.");
      }
      if (typeof result.saved !== "boolean") {
        throw new Error("The pre-test result could not be confirmed.");
      }

      if (result.saved) {
        setSaveState("saved");
        setSaveMessage("Your pre-test result has been saved to your account.");
        setAttemptId(result.attempt.id);
        router.refresh();
      } else {
        setSaveState("guest");
        setSaveMessage(
          "Your score is shown for this session only. Log in or register to save quiz history."
        );
      }
    } catch (error) {
      setSaveState("error");
      setSaveMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving your pre-test result."
      );
    } finally {
      saveLock.current = false;
    }
  }

  function submitPreTest() {
    if (finished || answers.some((answer) => answer === null)) return;
    const finalAnswers = answers.filter(
      (answer): answer is number => answer !== null
    );
    if (finalAnswers.length !== questions.length) return;
    setFinished(true);
    void saveResult(finalAnswers);
  }

  function restartQuiz() {
    setQuestionIndex(0);
    setAnswers(Array(questions.length).fill(null));
    setFinished(false);
    setSaveState("idle");
    setSaveMessage("");
    setAttemptId(null);
    reshuffleQuestions();
  }

  const unansweredNumbers = answers.flatMap((answer, index) =>
    answer === null ? [index + 1] : []
  );
  const incorrectCount = questions.length - score;
  const percentage = Math.round((score / questions.length) * 100);

  return (
    <div className="rounded-2xl border border-slate-700/60 bg-[#10182B] p-5 sm:p-8">
      {finished ? (
        <div>
          <div className="rounded-2xl border border-sky-300/20 bg-sky-300/[0.04] p-5 text-center sm:p-7">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-400/10 text-sky-300">
              <CheckCircle2 size={30} aria-hidden="true" />
            </div>
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-sky-300">
              Pre-test complete
            </p>
            <h3 className="mt-2 text-3xl font-black">
              {score} / {questions.length}
            </h3>
            <p className="mt-1 text-xl font-bold text-sky-300">{percentage}%</p>
            <p className="mt-3 text-sm text-slate-300">
              {score} correct · {incorrectCount} incorrect
            </p>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">
              {percentage >= 90
                ? "Excellent starting knowledge. Use the lessons to deepen and refine what you know."
                : percentage >= 70
                  ? "Strong start. Review the explanations and use the lessons to fill in any gaps."
                  : percentage >= 50
                    ? "You have a useful starting point. The lessons will help you build confidence topic by topic."
                    : "This is your baseline, not a grade. Explore the lessons and try the pre-test again later."}
            </p>
          </div>

          <div
            className={`mt-5 rounded-xl border p-4 ${
              saveState === "saved"
                ? "border-emerald-400/20 bg-emerald-400/5"
                : saveState === "error"
                  ? "border-rose-400/20 bg-rose-400/5"
                  : "border-white/10 bg-white/[0.02]"
            }`}
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              {saveState === "saved" ? (
                <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-400" aria-hidden="true" />
              ) : saveState === "error" ? (
                <XCircle className="mt-0.5 shrink-0 text-rose-400" aria-hidden="true" />
              ) : (
                <Save className="mt-0.5 shrink-0 text-sky-400" aria-hidden="true" />
              )}
              <div>
                <p className="font-semibold">
                  {saveState === "saving"
                    ? "Saving pre-test history…"
                    : saveState === "saved"
                      ? "Pre-test history saved"
                      : saveState === "error"
                        ? "Could not save pre-test history"
                        : saveState === "guest"
                          ? "Pre-test result · Not saved"
                          : "Pre-test result"}
                </p>
                {saveMessage && <p className="mt-1 break-words text-sm leading-6 text-slate-400">{saveMessage}</p>}
                {attemptId && <p className="mt-2 break-all text-xs text-slate-500">Attempt ID: {attemptId}</p>}
                {saveState === "guest" && (
                  <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                    <Link className="font-semibold text-sky-300 hover:text-sky-200" href="/register">Create an account</Link>
                    <Link className="font-semibold text-sky-300 hover:text-sky-200" href="/login">Log in</Link>
                  </p>
                )}
              </div>
            </div>
            {saveState === "error" && (
              <button
                type="button"
                onClick={() => {
                  const finalAnswers = answers.filter(
                    (answer): answer is number => answer !== null
                  );
                  void saveResult(finalAnswers);
                }}
                className="mt-4 rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
              >
                Retry saving
              </button>
            )}
          </div>

          <section aria-labelledby="pretest-review-heading" className="mt-7">
            <h4 id="pretest-review-heading" className="text-xl font-bold">Answer review</h4>
            <div className="mt-4 space-y-3">
              {challengeQuestions.map((question, index) => {
                const isAnswerCorrect = answers[index] === question.answer;
                return (
                  <article
                    key={question.questionId}
                    className={`rounded-xl border p-4 ${
                      isAnswerCorrect
                        ? "border-emerald-400/20 bg-emerald-400/[0.03]"
                        : "border-rose-400/20 bg-rose-400/[0.03]"
                    }`}
                  >
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Question {index + 1} · {question.topic}
                    </p>
                    <p className="mt-2 font-semibold leading-6 text-slate-100">{question.question}</p>
                    <p className="mt-2 text-sm text-slate-400">
                      Your answer: {question.options[answers[index] ?? -1]}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-emerald-200">
                      Correct answer: {question.options[question.answer]}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{question.explanation}</p>
                  </article>
                );
              })}
            </div>
          </section>

          <button
            type="button"
            onClick={restartQuiz}
            className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl bg-sky-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-sky-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
          >
            <RotateCcw size={17} aria-hidden="true" />
            Try Again
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="rounded-full bg-sky-400/10 px-3 py-1.5 text-xs font-semibold text-sky-300">
              Question {questionIndex + 1} of {questions.length}
            </span>
            <span className="text-sm text-slate-400">
              Answered: <strong className="text-white">{answeredCount} / {questions.length}</strong>
            </span>
          </div>

          <div
            className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"
            role="progressbar"
            aria-label="Pre-test questions answered"
            aria-valuemin={0}
            aria-valuemax={questions.length}
            aria-valuenow={answeredCount}
          >
            <div
              className="h-full rounded-full bg-sky-300 transition-all duration-300"
              style={{ width: `${(answeredCount / questions.length) * 100}%` }}
            />
          </div>

          <div className="mt-5 rounded-xl border border-white/10 bg-[#080D1B]/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-200">Question navigator</h3>
              <p className="text-xs text-slate-500">Filled = answered · outlined = unanswered</p>
            </div>
            <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-10">
              {challengeQuestions.map((question, index) => {
                const answered = answers[index] !== null;
                const current = index === questionIndex;
                return (
                  <button
                    key={question.questionId}
                    type="button"
                    aria-label={`Question ${index + 1}, ${answered ? "answered" : "unanswered"}${current ? ", current question" : ""}`}
                    aria-current={current ? "step" : undefined}
                    onClick={() => setQuestionIndex(index)}
                    className={`flex h-9 items-center justify-center rounded-lg border text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 ${
                      current
                        ? "border-sky-300 bg-sky-400 text-slate-950"
                        : answered
                          ? "border-emerald-300/40 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/20"
                          : "border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/30"
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-violet-400/10 px-3 py-1 text-xs font-semibold text-violet-200">
                {currentQuestion.topic}
              </span>
              {selectedAnswer !== null && (
                <span className="text-xs font-semibold text-emerald-300">Answer selected</span>
              )}
            </div>
            <h3 className="mt-4 text-lg font-bold leading-relaxed sm:text-xl">
              {currentQuestion.question}
            </h3>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                return (
                  <button
                    key={`${currentQuestion.questionId}-${index}`}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => chooseAnswer(index)}
                    className={`flex min-h-14 items-center gap-3 rounded-xl border p-4 text-left text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 ${
                      isSelected
                        ? "border-sky-300/60 bg-sky-400/10 text-sky-100"
                        : "border-white/10 bg-white/[0.02] text-slate-200 hover:border-sky-400/40 hover:bg-white/[0.04]"
                    }`}
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold">
                      {String.fromCharCode(65 + index)}
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              disabled={questionIndex === 0}
              onClick={() => setQuestionIndex((index) => Math.max(0, index - 1))}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
            >
              <ChevronLeft size={17} aria-hidden="true" />
              Previous
            </button>
            <button
              type="button"
              disabled={questionIndex === questions.length - 1}
              onClick={() => setQuestionIndex((index) => Math.min(questions.length - 1, index + 1))}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
            >
              Next
              <ChevronRight size={17} aria-hidden="true" />
            </button>
          </div>

          <div className="mt-6 border-t border-white/10 pt-5">
            {unansweredNumbers.length > 0 && (
              <p className="mb-3 text-sm leading-6 text-amber-200" aria-live="polite">
                {unansweredNumbers.length} question{unansweredNumbers.length === 1 ? "" : "s"} unanswered:{" "}
                {unansweredNumbers.join(", ")}. Select a number above to review it before submitting.
              </p>
            )}
            <button
              type="button"
              disabled={answeredCount !== questions.length}
              onClick={submitPreTest}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-sky-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
            >
              Submit Pre-Test
              <CheckCircle2 size={17} aria-hidden="true" />
            </button>
            {answeredCount !== questions.length && (
              <p className="mt-2 text-xs text-slate-500">Answer all 20 questions to submit. Your pre-test does not complete any lesson.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
