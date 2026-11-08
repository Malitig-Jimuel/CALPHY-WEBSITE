export type ArithmeticEvaluation = {
  value: number | null;
  error: string | null;
  errorBound: number;
  scale: number;
};

type ArithmeticValue = {
  value: number;
  errorBound: number;
  scale: number;
};

const MAX_EXPRESSION_LENGTH = 200;
const MAX_TOKENS = 128;
const MAX_VALUE = 1e100;

function failed(error: string): ArithmeticEvaluation {
  return { value: null, error, errorBound: 0, scale: 0 };
}

function parseArithmetic(expression: string): ArithmeticEvaluation {
  const normalized = expression
    .replace(/[×·]/g, "*")
    .replace(/÷/g, "/")
    .replace(/[−–]/g, "-")
    .trim();
  if (!normalized) return failed("The calculation expression is empty.");
  if (normalized.length > MAX_EXPRESSION_LENGTH) {
    return failed("The calculation expression is too long.");
  }

  const tokens: string[] = [];
  const tokenPattern =
    /\s*(?:(\d+(?:\.\d*)?|\.\d+)(?:[eE]([+-]?\d+))?|([()+\-*/^]))/y;
  let cursor = 0;
  while (cursor < normalized.length) {
    tokenPattern.lastIndex = cursor;
    const match = tokenPattern.exec(normalized);
    if (!match || match.index !== cursor) {
      return failed(`The expression contains an unsupported token near "${normalized.slice(cursor, cursor + 12)}".`);
    }
    tokens.push(
      match[1]
        ? `${match[1]}${match[2] ? `e${match[2]}` : ""}`
        : match[3]
    );
    if (tokens.length > MAX_TOKENS) {
      return failed("The calculation expression contains too many operations.");
    }
    cursor = tokenPattern.lastIndex;
  }

  let position = 0;
  let depth = 0;

  const bounded = (value: ArithmeticValue): ArithmeticValue => {
    if (!Number.isFinite(value.value) || Math.abs(value.value) >= MAX_VALUE) {
      throw new Error("An intermediate calculation is outside the supported numeric range.");
    }
    return value;
  };
  const parseExpression = (): ArithmeticValue => {
    let value = parseTerm();
    while (tokens[position] === "+" || tokens[position] === "-") {
      const operator = tokens[position++];
      const right = parseTerm();
      const result =
        operator === "+"
          ? value.value + right.value
          : value.value - right.value;
      value = bounded({
        value: result,
        errorBound:
          value.errorBound +
          right.errorBound +
          Number.EPSILON * (Math.abs(value.value) + Math.abs(right.value)) * 2,
        scale: value.scale + right.scale,
      });
    }
    return value;
  };
  const parseTerm = (): ArithmeticValue => {
    let value = parseUnary();
    while (tokens[position] === "*" || tokens[position] === "/") {
      const operator = tokens[position++];
      const right = parseUnary();
      if (operator === "/" && right.value === 0) {
        throw new Error("The expression divides by zero.");
      }

      if (operator === "*") {
        const result = value.value * right.value;
        value = bounded({
          value: result,
          errorBound:
            Math.abs(value.value) * right.errorBound +
            Math.abs(right.value) * value.errorBound +
            value.errorBound * right.errorBound +
            Number.EPSILON * Math.abs(result) * 2,
          scale: Math.max(value.scale, right.scale, Math.abs(result)),
        });
      } else {
        if (Math.abs(right.value) <= right.errorBound) {
          throw new Error("The divisor is indistinguishable from zero.");
        }
        const result = value.value / right.value;
        const denominatorBound = Math.abs(right.value) - right.errorBound;
        value = bounded({
          value: result,
          errorBound:
            (value.errorBound + Math.abs(result) * right.errorBound) /
              denominatorBound +
            Number.EPSILON * Math.abs(result) * 2,
          scale: Math.max(value.scale, right.scale, Math.abs(result)),
        });
      }
    }
    return value;
  };
  const parseUnary = (): ArithmeticValue => {
    if (tokens[position] === "+") {
      position += 1;
      return parseUnary();
    }
    if (tokens[position] === "-") {
      position += 1;
      const value = parseUnary();
      return { ...value, value: -value.value };
    }
    return parsePower();
  };
  const parsePower = (): ArithmeticValue => {
    const base = parsePrimary();
    if (tokens[position] !== "^") return base;
    position += 1;
    const exponent = parseUnary();
    if (base.value < 0 && !Number.isInteger(exponent.value)) {
      throw new Error("A negative base requires an integer exponent.");
    }
    if (Math.abs(exponent.value) > 1024) {
      throw new Error("The exponent is outside the supported range.");
    }

    const result = base.value ** exponent.value;
    const baseDerivative =
      exponent.value === 0
        ? 0
        : Math.abs(exponent.value * base.value ** (exponent.value - 1));
    const exponentDerivative =
      base.value === 0
        ? 0
        : Math.abs(result * Math.log(Math.abs(base.value)));
    return bounded({
      value: result,
      errorBound:
        baseDerivative * base.errorBound +
        exponentDerivative * exponent.errorBound +
        Number.EPSILON * Math.abs(result) * 4,
      scale: Math.max(base.scale, exponent.scale, Math.abs(result)),
    });
  };
  const parsePrimary = (): ArithmeticValue => {
    if (tokens[position] === "(") {
      position += 1;
      depth += 1;
      if (depth > 32) throw new Error("The expression is nested too deeply.");
      const value = parseExpression();
      depth -= 1;
      if (tokens[position] !== ")") {
        throw new Error("The expression has unbalanced parentheses.");
      }
      position += 1;
      return value;
    }

    const token = tokens[position++];
    if (
      !token ||
      !/^(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(token)
    ) {
      throw new Error("A number was expected in the calculation expression.");
    }
    const value = Number(token);
    if (!Number.isFinite(value) || Math.abs(value) >= MAX_VALUE) {
      throw new Error("A number is outside the supported numeric range.");
    }
    return {
      value,
      errorBound: Math.abs(value) * Number.EPSILON,
      scale: Math.abs(value),
    };
  };

  try {
    const value = parseExpression();
    if (position !== tokens.length) {
      return failed("The expression has an extra operator or unmatched parenthesis.");
    }
    return {
      value: value.value,
      error: null,
      errorBound: value.errorBound,
      scale: value.scale,
    };
  } catch (error) {
    return failed(
      error instanceof Error ? error.message : "The calculation expression is invalid."
    );
  }
}

export function evaluateArithmetic(expression: string): ArithmeticEvaluation {
  const assignment = expression.match(
    /^\s*[A-Za-z][A-Za-z0-9_]*\s*=\s*(.+?)\s*$/
  );
  const equationSides = assignment ? null : expression.split("=");

  if (assignment) return parseArithmetic(assignment[1]);
  if (equationSides && equationSides.length === 2) {
    const left = parseArithmetic(equationSides[0]);
    const right = parseArithmetic(equationSides[1]);
    if (left.value === null || right.value === null) {
      return failed(
        `An equation side is invalid. ${left.error ?? right.error ?? ""}`.trim()
      );
    }
    const difference = Math.abs(left.value - right.value);
    const allowance =
      left.errorBound +
      right.errorBound +
      Number.EPSILON * Math.max(left.scale, right.scale) * 4;
    if (difference > allowance) {
      return failed("The two sides of the calculation do not agree.");
    }
    return left;
  }
  if (equationSides && equationSides.length > 1) {
    return failed("Only one arithmetic equality may appear in the expression.");
  }
  return parseArithmetic(expression);
}

export function validateArithmeticAnswer(
  expression: string,
  answerValue: number | null
): ArithmeticEvaluation {
  if (answerValue === null || !Number.isFinite(answerValue)) {
    return failed("The generated answer value is missing or invalid.");
  }
  const result = evaluateArithmetic(expression);
  if (result.value === null) return result;

  const difference = Math.abs(result.value - answerValue);
  const precisionAllowance =
    result.errorBound +
    Number.EPSILON *
      Math.max(result.scale, Math.abs(answerValue), Number.MIN_VALUE) *
      8;
  if (difference > precisionAllowance) {
    return {
      ...result,
      error: `The calculation evaluates to ${result.value}, not the supplied answer value.`,
    };
  }
  return result;
}
