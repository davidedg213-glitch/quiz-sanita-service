"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="error-screen"><h1>La prova non è disponibile in questo momento.</h1><p>Le risposte confermate sono conservate. Riprova a caricare la pagina.</p><button className="button primary" onClick={reset}>Riprova</button></main>;
}
