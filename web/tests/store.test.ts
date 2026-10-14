import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname, basename } from "node:path";
import { createDemoBank, type Question } from "../src/domain/bank";
import { PrivateStore, AppError } from "../src/server/store";

function fixture() {
  let now = 1_800_000_000_000;
  const store = new PrivateStore(":memory:", () => now);
  const bank = createDemoBank("test-1", 80), imported = store.importBank(bank); store.activateBank(String(imported.id));
  const auth = store.signup("test@example.invalid", "Persona di prova", "password-di-prova-2026");
  return { store, bank, user: store.identity(auth.token), token: auth.token, advance: (ms: number) => { now += ms; } };
}
const code = (expected: string) => (error: unknown) => error instanceof AppError && error.code === expected;
test("Sessione unica: il nuovo login revoca token e credenziale precedente", () => {
  const f = fixture(); try {
    const next = f.store.signin("test@example.invalid", "password-di-prova-2026");
    assert.throws(() => f.store.identity(f.token), code("SESSION_REPLACED"));
    assert.throws(() => f.store.dashboard(f.user), code("SESSION_REPLACED"));
    assert.ok(f.store.identity(next.token));
  } finally { f.store.close(); }
});
test("Nessuna password in chiaro e nessun token grezzo nel database", () => {
  const f = fixture(); try {
    const user = f.store.db.prepare("SELECT password_hash,current_session_hash FROM users").get()!;
    assert.notEqual(user.password_hash, "password-di-prova-2026"); assert.notEqual(user.current_session_hash, f.token);
  } finally { f.store.close(); }
});
test("Avvio atomico e idempotente, un solo credito per prova attiva", () => {
  const f = fixture(); try {
    const key = randomUUID(), first = f.store.startAttempt(f.user, key, 1800);
    assert.equal(f.store.startAttempt(f.user, key, 1800).id, first.id);
    assert.equal(f.store.startAttempt(f.user, randomUUID(), 1800).id, first.id);
    assert.equal(f.store.dashboard(f.user).remaining, 2);
    assert.equal(new Set(first.questions.map(q => q.official_id)).size, 30);
    assert.equal(first.result, null); assert.equal(JSON.stringify(first).includes("correct_option_id"), false);
  } finally { f.store.close(); }
});
test("Salvataggio: retry identico, conflitti e alternativa estranea", () => {
  const f = fixture(); try {
    const a = f.store.startAttempt(f.user, randomUUID(), 1800), q = a.questions[0];
    const first = f.store.saveAnswer(f.user, a.id, q.official_id, [q.options[0].id], 0);
    assert.equal(first.version, 1);
    assert.equal(f.store.saveAnswer(f.user, a.id, q.official_id, [q.options[0].id], 0).version, 1);
    assert.throws(() => f.store.saveAnswer(f.user, a.id, q.official_id, [q.options[1].id], 0), code("ANSWER_CONFLICT"));
    assert.throws(() => f.store.saveAnswer(f.user, a.id, q.official_id, ["altra-domanda"], 1), code("INVALID_OPTION"));
    const omitted = f.store.saveAnswer(f.user, a.id, q.official_id, [], 1); assert.equal(omitted.version, 2);
    assert.deepEqual(f.store.attempt(f.user, a.id).answers[q.official_id].selected, []);
  } finally { f.store.close(); }
});
test("Deadline server: risposte al termine respinte, scadenza senza browser", () => {
  const f = fixture(); try {
    const a = f.store.startAttempt(f.user, randomUUID(), 120), q = a.questions[0];
    f.advance(119_999); f.store.saveAnswer(f.user, a.id, q.official_id, [q.options[0].id], 0);
    f.advance(1); assert.throws(() => f.store.saveAnswer(f.user, a.id, q.official_id, [], 1), code("ATTEMPT_FINISHED"));
    f.store.expireDue(); const expired = f.store.attempt(f.user, a.id); assert.equal(expired.status, "expired");
    assert.equal(expired.result!.omitted, 29); assert.equal(expired.deadlineAt, a.deadlineAt);
  } finally { f.store.close(); }
});
test("Consegna unica, punteggio server e soluzioni solo nel report", () => {
  const f = fixture(); try {
    const a = f.store.startAttempt(f.user, randomUUID(), 1800);
    for (const q of a.questions) {
      const correct = f.bank.questions.find(source => source.official_id === q.official_id)!.correct_option_id;
      f.store.saveAnswer(f.user, a.id, q.official_id, [correct], 0);
    }
    const result = f.store.submit(f.user, a.id); assert.equal(result.result!.cents, 3000);
    assert.deepEqual(f.store.submit(f.user, a.id).result, result.result);
    assert.throws(() => f.store.saveAnswer(f.user, a.id, a.questions[0].official_id, [], 1), code("ATTEMPT_FINISHED"));
  } finally { f.store.close(); }
});
test("La correzione usa le regole congelate nel tentativo", () => {
  const f = fixture(); try {
    const a = f.store.startAttempt(f.user, randomUUID(), 1800), q = a.questions[0];
    const source = f.bank.questions.find(item => item.official_id === q.official_id)!;
    const wrong = q.options.find(o => o.id !== source.correct_option_id)!;
    f.store.saveAnswer(f.user, a.id, q.official_id, [wrong.id], 0);
    f.store.db.prepare("UPDATE attempts SET rules_json=? WHERE id=?").run(JSON.stringify({ ...a.rules, wrong: -50, version: "regole-test-alternative" }), a.id);
    assert.equal(f.store.submit(f.user, a.id).result!.cents, -50);
  } finally { f.store.close(); }
});
test("Tre avvii consumano tre crediti; ripristino solo come operazione demo tracciata", () => {
  const f = fixture(); try {
    for (let i = 0; i < 3; i++) { const a = f.store.startAttempt(f.user, randomUUID(), 120); f.store.submit(f.user, a.id); }
    assert.equal(f.store.dashboard(f.user).remaining, 0);
    assert.throws(() => f.store.startAttempt(f.user, randomUUID(), 120), code("TRIALS_EXHAUSTED"));
    f.store.resetTrials(f.user); f.store.resetTrials(f.user); assert.equal(f.store.dashboard(f.user).remaining, 3);
    assert.equal(f.store.db.prepare("SELECT COUNT(*) AS n FROM audit_log WHERE action='demo.trials_reset'").get()!.n, 1);
  } finally { f.store.close(); }
});
test("Utenti diversi non leggono, modificano o consegnano prove altrui", () => {
  const f = fixture(); try {
    const a = f.store.startAttempt(f.user, randomUUID(), 1800);
    const other = f.store.signup("other@example.invalid", "Altra persona", "altra-password-2026"), user = f.store.identity(other.token);
    assert.throws(() => f.store.attempt(user, a.id), code("NOT_FOUND"));
    assert.throws(() => f.store.saveAnswer(user, a.id, a.questions[0].official_id, [], 0), code("NOT_FOUND"));
    assert.throws(() => f.store.submit(user, a.id), code("NOT_FOUND"));
    assert.equal(f.store.dashboard(user).attempts.length, 0);
  } finally { f.store.close(); }
});
test("Importazione ripetibile, versioni immutabili, attivazione e rollback preservano prove", () => {
  const f = fixture(); try {
    const first = f.store.banks()[0], a = f.store.startAttempt(f.user, randomUUID(), 1800);
    assert.equal(f.store.importBank(f.bank).unchanged, true);
    const bad = structuredClone(f.bank); bad.questions[0].text += " Cambiato.";
    assert.throws(() => f.store.importBank(bad), code("VERSION_EXISTS"));
    const next = createDemoBank("test-2", 90), imported = f.store.importBank(next); f.store.activateBank(String(imported.id));
    assert.equal(f.store.attempt(f.user, a.id).bankVersion, "test-1");
    assert.equal(f.store.dashboard(f.user).bank!.version, "test-2");
    f.store.activateBank(String(first.id)); assert.equal(f.store.dashboard(f.user).bank!.version, "test-1");
    assert.deepEqual(f.store.attempt(f.user, a.id).questions, a.questions);
  } finally { f.store.close(); }
});
test("Banca assente o immagine mancante non consuma prove", () => {
  const f = fixture(); try {
    f.store.db.prepare("UPDATE banks SET status='retired'").run();
    assert.throws(() => f.store.startAttempt(f.user, randomUUID(), 1800), code("BANK_UNAVAILABLE"));
    assert.equal(f.store.dashboard(f.user).remaining, 3);
    const missing = createDemoBank("media-missing", 30); missing.questions[0].media = [{ path: "/demo-media/inesistente.png", alt: "Figura" }];
    assert.throws(() => f.store.importBank(missing), code("MEDIA_MISSING"));
  } finally { f.store.close(); }
});
test("Limiti frequenza persistenti e ripristino della finestra", () => {
  const f = fixture(); try {
    f.store.rateLimit("bucket", 2, 1000); f.store.rateLimit("bucket", 2, 1000);
    assert.throws(() => f.store.rateLimit("bucket", 2, 1000), code("RATE_LIMIT"));
    f.advance(1000); assert.doesNotThrow(() => f.store.rateLimit("bucket", 2, 1000));
  } finally { f.store.close(); }
});
test("Archivio riaperto: sessione, domanda, risposta e deadline conservate", () => {
  const directory = mkdtempSync(join(tmpdir(), "preparati-test-")), path = join(directory, "test.sqlite");
  let store = new PrivateStore(path);
  try {
    const imported = store.importBank(createDemoBank("persist", 30)); store.activateBank(String(imported.id));
    const auth = store.signup("persist@example.invalid", "Persistenza", "password-persistenza"), user = store.identity(auth.token);
    const a = store.startAttempt(user, randomUUID(), 1800), q = a.questions[0];
    store.saveAnswer(user, a.id, q.official_id, [q.options[0].id], 0); store.close();
    store = new PrivateStore(path); const resumed = store.attempt(store.identity(auth.token), a.id);
    assert.equal(resumed.deadlineAt, a.deadlineAt); assert.deepEqual(resumed.questions, a.questions);
    assert.deepEqual(resumed.answers[q.official_id].selected, [q.options[0].id]);
  } finally {
    store.close();
    const target = resolve(directory);
    assert.equal(dirname(target), resolve(tmpdir()));
    assert.ok(basename(target).startsWith("preparati-test-"));
    rmSync(target, { recursive: true, force: true });
  }
});
