import { DatabaseSync } from "node:sqlite";
import { createHash, randomBytes, randomInt, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { readFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { type Bank, type Question, parseBank, bankHash, publicQuestion } from "../domain/bank";
import { classify, RULES, score, type RuleSnapshot } from "../domain/score";

export class AppError extends Error {
  readonly appError = "preparati";
  constructor(public code: string, message: string, public status = 400) { super(message); }
}
export function isAppError(error: unknown): error is AppError {
  return error instanceof Error && "appError" in error && error.appError === "preparati" && "status" in error && typeof error.status === "number";
}
type Row = Record<string, string | number | null>;
type AttemptRow = Row & { id: string; user_id: string; bank_id: string; status: string; started_at: number; deadline_at: number; duration_seconds: number; questions_json: string; result_json: string | null };
export type Identity = { id: string; name: string; email: string };
export type Credential = Identity & { sessionHash: string };
const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");
function passwordHash(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}
function passwordMatches(password: string, stored: string) {
  const [salt, digest] = stored.split(":");
  const test = scryptSync(password, salt, 64), expected = Buffer.from(digest, "hex");
  return test.length === expected.length && timingSafeEqual(test, expected);
}
function selectQuestions(questions: Question[], count: number) {
  const copy = [...questions];
  for (let i = copy.length - 1; i > 0; i--) { const j = randomInt(i + 1); [copy[i], copy[j]] = [copy[j], copy[i]]; }
  return copy.slice(0, count);
}
export class PrivateStore {
  readonly db: DatabaseSync;
  constructor(path: string, private readonly now: () => number = Date.now) {
    if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
    this.db = new DatabaseSync(path);
    this.db.exec(readFileSync(join(process.cwd(), "src/server/schema.sql"), "utf8"));
  }
  close() { this.db.close(); }
  private get(sql: string, ...args: (string | number | null)[]) { return this.db.prepare(sql).get(...args) as Row | undefined; }
  private all(sql: string, ...args: (string | number | null)[]) { return this.db.prepare(sql).all(...args) as Row[]; }
  private run(sql: string, ...args: (string | number | null)[]) { return this.db.prepare(sql).run(...args); }
  private tx<T>(fn: () => T): T {
    this.db.exec("BEGIN IMMEDIATE");
    try { const result = fn(); this.db.exec("COMMIT"); return result; }
    catch (error) { this.db.exec("ROLLBACK"); throw error; }
  }
  private audit(actor: string, action: string, target: string) { this.run("INSERT INTO audit_log VALUES (?,?,?,?,?)", randomUUID(), actor, action, target, this.now()); }
  rateLimit(bucket: string, max: number, windowMs: number) {
    this.tx(() => {
      const row = this.get("SELECT * FROM rate_limits WHERE bucket=?", bucket);
      if (!row || Number(row.resets_at) <= this.now()) this.run("INSERT OR REPLACE INTO rate_limits VALUES (?,?,?)", bucket, 1, this.now() + windowMs);
      else {
        if (Number(row.count) >= max) throw new AppError("RATE_LIMIT", "Troppi tentativi. Attendi qualche minuto e riprova.", 429);
        this.run("UPDATE rate_limits SET count=count+1 WHERE bucket=?", bucket);
      }
      this.run("DELETE FROM rate_limits WHERE resets_at < ?", this.now() - windowMs);
    });
  }
  signup(email: string, name: string, password: string) {
    const id = randomUUID(), digest = passwordHash(password);
    try { this.run("INSERT INTO users(id,email,name,password_hash,created_at) VALUES (?,?,?,?,?)", id, email.toLowerCase(), name, digest, this.now()); }
    catch (error) {
      if (String(error).includes("UNIQUE")) throw new AppError("ACCOUNT_EXISTS", "Non è possibile creare questo account. Prova ad accedere.", 409);
      throw error;
    }
    return this.signin(email, password);
  }
  signin(email: string, password: string) {
    const row = this.get("SELECT * FROM users WHERE email=?", email.toLowerCase());
    const dummy = "00000000000000000000000000000000:" + "00".repeat(64);
    const valid = passwordMatches(password, row ? String(row.password_hash) : dummy);
    if (!row || !valid) throw new AppError("INVALID_LOGIN", "Email o password non corretta.", 401);
    const token = randomBytes(32).toString("hex"), hash = tokenHash(token);
    this.tx(() => {
      this.run("DELETE FROM sessions WHERE user_id=?", String(row.id));
      this.run("INSERT INTO sessions VALUES (?,?,?)", hash, String(row.id), this.now() + 7 * 86400_000);
      this.run("UPDATE users SET current_session_hash=? WHERE id=?", hash, String(row.id));
    });
    return { token, user: { id: String(row.id), name: String(row.name), email: String(row.email) } };
  }
  identity(token: string | undefined): Credential {
    if (!token || !/^[a-f0-9]{64}$/.test(token)) throw new AppError("LOGIN_REQUIRED", "Accedi al tuo account di prova.", 401);
    const hash = tokenHash(token);
    const row = this.get("SELECT u.id,u.email,u.name FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND u.current_session_hash=? AND s.expires_at>?", hash, hash, this.now());
    if (!row) throw new AppError("SESSION_REPLACED", "La sessione è terminata o hai effettuato l'accesso da un altro browser. Accedi di nuovo.", 401);
    return { id: String(row.id), name: String(row.name), email: String(row.email), sessionHash: hash };
  }
  private authorized(user: Credential) {
    const row = this.get("SELECT s.token_hash FROM sessions s JOIN users u ON s.user_id=u.id WHERE u.id=? AND s.token_hash=? AND u.current_session_hash=? AND s.expires_at>?", user.id, user.sessionHash, user.sessionHash, this.now());
    if (!row) throw new AppError("SESSION_REPLACED", "Questa sessione non è più attiva. Accedi di nuovo.", 401);
  }
  logout(user: Credential) {
    this.tx(() => { this.authorized(user); this.run("DELETE FROM sessions WHERE token_hash=?", user.sessionHash); this.run("UPDATE users SET current_session_hash=NULL WHERE id=?", user.id); });
  }
  importBank(input: unknown, actor = "local-cli") {
    const bank = parseBank(input), checksum = bankHash(bank);
    for (const q of bank.questions) for (const image of q.media) {
      if (!existsSync(join(process.cwd(), "public", image.path))) throw new AppError("MEDIA_MISSING", `Immagine mancante: ${image.path}`);
    }
    return this.tx(() => {
      const same = this.get("SELECT id,version,status FROM banks WHERE checksum=?", checksum);
      if (same) return { ...same, unchanged: true, count: bank.questions.length, checksum };
      if (this.get("SELECT id FROM banks WHERE version=?", bank.bank_version)) throw new AppError("VERSION_EXISTS", "La versione esiste già con contenuto diverso: usa una nuova versione.", 409);
      const id = randomUUID();
      this.run("INSERT INTO banks VALUES (?,?,?,?,?,?,?)", id, bank.bank_version, checksum, JSON.stringify(bank), bank.questions.length, "approved", this.now());
      this.audit(actor, "bank.imported", id);
      return { id, version: bank.bank_version, status: "approved", unchanged: false, count: bank.questions.length, checksum };
    });
  }
  activateBank(id: string, actor = "local-cli") {
    return this.tx(() => {
      if (!this.get("SELECT id FROM banks WHERE id=?", id)) throw new AppError("NOT_FOUND", "Banca non trovata.", 404);
      this.run("UPDATE banks SET status='retired' WHERE status='active'");
      this.run("UPDATE banks SET status='active' WHERE id=?", id);
      this.audit(actor, "bank.activated", id);
      return { id, status: "active" };
    });
  }
  banks() { return this.all("SELECT id,version,checksum,question_count,status,imported_at FROM banks ORDER BY imported_at DESC"); }
  private remaining(userId: string) { const row = this.get("SELECT COALESCE(SUM(delta),0) AS used FROM trial_ledger WHERE user_id=?", userId); return Math.max(0, 3 + Number(row?.used ?? 0)); }
  resetTrials(user: Credential) {
    return this.tx(() => {
      this.authorized(user);
      const add = 3 - this.remaining(user.id);
      if (add > 0) { this.run("INSERT INTO trial_ledger VALUES (?,?,?,?,?,?)", randomUUID(), user.id, null, add, "ripristino esplicito della prova locale", this.now()); this.audit(user.id, "demo.trials_reset", user.id); }
      return { remaining: this.remaining(user.id) };
    });
  }
  private owned(user: Credential, id: string): AttemptRow {
    this.authorized(user);
    const row = this.get("SELECT * FROM attempts WHERE id=? AND user_id=?", id, user.id) as AttemptRow | undefined;
    if (!row) throw new AppError("NOT_FOUND", "Simulazione non trovata.", 404);
    return row;
  }
  private finalize(row: AttemptRow, status: "submitted" | "expired") {
    if (row.status !== "in_progress") return;
    const questions = JSON.parse(row.questions_json) as Question[];
    const answers = new Map(this.all("SELECT * FROM answers WHERE attempt_id=?", row.id).map(a => [String(a.question_id), JSON.parse(String(a.selected_json)) as string[]]));
    const result = score(questions.map(q => classify(answers.get(q.official_id) ?? [], q.correct_option_id)), JSON.parse(String(row.rules_json)) as RuleSnapshot);
    this.run("UPDATE attempts SET status=?,finalized_at=?,result_json=? WHERE id=? AND status='in_progress'", status, this.now(), JSON.stringify(result), row.id);
  }
  expireDue() {
    this.tx(() => { for (const row of this.all("SELECT * FROM attempts WHERE status='in_progress' AND deadline_at<=?", this.now())) this.finalize(row as AttemptRow, "expired"); });
  }
  startAttempt(user: Credential, requestKey: string, duration: number) {
    if (![120, 1800, 2700].includes(duration)) throw new AppError("INVALID_DURATION", "Durata di prova non valida.");
    this.expireDue();
    const id = this.tx(() => {
      this.authorized(user);
      const previous = this.get("SELECT id FROM attempts WHERE user_id=? AND request_key=?", user.id, requestKey);
      if (previous) return String(previous.id);
      const running = this.get("SELECT id FROM attempts WHERE user_id=? AND status='in_progress'", user.id);
      if (running) return String(running.id);
      if (this.remaining(user.id) === 0) throw new AppError("TRIALS_EXHAUSTED", "Hai utilizzato le tre prove. Nella versione privata puoi ripristinarle dalla dashboard.", 403);
      const bankRow = this.get("SELECT * FROM banks WHERE status='active'");
      if (!bankRow) throw new AppError("BANK_UNAVAILABLE", "La banca di prova non è ancora disponibile.", 503);
      const bank = parseBank(JSON.parse(String(bankRow.content)));
      const attemptId = randomUUID(), start = this.now(), questions = selectQuestions(bank.questions, RULES.count);
      this.run("INSERT INTO attempts(id,user_id,bank_id,request_key,status,started_at,deadline_at,duration_seconds,rules_json,questions_json) VALUES (?,?,?,?,?,?,?,?,?,?)",
        attemptId, user.id, String(bankRow.id), requestKey, "in_progress", start, start + duration * 1000, duration, JSON.stringify(RULES), JSON.stringify(questions));
      this.run("INSERT INTO trial_ledger VALUES (?,?,?,?,?,?)", randomUUID(), user.id, attemptId, -1, "avvio simulazione sintetica", start);
      return attemptId;
    });
    return this.attempt(user, id);
  }
  saveAnswer(user: Credential, attemptId: string, questionId: string, selected: string[], expectedVersion: number) {
    return this.tx(() => {
      const row = this.owned(user, attemptId);
      if (row.status !== "in_progress" || this.now() >= row.deadline_at) throw new AppError("ATTEMPT_FINISHED", "Il tempo è terminato. Le risposte già salvate sono conservate.", 409);
      const questions = JSON.parse(row.questions_json) as Question[], q = questions.find(q => q.official_id === questionId);
      if (!q || selected.length > 1 || selected.some(id => !q.options.some(o => o.id === id))) throw new AppError("INVALID_OPTION", "Seleziona una sola alternativa valida, oppure ometti.");
      const current = this.get("SELECT * FROM answers WHERE attempt_id=? AND question_id=?", attemptId, questionId);
      const version = Number(current?.version ?? 0);
      if (version !== expectedVersion) {
        if (version === expectedVersion + 1 && String(current?.selected_json) === JSON.stringify(selected)) return { version, savedAt: Number(current?.saved_at), serverNow: this.now() };
        throw new AppError("ANSWER_CONFLICT", "La risposta è cambiata in un'altra scheda. Ricarica la simulazione prima di continuare.", 409);
      }
      const savedAt = this.now();
      this.run("INSERT INTO answers VALUES (?,?,?,?,?) ON CONFLICT(attempt_id,question_id) DO UPDATE SET selected_json=excluded.selected_json,version=excluded.version,saved_at=excluded.saved_at", attemptId, questionId, JSON.stringify(selected), version + 1, savedAt);
      return { version: version + 1, savedAt, serverNow: savedAt };
    });
  }
  submit(user: Credential, id: string) {
    this.tx(() => { const row = this.owned(user, id); this.finalize(row, this.now() >= row.deadline_at ? "expired" : "submitted"); });
    return this.attempt(user, id);
  }
  attempt(user: Credential, id: string) {
    this.expireDue();
    const row = this.owned(user, id), questions = JSON.parse(row.questions_json) as Question[];
    const answers = Object.fromEntries(this.all("SELECT * FROM answers WHERE attempt_id=?", id).map(a => [String(a.question_id), { selected: JSON.parse(String(a.selected_json)) as string[], version: Number(a.version), savedAt: Number(a.saved_at) }]));
    const bank = this.get("SELECT version FROM banks WHERE id=?", row.bank_id);
    return { id: row.id, status: row.status as "in_progress" | "submitted" | "expired", startedAt: row.started_at, deadlineAt: row.deadline_at,
      durationSeconds: row.duration_seconds, serverNow: this.now(), bankVersion: String(bank?.version), rules: JSON.parse(String(row.rules_json)) as typeof RULES,
      questions: questions.map(publicQuestion), answers,
      result: row.result_json ? { ...JSON.parse(row.result_json) as ReturnType<typeof score>, items: questions.map(q => ({ questionId: q.official_id, correctOptionId: q.correct_option_id,
        explanation: q.explanation, outcome: classify(answers[q.official_id]?.selected ?? [], q.correct_option_id) })) } : null };
  }
  dashboard(user: Credential) {
    this.authorized(user); this.expireDue();
    const attempts = this.all("SELECT id,status,started_at,duration_seconds,result_json FROM attempts WHERE user_id=? ORDER BY started_at DESC", user.id).map(a => ({
      id: String(a.id), status: String(a.status), startedAt: Number(a.started_at), durationSeconds: Number(a.duration_seconds), result: a.result_json ? JSON.parse(String(a.result_json)) as ReturnType<typeof score> : null
    }));
    const bank = this.get("SELECT version,question_count FROM banks WHERE status='active'");
    return { user: { id: user.id, name: user.name, email: user.email }, remaining: this.remaining(user.id), activeAttempt: attempts.find(a => a.status === "in_progress")?.id ?? null,
      attempts, bank: bank ? { version: String(bank.version), count: Number(bank.question_count) } : null, mode: "private-local" as const };
  }
}

const globalStore = globalThis as unknown as { quizPrivateStore?: PrivateStore };
export function getStore() {
  if ((process.env.APP_MODE ?? "private-local") !== "private-local") throw new AppError("LOCAL_ONLY", "Questa versione è disponibile solo in modalità privata locale.", 503);
  if (!globalStore.quizPrivateStore) {
    const store = new PrivateStore(process.env.QUIZ_DB_PATH ?? join(process.cwd(), ".data/quiz.sqlite"));
    if (store.banks().length === 0) {
      const bank = JSON.parse(readFileSync(join(process.cwd(), "fixtures/demo-bank.json"), "utf8"));
      const imported = store.importBank(bank); store.activateBank(String(imported.id));
    }
    globalStore.quizPrivateStore = store;
  }
  return globalStore.quizPrivateStore;
}
export type AttemptView = ReturnType<PrivateStore["attempt"]>;
export type DashboardView = ReturnType<PrivateStore["dashboard"]>;
