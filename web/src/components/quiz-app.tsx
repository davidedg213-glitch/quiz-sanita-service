"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, ChevronRight, Clock3, Flag, GraduationCap, History, LayoutDashboard, LoaderCircle, LogOut, Play, RefreshCw, ShieldCheck, Sparkles, Target, Trophy, X, XCircle } from "lucide-react";
import type { AttemptView, DashboardView } from "../server/store";

type Screen = "home" | "start" | "exam" | "report" | "history" | "rules";
type Pending = { questionId: string; selected: string[]; expectedVersion: number };
class RequestError extends Error { constructor(message: string, public status: number, public code: string) { super(message); } }
async function api<T>(path: string, data?: unknown): Promise<T> {
  const response = await fetch(`/api/${path}`, { method: data === undefined ? "GET" : "POST", credentials: "same-origin", cache: "no-store",
    ...(data === undefined ? {} : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }) });
  const value = await response.json() as { error?: { message: string; code: string } };
  if (!response.ok) throw new RequestError(value.error?.message ?? "Operazione non riuscita.", response.status, value.error?.code ?? "ERROR");
  return value as T;
}
const scoreText = (cents: number) => (cents / 100).toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const dateText = (date: number) => new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(date);
const durationText = (seconds: number) => `${seconds / 60} min`;

export function QuizApp() {
  const [dashboard, setDashboard] = useState<DashboardView | null>(null);
  const [attempt, setAttempt] = useState<AttemptView | null>(null);
  const [screen, setScreen] = useState<Screen>("home");
  const [loading, setLoading] = useState(true), [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [authMode, setAuthMode] = useState<"signup" | "signin">("signup");
  const [name, setName] = useState(""), [email, setEmail] = useState(""), [password, setPassword] = useState("");
  const [duration, setDuration] = useState(1800), [index, setIndex] = useState(0);
  const [saving, setSaving] = useState(false), [pending, setPending] = useState<Pending | null>(null);
  const [confirmSubmit, setConfirmSubmit] = useState(false), [remaining, setRemaining] = useState(0);
  const [clockFor, setClockFor] = useState<string | null>(null);
  const [flags, setFlags] = useState<Set<string>>(new Set());
  const [online, setOnline] = useState(true);
  const submitLock = useRef(false), expiryRequested = useRef(false), startKey = useRef<string | null>(null);
  const questionHeading = useRef<HTMLHeadingElement>(null);

  const handleError = useCallback((failure: unknown) => {
    setError(failure instanceof Error ? failure.message : "Operazione non riuscita. Riprova.");
    if (failure instanceof RequestError && failure.status === 401) { setDashboard(null); setAttempt(null); setScreen("home"); setPending(null); }
  }, []);
  const refreshDashboard = useCallback(async () => {
    const data = await api<DashboardView>("session"); setDashboard(data); return data;
  }, []);
  const openAttempt = useCallback(async (id: string) => {
    const data = await api<AttemptView>(`attempts/${id}`);
    setAttempt(data); setIndex(0); setPending(null); setFlags(new Set()); setConfirmSubmit(false); setClockFor(null);
    setScreen(data.status === "in_progress" ? "exam" : "report");
    window.history.replaceState(null, "", `/?attempt=${encodeURIComponent(id)}`);
    expiryRequested.current = false;
  }, []);

  useEffect(() => {
    let alive = true;
    void api<DashboardView>("session").then(async data => {
      if (!alive) return; setDashboard(data);
      const id = new URLSearchParams(window.location.search).get("attempt");
      if (id) { try { await openAttempt(id); } catch (failure) { handleError(failure); window.history.replaceState(null, "", "/"); } }
    }).catch(failure => {
      if (alive && !(failure instanceof RequestError && failure.code === "LOGIN_REQUIRED")) handleError(failure);
    }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [handleError, openAttempt]);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update(); window.addEventListener("online", update); window.addEventListener("offline", update);
    return () => { window.removeEventListener("online", update); window.removeEventListener("offline", update); };
  }, []);

  useEffect(() => {
    if (!dashboard) return;
    const synchronize = async () => {
      if (document.hidden || saving || pending || submitLock.current) return;
      try {
        if (screen === "exam" && attempt) {
          const data = await api<AttemptView>(`attempts/${attempt.id}`); setAttempt(data);
          if (data.status !== "in_progress") { setScreen("report"); setConfirmSubmit(false); await refreshDashboard(); }
        } else await refreshDashboard();
      } catch (failure) { if (failure instanceof RequestError && failure.status === 401) handleError(failure); }
    };
    const onVisible = () => { if (!document.hidden) void synchronize(); };
    const timer = setInterval(() => { void synchronize(); }, 30_000);
    document.addEventListener("visibilitychange", onVisible);
    return () => { clearInterval(timer); document.removeEventListener("visibilitychange", onVisible); };
  }, [dashboard?.user.id, screen, attempt?.id, saving, pending, handleError, refreshDashboard]);

  useEffect(() => {
    if (screen !== "exam" || !attempt) return;
    const base = performance.now(), serverStart = attempt.serverNow, deadline = attempt.deadlineAt;
    const tick = () => { setRemaining(Math.max(0, Math.ceil((deadline - serverStart - (performance.now() - base)) / 1000))); setClockFor(attempt.id); };
    tick(); const timer = setInterval(tick, 250); return () => clearInterval(timer);
  }, [screen, attempt?.id, attempt?.serverNow, attempt?.deadlineAt]);

  const submit = useCallback(async () => {
    if (!attempt || submitLock.current) return;
    submitLock.current = true; setBusy(true); setError("");
    try {
      const data = await api<AttemptView>(`attempts/${attempt.id}/submit`, {});
      setAttempt(data); setScreen("report"); setConfirmSubmit(false); setPending(null); await refreshDashboard();
    } catch (failure) { handleError(failure); expiryRequested.current = false; }
    finally { submitLock.current = false; setBusy(false); }
  }, [attempt, handleError, refreshDashboard]);

  useEffect(() => {
    if (screen === "exam" && attempt && clockFor === attempt.id && remaining === 0 && !saving && !expiryRequested.current && online) {
      expiryRequested.current = true; void submit();
    }
  }, [screen, remaining, clockFor, attempt, saving, online, submit]);

  useEffect(() => {
    if (!confirmSubmit) return;
    const previous = document.activeElement as HTMLElement | null;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) { event.preventDefault(); setConfirmSubmit(false); }
      if (event.key === "Tab") {
        const items = [...document.querySelectorAll<HTMLButtonElement>(".confirm-dialog button:not(:disabled)")];
        const first = items[0], last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); previous?.focus(); };
  }, [confirmSubmit, busy]);

  useEffect(() => { if (screen === "exam") questionHeading.current?.focus(); }, [index, screen]);

  function navigate(next: Screen) {
    if (saving || pending) { setError("Una risposta non è ancora confermata. Completa il salvataggio o ricarica lo stato prima di uscire dalla simulazione."); return; }
    setError(""); setScreen(next); setConfirmSubmit(false);
    if (next !== "exam" && next !== "report") window.history.replaceState(null, "", "/");
  }
  async function authenticate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      await api(`auth/${authMode}`, { email, password, ...(authMode === "signup" ? { name } : {}) });
      setPassword(""); await refreshDashboard(); navigate("home");
    } catch (failure) { handleError(failure); } finally { setBusy(false); }
  }
  async function begin() {
    setBusy(true); setError(""); startKey.current ??= crypto.randomUUID();
    try {
      const data = await api<AttemptView>("attempts/start", { duration, requestKey: startKey.current });
      startKey.current = null; setAttempt(data); setScreen("exam"); setIndex(0); setPending(null); setFlags(new Set()); setClockFor(null); expiryRequested.current = false;
      window.history.replaceState(null, "", `/?attempt=${data.id}`); await refreshDashboard();
    } catch (failure) { handleError(failure); } finally { setBusy(false); }
  }
  async function persist(selection: Pending) {
    if (!attempt || saving) return;
    setSaving(true); setPending(selection); setError("");
    try {
      const data = await api<{ version: number; savedAt: number; serverNow: number }>(`attempts/${attempt.id}/answer`, selection);
      setAttempt(previous => previous ? { ...previous, serverNow: data.serverNow, answers: { ...previous.answers,
        [selection.questionId]: { selected: selection.selected, version: data.version, savedAt: data.savedAt } } } : previous);
      setPending(null);
    } catch (failure) { handleError(failure); } finally { setSaving(false); }
  }
  async function logout() {
    setBusy(true);
    try { await api("auth/logout", {}); setDashboard(null); setAttempt(null); setPending(null); setAuthMode("signin"); navigate("home"); }
    catch (failure) { handleError(failure); } finally { setBusy(false); }
  }
  async function resetTrials() {
    setBusy(true); setError("");
    try { await api("demo/reset-trials", {}); await refreshDashboard(); }
    catch (failure) { handleError(failure); } finally { setBusy(false); }
  }

  const completed = dashboard?.attempts.filter(a => a.result) ?? [];
  const average = completed.length ? Math.round(completed.reduce((sum, a) => sum + a.result!.cents, 0) / completed.length) : null;
  const answered = attempt ? Object.values(attempt.answers).filter(a => a.selected.length > 0).length : 0;
  const current = attempt?.questions[index];
  const currentSelected = current ? (pending?.questionId === current.official_id ? pending.selected : attempt?.answers[current.official_id]?.selected ?? []) : [];
  const navItems = [{ screen: "home" as const, icon: LayoutDashboard, label: "La tua dashboard" }, { screen: "start" as const, icon: Play, label: "Simulazione" }, { screen: "history" as const, icon: History, label: "I tuoi risultati" }, { screen: "rules" as const, icon: BookOpen, label: "Come funziona" }];

  return <div className="app-shell">
    <a className="skip-link" href="#main">Vai al contenuto</a>
    <aside className="sidebar">
      <a href="/" className="brand"><span className="brand-symbol"><GraduationCap size={24} strokeWidth={1.8} /></span><span>preparati<span className="brand-dot">.</span></span></a>
      <div className="workspace-label">IL TUO SPAZIO DI STUDIO</div>
      <nav aria-label="Navigazione principale">{navItems.map(item => <button key={item.screen} disabled={!dashboard} className={`nav-item ${(screen === item.screen || (item.screen === "start" && ["exam", "report"].includes(screen))) ? "active" : ""}`} onClick={() => navigate(item.screen)}><item.icon size={19} /><span>{item.label}</span>{screen === item.screen && <span className="nav-dot" />}</button>)}</nav>
      <div className="sidebar-note"><div className="note-icon"><Sparkles size={20} /></div><strong>Si comincia da qui.</strong><p>Una prova alla volta, per prendere confidenza con il tuo percorso.</p><span>Sanitaservice ASL BA · 2026</span></div>
      <div className="sidebar-bottom"><ShieldCheck size={17} /><span>Ambiente privato di prova</span></div>
    </aside>
    <div className="main-shell">
      <header className="topbar"><span className="breadcrumb">Il tuo percorso <ChevronRight size={14} /><strong>{({ home: "Dashboard", start: "Nuova simulazione", exam: "Simulazione in corso", report: "Risultato", history: "Risultati", rules: "Come funziona" })[screen]}</strong></span><div className="topbar-right"><span className="private-badge"><span />Prova privata</span>{dashboard && <><span className="avatar" aria-label={`Account ${dashboard.user.name}`}>{dashboard.user.name.slice(0, 1).toUpperCase()}</span><button className="icon-button" onClick={() => { void logout(); }} disabled={busy || saving} aria-label="Esci dall'account"><LogOut size={18} /></button></>}</div></header>
      <main id="main" className={`main-content ${screen === "exam" ? "exam-main" : ""}`}>
        <div className="demo-strip"><ShieldCheck size={16} /><span><strong>Questa è una versione di prova.</strong> I quesiti sono sintetici, non fanno parte della banca ufficiale.</span></div>
        {!online && <div className="alert warning" role="status">Connessione assente. Le risposte nuove non sono confermate finché non tornano salvate. Il tempo continua.</div>}
        {error && <div className="alert error" role="alert"><span>{error}</span><button onClick={() => setError("")} aria-label="Chiudi avviso"><X size={18} /></button></div>}
        {loading ? <div className="loading-state"><LoaderCircle className="spin" size={28} /><p>Prepariamo il tuo spazio…</p></div> : !dashboard ? <div className="welcome-grid">
          <section className="welcome-copy"><span className="eyebrow"><span /> SANITASERVICE ASL BA · 125 POSTI</span><h1>Il tuo prossimo passo,<br /><em>con più sicurezza.</em></h1><p className="lead">Uno spazio semplice per esercitarti, capire i tuoi risultati e costruire una buona abitudine di studio.</p><div className="welcome-features"><div><span className="feature-icon"><Target size={21} /></span><div><strong>Una prova completa</strong><p>30 domande e le regole di punteggio del bando.</p></div></div><div><span className="feature-icon"><Clock3 size={21} /></span><div><strong>Il tuo ritmo, sotto controllo</strong><p>Timer, salvataggio e ripresa della simulazione.</p></div></div><div><span className="feature-icon"><History size={21} /></span><div><strong>Ogni risultato conta</strong><p>Rivedi le risposte e segui il tuo percorso.</p></div></div></div><div className="welcome-footnote">Servizio indipendente di preparazione alla prova scritta.</div></section>
          <section className="auth-card panel"><div className="auth-icon"><GraduationCap size={27} /></div><h2>{authMode === "signup" ? "Crea il tuo spazio di prova" : "Bentornato nel tuo spazio"}</h2><p>{authMode === "signup" ? "Inizia con un account locale, senza pagamenti." : "Accedi per ritrovare le tue simulazioni."}</p><form onSubmit={authenticate}>{authMode === "signup" && <label>Come ti chiami?<input autoComplete="given-name" name="name" required minLength={2} maxLength={60} value={name} onChange={e => setName(e.target.value)} placeholder="Il tuo nome" /></label>}<label>Email<input name="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} placeholder="nome@esempio.it" /></label><label>Password<input name="password" type="password" autoComplete={authMode === "signup" ? "new-password" : "current-password"} required minLength={10} maxLength={128} value={password} onChange={e => setPassword(e.target.value)} placeholder="Almeno 10 caratteri" /></label><button className="button primary full" disabled={busy}>{busy ? <LoaderCircle className="spin" size={18} /> : null}{authMode === "signup" ? "Crea account di prova" : "Accedi"}<ArrowRight size={17} /></button></form><p className="auth-switch">{authMode === "signup" ? "Hai già un account?" : "Prima volta qui?"} <button onClick={() => { setAuthMode(authMode === "signup" ? "signin" : "signup"); setError(""); }}>{authMode === "signup" ? "Accedi" : "Registrati"}</button></p><div className="auth-disclaimer"><ShieldCheck size={15} /><span>Account di prova sul tuo computer. In questa fase l’email non viene inviata né verificata. Usa credenziali dedicate al test.</span></div></section>
        </div> : <>
          {screen === "home" && <>
            <section className="page-intro"><div><span className="eyebrow">IL TUO PERCORSO COMINCIA QUI</span><h1>Ciao, {dashboard.user.name}.<br /><span>Facciamo un passo avanti?</span></h1><p>Prenditi il tuo tempo. Ogni simulazione è un’occasione per migliorare.</p></div><div className="intro-date"><span className="small-calendar">2026</span><span>Concorso Sanitaservice<br /><strong>Pulitore / Ausiliario</strong></span></div></section>
            <section className="metrics" aria-label="Il tuo percorso in numeri"><Metric icon={Play} label="Simulazioni completate" value={String(completed.length).padStart(2, "0")} note="Il tuo allenamento, finora" /><Metric icon={Target} label="Punteggio medio" value={average === null ? "—" : scoreText(average)} suffix={average === null ? undefined : "/ 30"} note={average === null ? "Comparirà dopo la prima prova" : "Media delle prove sintetiche"} /><Metric icon={Flag} label="Prove disponibili" value={String(dashboard.remaining).padStart(2, "0")} suffix="/ 3" note="Ripristinabili nella prova privata" /></section>
            <section className="home-columns"><div className="simulation-card"><div className="card-topline"><span className="light-chip"><span /> PRONTO QUANDO LO SEI TU</span><span className="large-soft-icon"><GraduationCap size={43} strokeWidth={1.3} /></span></div><h2>Metti alla prova<br />la tua preparazione.</h2><p>Una simulazione dello scritto con 30 quesiti estratti dalla banca di prova. Le risposte corrette le vedrai alla fine.</p><div className="simulation-facts"><span><BookOpen size={17} />30 domande</span><span><Clock3 size={17} />Tempo configurabile</span></div><button className="button paper" onClick={() => dashboard.activeAttempt ? void openAttempt(dashboard.activeAttempt).catch(handleError) : navigate("start")}>{dashboard.activeAttempt ? "Riprendi la simulazione" : "Inizia una simulazione"}<ArrowRight size={18} /></button><span className="simulation-note">Tempo di allenamento provvisorio · soglia 21 / 30</span></div><div className="journey-card panel"><span className="section-label">LA TUA BUSSOLA</span><h2>Come leggere la prova</h2><div className="scoring-line"><span className="score-icon green"><Check size={18} /></span><div><strong>Risposta esatta</strong><span>Una scelta corretta</span></div><b>+1,00</b></div><div className="scoring-line"><span className="score-icon red"><X size={18} /></span><div><strong>Risposta errata</strong><span>Si applica una penalità</span></div><b>−0,33</b></div><div className="scoring-line"><span className="score-icon neutral">—</span><div><strong>Risposta omessa</strong><span>Puoi lasciare in bianco</span></div><b>0,00</b></div><button className="text-button" onClick={() => navigate("rules")}>Tutte le regole della prova <ArrowRight size={16} /></button></div></section>
            <section className="recent-section"><div className="section-heading"><h2>Le tue ultime simulazioni</h2><button className="text-button" onClick={() => navigate("history")}>Vedi tutte <ArrowRight size={16} /></button></div>{completed.length === 0 ? <div className="empty-state panel"><span className="empty-icon"><History size={24} /></span><div><strong>Il primo risultato ti aspetta.</strong><p>Quando completi una simulazione, troverai qui il tuo punteggio e il dettaglio delle risposte.</p></div><button className="text-button" onClick={() => navigate("start")}>Comincia <ArrowRight size={16} /></button></div> : <HistoryList attempts={completed.slice(0, 4)} onOpen={id => { void openAttempt(id).catch(handleError); }} />}</section>
            <div className="bank-footer"><span><span className="status-dot" />Banca sintetica: <strong>{dashboard.bank?.count.toLocaleString("it-IT") ?? 0} quesiti</strong> · {dashboard.bank?.version}</span><button disabled={busy || dashboard.remaining === 3} onClick={() => { void resetTrials(); }}><RefreshCw size={14} />Ripristina prove locali</button></div>
          </>}
          {screen === "start" && <><PageHeading eyebrow="UN NUOVO PASSO" title="Prepariamo la tua simulazione." description="Prima di iniziare, scegli il tempo e rileggi le regole." /><div className="start-layout"><section className="panel start-card"><span className="section-label">TEMPO DI ALLENAMENTO</span><h2>Scegli la durata</h2><p>Il bando fornito non indica ancora la durata ufficiale. Queste impostazioni sono per l’allenamento.</p><div className="duration-options">{[{ seconds: 1800, label: "30 minuti", hint: "Allenamento standard" }, { seconds: 2700, label: "45 minuti", hint: "Più tempo per esercitarti" }, { seconds: 120, label: "2 minuti", hint: "Solo per provare il timer" }].map(item => <label key={item.seconds} className={`duration-option ${duration === item.seconds ? "selected" : ""}`}><input type="radio" name="duration" value={item.seconds} checked={duration === item.seconds} onChange={() => { setDuration(item.seconds); startKey.current = null; }} /><span><strong>{item.label}</strong><small>{item.hint}</small></span>{duration === item.seconds && <CheckCircle2 size={20} />}</label>)}</div><div className="start-notice"><ShieldCheck size={19} /><p>L’avvio utilizza una delle tre prove disponibili. Ricaricare o riprendere la stessa simulazione non ne consuma un’altra.</p></div>{dashboard.activeAttempt ? <button className="button primary full" disabled={busy} onClick={() => { void openAttempt(dashboard.activeAttempt!).catch(handleError); }}>Riprendi la prova in corso <ArrowRight size={18} /></button> : <button className="button primary full" disabled={busy || dashboard.remaining === 0 || !online} onClick={() => { void begin(); }}>{busy ? <LoaderCircle className="spin" size={18} /> : <Play size={18} />}Avvia simulazione · {durationText(duration)}</button>}{dashboard.remaining === 0 && <button className="text-button center" disabled={busy} onClick={() => { void resetTrials(); }}>Ripristina le prove locali</button>}</section><aside className="panel start-rules"><h2>Una prova, 30 domande.</h2><ul><li>Puoi cambiare risposta o omettere fino alla consegna.</li><li>Le risposte sono salvate dopo la conferma sullo schermo.</li><li>Il timer continua anche se chiudi la pagina.</li><li>Alla scadenza valgono le ultime risposte confermate.</li><li>Soluzioni e punteggio compaiono solo alla fine.</li></ul><div className="rule-threshold"><Target size={23} /><span>Soglia dello scritto<br /><strong>21,00 / 30,00</strong></span></div><p className="muted small">Raggiungere la soglia qui non costituisce un’ammissione ufficiale.</p></aside></div></>}
          {screen === "exam" && attempt && current && <>
            <div className="exam-heading"><div><span className="eyebrow">SIMULAZIONE DELLO SCRITTO · DATI SINTETICI</span><h1>Concentrati su una domanda alla volta.</h1></div><div className={`timer ${remaining < 60 ? "urgent" : ""}`} role="timer" aria-label={`Tempo rimasto ${Math.floor(remaining / 60)} minuti e ${remaining % 60} secondi`}><Clock3 size={20} /><div><span>TEMPO RIMASTO</span><strong>{String(Math.floor(remaining / 60)).padStart(2, "0")}:{String(remaining % 60).padStart(2, "0")}</strong></div></div></div>
            <div className="exam-layout"><section className="question-panel panel"><div className="question-meta"><span className="question-number">DOMANDA {String(index + 1).padStart(2, "0")} <span>/ 30</span></span><span className="category-chip">{current.category}</span></div><div className="thin-progress"><span style={{ width: `${(index + 1) / 30 * 100}%` }} /></div><h2 ref={questionHeading} tabIndex={-1}>{current.text}</h2>{current.media.map(m => <img className="question-image" key={m.path} src={m.path} alt={m.alt} />)}<div className="answer-options" role="radiogroup" aria-label="Scegli una risposta">{current.options.map(option => <button key={option.id} role="radio" aria-checked={currentSelected.includes(option.id)} disabled={saving || !!pending || busy || remaining === 0} className={`answer-option ${currentSelected.includes(option.id) ? "selected" : ""}`} onClick={() => { void persist({ questionId: current.official_id, selected: [option.id], expectedVersion: attempt.answers[current.official_id]?.version ?? 0 }); }}><span className="option-label">{option.source_label}</span><span>{option.text}</span><span className="radio-circle">{currentSelected.includes(option.id) && <span />}</span></button>)}</div><div className="answer-actions"><button className="text-button muted" disabled={saving || !!pending || busy || remaining === 0 || !currentSelected.length} onClick={() => { void persist({ questionId: current.official_id, selected: [], expectedVersion: attempt.answers[current.official_id]?.version ?? 0 }); }}>Ometti la risposta</button><button className={`text-button ${flags.has(current.official_id) ? "flagged" : "muted"}`} onClick={() => setFlags(previous => { const next = new Set(previous); if (next.has(current.official_id)) next.delete(current.official_id); else next.add(current.official_id); return next; })}><Flag size={16} />{flags.has(current.official_id) ? "Segnalata per dopo" : "Riguarda dopo"}</button></div><div className={`save-status ${pending && !saving ? "unsaved" : ""}`} role="status">{saving ? <><LoaderCircle size={15} className="spin" />Salvataggio in corso…</> : pending ? <><XCircle size={15} />Risposta non confermata. <button onClick={() => { void persist(pending); }} disabled={!online || remaining === 0}>Riprova il salvataggio</button>{error.includes("altra scheda") && <button onClick={() => { void openAttempt(attempt.id).catch(handleError); }}>Ricarica lo stato</button>}</> : <><Check size={15} />{attempt.answers[current.official_id] ? "Risposta salvata" : "Puoi scegliere una risposta oppure lasciare in bianco"}</>}</div><div className="question-navigation"><button className="button secondary" disabled={index === 0 || saving || !!pending} onClick={() => setIndex(i => i - 1)}><ArrowLeft size={17} />Precedente</button>{index < 29 ? <button className="button primary" disabled={saving || !!pending} onClick={() => setIndex(i => i + 1)}>Successiva<ArrowRight size={17} /></button> : <button className="button primary" disabled={saving || !!pending || busy} onClick={() => setConfirmSubmit(true)}>Rivedi e consegna <Check size={17} /></button>}</div></section><aside className="exam-sidebar panel"><div className="section-heading"><h2>La tua prova</h2><span className="answered-count">{answered} / 30</span></div><p className="muted small">Puoi tornare a ogni domanda.</p><div className="question-grid">{attempt.questions.map((q, i) => <button key={q.official_id} aria-label={`Domanda ${i + 1}${attempt.answers[q.official_id]?.selected.length ? ", risposta salvata" : ", non risposta"}${flags.has(q.official_id) ? ", segnalata" : ""}`} aria-current={i === index ? "step" : undefined} className={`${attempt.answers[q.official_id]?.selected.length ? "answered" : ""} ${i === index ? "current" : ""} ${flags.has(q.official_id) ? "is-flagged" : ""}`} disabled={saving || !!pending} onClick={() => setIndex(i)}>{String(i + 1).padStart(2, "0")}{flags.has(q.official_id) && <span />}</button>)}</div><div className="grid-legend"><span><i className="legend-answered" />Risposta salvata</span><span><i className="legend-empty" />Da rispondere</span><span><Flag size={12} />Da riguardare</span></div><button className="button primary full" disabled={saving || (pending !== null && remaining > 0) || busy} onClick={() => setConfirmSubmit(true)}>Consegna la prova <ArrowRight size={16} /></button><p className="exam-help">Non c’è pausa. Puoi chiudere e riprendere: il tempo continuerà.</p></aside></div>
          </>}
          {screen === "report" && attempt?.result && <><PageHeading eyebrow="UN ALTRO PASSO FATTO" title="Ecco com’è andata." description="Un risultato per capire dove sei. Rivedi le risposte con calma." /><section className="report-summary panel"><div className={`result-emblem ${attempt.result.reached ? "passed" : ""}`}><Trophy size={32} /></div><div className="result-copy"><span className="section-label">IL TUO PUNTEGGIO</span><h2>{scoreText(attempt.result.cents)} <span>/ 30</span></h2><span className={`outcome-badge ${attempt.result.reached ? "passed" : ""}`}>{attempt.result.reached ? "Soglia raggiunta nella simulazione" : "Soglia non raggiunta nella simulazione"}</span><p>È un risultato di allenamento, non un esito ufficiale.</p></div><div className="result-counts"><div><CheckCircle2 size={18} /><strong>{attempt.result.correct}</strong><span>Esatte</span></div><div><XCircle size={18} /><strong>{attempt.result.wrong}</strong><span>Errate</span></div><div><span>—</span><strong>{attempt.result.omitted}</strong><span>Omesse</span></div></div></section><div className="report-meta"><span>{dateText(attempt.startedAt)} · {durationText(attempt.durationSeconds)} · {attempt.status === "expired" ? "Tempo scaduto" : "Consegnata"}</span><span>{attempt.bankVersion} · {attempt.rules.version}</span></div><div className="section-heading"><h2>Rivedi le tue risposte</h2><button className="button secondary" onClick={() => navigate("start")}>Nuova simulazione <ArrowRight size={16} /></button></div><div className="review-list">{attempt.questions.map((q, i) => { const item = attempt.result!.items[i], selected = attempt.answers[q.official_id]?.selected ?? []; return <details key={q.official_id} className="review-item panel"><summary><span className={`review-status ${item.outcome}`}>{item.outcome === "correct" ? <Check size={16} /> : item.outcome === "wrong" ? <X size={16} /> : "—"}</span><span className="review-number">{String(i + 1).padStart(2, "0")}</span><span className="review-title">{q.text}</span><span className={`review-outcome ${item.outcome}`}>{({ correct: "Esatta", wrong: "Errata", omitted: "Omessa" })[item.outcome]}</span><ChevronRight className="details-arrow" size={16} /></summary><div className="review-content">{q.media.map(m => <img className="question-image" key={m.path} src={m.path} alt={m.alt} />)}{q.options.map(o => <div key={o.id} className={`review-option ${o.id === item.correctOptionId ? "correct" : selected.includes(o.id) ? "wrong" : ""}`}><b>{o.source_label}</b><span>{o.text}</span>{o.id === item.correctOptionId && <span className="small">Risposta corretta</span>}{selected.includes(o.id) && <span className="small">La tua scelta</span>}</div>)}{item.explanation && <p className="explanation"><strong>Spiegazione del quesito sintetico</strong>{item.explanation}</p>}</div></details>; })}</div></>}
          {screen === "history" && <><PageHeading eyebrow="IL TUO ALLENAMENTO, NEL TEMPO" title="Ogni prova lascia un passo." description="Le simulazioni restano qui, insieme alle risposte e al punteggio." />{dashboard.attempts.length ? <HistoryList attempts={dashboard.attempts} onOpen={id => { void openAttempt(id).catch(handleError); }} /> : <div className="empty-state panel"><span className="empty-icon"><History size={24} /></span><div><strong>Ancora nessuna simulazione.</strong><p>Inizia una prova per costruire il tuo storico.</p></div><button className="button primary" onClick={() => navigate("start")}>Inizia <ArrowRight size={16} /></button></div>}</>}
          {screen === "rules" && <><PageHeading eyebrow="PRIMA DI COMINCIARE" title="Poche regole, tutte chiare." description="Le regole dello scritto e il funzionamento di questa versione privata." /><div className="rules-grid"><section className="panel rules-card"><span className="feature-icon"><BookOpen size={23} /></span><h2>Le regole dello scritto</h2><p>30 quesiti a risposta multipla. Una risposta esatta vale +1,00, una errata o multipla −0,33, una omessa 0,00. La soglia è 21,00 su 30.</p><p>Il bando fornito non specifica la durata. I tempi selezionabili sono provvisori e servono all’allenamento.</p><a className="text-button" href="https://www.sanitaserviceaslba.it/bandi_3.html" target="_blank" rel="noreferrer">Consulta le fonti ufficiali <ArrowRight size={16} /></a></section><section className="panel rules-card"><span className="feature-icon"><ShieldCheck size={23} /></span><h2>Questa versione privata</h2><p>La banca contiene quesiti generati per provare l’applicativo. Non è la banca ufficiale e non misura la tua preparazione reale sul concorso.</p><p>Gli account e i risultati sono conservati sul computer. Non ci sono pagamenti. Dopo tre avvii puoi ripristinare le prove dalla dashboard.</p><p>Un nuovo accesso allo stesso account termina la sessione del browser precedente.</p></section><section className="panel rules-card"><span className="feature-icon"><CheckCircle2 size={23} /></span><h2>Salvataggio e ripresa</h2><p>Una risposta è registrata quando compare “Risposta salvata”. Se perdi la connessione, riprova il salvataggio prima della scadenza.</p><p>Puoi ricaricare o chiudere la pagina. Riprendendo ritroverai le scelte confermate e il timer originale. Alla scadenza la prova termina automaticamente.</p></section><section className="panel rules-card"><span className="feature-icon"><Sparkles size={23} /></span><h2>I prossimi passi</h2><p>Studio per materia, ripasso mirato, configurazione Supabase e pagamenti di prova verranno integrati nei passaggi successivi.</p><p>Questa prima versione verifica il percorso essenziale: accesso, simulazione, ripresa e report.</p></section></div></>}
        </>}
        <footer className="page-footer"><span>preparati. · Uno spazio per fare progressi.</span><span>Prova privata · Preparazione indipendente</span></footer>
      </main>
    </div>
    {confirmSubmit && attempt && <div className="modal-backdrop" onClick={() => !busy && setConfirmSubmit(false)}><section className="confirm-dialog panel" role="dialog" aria-modal="true" aria-labelledby="confirm-title" onClick={e => e.stopPropagation()}><span className="feature-icon"><CheckCircle2 size={27} /></span><h2 id="confirm-title">Consegniamo la prova?</h2><p>Hai risposto a <strong>{answered} domande</strong>. Le altre <strong>{30 - answered}</strong> saranno considerate omesse.</p>{pending && <p className="alert warning">Una modifica non è confermata: valgono solo le risposte salvate.</p>}<p className="muted">Dopo la consegna vedrai il punteggio e non potrai cambiare le risposte.</p><div className="dialog-actions"><button autoFocus className="button secondary" disabled={busy} onClick={() => setConfirmSubmit(false)}>Torna alle domande</button><button className="button primary" disabled={busy || saving} onClick={() => { void submit(); }}>{busy ? <LoaderCircle size={16} className="spin" /> : <Check size={16} />}Conferma consegna</button></div></section></div>}
  </div>;
}

function PageHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <section className="page-intro compact"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div></section>;
}
function Metric({ icon: Icon, label, value, suffix, note }: { icon: typeof Play; label: string; value: string; suffix?: string; note: string }) {
  return <div className="metric panel"><div className="metric-top"><span>{label}</span><span className="metric-icon"><Icon size={18} /></span></div><div className="metric-value">{value}<span>{suffix}</span></div><p>{note}</p></div>;
}
function HistoryList({ attempts, onOpen }: { attempts: DashboardView["attempts"]; onOpen: (id: string) => void }) {
  return <div className="history-list panel">{attempts.map(a => <button key={a.id} className="history-row" onClick={() => onOpen(a.id)}><span className="history-icon">{a.status === "in_progress" ? <Clock3 size={21} /> : <BookOpen size={21} />}</span><span className="history-copy"><strong>Simulazione dello scritto</strong><small>{dateText(a.startedAt)} · {durationText(a.durationSeconds)} · dati sintetici</small></span><span className={`history-outcome ${a.result?.reached ? "passed" : ""}`}>{a.status === "in_progress" ? "Da riprendere" : a.result?.reached ? "Soglia raggiunta" : "Da migliorare"}</span><span className="history-score">{a.result ? scoreText(a.result.cents) : "—"}<small>/ 30</small></span><ChevronRight size={18} /></button>)}</div>;
}
