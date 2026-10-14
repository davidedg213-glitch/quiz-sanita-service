import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import type { AttemptView, DashboardView } from "../src/server/store";

const base = "http://127.0.0.1:3000", password = "password-test-api-2026";
const email = `qa-${randomUUID()}@example.invalid`;
const checks: { name: string; passed: boolean }[] = [];
async function request(path: string, data?: unknown, cookie?: string, origin = base) {
  const response = await fetch(`${base}/api/${path}`, {
    method: data === undefined ? "GET" : "POST", headers: {
      ...(cookie ? { Cookie: cookie } : {}), ...(data === undefined ? {} : { "Content-Type": "application/json", ...(origin ? { Origin: origin } : {}) })
    }, ...(data === undefined ? {} : { body: JSON.stringify(data) })
  });
  return { response, value: await response.json() as Record<string, unknown> };
}
function done(name: string) { checks.push({ name, passed: true }); console.log(`OK: ${name}`); }
async function main() {
  assert.equal((await request("health")).response.status, 200); done("Salute server e modalità privata");
  assert.equal((await request("session")).response.status, 401); done("Accesso anonimo negato con errore leggibile");
  assert.equal((await request("auth/signup", { email, name: "Test API", password }, undefined, "")).response.status, 403); done("Mutazioni senza Origin respinte");
  assert.equal((await request("auth/signup", { email, name: "Test API", password }, undefined, "https://origine-estranea.invalid")).response.status, 403); done("Origine estranea respinta");
  assert.equal((await request("auth/signup", { email, name: "Test API", password: "corta" })).response.status, 400); done("Input non valido respinto");
  const created = await request("auth/signup", { email, name: "Test API", password }); assert.equal(created.response.status, 200);
  const setCookie = created.response.headers.get("set-cookie")!; assert.ok(setCookie.includes("HttpOnly")); assert.ok(setCookie.toLowerCase().includes("samesite=strict"));
  const cookie = setCookie.split(";")[0]; done("Registrazione e cookie HttpOnly SameSite Strict");
  const first = (await request("session", undefined, cookie)).value as unknown as DashboardView; assert.equal(first.remaining, 3); assert.equal(first.bank?.count, 1500); done("Dashboard iniziale e banca 1500");
  const start = await request("attempts/start", { requestKey: randomUUID(), duration: 1800 }, cookie); assert.equal(start.response.status, 200);
  const attempt = start.value as unknown as AttemptView; assert.equal(attempt.questions.length, 30); assert.equal(attempt.result, null); assert.ok(!JSON.stringify(attempt).includes("correct_option_id")); done("Quiz di 30 domande senza soluzione anticipata");
  const q = attempt.questions[0], payload = { questionId: q.official_id, selected: [q.options[0].id], expectedVersion: 0 };
  assert.equal((await request(`attempts/${attempt.id}/answer`, payload, cookie)).response.status, 200);
  assert.equal((await request(`attempts/${attempt.id}/answer`, payload, cookie)).response.status, 200); done("Salvataggio e retry idempotente");
  const resumed = (await request(`attempts/${attempt.id}`, undefined, cookie)).value as unknown as AttemptView;
  assert.equal(resumed.deadlineAt, attempt.deadlineAt); assert.deepEqual(resumed.answers[q.official_id].selected, payload.selected); done("Risposta e scadenza persistenti nella ripresa");
  const second = await request("auth/signup", { email: `other-${randomUUID()}@example.invalid`, name: "Altro test", password });
  const secondCookie = second.response.headers.get("set-cookie")!.split(";")[0];
  assert.equal((await request(`attempts/${attempt.id}`, undefined, secondCookie)).response.status, 404); done("Tentativi altrui non consultabili");
  const nextLogin = await request("auth/signin", { email, password }), nextCookie = nextLogin.response.headers.get("set-cookie")!.split(";")[0];
  assert.equal((await request("session", undefined, cookie)).response.status, 401); done("Nuovo login revoca il browser precedente");
  assert.equal((await request(`attempts/${attempt.id}/answer`, { ...payload, selected: [q.options[1].id] }, nextCookie)).response.status, 409); done("Salvataggio obsoleto respinto");
  const submitted = await request(`attempts/${attempt.id}/submit`, {}, nextCookie); assert.equal(submitted.response.status, 200);
  const report = submitted.value as unknown as AttemptView; assert.ok(report.result); assert.equal(report.result.omitted, 29); done("Consegna e report server con 29 omissioni");
  const repeated = (await request(`attempts/${attempt.id}/submit`, {}, nextCookie)).value as unknown as AttemptView;
  assert.deepEqual(repeated.result, report.result); assert.equal(repeated.status, report.status); assert.equal(repeated.deadlineAt, report.deadlineAt); done("Doppia consegna mantiene risultato unico");
  assert.equal((await request(`attempts/${attempt.id}/answer`, { ...payload, expectedVersion: 1 }, nextCookie)).response.status, 409); done("Risposte successive alla consegna respinte");
  assert.equal((await request("demo/reset-trials", {}, nextCookie)).response.status, 200);
  assert.equal(((await request("session", undefined, nextCookie)).value as unknown as DashboardView).remaining, 3); done("Ripristino esplicito prove locali");
  assert.equal((await request("auth/logout", {}, nextCookie)).response.status, 200);
  assert.equal((await request("session", undefined, nextCookie)).response.status, 401); done("Logout revoca la sessione");
  mkdirSync(".data", { recursive: true });
  writeFileSync(".data/api-test-report.json", JSON.stringify({ checkedAt: new Date().toISOString(), base, total: checks.length, checks }, null, 2) + "\n");
  console.log(`Controlli HTTP superati: ${checks.length}. Nessuna credenziale nel report.`);
}
main().catch(error => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
