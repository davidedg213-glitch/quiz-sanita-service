# 02 - Specifica del prodotto e dei percorsi utente

Tutte le regole di prodotto qui definite sono proposte di lavoro salvo i punti confermati nel README e i vincoli B01-B12 di 01. Prezzo e scadenza devono essere fissati prima di aprire gli acquisti.

## 1. Prima versione ed evoluzioni

**P0, prima versione:** sito informativo; registrazione con email e password; verifica email e recupero password; tre simulazioni gratuite; pagamento unico con Stripe; una sessione autorizzata per account; simulazione scritto; studio per materia; ripasso errori; report e storico essenziali; supporto; account e diritti privacy; pannello amministrativo minimo; importazione versionata; monitoraggio e backup.

**P1:** preferiti, ricerca nell'archivio, statistiche temporali più ricche, spiegazioni editoriali verificate, login Google, miglioramenti di installabilità PWA. Aggiungere solo dopo stabilizzazione o se non mette a rischio la preparazione prima della banca.

**P2:** piano di studio personalizzato, ripetizione dilazionata, altri concorsi, esercizi per orale, secondo gateway se richiesto dal mercato. Non sono necessari al lancio.

Il primo prodotto funziona online nel browser. App native, community, classifiche pubbliche, chat con IA e simulazione offline completa non fanno parte del lancio. Nessuna chiamata IA per ogni risposta: costi, velocità e correttezza favoriscono contenuti già verificati.

## 2. Utenti, stati e permessi

| Profilo | Permessi |
| --- | --- |
| Visitatore | Leggere offerta, regole, fonti, FAQ, prezzo e documenti; registrarsi |
| Registrato con email non verificata | Verificare email, cambiare recapito con controllo, chiedere assistenza; non avviare prove o acquistare |
| Gratuito verificato | Avviare fino a tre prove complete, rivedere i propri report e acquistare |
| Accesso acquistato e valido | Simulazioni illimitate nel periodo, studio e ripasso, storico e statistiche |
| Accesso scaduto o revocato | Consultare account, acquisti, report già acquisiti nel periodo di conservazione e supporto; niente nuovi quiz premium |
| Account sospeso | Percorso di supporto e gestione dati secondo policy; operazioni didattiche bloccate |
| Amministratore | Configurazione, contenuti, gestione diritti e segnalazioni, accesso ai dati strettamente necessario |
| Operatore supporto, se introdotto | Vedere stato acquisto e tentativi, gestire ticket e ripristini autorizzati; niente chiavi risposte o ruoli amministrativi |

Un unico amministratore può inizialmente coprire più funzioni con MFA. Ogni azione sensibile resta registrata. Il flag PREMIUM visualizzato è derivato da un diritto di accesso valido, non modificabile dal browser.

## 3. Politica gratuita proposta

- Tre simulazioni per account verificato e per questo concorso, non tre al giorno.
- Conteggio al momento dell'avvio effettivo, dopo conferma dell'utente e creazione atomica del tentativo sul server. Anteprima delle regole e visita della pagina non consumano prove.
- Ricaricare o riprendere lo stesso tentativo non consuma una seconda prova.
- Abbandono volontario o tempo scaduto consumano la prova iniziata. Dirlo prima dell'avvio; evitare "tre completate" se quelle abbandonate vengono conteggiate.
- Se la creazione fallisce prima di mostrare un tentativo valido, non addebitare la prova. Guasti documentati dopo l'avvio consentono un accredito manuale motivato, non un rimborso automatico senza controllo.
- Una prova attiva per account e concorso: un secondo avvio restituisce la prova da riprendere.
- Dopo tre prove, storico e account restano consultabili. Nuove simulazioni, studio completo e ripasso sono sbloccati dall'acquisto.
- Ripristino o creazione di nuovi account non deve diventare una politica di profilazione invasiva. Verifica email, limiti di frequenza e controlli proporzionati sono la protezione iniziale; non promettere l'eliminazione totale degli abusi.

Demo prima dell'uscita della banca: eventuali quesiti sintetici devono avere etichetta evidente, essere separati e non consumare le tre prove ufficiali. Per semplicità la proposta iniziale è una pagina informativa con apertura delle prove gratuite solo dopo validazione dei dati ufficiali.

## 4. Validità dell'acquisto

Un pagamento concede accesso al concorso identificato, fino a una data e ora visibili prima dell'acquisto e nel profilo. Proposta: validità almeno fino alla fine dell'ultimo turno scritto ufficialmente previsto, con un margine dichiarato. Non usare il 18 novembre come scadenza unica finché l'ultimo turno è ignoto.

Se si apre prima di conoscere tutti i turni, servono una data minima garantita e una regola contrattuale chiara di proroga fino alla conclusione delle prove; l'amministratore estende i diritti secondo gli avvisi. Eventuali rinvii non accorciano un diritto già venduto. Conservare la versione delle condizioni accettate per ciascun ordine.

Alla scadenza, niente nuovi tentativi. Per quelli già partiti con diritto valido, proposta: lasciarli terminare entro la propria scadenza, senza creare altri tentativi. Revoca per sicurezza o frode può bloccare anche un tentativo attivo, con messaggio e gestione supporto. Periodo consultazione dei report distinto dalla validità di esercitazione.

## 5. Mappa delle schermate

| ID | Schermata | Contenuti e stati necessari |
| --- | --- | --- |
| U01 | Home e offerta | Concorso, funzioni, tre prove, prezzo, scadenza, servizio indipendente, disponibilità banca |
| U02 | Informazioni concorso | Regole con fonte/data, parametri provvisori, link ufficiali, scritto/orale distinti |
| U03 | Registrazione e verifica | Email, password, condizioni, informativa, invio/rinvio verifica, errori leggibili |
| U04 | Login e recupero | Credenziali, recupero, link scaduto, avviso accesso da altro dispositivo |
| U05 | Dashboard | Prove residue o validità, riprendi, nuova prova, studio, ultimi risultati; stato senza dati |
| U06 | Avvio esame | Numero, timer e sua provenienza, punteggi, consumo gratuito, regole su connessione, conferma |
| U07 | Svolgimento | Domanda, opzioni, precedente/successiva, griglia 30 domande, segnala per ritorno, ometti, timer, salvataggio |
| U08 | Consegna | Esatte non ancora rivelate; numero risposte e omissioni; conferma invio; stato invio in corso |
| U09 | Report | Punteggio, soglia simulata, conteggi, durata, versione banca/regole, risposte e fonti, segnalazione errore |
| U10 | Studio | Materia, quantità, correzione immediata, risposta ufficiale e spiegazione se presente |
| U11 | Ripasso | Errori e omissioni da ripetere, elenco vuoto comprensibile, passaggio ai quesiti correnti |
| U12 | Storico e statistiche | Elenco tentativi, filtro modalità, andamento semplice, valori numerici oltre al grafico |
| U13 | Acquisto | Prezzo totale, accesso/scadenza, condizioni, checkout esterno, già acquistato, annullato, in verifica |
| U14 | Profilo e acquisti | Stato, validità, email, password, ricevute, esportazione/cancellazione, logout |
| U15 | Aiuto e segnalazioni | FAQ, contatto e tempi comunicati, ID ticket, problema quesito/pagamento/sessione |
| U16 | Documenti | Privacy, cookie, condizioni, venditore, recesso e rimborsi |
| A01 | Amministrazione | Stato servizio/banca, importazione e anomalie, versioni e approvazioni |
| A02 | Gestione utenti e ordini | Ricerca minima, stato provider, diritti, accrediti gratuiti, rimborsi con audit |
| A03 | Configurazione e assistenza | Regole, avvisi, scadenza, segnalazioni, manutenzione, controlli operativi |

Prima di costruire componenti realizzare schemi delle schermate U01, U05-U10, U13 e A01, con percorso da smartphone; gli altri possono condividere layout. Ogni pagina deve prevedere caricamento, vuoto, errore, autorizzazione negata e retry quando possibile.

## 6. Percorsi principali

**Primo accesso:** offerta → registrazione → verifica email → dashboard → regole → conferma avvio → quiz → consegna → report. La verifica non perde la pagina di destinazione e non iscrive a marketing.

**Acquisto:** dashboard o limite gratuito → riepilogo → checkout → pagamento → verifica lato server → accesso attivo. Se l'utente chiude il browser dopo aver pagato, lo sblocco deve avvenire comunque. Se la notifica tarda, mostrare "Pagamento in verifica" con aggiornamento e supporto, senza invitare subito a pagare di nuovo.

**Ripresa:** login → tentativo in corso → stesse domande e risposte confermate, timer originale. Connessione ristabilita dopo il termine → report del tentativo scaduto, non ripartenza.

**Cambio dispositivo:** nuovo login → avviso sull'altra sessione → vecchio dispositivo non può più leggere/scrivere dati protetti; il nuovo può riprendere la prova senza pausa o reset del timer. Il salvataggio non confermato sul vecchio dispositivo non è garantito: comunicarlo.

**Errore in una domanda:** report → segnalazione con quesito/versione e descrizione → ticket → revisione → eventuale nuova versione e comunicazione. Non sovrascrivere in silenzio i risultati precedenti.

## 7. Regole della modalità esame

R01: estrarre 30 quesiti distinti dalla banca approvata e attiva. Ripetizioni fra prove diverse consentite. Se meno di 30 utilizzabili, bloccare l'avvio senza consumare la prova.

R02: estrazione iniziale uniforme fra i quesiti idonei; nessuna quota arbitraria per categoria. Uno studio bilanciato eventualmente aggiunto usa un nome diverso. Se istruzioni ufficiali definiscono quote, pubblicare una nuova configurazione.

R03: conservare l'ordine ufficiale delle alternative inizialmente. Rimescolare solo dopo verifica di riferimenti come "tutte le precedenti" e scelta esplicita; salvare sempre l'ordine effettivamente mostrato. Gli identificativi delle opzioni sono stabili, indipendenti da A/B/C.

R04: una scelta per domanda, modificabile fino alla consegna. "Ometti" cancella la selezione confermata; nessuna scelta precompilata. Navigare non equivale a rispondere.

R05: durata configurabile. Prima del tempo ufficiale, proposta 30 minuti con dicitura "tempo di allenamento provvisorio"; consentire scelta di durate didattiche, marcando i risultati. Nessuna pausa in esame; non inventare equivalenza con la prova reale.

R06: tempo autorevole del server, con inizio e scadenza persistenti. Refresh, sospensione del telefono, altre schede o modifica dell'orologio non estendono il termine.

R07: salvataggio dopo ogni modifica, con stato "salvata" solo dopo conferma server. Se manca rete, mostrare avviso, conservare la modifica in memoria e riprovare solo se il termine non è scaduto. Non valutare risposte tardive usando la data dichiarata dal dispositivo. Al termine valgono le ultime risposte confermate.

R08: consegna manuale confermata o automatica a scadenza. La finalizzazione è unica anche con doppio clic, retry o processo automatico; il report restituito è sempre lo stesso.

R09: non mostrare correttezza, soluzioni, spiegazioni o punteggio durante l'esame, anche nelle risposte delle interfacce tecniche. Numero di domande risposte e tempo rimasto sono visibili.

R10: contare esatte, errate/multiple e omesse, totale 30. Calcolare `score_centesimi = 100 * esatte - 33 * errate_o_multiple`; soglia `>= 2100`. Mostrare due decimali con virgola. Non sostituire 0,33 con un terzo e non arrotondare ogni passaggio con numeri floating point.

R11: senza diversa regola ufficiale, la formula consente valori fino a -9,90 per 30 errate. Non applicare un minimo zero arbitrario. Il report deve indicare "Soglia raggiunta/non raggiunta nella simulazione", non attribuire idoneità ufficiale.

R12: il tentativo conserva banca, regole, durata, domande e opzioni della propria versione. Correzioni future non modificano l'esame in corso; una rettifica grave può richiedere invalidazione esplicita e assistenza.

## 8. Studio e ripasso

Lo studio permette materia e numero di quesiti entro i limiti configurati; seleziona quesiti approvati. In una sessione non ripete lo stesso quesito. Se la materia contiene meno quesiti della quantità richiesta, informa e propone la quantità disponibile, senza duplicare silenziosamente.

Dopo la conferma di risposta nello studio mostrare soluzione e spiegazione verificata se disponibile. La prima risposta confermata è quella usata per le statistiche della sessione; eventuale ripetizione della stessa domanda non riscrive il primo risultato. Quantità e modalità diverse non entrano nella curva dei punteggi d'esame come se fossero prove di 30 domande.

Ripasso P0: coda di quesiti con ultima risposta errata o omessa; una risposta corretta in una nuova esercitazione può toglierli dalla coda, mantenendo lo storico. Usare il quesito della versione attuale: se rimosso o modificato in modo incompatibile, segnalarlo o escluderlo. P1 può richiedere due successi distanziati, ma non è la regola iniziale.

Le categorie sono editoriali se non fornite ufficialmente. La classificazione non altera domanda, opzioni o risposta. Fino alla revisione una categoria può essere "Da classificare"; non bloccare simulazioni corrette perché una tassonomia è incompleta.

## 9. Statistiche e definizioni

| Indicatore | Definizione |
| --- | --- |
| Punteggio e andamento | Solo prove esame finalizzate; indicare durata, banca e configurazione per confronti |
| Esattezza per materia | Esatte / totale quesiti valutati della materia, comprese omissioni; mostrare numeratore e denominatore |
| Accuratezza sulle risposte date, eventuale P1 | Esatte / (esatte + errate); etichetta diversa dal precedente indicatore |
| Copertura banca | Quesiti distinti affrontati / quesiti attivi della versione, senza contare due volte ripetizioni |
| Soglia raggiunta | Prove esame con almeno 21,00 / prove esame valutate nel periodo |
| Tempo | Durata effettiva del tentativo; non dedurre tempo per domanda senza misurazione affidabile |

Separare dati sintetici, studio, esame, tentativi invalidati e versioni di banca diverse. "Ultime 10 prove" è una sintesi proposta, non una previsione di successo. Senza dati mostrare invito a iniziare, non uno 0% che sembri un giudizio.

## 10. Accessibilità e linguaggio

Testo italiano chiaro; contrasto, dimensioni e zoom adeguati; pulsanti utilizzabili col dito; intera navigazione da tastiera; etichette per lettori di schermo; stato non espresso dal solo colore; timer annunciato a intervalli utili senza lettura continua; focus corretto in modali. Obiettivo progettuale: WCAG 2.2 AA, senza dichiarare conformità prima dell'audit. Riferimento: [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/), consultato il 14 ottobre 2026.

Eventuali adattamenti didattici del tempo sono etichettati e distinti dalle impostazioni ufficiali. Non richiedere certificati medici per offrire una durata di allenamento personalizzata. La verifica degli obblighi di accessibilità applicabili al venditore è inclusa in 05.
