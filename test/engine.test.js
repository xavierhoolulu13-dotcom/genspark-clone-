/* Node smoke tests for the offline engine (run: node test/engine.test.js) */
"use strict";
const fs = require("fs");
const vm = require("vm");

// minimal browser-ish sandbox
const sandbox = {
  console, localStorage: null, location: { hash: "" },
  navigator: { onLine: false },
  document: { getElementById: () => null, createElement: () => ({ style: {}, classList: { add() {}, remove() {} }, appendChild() {} }) },
  window: {}, setTimeout, clearTimeout, setInterval, clearInterval,
  fetch: () => Promise.reject(new Error("offline")),
};
sandbox.window = sandbox;
vm.createContext(sandbox);
for (const f of ["assets/js/kb.js", "assets/js/engine.js"]) {
  vm.runInContext(fs.readFileSync(f, "utf8"), sandbox, { filename: f });
}
const { Engine, Copilot } = sandbox;
const KB = vm.runInContext("KB", sandbox); // top-level const lives in the realm's lexical env

let pass = 0, fail = 0;
function check(name, cond) { cond ? pass++ : (fail++, console.log("FAIL:", name)); }

// 1. KB integrity
check("30+ topics", KB.topics.length >= 30);
check("trending = 10", KB.trendingList.length === 10);
for (const t of KB.topics) {
  if (!t.summary || t.sections.length < 3 || t.facts.length < 4) { fail++; console.log("WEAK TOPIC:", t.id); }
  for (const r of t.related) if (!KB.byId[r]) { fail++; console.log("BROKEN RELATED:", t.id, "->", r); }
}

// 2. offline search
const q1 = Engine.localSearch("black holes");
check("finds black holes", q1[0] && q1[0].topic.id === "black-holes");
const q2 = Engine.localSearch("what is a qubit");
check("finds quantum computing", q2[0] && q2[0].topic.id === "quantum-computing");
const q3 = Engine.localSearch("who painted the mona lisa");
check("unknown handled (no crash)", Array.isArray(q3));

// 3. page building
const page = Engine.pageFromTopic(KB.byId["artificial-intelligence"], "ai");
check("page has sections", page.sections.length >= 5);
check("page article text", page.articleText.length > 500);

// 4. copilot
let [ans] = Copilot.respond("hello", { page }, "spark");
check("greeting", /Hi|Hey/i.test(ans));
[ans] = Copilot.respond("what time is it", { page }, "spark");
check("time", /:/.test(ans));
[ans] = Copilot.respond("12 * (3 + 4)", { page }, "spark");
check("math = 84", /84/.test(ans));
[ans] = Copilot.respond("summarize this page", { page }, "spark");
check("summary mentions AI", /Summary/.test(ans) && /Artificial intelligence/.test(ans));
[ans] = Copilot.respond("key facts", { page }, "spark");
check("facts", /1956/.test(ans));
[ans] = Copilot.respond("when was the field founded", { page }, "spark");
check("page QA finds 1956", /1956/.test(ans));
// no page at all: pure KB question
[ans] = Copilot.respond("what is blockchain", {}, "spark");
check("KB QA without page", /ledger|transactions/i.test(ans));
// search command → nav stub
[ans] = Copilot.respond("search black holes", { page }, "spark");
check("nav stub", ans.startsWith("__NAV__"));

// 5. autopilot (offline path)
sandbox.navigator.onLine = false;
Engine.autopilotRun("research quantum computing", () => {}).then(p => {
  check("autopilot returns a page", p && p.title && p.sections.length > 0);
  check("autopilot finds right topic", /Quantum/.test(p.title));
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}).catch(e => { console.log("autopilot threw", e); process.exit(1); });
