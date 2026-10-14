import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AppError, getStore, isAppError } from "../../../server/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const cookie = "preparati_private_session";
const localHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);
const loginSchema = z.object({ email: z.string().trim().email().max(254), password: z.string().min(10).max(128) }).strict();
const signupSchema = loginSchema.extend({ name: z.string().trim().min(2).max(60) });
const startSchema = z.object({ requestKey: z.string().uuid(), duration: z.number().int() }).strict();
const answerSchema = z.object({ questionId: z.string().min(1).max(120), selected: z.array(z.string().max(120)).max(1), expectedVersion: z.number().int().min(0) }).strict();

function guard(request: NextRequest, mutation = false) {
  const host = request.headers.get("host") ?? "";
  let parsed: URL;
  try { parsed = new URL(`http://${host}`); } catch { throw new AppError("LOCAL_ONLY", "Apri la prova sul computer locale.", 403); }
  if (!localHosts.has(parsed.hostname)) throw new AppError("LOCAL_ONLY", "Questa versione è riservata al computer locale.", 403);
  if (mutation) {
    const origin = request.headers.get("origin");
    if (!origin || origin !== `http://${host}`) throw new AppError("INVALID_ORIGIN", "Richiesta non consentita. Riapri la prova dal suo indirizzo locale.", 403);
  }
}
async function body(request: NextRequest) {
  if (!request.headers.get("content-type")?.includes("application/json")) throw new AppError("INVALID_BODY", "Formato della richiesta non valido.");
  if (Number(request.headers.get("content-length")) > 32_768) throw new AppError("BODY_TOO_LARGE", "Richiesta troppo grande.", 413);
  const raw = await request.text();
  if (Buffer.byteLength(raw) > 32_768) throw new AppError("BODY_TOO_LARGE", "Richiesta troppo grande.", 413);
  try { return JSON.parse(raw) as unknown; } catch { throw new AppError("INVALID_BODY", "Richiesta non leggibile."); }
}
function errorResponse(error: unknown) {
  if (isAppError(error)) return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: error.status });
  if (error instanceof z.ZodError) return NextResponse.json({ error: { code: "INVALID_INPUT", message: "Controlla i dati inseriti. La password deve avere almeno 10 caratteri." } }, { status: 400 });
  console.error("Operazione della prova privata non riuscita:", error instanceof Error ? error.message : "errore interno");
  return NextResponse.json({ error: { code: "INTERNAL", message: "Si è verificato un errore. Riprova tra poco." } }, { status: 500 });
}
export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  try {
    guard(request);
    const path = (await context.params).path, store = getStore();
    if (path.join("/") === "health") return NextResponse.json({ ready: true, mode: "private-local", synthetic: true });
    const user = store.identity(request.cookies.get(cookie)?.value);
    if (path.join("/") === "session") return NextResponse.json(store.dashboard(user));
    if (path[0] === "attempts" && path.length === 2) return NextResponse.json(store.attempt(user, path[1]));
    throw new AppError("NOT_FOUND", "Pagina non trovata.", 404);
  } catch (error) { return errorResponse(error); }
}
export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  try {
    guard(request, true);
    const path = (await context.params).path, key = path.join("/"), store = getStore();
    const input = await body(request);
    if (key === "auth/signup" || key === "auth/signin") {
      store.rateLimit("local:authentication", 30, 60_000);
      const parsed = key === "auth/signup" ? signupSchema.parse(input) : loginSchema.parse(input);
      store.rateLimit(`auth:${parsed.email.toLowerCase()}`, 12, 15 * 60_000);
      const auth = key === "auth/signup" ? store.signup(parsed.email, signupSchema.parse(input).name, parsed.password) : store.signin(parsed.email, parsed.password);
      const response = NextResponse.json({ user: auth.user });
      response.cookies.set(cookie, auth.token, { httpOnly: true, sameSite: "strict", secure: false, path: "/", maxAge: 7 * 86400 });
      return response;
    }
    const user = store.identity(request.cookies.get(cookie)?.value);
    if (key === "auth/logout") {
      store.logout(user); const response = NextResponse.json({ ok: true }); response.cookies.delete(cookie); return response;
    }
    if (key === "demo/reset-trials") {
      store.rateLimit(`reset:${user.id}`, 10, 60_000); return NextResponse.json(store.resetTrials(user));
    }
    if (key === "attempts/start") {
      store.rateLimit(`start:${user.id}`, 15, 60_000);
      const data = startSchema.parse(input); return NextResponse.json(store.startAttempt(user, data.requestKey, data.duration));
    }
    if (path[0] === "attempts" && path.length === 3 && path[2] === "answer") {
      store.rateLimit(`answer:${user.id}`, 180, 60_000);
      const data = answerSchema.parse(input);
      return NextResponse.json(store.saveAnswer(user, path[1], data.questionId, data.selected, data.expectedVersion));
    }
    if (path[0] === "attempts" && path.length === 3 && path[2] === "submit") {
      store.rateLimit(`submit:${user.id}`, 30, 60_000); return NextResponse.json(store.submit(user, path[1]));
    }
    throw new AppError("NOT_FOUND", "Operazione non trovata.", 404);
  } catch (error) { return errorResponse(error); }
}
