# Primo traguardo - versione privata locale

14 ottobre 2026. Versione 0.1.0. Il nome "Preparati" è provvisorio.

## Risultato

È disponibile un primo applicativo locale con il percorso registrazione → dashboard → avvio → 30 domande → timer/salvataggio → consegna → report/storico. La banca contiene 1.500 quesiti sintetici. Nessun acquisto o pubblicazione esterna è stato effettuato.

Per aprirlo: doppio clic su [Avvia prova privata.cmd](../../Avvia%20prova%20privata.cmd) dalla cartella principale, oppure segui [la guida](../../web/README.md). Crea un account dedicato al test. I dati rimangono nell'archivio locale e persistono fra riavvii.

## Scelta temporanea

Next.js/React/TypeScript e Tailwind sono impostati. Per provare subito senza credenziali e servizi esterni, identità e dati sono gestiti con un archivio SQLite locale. Supabase/Auth e PostgreSQL rimangono la destinazione prevista, ma non sono ancora collegati: l'adapter, le migrazioni e le politiche online sono attività reali da completare, non configurazioni già verificate.

La prova ascolta su `127.0.0.1`, non sulla rete esterna. I quesiti e gli account sono di test, le email non sono verificate e non vengono inviate, non esiste ancora una vendita. Il ripristino delle tre prove è consentito esplicitamente solo in questa modalità. La password è conservata come hash con salt e il token di sessione come hash, con controllo della sessione corrente su ogni operazione protetta.

## Avanzamento rispetto al piano

| Area | Stato attuale | Passaggio ancora necessario |
| --- | --- | --- |
| T11 - Progetto e versioni | Repository Git locale inizializzato, dipendenze bloccate, TypeScript, test e build | CI remota e commit/repository remoto quando concordati |
| T12 - Ambienti | Ambiente locale separato, dati ignorati dal controllo versione | Ambienti Supabase di prova e produzione |
| T13-T14 - Formato e dataset | Contratto JSON demo e 1.500 quesiti con alternative variabili/figura | Adattamento ai materiali ufficiali e loro media |
| T15-T16 - Dati e proprietà | Schema/migrazione SQLite, vincoli, transazioni, accesso per proprietario | PostgreSQL, politiche RLS e verifica provider |
| T17-T18 - Accessi | Registrazione/login/logout locali e sessione autorizzata unica | Verifica email, recupero, provider Auth e sicurezza online |
| T19-T20 - Banca | Validazione, importazione idempotente, versioni, attivazione/rollback da procedura locale | Amministrazione visuale e approvazione editoriale/ufficiale |
| T21-T27 - Simulazione | Motore e percorso locale funzionanti, punteggi, timer, salvataggio, ripresa e report | Estensione e collaudo su database online, carico e rete reale |
| T30 - Dashboard/storico | Conteggi e media essenziali, elenco report | Statistiche per materia/copertura e confronto per configurazione |
| T28-T29 - Studio/ripasso | Non ancora implementati | Prossimo blocco funzionale |
| T33-T42 - Vendita/gestione | Non ancora implementati | Pagamenti di test, diritti, amministrazione, supporto e documenti |

Questa consegna copre un primo traguardo, non l'intero G1. Le funzioni descritte come future nelle schermate non sono presentate come già utilizzabili.

## Verifiche

- 26 test di dominio e archivio: punteggi al centesimo, casi soglia/negativi, formato, media, sessione unica, proprietà, avvio idempotente, quote, conflitti, deadline, finalizzazione, regole congelate, importazione/rollback e persistenza dopo riapertura.
- Controllo TypeScript senza errori.
- Build ottimizzata Next.js completata; Webpack selezionato per compatibilità locale.
- 18 controlli HTTP reali: registrazione/cookie, richieste anonime, origine, input, soluzioni private, salvataggi, ripresa, proprietà, revoca, conflitti, consegna, reset demo e logout. Report tecnico in `web/.data/api-test-report.json`, escluso da Git.
- Prova manuale nel browser: creazione account, simulazione, scelta salvata, ricaricamento con stessa scelta e timer, consegna con 1 esatta + 1 errata + 28 omesse = 0,67.
- Timer breve di 2 minuti scaduto automaticamente: report con 30 omesse e 0,00, stato "Tempo scaduto".
- Controllo viewport da telefono a 360 px: nessun overflow orizzontale nelle schermate esaminate di avvio, svolgimento e report.

La verifica a viewport ridotta non sostituisce un collaudo su Android/iPhone reali. Non sono ancora eseguiti test di carico, audit WCAG completo, integrazione Supabase/Stripe, backup operativo o verifiche legali/commerciali. I test eseguiti non certificano la futura produzione.

## Prossimo blocco consigliato

Prima raccogliere il feedback sulla prima prova; poi aggiungere studio per materia e ripasso sullo stesso contratto dei quesiti. Per la fase online preparare progetto Supabase di prova, credenziali nelle variabili d'ambiente, schema PostgreSQL, verifica email/recupero e test di isolamento; non inserire chiavi nelle chat o nei file versionati. Pagamenti arriveranno in modalità test dopo che accessi e diritti sono collegati.

## Limiti intenzionali della prima versione

La banca è volutamente semplificata, con molti quesiti numerici generati: serve a collaudare il software, non a coprire il programma reale. Le segnalazioni "Riguarda dopo" restano nella pagina corrente e non sono ancora persistenti. Il report conserva domande, risposte e regole del tentativo; la media nella dashboard è una sintesi delle prove demo, non un indicatore di preparazione ufficiale.

Se il server viene spento, le deadline rimangono registrate e alla riapertura i tentativi scaduti vengono finalizzati; non si ripristina il tempo residuo che è trascorso durante lo spegnimento. Le nuove risposte non confermate non sono garantite in caso di chiusura della pagina o mancanza di rete. Nessuna logica di pagamento è simulata come se fosse già funzionante.
