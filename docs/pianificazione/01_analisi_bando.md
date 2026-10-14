# 01 - Analisi del bando e miglioramenti del progetto

Riferimento principale: [PDF locale](../CONC_SANITASERVICE.pdf). I numeri di pagina sono quelli del file, non quelli del Bollettino. Analisi al 14 ottobre 2026.

## 1. Identità del concorso

L'avviso riguarda 125 unità di Pulitore/Ausiliario, categoria A, posizione A, per Sanitaservice ASL BA S.r.l., da assegnare all'ospedale Monopoli-Fasano. Il servizio proposto prepara alla prova scritta. Non gestisce candidature, ammissioni, convocazioni o graduatorie ufficiali.

Il bando richiede per la partecipazione, fra gli altri requisiti, licenza media e maggiore età. Questo aiuta a progettare testi chiari e un uso semplice da telefono; non giustifica la raccolta nella nostra app di documenti, dati sanitari o requisiti di candidatura.

## 2. Matrice tra bando e servizio

| ID | Regola o informazione | Fonte locale | Implicazione |
| --- | --- | --- | --- |
| B01 | Prova scritta con 30 quesiti a risposta multipla | Art. 6, p. 6 | Modalità esame con esattamente 30 quesiti distinti |
| B02 | Cultura generale anche attinente alla mansione; ragionamento logico numerico, deduttivo e verbale | Art. 6, p. 6 | Categorie di studio aderenti ai contenuti; tassonomia finale dopo lettura della banca |
| B03 | Risposta esatta +1; omessa 0; errata o multipla -0,33 | Art. 6, p. 6 | Calcolo esatto in centesimi e sul server |
| B04 | Scritto superato con almeno 21/30 | Art. 6, p. 6 | Soglia del report della simulazione 21,00 |
| B05 | Banca prevista di 1.500 quesiti, pubblicata nei 20 giorni antecedenti la prova sulla piattaforma di iscrizione | Art. 6, p. 6 | Pipeline pronta; formato e chiave delle risposte ancora da accertare |
| B06 | Prova orale, 30 punti; almeno 21/30 per entrare nella graduatoria finale | Art. 6, p. 6 | Spiegare che il servizio copre lo scritto; preparazione orale fuori prima versione |
| B07 | Inizio prove scritte dal 18 novembre 2026 | Art. 7, p. 6 | Pianificare prima di questa finestra, senza assumere che tutti sostengano la prova quel giorno |
| B08 | Diario con sede, data e ora almeno cinque giorni prima di ciascuna prova; possibili variazioni | Art. 7, p. 7 | Informazioni aggiornabili con fonte e data; accesso commerciale non legato automaticamente al primo turno |
| B09 | Comunicazioni ed esiti sul sito istituzionale, sezione Bandi e concorsi | Art. 4 p. 5, art. 6 p. 6 | Link alle fonti; indicare ultimo controllo e prevalenza degli avvisi ufficiali |
| B10 | Graduatoria in sessantesimi sulla somma di scritto e orale | Art. 8, p. 7 | Nessuna graduatoria o previsione di assunzione ricavata dalle simulazioni |
| B11 | Possibili proroghe, rettifiche, sospensione o revoca dell'avviso | Art. 11, p. 9 | Gestire rinvio e annullamento nella politica commerciale |
| B12 | Contributo ufficiale di partecipazione di 10 euro, versato all'ente | Art. 3, p. 3 | Il prezzo del simulatore è separato: comprarlo non iscrive al concorso |

Per B03, "risposta multipla" significa più alternative marcate per lo stesso quesito. Non è la stessa cosa di "quesito a risposta multipla", che offre diverse alternative. La prima versione impedisce la selezione di più alternative; il motore tratta eventuali risposte multiple secondo B03, senza mascherarle come omissioni.

## 3. Cosa il bando fornito non definisce

- Durata esatta dello scritto: 30 o 45 minuti nel progetto sono esempi, non valori ufficiali.
- Numero di alternative di ogni domanda: lo schema A-D iniziale è solo un'ipotesi.
- Ripartizione quantitativa delle materie e algoritmo di estrazione dei quesiti.
- Ordine delle opzioni, eventuale rimescolamento e modalità di navigazione durante la prova.
- Formato del dataset e disponibilità di soluzioni ufficiali.
- Spiegazioni dei quesiti: non sono promesse dal bando.
- Gestione precisa di arrotondamenti ulteriori o di eventuali punteggi negativi: nessuna regola aggiuntiva emerge dal testo analizzato.
- Giorno e turno specifico del singolo candidato, data dell'ultimo turno ed eventuali tempi aggiuntivi autorizzati.

Nell'app ogni parametro ha valore, stato (ufficiale/provvisorio), fonte, data e versione. Non usare il termine "simulazione identica" finché rimangono ignoti tempo, distribuzione e istruzioni operative.

## 4. Correzioni rispetto all'idea originale

| Elemento iniziale | Miglioramento proposto | Motivo |
| --- | --- | --- |
| Pubblicazione "20 giorni prima" | Riportare la finestra effettiva prevista dal bando | Evitare una data di rilascio inventata |
| Estratto "casualmente o per materia" | Esame con estrazione uniforme senza duplicati; studio per materia separato | Nessuna quota per materia è stabilita nel PDF |
| Randomizzazione "bilanciata" | Eventuale modalità didattica distinta, oppure quote ufficiali dopo avviso | Il bilanciamento arbitrario cambia il campione |
| Punteggio in tempo reale in esame | Nessuna soluzione o punteggio fino alla consegna | Ridurre suggerimenti e feedback che alterano la simulazione |
| Report "Ammesso alla prova orale" | "Soglia dello scritto raggiunta nella simulazione" | Il risultato dell'app non è un'ammissione ufficiale |
| Accesso fino al "giorno della prova" | Data di validità contrattuale esplicita, gestione ultimi turni e rinvii | Evitare scadenze premature o indefinite |
| Solo FREE/PREMIUM | Separare account, prove residue, acquisto, diritto di accesso e scadenza | Un pagamento riuscito non equivale a diritto perpetuo |
| Nuovo JWT invalida il precedente | Verifica server della sessione autorizzata a ogni operazione protetta | Un JWT firmato può restare valido dopo un nuovo login |
| Parser dopo sviluppo del resto | Contratto dati e prova completa di importazione all'inizio | L'integrazione tardiva è il rischio principale per il lancio rapido |
| Spiegazioni per ogni domanda | Facoltative, editoriali, verificate e distinguibili dalle risposte ufficiali | La banca potrebbe non contenerle |
| React/Vue, SQL/NoSQL, vari backend | Una proposta coerente, con motivi e decisione esplicita | Limitare lavoro duplicato e manutenzione |
| Nessuna amministrazione | Pannello minimo per banca, configurazione, accessi, pagamenti e segnalazioni | Gestire il servizio senza interventi diretti sul database |
| Roadmap solo tecnica | Aggiungere contenuti, assistenza, vendita, ripristino e chiusura | Il lancio richiede più del software |

## 5. Calendario e verifica pubblica

Al 14 ottobre ci sono 35 giorni fino al 18 novembre. Sottrarre 20 giorni porta al 29 ottobre: è un riferimento aritmetico per la pianificazione della finestra, **non** una data ufficiale di pubblicazione. Conviene puntare alla disponibilità dell'app collaudata prima di quel riferimento, se capacità e decisioni lo consentono.

La [pagina istituzionale dei bandi](https://www.sanitaserviceaslba.it/bandi_3.html) consultata il 14 ottobre 2026 presenta l'avviso per i 125 posti. Il [portale di selezione, pagina bandi](https://www.csselezioni.it/sanitaservice-bari/bandi-avvisi) riporta la scadenza delle candidature al 7 novembre 2026, ore 23:59:59. Questi riscontri riguardano l'avviso e la candidatura; non stabiliscono la data di uscita della banca o la durata dello scritto.

Il [PDF collegato dal sito istituzionale](https://www.sanitaserviceaslba.it/pdf/BANDO_n.125_pulitori-ausiliari_SanitaserviceAslBa_per_POMonopoli-Fasano_BURP_N80_08_10_2026.pdf) contiene anche una pagina finale del Bollettino. Nei passaggi su prove e calendario esaminati, il testo coincide con il PDF fornito.

Nelle pagine pubbliche consultate non è stata individuata una banca dati per questo concorso. Non sono state esplorate aree riservate: questa osservazione non certifica l'assenza assoluta di documenti. Prima del lancio ripetere il controllo di avvisi, FAQ e portale, evitando di confondere gli atti di altri profili o anni con questo concorso.

## 6. Valore del servizio

Una banca pubblica non è di per sé un vantaggio esclusivo. Il valore venduto è l'esperienza: esercitazione semplice da telefono, calcolo corretto, salvataggio affidabile, ripasso degli errori, visibilità delle materie meno solide e assistenza. Comunicare questi vantaggi senza promettere il superamento del concorso.

Prima del lancio confrontare, con ricerca dedicata, strumenti già disponibili per lo stesso concorso: prezzo, funzioni, modalità gratuita, tempestività e affidabilità. Il piano non assume l'assenza di concorrenti, né che 125 posti equivalgano a 125 o più clienti.

## 7. Condizioni esterne da risolvere

La disponibilità pubblica della banca non dimostra automaticamente che si possa riprodurla in un servizio commerciale. Verificare condizioni di riutilizzo, titolarità, eventuali diritti sulla banca, immagini e materiali allegati; registrare l'esito prima di vendere. Non aggirare credenziali, limiti del portale o restrizioni per ottenere i quesiti.

Se mancano le risposte ufficiali, non completarle automaticamente presentandole come ufficiali. Lanciare solo quando esiste una base di correzione verificata e una comunicazione corretta della sua provenienza, oppure rivedere esplicitamente il perimetro. Gli adempimenti del nostro servizio non sono coperti dall'informativa privacy dell'ente riportata nel bando.
