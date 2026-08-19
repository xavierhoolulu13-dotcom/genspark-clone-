/* ============================================================
   App — views, router, PWA install, connectivity, library
   ============================================================ */
(() => {
"use strict";

const { esc, debounce, timeAgo, toast, trunc } = window.Util;

/* ---------- persistent store ---------- */
const store = {
  get(k, dflt) { try { const v = localStorage.getItem("gs_" + k); return v ? JSON.parse(v) : dflt; } catch { return dflt; } },
  set(k, v) { try { localStorage.setItem("gs_" + k, JSON.stringify(v)); } catch { /* full */ } },
};
function pushHistory(entry) {
  const h = store.get("history", []);
  h.unshift(entry);
  store.set("history", h.slice(0, 60));
}
function savePage(page) {
  const saved = store.get("saved", {});
  saved[page.title] = { page, savedAt: Date.now() };
  const keys = Object.keys(saved);
  if (keys.length > 20) { // trim oldest
    keys.sort((a, b) => saved[a].savedAt - saved[b].savedAt);
    for (const k of keys.slice(0, keys.length - 20)) delete saved[k];
  }
  store.set("saved", saved);
}
function isSaved(title) { return !!store.get("saved", {})[title]; }

/* ============================================================
   Router
   ============================================================ */
const view = document.getElementById("view");
let state = { persona: "spark", chatLog: [] };

function route() {
  const hash = location.hash || "#/";
  const [path, query] = hash.slice(1).split("?");
  const params = new URLSearchParams(query || "");
  document.querySelectorAll(".rail-item").forEach(a => {
    const r = a.dataset.route;
    if (!r) return;
    const active = ("#" + path) === r || (r === "#/" && (path === "/" || path.startsWith("/spark")));
    a.classList.toggle("active", active);
  });
  switch (path) {
    case "/": renderHome(); break;
    case "/spark": renderSpark(params.get("q") || ""); break;
    case "/autopilot": renderAutopilot(); break;
    case "/agents": renderAgents(); break;
    case "/chat": renderChat(); break;
    case "/library": renderLibrary(); break;
    default: renderHome();
  }
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", route);

function go(path) { location.hash = "#" + path; }
function doSearch(q, mode) {
  q = (q || "").trim();
  if (!q) return;
  // @agent mention
  const mention = q.match(/@(\w+)/);
  if (mention) {
    const p = mention[1].toLowerCase();
    if (window.Copilot.personaPrompts[p]) state.persona = p;
    q = q.replace(/@\w+\s*/, "").trim() || mention[1];
  }
  go("/spark?q=" + encodeURIComponent(q) + (mode && mode !== "auto" ? "&mode=" + mode : ""));
}

/* ============================================================
   HOME
   ============================================================ */
function renderHome() {
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const tools = [
    ["✨", "Auto Agent", () => toast("Auto Agent is the default mode — just type a question!")],
    ["📊", "AI Slides", () => toast("Offline demo: Slides agent parked. Try Auto Agent!")],
    ["📈", "AI Sheets", () => toast("Sheets agent not included in this clone — the copilot does math though!")],
    ["💬", "AI Chat", () => go("/chat")],
    ["🤖", "Agents", () => go("/agents")],
    ["✈", "Autopilot", () => go("/autopilot")],
  ];
  const trending = KB.trendingList;
  const half = Math.ceil(trending.length / 2);
  const col = list => list.map((t, i) => `
    <div class="trend-item" data-q="${esc(t.title)}">
      <span class="rank">${t.trending}</span>
      <span class="t-title">${esc(t.title)}</span>
      <span class="t-net">${navigator.onLine ? "🌐" : "📦"}</span>
    </div>`).join("");

  view.innerHTML = `
  <div class="home">
    <div class="home-bot"><img src="assets/icons/icon-512.png" alt="Genspark bot"></div>
    <h1>${greet}</h1>
    <p class="sub">How can I help you today?</p>

    <div class="searchbox">
      <textarea id="sb" rows="2" placeholder="Ask anything. @ to mention agents. Works online &amp; offline."></textarea>
      <div class="searchbox-foot">
        <span class="mode-pill" id="mode-pill">✨ Auto Agent</span>
        <button class="icon-btn" id="sb-attach" title="Attach (demo)">＋</button>
        <button class="icon-btn" id="sb-mic" title="Voice (demo)">🎙</button>
        <button class="send-btn" id="sb-send" title="Search">➤</button>
      </div>
    </div>
    <div id="suggest" style="width:min(760px,100%)"></div>

    <div class="chip-row">
      ${tools.map(t => `<button class="tool-chip" data-tool="${esc(t[1])}"><span>${t[0]}</span>${esc(t[1])}</button>`).join("")}
    </div>

    <div class="trending">
      <h2>🔥 This week's hot searches</h2>
      <div class="t-sub">Everything below is in the offline knowledge base — tap anything, anytime.</div>
      <div class="trending-cols">
        ${col(trending.slice(0, half))}
        ${col(trending.slice(half))}
      </div>
    </div>

    <p class="powered">Genspark clone · hybrid online/offline AI agent · ${navigator.onLine ? "🌐 live mode" : "📦 offline mode"} · your data never leaves this device</p>
  </div>`;

  const sb = document.getElementById("sb");
  const send = () => doSearch(sb.value);
  document.getElementById("sb-send").onclick = send;
  sb.addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } });
  document.getElementById("sb-attach").onclick = () => toast("Attachments aren't wired up in the demo — text works anywhere though.");
  document.getElementById("sb-mic").onclick = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return toast("Voice input not supported in this browser.");
    const rec = new SR(); rec.lang = "en-US";
    toast("🎙 Listening…");
    rec.onresult = e => { sb.value = e.results[0][0].transcript; send(); };
    rec.onerror = () => toast("Voice input failed."); rec.start();
  };
  document.getElementById("mode-pill").onclick = () =>
    toast("Auto Agent picks the best tool automatically. @coder, @chef, @coach, @travel, @researcher also work!");
  document.querySelectorAll(".tool-chip").forEach(b => b.onclick = () => tools.find(t => t[1] === b.dataset.tool)[2]());
  document.querySelectorAll(".trend-item").forEach(el => el.onclick = () => doSearch(el.dataset.q));
  sb.focus();

  // live suggestions
  const sug = document.getElementById("suggest");
  sb.addEventListener("input", debounce(() => {
    const q = sb.value.trim();
    if (q.length < 2) { sug.innerHTML = ""; return; }
    const items = Engine.localSuggest(q, 5);
    if (!items.length) { sug.innerHTML = ""; return; }
    sug.innerHTML = `<div class="toc" style="padding:8px 10px;margin:8px 0 0">` +
      items.map(t => `<a style="display:flex;gap:8px;align-items:center;cursor:pointer" data-q="${esc(t.title)}">
        <span>${t.emoji}</span><span>${esc(t.title)}</span><span style="color:var(--muted);font-size:11px;margin-left:auto">${esc(t.category)}</span></a>`).join("") + `</div>`;
    sug.querySelectorAll("a").forEach(a => a.onclick = () => doSearch(a.dataset.q));
  }, 120));
}

/* ============================================================
   SPARKPAGE VIEW
   ============================================================ */
let currentPage = null;

function renderSpark(query) {
  if (!query.trim()) return go("/");
  // loading skeleton
  view.innerHTML = `
  <div class="spark-layout">
    <div class="spark-main">
      <div class="spark-head">${searchBarHTML(query)}</div>
      <div class="gen-status"><span class="spin"></span><span id="gen-msg">GenSpark agent is researching “${esc(query)}”…</span></div>
      <div class="skel" style="height:34px;width:60%;margin-bottom:14px"></div>
      <div class="skel" style="height:200px;margin-bottom:14px"></div>
      <div class="skel" style="height:14px;width:90%;margin-bottom:8px"></div>
      <div class="skel" style="height:14px;width:80%;margin-bottom:8px"></div>
      <div class="skel" style="height:14px;width:85%"></div>
    </div>
    <aside class="copilot" id="copilot-slot">
      <div class="copilot-head">
        <div class="c-title"><img src="assets/icons/icon-192.png" alt="">SparkAI <span class="chip" style="font-size:10px;padding:3px 8px">reading sources…</span></div>
        <div class="c-sub">Warming up — I'll know this page in a moment.</div>
      </div>
    </aside>
  </div>`;
  bindSearchBar();

  const msgs = ["Scanning sources…", "Extracting key facts…", "Synthesizing Sparkpage…"];
  let mi = 0;
  const msgEl = document.getElementById("gen-msg");
  const timer = setInterval(() => { mi++; if (msgEl && msgs[mi % msgs.length]) msgEl.textContent = msgs[mi % msgs.length]; }, 900);

  Engine.research(query).then(page => {
    clearInterval(timer);
    currentPage = page;
    pushHistory({ q: query, title: page.title, ts: Date.now(), source: page.source });
    renderSparkPage(page);
  }).catch(err => {
    clearInterval(timer);
    console.error(err);
    renderSparkPage(Engine.pageFromUnknown(query));
  });
}

function searchBarHTML(value) {
  return `
  <div class="searchbox" style="padding:8px 12px;border-radius:16px">
    <textarea id="sb2" rows="1" style="font-size:15px">${esc(value)}</textarea>
    <div class="searchbox-foot" style="margin-top:4px">
      <span class="mode-pill" style="font-size:11px;padding:3px 10px">✨ Auto Agent</span>
      <button class="send-btn" id="sb2-send" style="width:32px;height:32px;font-size:14px">➤</button>
    </div>
  </div>`;
}
function bindSearchBar() {
  const sb = document.getElementById("sb2");
  if (!sb) return;
  const send = () => doSearch(sb.value);
  document.getElementById("sb2-send").onclick = send;
  sb.addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } });
}

function renderSparkPage(page) {
  const isLive = page.source === "live";
  const saveBtn = isSaved(page.title)
    ? `<button class="btn ghost" disabled>✓ Saved for offline</button>`
    : `<button class="btn gradient" id="btn-save">⬇ Save offline</button>`;

  const tocItems = page.sections.map((s, i) => `<a href="#sec-${i}" data-sec="${i}">${esc(s.h)}</a>`).join("");
  const sectionsHTML = page.sections.map((s, i) => `
    <h2 id="sec-${i}"><span class="sec-num">${String(i + 1).padStart(2, "0")}</span>${esc(s.h)}</h2>
    ${s.p.map((para, pi) => `<p class="${s.lede && pi === 0 ? "lede" : ""}">${esc(para)}</p>`).join("")}
  `).join("");

  view.innerHTML = `
  <div class="spark-layout">
    <div class="spark-main">
      <div class="spark-head">${searchBarHTML(page.query)}</div>
      <div class="crumb" style="margin-top:16px">
        <span class="src-dot ${isLive ? "live" : "local"}"></span>
        <span>Sparkpage</span><span>·</span>
        <span class="src">${esc(page.sourceLabel)}</span><span>·</span>
        <span>just now</span>
        ${esc(page.category) ? `<span>·</span><span>${esc(page.category)}</span>` : ""}
      </div>
      <h1 class="spark-title">${esc(page.title)}</h1>

      <div class="src-chips">
        ${page.sources.filter(Boolean).map(s => s.url
          ? `<a class="src-chip" href="${esc(s.url)}" target="_blank" rel="noopener">${s.fav ? `<img src="${s.fav}" onerror="this.remove()">` : "🔗"}<span class="t">${esc(s.title)}</span></a>`
          : `<span class="src-chip">${s.fav ? `<img src="${s.fav}" onerror="this.remove()">` : "📦"}<span class="t">${esc(s.title)}</span></span>`).join("")}
      </div>

      <div class="hero-card">
        ${page.heroImage
          ? `<img src="${page.heroImage}" alt="${esc(page.title)}" onerror="this.parentElement.querySelector('.hero-emoji-fallback')?.classList.remove('hidden');this.remove()">
             <div class="hero-emoji hero-emoji-fallback hidden">${page.emoji}</div>`
          : `<div class="hero-emoji">${page.emoji}</div>`}
        <div class="caption">${esc(page.heroCaption || "")}</div>
      </div>

      <div class="save-row">${saveBtn}
        <button class="btn ghost" id="btn-share">🔗 Share / copy link</button>
        <button class="btn ghost" id="btn-ask">✨ Ask SparkAI</button>
      </div>

      <div class="toc"><div class="toc-h">On this page</div>${tocItems}</div>

      ${page.facts.length ? `<div class="facts">${page.facts.map(f => `<div class="fact"><div class="fk">${esc(f.k)}</div><div class="fv">${esc(f.v)}</div></div>`).join("")}</div>` : ""}

      <article class="article">${sectionsHTML}</article>

      ${page.gallery.length ? `
        <h2 style="font-size:21px;margin:34px 0 10px;border-top:1px solid var(--border-soft);padding-top:10px"><span class="sec-num">📷</span>Gallery</h2>
        <div class="gallery">${page.gallery.map(g => `<figure><img src="${g.src}" loading="lazy" onerror="this.closest('figure').remove()"><figcaption>${esc(g.caption)}</figcaption></figure>`).join("")}</div>` : ""}

      ${page.related.length ? `
        <h2 style="font-size:21px;margin:34px 0 4px;border-top:1px solid var(--border-soft);padding-top:10px"><span class="sec-num">↗</span>Related searches</h2>
        <div class="rel-q">${page.related.map(r => `<button class="q" data-q="${esc(r.title)}">${esc(r.title)}</button>`).join("")}</div>` : ""}

      <div class="spark-foot">
        Generated ${isLive ? "🌐 live from the web" : "📦 100% offline from the local knowledge base"} · ${new Date(page.generatedAt).toLocaleTimeString()} ·
        This is a demo clone of Genspark's Sparkpage format — verify important information with primary sources.
      </div>
    </div>
    <aside class="copilot" id="copilot-slot"></aside>
  </div>`;

  bindSearchBar();
  mountCopilot(document.getElementById("copilot-slot"), { page });

  document.getElementById("btn-save")?.addEventListener("click", e => {
    savePage(page);
    e.target.outerHTML = `<button class="btn ghost" disabled>✓ Saved for offline</button>`;
    toast("💾 Saved to your library — readable even with no connection.");
  });
  document.getElementById("btn-share").onclick = () => {
    const link = location.href;
    (navigator.share ? navigator.share({ title: page.title, url: link }) : navigator.clipboard.writeText(link))
      .then(() => toast("Link ready to paste anywhere."))
      .catch(() => {});
  };
  document.getElementById("btn-ask").onclick = () => {
    document.getElementById("copilot-input")?.focus();
    toast("SparkAI knows this whole page — ask away!");
  };
  document.querySelectorAll(".rel-q .q").forEach(b => b.onclick = () => doSearch(b.dataset.q));
  document.querySelectorAll(".toc a").forEach(a => a.onclick = e => {
    e.preventDefault();
    document.getElementById("sec-" + a.dataset.sec)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

/* ============================================================
   COPILOT PANEL
   ============================================================ */
function mountCopilot(slot, ctx) {
  const persona = window.Copilot.personaPrompts[state.persona] || window.Copilot.personaPrompts.spark;
  const sugg = ctx.page
    ? ["Summarize this page", "Key facts", "Related topics", "Is this offline data?"]
    : ["What can you do?", "Search black holes", "42 * 1.5 + 8", "What time is it?"];

  slot.innerHTML = `
    <div class="copilot-head">
      <div class="c-title"><img src="assets/icons/icon-192.png" alt="">${esc(persona.name)}
        <span class="chip" style="font-size:10px;padding:3px 8px">${navigator.onLine ? "online+offline" : "offline brain"}</span>
      </div>
      <div class="c-sub">Ask anything about this page — answers are generated locally, instantly.</div>
    </div>
    <div class="copilot-body" id="cbody"></div>
    <div class="copilot-foot">
      <div class="sugg" id="csugg">${sugg.map(s => `<button class="s">${esc(s)}</button>`).join("")}</div>
      <div class="c-input">
        <textarea id="copilot-input" rows="1" placeholder="Ask me anything…"></textarea>
        <button class="send-btn" id="csend">➤</button>
      </div>
    </div>`;

  const body = slot.querySelector("#cbody");
  const input = slot.querySelector("#copilot-input");
  const sendBtn = slot.querySelector("#csend");

  const addMsg = (text, who) => {
    const el = document.createElement("div");
    el.className = "msg " + who;
    el.innerHTML = esc(text);
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
    return el;
  };

  addMsg(`${persona.emoji} I'm ${persona.name}. I've read “${ctx.page ? ctx.page.title : "this"}” — ask me about it, or try a suggestion below.`, "assistant");

  const respond = (q) => {
    addMsg(q, "user");
    input.value = "";
    const typing = document.getElementById("tpl-typing").content.firstElementChild.cloneNode(true);
    body.appendChild(typing); body.scrollTop = body.scrollHeight;
    setTimeout(() => {
      typing.remove();
      const [text] = window.Copilot.respond(q, ctx, state.persona);
      if (text === "__NAVHOME__") { go("/"); return; }
      if (text?.startsWith("__NAV__:")) { doSearch(text.slice(8)); return; }
      addMsg(text, "assistant");
    }, 420 + Math.random() * 500);
  };
  const trySend = () => { const q = input.value.trim(); if (q) respond(q); };
  sendBtn.onclick = trySend;
  input.addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); trySend(); } });
  slot.querySelectorAll("#csugg .s").forEach(b => b.onclick = () => respond(b.textContent));
}

/* ============================================================
   AUTOPILOT AGENT
   ============================================================ */
function renderAutopilot() {
  view.innerHTML = `
  <div class="center-page">
    <h1 class="page-title">✈ Autopilot Agent</h1>
    <p class="page-sub">Give it a research task. It plans, executes steps, and hands you a Sparkpage — fully offline when needed.</p>
    <div class="searchbox" style="border-radius:16px">
      <textarea id="ap-input" rows="2" placeholder="e.g. “Research the future of electric vehicles” or “Explain CRISPR like I'm hiring it”"></textarea>
      <div class="searchbox-foot">
        <span class="mode-pill">✈ Autopilot</span>
        <button class="send-btn" id="ap-run">➤</button>
      </div>
    </div>
    <div id="ap-steps" style="margin-top:26px"></div>
    <div id="ap-report"></div>
  </div>`;

  const input = document.getElementById("ap-input");
  const stepsEl = document.getElementById("ap-steps");
  const reportEl = document.getElementById("ap-report");
  input.addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); run(); } });
  document.getElementById("ap-run").onclick = run;

  const STEP_META = [
    ["Understand the request", "Parsing intent & extracting concepts"],
    ["Plan research path", "Building a step-by-step plan"],
    ["Gather core facts", "Querying sources"],
    ["Analyze and cross-check", "Verifying consistency"],
    ["Synthesize Sparkpage", "Composing final report"],
  ];

  async function run() {
    const task = input.value.trim();
    if (!task) return toast("Describe a task first.");
    stepsEl.innerHTML = STEP_META.map((s, i) => `
      <div class="step" id="ap-step-${i}">
        <div class="s-ic">${i + 1}</div>
        <div class="s-body"><h4>${s[0]}</h4><p class="s-desc">${s[1]}</p><p class="s-out" style="color:#aab3c5"></p></div>
      </div>`).join("");
    reportEl.innerHTML = `<div class="gen-status"><span class="spin"></span>Autopilot working…</div>`;
    document.getElementById("ap-run").disabled = true;

    const page = await Engine.autopilotRun(task, (i, status, out) => {
      const el = document.getElementById("ap-step-" + i);
      if (el) {
        el.classList.remove("running", "done");
        el.classList.add(status);
        el.querySelector(".s-ic").textContent = status === "done" ? "✓" : (i + 1);
        if (out) el.querySelector(".s-out").textContent = out;
      }
    });

    reportEl.innerHTML = `
      <div class="report">
        <h3>✅ Mission complete</h3>
        <p style="color:#c9cfdb">Autopilot produced a Sparkpage for <b>“${esc(page.title)}”</b> using
        <b>${page.source === "live" ? "🌐 live web data" : "📦 the offline knowledge base"}</b>.</p>
        <div class="facts" style="margin:16px 0">${page.facts.slice(0, 4).map(f => `<div class="fact"><div class="fk">${esc(f.k)}</div><div class="fv">${esc(f.v)}</div></div>`).join("")}</div>
        <p style="color:#c9cfdb">${esc(trunc(page.sections[0].p.join(" "), 320))}</p>
        <button class="btn gradient" id="ap-open">Open full Sparkpage →</button>
      </div>`;
    document.getElementById("ap-open").onclick = () => doSearch(page.query);
    document.getElementById("ap-run").disabled = false;
  }
}

/* ============================================================
   AGENTS
   ============================================================ */
function renderAgents() {
  const personas = [
    ["spark", "✨", "SparkAI", "Default copilot persona — balanced, brief, page-aware."],
    ["researcher", "🔬", "Dr. Deep", "Rigorous research style; loves facts and structure."],
    ["coder", "👨‍💻", "DevMate", "Practical engineering voice; math and logic friendly."],
    ["chef", "👨‍🍳", "Chef Remy", "Warm explanations with culinary analogies."],
    ["travel", "🧭", "Wanderlo", "Adventurous guide for places and planning."],
    ["coach", "🏋️", "Coach Max", "High-energy motivational answers."],
  ];
  view.innerHTML = `
  <div class="center-page">
    <h1 class="page-title">🤖 Agents <span style="font-size:12px;color:var(--muted);font-weight:500">(offline personas)</span></h1>
    <p class="page-sub">Pick a brain for the SparkAI copilot. You can also mention them anywhere with <code style="background:var(--panel3);padding:1px 6px;border-radius:6px">@name</code>.</p>
    <div class="grid">
      ${personas.map(p => `
        <div class="agent-card" data-p="${p[0]}">
          <div class="a-emo">${p[1]}</div>
          <h3>${esc(p[2])}</h3>
          <p>${esc(p[3])}</p>
          <span class="a-tag">${state.persona === p[0] ? "✓ active" : "@" + p[0]}</span>
        </div>`).join("")}
    </div>
  </div>`;
  view.querySelectorAll(".agent-card").forEach(c => c.onclick = () => {
    state.persona = c.dataset.p;
    toast(`${c.querySelector("h3").textContent} is now your copilot persona.`);
    renderAgents();
  });
}

/* ============================================================
   AI CHAT (standalone)
   ============================================================ */
function renderChat() {
  view.innerHTML = `
  <div class="chat-wrap">
    <div class="persona-bar">
      <span>Talking to <b id="persona-name"></b></span>
      <span id="chat-mode"></span>
      <a class="change" href="#/agents" style="color:#a5b4fc">change →</a>
    </div>
    <aside class="copilot" id="chat-slot" style="position:static;width:100%;flex:1;height:auto;border:0;background:transparent"></aside>
  </div>`;
  const persona = window.Copilot.personaPrompts[state.persona];
  document.getElementById("persona-name").textContent = `${persona.emoji} ${persona.name}`;
  document.getElementById("chat-mode").textContent = navigator.onLine ? "· online, search-enabled" : "· offline brain";
  const slot = document.getElementById("chat-slot");
  mountCopilot(slot, { page: null });
}

/* ============================================================
   LIBRARY (Sparkpages history + saved)
   ============================================================ */
function renderLibrary() {
  const saved = store.get("saved", {});
  const savedList = Object.entries(saved).sort((a, b) => b[1].savedAt - a[1].savedAt);
  const history = store.get("history", []);
  view.innerHTML = `
  <div class="center-page">
    <h1 class="page-title">📚 Sparkpages</h1>
    <p class="page-sub">Saved pages are stored on-device and open instantly — forever free of Wi-Fi.</p>
    <div class="filter-bar"><input id="lib-filter" placeholder="Filter by title…"></div>
    <h3 style="margin:18px 0 10px">💾 Saved offline <span style="color:var(--muted);font-size:12px;font-weight:500">${savedList.length} page(s)</span></h3>
    <div id="lib-saved"></div>
    <h3 style="margin:26px 0 10px">🕘 Recent searches</h3>
    <div id="lib-history"></div>
  </div>`;

  const draw = (filter = "") => {
    const f = filter.toLowerCase();
    document.getElementById("lib-saved").innerHTML = savedList.length
      ? savedList.filter(([t]) => t.toLowerCase().includes(f)).map(([title, rec]) => `
        <div class="lib-item" data-q="${esc(rec.page.query)}">
          <span class="l-emo">${rec.page.emoji || "📄"}</span>
          <div class="l-main"><div class="l-title">${esc(title)}</div>
          <div class="l-meta">${esc(rec.page.sourceLabel)} · saved ${timeAgo(rec.savedAt)}</div></div>
          <span class="l-badge saved">offline ready</span>
          <button class="l-del" data-del="${esc(title)}" title="Remove">✕</button>
        </div>`).join("") || `<div class="empty">No saved pages match “${esc(filter)}”.</div>`
      : `<div class="empty">Nothing saved yet.<br>Open any Sparkpage and hit <b>⬇ Save offline</b>.</div>`;

    document.getElementById("lib-history").innerHTML = history.length
      ? history.filter(h => h.title.toLowerCase().includes(f) || h.q.toLowerCase().includes(f)).slice(0, 30).map(h => `
        <div class="lib-item" data-q="${esc(h.q)}">
          <span class="l-emo">${h.source === "live" ? "🌐" : "📦"}</span>
          <div class="l-main"><div class="l-title">${esc(h.title)}</div>
          <div class="l-meta">searched “${esc(h.q)}” · ${timeAgo(h.ts)}</div></div>
          <span class="l-badge">${h.source === "live" ? "live" : "offline"}</span>
        </div>`).join("") || `<div class="empty">No history matches “${esc(filter)}”.</div>`
      : `<div class="empty">No searches yet — try the home page.</div>`;

    view.querySelectorAll(".lib-item").forEach(el => el.addEventListener("click", e => {
      if (e.target.dataset.del) return;
      doSearch(el.dataset.q);
    }));
    view.querySelectorAll(".l-del").forEach(b => b.onclick = e => {
      e.stopPropagation();
      const saved = store.get("saved", {});
      delete saved[b.dataset.del];
      store.set("saved", saved);
      toast("Removed from offline library.");
      renderLibrary();
    });
  };
  draw();
  document.getElementById("lib-filter").addEventListener("input", debounce(e => draw(e.target.value), 120));
}

/* ============================================================
   GLOBAL CHROME — connectivity, install, login, modals
   ============================================================ */
function setConn(online) {
  const badge = document.getElementById("conn-badge");
  badge.textContent = online ? "● Online" : "○ Offline";
  badge.classList.toggle("offline", !online);
  document.getElementById("offline-banner").classList.toggle("hidden", online);
  document.body.style.paddingTop = online ? "0" : "34px";
}
window.addEventListener("online", () => { setConn(true); toast("🌐 Back online — searches now pull live web data."); navigator.serviceWorker?.controller?.postMessage?.("ping"); });
window.addEventListener("offline", () => { setConn(false); toast("📦 Offline mode — local knowledge base engaged."); });

// modal helper
function modal(html) {
  const root = document.getElementById("modal-root");
  root.innerHTML = `<div class="modal-backdrop"><div class="modal">${html}</div></div>`;
  const bd = root.firstElementChild;
  bd.addEventListener("click", e => { if (e.target === bd) root.innerHTML = ""; });
  root.querySelectorAll("[data-close]").forEach(b => b.onclick = () => root.innerHTML = "");
  return root;
}

// install flow
let deferredPrompt = null;
window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferredPrompt = e; });
function installFlow() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(c => { if (c.outcome === "accepted") toast("Installed! Launchable from your home screen — works offline."); deferredPrompt = null; });
  } else {
    modal(`<h3>⬇ Install GenSpark</h3>
      <p>This is an installable offline app (PWA). If no install prompt appears:</p>
      <p>• <b>Chrome/Edge:</b> menu → “Install app…”<br>• <b>Android:</b> menu → “Add to Home screen”<br>• <b>iOS Safari:</b> Share → “Add to Home Screen”</p>
      <p>Once installed, everything — search, Sparkpages, the copilot — works with zero internet.</p>
      <div class="m-actions"><button class="btn primary" data-close>Got it</button></div>`);
  }
}
document.getElementById("btn-install-top").onclick = installFlow;
document.getElementById("rail-install").onclick = e => { e.preventDefault(); installFlow(); };
document.getElementById("btn-drive").onclick = () =>
  modal(`<h3>📂 AI Drive</h3><p>Your Sparkpages library doubles as a personal knowledge drive — it's stored locally in this browser and readable offline. Manage it from “Sparkpages” in the rail.</p><div class="m-actions"><button class="btn primary" data-close>OK</button></div>`);
document.getElementById("btn-login").onclick = () =>
  modal(`<h3>👋 Log in</h3><p>This clone is <b>local-first</b>: no accounts, no servers, no tracking. Your library and history live only on this device — which is exactly why it works offline.</p><div class="m-actions"><button class="btn primary" data-close>Nice</button></div>`);

/* ---------- boot ---------- */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").then(() => console.log("SW registered"))
      .catch(err => console.warn("SW failed:", err));
  });
}
setConn(navigator.onLine);
route();

})();
