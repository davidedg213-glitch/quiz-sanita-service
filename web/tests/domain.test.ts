import test from "node:test";
import assert from "node:assert/strict";
import { createDemoBank, parseBank, publicQuestion } from "../src/domain/bank";
import { classify, score } from "../src/domain/score";

const cases = [[30,0,0,3000], [21,0,9,2100], [20,0,10,2000], [22,3,5,2101], [22,4,4,2068], [0,30,0,-990], [0,0,30,0], [24,6,0,2202], [21,1,8,2067]];
for (const [correct,wrong,omitted,expected] of cases) test(`Punteggio esatto: ${correct} esatte, ${wrong} errate, ${omitted} omesse`, () => {
  const result = score([...Array(correct).fill("correct"), ...Array(wrong).fill("wrong"), ...Array(omitted).fill("omitted")]);
  assert.equal(result.cents, expected); assert.equal(result.reached, expected >= 2100); assert.equal(result.correct + result.wrong + result.omitted, 30);
});
test("Una risposta multipla è errata, una scelta vuota è omessa", () => {
  assert.equal(classify(["A", "B"], "A"), "wrong"); assert.equal(classify([], "A"), "omitted");
  assert.throws(() => score(["correct"]));
});
test("La banca sintetica ha 1500 ID distinti, alternative variabili e una figura", () => {
  const bank = createDemoBank(); assert.equal(bank.questions.length, 1500);
  assert.equal(new Set(bank.questions.map(q => q.official_id)).size, 1500);
  assert.deepEqual([...new Set(bank.questions.map(q => q.options.length))].sort(), [2,3,4,5,6]);
  assert.ok(bank.questions.some(q => q.media.length));
});
test("Importazione respinge ID duplicati, chiavi errate e HTML attivo", () => {
  const duplicate = createDemoBank("test", 30); duplicate.questions[1].official_id = duplicate.questions[0].official_id; assert.throws(() => parseBank(duplicate));
  const missingKey = createDemoBank("test", 30); missingKey.questions[0].correct_option_id = "inesistente"; assert.throws(() => parseBank(missingKey));
  const html = createDemoBank("test", 30); html.questions[0].text = '<script>alert("x")</script>'; assert.throws(() => parseBank(html));
});
test("Il contratto pubblico esclude soluzione e spiegazione", () => {
  const output = publicQuestion(createDemoBank("test", 30).questions[0]);
  assert.equal("correct_option_id" in output, false); assert.equal("explanation" in output, false);
});
