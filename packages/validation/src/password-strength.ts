export type PasswordStrength = {
  score: 0 | 1 | 2 | 3 | 4;
  label: "very weak" | "weak" | "fair" | "good" | "strong";
  warnings: string[];
};

const COMMON_PATTERNS = [
  /^password/i,
  /^qwerty/i,
  /^letmein/i,
  /^welcome/i,
  /^admin/i,
  /^12345/,
  /^abcdef/i,
  /^iloveyou/i,
];

const LABELS: PasswordStrength["label"][] = ["very weak", "weak", "fair", "good", "strong"];

export function estimatePasswordStrength(password: string): PasswordStrength {
  const warnings: string[] = [];
  if (!password) return { score: 0, label: "very weak", warnings: ["Password is empty"] };

  let score = 0;
  const length = password.length;

  if (length >= 8) score += 1;
  if (length >= 12) score += 1;
  if (length >= 16) score += 1;
  else if (length < 8) warnings.push("Use at least 8 characters");

  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^a-zA-Z0-9]/].filter((re) => re.test(password)).length;
  if (classes >= 3) score += 1;
  else warnings.push("Mix upper-case, lower-case, digits, and symbols");

  if (/^(.)\1+$/.test(password)) {
    score = 0;
    warnings.push("Repeated single character");
  }
  if (COMMON_PATTERNS.some((re) => re.test(password))) {
    score = Math.min(score, 1);
    warnings.push("Looks like a common password");
  }

  const finalScore = Math.max(0, Math.min(4, score)) as PasswordStrength["score"];
  return { score: finalScore, label: LABELS[finalScore]!, warnings };
}
