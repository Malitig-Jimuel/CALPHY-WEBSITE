"use client";

import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  RotateCcw,
  Waves,
  Lightbulb,
  Calculator,
  BookOpen,
  XCircle,
} from "lucide-react";
import LessonQuizFeedback from "../LessonQuizFeedback";
import {
  LessonQuizEligibilityNotice,
  useLessonQuizEligibility,
} from "../LessonQuizEligibility";
import LessonHeader from "../LessonHeader";
import LessonProgressTracker from "../LessonProgressTracker";
import LessonNavigation from "../LessonNavigation";
import LessonQuizQuestion, {
  getQuizOptionClass,
  QUIZ_OPTION_BASE_CLASS,
  QUIZ_RETRY_BUTTON_CLASS,
  QUIZ_SUBMIT_BUTTON_CLASS,
} from "../LessonQuizQuestion";
import { useLessonQuizResult } from "../useLessonQuizResult";
import { useShuffledQuestionOrder } from "../quizRandomization";

/* ------------------------------------------------------------------ */
/* Shared style helpers                                                */
/* ------------------------------------------------------------------ */

// Visible keyboard focus for every interactive element.
const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300";

/* ------------------------------------------------------------------ */
/* Quiz data                                                           */
/* ------------------------------------------------------------------ */

const questions = [
  {
    q: "What is visible light?",
    options: [
      "A mechanical wave that needs air",
      "Electromagnetic radiation visible to the human eye",
      "A type of sound wave",
      "A stream of water particles",
    ],
    a: 1,
    why: "Visible light is electromagnetic radiation that the unaided human eye can detect.",
  },
  {
    q: "Which scientist demonstrated that electromagnetic waves can propagate through changing electric and magnetic fields?",
    options: [
      "Isaac Newton",
      "Christian Huygens",
      "James Clerk Maxwell",
      "Galileo Galilei",
    ],
    a: 2,
    why: "James Clerk Maxwell developed the electromagnetic theory that describes electromagnetic waves.",
  },
  {
    q: "Which statement correctly describes an electromagnetic wave?",
    options: [
      "It must travel through air",
      "Its fields are parallel to the direction of travel",
      "It cannot travel through a vacuum",
      "Its electric and magnetic fields are perpendicular to its direction of travel",
    ],
    a: 3,
    why: "Electromagnetic waves are transverse waves. Their electric and magnetic fields are perpendicular to the direction of propagation.",
  },
  {
    q: "Which scientist proposed the corpuscular theory of light?",
    options: [
      "Isaac Newton",
      "Max Planck",
      "James Clerk Maxwell",
      "Christian Huygens",
    ],
    a: 0,
    why: "Newton's corpuscular theory described light as tiny particles called corpuscles.",
  },
  {
    q: "What is the law of reflection?",
    options: [
      "The angle of incidence is always 90°",
      "The angle of incidence equals the angle of reflection",
      "The reflected ray always follows the normal",
      "The angle of reflection is always twice the incident angle",
    ],
    a: 1,
    why: "The law of reflection states that the angle of incidence equals the angle of reflection, with both measured from the normal.",
  },
  {
    q: "From which line are the angles of incidence and reflection measured?",
    options: [
      "The mirror surface",
      "The horizontal line",
      "The normal to the surface",
      "The reflected ray",
    ],
    a: 2,
    why: "The normal is an imaginary line perpendicular to the reflecting surface at the point where light strikes.",
  },
  {
    q: "What type of image does a plane mirror produce for an ordinary object?",
    options: [
      "Real, inverted, and enlarged",
      "Virtual, upright, and the same size",
      "Real, upright, and smaller",
      "Virtual, inverted, and enlarged",
    ],
    a: 1,
    why: "A plane mirror forms a virtual, upright image with the same size as the object.",
  },
  {
    q: "Where does a plane mirror form an image?",
    options: [
      "At the mirror surface in every case",
      "At twice the object's distance in front",
      "Behind the mirror at the same distance as the object is in front",
      "Always at the focal point",
    ],
    a: 2,
    why: "The image distance behind a plane mirror equals the object's distance in front of it.",
  },
  {
    q: "Which mirror curves inward and can produce either real or virtual images?",
    options: [
      "Plane mirror",
      "Convex mirror",
      "Flat glass plate",
      "Concave mirror",
    ],
    a: 3,
    why: "A concave mirror converges parallel incident rays and can form real or virtual images depending on object position.",
  },
  {
    q: "What image does a convex mirror form for an ordinary real object?",
    options: [
      "Virtual, upright, and smaller",
      "Real, inverted, and larger",
      "Real, upright, and the same size",
      "Virtual, inverted, and larger",
    ],
    a: 0,
    why: "A convex mirror diverges reflected rays and forms a virtual, upright, reduced image.",
  },
  {
    q: "An object is beyond C in front of a concave mirror. Where is its image formed?",
    options: [
      "Behind the mirror",
      "Between C and F",
      "Beyond C and upright",
      "At infinity in every case",
    ],
    a: 1,
    why: "For an object beyond the center of curvature C, the image forms between C and F. It is real, inverted, and smaller.",
  },
  {
    q: "An object is placed between F and a concave mirror. What image is formed?",
    options: [
      "Real, inverted, and smaller",
      "Real, inverted, and the same size",
      "Virtual, upright, and enlarged",
      "Virtual, inverted, and smaller",
    ],
    a: 2,
    why: "When an object is inside the focal length of a concave mirror, the reflected rays diverge and their extensions form a virtual, upright, enlarged image.",
  },
  {
    q: "What does a negative magnification indicate for a mirror image?",
    options: [
      "The image is always virtual",
      "The image has zero height",
      "The image is upright",
      "The image is inverted",
    ],
    a: 3,
    why: "Using M = hi/ho = -di/do, a negative magnification indicates an inverted image.",
  },
  {
    q: "A concave mirror has a radius of curvature of 30 cm. What is its focal length?",
    options: ["15 cm", "30 cm", "60 cm", "10 cm"],
    a: 0,
    why: "Using R = 2f, f = R/2 = 30/2 = 15 cm.",
  },
  {
    q: "An object is at the focal point of an ideal concave mirror. What happens to the rays after they reflect from the mirror?",
    options: [
      "They converge at C",
      "They leave parallel to the principal axis, so the image is at infinity in the ideal ray model",
      "They form an upright image at the mirror surface",
      "They immediately return through the object",
    ],
    a: 1,
    why: "An object at F sends rays that reflect parallel to the principal axis. They never meet at a finite image distance.",
  },
  {
    q: "A concave mirror has f = +12 cm. An object is 36 cm in front of it. What is the image distance?",
    options: ["+9 cm", "+24 cm", "+18 cm", "-18 cm"],
    a: 2,
    why: "1/di = 1/f - 1/do = 1/12 - 1/36 = 1/18. Therefore di = +18 cm, a real image in front of the mirror.",
  },
  {
    q: "A concave mirror has f = +15 cm. An object is 10 cm in front of it. What is the image distance?",
    options: ["+30 cm", "+6 cm", "-6 cm", "-30 cm"],
    a: 3,
    why: "1/di = 1/15 - 1/10 = -1/30. Therefore di = -30 cm, meaning the image is virtual and behind the mirror.",
  },
  {
    q: "A convex mirror has f = -20 cm. An object is 30 cm in front of it. Find the image distance.",
    options: ["-12 cm", "+12 cm", "-50 cm", "+50 cm"],
    a: 0,
    why: "1/di = 1/f - 1/do = -1/20 - 1/30 = -1/12. Therefore di = -12 cm, behind the mirror.",
  },
  {
    q: "A concave mirror has a radius of curvature of +24 cm. What is its focal length?",
    options: ["+48 cm", "+12 cm", "-12 cm", "-24 cm"],
    a: 1,
    why: "Using R = 2f, f = R/2 = +24/2 = +12 cm.",
  },
  {
    q: "An object 4 cm tall is 20 cm in front of a concave mirror with f = +10 cm. What is the image height?",
    options: ["+4 cm", "+2 cm", "-4 cm", "-2 cm"],
    a: 2,
    why: "The mirror equation gives di = +20 cm. Then M = -di/do = -20/20 = -1. Thus hi = Mho = -1(4) = -4 cm. The image is inverted and the same size.",
  },
];

const quizOptionCounts = questions.map((question) => question.options.length);

/* ------------------------------------------------------------------ */
/* Worked examples                                                     */
/* ------------------------------------------------------------------ */

interface WorkedExampleData {
  title: string;
  problem: string;
  given: string[];
  find: string;
  formula: string[];
  substitution: string[];
  calculation: string[];
  answer: string;
  meaning: string;
}

const workedExamples: WorkedExampleData[] = [
  {
    title: "Example 1: Concave mirror, object beyond C",
    problem:
      "A 4 cm tall object is 30 cm in front of a concave mirror with focal length +10 cm. Find the image distance, magnification, and image height.",
    given: ["do = 30 cm", "f = +10 cm", "ho = 4 cm"],
    find: "Image distance di, magnification M, and image height hi.",
    formula: [
      "Mirror equation: 1/f = 1/do + 1/di, so di = 1 / (1/f − 1/do)",
      "Magnification: M = −di/do; image height: hi = M × ho",
    ],
    substitution: [
      "1/di = 1/(10 cm) − 1/(30 cm)",
      "1/di = 3/(30 cm) − 1/(30 cm) = 2/(30 cm) = 1/(15 cm)",
    ],
    calculation: [
      "di = 1 / (1/(15 cm)) = +15 cm",
      "M = −(+15 cm)/(30 cm) = −0.5",
      "hi = (−0.5)(4 cm) = −2 cm",
    ],
    answer: "di = +15 cm, M = −0.5, hi = −2 cm",
    meaning:
      "The positive di means a real image 15 cm in front of the mirror. The negative M means it is inverted, and |M| < 1 means it is reduced to half size. The object is beyond C (C is at 20 cm), so this matches the table above.",
  },
  {
    title: "Example 2: Convex mirror",
    problem:
      "A 5 cm tall object is 30 cm in front of a convex mirror with focal length −20 cm. Find the image distance, magnification, and image height.",
    given: ["do = 30 cm", "f = −20 cm (convex, so negative)", "ho = 5 cm"],
    find: "Image distance di, magnification M, and image height hi.",
    formula: [
      "Mirror equation: 1/f = 1/do + 1/di, so di = 1 / (1/f − 1/do)",
      "Magnification: M = −di/do; image height: hi = M × ho",
    ],
    substitution: [
      "1/di = 1/(−20 cm) − 1/(30 cm)",
      "1/di = −3/(60 cm) − 2/(60 cm) = −5/(60 cm) = −1/(12 cm)",
    ],
    calculation: [
      "di = 1 / (−1/(12 cm)) = −12 cm",
      "M = −(−12 cm)/(30 cm) = +0.4",
      "hi = (+0.4)(5 cm) = +2 cm",
    ],
    answer: "di = −12 cm, M = +0.4, hi = +2 cm",
    meaning:
      "The negative di means a virtual image 12 cm behind the mirror. The positive M means it is upright, and |M| < 1 means it is reduced. This is why a convex mirror gives a wide, small view.",
  },
  {
    title: "Example 3: Concave mirror, object inside F",
    problem:
      "A 2 cm tall object is 10 cm in front of a concave mirror with focal length +15 cm. Find the image distance, magnification, and image height.",
    given: ["do = 10 cm", "f = +15 cm", "ho = 2 cm"],
    find: "Image distance di, magnification M, and image height hi.",
    formula: [
      "Mirror equation: 1/f = 1/do + 1/di, so di = 1 / (1/f − 1/do)",
      "Magnification: M = −di/do; image height: hi = M × ho",
    ],
    substitution: [
      "1/di = 1/(15 cm) − 1/(10 cm)",
      "1/di = 2/(30 cm) − 3/(30 cm) = −1/(30 cm)",
    ],
    calculation: [
      "di = 1 / (−1/(30 cm)) = −30 cm",
      "M = −(−30 cm)/(10 cm) = +3",
      "hi = (+3)(2 cm) = +6 cm",
    ],
    answer: "di = −30 cm, M = +3, hi = +6 cm",
    meaning:
      "The negative di means a virtual image 30 cm behind the mirror. The positive M means it is upright, and |M| > 1 means it is enlarged. This is how a makeup or shaving mirror works.",
  },
];

const additionalWorkedExamples: WorkedExampleData[] = [
  {
    title: "Snell's law: air to water",
    problem:
      "A light ray travels from air (n₁ = 1.00) into water (n₂ = 1.33) at 30° to the normal. Find its angle in water.",
    given: ["n₁ = 1.00", "n₂ = 1.33", "θ₁ = 30°"],
    find: "The refracted angle θ₂.",
    formula: ["Snell's law: n₁ sin θ₁ = n₂ sin θ₂"],
    substitution: ["sin θ₂ = (n₁/n₂) sin θ₁", "sin θ₂ = (1.00/1.33) sin 30°"],
    calculation: ["sin θ₂ = 0.3759", "θ₂ = sin⁻¹(0.3759) = 22.1°"],
    answer: "θ₂ ≈ 22.1° from the normal",
    meaning:
      "Water has a larger refractive index than air, so the ray slows and bends toward the normal.",
  },
  {
    title: "Refraction: speed of light in glass",
    problem:
      "Light travels through a glass with refractive index n = 1.50. Find its speed if c = 3.00 × 10⁸ m/s.",
    given: ["n = 1.50", "c = 3.00 × 10⁸ m/s"],
    find: "The speed v of light in glass.",
    formula: ["Refractive index: n = c/v", "Rearrange: v = c/n"],
    substitution: ["v = (3.00 × 10⁸ m/s)/(1.50)"],
    calculation: ["v = 2.00 × 10⁸ m/s"],
    answer: "v = 2.00 × 10⁸ m/s",
    meaning:
      "The refractive index compares the vacuum speed of light with its speed in the material. The frequency does not change at the boundary, but wavelength does.",
  },
  {
    title: "Convex lens image",
    problem:
      "A 4 cm object is 30 cm from a convex lens with focal length +10 cm. Find di, magnification, and image height.",
    given: ["do = +30 cm", "f = +10 cm", "ho = +4 cm"],
    find: "Image distance di, magnification M, and image height hi.",
    formula: ["1/f = 1/do + 1/di", "M = −di/do; hi = Mho"],
    substitution: ["1/di = 1/(10 cm) − 1/(30 cm) = 1/(15 cm)", "di = +15 cm"],
    calculation: ["M = −15/30 = −0.50", "hi = (−0.50)(4 cm) = −2.0 cm"],
    answer: "di = +15 cm, M = −0.50, hi = −2.0 cm",
    meaning:
      "The image is real, inverted, and half the object's height because di is positive and M is negative with |M| < 1.",
  },
  {
    title: "Concave lens image",
    problem:
      "A 4 cm object is 30 cm from a concave lens with focal length −10 cm. Find di, magnification, and image height.",
    given: ["do = +30 cm", "f = −10 cm", "ho = +4 cm"],
    find: "Image distance di, magnification M, and image height hi.",
    formula: ["1/f = 1/do + 1/di", "M = −di/do; hi = Mho"],
    substitution: ["1/di = 1/(−10 cm) − 1/(30 cm) = −2/(15 cm)", "di = −7.5 cm"],
    calculation: ["M = −(−7.5)/30 = +0.25", "hi = (+0.25)(4 cm) = +1.0 cm"],
    answer: "di = −7.5 cm, M = +0.25, hi = +1.0 cm",
    meaning:
      "The image is virtual, upright, and reduced. A concave lens diverges the rays, so their backward extensions meet on the object side.",
  },
];

const opticsPracticeQuestions = [
  {
    topic: "Refraction",
    question: "Light moves from air into water. Which way does it bend?",
    options: ["Toward the normal", "Away from the normal", "It always reflects completely"],
    answer: 0,
    explanation:
      "Water has a higher refractive index than air. The light slows as it enters water and bends toward the normal.",
  },
  {
    topic: "Snell's law",
    question:
      "For n₁ = 1.00, θ₁ = 30°, and n₂ = 1.50, what is θ₂ approximately?",
    options: ["19.5°", "30.0°", "48.6°"],
    answer: 0,
    explanation:
      "sin θ₂ = (n₁/n₂)sin θ₁ = (1/1.5)(0.5) = 1/3, so θ₂ = sin⁻¹(1/3) ≈ 19.5°.",
  },
  {
    topic: "Lens image",
    question:
      "A convex lens forms an image with positive di using the real-object sign convention. What type of image is it?",
    options: ["Real", "Virtual", "No image can form"],
    answer: 0,
    explanation:
      "For lenses, a positive image distance means the refracted rays actually meet on the opposite side of the lens: a real image.",
  },
  {
    topic: "Optical instruments",
    question: "Which instrument uses an objective and eyepiece to view distant objects?",
    options: ["Telescope", "Magnifying glass", "Human eye"],
    answer: 0,
    explanation:
      "A telescope's objective collects light from a distant object and the eyepiece magnifies the resulting image for viewing.",
  },
];

function OpticsPractice() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const question = opticsPracticeQuestions[questionIndex];
  const correct = selectedAnswer === question.answer;

  return (
    <section
      id="optics-practice"
      className="mb-10 scroll-mt-28 rounded-3xl border border-emerald-400/20 bg-[#111A2E] p-6 md:p-8"
    >
      <p className="text-sm font-semibold text-emerald-300">INTERACTIVE PRACTICE</p>
      <h2 className="mt-2 text-2xl font-bold md:text-3xl">Check your optics understanding</h2>
      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,0.65fr)_minmax(0,1.35fr)]">
        <label htmlFor="optics-practice-question" className="text-sm font-semibold text-slate-300">
          Choose a practice topic
          <select
            id="optics-practice-question"
            value={questionIndex}
            onChange={(event) => {
              setQuestionIndex(Number(event.target.value));
              setSelectedAnswer(null);
            }}
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-3 text-white"
          >
            {opticsPracticeQuestions.map((item, index) => (
              <option key={item.topic} value={index}>{item.topic}</option>
            ))}
          </select>
        </label>
        <div>
          <p className="font-semibold leading-7 text-slate-100">{question.question}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {question.options.map((option, index) => (
              <button
                key={option}
                type="button"
                aria-pressed={selectedAnswer === index}
                onClick={() => setSelectedAnswer(index)}
                className={`rounded-xl border p-3 text-left text-sm transition ${FOCUS} ${
                  selectedAnswer === index
                    ? index === question.answer
                      ? "border-emerald-400 bg-emerald-400/10 text-emerald-200"
                      : "border-rose-400 bg-rose-400/10 text-rose-200"
                    : "border-white/10 bg-[#080D1B] text-slate-300 hover:border-emerald-300/50"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          {selectedAnswer !== null && (
            <p
              role="status"
              aria-live="polite"
              className={`mt-4 rounded-xl p-4 text-sm leading-6 ${
                correct
                  ? "bg-emerald-400/10 text-emerald-200"
                  : "bg-rose-400/10 text-rose-200"
              }`}
            >
              {correct ? "Correct! " : "Not quite. "}
              {question.explanation}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Mirror physics helpers                                              */
/* ------------------------------------------------------------------ */

type MirrorType = "plane" | "concave" | "convex";
type MirrorMeasurement = "focal" | "radius";
type ImageKind = "real" | "virtual" | "none";

// Allowed input ranges (centimeters)
const DO_MIN = 1;
const DO_MAX = 100;
const HO_MIN = 1;
const HO_MAX = 10;
const F_MIN = 1;
const F_MAX = 100;
const R_MIN = 2;
const R_MAX = 200;

const IMAGE_CHOICES: { value: ImageKind; label: string }[] = [
  { value: "real", label: "Real" },
  { value: "virtual", label: "Virtual" },
  { value: "none", label: "No finite image" },
];

const KIND_SENTENCE: Record<ImageKind, string> = {
  real: "a real image, because the reflected rays actually meet in front of the mirror",
  virtual:
    "a virtual image, because the reflected rays diverge and only their backward extensions meet behind the mirror",
  none: "no finite image, because the reflected rays leave parallel to each other and never meet",
};

interface MirrorResult {
  /** Signed focal length in cm: + concave, - convex, Infinity for plane. */
  focal: number;
  /** Signed image distance in cm (+ real/in front, - virtual/behind). null = no finite image. */
  imageDistance: number | null;
  magnification: number | null;
  imageHeight: number | null;
  kind: ImageKind;
  atFocalPoint: boolean;
}

function parseInput(raw: string, min: number, max: number): number | null {
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value < min || value > max) return null;
  return value;
}

function formatInput(value: number): string {
  return String(Number(value.toFixed(4)));
}

function fmt(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return "∞";
  if (Math.abs(value) >= 10000) return value.toExponential(2);
  const text = value.toFixed(digits);
  // Avoid showing "-0.00".
  return Number(text) === 0 ? (0).toFixed(digits) : text;
}

function fmtSigned(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return "∞";
  const text = fmt(value, digits);
  return value > 0 && Number(text) !== 0 ? `+${text}` : text;
}

function computeMirror(
  type: MirrorType,
  objectDistance: number,
  objectHeight: number,
  focalMagnitude: number
): MirrorResult {
  if (type === "plane") {
    return {
      focal: Infinity,
      imageDistance: -objectDistance,
      magnification: 1,
      imageHeight: objectHeight,
      kind: "virtual",
      atFocalPoint: false,
    };
  }

  const focal = type === "concave" ? focalMagnitude : -focalMagnitude;

  if (Math.abs(objectDistance - focal) < 1e-3) {
    return {
      focal,
      imageDistance: null,
      magnification: null,
      imageHeight: null,
      kind: "none",
      atFocalPoint: true,
    };
  }

  // di = (do × f) / (do − f)
  const imageDistance = (objectDistance * focal) / (objectDistance - focal);
  // m = −di / do
  const magnification = -imageDistance / objectDistance;
  return {
    focal,
    imageDistance,
    magnification,
    imageHeight: magnification * objectHeight,
    kind: imageDistance > 0 ? "real" : "virtual",
    atFocalPoint: false,
  };
}

/* ------------------------------------------------------------------ */
/* Ray diagram geometry                                                */
/* ------------------------------------------------------------------ */

interface Pt {
  x: number;
  y: number;
}

interface RayPath {
  id: string;
  hit: Pt;
  end: Pt;
  ext: Pt | null;
}

interface Geometry {
  objectBase: Pt;
  objectTip: Pt;
  focal: Pt | null;
  center: Pt | null;
  rays: RayPath[];
  constructions: { id: string; from: Pt; to: Pt }[];
  image: { base: Pt; tip: Pt } | null;
  notes: string[];
}

type RefractionMaterial = "air" | "water" | "glass" | "diamond" | "custom";
type LensType = "convex" | "concave";

const refractionMaterials: Record<
  Exclude<RefractionMaterial, "custom">,
  { label: string; index: number }
> = {
  air: { label: "Air", index: 1.0003 },
  water: { label: "Water", index: 1.333 },
  glass: { label: "Glass", index: 1.5 },
  diamond: { label: "Diamond", index: 2.42 },
};

function RefractionSimulator() {
  const [firstMaterial, setFirstMaterial] = useState<RefractionMaterial>("air");
  const [secondMaterial, setSecondMaterial] =
    useState<RefractionMaterial>("water");
  const [firstIndexInput, setFirstIndexInput] = useState("1.0003");
  const [secondIndexInput, setSecondIndexInput] = useState("1.333");
  const [incidenceInput, setIncidenceInput] = useState("45");

  const firstIndex = Number(firstIndexInput);
  const secondIndex = Number(secondIndexInput);
  const incidenceAngle = Number(incidenceInput);
  const inputValid =
    firstIndexInput.trim() !== "" &&
    secondIndexInput.trim() !== "" &&
    incidenceInput.trim() !== "" &&
    Number.isFinite(firstIndex) &&
    Number.isFinite(secondIndex) &&
    Number.isFinite(incidenceAngle) &&
    firstIndex >= 1 &&
    secondIndex >= 1 &&
    incidenceAngle >= 0 &&
    incidenceAngle <= 90;
  const sineRefraction =
    inputValid
      ? (firstIndex * Math.sin((incidenceAngle * Math.PI) / 180)) / secondIndex
      : Number.NaN;
  const totalInternalReflection = inputValid && sineRefraction > 1;
  const refractionAngle =
    inputValid && !totalInternalReflection
      ? (Math.asin(Math.min(1, Math.max(-1, sineRefraction))) * 180) / Math.PI
      : null;
  const reflectionAngle = incidenceAngle;
  const firstLabel =
    firstMaterial === "custom"
      ? "First medium"
      : refractionMaterials[firstMaterial].label;
  const secondLabel =
    secondMaterial === "custom"
      ? "Second medium"
      : refractionMaterials[secondMaterial].label;
  const incidentRadians = (incidenceAngle * Math.PI) / 180;
  const reflectedRadians = (reflectionAngle * Math.PI) / 180;
  const refractedRadians =
    refractionAngle === null ? 0 : (refractionAngle * Math.PI) / 180;
  const hit = { x: 180, y: 145 };
  const incidentStart = {
    x: hit.x - Math.sin(incidentRadians) * 112,
    y: hit.y - Math.cos(incidentRadians) * 112,
  };
  const reflectedEnd = {
    x: hit.x + Math.sin(reflectedRadians) * 112,
    y: hit.y - Math.cos(reflectedRadians) * 112,
  };
  const refractedEnd = {
    x: hit.x + Math.sin(refractedRadians) * 120,
    y: hit.y + Math.cos(refractedRadians) * 120,
  };

  function selectMaterial(
    side: "first" | "second",
    material: RefractionMaterial
  ) {
    if (side === "first") {
      setFirstMaterial(material);
      if (material !== "custom") {
        setFirstIndexInput(String(refractionMaterials[material].index));
      }
    } else {
      setSecondMaterial(material);
      if (material !== "custom") {
        setSecondIndexInput(String(refractionMaterials[material].index));
      }
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-[#080D1B] p-5 md:p-6">
      <h3 className="text-xl font-bold text-cyan-200">
        Interactive Snell&apos;s law simulation
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        Choose two media or select Custom and enter refractive indices. Angles
        are measured from the normal. The ray and calculated angle update as
        the values change.
      </p>
      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="space-y-4">
          {[
            {
              side: "first" as const,
              title: "Initial medium",
              selected: firstMaterial,
              indexValue: firstIndexInput,
              setIndex: setFirstIndexInput,
            },
            {
              side: "second" as const,
              title: "Second medium",
              selected: secondMaterial,
              indexValue: secondIndexInput,
              setIndex: setSecondIndexInput,
            },
          ].map((medium) => (
            <div key={medium.side} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <label
                htmlFor={`${medium.side}-material`}
                className="block text-sm font-semibold text-slate-200"
              >
                {medium.title}
              </label>
              <select
                id={`${medium.side}-material`}
                value={medium.selected}
                onChange={(event) =>
                  selectMaterial(medium.side, event.target.value as RefractionMaterial)
                }
                className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
              >
                {Object.entries(refractionMaterials).map(([key, material]) => (
                  <option key={key} value={key}>{material.label}</option>
                ))}
                <option value="custom">Custom refractive index</option>
              </select>
              <label
                htmlFor={`${medium.side}-index`}
                className="mt-3 block text-sm text-slate-300"
              >
                Refractive index n
              </label>
              <input
                id={`${medium.side}-index`}
                type="number"
                min="1"
                step="any"
                value={medium.indexValue}
                onChange={(event) => {
                  medium.setIndex(event.target.value);
                  if (medium.side === "first") setFirstMaterial("custom");
                  else setSecondMaterial("custom");
                }}
                aria-invalid={!Number.isFinite(Number(medium.indexValue)) || Number(medium.indexValue) < 1}
                className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:border-cyan-300 focus:outline-none"
              />
            </div>
          ))}
          <label htmlFor="incidence-angle" className="block text-sm text-slate-300">
            Angle of incidence θ₁ (degrees)
            <input
              id="incidence-angle"
              type="number"
              min="0"
              max="90"
              step="any"
              value={incidenceInput}
              onChange={(event) => setIncidenceInput(event.target.value)}
              aria-invalid={!Number.isFinite(incidenceAngle) || incidenceAngle < 0 || incidenceAngle > 90}
              className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:border-cyan-300 focus:outline-none"
            />
          </label>
          {!inputValid && (
            <p role="alert" className="text-sm leading-6 text-rose-300">
              Enter refractive indices of at least 1 and an incidence angle from 0° to 90°.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-slate-900/70 p-3 sm:p-4">
          <svg
            viewBox="0 0 360 300"
            role="img"
            aria-label={
              !inputValid
                ? "Refraction diagram awaiting valid input"
                : totalInternalReflection
                  ? `Total internal reflection at the interface, incidence angle ${incidenceAngle} degrees`
                  : `Light ray refracting from ${firstLabel} into ${secondLabel}; incidence ${incidenceAngle} degrees and refraction ${refractionAngle?.toFixed(1)} degrees`
            }
            className="h-auto w-full"
          >
            <defs>
              <marker id="snellIncidentArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" fill="#60A5FA" />
              </marker>
              <marker id="snellRefractedArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" fill="#34D399" />
              </marker>
            </defs>
            <rect x="0" y="0" width="360" height="145" rx="10" fill="#0F172A" />
            <rect x="0" y="145" width="360" height="155" fill="#0E3342" opacity=".8" />
            <line x1="0" y1="145" x2="360" y2="145" stroke="#CBD5E1" strokeWidth="2" />
            <line x1="180" y1="18" x2="180" y2="282" stroke="#94A3B8" strokeDasharray="6 5" />
            <text x="190" y="30" fill="#CBD5E1" fontSize="12">Normal</text>
            <text x="12" y="25" fill="#CBD5E1" fontSize="12">
              {firstLabel} · n₁ = {inputValid ? firstIndex.toFixed(3) : "—"}
            </text>
            <text x="12" y="286" fill="#BAE6FD" fontSize="12">
              {secondLabel} · n₂ = {inputValid ? secondIndex.toFixed(3) : "—"}
            </text>
            {inputValid && (
              <>
                <line
                  x1={incidentStart.x}
                  y1={incidentStart.y}
                  x2={hit.x}
                  y2={hit.y}
                  stroke="#60A5FA"
                  strokeWidth="4"
                  markerEnd="url(#snellIncidentArrow)"
                />
                <circle cx={hit.x} cy={hit.y} r="4" fill="#F8FAFC" />
                <path
                  d={`M180 110 A35 35 0 0 0 ${180 - Math.sin(incidentRadians) * 35} ${145 - Math.cos(incidentRadians) * 35}`}
                  fill="none"
                  stroke="#FBBF24"
                  strokeWidth="2"
                />
                <text x="141" y="113" fill="#FDE68A" fontSize="12">
                  θ₁ {incidenceAngle.toFixed(1)}°
                </text>
                {totalInternalReflection ? (
                  <>
                    <line
                      x1={hit.x}
                      y1={hit.y}
                      x2={reflectedEnd.x}
                      y2={reflectedEnd.y}
                      stroke="#F472B6"
                      strokeWidth="4"
                      markerEnd="url(#snellRefractedArrow)"
                    />
                    <text x="197" y="105" fill="#F9A8D4" fontSize="12">
                      Total internal reflection
                    </text>
                  </>
                ) : (
                  <>
                    <line
                      x1={hit.x}
                      y1={hit.y}
                      x2={refractedEnd.x}
                      y2={refractedEnd.y}
                      stroke="#34D399"
                      strokeWidth="4"
                      markerEnd="url(#snellRefractedArrow)"
                    />
                    <text x="193" y="177" fill="#6EE7B7" fontSize="12">
                      θ₂ {refractionAngle?.toFixed(1)}°
                    </text>
                  </>
                )}
              </>
            )}
          </svg>
          <div className="mt-3 rounded-xl bg-white/[0.04] p-4 text-sm leading-6 text-slate-300" aria-live="polite">
            {!inputValid ? (
              <p>Correct the highlighted values to calculate refraction.</p>
            ) : totalInternalReflection ? (
              <>
                <p className="font-semibold text-rose-300">Total internal reflection</p>
                <p>
                  sin θ₂ = n₁ sin θ₁ / n₂ = {firstIndex.toFixed(4)} sin({incidenceAngle.toFixed(2)}°) / {secondIndex.toFixed(4)} = {sineRefraction.toFixed(4)} &gt; 1. No transmitted ray is possible.
                </p>
                <p className="mt-1">This occurs when light travels from higher n₁ to lower n₂ above the critical angle.</p>
              </>
            ) : refractionAngle !== null ? (
              <>
                <p className="font-semibold text-emerald-300">Snell&apos;s law calculation</p>
                <p>n₁ sin θ₁ = n₂ sin θ₂</p>
                <p>sin θ₂ = (n₁/n₂) sin θ₁</p>
                <p>sin θ₂ = ({firstIndex.toFixed(4)}/{secondIndex.toFixed(4)}) sin({incidenceAngle.toFixed(2)}°) = {sineRefraction.toFixed(4)}</p>
                <p>θ₂ = sin⁻¹({sineRefraction.toFixed(4)}) = {refractionAngle.toFixed(2)}°</p>
                <p className="mt-2 text-slate-400">
                  {firstIndex > secondIndex
                    ? "The ray enters a lower-index medium and bends away from the normal."
                    : firstIndex < secondIndex
                      ? "The ray enters a higher-index medium and bends toward the normal."
                      : "The indices are equal, so the ray does not change direction."}
                </p>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function LensImageSimulator() {
  const [lensType, setLensType] = useState<LensType>("convex");
  const [objectDistanceInput, setObjectDistanceInput] = useState("30");
  const [focalLengthInput, setFocalLengthInput] = useState("15");
  const [objectHeightInput, setObjectHeightInput] = useState("4");

  const objectDistance = parseInput(objectDistanceInput, 5, 100);
  const focalMagnitude = parseInput(focalLengthInput, 5, 50);
  const objectHeight = parseInput(objectHeightInput, 1, 10);
  const focalLength =
    focalMagnitude === null
      ? null
      : lensType === "convex"
        ? focalMagnitude
        : -focalMagnitude;
  const valid =
    objectDistance !== null &&
    focalLength !== null &&
    objectHeight !== null;
  const denominator =
    valid && focalLength !== null && objectDistance !== null
      ? 1 / focalLength - 1 / objectDistance
      : Number.NaN;
  const imageDistance =
    valid && Number.isFinite(denominator) && Math.abs(denominator) > 1e-9
      ? 1 / denominator
      : null;
  const magnification =
    imageDistance !== null && objectDistance !== null
      ? -imageDistance / objectDistance
      : null;
  const imageHeight =
    magnification !== null && objectHeight !== null
      ? magnification * objectHeight
      : null;
  const realImage = imageDistance !== null && imageDistance > 0;
  const uprightImage = magnification !== null && magnification > 0;
  const sizeText =
    magnification === null
      ? "—"
      : Math.abs(Math.abs(magnification) - 1) < 0.001
        ? "Same size"
        : Math.abs(magnification) > 1
          ? "Enlarged"
          : "Reduced";

  const lensX = 300;
  const axisY = 170;
  const maxImageDistance =
    imageDistance === null ? 0 : Math.min(Math.abs(imageDistance), 160);
  const horizontalScale = Math.min(
    2.4,
    250 / Math.max(objectDistance ?? 30, focalMagnitude ?? 15, maxImageDistance, 1)
  );
  const objectX =
    objectDistance === null ? 0 : lensX - objectDistance * horizontalScale;
  const imageX =
    imageDistance === null
      ? lensX
      : lensX + Math.sign(imageDistance) * maxImageDistance * horizontalScale;
  const verticalScale =
    imageHeight === null || objectHeight === null
      ? 16
      : Math.min(18, 88 / Math.max(objectHeight, Math.abs(imageHeight), 1));
  const objectTipY =
    objectHeight === null ? axisY - 64 : axisY - objectHeight * verticalScale;
  const imageTipY =
    imageHeight === null ? axisY : axisY - imageHeight * verticalScale;
  const virtualRayEnd = {
    x: 570,
    y:
      imageDistance !== null && magnification !== null
        ? axisY + (axisY - imageTipY) * ((570 - lensX) / Math.max(1, lensX - imageX))
        : axisY,
  };

  return (
    <section
      id="lens-simulator"
      className="mb-10 scroll-mt-28 rounded-3xl border border-violet-400/20 bg-[#111A2E] p-6 md:p-8"
    >
      <p className="text-sm font-semibold text-violet-300">INTERACTIVE SIMULATION</p>
      <h2 className="mt-2 text-2xl font-bold md:text-3xl">Convex and Concave Lenses</h2>
      <p className="mt-3 max-w-4xl leading-7 text-slate-300">
        A converging convex lens has positive focal length; a diverging concave
        lens has negative focal length. For a real object, do is positive. A
        positive di gives a real image on the opposite side; a negative di
        gives a virtual image on the object side. Magnification M = hi/ho = −di/do.
      </p>
      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="space-y-5 rounded-2xl border border-white/10 bg-[#080D1B] p-5">
          <fieldset>
            <legend className="mb-3 text-sm font-semibold text-slate-200">Lens type</legend>
            <div className="grid grid-cols-2 gap-2">
              {(["convex", "concave"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  aria-pressed={lensType === type}
                  onClick={() => setLensType(type)}
                  className={`rounded-lg border px-3 py-2 text-sm capitalize transition ${FOCUS} ${
                    lensType === type
                      ? "border-violet-400 bg-violet-400/10 text-violet-200"
                      : "border-white/10 text-slate-300 hover:bg-white/5"
                  }`}
                >
                  {type} lens
                </button>
              ))}
            </div>
          </fieldset>
          {[
            {
              id: "lens-object-distance",
              label: "Object distance do (cm)",
              value: objectDistanceInput,
              set: setObjectDistanceInput,
              min: "5",
              max: "100",
            },
            {
              id: "lens-focal-length",
              label: "Focal length magnitude |f| (cm)",
              value: focalLengthInput,
              set: setFocalLengthInput,
              min: "5",
              max: "50",
            },
            {
              id: "lens-object-height",
              label: "Object height ho (cm)",
              value: objectHeightInput,
              set: setObjectHeightInput,
              min: "1",
              max: "10",
            },
          ].map((input) => (
            <label key={input.id} htmlFor={input.id} className="block text-sm text-slate-300">
              {input.label}
              <input
                id={input.id}
                type="number"
                min={input.min}
                max={input.max}
                step="any"
                value={input.value}
                onChange={(event) => input.set(event.target.value)}
                className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:border-violet-300 focus:outline-none"
              />
            </label>
          ))}
          {!valid ? (
            <p role="alert" className="text-sm leading-6 text-rose-300">
              Enter an object distance from 5–100 cm, focal-length magnitude from 5–50 cm,
              and object height from 1–10 cm.
            </p>
          ) : imageDistance === null ? (
            <p role="status" className="text-sm leading-6 text-amber-200">
              The object is at the focal point. Emergent rays are parallel, so the ideal image is at infinity.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3" aria-live="polite">
              {[
                ["Signed focal length", `${fmtSigned(focalLength ?? 0)} cm`],
                ["Image distance di", `${fmtSigned(imageDistance)} cm`],
                ["Image height hi", `${fmtSigned(imageHeight ?? 0)} cm`],
                ["Magnification M", fmt(magnification ?? 0, 3)],
                ["Image type", realImage ? "Real" : "Virtual"],
                ["Orientation · size", `${uprightImage ? "Upright" : "Inverted"} · ${sizeText}`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-white/[0.04] p-3">
                  <p className="text-xs leading-5 text-slate-400">{label}</p>
                  <p className="mt-1 break-words text-sm font-bold text-emerald-300">{value}</p>
                </div>
              ))}
            </div>
          )}
          {valid && imageDistance !== null && magnification !== null && imageHeight !== null && (
            <div className="rounded-xl bg-white/[0.04] p-4 text-sm leading-6 text-slate-300">
              <p className="font-semibold text-violet-200">Thin-lens calculation</p>
              <p>f = {fmtSigned(focalLength ?? 0)} cm, do = {objectDistance} cm</p>
              <p>1/di = 1/f − 1/do = 1/({fmtSigned(focalLength ?? 0)}) − 1/({objectDistance}) = {fmt(denominator, 5)} cm⁻¹</p>
              <p>di = 1/({fmt(denominator, 5)} cm⁻¹) = {fmtSigned(imageDistance)} cm</p>
              <p>M = −di/do = −({fmtSigned(imageDistance)}/{objectDistance}) = {fmt(magnification, 3)}</p>
              <p>hi = Mho = ({fmt(magnification, 3)})({objectHeight} cm) = {fmtSigned(imageHeight)} cm</p>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3 sm:p-4">
          <svg
            viewBox="0 0 600 340"
            role="img"
            aria-label={
              !valid
                ? "Lens ray diagram awaiting valid input"
                : imageDistance === null
                  ? `${lensType} lens with object at focal point and parallel emergent rays`
                  : `${lensType} lens ray diagram; ${realImage ? "real" : "virtual"} ${uprightImage ? "upright" : "inverted"} image`
            }
            className="h-auto w-full"
          >
            <defs>
              <marker id="lensRayArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" fill="#60A5FA" />
              </marker>
              <marker id="lensObjectArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" fill="#38BDF8" />
              </marker>
              <marker id="lensImageArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" fill="#FBBF24" />
              </marker>
            </defs>
            <rect width="600" height="340" rx="12" fill="#0F172A" />
            <line x1="20" y1={axisY} x2="580" y2={axisY} stroke="#64748B" strokeDasharray="6 5" />
            <text x="25" y={axisY - 10} fill="#CBD5E1" fontSize="12">Principal axis</text>
            <path
              d={lensType === "convex" ? `M ${lensX} 60 Q ${lensX - 28} ${axisY} ${lensX} 280 Q ${lensX + 28} ${axisY} ${lensX} 60` : `M ${lensX - 18} 60 Q ${lensX} ${axisY} ${lensX - 18} 280 M ${lensX + 18} 60 Q ${lensX} ${axisY} ${lensX + 18} 280`}
              fill={lensType === "convex" ? "#38BDF8" : "none"}
              fillOpacity=".18"
              stroke="#7DD3FC"
              strokeWidth="3"
            />
            <text x={lensX} y="45" fill="#BAE6FD" textAnchor="middle" fontSize="13">
              {lensType === "convex" ? "Convex lens" : "Concave lens"}
            </text>
            {valid && focalLength !== null && objectDistance !== null && objectHeight !== null && (
              <>
                <circle cx={lensX - focalLength * horizontalScale} cy={axisY} r="4" fill="#A78BFA" />
                <text x={lensX - focalLength * horizontalScale} y={axisY + 20} fill="#C4B5FD" fontSize="12" textAnchor="middle">F</text>
                <circle cx={lensX + focalLength * horizontalScale} cy={axisY} r="4" fill="#A78BFA" />
                <text x={lensX + focalLength * horizontalScale} y={axisY + 20} fill="#C4B5FD" fontSize="12" textAnchor="middle">F</text>
                <line x1={objectX} y1={axisY} x2={objectX} y2={objectTipY} stroke="#38BDF8" strokeWidth="4" markerEnd="url(#lensObjectArrow)" />
                <text x={objectX} y={objectTipY - 12} fill="#7DD3FC" textAnchor="middle" fontSize="12">Object</text>
                {imageDistance !== null && imageHeight !== null && magnification !== null && (
                  <>
                    <line
                      x1={imageX}
                      y1={axisY}
                      x2={imageX}
                      y2={imageTipY}
                      stroke="#FBBF24"
                      strokeWidth="4"
                      strokeDasharray={realImage ? undefined : "7 5"}
                      markerEnd="url(#lensImageArrow)"
                    />
                    <text
                      x={Math.max(30, Math.min(570, imageX))}
                      y={imageTipY + (uprightImage ? -12 : 20)}
                      fill="#FDE68A"
                      textAnchor="middle"
                      fontSize="12"
                    >
                      {realImage ? "Real image" : "Virtual image"}
                    </text>
                    <line x1={objectX} y1={objectTipY} x2={lensX} y2={objectTipY} stroke="#60A5FA" strokeWidth="2" markerEnd="url(#lensRayArrow)" />
                    {realImage ? (
                      <line x1={lensX} y1={objectTipY} x2={imageX} y2={imageTipY} stroke="#34D399" strokeWidth="2" markerEnd="url(#lensRayArrow)" />
                    ) : (
                      <>
                        <line x1={lensX} y1={objectTipY} x2={virtualRayEnd.x} y2={virtualRayEnd.y} stroke="#34D399" strokeWidth="2" markerEnd="url(#lensRayArrow)" />
                        <line x1={lensX} y1={objectTipY} x2={imageX} y2={imageTipY} stroke="#94A3B8" strokeDasharray="6 5" />
                      </>
                    )}
                    <line x1={objectX} y1={objectTipY} x2={lensX} y2={axisY} stroke="#A78BFA" strokeWidth="2" />
                    {realImage ? (
                      <line x1={lensX} y1={axisY} x2={imageX} y2={imageTipY} stroke="#A78BFA" strokeWidth="2" markerEnd="url(#lensRayArrow)" />
                    ) : (
                      <>
                        <line x1={lensX} y1={axisY} x2={virtualRayEnd.x} y2={virtualRayEnd.y} stroke="#A78BFA" strokeWidth="2" markerEnd="url(#lensRayArrow)" />
                        <line x1={lensX} y1={axisY} x2={imageX} y2={imageTipY} stroke="#94A3B8" strokeDasharray="6 5" />
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </svg>
          <p className="mt-2 text-center text-xs leading-5 text-slate-500">
            Schematic principal axis, focal points, parallel and central rays. Virtual-image extensions are dashed; image position is capped in the drawing when far away.
          </p>
        </div>
      </div>
      <div className="mt-5 rounded-xl border border-violet-400/15 bg-violet-400/5 p-4 text-sm leading-6 text-slate-300">
        <p><strong className="text-violet-200">Thin lens equation:</strong> 1/f = 1/do + 1/di</p>
        <p>f is signed focal length, do is object distance, di is signed image distance; all distances use the same unit.</p>
        <p><strong className="text-violet-200">Magnification:</strong> M = hi/ho = −di/do. Positive M is upright; negative M is inverted. |M| greater than 1 is enlarged; less than 1 is reduced.</p>
      </div>
    </section>
  );
}

const DIAGRAM = {
  width: 640,
  height: 340,
  mirrorX: 420,
  axisY: 170,
  mirrorHalfHeight: 125,
} as const;

const CLIP = { left: 12, right: 628, top: 44, bottom: 324 } as const;
const LEFT_SPACE = DIAGRAM.mirrorX - 30;
const RIGHT_SPACE = DIAGRAM.width - 30 - DIAGRAM.mirrorX;
const MAX_SX = 12; // px per cm, horizontal
const MAX_SY = 9; // px per cm, vertical
const MAX_VERTICAL_EXTENT = 115; // px above/below the axis for arrows
const MIN_IMAGE_PX = 6; // smallest image arrow worth drawing

const HALO = {
  stroke: "#0f172a",
  strokeWidth: 4,
  paintOrder: "stroke",
  strokeLinejoin: "round",
} as const;

function rayToBox(px: number, py: number, dx: number, dy: number): Pt {
  let t = Infinity;
  if (dx > 1e-9) t = Math.min(t, (CLIP.right - px) / dx);
  else if (dx < -1e-9) t = Math.min(t, (CLIP.left - px) / dx);
  if (dy > 1e-9) t = Math.min(t, (CLIP.bottom - py) / dy);
  else if (dy < -1e-9) t = Math.min(t, (CLIP.top - py) / dy);
  if (!Number.isFinite(t) || t < 0) t = 0;
  return { x: px + dx * t, y: py + dy * t };
}

function buildGeometry(
  mirror: MirrorType,
  objectDistance: number,
  objectHeight: number,
  result: MirrorResult
): Geometry {
  const MX = DIAGRAM.mirrorX;
  const AY = DIAGRAM.axisY;
  const MH = DIAGRAM.mirrorHalfHeight;
  const notes: string[] = [];
  const isPlane = mirror === "plane";
  const absF = isPlane ? 0 : Math.abs(result.focal);

  // Horizontal scale: fit the object, F, and C (and the image if practical).
  const leftNeed = Math.max(objectDistance, mirror === "concave" ? 2 * absF : 0);
  const rightNeed = Math.max(
    mirror === "convex" ? 2 * absF : 0,
    isPlane ? objectDistance : 0
  );
  const sxBase = Math.min(
    MAX_SX,
    LEFT_SPACE / leftNeed,
    rightNeed > 0 ? RIGHT_SPACE / rightNeed : Infinity
  );

  const di = result.imageDistance;
  const hi = result.imageHeight;
  let sx = sxBase;
  let sy = MAX_SY;
  let showImage = false;

  if (di !== null && hi !== null) {
    const space = di > 0 ? LEFT_SPACE : RIGHT_SPACE;
    const sxCandidate = Math.min(sxBase, space / Math.abs(di));
    const syCandidate = Math.min(
      MAX_SY,
      MAX_VERTICAL_EXTENT / Math.max(objectHeight, Math.abs(hi))
    );
    if (
      sxCandidate >= 0.5 * sxBase &&
      objectHeight * syCandidate >= MIN_IMAGE_PX
    ) {
      sx = sxCandidate;
      sy = syCandidate;
      showImage = true;
    } else {
      notes.push(
        "The calculated image is too far away or too large to draw on this diagram, so the image arrow is not shown. The calculated values are still correct."
      );
    }
  }

  const ox = MX - objectDistance * sx;
  const objectBase: Pt = { x: ox, y: AY };
  const objectTip: Pt = { x: ox, y: AY - objectHeight * sy };
  const rise = AY - objectTip.y; // object height in pixels

  const focal: Pt | null = isPlane ? null : { x: MX - result.focal * sx, y: AY };
  const center: Pt | null = isPlane
    ? null
    : { x: MX - 2 * result.focal * sx, y: AY };

  const image =
    showImage && di !== null && hi !== null
      ? {
          base: { x: MX - di * sx, y: AY },
          tip: { x: MX - di * sx, y: AY - hi * sy },
        }
      : null;

  const rays: RayPath[] = [];
  const constructions: Geometry["constructions"] = [];

  const addRay = (id: string, hit: Pt, dir: Pt, extOverride?: Pt) => {
    const end = rayToBox(hit.x, hit.y, dir.x, dir.y);
    let ext: Pt | null = null;
    if (result.kind === "virtual") {
      ext =
        extOverride ??
        (image ? image.tip : rayToBox(hit.x, hit.y, -dir.x, -dir.y));
    }
    rays.push({ id, hit, end, ext });
  };

  if (isPlane) {
    // Ray A: aimed at the vertex. Ray B: aimed at a point halfway up the mirror.
    addRay("vertex", { x: MX, y: AY }, { x: -objectDistance * sx, y: rise });
    addRay(
      "mid",
      { x: MX, y: (AY + objectTip.y) / 2 },
      { x: -objectDistance * sx, y: rise / 2 }
    );
  } else if (focal) {
    // Ray 1: parallel to the axis, reflects through F (concave) or away from F (convex).
    addRay(
      "parallel",
      { x: MX, y: objectTip.y },
      { x: -absF * sx, y: Math.sign(result.focal) * rise },
      mirror === "convex" ? focal : undefined
    );

    // Ray 2: directed through F (or toward F behind a convex mirror), reflects parallel.
    if (!result.atFocalPoint) {
      const denominator = focal.x - ox;
      if (Math.abs(denominator) > 1e-6) {
        const y2 = objectTip.y + (AY - objectTip.y) * ((MX - ox) / denominator);
        if (Math.abs(y2 - AY) <= MH - 6) {
          addRay("focal", { x: MX, y: y2 }, { x: -1, y: 0 });
          if (mirror === "convex") {
            constructions.push({
              id: "focal-aim",
              from: { x: MX, y: y2 },
              to: focal,
            });
          } else if (ox > focal.x) {
            constructions.push({ id: "focal-back", from: focal, to: objectTip });
          }
        } else {
          notes.push(
            "The ray through F is not drawn because it would strike the mirror outside the drawn mirror height."
          );
        }
      }
    }

    // Ray 3: aimed at the vertex; reflects with equal angle about the principal axis.
    addRay("vertex", { x: MX, y: AY }, { x: -objectDistance * sx, y: rise });
  }

  if (result.atFocalPoint) {
    notes.push(
      "The object is at F, so the reflected rays are parallel and no finite image forms."
    );
  }

  return {
    objectBase,
    objectTip,
    focal,
    center,
    rays,
    constructions,
    image,
    notes,
  };
}

function MirrorDiagram({
  mirror,
  objectDistance,
  objectHeight,
  result,
  hideImage,
}: {
  mirror: MirrorType;
  objectDistance: number | null;
  objectHeight: number | null;
  result: MirrorResult | null;
  /** Predict mode: hide the image arrow, virtual extensions, badge, and notes. */
  hideImage: boolean;
}) {
  const MX = DIAGRAM.mirrorX;
  const AY = DIAGRAM.axisY;
  const MH = DIAGRAM.mirrorHalfHeight;
  const top = AY - MH;
  const bottom = AY + MH;
  const sag = 16;

  const geometry =
    result && objectDistance !== null && objectHeight !== null
      ? buildGeometry(mirror, objectDistance, objectHeight, result)
      : null;

  const mirrorPath =
    mirror === "concave"
      ? `M ${MX - sag} ${top} Q ${MX + sag} ${AY} ${MX - sag} ${bottom}`
      : `M ${MX + sag} ${top} Q ${MX - sag} ${AY} ${MX + sag} ${bottom}`;

  const mirrorName =
    mirror === "plane"
      ? "Plane mirror"
      : mirror === "concave"
        ? "Concave mirror"
        : "Convex mirror";

  const badge = !result
    ? "Enter valid values to draw the rays"
    : hideImage
      ? "Predict the image type"
      : result.kind === "real"
        ? "Real image"
        : result.kind === "virtual"
          ? "Virtual image"
          : "No finite image";

  const imageIsVirtual = result?.kind === "virtual";
  const imageIsInverted =
    result?.magnification !== null &&
    result?.magnification !== undefined &&
    result.magnification < 0;

  const visibleNotes = geometry && !hideImage ? geometry.notes : [];

  return (
    <div>
      <svg
        viewBox={`0 0 ${DIAGRAM.width} ${DIAGRAM.height}`}
        role="img"
        aria-label={`${mirrorName} ray diagram showing the object, focal point, and principal rays${
          hideImage ? "" : ", and the image"
        }`}
        className="h-auto w-full"
      >
        <defs>
          <marker
            id="mirrorArrowBlue"
            markerUnits="userSpaceOnUse"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="5"
            orient="auto"
          >
            <path d="M0,0 L10,5 L0,10 Z" fill="#60a5fa" />
          </marker>
          <marker
            id="mirrorArrowCyan"
            markerUnits="userSpaceOnUse"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="5"
            orient="auto"
          >
            <path d="M0,0 L10,5 L0,10 Z" fill="#22d3ee" />
          </marker>
          <marker
            id="mirrorArrowAmber"
            markerUnits="userSpaceOnUse"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="5"
            orient="auto"
          >
            <path d="M0,0 L10,5 L0,10 Z" fill="#fbbf24" />
          </marker>
        </defs>

        <rect
          x="0"
          y="0"
          width={DIAGRAM.width}
          height={DIAGRAM.height}
          rx="12"
          fill="#0f172a"
        />

        {/* Principal axis */}
        <line
          x1={CLIP.left}
          y1={AY}
          x2={CLIP.right}
          y2={AY}
          stroke="#64748b"
          strokeWidth="1.5"
        />

        {/* Mirror */}
        {mirror === "plane" ? (
          <>
            <line
              x1={MX}
              y1={top}
              x2={MX}
              y2={bottom}
              stroke="#cbd5e1"
              strokeWidth="5"
            />
            {Array.from({ length: 14 }, (_, i) => top + i * 18).map((y) => (
              <line
                key={y}
                x1={MX}
                y1={y}
                x2={MX + 10}
                y2={y + 10}
                stroke="#64748b"
                strokeWidth="1.5"
              />
            ))}
          </>
        ) : (
          <path d={mirrorPath} fill="none" stroke="#cbd5e1" strokeWidth="5" />
        )}
        <text
          x={MX}
          y="34"
          fill="#e2e8f0"
          fontSize="17"
          textAnchor="middle"
          {...HALO}
        >
          {mirrorName}
        </text>

        {/* Status badge */}
        <text x="16" y="26" fill="#fcd34d" fontSize="17" fontWeight="700" {...HALO}>
          {badge}
        </text>

        {!geometry && (
          <text
            x={DIAGRAM.width / 2}
            y={AY - 20}
            fill="#94a3b8"
            fontSize="17"
            textAnchor="middle"
          >
            Fix the highlighted input to see the diagram.
          </text>
        )}

        {geometry && (
          <>
            {/* Construction lines (not real rays) */}
            {geometry.constructions.map((line) => (
              <line
                key={line.id}
                x1={line.from.x}
                y1={line.from.y}
                x2={line.to.x}
                y2={line.to.y}
                stroke="#64748b"
                strokeWidth="1.5"
                strokeDasharray="2 5"
              />
            ))}

            {/* Rays */}
            {geometry.rays.map((ray) => (
              <g key={ray.id}>
                <line
                  x1={geometry.objectTip.x}
                  y1={geometry.objectTip.y}
                  x2={ray.hit.x}
                  y2={ray.hit.y}
                  stroke="#60a5fa"
                  strokeWidth="2"
                  markerEnd="url(#mirrorArrowBlue)"
                />
                <line
                  x1={ray.hit.x}
                  y1={ray.hit.y}
                  x2={ray.end.x}
                  y2={ray.end.y}
                  stroke="#22d3ee"
                  strokeWidth="2"
                  markerEnd="url(#mirrorArrowCyan)"
                />
                {ray.ext && !hideImage && (
                  <line
                    x1={ray.hit.x}
                    y1={ray.hit.y}
                    x2={ray.ext.x}
                    y2={ray.ext.y}
                    stroke="#94a3b8"
                    strokeWidth="1.75"
                    strokeDasharray="6 5"
                  />
                )}
              </g>
            ))}

            {/* Focal point and center of curvature */}
            {geometry.focal && (
              <>
                <circle cx={geometry.focal.x} cy={AY} r="4" fill="#34d399" />
                <text
                  x={geometry.focal.x}
                  y={AY + 26}
                  fill="#6ee7b7"
                  fontSize="20"
                  fontWeight="700"
                  textAnchor="middle"
                  {...HALO}
                >
                  F
                </text>
              </>
            )}
            {geometry.center && (
              <>
                <circle cx={geometry.center.x} cy={AY} r="4" fill="#a78bfa" />
                <text
                  x={geometry.center.x}
                  y={AY + 48}
                  fill="#c4b5fd"
                  fontSize="20"
                  fontWeight="700"
                  textAnchor="middle"
                  {...HALO}
                >
                  C
                </text>
              </>
            )}

            {/* Object */}
            <line
              x1={geometry.objectBase.x}
              y1={geometry.objectBase.y}
              x2={geometry.objectTip.x}
              y2={geometry.objectTip.y}
              stroke="#60a5fa"
              strokeWidth="4"
              markerEnd="url(#mirrorArrowBlue)"
            />
            <text
              x={geometry.objectTip.x}
              y={geometry.objectTip.y - 12}
              fill="#93c5fd"
              fontSize="20"
              textAnchor="middle"
              {...HALO}
            >
              Object
            </text>

            {/* Image */}
            {geometry.image && !hideImage && (
              <>
                <line
                  x1={geometry.image.base.x}
                  y1={geometry.image.base.y}
                  x2={geometry.image.tip.x}
                  y2={geometry.image.tip.y}
                  stroke="#fbbf24"
                  strokeWidth="4"
                  strokeDasharray={imageIsVirtual ? "6 5" : undefined}
                  markerEnd="url(#mirrorArrowAmber)"
                />
                <circle
                  cx={geometry.image.tip.x}
                  cy={geometry.image.tip.y}
                  r="4"
                  fill="#fbbf24"
                />
                <text
                  x={geometry.image.tip.x}
                  y={
                    imageIsInverted
                      ? geometry.image.tip.y + 24
                      : geometry.image.tip.y - 14
                  }
                  fill="#fcd34d"
                  fontSize="20"
                  textAnchor="middle"
                  {...HALO}
                >
                  Image
                </text>
              </>
            )}
          </>
        )}
      </svg>

      {visibleNotes.length > 0 && (
        <ul className="mt-2 space-y-1 text-xs leading-5 text-amber-200">
          {visibleNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Mirror image simulator                                              */
/* ------------------------------------------------------------------ */

function MirrorImageSimulator() {
  const [mirror, setMirror] = useState<MirrorType>("concave");
  const [objectDistanceInput, setObjectDistanceInput] = useState("30");
  const [objectHeightInput, setObjectHeightInput] = useState("4");
  const [focalInput, setFocalInput] = useState("15");
  const [radiusInput, setRadiusInput] = useState("30");
  const [mirrorMeasurement, setMirrorMeasurement] =
    useState<MirrorMeasurement>("focal");
  const [predictMode, setPredictMode] = useState(false);
  const [prediction, setPrediction] = useState<ImageKind | null>(null);
  const [showPrediction, setShowPrediction] = useState(false);

  const objectDistance = parseInput(objectDistanceInput, DO_MIN, DO_MAX);
  const objectHeight = parseInput(objectHeightInput, HO_MIN, HO_MAX);
  const rawMeasurement =
    mirrorMeasurement === "focal"
      ? parseInput(focalInput, F_MIN, F_MAX)
      : parseInput(radiusInput, R_MIN, R_MAX);
  const focalMagnitude =
    rawMeasurement === null
      ? null
      : mirrorMeasurement === "focal"
        ? rawMeasurement
        : rawMeasurement / 2;

  const mirrorValueValid = mirror === "plane" || focalMagnitude !== null;

  const result =
    objectDistance !== null && objectHeight !== null && mirrorValueValid
      ? computeMirror(mirror, objectDistance, objectHeight, focalMagnitude ?? 1)
      : null;

  const errors: string[] = [];
  if (objectDistance === null) {
    errors.push(`Object distance must be a number from ${DO_MIN} to ${DO_MAX} cm.`);
  }
  if (objectHeight === null) {
    errors.push(`Object height must be a number from ${HO_MIN} to ${HO_MAX} cm.`);
  }
  if (mirror !== "plane" && focalMagnitude === null) {
    errors.push(
      mirrorMeasurement === "focal"
        ? `Focal length must be a number from ${F_MIN} to ${F_MAX} cm.`
        : `Radius of curvature must be a number from ${R_MIN} to ${R_MAX} cm.`
    );
  }

  const clearFeedback = () => {
    setShowPrediction(false);
  };

  const changeMirror = (type: MirrorType) => {
    setMirror(type);
    setPrediction(null);
    clearFeedback();
  };

  const changeObjectDistance = (value: string) => {
    setObjectDistanceInput(value);
    clearFeedback();
  };

  const changeObjectHeight = (value: string) => {
    setObjectHeightInput(value);
    clearFeedback();
  };

  const changeFocal = (value: string) => {
    setFocalInput(value);
    const parsed = parseInput(value, F_MIN, F_MAX);
    if (parsed !== null) setRadiusInput(formatInput(parsed * 2));
    clearFeedback();
  };

  const changeRadius = (value: string) => {
    setRadiusInput(value);
    const parsed = parseInput(value, R_MIN, R_MAX);
    if (parsed !== null) setFocalInput(formatInput(parsed / 2));
    clearFeedback();
  };

  const resetSimulator = () => {
    setMirror("concave");
    setObjectDistanceInput("30");
    setObjectHeightInput("4");
    setFocalInput("15");
    setRadiusInput("30");
    setMirrorMeasurement("focal");
    setPredictMode(false);
    setPrediction(null);
    setShowPrediction(false);
  };

  // In predict mode the answer stays hidden until the student checks.
  const reveal =
    !predictMode ||
    (showPrediction && prediction !== null);
  const hidden = "Hidden";

  // ----- Displayed results -----
  const di = result?.imageDistance ?? null;
  const magnification = result?.magnification ?? null;
  const imageHeight = result?.imageHeight ?? null;

  let imageLocation = "—";
  if (result) {
    if (di === null) imageLocation = "No finite image (at infinity)";
    else if (di < 0) imageLocation = `${fmt(Math.abs(di))} cm behind the mirror`;
    else imageLocation = `${fmt(di)} cm in front of the mirror`;
  }

  const imageTypeLabel = !result
    ? "—"
    : result.kind === "real"
      ? "Real"
      : result.kind === "virtual"
        ? "Virtual"
        : "No finite image";

  const orientation =
    magnification === null
      ? result
        ? "Not defined"
        : "—"
      : magnification > 0
        ? "Upright"
        : "Inverted";

  const sizeDescription =
    magnification === null
      ? result
        ? "Not defined"
        : "—"
      : Math.abs(Math.abs(magnification) - 1) < 0.001
        ? "Same size"
        : Math.abs(magnification) > 1
          ? "Enlarged"
          : "Reduced";

  const farImage = di !== null && Math.abs(di) > 10000;

  let objectPosition = "";
  if (result && mirror === "concave" && objectDistance !== null) {
    const f = result.focal;
    if (result.atFocalPoint) objectPosition = "At F";
    else if (Math.abs(objectDistance - 2 * f) < 1e-3) objectPosition = "At C";
    else if (objectDistance > 2 * f) objectPosition = "Beyond C";
    else if (objectDistance > f) objectPosition = "Between C and F";
    else objectPosition = "Between F and the mirror";
  }

  // Plain-language reason for the image type and orientation.
  let explanation = "";
  if (result) {
    if (mirror === "plane") {
      explanation =
        "A plane mirror reflects rays so they spread out as if they came from a point behind the mirror. No light actually reaches that point, so the image is virtual. It is upright because M = +1.";
    } else if (result.atFocalPoint) {
      explanation =
        "The object is at F, so every reflected ray leaves parallel to the principal axis. Parallel rays never meet, so there is no finite image.";
    } else if (result.kind === "real") {
      explanation =
        "The reflected rays actually cross in front of the mirror, so the image is real (di is positive). Real images from a single mirror are inverted, which matches the negative magnification.";
    } else {
      explanation =
        mirror === "convex"
          ? "A convex mirror makes reflected rays spread apart. Only their backward extensions meet behind the mirror, so the image is virtual (di is negative). M is positive, so it is upright, and |M| is less than 1, so it is reduced."
          : "The object is inside F, so the reflected rays spread apart. Only their backward extensions meet behind the mirror, so the image is virtual (di is negative). M is positive, so it is upright, and |M| is greater than 1, so it is enlarged.";
    }
  }

  let calculation = "";
  if (result && objectDistance !== null) {
    if (mirror === "plane") {
      calculation = "Plane mirror: f = ∞, so di = −do and M = +1.";
    } else if (result.atFocalPoint) {
      calculation =
        "do = f, so the denominator (do − f) is zero. The equation gives no finite image distance.";
    } else if (di !== null) {
      const fText =
        result.focal < 0 ? `(${fmt(result.focal)})` : fmt(result.focal);
      calculation = `di = (do × f) / (do − f) = (${fmt(objectDistance)} × ${fText}) / (${fmt(objectDistance)} − ${fText}) = ${fmt(di)} cm`;
    }
  }

  const signedFocalText = !result
    ? "—"
    : mirror === "plane"
      ? "f = ∞ and R = ∞ (plane mirror)"
      : `f = ${fmtSigned(result.focal)} cm, R = 2f = ${fmtSigned(2 * result.focal)} cm`;

  const predictionCorrect = result !== null && prediction === result.kind;

  const inputClass = (invalid: boolean) =>
    `w-full rounded-lg border bg-slate-900 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-cyan-300 ${
      invalid ? "border-rose-400" : "border-white/10"
    }`;

  const resultCards: [string, string][] = [
    ["Image distance", reveal ? imageLocation : hidden],
    ["Image type", reveal ? imageTypeLabel : hidden],
    ["Orientation", reveal ? orientation : hidden],
    ["Image size", reveal ? sizeDescription : hidden],
    [
      "Magnification",
      !reveal
        ? hidden
        : magnification === null
          ? result
            ? "Undefined"
            : "—"
          : fmt(magnification, 3),
    ],
    [
      "Image height",
      !reveal
        ? hidden
        : imageHeight === null
          ? result
            ? "Undefined"
            : "—"
          : `${fmt(imageHeight)} cm`,
    ],
  ];

  return (
    <section
      id="simulator"
      className="mb-10 space-y-6 rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-slate-100 sm:p-6"
    >
      <div>
        <h2 className="text-xl font-bold">Mirror Image Simulator</h2>
        <p className="mt-1 text-sm leading-6 text-slate-400">
          Change the mirror and object settings to explore how images form.
          Distances and heights are measured in centimeters.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h3 className="font-semibold">Predict before revealing</h3>
          <p className="mt-1 text-sm leading-6 text-slate-400">
            What kind of image do you expect this mirror to form?
          </p>
          <button
            type="button"
            aria-pressed={predictMode}
            onClick={() => {
              setPredictMode((on) => !on);
              clearFeedback();
            }}
            className={`mt-3 rounded-lg border px-4 py-2 text-sm ${FOCUS} ${
              predictMode
                ? "border-cyan-400 bg-cyan-400/10 text-cyan-200"
                : "border-white/10 text-slate-300 hover:bg-white/5"
            }`}
          >
            {predictMode
              ? "Predict mode: on (results hidden)"
              : "Predict mode: off (results shown)"}
          </button>
          <div
            role="group"
            aria-label="Your prediction"
            className="mt-3 flex flex-wrap gap-2"
          >
            {IMAGE_CHOICES.map((choice) => (
              <button
                key={choice.value}
                type="button"
                aria-pressed={prediction === choice.value}
                onClick={() => {
                  setPrediction(choice.value);
                  setShowPrediction(false);
                }}
                className={`rounded-lg border px-4 py-2 text-sm ${FOCUS} ${
                  prediction === choice.value
                    ? "border-cyan-400 bg-cyan-400/10 text-cyan-200"
                    : "border-white/10 text-slate-300 hover:bg-white/5"
                }`}
              >
                {choice.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={!prediction || !result}
            onClick={() => setShowPrediction(true)}
            className={`mt-3 rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS}`}
          >
            Check prediction
          </button>
          {!result && (
            <p className="mt-3 text-sm text-amber-200">
              Fix the input values above before checking.
            </p>
          )}

          <div aria-live="polite">
            {showPrediction && prediction && result && (
              <p
                className={`mt-3 text-sm leading-6 ${
                  predictionCorrect ? "text-emerald-300" : "text-amber-200"
                }`}
              >
                {predictionCorrect
                  ? `Correct! These settings give ${KIND_SENTENCE[result.kind]}.`
                  : `Not quite. These settings give ${KIND_SENTENCE[result.kind]}. Change the mirror or object distance and predict again.`}
              </p>
            )}
          </div>
        </div>

      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-5 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div>
            <p className="mb-2 block text-sm font-semibold">Mirror type</p>
            <div className="grid grid-cols-3 gap-2">
              {(["plane", "concave", "convex"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  aria-pressed={mirror === type}
                  onClick={() => changeMirror(type)}
                  className={`rounded-lg border px-2 py-2 text-sm capitalize transition ${FOCUS} ${
                    mirror === type
                      ? "border-cyan-400 bg-cyan-400/15 text-cyan-200"
                      : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {mirror === "plane" ? (
            <p className="rounded-lg border border-white/10 bg-slate-900/60 p-3 text-xs leading-5 text-slate-400">
              A plane mirror has an infinite focal length and radius of
              curvature. Its image is always virtual, upright, and the same
              size, located as far behind the mirror as the object is in front.
            </p>
          ) : (
            <>
              <div>
                <p className="mb-2 block text-sm font-semibold">
                  Measurement input
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    aria-pressed={mirrorMeasurement === "focal"}
                    onClick={() => {
                      setMirrorMeasurement("focal");
                      clearFeedback();
                    }}
                    className={`rounded-lg border p-2 text-sm ${FOCUS} ${
                      mirrorMeasurement === "focal"
                        ? "border-cyan-400 bg-cyan-400/10 text-cyan-200"
                        : "border-white/10 text-slate-300"
                    }`}
                  >
                    Focal length
                  </button>
                  <button
                    type="button"
                    aria-pressed={mirrorMeasurement === "radius"}
                    onClick={() => {
                      setMirrorMeasurement("radius");
                      clearFeedback();
                    }}
                    className={`rounded-lg border p-2 text-sm ${FOCUS} ${
                      mirrorMeasurement === "radius"
                        ? "border-cyan-400 bg-cyan-400/10 text-cyan-200"
                        : "border-white/10 text-slate-300"
                    }`}
                  >
                    Radius of curvature
                  </button>
                </div>
              </div>

              {mirrorMeasurement === "focal" ? (
                <div>
                  <label
                    htmlFor="mirror-focal-input"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Focal length magnitude: {focalInput.trim() || "—"} cm
                  </label>
                  <input
                    id="mirror-focal-input"
                    type="number"
                    inputMode="decimal"
                    min={F_MIN}
                    max={F_MAX}
                    step="0.5"
                    value={focalInput}
                    aria-invalid={focalMagnitude === null}
                    onChange={(e) => changeFocal(e.target.value)}
                    className={inputClass(focalMagnitude === null)}
                  />
                  <p className="mt-1 text-xs text-slate-400">
                    Allowed range: {F_MIN} to {F_MAX} cm.
                  </p>
                </div>
              ) : (
                <div>
                  <label
                    htmlFor="mirror-radius-input"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Radius of curvature: {radiusInput.trim() || "—"} cm
                  </label>
                  <input
                    id="mirror-radius-input"
                    type="number"
                    inputMode="decimal"
                    min={R_MIN}
                    max={R_MAX}
                    step="1"
                    value={radiusInput}
                    aria-invalid={focalMagnitude === null}
                    onChange={(e) => changeRadius(e.target.value)}
                    className={inputClass(focalMagnitude === null)}
                  />
                  <p className="mt-1 text-xs text-slate-400">
                    The focal length magnitude is half the radius: |f| = R / 2.
                    Allowed range: {R_MIN} to {R_MAX} cm.
                  </p>
                </div>
              )}
              <p className="text-xs text-slate-400">
                Signed values: {signedFocalText}
              </p>
            </>
          )}

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label
                htmlFor="mirror-object-distance"
                className="text-sm font-semibold"
              >
                Object distance
              </label>
              <span className="text-sm text-cyan-200">
                {objectDistanceInput.trim() || "—"} cm
              </span>
            </div>
            <input
              id="mirror-object-distance"
              type="range"
              min={DO_MIN}
              max={DO_MAX}
              step="0.5"
              value={objectDistance ?? 30}
              onChange={(e) => changeObjectDistance(e.target.value)}
              className={`w-full accent-cyan-400 ${FOCUS}`}
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>{DO_MIN} cm</span>
              <span>{DO_MAX} cm</span>
            </div>
            <input
              type="number"
              inputMode="decimal"
              aria-label="Object distance in centimeters"
              min={DO_MIN}
              max={DO_MAX}
              step="0.5"
              value={objectDistanceInput}
              aria-invalid={objectDistance === null}
              onChange={(e) => changeObjectDistance(e.target.value)}
              className={`mt-2 ${inputClass(objectDistance === null)}`}
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label
                htmlFor="mirror-object-height"
                className="text-sm font-semibold"
              >
                Object height
              </label>
              <span className="text-sm text-cyan-200">
                {objectHeightInput.trim() || "—"} cm
              </span>
            </div>
            <input
              id="mirror-object-height"
              type="range"
              min={HO_MIN}
              max={HO_MAX}
              step="0.5"
              value={objectHeight ?? 4}
              onChange={(e) => changeObjectHeight(e.target.value)}
              className={`w-full accent-cyan-400 ${FOCUS}`}
            />
            <input
              type="number"
              inputMode="decimal"
              aria-label="Object height in centimeters"
              min={HO_MIN}
              max={HO_MAX}
              step="0.5"
              value={objectHeightInput}
              aria-invalid={objectHeight === null}
              onChange={(e) => changeObjectHeight(e.target.value)}
              className={`mt-2 ${inputClass(objectHeight === null)}`}
            />
          </div>

          {errors.length > 0 && (
            <div
              role="alert"
              className="rounded-lg border border-rose-400/40 bg-rose-400/10 p-3 text-xs leading-5 text-rose-200"
            >
              {errors.map((message) => (
                <p key={message}>{message}</p>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={resetSimulator}
            className={`rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 ${FOCUS}`}
          >
            <RotateCcw size={14} className="mr-2 inline" />
            Reset simulator
          </button>
        </div>

        <div className="rounded-xl border border-white/10 bg-slate-900/70 p-3 sm:p-4">
          <h3 className="mb-2 text-sm font-semibold text-slate-200">
            Principal ray diagram
          </h3>

          <MirrorDiagram
            mirror={mirror}
            objectDistance={objectDistance}
            objectHeight={objectHeight}
            result={result}
            hideImage={!reveal}
          />

          <div className="mt-3 grid grid-cols-1 gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-slate-300 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <span className="h-0.5 w-7 bg-blue-400" />
              Incident ray
            </div>
            <div className="flex items-center gap-2">
              <span className="h-0.5 w-7 bg-cyan-400" />
              Reflected ray
            </div>
            <div className="flex items-center gap-2">
              <span className="w-7 border-t-2 border-dashed border-slate-400" />
              Virtual-ray extension
            </div>
            <div className="flex items-center gap-2">
              <span className="w-7 border-t-2 border-dotted border-slate-400" />
              Construction line
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1 w-7 bg-amber-300" />
              Real image (solid)
            </div>
            <div className="flex items-center gap-2">
              <span className="w-7 border-t-4 border-dashed border-amber-300" />
              Virtual image (dashed)
            </div>
          </div>

          <p className="mt-3 text-xs leading-5 text-slate-400">
            This is a labeled schematic using the small-angle (paraxial) ray
            model. Rays are drawn reflecting at the mirror&apos;s vertex plane,
            and the horizontal and vertical scales differ, so it is not an exact
            drawing of a spherical surface. The image position, size, and
            orientation come from the mirror equation, and the three principal
            rays (parallel, through F, and aimed at the vertex) are drawn to
            agree with those results. A plane mirror uses two rays because a
            ray parallel to its axis simply reflects back on itself.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4">
        <h3 className="font-semibold text-cyan-200">Calculated image properties</h3>
        {!reveal && (
          <p className="mt-2 text-sm leading-6 text-amber-200">
            Predict mode is on. Trace the reflected rays, choose Real, Virtual,
            or No finite image below, and press Check prediction to reveal the
            results.
          </p>
        )}
        <div
          className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3"
          aria-live="polite"
        >
          {resultCards.map(([label, value]) => (
            <div
              key={label}
              className="rounded-lg border border-white/10 bg-slate-950/60 p-3"
            >
              <p className="text-xs text-slate-400">{label}</p>
              <p className="mt-1 break-words text-sm font-semibold text-slate-100">
                {value}
              </p>
            </div>
          ))}
        </div>

        {reveal && explanation && (
          <p className="mt-3 rounded-lg bg-slate-950/60 p-3 text-sm leading-6 text-slate-300">
            <strong className="text-cyan-200">Why? </strong>
            {explanation}
          </p>
        )}

        {reveal && calculation && (
          <p className="mt-3 break-words rounded-lg bg-slate-950/60 p-3 text-sm leading-6 text-slate-300">
            {calculation}
          </p>
        )}

        {reveal && farImage && (
          <p className="mt-3 text-sm leading-6 text-amber-200">
            The object is very close to F, so the image is extremely far from
            the mirror and the numbers are very large.
          </p>
        )}

        {objectPosition && (
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Object position: <strong>{objectPosition}</strong>
          </p>
        )}
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <h3 className="font-semibold">Physics formulas used</h3>
        <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-300">
          <li>
            <strong>Mirror equation:</strong> 1/f = 1/do + 1/di
          </li>
          <li>
            <strong>Image distance:</strong> di = (do × f) / (do − f)
          </li>
          <li>
            <strong>Magnification:</strong> M = hi/ho = −di/do
          </li>
          <li>
            <strong>Image height:</strong> hi = M × ho
          </li>
          <li>
            <strong>Radius of curvature:</strong> R = 2f
          </li>
          <li>
            A concave mirror has positive focal length; a convex mirror has
            negative focal length; a plane mirror has infinite focal length
            under this sign convention.
          </li>
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Worked example card                                                 */
/* ------------------------------------------------------------------ */

function WorkedExample({ example }: { example: WorkedExampleData }) {
  const [open, setOpen] = useState(false);
  const solutionId = `solution-${example.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <div className="mt-6 rounded-2xl border border-amber-400/20 bg-[#080D1B] p-5 md:p-6">
      <h3 className="text-xl font-bold">{example.title}</h3>
      <p className="mt-3 leading-7 text-slate-300">{example.problem}</p>

      <button
        type="button"
        aria-expanded={open}
        aria-controls={solutionId}
        onClick={() => setOpen((currentlyOpen) => !currentlyOpen)}
        className={`mt-4 inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold transition hover:bg-white/5 ${FOCUS}`}
      >
        {open ? "Hide Solution" : "Show Solution"}
      </button>
      {open && (
        <div
          id={solutionId}
          className="mt-4 rounded-xl bg-white/[0.03] p-4 text-sm leading-7 text-slate-300"
        >
          <div className="space-y-4">
            <div>
              <p className="font-semibold text-amber-300">Given</p>
              <p>{example.given.join(", ")}</p>
            </div>
            <div>
              <p className="font-semibold text-amber-300">Find</p>
              <p>{example.find}</p>
            </div>
            <div>
              <p className="font-semibold text-amber-300">Formula</p>
              {example.formula.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <div>
              <p className="font-semibold text-amber-300">Substitution</p>
              {example.substitution.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <div>
              <p className="font-semibold text-amber-300">Calculation</p>
              {example.calculation.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <div>
              <p className="font-semibold text-amber-300">Final Answer</p>
              <p className="text-lg font-bold text-emerald-300">{example.answer}</p>
              <p>{example.meaning}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function OpticsPage() {
  const { eligibility, error: eligibilityError, refresh: refreshEligibility } =
    useLessonQuizEligibility("optics");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [quizOrder, reshuffleQuiz] =
    useShuffledQuestionOrder(quizOptionCounts);
  const {
    saveState,
    saveMessage,
    passed,
    saveResult,
    resetResult,
  } = useLessonQuizResult();

  // Option order changes on every retake so students cannot memorize positions.
  const quizQuestions = quizOrder.map(({ questionIndex, optionOrder }) => {
    const question = questions[questionIndex];

    return {
      ...question,
      options: optionOrder.map((optionIndex) => question.options[optionIndex]),
      a: optionOrder.indexOf(question.a),
      questionIndex,
      originalOptions: question.options,
      optionOrder,
    };
  });

  const score = quizQuestions.filter(
    (question, index) => answers[index] === question.a
  ).length;
  const answeredCount = Object.keys(answers).length;
  const missed = quizQuestions
    .map((_, index) => index)
    .filter((index) => answers[index] !== quizQuestions[index].a);

  const resetQuiz = () => {
    setAnswers({});
    setSubmitted(false);
    resetResult();
    reshuffleQuiz();
    document.getElementById("quiz")?.scrollIntoView({ behavior: "smooth" });
  };

  const submitQuiz = async () => {
    if (!eligibility?.eligible) return;
    const saved = await saveResult(
      "optics",
      quizQuestions.map((_, index) => answers[index] ?? -1),
      quizQuestions.map((question) => ({
        question: question.q,
        choices: question.originalOptions,
        explanation: question.why,
        questionIndex: question.questionIndex,
        optionOrder: question.optionOrder,
      }))
    );
    if (saved) setSubmitted(true);
  };

  return (
  
  <main className="flex-1 min-h-0 overflow-hidden bg-[#080D1B] text-[#F8FAFC]">
    <div className="flex h-full min-h-0 min-w-0 flex-col">
      <div
        id="lesson-main-scroll"
        className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 sm:px-6 lg:px-10"
      >
        <div className="mx-auto w-full max-w-[1600px]">

        <LessonProgressTracker lessonSlug="optics" />
        <LessonHeader
          module="Physics module 05"
          icon={<Eye size={18} />}
          accentClass="text-amber-300"
          title={
            <>
              Light <span className="text-amber-300">&amp; Reflection</span>
            </>
          }
          description={
            <>
            Explore reflection, refraction, mirrors and lenses, image formation,
            optical instruments, and interactive ray diagrams.
            </>
          }
        />

        <nav
          aria-label="Optics lesson sections"
          className="mb-8 flex gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-[#111A2E] p-3"
        >
          {[
            ["light-and-reflection", "Reflection"],
            ["mirror-vocabulary", "Mirrors"],
            ["refraction", "Refraction"],
            ["lens-simulator", "Lenses"],
            ["optical-instruments", "Instruments"],
            ["optics-examples", "Examples"],
            ["optics-practice", "Practice"],
            ["quiz", "Quiz"],
          ].map(([target, label]) => (
            <a
              key={target}
              href={`#${target}`}
              className={`shrink-0 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:border-cyan-300/50 hover:text-cyan-200 ${FOCUS}`}
            >
              {label}
            </a>
          ))}
        </nav>

        <section className="mb-10 grid gap-4 md:grid-cols-3">
          {[
            ["θᵢ = θᵣ", "Law of reflection"],
            ["R = 2f", "Radius of curvature"],
            ["1/f = 1/do + 1/di", "Mirror equation"],
          ].map(([formula, label]) => (
            <div
              key={label}
              className="rounded-2xl border border-white/10 bg-[#111A2E] p-6"
            >
              <p className="text-sm text-slate-400">{label}</p>
              <p className="mt-3 text-xl font-bold text-amber-300">
                {formula}
              </p>
            </div>
          ))}
        </section>

        <section id="light-and-reflection" className="mb-10 scroll-mt-28 grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-white/10 bg-[#111A2E] p-6 md:p-8">
            <div className="mb-4 flex items-center gap-3 text-amber-300">
              <Waves size={23} />
              <span className="text-sm font-semibold">LESSON 01</span>
            </div>
            <h2 className="text-2xl font-bold">Electromagnetic waves and light</h2>
            <p className="mt-4 leading-7 text-slate-300">
              Electromagnetic waves are transverse waves made of changing
              electric and magnetic fields. The two fields are perpendicular to
              each other, and both are perpendicular to the direction of
              travel. Unlike mechanical waves, electromagnetic waves can travel
              through a vacuum.
            </p>
            <p className="mt-4 leading-7 text-slate-300">
              Visible light is the portion of the electromagnetic spectrum that
              the human eye can detect. It spans roughly 400 nm (violet) to
              700 nm (red).
            </p>
            <div className="mt-5 rounded-2xl bg-[#080D1B] p-5">
              <p className="font-semibold text-amber-300">Theories of light</p>
              <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-400">
                <li><strong className="text-slate-200">Wave theory:</strong> Christian Huygens described light as wave motion.</li>
                <li><strong className="text-slate-200">Corpuscular theory:</strong> Isaac Newton described light as tiny particles called corpuscles.</li>
                <li><strong className="text-slate-200">Electromagnetic theory:</strong> James Clerk Maxwell explained light through electromagnetic fields.</li>
                <li><strong className="text-slate-200">Quantum theory:</strong> light energy is exchanged in discrete packets called photons.</li>
              </ul>
            </div>
          </article>

          <article className="rounded-3xl border border-white/10 bg-[#111A2E] p-6 md:p-8">
            <div className="mb-4 flex items-center gap-3 text-amber-300">
              <Lightbulb size={23} />
              <span className="text-sm font-semibold">LESSON 02</span>
            </div>
            <h2 className="text-2xl font-bold">Reflection and the normal</h2>
            <p className="mt-4 leading-7 text-slate-300">
              Reflection happens when light strikes a surface and returns to
              the original medium. The normal is an imaginary line drawn
              perpendicular to the surface at the point where the ray strikes.
            </p>
            <div className="mt-5 rounded-2xl bg-[#080D1B] p-5">
              <p className="font-semibold text-amber-300">Law of reflection</p>
              <p className="my-3 text-3xl font-black">θᵢ = θᵣ</p>
              <p className="text-sm leading-6 text-slate-400">
                The angle of incidence equals the angle of reflection. Both
                angles are measured from the normal, not from the mirror
                surface. The incident ray, reflected ray, and normal lie in
                the same plane.
              </p>
            </div>
          </article>
        </section>

        <section id="mirror-vocabulary" className="mb-10 scroll-mt-28 rounded-3xl border border-white/10 bg-[#111A2E] p-6 md:p-8">
          <div className="mb-4 flex items-center gap-3 text-amber-300">
            <BookOpen size={23} />
            <span className="text-sm font-semibold">LESSON 03</span>
          </div>
          <h2 className="text-2xl font-bold">Mirror vocabulary</h2>
          <p className="mt-3 max-w-3xl leading-7 text-slate-300">
            Learn these terms before using the simulator. They describe the
            parts of a curved mirror and the images it forms.
          </p>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl bg-[#080D1B] p-5">
              <p className="font-semibold text-amber-300">Parts of a mirror</p>
              <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-400">
                <li><strong className="text-slate-200">Principal axis:</strong> the straight line through the center of the mirror, perpendicular to its surface.</li>
                <li><strong className="text-slate-200">Vertex (V):</strong> the point where the principal axis meets the mirror.</li>
                <li><strong className="text-slate-200">Focal point (F):</strong> the point where rays parallel to the axis meet after reflecting (concave), or appear to come from (convex).</li>
                <li><strong className="text-slate-200">Center of curvature (C):</strong> the center of the sphere the mirror is cut from. Its distance from V is the radius R, and R = 2f.</li>
              </ul>
            </div>

            <div className="rounded-2xl bg-[#080D1B] p-5">
              <p className="font-semibold text-amber-300">Describing an image</p>
              <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-400">
                <li><strong className="text-slate-200">Real:</strong> reflected rays actually meet. The image is in front of the mirror and can be shown on a screen.</li>
                <li><strong className="text-slate-200">Virtual:</strong> reflected rays only appear to come from the image. It is behind the mirror and cannot be shown on a screen.</li>
                <li><strong className="text-slate-200">Upright or inverted:</strong> upright means the image points the same way as the object. Inverted means it is flipped.</li>
                <li><strong className="text-slate-200">Enlarged, reduced, or same size:</strong> compare image height with object height using |M|. Larger than 1 is enlarged, smaller than 1 is reduced, and equal to 1 is the same size.</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="sign-convention" className="mb-10 scroll-mt-28 rounded-3xl border border-white/10 bg-[#111A2E] p-6 md:p-8">
          <div className="mb-4 flex items-center gap-3 text-amber-300">
            <Calculator size={23} />
            <span className="text-sm font-semibold">SIGN CONVENTION</span>
          </div>
          <h2 className="text-2xl font-bold">Read this before using the simulator</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
            This page measures all distances in centimeters from the mirror, and
            treats the side where the object sits (in front of the mirror) as
            positive.
          </p>
          <ul className="mt-4 space-y-2 text-sm leading-7 text-slate-300">
            <li><strong className="text-amber-300">Object distance do:</strong> always positive for a real object in front of the mirror.</li>
            <li><strong className="text-amber-300">Focal length f:</strong> positive for a concave mirror, negative for a convex mirror, and infinite for a plane mirror.</li>
            <li><strong className="text-amber-300">Image distance di:</strong> positive means a real image in front of the mirror. Negative means a virtual image behind it.</li>
            <li><strong className="text-amber-300">Magnification M:</strong> positive means upright. Negative means inverted.</li>
          </ul>
        </section>

        <MirrorImageSimulator />

        <section id="mirror-types" className="mb-10 scroll-mt-28 grid gap-6 lg:grid-cols-3">
          <article className="rounded-3xl border border-white/10 bg-[#111A2E] p-6">
            <h2 className="text-xl font-bold text-amber-300">Plane mirrors</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Plane mirrors have flat reflecting surfaces. Their images are
              virtual, upright, and the same size as the object. The image
              appears as far behind the mirror as the object is in front.
            </p>
            <div className="mt-4 rounded-xl bg-[#080D1B] p-4 text-sm text-slate-400">
              Example: your reflection in a bathroom mirror.
            </div>
          </article>

          <article className="rounded-3xl border border-white/10 bg-[#111A2E] p-6">
            <h2 className="text-xl font-bold text-amber-300">Concave mirrors</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Concave mirrors curve inward. Their image properties depend on
              the object&apos;s position relative to the focal point F and center
              of curvature C.
            </p>
            <div className="mt-4 rounded-xl bg-[#080D1B] p-4 text-sm text-slate-400">
              An object inside F forms a virtual, upright, enlarged image.
            </div>
          </article>

          <article className="rounded-3xl border border-white/10 bg-[#111A2E] p-6">
            <h2 className="text-xl font-bold text-amber-300">Convex mirrors</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Convex mirrors curve outward. For an ordinary real object, they
              produce a virtual, upright, smaller image behind the mirror.
            </p>
            <div className="mt-4 rounded-xl bg-[#080D1B] p-4 text-sm text-slate-400">
              Example: a vehicle&apos;s wide-angle side-view mirror.
            </div>
          </article>
        </section>

        <section id="image-formation" className="mb-10 scroll-mt-28 rounded-3xl border border-white/10 bg-[#111A2E] p-6 md:p-8">
          <div className="mb-5 flex items-center gap-3 text-amber-300">
            <BookOpen size={23} />
            <p className="text-sm font-semibold">IMAGE FORMATION</p>
          </div>
          <h2 className="text-2xl font-bold md:text-3xl">
            Concave mirror: object position matters
          </h2>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse text-left text-sm">
              <caption className="sr-only">
                Image formed by a concave mirror for each object position
              </caption>
              <thead>
                <tr className="border-b border-white/10 text-amber-300">
                  <th scope="col" className="p-3">Object position</th>
                  <th scope="col" className="p-3">Image position</th>
                  <th scope="col" className="p-3">Image properties</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                {[
                  ["Beyond C", "Between C and F", "Real, inverted, smaller"],
                  ["At C", "At C", "Real, inverted, same size"],
                  ["Between C and F", "Beyond C", "Real, inverted, larger"],
                  ["At F", "At infinity in the ideal model", "Reflected rays are parallel"],
                  ["Between F and mirror", "Behind mirror", "Virtual, upright, larger"],
                ].map((row) => (
                  <tr key={row[0]} className="border-b border-white/10 last:border-0">
                    {row.map((cell, cellIndex) => (
                      <td key={`${row[0]}-${cellIndex}`} className="p-3 leading-6">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-400">
            C is the center of curvature. F is the focal point. For an ideal
            spherical mirror, the focal length is half the radius of curvature.
          </p>

          <h3 className="mt-8 text-xl font-bold">
            Convex and plane mirrors: one rule each
          </h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse text-left text-sm">
              <caption className="sr-only">
                Image formed by convex and plane mirrors for any object position
              </caption>
              <thead>
                <tr className="border-b border-white/10 text-amber-300">
                  <th scope="col" className="p-3">Mirror</th>
                  <th scope="col" className="p-3">Image position</th>
                  <th scope="col" className="p-3">Image properties</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                {[
                  ["Convex (any object position)", "Behind the mirror, between V and F", "Virtual, upright, smaller"],
                  ["Plane (any object position)", "Behind the mirror, di = −do", "Virtual, upright, same size"],
                ].map((row) => (
                  <tr key={row[0]} className="border-b border-white/10 last:border-0">
                    {row.map((cell, cellIndex) => (
                      <td key={`${row[0]}-${cellIndex}`} className="p-3 leading-6">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="mirror-equations" className="mb-10 scroll-mt-28 rounded-3xl border border-white/10 bg-[#111A2E] p-6 md:p-8">
          <div className="mb-5 flex items-center gap-3 text-amber-300">
            <Calculator size={23} />
            <p className="text-sm font-semibold">FORMULAS AND CALCULATIONS</p>
          </div>
          <h2 className="text-2xl font-bold md:text-3xl">
            Mirror equation and magnification
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-[#080D1B] p-5">
              <p className="text-sm text-slate-400">Radius of curvature</p>
              <p className="my-3 text-2xl font-black text-amber-300">R = 2f</p>
              <p className="text-sm leading-6 text-slate-400">
                R is the radius of curvature; f is the focal length.
              </p>
            </div>
            <div className="rounded-2xl bg-[#080D1B] p-5">
              <p className="text-sm text-slate-400">Mirror equation</p>
              <p className="my-3 text-2xl font-black text-amber-300">
                1/f = 1/do + 1/di
              </p>
              <p className="text-sm leading-6 text-slate-400">
                do is object distance; di is image distance.
              </p>
            </div>
            <div className="rounded-2xl bg-[#080D1B] p-5">
              <p className="text-sm text-slate-400">Linear magnification</p>
              <p className="my-3 text-2xl font-black text-amber-300">
                M = -di/do
              </p>
              <p className="text-sm leading-6 text-slate-400">
                Also M = hi/ho. Negative M means inverted; positive M means
                upright.
              </p>
            </div>
          </div>

          {workedExamples.map((example) => (
            <WorkedExample key={example.title} example={example} />
          ))}
          </section>

          <section
            id="refraction"
            className="mb-10 scroll-mt-28 rounded-3xl border border-cyan-400/20 bg-[#111A2E] p-6 md:p-8"
          >
            <div className="mb-4 flex items-center gap-3 text-cyan-300">
              <Waves size={23} />
              <span className="text-sm font-semibold">LIGHT AT A BOUNDARY</span>
            </div>
            <h2 className="text-2xl font-bold md:text-3xl">Refraction and Snell&apos;s Law</h2>
            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <article className="rounded-2xl bg-[#080D1B] p-5">
                <h3 className="font-semibold text-cyan-200">Why light bends</h3>
                <p className="mt-3 leading-7 text-slate-300">
                  Refraction is the change in direction of light when it crosses
                  from one transparent material into another. Light changes
                  speed in the new material; when it enters at an angle, one
                  side of the wavefront changes speed first, turning the
                  direction of travel. At normal incidence, its speed changes
                  but its direction does not.
                </p>
                <p className="mt-3 leading-7 text-slate-300">
                  Refractive index is <strong className="text-cyan-200">n = c/v</strong>,
                  where c is the speed of light in vacuum and v is its speed in
                  the medium. Larger n means light travels more slowly. For
                  example, n is about 1.00 in air, 1.33 in water, and 1.50 in
                  common glass. Frequency stays the same across the boundary;
                  wavelength changes with speed.
                </p>
              </article>
              <article className="rounded-2xl bg-[#080D1B] p-5">
                <h3 className="font-semibold text-cyan-200">Bending and total internal reflection</h3>
                <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-300">
                  <li><strong className="text-slate-100">Into higher n:</strong> the ray bends toward the normal.</li>
                  <li><strong className="text-slate-100">Into lower n:</strong> the ray bends away from the normal.</li>
                  <li><strong className="text-slate-100">Snell&apos;s law:</strong> n₁ sin θ₁ = n₂ sin θ₂; each angle is measured from the normal.</li>
                  <li><strong className="text-slate-100">Total internal reflection:</strong> if light goes from higher to lower n and the incidence angle exceeds θc = sin⁻¹(n₂/n₁), there is no refracted ray.</li>
                </ul>
              </article>
            </div>
            <RefractionSimulator />
          </section>

          <LensImageSimulator />

          <section
            id="optical-instruments"
            className="mb-10 scroll-mt-28 rounded-3xl border border-white/10 bg-[#111A2E] p-6 md:p-8"
          >
            <p className="text-sm font-semibold text-amber-300">OPTICS IN EVERYDAY LIFE</p>
            <h2 className="mt-2 text-2xl font-bold md:text-3xl">Optical Instruments</h2>
            <p className="mt-3 max-w-4xl leading-7 text-slate-300">
              Optical instruments guide or focus light to make images easier to
              see. The diagrams below are simplified illustrations of their
              main optical elements.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  title: "Human eye",
                  description:
                    "The cornea and adjustable crystalline lens focus light onto the retina. The iris changes pupil size, and the retina converts light into nerve signals.",
                  drawing: (
                    <svg viewBox="0 0 180 92" role="img" aria-label="Simplified eye showing lens focusing light on the retina" className="h-24 w-full">
                      <path d="M22 46 Q80 0 145 46 Q80 92 22 46Z" fill="#0E3342" stroke="#7DD3FC" strokeWidth="3" />
                      <path d="M61 27 Q78 46 61 65 Q46 46 61 27Z" fill="#38BDF8" fillOpacity=".45" stroke="#7DD3FC" strokeWidth="2" />
                      <line x1="5" y1="39" x2="105" y2="46" stroke="#FBBF24" strokeWidth="2" />
                      <line x1="5" y1="53" x2="105" y2="46" stroke="#FBBF24" strokeWidth="2" />
                      <circle cx="142" cy="46" r="5" fill="#F472B6" />
                    </svg>
                  ),
                },
                {
                  title: "Magnifying glass",
                  description:
                    "A convex lens acts as a simple magnifier. With the object inside its focal length, it produces an enlarged, upright virtual image.",
                  drawing: (
                    <svg viewBox="0 0 180 92" role="img" aria-label="Convex magnifying lens with an enlarged virtual image" className="h-24 w-full">
                      <line x1="20" y1="72" x2="160" y2="72" stroke="#64748B" />
                      <path d="M90 16 Q68 46 90 76 Q112 46 90 16Z" fill="#38BDF8" fillOpacity=".2" stroke="#7DD3FC" strokeWidth="3" />
                      <line x1="48" y1="72" x2="48" y2="51" stroke="#34D399" strokeWidth="3" />
                      <line x1="90" y1="51" x2="150" y2="29" stroke="#FBBF24" strokeWidth="2" />
                      <line x1="90" y1="51" x2="150" y2="51" stroke="#A78BFA" strokeWidth="2" />
                      <line x1="150" y1="72" x2="150" y2="30" stroke="#F472B6" strokeWidth="2" strokeDasharray="5 4" />
                    </svg>
                  ),
                },
                {
                  title: "Microscope",
                  description:
                    "The objective lens forms a magnified intermediate image of a nearby specimen. The eyepiece then magnifies that image for the eye.",
                  drawing: (
                    <svg viewBox="0 0 180 92" role="img" aria-label="Simplified microscope with objective and eyepiece lenses" className="h-24 w-full">
                      <path d="M62 15 L90 15 L111 49 L97 58 L70 27Z" fill="#334155" stroke="#CBD5E1" strokeWidth="2" />
                      <rect x="57" y="12" width="38" height="8" rx="3" fill="#7DD3FC" />
                      <rect x="99" y="48" width="18" height="9" rx="3" fill="#38BDF8" />
                      <path d="M108 58 Q107 75 84 78 L53 78" fill="none" stroke="#CBD5E1" strokeWidth="6" strokeLinecap="round" />
                      <line x1="40" y1="82" x2="130" y2="82" stroke="#64748B" strokeWidth="4" />
                      <circle cx="108" cy="68" r="3" fill="#FBBF24" />
                    </svg>
                  ),
                },
                {
                  title: "Telescope",
                  description:
                    "The objective gathers nearly parallel rays from a distant object and forms an image. The eyepiece magnifies the angle at which that image is viewed.",
                  drawing: (
                    <svg viewBox="0 0 180 92" role="img" aria-label="Telescope tube with objective and eyepiece" className="h-24 w-full">
                      <path d="M42 34 L128 24 L133 59 L47 65Z" fill="#1E293B" stroke="#CBD5E1" strokeWidth="2" />
                      <line x1="48" y1="29" x2="52" y2="68" stroke="#7DD3FC" strokeWidth="4" />
                      <line x1="127" y1="23" x2="132" y2="60" stroke="#A78BFA" strokeWidth="4" />
                      <line x1="8" y1="36" x2="45" y2="42" stroke="#FBBF24" strokeWidth="2" />
                      <line x1="8" y1="58" x2="45" y2="54" stroke="#FBBF24" strokeWidth="2" />
                      <line x1="134" y1="39" x2="170" y2="31" stroke="#34D399" strokeWidth="2" />
                      <line x1="134" y1="49" x2="170" y2="57" stroke="#34D399" strokeWidth="2" />
                    </svg>
                  ),
                },
              ].map((instrument) => (
                <article key={instrument.title} className="rounded-2xl border border-white/10 bg-[#080D1B] p-4">
                  {instrument.drawing}
                  <h3 className="mt-2 font-semibold text-amber-200">{instrument.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{instrument.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section
            id="optics-examples"
            className="mb-10 scroll-mt-28 rounded-3xl border border-white/10 bg-[#111A2E] p-6 md:p-8"
          >
            <p className="text-sm font-semibold text-cyan-300">WORKED EXAMPLES</p>
            <h2 className="mt-2 text-2xl font-bold md:text-3xl">Refraction and lens calculations</h2>
            <p className="mt-3 max-w-4xl leading-7 text-slate-300">
              Each solution is organized as Given, Find, Formula, Substitution,
              Calculation, and Final Answer. Open an example to follow the steps.
            </p>
            <div className="mt-5">
              {additionalWorkedExamples.map((example) => (
                <WorkedExample key={example.title} example={example} />
              ))}
            </div>
          </section>

          <OpticsPractice />

          <section
          id="quiz"
          className="scroll-mt-24 rounded-3xl border border-white/10 bg-[#111A2E] p-6 md:p-8"
        >
          <LessonQuizEligibilityNotice
            eligibility={eligibility}
            error={eligibilityError}
            onRetry={() => void refreshEligibility()}
          />
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-emerald-300">
                CHECK YOUR KNOWLEDGE
              </p>
              <h2 className="mt-2 text-2xl font-bold md:text-3xl">
                Light &amp; Reflection · {quizQuestions.length} questions
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Answer every question. Your score and explanations appear after submission.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-3">
              <p className="text-sm text-slate-300">Your score</p>
              <p className="text-2xl font-black text-emerald-300">
                {submitted ? `${score} / ${quizQuestions.length}` : `${answeredCount} / ${quizQuestions.length}`}
              </p>
            </div>
          </div>

          <div className="mb-6 h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label="Quiz questions answered" aria-valuemin={0} aria-valuemax={quizQuestions.length} aria-valuenow={answeredCount}>
            <div className="h-full rounded-full bg-sky-400 transition-all" style={{ width: `${(answeredCount / quizQuestions.length) * 100}%` }} />
          </div>

          <div className="mb-6 rounded-xl bg-[#080D1B] p-4 text-sm leading-6 text-slate-400">
            Choose one answer for every question. Answer positions change each time you retake the quiz.
          </div>

          {submitted && (
            <div
              role="status"
              className="mb-6 rounded-xl border border-white/10 bg-[#080D1B] p-4 text-sm leading-7 text-slate-300"
            >
              {missed.length === 0 ? (
                <p className="font-semibold text-emerald-300">
                  Perfect score! Every answer was correct.
                </p>
              ) : (
                <p>
                  <span className="font-semibold text-rose-300">
                    Review these questions:
                  </span>{" "}
                  {missed.map((index) => (
                    <a
                      key={index}
                      href={`#quiz-q-${index + 1}`}
                      className={`mr-3 font-semibold text-sky-300 underline hover:text-sky-200 ${FOCUS}`}
                    >
                      Q{index + 1}
                    </a>
                  ))}
                </p>
              )}
            </div>
          )}

          <div className="space-y-6">
            {quizQuestions.map((question, index) => {
              const isMissed = submitted && answers[index] !== question.a;
              return (
                <LessonQuizQuestion key={question.q} number={index + 1}>
                  <div
                    id={`quiz-q-${index + 1}`}
                    className={`scroll-mt-24 rounded-xl border p-4 ${
                      isMissed ? "border-rose-400/50 bg-rose-400/5" : "border-white/10 bg-white/[0.02]"
                    }`}
                  >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p id={`quiz-label-${index}`} className="font-semibold leading-7">
                      {question.q}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {isMissed && (
                        <span className="rounded-full bg-rose-400/10 px-3 py-1 text-xs font-semibold text-rose-300">
                          {answers[index] === undefined ? "Not answered" : "Incorrect"}
                        </span>
                      )}
                      {index >= 15 && (
                        <span className="rounded-full bg-sky-400/10 px-3 py-1 text-xs font-semibold text-sky-300">
                          Problem-solving
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    role="radiogroup"
                    aria-labelledby={`quiz-label-${index}`}
                    className="mt-4 grid gap-3 sm:grid-cols-2"
                  >
                    {question.options.map((option, optionIndex) => {
                      const selected = answers[index] === optionIndex;
                      const correct = question.a === optionIndex;

                      const optionState = submitted
                        ? correct
                          ? "correct"
                          : selected
                            ? "incorrect"
                            : "muted"
                        : selected
                          ? "selected"
                          : "default";

                      return (
                        <button
                          key={`${index}-${optionIndex}`}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          disabled={submitted}
                          onClick={() =>
                            setAnswers((previous) => ({
                              ...previous,
                              [index]: optionIndex,
                            }))
                          }
                          className={`${QUIZ_OPTION_BASE_CLASS} ${getQuizOptionClass(optionState)} ${FOCUS}`}
                        >
                          <span className="mr-2 font-bold text-slate-400">
                            {String.fromCharCode(65 + optionIndex)}.
                          </span>
                          {option}
                          {submitted && correct && (
                            <>
                              <CheckCircle2
                                size={16}
                                aria-hidden="true"
                                className="ml-2 inline text-emerald-300"
                              />
                              <span className="sr-only"> (correct answer)</span>
                            </>
                          )}
                          {submitted && selected && !correct && (
                            <>
                              <XCircle
                                size={16}
                                aria-hidden="true"
                                className="ml-2 inline text-rose-300"
                              />
                              <span className="sr-only"> (your answer, incorrect)</span>
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {submitted && (
                    <div className="mt-4 rounded-xl bg-white/[0.03] p-4">
                      <p className="text-sm font-semibold text-emerald-300">
                        Explanation
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        {question.why}
                      </p>
                    </div>
                  )}
                  </div>
                  </LessonQuizQuestion>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {!submitted ? (
              <button
                type="button"
                disabled={
                  answeredCount !== quizQuestions.length ||
                  !eligibility?.eligible ||
                  saveState === "saving"
                }
                onClick={submitQuiz}
                className={`${QUIZ_SUBMIT_BUTTON_CLASS} ${FOCUS}`}
              >
                Submit quiz <ArrowRight size={16} className="ml-1 inline" />
              </button>
            ) : (
              <button
                type="button"
                onClick={resetQuiz}
                className={`${QUIZ_RETRY_BUTTON_CLASS} ${FOCUS}`}
              >
                <RotateCcw size={16} className="mr-2 inline" />
                Try again
              </button>
            )}
          </div>
          <LessonQuizFeedback
            saveState={saveState}
            passed={passed}
            message={saveMessage}
            onRetry={async () => {
              if (await saveResult(
                "optics",
                quizQuestions.map((_, index) => answers[index] ?? -1),
                quizQuestions.map((question) => ({
                  question: question.q,
                  choices: question.originalOptions,
                  explanation: question.why,
                  questionIndex: question.questionIndex,
                  optionOrder: question.optionOrder,
                }))
              )) setSubmitted(true);
            }}
          />
        </section>

        <LessonNavigation
          lessonSlug="optics"
          previous={{ href: "/lessons/waves-sound", label: "Waves & Sound" }}
          next={{ href: "/lessons/electricity", label: "Electricity" }}
        />
        </div>
        </div>
      </div>
    </main>
  );
}