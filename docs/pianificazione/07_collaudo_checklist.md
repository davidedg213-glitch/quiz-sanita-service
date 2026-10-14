# 07 - Collaudo, copertura requisiti e condizioni di lancio

Questi sono test **da eseguire in futuro**, non risultati già ottenuti. In questa fase è stata verificata la documentazione e confrontato il bando; nessuna funzione applicativa esiste ancora.

## 1. Strategia

Test automatici per calcolo, stati, autorizzazioni, transazioni e pagamenti; test di integrazione sul database reale di prova; prove browser dei percorsi principali; revisione manuale per contenuti, accessibilità e testi. Non basta controllare che i pulsanti siano visibili.

Registrare per ciascun test ambiente, versione applicativo/banca, input, risultato, data e difetto. I test dei permessi usano almeno due utenti distinti, un amministratore, una sessione vecchia e una nuova. Tutti i dati iniziali sono sintetici; solo G2 usa i contenuti ufficiali.

## 2. Punteggio: casi esatti

Formula in centesimi: `100 * E - 33 * R`; O omesse. E+R+O deve essere 30. Nessun minimo zero introdotto senza regola ufficiale.

| Test | E | R | O | Risultato | Soglia |
| --- | --- | --- | --- | --- | --- |
| S01 | 30 | 0 | 0 | 30,00 | Raggiunta |
| S02 | 21 | 0 | 9 | 21,00 | Raggiunta |
| S03 | 20 | 0 | 10 | 20,00 | Non raggiunta |
| S04 | 22 | 3 | 5 | 21,01 | Raggiunta |
| S05 | 22 | 4 | 4 | 20,68 | Non raggiunta |
| S06 | 0 | 30 | 0 | -9,90 | Non raggiunta |
| S07 | 0 | 0 | 30 | 0,00 | Non raggiunta |
| S08 | 24 | 6 | 0 | 22,02 | Raggiunta |
| S09 | 21 | 1 | 8 | 20,67 | Non raggiunta |

Ulteriori controlli: ogni risposta multipla vale come errata; alternativa di un altro quesito viene respinta senza corrompere il tentativo; conteggi negativi o totale diverso sono invalidi; UI e server coincidono; `-0,33` non diventa `-1/3`; report sempre con due decimali.

## 3. Motore, timer e concorrenza

| ID | Scenario | Atteso |
| --- | --- | --- |
| Q01 | Avvio esame con banca valida | 30 distinti, configurazione e ordine persistenti |
| Q02 | Banca con meno di 30 utilizzabili o sospesa | Avvio negato, nessuna prova consumata |
| Q03 | Due avvii simultanei con una prova residua | Un solo tentativo e un solo consumo |
| Q04 | Retry avvio dopo perdita risposta HTTP | Stesso tentativo, niente consumo doppio |
| Q05 | Refresh, riapertura, sospensione telefono | Stesse risposte e termine originale |
| Q06 | Orologio dispositivo avanti/indietro | Scadenza basata sul server |
| Q07 | Risposta prima, al limite e dopo deadline | Prima accettata; al raggiungimento del termine e dopo respinta secondo confronto definito |
| Q08 | Rete assente, modifica locale, ritorno prima/dopo termine | Stato non salvato evidente; retry ammesso solo prima del termine |
| Q09 | Richieste salvataggio ricevute fuori ordine | Nessuna sovrascrittura dell'ultima versione valida |
| Q10 | Due schede modificano lo stesso item | Conflitto/stato aggiornato controllato; niente perdita silenziosa |
| Q11 | Doppia consegna e scadenza concorrente | Un solo risultato finale |
| Q12 | Browser chiuso fino a oltre la scadenza | Tentativo finalizzato senza dipendere dal browser |
| Q13 | Cancella scelta e torna alla domanda | Omissione persistente e conteggio corretto |
| Q14 | Logout o nuovo dispositivo durante prova | Risposte confermate conservate, timer continua |
| Q15 | Accesso commerciale scade a prova iniziata | Regola di 02 rispettata; niente nuova prova |
| Q16 | Banca aggiornata mentre una prova è attiva | Prova vecchia coerente; nuove prove su nuova banca |
| Q17 | Prova invalidata per guasto confermato | Motivo, eventuale credito e esclusione statistiche coerenti |

Definire precisamente il bordo: scritture consentite solo con ora server strettamente precedente alla deadline. Il timestamp del dispositivo non concede proroghe. La prova di carico deve verificare che ritardi server non trasformino sistematicamente scelte tempestive in risposte tardive; eventuale politica di tolleranza richiede decisione e test separati.

## 4. Accessi, gratuità e pagamenti

| ID | Scenario | Atteso |
| --- | --- | --- |
| A01 | Email non verificata, link scaduto e rinvio | Percorso comprensibile e nessun accesso prematuro |
| A02 | Terza prova consumata, quarto avvio | Blocco server; report precedenti accessibili |
| A03 | Pagamento riuscito senza ritorno al sito | Diritto attivato dalla procedura server |
| A04 | Firma webhook errata | Nessuna modifica, errore registrato senza dati sensibili |
| A05 | Evento ripetuto e due eventi sullo stesso acquisto | Un'attivazione, registro coerente |
| A06 | Importo/valuta/prodotto non corrispondenti | Nessun accesso; anomalia da gestire |
| A07 | Pagamento fallito/checkout abbandonato | Nessun accesso; quota gratuita non alterata |
| A08 | Webhook in ritardo o non elaborato | Stato in verifica e riconciliazione riuscita |
| A09 | Rimborso/storno e successivo evento vecchio | Diritto coerente con stato autorevole, nessuna riattivazione impropria |
| A10 | Doppio clic acquisto o checkout già attivo | Ordine riutilizzato/controllato, doppio pagamento gestibile |
| A11 | Nuovo login con vecchio token ancora valido | Tutte le API protette respingono la vecchia sessione |
| A12 | Refresh della sessione corrente e più schede | Nessuna espulsione involontaria |
| A13 | Reset password/sospensione account | Sessioni revocate e messaggi corretti |
| A14 | Manipolazione prezzo, FREE/PREMIUM, durata o utente | Server ignora/rifiuta dati non autorizzati |
| A15 | Scadenza prorogata e rinvio ufficiale | Accessi aggiornati, promessa precedente conservata |
| A16 | Credito gratuito o omaggio manuale | Solo operatore autorizzato, motivo e audit |
| A17 | Checkout aperto quando le vendite vengono chiuse | Risoluzione/rimborso secondo policy, nessun ordine dimenticato |

Test reali in produzione: almeno un acquisto autorizzato dal titolare con importo e account di test concordati; verificare eventuale rimborso e costo residuo. Nessuna carta reale viene usata senza autorizzazione della persona che paga.

## 5. Studio, statistiche e contenuti

| ID | Scenario | Atteso |
| --- | --- | --- |
| D01 | Studio materia con quantità superiore alla disponibilità | Avviso e quantità proposta, nessun duplicato nascosto |
| D02 | Feedback studio e tentativo esame attivo | Soluzione solo nel contesto autorizzato, niente fuga delle chiavi dell'esame |
| D03 | Risposta studio cambiata dopo correzione | Statistica della prima risposta coerente |
| D04 | Ripasso dopo errore, omissione e nuovo successo | Coda aggiornata secondo 02 |
| D05 | Nessun dato, pochi dati, versioni differenti | Indicatori e denominatori chiari, niente confronto fuorviante |
| D06 | Percentuale per materia con omissioni | Formula di 02 e conteggi verificati |
| D07 | Import stesso pacchetto due volte | Nessun duplicato o nuova versione non voluta |
| D08 | ID/chiave/media mancanti e testo OCR difettoso | Anomalie bloccanti rilevate, pubblicazione impedita |
| D09 | Rettifica risposta e ritorno banca | Storico originale preservato, nuovi tentativi corretti |
| D10 | Domanda lunga, formula, figura e diverse alternative | Nessun taglio o perdita di significato su mobile |
| D11 | Categoria editoriale e spiegazione assente | Etichette corrette, funzionamento senza spiegazione inventata |
| D12 | Fine banca e conteggio completo | Originale, manifest e database riconciliati su tutti i quesiti |

Se il servizio consente di consultare una domanda già studiata che ricompare in esame, ciò è un limite naturale dell'allenamento su banca pubblica. Non promettere prevenzione del "cheating" didattico; impedire comunque l'esposizione automatica della soluzione da un endpoint del tentativo prima della consegna.

## 6. Sicurezza, privacy e operazioni

| ID | Verifica | Atteso |
| --- | --- | --- |
| SEC01 | Utente A tenta accesso a tentativi/report/ordini di B | Negato su ogni operazione e archivio file |
| SEC02 | Browser, bundle, cache e log | Nessuna chiave amministrativa o soluzione d'esame anticipata |
| SEC03 | Testo/file importato contenente script o payload malevolo | Respinto/sanificato, nessuna esecuzione |
| SEC04 | Login, reset, checkout e ticket ripetuti | Limiti proporzionati e persistenti fra istanze |
| SEC05 | Utente comune chiama funzioni amministrative | Negato; MFA e ruoli verificati |
| SEC06 | Cache e logout/cambio account | Nessun dato personale mostrato all'altro account |
| OP01 | Email verifica, recupero e conferma, bounce e quota | Recapito e gestione errore senza perdere pagamento |
| OP02 | Guasto e alert | Segnalazione ricevuta e runbook eseguibile |
| OP03 | Ripristino database/media/configurazione | RPO/RTO misurati, cancellazioni e ordini riconciliati |
| OP04 | Export e cancellazione utente | Dati corretti, identità verificata e retention rispettata |
| OP05 | Preferenze cookie/marketing se presenti | Scelte libere, revoca e comportamento coerente |
| OP06 | Sospensione banca/vendite e rollback | Nessuna perdita di ordini o tentativi, messaggi chiari |
| OP07 | Cambio regole, ruoli o crediti amministrativi | Audit con autore/data/motivo; storia conservata |

## 7. Obiettivi di qualità iniziali

Proposte da misurare in ambiente rappresentativo e adeguare dopo i primi utenti:

- Percorsi verificati su Android/Chrome, iPhone/Safari, desktop Chrome/Edge e Firefox supportati alla data di test. Non basta ridurre la finestra desktop.
- Schermate leggibili da 360 px, zoom 200%, tastiera e lettore di schermo; contrasto e focus controllati. Nessuna attestazione generale di conformità senza audit adeguato.
- Salvataggio risposta con latenza p95 entro 1 secondo in condizioni di carico definite; avvio esame p95 entro 2 secondi. Misurare server separatamente da rete reale mobile.
- Prima campagna di carico: 100 utenti concorrenti su quiz; stress a 300, aumento graduale, con avvii e consegne concentrati. Sono scenari di test, non previsione della domanda.
- Nessuna perdita o doppia finalizzazione nei test di concorrenza; errori inattesi sotto l'1% nel profilo di carico scelto. Un errore che corrompe punteggio/pagamento è bloccante anche se raro.
- Stato salvataggio sempre visibile; errori recuperabili senza ripartire o pagare due volte.
- RPO/RTO di 05 dimostrati; quote email e infrastruttura controllate anche per picchi di registrazione, non solo quiz.
- Alert su pagamento confermato senza accesso, errori salvataggio, banca sospesa e backup fallito.

Primo dimensionamento richieste: 100 utenti che cambiano risposta una volta ogni 10 secondi generano circa 10 salvataggi al secondo, oltre ad altre operazioni. Usare questo profilo per testare pooling e vincoli; non fare polling della deadline ogni secondo per ogni utente.

## 8. Copertura sintetica

| Requisito | Attività | Verifiche principali |
| --- | --- | --- |
| B01-B04, punteggio e soglia | T21-T27 | S01-S09, Q01-Q13 |
| B05, banca ufficiale fedele | T13-T20,T51-T56 | D07-D12, G2 |
| Gratuità e concorrenza | T23,T35 | Q03-Q04,A02,A16 |
| Sessione unica e proprietà | T16-T18,T43 | A11-A14,SEC01-SEC06 |
| Acquisto e validità | T33-T37,T58 | A03-A10,A15,A17 |
| Studio e ripasso | T28-T30 | D01-D06 |
| Fonti e comunicazione indipendente | T02,T31,T40 | Revisione testi e G3 |
| Privacy/supporto/continuità | T39-T45,T50 | OP01-OP07 |
| Lancio rapido dopo banca | T48,T50-T59 | G1,G2,G3 |

## 9. G1 - App pronta prima della banca

- [ ] Decisioni essenziali chiuse e responsabilità assegnate.
- [ ] Percorso gratuito, premium, studio e ripasso completato con dati sintetici.
- [ ] Punteggio, timer, ripresa e transazioni superano i test.
- [ ] Pagamento di prova e casi webhook/rimborso/riconciliazione verificati.
- [ ] Sessione unica, proprietà e segreti verificati.
- [ ] Importazione di due banche sintetiche, attivazione e rollback provati.
- [ ] Ambiente di produzione, dominio, provider e email pronti; niente vendita reale abilitata.
- [ ] Documenti commerciali e privacy pronti, con controllo finale sul materiale ancora da ricevere.
- [ ] Backup ripristinato con esito misurato; runbook e contatti disponibili.
- [ ] Piccolo gruppo prova l'intero servizio su mobile.
- [ ] Nessun difetto bloccante o grave aperto; limitazioni accettate e descritte.

## 10. G2 - Banca ufficiale pronta

- [ ] Originali, chiavi, provenienza e hash conservati.
- [ ] Condizioni di riutilizzo verificate sui materiali effettivi.
- [ ] Conteggio e numerazione riconciliati, ogni chiave verificata.
- [ ] Ogni domanda confrontata; anomalie, formule e immagini controllate.
- [ ] Nessuna risposta inventata o spiegazione non verificata presentata come ufficiale.
- [ ] Parametri aggiornati con fonte; quelli ignoti restano etichettati provvisori.
- [ ] Importazione in prova e test su dati reali conclusi.
- [ ] Manifest e approvazione registrati; banca precedente ripristinabile.

## 11. G3 - Apertura al pubblico

- [ ] G1 e G2 completati con evidenze aggiornate.
- [ ] Dati demo assenti dalle prove pubbliche e quote gratuite inizializzate correttamente.
- [ ] Produzione controllata con HTTPS, dominio, email e segreti live corretti.
- [ ] Prezzo totale, validità, venditore, supporto e condizioni visibili.
- [ ] Acquisto reale autorizzato e controllato, sblocco e documentazione coerenti.
- [ ] Avvisi ufficiali ricontrollati, nessuna promessa contraddetta dal calendario.
- [ ] Misure su carico e quote adeguate al lancio; intervento su picco predisposto.
- [ ] Assistenza, monitoraggio, rollback e interruttori provati.
- [ ] Titolare decide l'apertura, con data e versione registrate.

## 12. Criteri di blocco e dopo apertura

Bloccano il lancio: chiavi non verificate, perdita contenuti, prezzo/validità ambigui, sblocco senza pagamento, accesso a dati altrui, tempo modificabile, perdita risposte silenziosa, diritti di riutilizzo irrisolti, documenti commerciali incompleti o impossibilità di recuperare dati.

Piccoli difetti visivi non compromettenti possono restare con scadenza di correzione e accettazione del titolare; non includere in questa categoria ostacoli che impediscono a un utente di leggere o rispondere.

Prime 24-72 ore: controllare registrazioni/email, avvii, consegne, acquisti, accessi e ticket; confrontare errori e costi col profilo testato. Prima di aggiungere funzioni P1 chiudere gli incidenti e verificare che la banca resti aggiornata. Dopo ogni modifica, ripetere i test interessati e i percorsi critici, senza rifare indiscriminatamente tutto se non necessario.
