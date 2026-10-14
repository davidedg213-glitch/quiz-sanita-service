# 08 - Decisioni, budget e gestione dei rischi

Stato al 14 ottobre 2026. Obiettivo confermato: servizio pubblico a pagamento unico, prova gratuita, costi contenuti, applicativo pronto prima della banca e integrazione rapida dopo la ricezione. Le altre scelte qui sotto sono proposte da confermare; non sono acquisti o impegni già assunti.

## 1. Registro decisioni

| ID | Decisione | Proposta di partenza | Stato e momento |
| --- | --- | --- | --- |
| D01 | Identità del titolare/venditore | Un soggetto chiaramente identificato, con processo fiscale definito | Da decidere con consulente prima di account commerciali e vendita |
| D02 | Prezzo unico | Valutare 9,99 e 14,99 euro del documento originale; un solo pacchetto | Da confermare dopo confronto mercato e margine; prezzo di lavoro prima del checkout |
| D03 | Durata commerciale | Fino a conclusione dei turni scritti con margine dichiarato e proroga per rinvio | Definire regola ora, data minima prima di vendita, aggiornare con calendario |
| D04 | Prova gratuita | Tre avvii per account verificato/concorso; ripresa non consuma; errori accreditabili con audit | Proposta da confermare prima del motore |
| D05 | Condivisione account | Una sessione autorizzata, nuovo login sostituisce precedente; più schede coordinate | Proposta da confermare prima di autenticazione |
| D06 | Perimetro iniziale | P0 di 02, con statistiche essenziali e amministrazione minima | Proposta da confermare prima della stima definitiva |
| D07 | Riutilizzo dei materiali | Solo sorgenti ottenute legittimamente e riutilizzo commerciale verificato | Controllo avviabile ora, conclusione sui materiali prima della vendita |
| D08 | Stack | Next.js/TypeScript, PostgreSQL/Supabase, Vercel Pro | Proposta coerente da confermare prima del setup |
| D09 | Pagamenti/email | Stripe Checkout e provider SMTP dedicato, proposta Resend | Verificare intestazione, regioni, quote e costi prima del setup |
| D10 | Fonte delle risposte | Chiavi ufficiali quando presenti; nessuna ricostruzione automatica spacciata per ufficiale | Dipende dalla banca; condizione di G2 |
| D11 | Alternative e immagini | Numero variabile; ordine sorgente; media supportati | Struttura da adottare ora, formato reale dopo banca |
| D12 | Categorie e spiegazioni | Categorie editoriali dichiarate se necessarie; spiegazioni verificate facoltative | Non blocca il lancio se chiavi e testi sono corretti |
| D13 | Conservazione e privacy | Dati minimi, niente marketing iniziale, periodi proposti in 05 | Da validare prima di testi e flussi definitivi |
| D14 | Assistenza e incidenti | Ticket/email, obiettivo prima risposta un giorno lavorativo, presidio al lancio | Da assegnare prima di G1 |
| D15 | Timer iniziale | 30 minuti di allenamento chiaramente provvisori, poi valore ufficiale se comunicato | Da confermare ora; nessuna durata ufficiale dedotta |
| D16 | Capacità e data interna | Stima 18-23 giornate-persona prima della banca; obiettivo anticipare la finestra | Da trasformare in calendario con disponibilità reale |
| D17 | Nome e dominio | Nome indipendente, nessun patrocinio implicito, dominio intestato al titolare | Da scegliere prima della preparazione pubblicazione/email |
| D18 | Disponibilità e ripristino | Obiettivi RPO un'ora/RTO quattro ore, da provare con strumenti scelti | Da confermare con budget e test prima di G1 |
| D19 | Carico iniziale | Test 100 utenti concorrenti e stress a 300, senza assumerli come domanda prevista | Da misurare prima di G1 e aggiornare dopo lancio |
| D20 | Lancio e promozione | Vendite dopo banca validata, nessuna prevendita nella prima proposta | Da confermare prima della pagina commerciale |

Registro di ogni decisione conclusa: data, persona, scelta, motivo, alternative scartate, impatto su documenti/task. D07 e D10 non possono essere dichiarate concluse sulla sola base dell'idea iniziale.

## 2. Budget infrastruttura: proposta economica

Tariffe pubbliche consultate il 14 ottobre 2026, da verificare al momento della sottoscrizione. Valute originali conservate: non è una conversione in euro né un preventivo comprensivo di imposte.

| Voce | Base pubblicata | Uso proposto |
| --- | --- | --- |
| Hosting Vercel Pro | 20 USD/mese come base pubblicata; consumi e posti sviluppatore possono aumentare il totale | Un posto operativo iniziale, quote e limiti di spesa controllati |
| Supabase Pro | Da 25 USD/mese; primo progetto Micro coperto dal credito compute, progetti aggiuntivi da 10 USD/mese | Un progetto produzione; ambiente di prova separato con costi calcolati |
| Resend Free | 0 USD, 3.000 email/mese e limite 100/giorno | Sviluppo/piccola prova privata se sufficiente |
| Resend Pro | 20 USD/mese, 50.000 email/mese, senza il limite giornaliero Free | Consigliato nel mese di lancio per evitare un collo di bottiglia nelle registrazioni |
| Stripe standard | Per carte standard SEE 1,5% + 0,25 euro per transazione riuscita | Costi variabili; altri tipi di carte e servizi hanno tariffe diverse |

Fonti: [Vercel pricing](https://vercel.com/pricing), [Supabase pricing](https://supabase.com/pricing), [Resend pricing](https://resend.com/pricing), [Stripe Italia](https://stripe.com/it/pricing).

La base mensile con un progetto produzione e email Pro è **65 USD**, prima di imposte, consumi, dominio, backup indipendente e ambiente di prova. Con email Free sarebbe 45 USD, ma cento invii giornalieri possono essere insufficienti già con pochi nuovi utenti e recuperi/verifiche ripetuti: non scegliere quel limite senza stimare il picco.

Vercel Hobby è indicato per uso personale non commerciale e non è il piano da usare per questa offerta pagata. Supabase Free può sospendere progetti dopo una settimana di inattività: usarlo eventualmente per prove non critiche, considerando limiti e verifica della separazione fra organizzazioni/progetti. Fonti: [Vercel Hobby](https://vercel.com/docs/plans/hobby), [Supabase pricing](https://supabase.com/pricing).

Non assumere che l'ambiente di prova rimanga gratis quando la produzione passa a Pro: il conteggio progetti/compute va verificato sulla configurazione concreta. Possibile alternativa economica è prova locale con dati sintetici e un solo database online produzione, purché il collaudo finale sia rappresentativo e sicuro.

## 3. Budget di gestione complessivo

Per pianificare senza spendere troppo, proposta di **accantonamento iniziale 80-120 euro/mese** per servizi tecnici durante il periodo pubblico, più commissioni di pagamento. È un margine gestionale da confermare, non il prezzo convertito dei tre provider né un tetto garantito.

| Voce aggiuntiva | Trattamento nel budget |
| --- | --- |
| Dominio | Accantonamento indicativo 15-30 euro/anno; preventivo reale dipende da nome, estensione e rinnovo |
| Backup/export indipendenti | Valutare spazio e frequenza; quota nel margine tecnico, preventivo dopo scelta |
| Monitoraggio | Funzioni incluse e strumenti essenziali inizialmente; servizi aggiuntivi solo se necessari |
| Ambiente prova online | Calcolare separatamente; locale può ridurre canoni ma non sostituisce prova produzione |
| Email in eccesso | Alert su volumi/quote; budget variabile secondo piano scelto |
| Carico elevato | Consumi hosting, compute e traffico; simulare e monitorare, non assumere capienza illimitata |
| Consulenze e fiscalità | Preventivi separati, non compresi negli 80-120 euro |
| Lavoro sviluppo e revisione | Tempo personale o compenso concordato; non è incluso nei canoni |
| Promozione | Budget separato e graduale, da aumentare solo dopo segnali utili |
| Strumenti di sviluppo/IA | Eventuali abbonamenti e consumi separati; nessun costo IA per ogni risposta previsto nel prodotto |

Contabilizzare numero di mesi pubblici, rinvii possibili e periodo report/supporto dopo la prova. Due mesi a 65 USD di base fanno 130 USD prima delle altre voci; il costo totale del servizio non si limita al mese del lancio. Non acquistare piani annuali solo per questo concorso senza valutare il riuso.

Alert proposti a 50%, 75% e 90% del budget tecnico mensile. Un limite rigido può fermare il servizio: decidere quale superamento richiede intervento e mantenere una riserva per non interrompere gli utenti paganti. I controlli non sostituiscono il dimensionamento.

## 4. Costo del lavoro e sostenibilità

18-23 giornate-persona sono una stima di impegno, non lavoro gratuito. Se il lavoro è affidato a un professionista: `costo sviluppo = giornate concordate * tariffa giornaliera`, più attività esterne, contenuti e manutenzione. Richiedere un preventivo con deliverable e gate, non solo un prezzo per "fare il sito".

Per ridurre costo totale: un codice applicativo, un database, un gateway, pagine e report essenziali; niente app native, offline completo o IA didattica al lancio. Investire prima su importazione, correttezza e affidabilità. Un VPS più economico o una funzione extra possono costare più in manutenzione del risparmio sul canone.

Esempi delle commissioni pubblicate per una carta standard SEE, senza servizi aggiuntivi:

| Prezzo | Commissione teorica 1,5% + 0,25 | Resta dopo solo questa commissione |
| --- | --- | --- |
| 9,99 euro | Circa 0,40 euro | Circa 9,59 euro |
| 14,99 euro | Circa 0,47 euro | Circa 14,52 euro |

Questi importi non sono profitto netto: non sottraggono eventuale IVA, altre imposte, rimborsi, contestazioni, supporto, pubblicità o lavoro. Il regime fiscale deve essere verificato, non dedotto da questa tabella.

Formula operativa: `margine per acquisto = prezzo netto delle imposte applicabili - commissioni - costo variabile medio - quota attesa rimborsi/storni - acquisizione cliente`. Punto di pareggio: `costi fissi complessivi / margine per acquisto`, arrotondato per eccesso, solo se il margine è positivo.

Esempio puramente gestionale: con 200 euro di costi fissi e 8 euro di margine reale servono 25 acquisti per quei costi. Se si aggiungono 3.000 euro di sviluppo, diventano 400 acquisti. I numeri sono ipotesi illustrative, non una previsione della domanda o un preventivo. La sostenibilità cambia soprattutto con lavoro iniziale, costo di acquisizione e durata, non solo con hosting.

## 5. Indicatori utili dopo il lancio

- Registrazioni verificate e percentuale che avvia la prima prova.
- Prove completate, riprese, scadute e invalidazioni per guasto.
- Conversione in acquisto sugli utenti effettivamente eleggibili, con periodo e denominatore chiari.
- Pagamenti confermati senza accesso, rimborsi e ticket per cento utenti.
- Utilizzo studio/ripasso e copertura quesiti, senza interpretarlo come probabilità di superamento.
- Costo tecnico per utente attivo e per acquisto, spesa promozionale e margine.
- Errori, latenza, quota email, backup riusciti e tempo di assistenza.

Proposta: dashboard gestionale essenziale, aggregati interni e analisi settimanale. Prima di campagne pubblicitarie significative verificare che conversione e margine giustifichino la spesa. Non sono necessarie classifiche pubbliche dei candidati.

## 6. Registro rischi

| ID | Rischio | Impatto | Mitigazione e responsabile |
| --- | --- | --- | --- |
| K01 | Banca arriva prima che l'app sia pronta | Lancio tardivo | Perimetro P0 stretto, importazione da F1, stima capacità reale; PO/DEV |
| K02 | PDF scansione o struttura complessa | Integrazione più lenta | Adattatore sostituibile, OCR e campioni limite, tempo revisore riservato; DEV/CONT |
| K03 | Chiavi ufficiali assenti o contraddittorie | Correzioni inaffidabili | Verifica fonte, blocco G2, nessuna risposta inventata ufficiale; CONT/PO |
| K04 | Riutilizzo commerciale non consentito | Offerta non pubblicabile | Verifica prima della vendita, eventuale autorizzazione o cambio perimetro; PO/CONS |
| K05 | Negazione, figura o opzione persa in estrazione | Apprendimento errato | Confronto completo, anomalie bloccanti, tracciabilità e rettifiche; CONT |
| K06 | Rinvio, più turni o annullamento | Scadenza e costi incoerenti | Validità esplicita, proroghe, politica rimborsi e riserva; PO |
| K07 | Picco registrazioni/email/quiz | Accesso impedito | Provider adeguati, test carico, alert e aumento mirato; OPS |
| K08 | Pagamento ricevuto ma accesso assente | Reclami e doppi acquisti | Eventi durevoli, idempotenza, riconciliazione e supporto; DEV/OPS |
| K09 | Timer o salvataggi fragili | Risultati inattendibili | Deadline server, versioni risposte, test rete/concorrenza; DEV/QA |
| K10 | Condivisione o molte registrazioni | Ricavi ridotti | Sessione unica, email verificata e limiti proporzionati; DEV/PO |
| K11 | Accesso a dati altrui o segreti esposti | Incidente grave | Proprietà dati, chiavi server, MFA e test avversariali; DEV/OPS |
| K12 | Nessun ripristino utilizzabile | Perdita dati e servizio | Backup separato, prova reale, riconciliazione pagamenti; OPS |
| K13 | Servizio simile gratuito o domanda bassa | Investimento non recuperato | Confronto mercato, valore concreto, spese graduali; PO |
| K14 | Funzioni extra aggiunte continuamente | Mancata prontezza | Registro decisioni e gate; P1 dopo stabilizzazione; PO |
| K15 | Supporto e consulenze non disponibili | Lancio bloccato o promesse disattese | Assegnazione da F0, provider verificati in anticipo; PO |

Non tutti i rischi richiedono nuova tecnologia. Alcuni richiedono una decisione commerciale, una persona disponibile o un documento ufficiale. Segnare per ciascuno probabilità stimata, segnale di attivazione, proprietario e data controllo quando il team sarà definito.

## 7. Collo di bottiglia della revisione

La banca contiene 1.500 quesiti: anche un confronto medio di 30 secondi per quesito richiede 12,5 ore; a 90 secondi richiede 37,5 ore. Sono semplici calcoli di capacità, prima di anomalie, prove applicative e pubblicazione. Strumenti di confronto possono accelerare la revisione, ma non eliminano il problema.

Per rispettare l'obiettivo di 1-2 giornate su materiale ordinato occorrono un estrattore già pronto, chiavi riconciliabili e sufficiente capacità di revisione. Riservare il revisore in anticipo e prevedere seconda passata per anomalie. Se lavora una sola persona e il materiale è difficile, aggiornare immediatamente la stima prima di annunciare il lancio.

## 8. Decisioni da affrontare per prime

1. Chi vende, chi sviluppa, chi controlla i quesiti e chi risponde agli utenti.
2. Perimetro essenziale, regola esatta delle tre prove, sessione unica e timer provvisorio.
3. Prezzo di lavoro, validità garantita e gestione rinvii/annullamento.
4. Stack e provider con budget e intestazioni corretti; nessun servizio acquistato in questa fase.
5. Nome/dominio, condizioni del servizio e controlli sui diritti dei contenuti.
6. Calendario interno realistico rispetto alla disponibilità effettiva, con G1 prima possibile e revisione riservata all'arrivo della banca.

Dopo queste decisioni, il primo blocco di realizzazione è T11-T20: impostazione, identità, contratto dati e importazione sintetica. Il progetto è poi sviluppabile con ordine attraverso 06 e verificabile attraverso 07, senza dipendere dalla disponibilità immediata dei quesiti ufficiali.
