const greekSymbols: Record<string, string> = {
  alpha: "α",
  beta: "β",
  gamma: "γ",
  delta: "δ",
  Delta: "Δ",
  epsilon: "ε",
  theta: "θ",
  Theta: "Θ",
  lambda: "λ",
  mu: "μ",
  nu: "ν",
  pi: "π",
  rho: "ρ",
  sigma: "σ",
  tau: "τ",
  phi: "φ",
  omega: "ω",
  Omega: "Ω",
};

const symbolCommands: Record<string, string> = {
  times: "×",
  cdot: "·",
  pm: "±",
  div: "÷",
  approx: "≈",
  neq: "≠",
  le: "≤",
  leq: "≤",
  ge: "≥",
  geq: "≥",
  infty: "∞",
  degree: "°",
  circ: "°",
};

const subscriptCharacters: Record<string, string> = {
  "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
  "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
  "+": "₊", "-": "₋", "=": "₌", "(": "₍", ")": "₎",
  a: "ₐ", e: "ₑ", h: "ₕ", i: "ᵢ", j: "ⱼ", k: "ₖ",
  l: "ₗ", m: "ₘ", n: "ₙ", o: "ₒ", p: "ₚ", r: "ᵣ",
  s: "ₛ", t: "ₜ", u: "ᵤ", v: "ᵥ", x: "ₓ",
};

const superscriptCharacters: Record<string, string> = {
  "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
  "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
  "+": "⁺", "-": "⁻", "=": "⁼", "(": "⁽", ")": "⁾",
  a: "ᵃ", b: "ᵇ", c: "ᶜ", d: "ᵈ", e: "ᵉ", f: "ᶠ",
  g: "ᵍ", h: "ʰ", i: "ⁱ", j: "ʲ", k: "ᵏ", l: "ˡ",
  m: "ᵐ", n: "ⁿ", o: "ᵒ", p: "ᵖ", r: "ʳ", s: "ˢ",
  t: "ᵗ", u: "ᵘ", v: "ᵛ", w: "ʷ", x: "ˣ", y: "ʸ",
  z: "ᶻ",
};

function mapScript(
  value: string,
  characters: Record<string, string>,
  opening: string,
  closing: string
) {
  const mapped = [...value].map((character) => characters[character]);
  return mapped.every(Boolean)
    ? mapped.join("")
    : `${opening}${value}${closing}`;
}

function convertGroupedCommands(value: string) {
  let result = value;
  let previous: string;
  do {
    previous = result;
    result = result
      .replace(/\\frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, "($1)/($2)")
      .replace(/\\frac\s*([0-9])\s*([0-9])/g, "($1)/($2)")
      .replace(/\\sqrt\s*\{([^{}]*)\}/g, "√($1)")
      .replace(/\\sqrt\s*([A-Za-z0-9])/g, "√($1)")
      .replace(/\\(?:mathrm|text|mathbf|mathit|operatorname)\s*\{([^{}]*)\}/g, "$1")
      .replace(/[_^]\{([^{}]*)\}/g, (match, content: string) =>
        match[0] === "_"
          ? mapScript(content, subscriptCharacters, "₍", "₎")
          : mapScript(content, superscriptCharacters, "⁽", "⁾")
      );
  } while (result !== previous);
  return result;
}

export function normalizeMathText(value: string): string {
  let result = convertGroupedCommands(
    value.replace(/\\(?:begin|end)\s*\{[^{}]*\}/g, " ")
  );

  result = result.replace(/\\([A-Za-z]+)/g, (command, name: string) => {
    if (name in greekSymbols) return greekSymbols[name];
    if (name in symbolCommands) return symbolCommands[name];
    if (name === "frac" || name === "sqrt") return command;
    if (["left", "right", "displaystyle", "textstyle", "quad", "qquad"].includes(name)) {
      return " ";
    }
    return "";
  });

  result = convertGroupedCommands(result);
  result = result
    .replace(/\\([_{}%#$])/g, "$1")
    .replace(/\\[A-Za-z]+/g, "")
    .replace(/[$]/g, "")
    .replace(/[_^]([A-Za-z0-9])/g, (match, character: string) =>
      match[0] === "_"
        ? mapScript(character, subscriptCharacters, "₍", "₎")
        : mapScript(character, superscriptCharacters, "⁽", "⁾")
    )
    .replace(/[{}]/g, "")
    .replace(/\\{2,}/g, " ")
    .replace(/[ \t]{2,}/g, " ")
    .trim();

  return result;
}
