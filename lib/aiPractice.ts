export const practiceLessons = [
  {
    slug: "measurements-vectors",
    title: "Measurements & Vectors",
    topics: [
      "SI Units and Measurements",
      "Unit Conversions",
      "Dimensional Analysis",
      "Significant Figures",
      "Scalars and Vectors",
      "Vector Components",
      "Vector Addition and Resultants",
    ],
  },
  {
    slug: "fluids",
    title: "Fluids",
    topics: [
      "Pressure",
      "Density",
      "Pascal's Principle",
      "Archimedes' Principle",
      "Buoyancy",
      "Continuity Equation",
      "Bernoulli's Equation",
    ],
  },
  {
    slug: "temperature-heat",
    title: "Temperature & Heat",
    topics: [
      "Temperature Conversions",
      "Thermal Expansion",
      "Specific Heat Capacity",
      "Heat Transfer",
      "Calorimetry",
    ],
  },
  {
    slug: "waves-sound",
    title: "Waves & Sound",
    topics: [
      "Wave Properties",
      "Frequency, Wavelength, and Wave Speed",
      "Waves on a String",
      "Harmonics",
      "Speed of Sound",
      "Doppler Effect",
      "Sound Intensity",
    ],
  },
  {
    slug: "optics",
    title: "Light & Reflection",
    topics: [
      "Reflection",
      "Refraction",
      "Snell's Law",
      "Total Internal Reflection",
      "Mirrors",
      "Lenses",
      "Magnification",
      "Image Formation",
    ],
  },
  {
    slug: "electricity",
    title: "Electric Forces & Electric Field",
    topics: [
      "Atomic Structure and Electric Charge",
      "Conservation of Charge",
      "Coulomb's Law",
      "Electric Fields",
      "Electric Potential",
      "Ohm's Law",
      "Series Circuits",
      "Parallel Circuits",
    ],
  },
] as const;

export const practiceDifficulties = ["Easy", "Medium", "Hard"] as const;

export const practiceProblemTypes = [
  "Conceptual Question",
  "Multiple Choice",
  "Numerical Problem Solving",
  "Formula Application",
] as const;

export type PracticeLessonSlug = (typeof practiceLessons)[number]["slug"];
export type PracticeDifficulty = (typeof practiceDifficulties)[number];
export type PracticeProblemType = (typeof practiceProblemTypes)[number];
