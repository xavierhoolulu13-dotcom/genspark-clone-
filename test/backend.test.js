/* hoolulu-factory adapter tests (run: node test/backend.test.js) */
"use strict";
const fs = require("fs");
const vm = require("vm");

function makeSandbox(fetchImpl) {
  const mem = {};
  const listeners = {};
  const sb = {
    console, Date, JSON, Math,
    setTimeout, clearTimeout, setInterval, clearInterval,
    AbortController: globalThis.AbortController,
    fetch: fetchImpl,
    navigator: { onLine: true },
    localStorage: {
      getItem: k => (k in mem ? mem[k] : null),
      setItem: (k, v) => { mem[k] = String(v); },
      removeItem: k => { delete mem[k]; },
    },
    _mem: mem,
  };
  class CustomEvent { constructor(type, opts) { this.type = type; this.detail = opts?.detail; } }
  sb.CustomEvent = CustomEvent;
  sb.addEventListener = (t, f) => { (listeners[t] = listeners[t] || []).push(f); };
  sb.dispatchEvent = e => { (listeners[e.type] || []).forEach(f => f(e)); return true; };
  sb._listeners = listeners;
  sb.window = sb;
  vm.createContext(sb);
  for (const f of ["assets/js/kb.js", "assets/js/backend.js", "assets/js/engine.js"]) {
    vm.runInContext(fs.readFileSync(f, "utf8"), sb, { filename: f });
  }
  return sb;
}

let pass = 0, fail = 0;
const check = (name, cond) => { cond ? pass++ : (fail++, console.log("FAIL:", name)); };

(async () => {
  /* 1) unconfigured: never probes, stays local */
  {
    let calls = 0;
    const sb = makeSandbox(() => { calls++; return Promise.reject(new Error("no")); });
    sb.navigator.onLine = false; // isolate: no wiki probing either
    check("not enabled by default", sb.Factory.enabled() === false);
    const page = await sb.Engine.research("black holes");
    check("no probe when unconfigured", calls === 0);
    check("falls back to KB", page.source === "local" && page.title === "Black Holes");
  }

  /* 2) configured & healthy: factory search wins */
  {
    const calls = [];
    const fetchImpl = (url, opts) => {
      calls.push(url);
      if (url.endsWith("/api/health"))
        return Promise.resolve({ ok: true, headers: { get: () => "application/json" }, json: () => Promise.resolve({ ok: true }) });
      if (url.endsWith("/api/search"))
        return Promise.resolve({
          ok: true, headers: { get: () => "application/json" },
          json: () => Promise.resolve({
            title: "EV Market Report",
            summary: "A factory-built answer.",
            facts: { "Rows analyzed": "1,204", "Confidence": "high" },
            sections: [
              { heading: "Overview", body: "EVs are growing fast." },
              { heading: "Margins", body: "Battery costs dominate." },
            ],
            related: ["Battery recycling"],
            sources: [{ title: "factory_brain", url: "http://localhost:8000" }],
          }),
        });
      return Promise.reject(new Error("unexpected " + url));
    };
    const sb = makeSandbox(fetchImpl);
    sb.localStorage.setItem("gs_factory_url", "http://localhost:8000/");
    check("enabled after config", sb.Factory.enabled() === true);
    check("url trimmed of slash", sb.Factory.url() === "http://localhost:8000");

    const events = [];
    sb.addEventListener("factory-status", e => events.push(e.detail.ok));
    const ok = await sb.Factory.health(true);
    check("health probe ok", ok === true);
    check("status event fired", events.length >= 1 && events[0] === true);

    const page = await sb.Engine.research("ev market");
    check("factory wins when up", page.source === "factory");
    check("normalized title", page.title === "EV Market Report");
    check("facts object → pairs", page.facts.some(f => f.k === "Rows analyzed" && f.v === "1,204"));
    check("sections normalized", page.sections.length >= 2 && page.sections[0].h === "Overview");
    check("related mapped", page.related[0]?.title === "Battery recycling");
    check("factory source listed", page.sources.some(s => /hoolulu-factory/.test(s.title)));
    check("health cached (1 probe only)", calls.filter(u => u.endsWith("/api/health")).length === 1);
  }

  /* 3) markdown report shape → sections */
  {
    const sb = makeSandbox((url) => {
      if (url.endsWith("/api/health")) return Promise.resolve({ ok: true, headers: { get: () => "" }, text: () => Promise.resolve("ok") });
      if (url.endsWith("/api/search"))
        return Promise.resolve({ ok: true, headers: { get: () => "application/json" },
          json: () => Promise.resolve({ title: "Report", report: "## Findings\n\nSales grew 40% in Q2.\n\n## Risks\n\nChurn is rising." }) });
      return Promise.reject(new Error("unexpected"));
    });
    sb.localStorage.setItem("gs_factory_url", "http://localhost:8000");
    const page = await sb.Factory.search("q2 sales");
    check("markdown → sections", page.sections.length === 2 && page.sections[0].h === "Findings");
    check("paragraph captured", page.sections[0].p[0].includes("40%"));
    check("articleText built", page.articleText.includes("Churn"));
  }

  /* 4) copilot: factory answers open questions; math stays local */
  {
    let chatCalls = 0;
    const sb = makeSandbox((url, opts) => {
      if (url.endsWith("/api/health")) return Promise.resolve({ ok: true, headers: { get: () => "" }, text: () => Promise.resolve("ok") });
      if (url.endsWith("/api/chat")) {
        chatCalls++;
        return Promise.resolve({ ok: true, headers: { get: () => "application/json" },
          json: () => Promise.resolve({ answer: "Because Rayleigh scattering favors blue wavelengths." }) });
      }
      return Promise.reject(new Error("unexpected " + url));
    });
    sb.localStorage.setItem("gs_factory_url", "http://localhost:8000");
    const [a1] = await sb.Copilot.respondAsync("why is the sky blue?", {}, "spark");
    check("factory answered question", chatCalls === 1 && /Rayleigh/.test(a1) && /hoolulu-factory/.test(a1));
    const [a2] = await sb.Copilot.respondAsync("12 * (3 + 4)", {}, "spark");
    check("math stays local", /84/.test(a2) && chatCalls === 1);
  }

  /* 5) factory down → graceful fallbacks */
  {
    const sb = makeSandbox(() => Promise.reject(new Error("ECONNREFUSED")));
    sb.localStorage.setItem("gs_factory_url", "http://localhost:8000");
    sb.navigator.onLine = false;
    sb.Factory._health = { at: 0, ok: true }; // pretend previously up; force re-probe
    const page = await sb.Engine.research("quantum computing");
    check("falls back to KB when factory down", page.source === "local");
    const [ans] = await sb.Copilot.respondAsync("what markets most want now?", {}, "spark");
    check("copilot falls back local", typeof ans === "string" && ans.length > 10 && !/ECONN/.test(ans));
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
