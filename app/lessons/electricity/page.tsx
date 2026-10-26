"use client";

import { useState } from "react";
import Link from "next/link";

/* ---------- Shared styles ---------- */
const card = "rounded-2xl border border-slate-800 bg-[#111A2E] p-5";
const inputClass =
  "w-full rounded-xl border border-slate-700 bg-[#080D1B] px-3 py-2 text-slate-100 outline-none focus:border-sky-400";
const formulaBox = "my-4 rounded-xl bg-slate-900 p-4 text-center font-mono text-xl";

/* ---------- Helpers ---------- */
const K = 8.99e9; // Coulomb's constant (N·m²/C²)
const MICRO = 1e-6; // μC -> C

// Turn text from an input box into a number (empty text becomes NaN)
function parseInput(text: string): number {
  return text.trim() === "" ? NaN : Number(text);
}

const superscripts: Record<string, string> = {
  "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
  "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻",
};

// Readable numbers: normal decimals for mid-sized values, scientific notation otherwise
function formatValue(n: number): string {
  if (n === 0) return "0";
  const abs = Math.abs(n);
  if (abs >= 1e4 || abs < 1e-3) {
    const [mantissa, exponent] = n.toExponential(3).split("e");
    const sup = String(Number(exponent))
      .split("")
      .map((c) => superscripts[c] ?? c)
      .join("");
    return `${mantissa} × 10${sup}`;
  }
  return Number(n.toPrecision(4)).toString();
}

function NumberField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (text: string) => void;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-slate-300">{label}</span>
      <input
        className={inputClass}
        type="number"
        step="any"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

type Question = { q: string; options: string[]; answer: number; why: string };

const questions: Question[] = [
  {
    q: "Electric charge expresses the extent to which a unit of matter has more or fewer ____ than protons.",
    options: ["neutrons", "electrons", "photons"],
    answer: 1,
    why: "The lecture defines charge as how many more or fewer electrons than protons a unit of matter has.",
  },
  {
    q: "Which choice correctly gives the charge of each particle?",
    options: [
      "Proton: negative; electron: positive; neutron: no net charge",
      "Proton: positive; electron: neutral; neutron: negative",
      "Proton: positive; electron: negative; neutron: no net charge",
    ],
    answer: 2,
    why: "A proton is positive, an electron is negative, and a neutron has no net electric charge.",
  },
  {
    q: "What is the SI unit of electric charge?",
    options: ["Coulomb (C)", "Newton (N)", "Joule (J)"],
    answer: 0,
    why: "Electric charge is measured in coulombs (C).",
  },
  {
    q: "What is the magnitude of the charge of one proton or one electron?",
    options: ["9.11 × 10⁻³¹ C", "1.602 × 10⁻¹⁹ C", "1.602 × 10¹⁹ C"],
    answer: 1,
    why: "The elementary charge is about 1.602 × 10⁻¹⁹ C (9.11 × 10⁻³¹ is the electron's mass in kg).",
  },
  {
    q: "About how many elementary charges (electrons) make up one coulomb?",
    options: ["8.99 × 10⁹", "1.602 × 10⁻¹⁹", "6.24 × 10¹⁸"],
    answer: 2,
    why: "1 C = 1 / (1.602 × 10⁻¹⁹) ≈ 6.24 × 10¹⁸ elementary charges.",
  },
  {
    q: "Which statement describes conservation of charge?",
    options: [
      "Charge can be transferred, but the total charge of an isolated system stays constant.",
      "Charge is destroyed whenever two objects touch.",
      "Charge can be created freely inside an isolated system.",
    ],
    answer: 0,
    why: "Charge can neither be created nor destroyed, only transferred, so the total charge does not change.",
  },
  {
    q: "What does quantization of charge mean?",
    options: [
      "Charge can have any decimal value.",
      "Any charge found in nature is a whole-number multiple of the elementary charge.",
      "Every charge is exactly one coulomb.",
    ],
    answer: 1,
    why: "The only charges that occur in nature are integral multiples of the electronic charge e.",
  },
  {
    q: "Which pair of particles attracts each other?",
    options: ["A proton and an electron", "Two protons", "Two electrons"],
    answer: 0,
    why: "Unlike charges attract. Two protons or two electrons are like charges, so they repel.",
  },
  {
    q: "Which statement about conductors and insulators is correct?",
    options: [
      "Insulators let charge move more easily than conductors.",
      "Conductors let charge move readily; insulators conduct it poorly.",
      "Both conductors and insulators block all charge movement.",
    ],
    answer: 1,
    why: "Conductors readily conduct electric charge, while insulators conduct it poorly.",
  },
  {
    q: "Which list shows materials the lecture names as common insulators?",
    options: [
      "Copper, aluminum, silver",
      "Gold, silver, rubber",
      "Rubber, many plastics, wood",
    ],
    answer: 2,
    why: "The lecture lists rubber, many plastics, and wood as common insulators. Copper, aluminum, silver, and gold are conductors.",
  },
  {
    q: "What is Coulomb’s law used to find?",
    options: [
      "The electrostatic force between two point charges",
      "The mass of an electron",
      "The number of protons in an atom",
    ],
    answer: 0,
    why: "Coulomb’s law gives the magnitude of the electrostatic force one point charge exerts on another.",
  },
  {
    q: "What is the approximate value of Coulomb’s constant k?",
    options: ["1.602 × 10⁻¹⁹ N·m²/C²", "8.99 × 10⁹ N·m²/C²", "6.24 × 10¹⁸ N·m²/C²"],
    answer: 1,
    why: "In SI units, k ≈ 8.99 × 10⁹ N·m²/C².",
  },
  {
    q: "In F = k|q₁q₂|/r², what does r represent?",
    options: [
      "The radius of the nucleus",
      "The resistance of the wire",
      "The distance between the two charges",
    ],
    answer: 2,
    why: "r is the distance between the two point charges, in meters.",
  },
  {
    q: "If the distance between two charges is doubled, what happens to the force between them?",
    options: ["It becomes one-fourth as large", "It is cut in half", "It doubles"],
    answer: 0,
    why: "The force is inversely proportional to r². Doubling r makes r² four times larger, so F becomes 1/4.",
  },
  {
    q: "Two charges of +1.0 C and −1.0 C are 1.0 km apart. What is the magnitude of the force between them?",
    options: ["8.99 × 10⁹ N", "8.99 × 10³ N", "8.99 × 10⁶ N"],
    answer: 1,
    why: "r = 1.0 km = 1000 m, so F = (8.99 × 10⁹)(1.0)(1.0) / (1000)² = 8.99 × 10³ N (attractive).",
  },
  {
    q: "The electric field at a point is the force on a small test charge divided by what?",
    options: ["The mass of the test charge", "The distance squared", "The magnitude of the test charge"],
    answer: 2,
    why: "E = F / |q₀|: force divided by the magnitude of the test charge.",
  },
  {
    q: "Which formula gives electric field intensity?",
    options: ["E = F / |q₀|", "E = F × |q₀|", "E = |q₀| / F"],
    answer: 0,
    why: "Electric field intensity is force per unit test charge: E = F / |q₀|.",
  },
  {
    q: "What is the SI unit of electric field intensity?",
    options: ["Newton·meter squared per coulomb squared (N·m²/C²)", "Newton per coulomb (N/C)", "Coulomb per newton (C/N)"],
    answer: 1,
    why: "Force (N) divided by charge (C) gives newtons per coulomb (N/C).",
  },
  {
    q: "A negative test charge is placed in an electric field. The force on it points…",
    options: [
      "in the same direction as the field",
      "perpendicular to the field",
      "opposite to the field direction",
    ],
    answer: 2,
    why: "The field direction is the direction of force on a positive test charge, so a negative charge feels a force the opposite way.",
  },
  {
    q: "An electric field of 2.0 N/C acts on a charge of +18 × 10⁻⁸ C. What is the force magnitude?",
    options: ["3.6 × 10⁻⁷ N", "9.0 × 10⁻⁸ N", "3.6 × 10⁻⁶ N"],
    answer: 0,
    why: "F = E|q₀| = (2.0 N/C)(18 × 10⁻⁸ C) = 3.6 × 10⁻⁷ N.",
  },
];

export default function ElectrostaticsLesson() {
  /* Coulomb calculator (inputs kept as text so empty/invalid input can be detected) */
  const [q1, setQ1] = useState("2");
  const [q2, setQ2] = useState("-3");
  const [distance, setDistance] = useState("0.5");

  /* Electric field calculator */
  const [electricField, setElectricField] = useState("2");
  const [testCharge, setTestCharge] = useState("2");

  /* Quiz: answers maps question index -> chosen option index */
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  /* ----- Coulomb's law calculation ----- */
  const q1Num = parseInput(q1);
  const q2Num = parseInput(q2);
  const rNum = parseInput(distance);

  const coulombErrors: string[] = [];
  if (!Number.isFinite(q1Num)) coulombErrors.push("Enter a valid number for q₁ (μC).");
  if (!Number.isFinite(q2Num)) coulombErrors.push("Enter a valid number for q₂ (μC).");
  if (!Number.isFinite(rNum)) coulombErrors.push("Enter a valid number for the distance r (m).");
  else if (rNum <= 0) coulombErrors.push("Distance r must be greater than zero (it cannot be zero or negative).");

  const coulombValid = coulombErrors.length === 0;
  const force = coulombValid ? (K * Math.abs(q1Num * MICRO * (q2Num * MICRO))) / (rNum * rNum) : NaN;

  let interaction = "—";
  if (coulombValid) {
    if (q1Num === 0 || q2Num === 0) interaction = "No electrostatic force (a charge is zero)";
    else if (q1Num * q2Num > 0) interaction = "Repulsive (like charges)";
    else interaction = "Attractive (unlike charges)";
  }

  /* ----- Electric field calculation ----- */
  const eNum = parseInput(electricField);
  const q0Num = parseInput(testCharge);

  const fieldErrors: string[] = [];
  if (!Number.isFinite(eNum)) fieldErrors.push("Enter a valid number for E (N/C).");
  else if (eNum < 0) fieldErrors.push("Enter E as a magnitude (zero or positive). The test charge sign sets the force direction.");
  if (!Number.isFinite(q0Num)) fieldErrors.push("Enter a valid number for q₀ (μC).");

  const fieldValid = fieldErrors.length === 0;
  const fieldForce = fieldValid ? eNum * Math.abs(q0Num * MICRO) : NaN;

  let fieldDirection = "—";
  if (fieldValid) {
    if (fieldForce === 0) fieldDirection = "No force (E or q₀ is zero), so there is no direction.";
    else if (q0Num > 0) fieldDirection = "Positive test charge: the force is in the same direction as the electric field.";
    else fieldDirection = "Negative test charge: the force is opposite to the electric field direction.";
  }

  /* ----- Quiz scoring (only meaningful after submission) ----- */
  const score = questions.filter((item, i) => answers[i] === item.answer).length;
  const answeredCount = Object.keys(answers).length;

  function chooseAnswer(questionIndex: number, optionIndex: number) {
    if (submitted) return; // answers are locked after submission
    setAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
  }

  function resetQuiz() {
    setAnswers({});
    setSubmitted(false);
  }

  return (
    <main className="min-h-screen bg-[#080D1B] text-slate-100">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Link href="/" className="font-bold tracking-wide text-sky-400">
          Calph<span className="text-violet-400">++</span>
        </Link>
        <Link href="/dashboard" className="text-sm text-slate-300 hover:text-white">
          ← Dashboard
        </Link>
      </nav>

      <div className="mx-auto max-w-6xl px-5 pb-16">
        <header className="mb-8 rounded-3xl border border-emerald-400/20 bg-linear-to-br from-emerald-500/10 to-sky-500/10 p-7 md:p-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Lesson 06 · Physics 2
          </p>
          <h1 className="text-3xl font-bold md:text-5xl">Electric Forces & Electric Field</h1>
          <p className="mt-4 max-w-3xl leading-7 text-slate-300">
            Learn electric charge, how charges interact, Coulomb’s law, and electric field
            intensity, following the Electrostatics lecture reference.
          </p>
        </header>

        {/* ---------- 1. Electric charge ---------- */}
        <section className={card}>
          <h2 className="mb-3 text-xl font-semibold text-sky-300">1. Electric charge</h2>
          <p className="leading-7 text-slate-300">
            Electric charge is a property of matter that tells us whether something has more or
            fewer electrons than protons. It is the most basic quantity in an electric circuit.
            The SI unit of charge is the <b className="text-white">coulomb (C)</b>.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl bg-slate-900 p-4">
              <p className="font-semibold text-emerald-300">Proton</p>
              <p className="mt-1 text-sm text-slate-300">Positive charge: +1.602 × 10⁻¹⁹ C</p>
            </div>
            <div className="rounded-xl bg-slate-900 p-4">
              <p className="font-semibold text-violet-300">Electron</p>
              <p className="mt-1 text-sm text-slate-300">Negative charge: −1.602 × 10⁻¹⁹ C</p>
            </div>
            <div className="rounded-xl bg-slate-900 p-4">
              <p className="font-semibold text-sky-300">Neutron</p>
              <p className="mt-1 text-sm text-slate-300">No net electric charge</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-400">
            <b className="text-slate-200">Elementary charge:</b> the proton and the electron have
            the same charge magnitude, about 1.602 × 10⁻¹⁹ C. The coulomb is a large unit:
            1 C ≈ 1 / (1.602 × 10⁻¹⁹) ≈ 6.24 × 10¹⁸ elementary charges, so lab values are usually
            in pC, nC, or μC.
          </p>
        </section>

        {/* ---------- 2. Properties of charge ---------- */}
        <section className="mt-5">
          <h2 className="mb-3 text-xl font-semibold text-violet-300">2. Properties of electric charge</h2>
          <div className="grid gap-5 md:grid-cols-3">
            <div className={card}>
              <h3 className="mb-2 font-semibold text-white">Conservation of charge</h3>
              <p className="text-sm leading-6 text-slate-300">
                Charge can neither be created nor destroyed, only transferred. The total charge
                of an isolated system stays constant.
              </p>
            </div>
            <div className={card}>
              <h3 className="mb-2 font-semibold text-white">Quantization of charge</h3>
              <p className="text-sm leading-6 text-slate-300">
                Charges in nature come only in whole-number multiples of the elementary charge,
                e = 1.602 × 10⁻¹⁹ C.
              </p>
            </div>
            <div className={card}>
              <h3 className="mb-2 font-semibold text-white">Interaction of charges</h3>
              <p className="text-sm leading-6 text-slate-300">
                <b className="text-white">Like charges repel</b> (+ and +, or − and −).{" "}
                <b className="text-white">Unlike charges attract</b> (+ and −).
              </p>
            </div>
          </div>
        </section>

        {/* ---------- Conductors and insulators ---------- */}
        <section className={`${card} mt-5`}>
          <h2 className="mb-3 text-xl font-semibold text-sky-300">Conductors and insulators</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-slate-900 p-4">
              <h3 className="font-semibold text-white">Conductors</h3>
              <p className="mt-1 text-sm leading-6 text-slate-300">
                Charge moves through them readily. Examples: copper, aluminum, silver, and gold.
                That is why they are used in electrical wiring.
              </p>
            </div>
            <div className="rounded-xl bg-slate-900 p-4">
              <h3 className="font-semibold text-white">Insulators</h3>
              <p className="mt-1 text-sm leading-6 text-slate-300">
                Charge moves through them poorly. Examples: rubber, many plastics, and wood. They
                coat wires to keep charge from going where it is not wanted.
              </p>
            </div>
          </div>
        </section>

        {/* ---------- 3. Coulomb's law ---------- */}
        <section className={`${card} mt-5`}>
          <h2 className="mb-3 text-xl font-semibold text-sky-300">3. Coulomb’s law</h2>
          <p className="leading-7 text-slate-300">
            Coulomb’s law gives the electric force between two point charges. The force is
            directly proportional to the magnitudes of the charges and inversely proportional to
            the square of the distance between them.
          </p>
          <p className={`${formulaBox} text-sky-200`}>F = k |q₁q₂| / r²</p>
          <div className="grid gap-4 md:grid-cols-2">
            <ul className="space-y-1 text-sm text-slate-300">
              <li><b className="text-white">F</b> = magnitude of the electric force (N)</li>
              <li><b className="text-white">k</b> = Coulomb’s constant ≈ 8.99 × 10⁹ N·m²/C²</li>
              <li><b className="text-white">q₁</b> = first charge (C)</li>
              <li><b className="text-white">q₂</b> = second charge (C)</li>
              <li><b className="text-white">r</b> = distance between the charges (m)</li>
            </ul>
            <p className="rounded-xl bg-slate-900 p-4 text-sm leading-6 text-slate-300">
              The formula gives only the <b className="text-white">magnitude</b> of the force. The
              signs of the charges tell you the type: same signs → repulsive, opposite signs →
              attractive.
            </p>
          </div>

          <h3 className="mb-2 mt-5 font-semibold text-white">How to solve a Coulomb’s law problem</h3>
          <ol className="list-decimal space-y-1 pl-5 text-sm leading-6 text-slate-300">
            <li>Identify the given values (q₁, q₂, and r).</li>
            <li>Convert the charges to coulombs when necessary (1 μC = 10⁻⁶ C).</li>
            <li>Convert the distance to meters when necessary (1 km = 1000 m).</li>
            <li>Substitute the values into F = k|q₁q₂|/r².</li>
            <li>Calculate the force magnitude.</li>
            <li>Use the charge signs to decide if the force is attractive or repulsive.</li>
          </ol>

          <div className="mt-5 rounded-xl border border-slate-700 bg-slate-900/70 p-4 text-sm leading-7 text-slate-300">
            <p className="font-semibold text-sky-300">Worked example (from the lecture)</p>
            <p>Two objects with charges +1.0 C and −1.0 C are 1.0 km apart. Find the force magnitude.</p>
            <p><b className="text-white">Given:</b> q₁ = +1.0 C, q₂ = −1.0 C, r = 1.0 km = 1000 m</p>
            <p><b className="text-white">Formula:</b> F = k|q₁q₂|/r²</p>
            <p><b className="text-white">Substitute:</b> F = (8.99 × 10⁹)(1.0)(1.0) / (1000)² = (8.99 × 10⁹) / (1 × 10⁶)</p>
            <p><b className="text-white">Answer:</b> F = 8.99 × 10³ N, attractive (opposite signs).</p>
          </div>
        </section>

        {/* ---------- Coulomb calculator ---------- */}
        <section className={`${card} mt-5`}>
          <h2 className="mb-2 text-2xl font-semibold">Interactive Coulomb’s law calculator</h2>
          <p className="mb-5 text-sm text-slate-400">
            Enter each charge in microcoulombs (μC), including its sign, and the separation in
            meters (m). The calculated force is a magnitude; the signs decide attraction or
            repulsion.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            <NumberField label="Charge q₁ (μC)" value={q1} onChange={setQ1} hint="Use a minus sign for negative charge" />
            <NumberField label="Charge q₂ (μC)" value={q2} onChange={setQ2} hint="Use a minus sign for negative charge" />
            <NumberField label="Distance r (m)" value={distance} onChange={setDistance} hint="Must be greater than 0" />
          </div>

          {coulombErrors.length > 0 && (
            <div role="alert" className="mt-4 rounded-xl border border-amber-400/40 bg-amber-400/10 p-3 text-sm text-amber-200">
              {coulombErrors.map((msg) => (
                <p key={msg}>{msg}</p>
              ))}
            </div>
          )}

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl bg-slate-900 p-4">
              <p className="text-xs text-slate-400">Force magnitude</p>
              <p className="mt-1 wrap-break-word text-2xl font-bold text-sky-200">
                {coulombValid ? `${formatValue(force)} N` : "—"}
              </p>
            </div>
            <div className="rounded-xl bg-slate-900 p-4">
              <p className="text-xs text-slate-400">Interaction</p>
              <p className="mt-1 text-lg font-bold">{interaction}</p>
            </div>
            <div className="rounded-xl bg-slate-900 p-4">
              <p className="text-xs text-slate-400">Distance effect</p>
              <p className="mt-1 text-sm text-slate-200">Doubling r reduces the force to one-fourth.</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            This is an idealized point-charge calculation; real systems may include additional
            charges and forces.
          </p>
        </section>

        {/* ---------- 4. Electric field intensity ---------- */}
        <section className={`${card} mt-5`}>
          <h2 className="mb-3 text-xl font-semibold text-violet-300">4. Electric field intensity</h2>
          <p className="leading-7 text-slate-300">
            The electric field at a point is the electrostatic force felt by a small test charge
            placed there, divided by the size of that charge. It tells us how strongly a charge
            would be pushed or pulled at that point.
          </p>
          <p className={`${formulaBox} text-violet-200`}>E = F / |q₀|</p>
          <ul className="space-y-1 text-sm text-slate-300">
            <li><b className="text-white">E</b> = electric field intensity (N/C)</li>
            <li><b className="text-white">F</b> = magnitude of the electric force (N)</li>
            <li><b className="text-white">q₀</b> = test charge; the formula uses its magnitude |q₀| (C)</li>
          </ul>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <p className="rounded-xl bg-slate-900 p-3 text-sm text-slate-300">
              The field is a vector. Its direction is the direction of the force on a <b className="text-white">positive</b> test charge.
            </p>
            <p className="rounded-xl bg-slate-900 p-3 text-sm text-slate-300">
              A <b className="text-white">positive</b> test charge feels a force <b className="text-white">along</b> the field.
            </p>
            <p className="rounded-xl bg-slate-900 p-3 text-sm text-slate-300">
              A <b className="text-white">negative</b> test charge feels a force <b className="text-white">opposite</b> to the field.
            </p>
          </div>
          <p className="mt-3 text-sm text-slate-400">
            To find E, divide the force magnitude by the absolute value of the test charge. To go
            the other way, F = E|q₀|.
          </p>

          <div className="mt-5 rounded-xl border border-slate-700 bg-slate-900/70 p-4 text-sm leading-7 text-slate-300">
            <p className="font-semibold text-violet-300">Worked example (from the lecture)</p>
            <p>A spot has an electric field of magnitude 2.0 N/C. Find the force on a charge placed there if (a) q₀ = +18 × 10⁻⁸ C and (b) q₀ = −24 × 10⁻⁸ C.</p>
            <p><b className="text-white">Formula:</b> F = E|q₀|</p>
            <p><b className="text-white">(a)</b> F = (2.0 N/C)(18 × 10⁻⁸ C) = 3.6 × 10⁻⁷ N, in the direction of the field.</p>
            <p><b className="text-white">(b)</b> F = (2.0 N/C)(24 × 10⁻⁸ C) = 4.8 × 10⁻⁷ N, opposite to the field.</p>
          </div>
        </section>

        {/* ---------- Electric field calculator ---------- */}
        <section className={`${card} mt-5`}>
          <h2 className="mb-2 text-xl font-semibold">Force on a test charge in an electric field</h2>
          <p className="mb-4 text-sm text-slate-400">
            Use F = E|q₀| for the force magnitude. The magnitude is never negative; the sign of
            the test charge decides whether the force points with or against the field.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <NumberField label="Electric field E (N/C)" value={electricField} onChange={setElectricField} hint="Magnitude of the field (0 or greater)" />
            <NumberField label="Test charge q₀ (μC)" value={testCharge} onChange={setTestCharge} hint="Use a minus sign for a negative charge" />
          </div>

          {fieldErrors.length > 0 && (
            <div role="alert" className="mt-4 rounded-xl border border-amber-400/40 bg-amber-400/10 p-3 text-sm text-amber-200">
              {fieldErrors.map((msg) => (
                <p key={msg}>{msg}</p>
              ))}
            </div>
          )}

          <div className="mt-4 rounded-xl bg-slate-900 p-4">
            <p className="text-xs text-slate-400">Force magnitude</p>
            <p className="wrap-break-word text-2xl font-bold text-violet-200">
              {fieldValid ? `${formatValue(fieldForce)} N` : "—"}
            </p>
            <p className="mt-1 text-sm text-slate-400">{fieldDirection}</p>
          </div>
        </section>

        {/* ---------- Quiz ---------- */}
        <section className={`${card} mt-5`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold">Knowledge check</h2>
              <p className="mt-1 text-sm text-slate-400">
                20 questions based on the lecture. Answered: {answeredCount} of {questions.length}
              </p>
            </div>
            <button
              onClick={resetQuiz}
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm hover:border-slate-500"
            >
              Reset Quiz
            </button>
          </div>

          <div className="mt-5 space-y-5">
            {questions.map((item, i) => {
              const selected = answers[i];
              const isAnswered = selected !== undefined;
              const isCorrect = selected === item.answer;

              return (
                <div key={item.q} className="rounded-xl bg-slate-900/70 p-4">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-sky-300">
                      Question {i + 1} of {questions.length}
                    </p>
                    {!submitted && !isAnswered && (
                      <span className="rounded-full border border-slate-600 px-2 py-0.5 text-xs text-slate-400">Unanswered</span>
                    )}
                    {submitted && !isAnswered && (
                      <span className="rounded-full border border-amber-400/50 px-2 py-0.5 text-xs text-amber-300">Not answered</span>
                    )}
                    {submitted && isAnswered && (
                      <span className={`rounded-full border px-2 py-0.5 text-xs ${isCorrect ? "border-emerald-400/50 text-emerald-300" : "border-rose-400/50 text-rose-300"}`}>
                        {isCorrect ? "Correct" : "Incorrect"}
                      </span>
                    )}
                  </div>
                  <p className="mb-3 font-medium">{item.q}</p>

                  <div className="grid gap-2 md:grid-cols-3">
                    {item.options.map((option, oi) => {
                      let style = "border-slate-700 hover:border-slate-500";
                      if (!submitted && selected === oi) style = "border-sky-400 bg-sky-400/10";
                      if (submitted) {
                        if (oi === item.answer) style = "border-emerald-400 bg-emerald-400/10";
                        else if (selected === oi) style = "border-rose-400 bg-rose-400/10";
                        else style = "border-slate-800 opacity-60";
                      }
                      return (
                        <button
                          key={option}
                          type="button"
                          disabled={submitted}
                          aria-pressed={selected === oi}
                          onClick={() => chooseAnswer(i, oi)}
                          className={`rounded-lg border px-3 py-2 text-left text-sm ${style}`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>

                  {submitted && (
                    <p className={`mt-3 text-sm ${isCorrect ? "text-emerald-300" : "text-amber-300"}`}>
                      {isCorrect
                        ? "Correct! "
                        : `${isAnswered ? "Incorrect." : "Not answered."} Correct answer: ${item.options[item.answer]}. `}
                      {item.why}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-4">
            <button
              onClick={() => setSubmitted(true)}
              disabled={submitted}
              className="rounded-xl bg-emerald-400 px-5 py-3 font-semibold text-slate-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Check Answers
            </button>
            {!submitted && answeredCount < questions.length && (
              <p className="text-sm text-slate-400">
                {questions.length - answeredCount} question(s) still unanswered. Unanswered questions count as incorrect.
              </p>
            )}
            {submitted && (
              <p className="text-lg font-semibold">
                Score: {score}/{questions.length}
              </p>
            )}
          </div>
        </section>

        <div className="mt-7 flex justify-between text-sm">
          <Link href="/lessons/optics" className="text-slate-300 hover:text-sky-300">
            ← Light & Reflection
          </Link>
          <Link href="/dashboard" className="text-sky-300 hover:text-white">
            Back to dashboard →
          </Link>
        </div>
      </div>
    </main>
  );
}
