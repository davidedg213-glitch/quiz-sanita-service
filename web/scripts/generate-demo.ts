import { mkdirSync, writeFileSync } from "node:fs";
import { createDemoBank, bankHash } from "../src/domain/bank";
mkdirSync("fixtures", { recursive: true });
const bank = createDemoBank();
writeFileSync("fixtures/demo-bank.json", JSON.stringify(bank, null, 2) + "\n");
writeFileSync("fixtures/demo-manifest.json", JSON.stringify({ schemaVersion: "1.0", version: bank.bank_version, questionCount: bank.questions.length,
  contentChecksum: bankHash(bank), source: bank.source, synthetic: true, categories: [...new Set(bank.questions.map(q => q.category))] }, null, 2) + "\n");
console.log(`Banca sintetica generata: ${bank.questions.length} quesiti, versione ${bank.bank_version}.`);
