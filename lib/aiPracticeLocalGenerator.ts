import { validateArithmeticAnswer } from "@/lib/aiPracticeArithmetic";
import type {
  PracticeDifficulty,
  PracticeLessonSlug,
} from "@/lib/aiPractice";

export type LocalNumericalProblem = {
  supported: true;
  clarification: "";
  suggestedTopics: [];
  title: string;
  topic: string;
  problemType: "Numerical Problem Solving" | "Formula Application";
  question: string;
  givenValues: string[];
  find: string;
  formulaHint: string;
  answerType: "numeric";
  answer: string;
  acceptedAnswers: [];
  answerValue: number;
  answerUnit: string;
  tolerance: number;
  calculationExpression: string;
  choices: [];
  correctChoice: null;
  hint: string;
  solutionSteps: { label: string; detail: string }[];
  conceptExplanation: string;
};

type ProblemDetails = {
  question: string;
  givenValues: string[];
  find: string;
  formula: string;
  expression: string;
  answerValue: number;
  unit: string;
  explanation: string;
};

type GenerationInput = {
  lessonSlug: PracticeLessonSlug;
  topic: string;
  difficulty: PracticeDifficulty;
  problemType: "Numerical Problem Solving" | "Formula Application";
};

function randomInt(min: number, max: number, random: () => number) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function range(difficulty: PracticeDifficulty, random: () => number) {
  const maximum = difficulty === "Easy" ? 9 : difficulty === "Medium" ? 20 : 50;
  return randomInt(2, maximum, random);
}

function numberText(value: number) {
  return Number(value.toPrecision(8)).toString();
}

function displayNumber(value: number) {
  return value.toPrecision(3);
}

function detail(
  question: string,
  givenValues: string[],
  find: string,
  formula: string,
  expression: string,
  answerValue: number,
  unit: string,
  explanation: string
): ProblemDetails {
  return {
    question,
    givenValues,
    find,
    formula,
    expression,
    answerValue,
    unit,
    explanation,
  };
}

function generateDetails(
  input: GenerationInput,
  random: () => number
): ProblemDetails | null {
  const a = range(input.difficulty, random);
  const b = range(input.difficulty, random);
  const c = range(input.difficulty, random);
  const topic = input.topic;

  if (input.lessonSlug === "measurements-vectors") {
    if (topic === "SI Units and Measurements") {
      const km = Number((a + random()).toFixed(1));
      const expression = `${numberText(km)} * 1000`;
      return detail(
        `A field team records a road segment as ${km} km. What is its length in SI base units?`,
        [`Distance = ${km} km`],
        "Distance in meters",
        "d(m) = d(km) × 1000 m/km",
        expression,
        km * 1000,
        "m",
        "The meter is the SI base unit for length."
      );
    }
    if (topic === "Unit Conversions" || topic === "Dimensional Analysis") {
      const speed = Number((a + random()).toFixed(1));
      const expression = `${numberText(speed)} / 3.6`;
      return detail(
        `A cyclist travels at ${speed} km/h. Convert this speed to meters per second, checking that the units reduce to length divided by time.`,
        [`Speed = ${speed} km/h`],
        "Speed in meters per second",
        "v(m/s) = v(km/h) ÷ 3.6",
        expression,
        speed / 3.6,
        "m/s",
        "Since 1 km = 1000 m and 1 h = 3600 s, 1 km/h equals 1/3.6 m/s. The result has dimensions L/T."
      );
    }
    if (topic === "Significant Figures") {
      const length = Number((a / 10 + 1).toFixed(2));
      const width = Number((b / 10 + 1).toFixed(2));
      return detail(
        `A rectangular metal plate is ${length} m long and ${width} m wide. Calculate its area and report the result to the precision justified by the measurements.`,
        [`Length = ${length} m`, `Width = ${width} m`],
        "Area to three significant figures",
        "A = length × width",
        `${numberText(length)} * ${numberText(width)}`,
        length * width,
        "m^2",
        "The unrounded product is checked first, then the displayed answer is rounded to three significant figures."
      );
    }
    if (topic === "Scalars and Vectors" || topic === "Vector Addition and Resultants") {
      const x = 3 * a;
      const y = 4 * b;
      const expression = `((${x})^2 + (${y})^2)^0.5`;
      return detail(
        `A robot moves ${x} m east and then ${y} m north. Find the magnitude of its displacement from the starting point.`,
        [`East component = ${x} m`, `North component = ${y} m`],
        "Displacement magnitude",
        "R = √(Rx² + Ry²)",
        expression,
        Math.sqrt(x ** 2 + y ** 2),
        "m",
        "Displacement is a vector; perpendicular components combine by the Pythagorean theorem."
      );
    }
    if (topic === "Vector Components") {
      const magnitude = 5 * a;
      const expression = `${magnitude} * 0.8`;
      return detail(
        `A force of ${magnitude} N acts at an angle whose cosine is 0.80 relative to the positive x-axis. Find its x-component.`,
        [`Force magnitude = ${magnitude} N`, `cos θ = 0.80`],
        "Horizontal force component",
        "Fx = F cos θ",
        expression,
        magnitude * 0.8,
        "N",
        "A vector component is the projection of the vector onto an axis."
      );
    }
  }

  if (input.lessonSlug === "fluids") {
    if (topic === "Pressure") {
      const force = 20 * a;
      const area = b / 10 + 0.5;
      return detail(
        `A ${force} N load presses uniformly on a surface of area ${area} m². What pressure does it exert?`,
        [`Force = ${force} N`, `Area = ${area} m²`],
        "Pressure",
        "P = F/A",
        `${force} / ${numberText(area)}`,
        force / area,
        "Pa",
        "Pressure is the normal force distributed over each unit of area."
      );
    }
    if (topic === "Density") {
      const mass = a + 2;
      const volume = Number((b / 1000 + 0.001).toFixed(3));
      return detail(
        `A sample has mass ${mass} kg and volume ${volume} m³. Calculate its density.`,
        [`Mass = ${mass} kg`, `Volume = ${volume} m³`],
        "Density",
        "ρ = m/V",
        `${mass} / ${numberText(volume)}`,
        mass / volume,
        "kg/m^3",
        "Density measures mass per unit volume."
      );
    }
    if (topic === "Pascal's Principle") {
      const f1 = 10 * a;
      const area1 = b / 100 + 0.01;
      const area2 = 10 * area1;
      return detail(
        `A hydraulic lift has a small piston area of ${area1} m² and a large piston area of ${area2} m². If ${f1} N is applied to the small piston, find the output force.`,
        [`Input force = ${f1} N`, `Small area = ${area1} m²`, `Large area = ${numberText(area2)} m²`],
        "Output force",
        "F₂ = F₁(A₂/A₁)",
        `${f1} * (${numberText(area2)} / ${numberText(area1)})`,
        f1 * (area2 / area1),
        "N",
        "Pascal's principle says a pressure change is transmitted throughout an enclosed fluid."
      );
    }
    if (topic === "Archimedes' Principle" || topic === "Buoyancy") {
      const density = 1000;
      const volume = Number((b / 10000 + 0.001).toFixed(4));
      return detail(
        `A fully submerged object displaces ${volume} m³ of water. Find the buoyant force. Use g = 9.8 m/s² and water density 1000 kg/m³.`,
        [`Displaced volume = ${volume} m³`, `Water density = ${density} kg/m³`, "g = 9.8 m/s²"],
        "Buoyant force",
        "Fb = ρfluid Vdisplaced g",
        `${density} * ${numberText(volume)} * 9.8`,
        density * volume * 9.8,
        "N",
        "The buoyant force equals the weight of the displaced fluid."
      );
    }
    if (topic === "Continuity Equation") {
      const area1 = b / 100 + 0.01;
      const speed1 = 2 * a;
      const area2 = area1 / 2;
      return detail(
        `Water flows through a pipe section with area ${area1} m² at ${speed1} m/s, then enters a section with area ${numberText(area2)} m². Find the speed in the narrower section.`,
        [`A₁ = ${area1} m²`, `v₁ = ${speed1} m/s`, `A₂ = ${numberText(area2)} m²`],
        "Speed in the second section",
        "A₁v₁ = A₂v₂",
        `${numberText(area1)} * ${speed1} / ${numberText(area2)}`,
        (area1 * speed1) / area2,
        "m/s",
        "For steady incompressible flow, volume flow rate remains constant."
      );
    }
    if (topic === "Bernoulli's Equation") {
      const rho = 1000;
      const v1 = 2;
      const v2 = a + 2;
      return detail(
        `Water speeds up from ${v1} m/s to ${v2} m/s in a horizontal pipe. Find the pressure decrease, assuming steady, incompressible, nonviscous flow.`,
        [`ρ = ${rho} kg/m³`, `v₁ = ${v1} m/s`, `v₂ = ${v2} m/s`, "The pipe is horizontal"],
        "Pressure decrease",
        "P₁ − P₂ = ½ρ(v₂² − v₁²); faster flow has lower static pressure.",
        `0.5 * ${rho} * ((${v2})^2 - (${v1})^2)`,
        0.5 * rho * (v2 ** 2 - v1 ** 2),
        "Pa",
        "Bernoulli's equation relates pressure and flow speed along a streamline under the stated assumptions."
      );
    }
  }

  if (input.lessonSlug === "temperature-heat") {
    if (topic === "Temperature Conversions") {
      const celsius = 10 * a + 5;
      return detail(
        `A laboratory sample is at ${celsius} °C. Convert its temperature to kelvins.`,
        [`Temperature = ${celsius} °C`],
        "Temperature in kelvins",
        "T(K) = T(°C) + 273.15",
        `${celsius} + 273.15`,
        celsius + 273.15,
        "K",
        "Kelvin is the SI unit of thermodynamic temperature."
      );
    }
    if (topic === "Thermal Expansion") {
      const alpha = 1.2e-5;
      const length = 2 + b / 10;
      const deltaT = 20 * a;
      return detail(
        `A steel rail ${length} m long warms by ${deltaT} °C. Use α = 1.2 × 10⁻⁵ °C⁻¹ to find its increase in length.`,
        [`L₀ = ${length} m`, `ΔT = ${deltaT} °C`, `α = 1.2 × 10⁻⁵ °C⁻¹`],
        "Increase in length",
        "ΔL = αL₀ΔT",
        `1.2e-5 * ${numberText(length)} * ${deltaT}`,
        alpha * length * deltaT,
        "m",
        "For a small temperature change, linear expansion is proportional to the original length and temperature change."
      );
    }
    if (topic === "Specific Heat Capacity" || topic === "Heat Transfer") {
      const mass = a / 10 + 0.5;
      const specificHeat = 4200;
      const deltaT = 2 * b;
      return detail(
        `How much heat is needed to warm ${mass} kg of water by ${deltaT} °C? Use c = 4200 J/(kg·°C).`,
        [`m = ${mass} kg`, `c = ${specificHeat} J/(kg·°C)`, `ΔT = ${deltaT} °C`],
        "Heat transferred",
        "Q = mcΔT",
        `${numberText(mass)} * ${specificHeat} * ${deltaT}`,
        mass * specificHeat * deltaT,
        "J",
        "Specific heat capacity is the energy needed to raise one kilogram of a substance by one kelvin."
      );
    }
    if (topic === "Calorimetry") {
      const hotMass = a;
      const coldMass = b;
      const hotTemperature = 70 + c;
      const coldTemperature = 20 + c;
      return detail(
        `Mix ${hotMass} kg of water at ${hotTemperature} °C with ${coldMass} kg of water at ${coldTemperature} °C in an insulated container. Find the final temperature.`,
        [`Hot water: ${hotMass} kg at ${hotTemperature} °C`, `Cold water: ${coldMass} kg at ${coldTemperature} °C`, "Assume no heat loss and equal specific heat"],
        "Final equilibrium temperature",
        "Tf = (m₁T₁ + m₂T₂)/(m₁ + m₂)",
        `(${hotMass} * ${hotTemperature} + ${coldMass} * ${coldTemperature}) / (${hotMass} + ${coldMass})`,
        (hotMass * hotTemperature + coldMass * coldTemperature) / (hotMass + coldMass),
        "°C",
        "In an insulated mixture, heat lost by the warmer water equals heat gained by the cooler water."
      );
    }
  }

  if (input.lessonSlug === "waves-sound") {
    if (topic === "Wave Properties" || topic === "Frequency, Wavelength, and Wave Speed") {
      const frequency = 2 * a;
      const wavelength = b / 2 + 0.5;
      return detail(
        `A wave has frequency ${frequency} Hz and wavelength ${wavelength} m. Find its propagation speed.`,
        [`f = ${frequency} Hz`, `λ = ${wavelength} m`],
        "Wave speed",
        "v = fλ",
        `${frequency} * ${numberText(wavelength)}`,
        frequency * wavelength,
        "m/s",
        "Wave speed is the product of frequency and wavelength."
      );
    }
    if (topic === "Waves on a String") {
      const tension = 10 * a;
      const linearDensity = b / 100 + 0.01;
      return detail(
        `A string under tension ${tension} N has linear mass density ${linearDensity} kg/m. Find the wave speed.`,
        [`Tension = ${tension} N`, `μ = ${linearDensity} kg/m`],
        "Wave speed on the string",
        "v = √(T/μ)",
        `(${tension} / ${numberText(linearDensity)})^0.5`,
        Math.sqrt(tension / linearDensity),
        "m/s",
        "Increasing string tension raises wave speed, while increasing linear density lowers it."
      );
    }
    if (topic === "Harmonics") {
      const harmonic = a;
      const speed = 100 + 10 * b;
      const length = 0.5 + c / 10;
      return detail(
        `A string fixed at both ends has length ${length} m and wave speed ${speed} m/s. Find its ${harmonic}th harmonic frequency.`,
        [`n = ${harmonic}`, `v = ${speed} m/s`, `L = ${length} m`],
        `${harmonic}th harmonic frequency`,
        "fn = nv/(2L)",
        `${harmonic} * ${speed} / (2 * ${numberText(length)})`,
        (harmonic * speed) / (2 * length),
        "Hz",
        "A string fixed at both ends supports integer harmonics of its fundamental frequency."
      );
    }
    if (topic === "Speed of Sound") {
      const bulkModulus = (1.2 + a / 100) * 1e5;
      const density = 1 + b / 100;
      return detail(
        `For a gas with bulk modulus ${bulkModulus} Pa and density ${density} kg/m³, estimate the sound speed using the idealized relation v = √(B/ρ).`,
        [`B = ${bulkModulus} Pa`, `ρ = ${density} kg/m³`],
        "Sound speed",
        "v = √(B/ρ)",
        `(${bulkModulus} / ${density})^0.5`,
        Math.sqrt(bulkModulus / density),
        "m/s",
        "For small disturbances in a fluid, sound speed is related to the medium's bulk modulus and density."
      );
    }
    if (topic === "Doppler Effect") {
      const frequency = 400 + 20 * a;
      const soundSpeed = 340;
      const sourceSpeed = 5 * b;
      return detail(
        `A stationary listener hears a source of frequency ${frequency} Hz moving toward them at ${sourceSpeed} m/s. Take sound speed as ${soundSpeed} m/s. Find the observed frequency.`,
        [`f = ${frequency} Hz`, `v = ${soundSpeed} m/s`, `vs = ${sourceSpeed} m/s`],
        "Observed frequency",
        "f' = fv/(v − vs) for a source moving toward a stationary listener",
        `${frequency} * ${soundSpeed} / (${soundSpeed} - ${sourceSpeed})`,
        (frequency * soundSpeed) / (soundSpeed - sourceSpeed),
        "Hz",
        "A source approaching the listener produces a higher observed frequency."
      );
    }
    if (topic === "Sound Intensity") {
      const power = a / 10 + 0.5;
      const area = b + 1;
      return detail(
        `A sound source emits ${power} W uniformly through an area of ${area} m². Find the sound intensity.`,
        [`Power = ${power} W`, `Area = ${area} m²`],
        "Sound intensity",
        "I = P/A",
        `${numberText(power)} / ${area}`,
        power / area,
        "W/m^2",
        "Intensity is power transmitted per unit area."
      );
    }
  }

  if (input.lessonSlug === "optics") {
    if (topic === "Reflection") {
      const angle = 5 * (a % 10 + 1);
      const surfaceAngle = 90 - angle;
      return detail(
        `A light ray strikes a plane mirror at ${angle}° to the normal. What angle does the reflected ray make with the mirror surface?`,
        [`Angle of incidence to the normal = ${angle}°`],
        "Angle between the reflected ray and the mirror surface",
        "θr = θi; angle to the mirror surface = 90° − θr",
        `90 - ${angle}`,
        surfaceAngle,
        "°",
        "The angle of reflection equals the angle of incidence from the normal; the angle to the surface is its complement."
      );
    }
    if (topic === "Refraction") {
      const refractiveIndex = 1.3 + a / 100;
      const lightSpeed = 3e8;
      return detail(
        `Light travels through glass with refractive index ${refractiveIndex}. Find its speed in the glass. Use c = 3.00 × 10⁸ m/s.`,
        [`n = ${refractiveIndex}`, `c = ${lightSpeed} m/s`],
        "Speed of light in the glass",
        "n = c/v, so v = c/n",
        `${numberText(lightSpeed)} / ${refractiveIndex}`,
        lightSpeed / refractiveIndex,
        "m/s",
        "Refraction occurs because light changes speed as it enters a medium with a different refractive index."
      );
    }
    if (topic === "Snell's Law") {
      const n1 = 1;
      const sine1 = 0.2 + a / 100;
      const n2 = 1.5 + (b % 10) / 20;
      return detail(
        `Light travels from air (n₁ = ${n1}) into glass (n₂ = ${n2}). If sin θ₁ = ${sine1}, calculate sin θ₂.`,
        [`n₁ = ${n1}`, `sin θ₁ = ${sine1}`, `n₂ = ${n2}`],
        "Sine of the refracted angle",
        "n₁sin θ₁ = n₂sin θ₂",
        `${n1} * ${sine1} / ${n2}`,
        (n1 * sine1) / n2,
        "1",
        "Snell's law relates the refractive indices and the sines of the angles measured from the normal."
      );
    }
    if (topic === "Total Internal Reflection") {
      const n1 = 1.5 + (b % 6) / 10;
      const n2 = 1;
      return detail(
        `Light travels from a medium with refractive index ${n1} toward air with refractive index ${n2}. Find the sine of the critical angle.`,
        [`n₁ = ${numberText(n1)}`, `n₂ = ${n2}`],
        "Sine of the critical angle",
        "sin θc = n₂/n₁",
        `${n2} / ${numberText(n1)}`,
        n2 / n1,
        "1",
        "Total internal reflection is possible only when light travels from a higher-index medium to a lower-index medium."
      );
    }
    if (topic === "Mirrors" || topic === "Lenses" || topic === "Image Formation") {
      const focalLength = 0.1 * (a + 2);
      const objectDistance = focalLength * 3;
      return detail(
        `A converging ${topic === "Mirrors" ? "mirror" : "lens"} has focal length ${numberText(focalLength)} m. An object is ${numberText(objectDistance)} m away. Find the image distance using the thin ${topic === "Mirrors" ? "mirror" : "lens"} equation.`,
        [`f = ${numberText(focalLength)} m`, `do = ${numberText(objectDistance)} m`],
        "Image distance",
        "1/f = 1/do + 1/di",
        `1 / (1 / ${numberText(focalLength)} - 1 / ${numberText(objectDistance)})`,
        1 / (1 / focalLength - 1 / objectDistance),
        "m",
        "The thin-element equation relates focal length, object distance, and image distance."
      );
    }
    if (topic === "Magnification") {
      const objectHeight = b / 10 + 1;
      const imageHeight = -(a / 10 + 0.5);
      return detail(
        `An image is ${numberText(imageHeight)} cm high when the object is ${numberText(objectHeight)} cm high. Find the lateral magnification.`,
        [`Image height = ${numberText(imageHeight)} cm`, `Object height = ${numberText(objectHeight)} cm`],
        "Lateral magnification",
        "m = hi/ho",
        `${numberText(imageHeight)} / ${numberText(objectHeight)}`,
        imageHeight / objectHeight,
        "1",
        "A negative magnification indicates an inverted image."
      );
    }
  }

  if (input.lessonSlug === "electricity") {
    if (topic === "Atomic Structure and Electric Charge") {
      const electrons = 1e18 * a;
      return detail(
        `A body has an excess of ${numberText(electrons)} electrons. Find its net charge. Use e = 1.602 × 10⁻¹⁹ C and include the sign.`,
        [`Excess electrons = ${numberText(electrons)}`, `Elementary charge magnitude = 1.602 × 10⁻¹⁹ C`],
        "Net electric charge",
        "q = −Ne",
        `-${numberText(electrons)} * 1.602e-19`,
        -electrons * 1.602e-19,
        "C",
        "An electron carries negative elementary charge."
      );
    }
    if (topic === "Conservation of Charge") {
      const q1 = a * 2;
      const q2 = -b;
      const q3 = c;
      return detail(
        `Three objects have charges ${q1} μC, ${q2} μC, and ${q3} μC. Find their total charge after they are brought together in an isolated system.`,
        [`q₁ = ${q1} μC`, `q₂ = ${q2} μC`, `q₃ = ${q3} μC`],
        "Total charge",
        "Qtotal = q₁ + q₂ + q₃",
        `${q1} + (${q2}) + ${q3}`,
        q1 + q2 + q3,
        "μC",
        "Charge is conserved; the algebraic sum of the charges remains constant."
      );
    }
    if (topic === "Coulomb's Law") {
      const q1 = a * 1e-6;
      const q2 = b * 1e-6;
      const distance = c / 10 + 0.1;
      return detail(
        `Two point charges of ${numberText(q1)} C and ${numberText(q2)} C are ${numberText(distance)} m apart. Find the magnitude of their electric force. Use k = 8.99 × 10⁹ N·m²/C².`,
        [`q₁ = ${numberText(q1)} C`, `q₂ = ${numberText(q2)} C`, `r = ${numberText(distance)} m`, "k = 8.99 × 10⁹ N·m²/C²"],
        "Electric force magnitude",
        "F = k|q₁q₂|/r²",
        `8.99e9 * ${numberText(q1)} * ${numberText(q2)} / (${numberText(distance)})^2`,
        (8.99e9 * q1 * q2) / distance ** 2,
        "N",
        "Coulomb's law describes the force between two point charges."
      );
    }
    if (topic === "Electric Fields") {
      const force = a / 10 + 0.5;
      const charge = b / 10 + 0.5;
      return detail(
        `A test charge of ${charge} C experiences an electric force of ${force} N. Find the electric field magnitude.`,
        [`F = ${force} N`, `q = ${charge} C`],
        "Electric field magnitude",
        "E = F/q",
        `${numberText(force)} / ${numberText(charge)}`,
        force / charge,
        "N/C",
        "Electric field is the force per unit positive test charge."
      );
    }
    if (topic === "Electric Potential") {
      const energy = 2 * a;
      const charge = b / 10 + 0.5;
      return detail(
        `Moving a charge of ${charge} C changes its electric potential energy by ${energy} J. Find the potential difference.`,
        [`ΔU = ${energy} J`, `q = ${charge} C`],
        "Potential difference",
        "ΔV = ΔU/q",
        `${energy} / ${numberText(charge)}`,
        energy / charge,
        "V",
        "Electric potential difference is the change in electric potential energy per unit charge."
      );
    }
    if (topic === "Ohm's Law") {
      const current = a / 2;
      const resistance = b + 2;
      return detail(
        `A ${resistance} Ω resistor carries a current of ${current} A. Find the voltage across it.`,
        [`R = ${resistance} Ω`, `I = ${current} A`],
        "Voltage",
        "V = IR",
        `${numberText(current)} * ${resistance}`,
        current * resistance,
        "V",
        "Ohm's law relates voltage, current, and resistance for an ohmic component."
      );
    }
    if (topic === "Series Circuits") {
      const r1 = a + 1;
      const r2 = b + 2;
      const r3 = c + 3;
      return detail(
        `Three resistors of ${r1} Ω, ${r2} Ω, and ${r3} Ω are connected in series. Find their equivalent resistance.`,
        [`R₁ = ${r1} Ω`, `R₂ = ${r2} Ω`, `R₃ = ${r3} Ω`],
        "Equivalent resistance",
        "Req = R₁ + R₂ + R₃",
        `${r1} + ${r2} + ${r3}`,
        r1 + r2 + r3,
        "Ω",
        "Series resistances add because the same current passes through each resistor."
      );
    }
    if (topic === "Parallel Circuits") {
      const r1 = a + 1;
      const r2 = b + 2;
      return detail(
        `Two resistors of ${r1} Ω and ${r2} Ω are connected in parallel. Find the equivalent resistance.`,
        [`R₁ = ${r1} Ω`, `R₂ = ${r2} Ω`],
        "Equivalent resistance",
        "1/Req = 1/R₁ + 1/R₂",
        `1 / (1 / ${r1} + 1 / ${r2})`,
        1 / (1 / r1 + 1 / r2),
        "Ω",
        "Parallel branches share the same voltage, and their conductances add."
      );
    }
  }
  return null;
}

export function generateLocalNumericalProblem(
  input: GenerationInput,
  random: () => number = Math.random
): LocalNumericalProblem | null {
  if (
    input.problemType !== "Numerical Problem Solving" &&
    input.problemType !== "Formula Application"
  ) {
    return null;
  }
  const details = generateDetails(input, random);
  if (!details) return null;
  const validation = validateArithmeticAnswer(
    details.expression,
    details.answerValue
  );
  if (validation.value === null || validation.error !== null) {
    throw new Error(
      `Local problem failed arithmetic validation: ${validation.error ?? "unknown error"}`
    );
  }
  const formattedValue = displayNumber(details.answerValue);
  const answer = details.unit === "1"
    ? formattedValue
    : `${formattedValue} ${details.unit}`;
  const title = `${input.topic} Practice`;
  return {
    supported: true,
    clarification: "",
    suggestedTopics: [],
    title,
    topic: input.topic,
    problemType: input.problemType,
    question: details.question,
    givenValues: details.givenValues,
    find: details.find,
    formulaHint: details.formula,
    answerType: "numeric",
    answer,
    acceptedAnswers: [],
    answerValue: details.answerValue,
    answerUnit: details.unit,
    tolerance: 0.005,
    calculationExpression: details.expression,
    choices: [],
    correctChoice: null,
    hint: "Identify the relevant relationship, substitute the given values, and keep track of the units.",
    solutionSteps: [
      { label: "Given", detail: details.givenValues.join("; ") },
      { label: "Formula", detail: details.formula },
      {
        label: "Substitution",
        detail: `${details.formula} Substitute the given values: ${details.expression}`,
      },
      {
        label: "Calculation",
        detail: `${details.expression} = ${displayNumber(details.answerValue)}`,
      },
      {
        label: "Final Answer",
        detail: details.unit === "1"
          ? formattedValue
          : `${formattedValue} ${details.unit}`,
      },
    ],
    conceptExplanation: details.explanation,
  };
}
