export type RuleSnapshot = { version: string; count: number; correct: number; wrong: number; threshold: number; timingStatus: string };
export const RULES: Readonly<RuleSnapshot> = Object.freeze({ version: "demo-rules-1", count: 30, correct: 100, wrong: -33, threshold: 2100, timingStatus: "allenamento provvisorio" });
export type Outcome = "correct" | "wrong" | "omitted";
export function classify(selected: string[], correct: string): Outcome {
  return selected.length === 0 ? "omitted" : selected.length === 1 && selected[0] === correct ? "correct" : "wrong";
}
export function score(outcomes: Outcome[], rules: RuleSnapshot = RULES) {
  if (outcomes.length !== rules.count) throw new Error(`Una simulazione richiede esattamente ${rules.count} esiti.`);
  const correct = outcomes.filter(x => x === "correct").length;
  const wrong = outcomes.filter(x => x === "wrong").length;
  const omitted = outcomes.filter(x => x === "omitted").length;
  const cents = correct * rules.correct + wrong * rules.wrong;
  return { correct, wrong, omitted, cents, reached: cents >= rules.threshold };
}
export function formatScore(cents: number): string {
  return (cents / 100).toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
