# Preparati - prima versione privata

Versione 0.1.0, 14 ottobre 2026. Primo percorso funzionante del progetto, con quesiti sintetici e archivio locale. Il nome "Preparati" è provvisorio.

## Provala

1. Dalla cartella principale fai doppio clic su **Avvia prova privata.cmd**.
2. Attendi l'apertura del browser. L'indirizzo è `http://127.0.0.1:3000`.
3. Crea un account di prova con credenziali dedicate. L'email è un identificativo locale: non viene inviata né verificata.
4. Avvia una simulazione. Puoi scegliere 30 o 45 minuti di allenamento, oppure 2 minuti per verificare la scadenza.
5. Rispondi, ricarica la pagina e controlla che scelta e timer siano conservati. Consegna e apri il dettaglio delle risposte.

Lascia aperta la finestra di avvio. Per terminare l'app usa Ctrl+C in quella finestra. Se la prova è già avviata, il file riapre il suo indirizzo. In caso di porta 3000 occupata da un altro programma non lo termina automaticamente.

Ogni account ha tre avvii. Dopo averli usati puoi scegliere **Ripristina prove locali** nella dashboard. Questa funzione è esclusiva della prova: non rappresenta la futura offerta commerciale. Gli account usati nel collaudo sono distinti da quello che creerai.

## Cosa funziona

- Registrazione e login locali, password conservate come hash con salt; logout e una sessione autorizzata per account.
- Banca sintetica di 1.500 quesiti, alternative da 2 a 6, una figura e spiegazioni sintetiche.
- Estrazione casuale uniforme di 30 quesiti distinti, senza mostrare chiavi prima della consegna.
- Avvio atomico, tre prove, retry dell'avvio e ripresa dello stesso tentativo senza doppio consumo.
- Timer autorevole sul server, aggiornamento del conteggio sul browser e scadenza anche senza pagina aperta mentre il server funziona.
- Salvataggio persistente con versioni; gestione conflitti e retry, omissione e consegna unica.
- Punteggio esatto in centesimi, penalità di -0,33 e soglia 21,00; supporto a risultati negativi.
- Report con esatte/errate/omesse, revisione risposte e storico personale.
- Importazione JSON sintetico, controlli strutturali e media, versioni immutabili, attivazione e rollback da procedura locale.
- Interfaccia responsive, avvisi sui dati sintetici e tempi provvisori, dialogo di consegna con gestione del focus.

Le domande servono a verificare il prodotto. Non costituiscono materiale ufficiale né una valutazione attendibile della preparazione al concorso.

## Cosa manca ancora

Autenticazione Supabase con verifica email e recupero password, PostgreSQL online e relative politiche, pagamenti di test, diritto premium/scadenza, studio per materia, ripasso, amministrazione visuale, supporto, backup operativo, documenti commerciali e banca ufficiale. Questa versione non supera ancora il gate G1 del piano e non è pronta per la vendita.

La prova ascolta solo sull'indirizzo di loopback; le API rifiutano host estranei e scritture da origine diversa. Non pubblicare questa modalità su hosting esterno. Il reset delle prove, cookie su HTTP locale e identità non verificata devono essere sostituiti/limitati prima di una prova online. L'archivio locale non è un adapter Supabase già completo: la migrazione e l'integrazione provider restano un passaggio esplicito.

## Preparazione e comandi per lo sviluppo

Requisiti: Node.js 24.14 o superiore, npm, Windows per il file di avvio. Su questa macchina le dipendenze sono già installate. Dal percorso `web`:

```text
npm ci
npm run bank:generate
npm run test
npm run typecheck
npm run build
npm run start
```

Per modificare l'app con ricaricamento automatico: `npm run dev`. Fermare il server di sviluppo prima della build e dell'avvio compilato. Dopo una modifica, eseguire nuovamente `npm run build`: il file di avvio usa la build già presente se disponibile.

Webpack è selezionato per compatibilità con l'esecuzione locale Windows verificata. Lockfile incluso. Nel contesto limitato di un agente, build/server possono richiedere l'autorizzazione dell'ambiente a creare processi; ciò non richiede di acquistare servizi.

Le variabili sono descritte in `.env.example`. `APP_MODE` ammette solo `private-local` in questa versione. `QUIZ_DB_PATH` permette di scegliere un archivio alternativo per test isolati. Dati account e risultati in `.data/quiz.sqlite`, esclusi dal controllo versione. Non eliminare l'archivio se vuoi conservare i risultati.

SQLite integrato in Node è segnalato come sperimentale nel runtime usato: qui è uno strumento di prova locale, non la scelta per la produzione. Fonte: [Node.js SQLite](https://nodejs.org/api/sqlite.html). Per Next.js sono state consultate anche la documentazione inclusa nel pacchetto e [le istruzioni ufficiali](https://nextjs.org/docs/app/getting-started/installation).

## Controlli HTTP

Con il server già avviato:

```text
npm run test:api
```

Il controllo crea account con indirizzi `example.invalid`, verifica le risposte HTTP reali e salva `.data/api-test-report.json`. Non stampa né salva nel report password o token. Sono dati del solo ambiente di prova.

## Importazione sintetica

```text
npm run bank:check -- fixtures/demo-bank.json
npm run bank:import -- fixtures/demo-bank.json
npm run bank:list
npm run bank:activate -- ID_DELLA_BANCA
```

L'importazione non attiva automaticamente un nuovo file: prima controllalo, poi scegli l'ID. Per un rollback attiva l'ID precedente. La banca iniziale è importata e attivata alla prima apertura. Una versione esistente con contenuto diverso viene respinta; usare una nuova versione. Il formato di questa fase accetta solo quesiti sintetici dichiarati come demo: l'abilitazione dei contenuti ufficiali richiederà il flusso di revisione previsto dal piano.

## Struttura

`src/domain`: formato banca e punteggio; `src/server`: archivio/transazioni e schema locale; `src/app/api`: autorizzazioni e operazioni; `src/components`: interfaccia; `scripts`: generazione/importazione/collaudo; `fixtures`: dati sintetici; `tests`: test dominio e archivio.

Stato e verifiche: [registro di avanzamento](../docs/realizzazione/01_prima_versione_privata.md). Specifica generale: [piano](../docs/pianificazione/README.md).
