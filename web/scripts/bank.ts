import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { parseBank, bankHash } from "../src/domain/bank";
import { getStore } from "../src/server/store";
const [command, argument] = process.argv.slice(2);
try {
  if (command === "check" || command === "import") {
    if (!argument) throw new Error("Indica il percorso del JSON normalizzato.");
    const bank = parseBank(JSON.parse(readFileSync(argument, "utf8")));
    for (const q of bank.questions) for (const m of q.media) if (!existsSync(join(process.cwd(), "public", m.path))) throw new Error(`Immagine mancante: ${m.path}`);
    console.log(JSON.stringify({ valid: true, synthetic: true, version: bank.bank_version, count: bank.questions.length, checksum: bankHash(bank),
      ...(command === "import" ? { import: getStore().importBank(bank) } : {}) }, null, 2));
  } else if (command === "activate") {
    if (!argument) throw new Error("Indica l'ID della banca da attivare, ottenuto da bank:list.");
    console.log(JSON.stringify(getStore().activateBank(argument), null, 2));
  } else if (command === "list") console.log(JSON.stringify(getStore().banks(), null, 2));
  else throw new Error("Usa check, import, activate o list.");
} catch (error) { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; }
