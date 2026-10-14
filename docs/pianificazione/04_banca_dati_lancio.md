# 04 - Preparazione della banca dati e procedura di lancio rapido

Obiettivo: quando arrivano i contenuti ufficiali, l'applicativo non richiede nuove schermate, nuove regole di punteggio o modifiche allo schema. Resta da adattare il formato sorgente, verificare i contenuti e pubblicare una versione approvata. Non si può garantire un importatore definitivo prima di conoscere il formato.

## 1. Preparare ora

- Definire un formato interno stabile per domande, opzioni, chiavi, categorie, immagini e provenienza.
- Creare un dataset sintetico di 1.500 quesiti per prove di volume, più un campione piccolo con casi difficili realistici.
- Includere alternative da 2 a 6, testi lunghi, accenti, apostrofi, elenchi, formule, immagini, righe spezzate e caratteri simili. Non assumere quattro opzioni.
- Preparare casi volutamente invalidi: ID duplicati, risposta assente, alternativa inesistente, immagini mancanti, numero discordante, quesito senza testo, hash non corrispondente.
- Costruire importazione di prova, report anomalie, anteprima, revisione e pubblicazione atomica. Una semplice importazione diretta senza revisione non basta.
- Provare anche sostituzione con seconda versione e ripristino; isolare i tentativi storici.
- Tenere gli avvisi "dati di prova" visibili, impedire acquisti reali e separare questi tentativi dalle quote gratuite definitive.

## 2. Cosa deve arrivare da Davide

Checklist di acquisizione, da usare quando i quesiti saranno disponibili:

- File ufficiale originale dei quesiti, completo di allegati/figure, oppure esportazione consentita.
- File o sezione delle risposte corrette, se pubblicato separatamente.
- URL o indicazione del portale di provenienza, data e versione; eventuale avviso che accompagna i file.
- Istruzioni ufficiali su tempo, numero opzioni, estrazione e turni se rilasciate nel frattempo.
- Eventuali rettifiche già pubblicate e condizioni di riutilizzo disponibili.

Non occorrono credenziali personali o domanda di candidatura. Se il download richiede accesso riservato, Davide può fornire il file ottenuto legittimamente; ciò non sostituisce la verifica del riutilizzo commerciale. Conservare l'originale senza modificarlo.

## 3. Contratto dati interno proposto

JSON è il formato principale; CSV può essere un formato d'ingresso se non perde struttura e immagini. Esempio **sintetico**, non quesito del concorso:

```json
{
  "schema_version": "1.0",
  "contest_id": "sanitaservice-ba-pulitore-2026",
  "bank_version": "demo-1",
  "source": {"document_id": "demo", "checksum_sha256": "da_calcolare"},
  "questions": [
    {
      "official_id": "DEMO-001",
      "text": "Quanto fa 2 + 2?",
      "category": "Logica numerica",
      "category_source": "editoriale",
      "options": [
        {"id": "DEMO-001-A", "source_label": "A", "text": "3", "position": 1},
        {"id": "DEMO-001-B", "source_label": "B", "text": "4", "position": 2},
        {"id": "DEMO-001-C", "source_label": "C", "text": "5", "position": 3}
      ],
      "correct_option_id": "DEMO-001-B",
      "answer_source": "sintetica",
      "source_page": null,
      "media": [],
      "explanation": null,
      "review_status": "demo"
    }
  ]
}
```

Il file completo è privato e contiene la chiave; il formato consegnato al browser esclude `correct_option_id` e altre informazioni sulla soluzione prima del feedback autorizzato. Contenuti originali e normalizzati restano confrontabili. L'ID ufficiale identifica la fonte, l'ID revisione identifica il testo immutabile usato nella banca.

## 4. Manifest e report di importazione

Ogni pacchetto contiene: identificativo concorso, versione schema/banca, elenco file e hash SHA-256, provenienza, data acquisizione, numero atteso e trovato, numero chiavi, immagini, anomalie, esito dei controlli, revisore e approvazione. L'hash dimostra che è lo stesso file esaminato, non che il contenuto sia corretto o ufficiale.

Il report distingue **bloccanti** (risposte mancanti, ID confliggenti, perdita testo/immagini, conteggio non spiegato), **da revisionare** (OCR incerto, alternativa spezzata, soluzione sospetta) e **non bloccanti** (categoria non ancora assegnata, spiegazione assente). Nessun warning viene ignorato in silenzio.

## 5. Pipeline all'arrivo dei file

1. **Acquisizione:** conservare originale, fonte e hash; leggere avvisi e verifica diritti.
2. **Ispezione:** PDF testuale, scansione, tabella o archivio web; identificare numerazione e posizione delle chiavi. Vedere pagine iniziali, centrali e finali, non solo una pagina.
3. **Estrazione:** usare parser per quel formato; OCR solo se necessario. Non alterare significato, punteggiatura rilevante o alternative.
4. **Normalizzazione:** separare domanda, opzioni, chiave e immagini; ricomporre righe; conservare riferimento sorgente.
5. **Validazione strutturale:** numero, ID, opzioni, chiavi e file; confrontare numerazione e conteggi con l'originale.
6. **Revisione di fedeltà:** confrontare ogni quesito e ogni chiave con la fonte, usando strumenti di confronto e controllo umano. Rivedere visivamente tutte le anomalie OCR, tabelle, formule e immagini; un campione serve come controllo aggiuntivo, non come unica garanzia dei 1.500 quesiti.
7. **Importazione in prova:** creare banca in bozza; eseguire controlli di database e collaudo dei percorsi reali.
8. **Approvazione:** revisore e titolare attestano esito, anomalie risolte e fonte delle chiavi. Se lavora una sola persona, fare una seconda passata separata, senza presentarla come revisione indipendente.
9. **Produzione:** backup, importazione privata, verifiche, attivazione della nuova banca in una sola operazione.
10. **Lancio:** controllo pagine e acquisto reale concordato, checklist G3, apertura vendite e quiz; sorveglianza iniziale.

L'importazione deve essere ripetibile: lo stesso pacchetto non crea doppioni. Si può ricostruire la banca a partire da manifest e sorgente, senza toccare tentativi storici. Non deduplicare automaticamente domande diverse solo perché il testo è identico: potrebbero avere ID o alternative distinti e cambiare la distribuzione ufficiale.

## 6. Controlli di qualità

| Controllo | Criterio |
| --- | --- |
| Conteggio | 1.500 previsti, oppure conteggio diverso giustificato da un atto ufficiale; ogni esclusione tracciata |
| Identità | Tutti gli ID ufficiali riconciliati; niente perdite o collisioni |
| Alternative | Tutte presenti, ordine fedele, etichette e ID coerenti |
| Correzione | Una chiave valida per ogni quesito utilizzabile, verificata contro la fonte dichiarata |
| Testo e media | Nessuna perdita di negazioni, unità, formule, tabelle o figure necessarie |
| Sicurezza | Nessun script o file eseguibile, nessuna chiave esposta nel quiz |
| Categorie | Ufficiali o dichiarate editoriali; eventuale Da classificare consentito |
| Versioni | Report e tentativi riproducono la versione corretta dopo aggiornamento |
| Punteggio | Stessi esiti sui casi verificati di 07 |
| Tracciabilità | Da ogni quesito si risale a file, pagina o posizione e revisione |

Se la banca ufficiale contiene un quesito ambiguo, non inventare una correzione. Registrare il caso e valutare esclusione temporanea, richiesta di chiarimento o segnalazione. Se si escludono quesiti, comunicare conteggio effettivo e limite di fedeltà; non dichiarare banca completa. La decisione di pubblicare una versione parziale richiede una revisione del perimetro e delle promesse.

## 7. Tempi di integrazione: obiettivi condizionati

| Scenario | Obiettivo di lavoro dopo ricezione completa | Condizioni |
| --- | --- | --- |
| JSON/CSV ordinato o PDF testuale con chiavi chiare | 1-2 giornate operative | App e pipeline già collaudate; revisore disponibile; controlli passati |
| PDF testuale irregolare, chiave separata o alcune figure | 2-4 giornate operative | Adattamento parser e riconciliazione più lunghi |
| Scansioni/OCR, molte tabelle o chiavi problematiche | Da stimare dopo ispezione | La revisione manuale può diventare il collo di bottiglia |
| Chiavi assenti, diritti incerti, incongruenze ufficiali gravi | Lancio in attesa di risoluzione | Nessuna scadenza tecnica supera questi blocchi |

Sono stime organizzative proposte, non SLA garantiti. Le 1-2 giornate includono integrazione e verifica, non la realizzazione dell'app. In caso di materiale ordinato ma revisione lenta, il tempo aumenta: riservare capacità specifica per la verifica dei contenuti.

## 8. Cosa può attendere e cosa no

Per un lancio rapido possono attendere spiegazioni, classificazione dettagliata, filtri avanzati e una parte delle statistiche. Non possono attendere fedeltà dei quesiti, chiavi valide, punteggio, accessi, pagamenti, documenti commerciali, recupero dei dati e controlli finali.

Durante l'attesa della banca, evitare vendite del prodotto completo basate su contenuti non disponibili. Una futura prevendita richiederebbe una decisione commerciale separata e condizioni adeguate; non è inclusa nella proposta.

## 9. Rettifiche e ritorno alla versione precedente

- Aprire nuova revisione/banca, documentare differenze e fonte.
- Verificare variazioni di opzioni e chiave; non modificare una banca già usata.
- Aggiornare i nuovi tentativi; quelli in corso rimangono sulla propria versione, salvo invalidazione motivata per errore grave.
- Conservare il punteggio originario. Se opportuno, mostrare separatamente un risultato ricalcolato dopo rettifica, con motivo e data.
- Ricostruire progressi e ripasso in modo coerente; domande ritirate non restano esercitabili.
- Ripristinare il puntatore alla banca precedente se l'importazione è difettosa; non cancellare ordini o tentativi creati nel frattempo.
- Se esiste dubbio grave sulle correzioni, sospendere nuove prove e vendite finché risolto; avviso e assistenza per utenti interessati.
