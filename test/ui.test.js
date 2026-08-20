/* DOM-level integration test with jsdom (run: node test/ui.test.js) */
"use strict";
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const vm = require("vm");

const html = fs.readFileSync("index.html", "utf8");
const dom = new JSDOM(html, { url: "http://localhost:8080/", runScripts: "dangerously", pretendToBeVisual: true });
const { window } = dom;
const { document } = window;

// Run each file as its own script in the shared context — same semantics as <script> tags
const ctx = dom.getInternalVMContext();
for (const f of ["assets/js/kb.js", "assets/js/backend.js", "assets/js/engine.js", "assets/js/app.js"]) {
  new vm.Script(fs.readFileSync(f, "utf8"), { filename: f }).runInContext(ctx);
}

const sleep = ms => new Promise(r => setTimeout(r, ms));
let pass = 0, fail = 0;
const check = (name, cond) => { cond ? pass++ : (fail++, console.log("FAIL:", name)); };

(async () => {
  await sleep(50);

  // --- home renders ---
  check("home hero", !!document.querySelector(".home-bot"));
  check("10 trending items", document.querySelectorAll(".trend-item").length === 10);
  check("6 tool chips", document.querySelectorAll(".tool-chip").length === 6);

  // --- run a search (offline fallback path) ---
  document.getElementById("sb").value = "climate change";
  document.getElementById("sb-send").click();
  check("hash routed", window.location.hash.startsWith("#/spark"));
  window.dispatchEvent(new window.Event("hashchange"));
  await sleep(700);

  const title = document.querySelector(".spark-title");
  check("sparkpage title rendered", title && /Climate Change/.test(title.textContent));
  check("sources labeled local", document.body.textContent.includes("Local Knowledge Base"));
  check("sections rendered", document.querySelectorAll(".article h2").length >= 4);
  check("fact cards ≥4", document.querySelectorAll(".fact").length >= 4);
  check("related chips", document.querySelectorAll(".rel-q .q").length >= 3);
  check("copilot mounted", !!document.getElementById("copilot-input"));

  // --- copilot interaction ---
  const input = document.getElementById("copilot-input");
  input.value = "how much has earth warmed?";
  document.getElementById("csend").click();
  await sleep(1300);
  const msgs = [...document.querySelectorAll(".msg.assistant")].map(m => m.textContent);
  check("copilot answered page QA", msgs.some(m => /1\.2|1\.3|warm/i.test(m)));

  // --- save offline & library ---
  document.getElementById("btn-save")?.click();
  await sleep(50);
  const saved = JSON.parse(window.localStorage.getItem("gs_saved") || "{}");
  check("page saved to localStorage", !!saved["Climate Change"]);

  window.location.hash = "#/library";
  window.dispatchEvent(new window.Event("hashchange"));
  await sleep(80);
  check("library lists saved page", document.getElementById("lib-saved").textContent.includes("Climate Change"));
  check("history recorded", document.getElementById("lib-history").textContent.includes("climate change"));

  // --- offline banner toggling ---
  window.dispatchEvent(new window.Event("offline"));
  check("offline banner shows", !document.getElementById("offline-banner").classList.contains("hidden"));
  check("badge shows offline", document.getElementById("conn-badge").textContent.includes("Offline"));
  window.dispatchEvent(new window.Event("online"));
  check("banner hides when back online", document.getElementById("offline-banner").classList.contains("hidden"));

  // --- unknown query still useful ---
  window.location.hash = "#/" ;
  window.dispatchEvent(new window.Event("hashchange"));
  await sleep(40);
  document.getElementById("sb").value = "quantum banana rally championship";
  document.getElementById("sb-send").click();
  window.dispatchEvent(new window.Event("hashchange"));
  await sleep(250);
  window.dispatchEvent(new window.Event("hashchange"));
  await sleep(250);
  check("unknown query renders fallback page", document.body.textContent.includes("offline")
      && !!document.querySelector(".spark-title"));

  // --- agents + persona switch ---
  window.location.hash = "#/agents";
  window.dispatchEvent(new window.Event("hashchange"));
  await sleep(40);
  check("agents grid", document.querySelectorAll(".agent-card").length === 6);
  document.querySelector('.agent-card[data-p="coder"]').click();
  await sleep(40);
  check("persona tag updates", document.querySelector('.agent-card[data-p="coder"]').textContent.includes("✓ active"));

  // --- autopilot renders steps ---
  window.location.hash = "#/autopilot";
  window.dispatchEvent(new window.Event("hashchange"));
  await sleep(40);
  document.getElementById("ap-input").value = "research black holes";
  document.getElementById("ap-run").click();
  await sleep(8000);
  check("autopilot steps done", document.querySelectorAll(".step.done").length === 5);
  check("autopilot report", !!document.getElementById("ap-open"));

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
