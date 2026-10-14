# Progetto: Web App Simulatore d'Esame - Concorso Sanitaservice ASL BA

## 1. Visione del Progetto e Obiettivo
Sviluppare una Web App reattiva, moderna e responsiva per la preparazione dei candidati al concorso pubblico **Sanitaservice ASL BA S.r.l.** (125 posti per Pulitore/Ausiliario - Cat. A). 
La piattaforma consente agli utenti di esercitarsi sulla banca dati ufficiale di 1.500 quesiti, offrendo una simulazione fedele alla prova d'esame reale e statistiche dettagliate sull'andamento del punteggio.

---

## 2. Specifiche del Concorso (Estratte dal Bando)
Tutte le regole di valutazione della piattaforma devono rispecchiare rigorosamente le direttive dell'Art. 6 del bando:
* **Banca Dati:** 1.500 quesiti a risposta multipla pubblicati 20 giorni prima della prova.
* **Composizione Prova:** 30 quesiti estratti casualmente o per materia (cultura generale, mansione, ragionamento logico-numerico, deduttivo e verbale).
* **Sistema di Punteggio:**
  * Risposta Esatta: **+1,00 punto**
  * Risposta Omessa/Non data: **0,00 punti**
  * Risposta Errata o Multipla: **-0,33 punti**
* **Soglia di Superamento Prova Scritta:** Punteggio minimo **21,00 / 30,00**.
* **Tempo Prova (Simulazione d'Esame):** Valore standard configurabile (es. 30 o 45 minuti).

---

## 3. Requisiti di Business e Modello di Monetizzazione
* **Modello a Pagamento Unico (One-Time Fee):** Nessun abbonamento ricorrente. L'utente paga un importo una tantum (es. 9,99 € o 14,99 €) che garantisce l'accesso illimitato a tutte le funzionalità della piattaforma fino al giorno dello svolgimento della prova concorsuale.
* **Modello Freemium (Prova Gratuita):**
  * Ogni utente registrato ha diritto a **3 simulazioni d'esame gratuite complete**.
  * Raggiunto il limite di 3 simulazioni, il sistema blocca l'accesso alle modalità di simulazione/esercitazione avanzata e mostra un modal con invito all'acquisto (paywall).
* **Integrazione Pagamenti:** 
  * Gateway di pagamento: **Stripe** (carte di credito, Apple Pay, Google Pay) e/o **PayPal**.
  * Sblocco automatico e immediato dell'account tramite Webhook a pagamento confermato.

---

## 4. Architettura Tecnica Integrata

### 4.1. Stack Tecnologico Consigliato
* **Frontend:** React / Next.js oppure Vue.js / Nuxt.js (Web App reattiva, PWA-ready per installazione su smartphone).
* **Styling:** Tailwind CSS per un'interfaccia utente moderna e responsiva.
* **Backend & Database:** Node.js (Express) o Supabase / Firebase per una rapida gestione di autenticazione, database e pagamenti.
* **Database:** PostgreSQL o MongoDB.

### 4.2. Gestione Sessione e Limitazione Dispositivi Contemporanei
Per prevenire l'uso improprio o la condivisione illegittima dello stesso account a pagamento tra più persone:
* **Single Active Session Token:** All'accesso di un utente, viene generato e salvato un token di sessione univoco (JWT o ID sessione) nel database del profilo utente.
* **Invalidation Mechanism:** Se l'utente effettua l'accesso da un secondo dispositivo/browser, il token memorizzato sul server viene aggiornato, invalidando automaticamente la sessione attiva sul primo dispositivo e disconnettendolo.

---

## 5. Funzionalità della Web App

### 5.1. Autenticazione & Profilo
* Registrazione/Login tramite Email + Password o Social Login (Google).
* Tracciamento dello stato utente: `FREE` (Simulazioni residue: X/3) oppure `PREMIUM` (Accesso Illimitato).

### 5.2. Motore di Simulazione & Esercitazione
1. **Modalità Esame Reale:**
   * 30 domande estratte in modo casuale bilanciato.
   * Timer con conto alla rovescia visible.
   * Calcolo in tempo reale del punteggio con applicazione delle penalità (-0,33).
   * Report finale: Esito ("Ammesso alla prova orale" se $\ge 21$, "Inidoneo" se $< 21$), dettaglio delle risposte e spiegazioni.
2. **Modalità Studio / Esercitazione per Materia:**
   * Filtro per materia (Logica, Cultura Generale, Mansione).
   * Correzione immediata dopo ogni risposta.
   * Archivio domande errate per ripasso mirato.

### 5.3. Dashboard & Statistiche Utente
* Grafico dell'andamento dei punteggi nel tempo.
* Percentuale di risposte esatte per singola materia per identificare i punti deboli dell'utente.

---

## 6. Workflow Importazione Banca Dati

```
[ PDF / Portale Ufficiale ] 
        │
        ▼ (Parser Python / Script Extraction)
[ Dataset Strutturato (JSON / CSV) ]
        │
        ▼ (Seed Script)
[ Database PostgreSQL / MongoDB ]
```

### Struttura Schema Tabella `Questions`:
```json
{
  "id": "uuid",
  "category": "Cultura Generale / Logica / Mansione",
  "question_text": "Testo della domanda...",
  "options": [
    {"label": "A", "text": "Opzione A"},
    {"label": "B", "text": "Opzione B"},
    {"label": "C", "text": "Opzione C"},
    {"label": "D", "text": "Opzione D"}
  ],
  "correct_option": "A",
  "explanation": "Spiegazione facoltativa della risposta corretta"
}
```

---

## 7. Roadmap Operativa di Sviluppo

1. **Fase 1: Setup Progetto & Database** (Configurazione ambiente, schema dati, auth).
2. **Fase 2: Motore d'Esame & Calcolo Punteggi** (Logica quiz, timer, calcolo -0.33, gestione limite 3 test gratuiti).
3. **Fase 3: Integrazione Pagamenti & Limiti Sessione** (Stripe Webhook, gestione token sessione univoco per dispositivo).
4. **Fase 4: Parser Banca Dati & Popolamento** (Script di estrazione al momento del rilascio della banca dati ufficiale).
5. **Fase 5: Testing, UI Polish & Deploy** (Deploy su Vercel/Netlify/DigitalOcean).

---

## 8. Istruzioni per Agenti AI e Sviluppatori
Quando un agente AI o uno sviluppatore lavora su questo progetto, deve rispettare le seguenti direttive:
1. **Calcolo Punteggi:** Utilizzare la formula esatta `Punteggio = (Esatte * 1) - (Errate * 0.33) + (Omesse * 0)`.
2. **Sicurezza Pagamento:** Non memorizzare dati di carte di credito sui server locali; fare affidamento esclusivo agli SDK Stripe/PayPal.
3. **Gestione Limiti:** Verificare sempre lato server (e non solo frontend) se l'utente ha ancora simulazioni gratuite disponibili o se l'account è `PREMIUM`.
4. **Interfaccia:** Mantenere un design pulito, accessibile e responsive (mobile-first), in quanto la maggior parte degli utenti si eserciterà da smartphone.