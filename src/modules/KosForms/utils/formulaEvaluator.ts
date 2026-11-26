import { FormStep, StepConditionRule } from '../types';

/**
 * Extract a numeric value from any form answer (number, numeric string, multi_choice sum, ticket subtotal).
 */
export function toNumericAnswer(raw: any, sourceStep?: FormStep): number {
  if (raw === undefined || raw === null || raw === '') return 0;
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : 0;
  if (typeof raw === 'boolean') return raw ? 1 : 0;

  if (Array.isArray(raw)) {
    return raw.reduce((sum, item) => sum + toNumericAnswer(item, sourceStep), 0);
  }

  if (typeof raw === 'object' && typeof raw.subtotal === 'number') {
    return raw.subtotal;
  }

  const str = String(raw).trim();
  const direct = Number(str.replace(/[₪,\s]/g, ''));
  if (Number.isFinite(direct) && str !== '') return direct;

  if (sourceStep?.options?.length) {
    const opt = sourceStep.options.find(
      (o) => o.value === str || o.label === str || o.id === str
    );
    if (opt) {
      const optNum = Number(String(opt.value).replace(/[₪,\s]/g, ''));
      if (Number.isFinite(optNum) && opt.value !== '') return optNum;
      const lblMatch = opt.label.match(/-?\d+(?:\.\d+)?/);
      if (lblMatch) return Number(lblMatch[0]) || 0;
    }
  }

  const match = str.match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) || 0 : 0;
}

type Token =
  | { type: 'num'; value: number }
  | { type: 'op'; value: string }
  | { type: 'fn'; value: string }
  | { type: 'paren'; value: '(' | ')' }
  | { type: 'comma' };

function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (/[0-9.]/.test(ch)) {
      let numStr = '';
      while (i < expr.length && /[0-9.]/.test(expr[i])) {
        numStr += expr[i++];
      }
      const val = Number(numStr);
      tokens.push({ type: 'num', value: Number.isFinite(val) ? val : 0 });
      continue;
    }
    if (/[A-Za-z_]/.test(ch)) {
      let fn = '';
      while (i < expr.length && /[A-Za-z0-9_]/.test(expr[i])) {
        fn += expr[i++];
      }
      tokens.push({ type: 'fn', value: fn.toUpperCase() });
      continue;
    }
    if (ch === '(' || ch === ')') {
      tokens.push({ type: 'paren', value: ch });
      i++;
      continue;
    }
    if (ch === ',') {
      tokens.push({ type: 'comma' });
      i++;
      continue;
    }
    if ('+-*/'.includes(ch)) {
      tokens.push({ type: 'op', value: ch });
      i++;
      continue;
    }
    i++;
  }
  return tokens;
}

function evaluateTokens(tokens: Token[]): number {
  let pos = 0;

  const peek = () => tokens[pos];
  const consume = () => tokens[pos++];

  function parseExpression(): number {
    let left = parseTerm();
    while (peek()?.type === 'op' && (peek() as any).value in { '+': 1, '-': 1 }) {
      const op = (consume() as any).value;
      const right = parseTerm();
      left = op === '+' ? left + right : left - right;
    }
    return left;
  }

  function parseTerm(): number {
    let left = parseFactor();
    while (peek()?.type === 'op' && (peek() as any).value in { '*': 1, '/': 1 }) {
      const op = (consume() as any).value;
      const right = parseFactor();
      if (op === '*') left = left * right;
      else left = right === 0 ? 0 : left / right;
    }
    return left;
  }

  function parseFactor(): number {
    const t = peek();
    if (!t) return 0;

    if (t.type === 'op' && (t.value === '+' || t.value === '-')) {
      consume();
      const val = parseFactor();
      return t.value === '-' ? -val : val;
    }

    if (t.type === 'num') {
      consume();
      return t.value;
    }

    if (t.type === 'paren' && t.value === '(') {
      consume();
      const val = parseExpression();
      if (peek()?.type === 'paren' && (peek() as any).value === ')') consume();
      return val;
    }

    if (t.type === 'fn') {
      const fnName = (consume() as any).value;
      const args: number[] = [];
      if (peek()?.type === 'paren' && (peek() as any).value === '(') {
        consume();
        if (!(peek()?.type === 'paren' && (peek() as any).value === ')')) {
          args.push(parseExpression());
          while (peek()?.type === 'comma') {
            consume();
            args.push(parseExpression());
          }
        }
        if (peek()?.type === 'paren' && (peek() as any).value === ')') consume();
      }
      const first = args[0] ?? 0;
      switch (fnName) {
        case 'ROUND':
          return Math.round(first);
        case 'FLOOR':
          return Math.floor(first);
        case 'CEIL':
          return Math.ceil(first);
        case 'ABS':
          return Math.abs(first);
        case 'MIN':
          return args.length ? Math.min(...args) : 0;
        case 'MAX':
          return args.length ? Math.max(...args) : 0;
        default:
          return first;
      }
    }

    consume();
    return 0;
  }

  const res = parseExpression();
  return Number.isFinite(res) ? Math.round(res * 100) / 100 : 0;
}

/**
 * Safely evaluate a mathematical formula with `{fieldKey}` placeholders against form answers.
 * Supports +, -, *, /, parentheses, numbers, and ROUND / FLOOR / CEIL / ABS / MIN / MAX.
 */
export function evaluateFormula(
  formula: string | undefined,
  answers: Record<string, any> = {},
  steps: FormStep[] = []
): number {
  if (!formula || !formula.trim()) return 0;

  const substituted = formula.replace(/\{([^}]+)\}/g, (_, rawKey: string) => {
    const key = rawKey.trim();
    const step = steps.find((s) => (s.mappingKey || s.id) === key || s.id === key);
    const val = answers[key] ?? (step ? answers[step.id] : undefined);
    return String(toNumericAnswer(val, step));
  });

  try {
    const tokens = tokenize(substituted);
    if (tokens.length === 0) return 0;
    return evaluateTokens(tokens);
  } catch {
    return 0;
  }
}

/**
 * Evaluate a single conditional rule against current form answers.
 * Supports `{fieldKey}` or math expressions in `rule.value`.
 */
export function evaluateConditionRule(
  rule: StepConditionRule,
  answers: Record<string, any> = {},
  steps: FormStep[] = []
): boolean {
  if (!rule.fieldKey) return true;

  const targetStep = steps.find(
    (s) => (s.mappingKey || s.id) === rule.fieldKey || s.id === rule.fieldKey
  );
  const rawAnswer = answers[rule.fieldKey] ?? (targetStep ? answers[targetStep.id] : undefined);

  const isEmpty =
    rawAnswer === undefined ||
    rawAnswer === null ||
    rawAnswer === '' ||
    (Array.isArray(rawAnswer) && rawAnswer.length === 0);

  if (rule.operator === 'is_empty') return isEmpty;
  if (rule.operator === 'is_not_empty') return !isEmpty;

  let compareRaw = rule.value ?? '';
  // Allow math/variable expressions inside rule.value when `{...}` is present
  if (/\{[^}]+\}/.test(compareRaw)) {
    const evaluated = evaluateFormula(compareRaw, answers, steps);
    compareRaw = String(evaluated);
  }

  const ansStr = Array.isArray(rawAnswer)
    ? rawAnswer.join(', ')
    : String(rawAnswer ?? '').trim();
  const cmpStr = String(compareRaw).trim();

  switch (rule.operator) {
    case 'equals':
      return ansStr.toLowerCase() === cmpStr.toLowerCase();
    case 'not_equals':
      return ansStr.toLowerCase() !== cmpStr.toLowerCase();
    case 'contains':
      return ansStr.toLowerCase().includes(cmpStr.toLowerCase());
    case 'greater_than':
      return toNumericAnswer(rawAnswer, targetStep) > toNumericAnswer(cmpStr);
    case 'less_than':
      return toNumericAnswer(rawAnswer, targetStep) < toNumericAnswer(cmpStr);
    case 'greater_or_equal':
      return toNumericAnswer(rawAnswer, targetStep) >= toNumericAnswer(cmpStr);
    case 'less_or_equal':
      return toNumericAnswer(rawAnswer, targetStep) <= toNumericAnswer(cmpStr);
    default:
      return true;
  }
}

/**
 * Determine whether a FormStep should be visible based on its conditionalLogic.
 */
export function isStepVisible(
  step: FormStep,
  answers: Record<string, any> = {},
  steps: FormStep[] = []
): boolean {
  const logic = step.conditionalLogic;
  if (!logic?.enabled || !Array.isArray(logic.rules) || logic.rules.length === 0) {
    return true;
  }

  if (logic.logicType === 'any') {
    return logic.rules.some((rule) => evaluateConditionRule(rule, answers, steps));
  }
  return logic.rules.every((rule) => evaluateConditionRule(rule, answers, steps));
}
