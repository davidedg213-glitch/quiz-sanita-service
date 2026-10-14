import { createHash } from "node:crypto";
import { z } from "zod";

const text = z.string().trim().min(1).max(12_000).refine(
  value => !/<\/?[a-z][^>]*>/i.test(value), "Il testo contiene HTML: usare testo semplice."
);
const media = z.object({
  path: z.string().regex(/^\/demo-media\/[a-zA-Z0-9_-]+\.(svg|png|jpg|webp)$/),
  alt: text
}).strict();
const option = z.object({ id: z.string().min(1).max(120), source_label: z.string().min(1).max(10), text, position: z.number().int().positive() }).strict();
const question = z.object({
  official_id: z.string().min(1).max(120), text, category: text,
  category_source: z.enum(["editoriale", "ufficiale"]), options: z.array(option).min(2).max(6),
  correct_option_id: z.string(), answer_source: z.literal("sintetica"),
  source_page: z.number().int().positive().nullable(), media: z.array(media).max(10),
  explanation: text.nullable(), review_status: z.literal("demo")
}).strict().superRefine((value, ctx) => {
  if (new Set(value.options.map(o => o.id)).size !== value.options.length) ctx.addIssue({ code: "custom", message: "Alternative con ID duplicati." });
  if (new Set(value.options.map(o => o.position)).size !== value.options.length) ctx.addIssue({ code: "custom", message: "Posizioni delle alternative duplicate." });
  if (!value.options.some(o => o.id === value.correct_option_id)) ctx.addIssue({ code: "custom", message: "La chiave non corrisponde a un'alternativa." });
});
export const bankSchema = z.object({
  schema_version: z.literal("1.0"), contest_id: z.literal("sanitaservice-ba-pulitore-2026"),
  bank_version: z.string().min(1).max(100),
  source: z.object({ document_id: text, checksum_sha256: z.string().regex(/^[a-f0-9]{64}$/) }).strict(),
  questions: z.array(question).min(30).max(10_000)
}).strict().superRefine((value, ctx) => {
  if (new Set(value.questions.map(q => q.official_id)).size !== value.questions.length) ctx.addIssue({ code: "custom", message: "ID quesiti duplicati." });
  const ids = value.questions.flatMap(q => q.options.map(o => o.id));
  if (new Set(ids).size !== ids.length) ctx.addIssue({ code: "custom", message: "Gli ID delle alternative devono essere unici nella banca." });
});
export type Bank = z.infer<typeof bankSchema>;
export type Question = Bank["questions"][number];
export type PublicQuestion = Pick<Question, "official_id" | "text" | "category" | "options" | "media">;

export function parseBank(input: unknown): Bank { return bankSchema.parse(input); }
export function bankHash(bank: Bank): string { return createHash("sha256").update(JSON.stringify(bank)).digest("hex"); }
export function publicQuestion(q: Question): PublicQuestion {
  return { official_id: q.official_id, text: q.text, category: q.category, options: q.options, media: q.media };
}

export function createDemoBank(version = "demo-1", count = 1500): Bank {
  const questions: Question[] = Array.from({ length: count }, (_, i) => {
    const id = `DEMO-${String(i + 1).padStart(4, "0")}`;
    const a = i + 12, b = (i % 23) + 3;
    const kind = i % 3;
    const answer = kind === 0 ? a + b : kind === 1 ? a * 2 + b : a - b;
    const prompts = [
      `Calcola la somma di ${a} e ${b}.`,
      `Una sequenza segue la regola «moltiplica per 2 e aggiungi ${b}». Quale numero segue ${a}?`,
      `Nel magazzino di un esempio di lavoro ci sono ${a} confezioni. Ne vengono utilizzate ${b}. Quante ne restano?`
    ];
    const categories = ["Logica numerica", "Ragionamento", "Organizzazione della mansione"];
    const n = 2 + i % 5, correct = (i * 7 + 1) % n;
    const options = Array.from({ length: n }, (_, j) => ({
      id: `${id}-${String.fromCharCode(65 + j)}`, source_label: String.fromCharCode(65 + j),
      text: String(j === correct ? answer : answer + (j - correct) * 3), position: j + 1
    }));
    return { official_id: id, text: prompts[kind], category: categories[kind], category_source: "editoriale", options,
      correct_option_id: options[correct].id, answer_source: "sintetica", source_page: null, media: [],
      explanation: kind === 0 ? `${a} + ${b} = ${answer}.` : kind === 1 ? `${a} × 2 + ${b} = ${answer}.` : `${a} − ${b} = ${answer}.`, review_status: "demo" };
  });
  if (questions.length > 10) {
    const q = questions[10];
    q.text = "Osserva la figura di prova. Quanti quadrati sono rappresentati?";
    q.media = [{ path: "/demo-media/squares.svg", alt: "Tre quadrati affiancati, separati fra loro." }];
    q.options = [2, 3, 4].map((n, j) => ({ id: `${q.official_id}-${j}`, source_label: String.fromCharCode(65 + j), text: String(n), position: j + 1 }));
    q.correct_option_id = q.options[1].id; q.explanation = "Nella figura sono presenti tre quadrati separati.";
  }
  return parseBank({ schema_version: "1.0", contest_id: "sanitaservice-ba-pulitore-2026", bank_version: version,
    source: { document_id: "generatore-sintetico-v1", checksum_sha256: createHash("sha256").update("generatore-sintetico-v1").digest("hex") }, questions });
}
