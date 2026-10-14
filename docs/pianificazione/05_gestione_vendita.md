# 05 - Vendita, assistenza e gestione del servizio

Le attività di questo capitolo vanno preparate insieme all'applicativo. Il lancio rapido dopo la banca dati richiede che identità del venditore, pagamenti, documenti e contatti siano già pronti.

## 1. Offerta commerciale

Pagamento unico, nessun rinnovo automatico. Il prezzo finale è una decisione: 9,99 e 14,99 euro sono ipotesi del documento originario. Pubblicare un solo pacchetto per il concorso, con elenco delle funzioni incluse, tre prove gratuite, scadenza, aggiornamenti previsti, requisiti tecnici e canale di supporto.

Esplicitare che la banca proviene dalle fonti ufficiali, mentre simulatore e servizi sono indipendenti; evitare loghi o denominazioni che suggeriscano patrocinio non ottenuto. Il costo del servizio non è il contributo ufficiale di iscrizione. L'acquisto non inoltra la candidatura, non garantisce il superamento e non sostituisce le convocazioni dell'ente.

Valore comunicabile: uso semplice, simulazioni corrette, salvataggio, studio mirato e ripasso. Prima di promuovere spiegazioni o aggiornamenti "immediati", verificare che siano disponibili e sostenibili.

## 2. Preparazione del pagamento

- Account provider intestato al soggetto che vende, verifiche richieste completate, conto per accrediti configurato.
- Prodotti e prezzi separati fra prova e produzione, valuta euro, modalità one-time.
- Checkout ospitato, metodi carta/wallet realmente disponibili sul dispositivo e sull'account; non promettere tutti i wallet senza verifica.
- Prezzo, prodotto, email verificata e riferimento utente determinati dal server.
- Collegamento ordine-account persistente prima del redirect al provider.
- Informazioni obbligatorie e condizioni visibili prima del pagamento, con versione accettata registrata.
- Ricevuta del provider distinta dal documento fiscale richiesto al venditore. Decidere il processo fiscale con il commercialista.
- Vendite abilitate solo con banca approvata, concorso aperto, scadenza definita e checklist conclusa.

## 3. Flusso affidabile

1. Utente verificato chiede l'acquisto. Il server verifica se ha già accesso valido o un ordine pendente.
2. Si crea o riusa un ordine pendente e una sessione checkout identificata; retry non genera duplicati.
3. Il provider gestisce i dati della carta e l'autenticazione di pagamento.
4. La notifica firmata viene verificata e registrata in modo durevole prima dell'acknowledgement. Un fallimento di registrazione restituisce errore così il provider può ritentare.
5. Un'elaborazione idempotente controlla stato pagato, importo, valuta, prodotto e identità dell'ordine. Solo poi concede il diritto.
6. La pagina di ritorno legge lo stato server. Può avviare una verifica server presso il provider attraverso lo stesso processo idempotente; il redirect da solo non prova il pagamento.
7. Si invia conferma accesso con validità e assistenza; errore email non annulla il pagamento riuscito.

Riferimento: [Stripe, webhook](https://docs.stripe.com/webhooks), consultato il 14 ottobre 2026. La documentazione descrive firma, retry, eventi duplicati e ordine non garantito. Il progetto deve quindi riconciliare lo stato del pagamento, senza affidarsi all'arrivo una sola volta di una notifica.

Per semplicità P0 usa carte e wallet supportati; metodi differiti possono attendere. Se abilitati, aggiungere esplicitamente stati pendente, successo asincrono e fallimento asincrono prima di offrirli.

## 4. Stati e casi eccezionali

| Caso | Comportamento |
| --- | --- |
| Checkout aperto e abbandonato | Nessun accesso; ordine scade secondo regola, prove gratuite disponibili restano invariate |
| Pagamento rifiutato | Nessun accesso premium; messaggio e tentativo consentito senza nuovi addebiti automatici |
| Pagato, notifica tarda | "In verifica", controllo server e riconciliazione; non chiedere subito un secondo pagamento |
| Evento duplicato o in ordine diverso | Risultato unico e coerente con stato provider; nessun doppio diritto |
| Due acquisti concorrenti | Controllo ordine/accesso; eventuale doppio addebito reale identificato e gestito con rimborso motivato |
| Rimborso totale confermato | Aggiornare ordine e revocare il diritto derivato; mantenere audit e documenti dovuti |
| Rimborso parziale | Regola commerciale esplicita; non revocare automaticamente senza decisione |
| Contestazione/storno | Segnalazione e gestione amministrativa; sospensione/revoca secondo policy, non cancellazione arbitraria dello storico |
| Pagamento a ridosso della chiusura | Bloccare nuove sessioni checkout quando la vendita termina; riconciliare quelle aperte e rimborsare se il servizio non è erogabile |
| Account cancellato con acquisto pendente | Fermare nuovi acquisti, risolvere il pendente e conservare solo dati necessari secondo obblighi |

Non consentire agli operatori di impostare "pagato" senza una prova del provider. Un accesso omaggio/manuale ha ragione, durata e autore distinti dall'acquisto, senza ordine fiscale fittizio.

## 5. Riconciliazione

Prevedere un controllo periodico degli ordini pendenti e di pagamenti/rimborsi non allineati. Proposta operativa: verifica ogni 15 minuti dei pendenti recenti, confronto giornaliero complessivo e alert sui pagati senza accesso. Parametri da confermare in funzione dei limiti provider.

Pannello: mostrare ordine, identificativi provider, stato verificato e ultimo tentativo di elaborazione. Permettere retry della stessa operazione, non attivazioni duplicate. Prima di un rimborso verificare ordine e importo con conferma esplicita dell'operatore; registrare esito provider. Salvare richieste/eventi in una coda durevole con numero tentativi, errore e azione manuale.

## 6. Documenti e adempimenti prima della vendita

| Deliverable | Responsabile da assegnare | Contenuto da definire |
| --- | --- | --- |
| Identità del venditore | Davide e consulente fiscale | Forma di esercizio attività, dati esposti, contatti, regime e processo fiscale |
| Condizioni del servizio | Titolare con revisione legale | Oggetto, funzioni, prezzo totale, validità, rinvii, annullamenti, assistenza e responsabilità |
| Recesso e rimborsi | Revisione legale + implementazione | Qualificazione di servizio/contenuto digitale, informazioni, richieste, prove delle scelte utente e restituzioni |
| Informativa privacy | Titolare con supporto qualificato | Finalità, basi giuridiche, destinatari, fornitori, trasferimenti, tempi e diritti |
| Informativa cookie | Titolare e sviluppatore | Tecnici reali, analytics/tracciamento eventuale, gestione preferenze se necessaria |
| Verifica riutilizzo quesiti | Titolare con supporto legale se necessario | Fonte, condizioni, licenze, immagini, eventuali autorizzazioni |
| Accessibilità applicabile | Titolare e revisore | Obblighi in base al servizio e al soggetto, eventuali esenzioni da verificare e audit |
| Contratti fornitori | Titolare | Condizioni commerciali, trattamento dati, subfornitori, regioni e trasferimenti |

Non predisporre una casella generica "rinuncio a ogni rimborso". Le regole di recesso per servizi a distanza e contenuti digitali hanno condizioni diverse: va classificata l'offerta concreta e implementato il flusso corretto. Riferimento generale: [Your Europe, restituzioni e recesso](https://europa.eu/youreurope/citizens/consumers/shopping/returns/index_it.htm), consultato il 14 ottobre 2026. La verifica specifica deve avvenire in anticipo, senza attendere la banca.

## 7. Privacy pratica

Raccogliere email, identità account e dati di uso necessari; nome opzionale se non richiesto dal processo fiscale. Dati di fatturazione solo nella fase e quantità necessarie. Non raccogliere PEC, codice candidatura, documento, stato sanitario o requisiti del bando per far usare i quiz.

Distinguere esecuzione del servizio, obblighi fiscali, sicurezza ed eventuale marketing; non rendere il consenso marketing obbligatorio. La lettura dell'informativa non è un consenso universale. Documentare registro dei trattamenti ove dovuto, procedure per diritti e violazioni, responsabilità e accordi con fornitori.

Preferire statistiche funzionali interne all'account e nessun tracciamento pubblicitario iniziale. Se si introducono strumenti non tecnici, verificare la necessità di consenso preventivo, revoca e blocco prima della scelta. Riferimento: [Garante, linee guida cookie](https://www.garanteprivacy.it/home/docweb/-/docweb-display/docweb/9677876), consultato il 14 ottobre 2026. L'etichetta "senza cookie" non basta a escludere controlli privacy su altri identificatori.

Regioni UE preferite per database e servizi ove disponibili; una regione UE non esclude automaticamente trasferimenti tramite assistenza e subfornitori. Valutare effettive condizioni, non solo la posizione del database.

## 8. Conservazione ed eliminazione

Valori sotto come proposta iniziale da validare, non termini legali universali:

| Dati | Politica di lavoro |
| --- | --- |
| Tentativi e progressi | Consultabili durante il servizio e per 90 giorni dopo chiusura; poi eliminazione o anonimizzazione motivata |
| Account senza vendita | Eliminazione su richiesta verificata; termine per inattività da decidere e comunicare |
| Ordini e documenti fiscali | Periodo individuato dal consulente per gli obblighi applicabili, separato dai progressi didattici |
| Log tecnici | 30 giorni indicativi, con estensione per incidente documentata e accesso ristretto |
| Ticket supporto | 90 giorni dalla chiusura indicativi, salvo necessità motivata di tutela o obblighi |
| Backup | Finestra limitata, proposta 30 giorni; impedire che un ripristino reintroduca account già cancellati |
| Originali e banca | Conservazione secondo diritti e necessità di tracciabilità, separata dai dati personali |

Esportazione account con dati leggibili e separazione dei quesiti se i diritti ne limitano la distribuzione. Cancellazione con conferma e verifica identità; distinguere eliminazione del profilo da documenti dovuti. Registro delle richieste e processo per propagare le cancellazioni dopo ripristino. Non promettere eliminazione immediata di ogni copia se backup e obblighi la rendono impossibile.

## 9. Email e supporto

Configurare dominio email, SPF/DKIM e DMARC, mittente riconoscibile e recapito risposte. Verificare recapito su più caselle e mobile; monitorare bounce, quote e invii falliti. Conferma acquisto, verifica e recupero password sono messaggi di servizio; comunicazioni promozionali seguono una base distinta.

Proposta di assistenza: modulo/ticket e email, con tempi pubblicati coerenti con la disponibilità reale. Obiettivo interno: prima risposta entro un giorno lavorativo; in fase lancio presidio intensificato. Non promettere 24/7 senza copertura.

FAQ minime: banca e fonte, tempo provvisorio, tre prove, abbandono, perdita rete, cambio dispositivo, pagamento in verifica, validità/rinvio, differenza dal contributo ufficiale, scritto/orale, report, cancellazione e rimborsi. Il ticket include riferimenti tecnici utili automaticamente; non chiede la password o dati carta.

## 10. Monitoraggio e incidenti

| Evento | Azione |
| --- | --- |
| Servizio irraggiungibile o errori diffusi | Alert, verifica, eventuale manutenzione e rollback; comunicazione concreta |
| Pagati senza accesso | Riconciliazione e riprocessamento, assistenza proattiva se canale e base adeguati |
| Errori salvataggio/tempo | Fermare nuovi tentativi se dati a rischio; proteggere e valutare ripristino crediti |
| Chiave risposta errata | Sospendere quesito o banca interessata, verifica, rettifica versionata e avviso |
| Quota email o infrastruttura vicina al limite | Alert, aumento mirato o controllo carico; non interrompere inconsapevolmente utenti paganti |
| Incidente su dati personali | Contenimento, verifica impatto, conservazione evidenze e valutazione degli adempimenti applicabili |

Preparare un runbook breve per ciascun caso: chi interviene, come accede, cosa controlla, quando sospende vendite, come comunica e quale prova chiude l'incidente. Avvisi devono contenere stato e orario aggiornamento, senza dettagli sensibili.

## 11. Backup e ripristino

- Backup del database gestito, più esportazione cifrata indipendente con frequenza adeguata; sorgenti e media conservati separatamente. Verificare cosa il backup provider include realmente.
- Proposta obiettivi: perdita massima di risposte di un'ora (RPO), ripristino entro quattro ore (RTO). Obiettivi da dimostrare, non garanzie già disponibili; se il budget o gli strumenti non li supportano, decidere e comunicare il rischio residuo.
- Per pagamenti, ricostruzione e riconciliazione col provider: nessun diritto deve dipendere esclusivamente da un backup giornaliero.
- Fare una prova completa su ambiente isolato prima della banca: database, accessi, media, configurazioni e ordini; misurare tempo e dati recuperati.
- Verificare cifratura, accesso, spazio, retention, ultimo backup riuscito e recupero dei segreti necessari. Un file esistente non dimostra ripristinabilità.
- Dopo ripristino: applicare richieste di cancellazione, riconciliare provider, verificare sessioni e finalizzare tentativi scaduti.

## 12. Chiusura o rinvio

In caso di rinvio, aggiornare fonti/calendario e prolungare gli accessi secondo le condizioni vendute; valutare sostenibilità e non cambiare retroattivamente la promessa. In caso di revoca, applicare la politica definita e gli obblighi di legge, con gestione rimborsi e comunicazioni.

Alla conclusione: fermare vendite, mantenere consultazione e supporto per il periodo dichiarato, eseguire esportazioni e conservazioni dovute, poi cancellare/anonimizzare, chiudere risorse e abbonamenti non più necessari. Non spegnere il dominio e il contatto assistenza insieme ai quiz se restano richieste pendenti.

## 13. Preparazione della promozione

Nome e dominio distintivi, pagina chiara per il concorso, screenshot reali, contenuti social e FAQ pronti ma senza dichiarare banca disponibile prima dell'importazione. Indicizzazione delle pagine pubbliche; niente indicizzazione dei profili o report. Controllare testi e prezzo prima di ogni campagna.

Prima di spendere in pubblicità: confrontare offerta e concorrenti, verificare conversione dei primi utenti e margine per acquisto. Non basare il successo solo sul traffico; tracciare il percorso in modo proporzionato alla privacy.
