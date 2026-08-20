/* ============================================================
   hoolulu-factory backend adapter
   The clone talks to your local factory over HTTP when it's up.
   See FACTORY_API.md for the endpoint contract.
   Priority: factory → live Wikipedia → offline knowledge base.
   ============================================================ */
"use strict";

const Factory = {
  DEFAULT_URL: "http://localhost:8000",
  _health: { at: 0, ok: false },
  _inflight: null,

  url() {
    try { return (localStorage.getItem("gs_factory_url") || this.DEFAULT_URL).replace(/\/+$/, ""); }
    catch { return this.DEFAULT_URL; }
  },
  setUrl(u) {
    try {
      const v = (u || "").trim();
      if (v) localStorage.setItem("gs_factory_url", v); else localStorage.removeItem("gs_factory_url");
    } catch { /* noop */ }
    this._health = { at: 0, ok: false };
  },
  /* only probe when the user has explicitly connected a backend — otherwise searches would stall on timeouts */
  enabled() { try { return !!localStorage.getItem("gs_factory_url"); } catch { return false; } },
  get online() { return this._health.ok; },

  async _req(path, { method = "GET", body = null, timeout = 15000 } = {}) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeout);
    try {
      const res = await fetch(this.url() + path, {
        method,
        signal: ctrl.signal,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : null,
      });
      const ct = res.headers.get("content-type") || "";
      const data = ct.includes("json") ? await res.json() : await res.text();
      if (!res.ok) throw new Error("factory HTTP " + res.status + ": " + (typeof data === "string" ? data.slice(0, 120) : JSON.stringify(data).slice(0, 120)));
      return data;
    } finally { clearTimeout(t); }
  },

  /* cached health probe (15s), emits "factory-status" on change */
  async health(force = false) {
    if (this._inflight) return this._inflight;
    const run = async () => {
      if (!force && Date.now() - this._health.at < 15000) return this._health.ok;
      const was = this._health.ok;
      let ok = false;
      if (this.enabled()) {
        for (const p of ["/api/health", "/health", "/"]) {
          try { await this._req(p, { timeout: 1800 }); ok = true; break; } catch { /* try next */ }
        }
      }
      this._health = { at: Date.now(), ok };
      if (ok !== was || force) {
        try { window.dispatchEvent(new CustomEvent("factory-status", { detail: { ok } })); } catch { /* noop */ }
      }
      return ok;
    };
    this._inflight = run().finally(() => { this._inflight = null; });
    return this._inflight;
  },

  /* Search → returns a Sparkpage-shaped object or throws */
  async search(query) {
    const raw = await this._req("/api/search", { method: "POST", body: { query } });
    return this.normalize(raw, query);
  },

  /* Chat — send question + page context, get an answer string */
  async chat(question, context = {}) {
    const raw = await this._req("/api/chat", {
      method: "POST",
      body: {
        question,
        page_title: context.page?.title || null,
        context: context.page ? (context.page.articleText || "").slice(0, 4000) : null,
        persona: context.persona || "spark",
      },
      timeout: 45000,
    });
    if (typeof raw === "string") return raw;
    return raw.answer || raw.text || raw.response || raw.message || null;
  },

  /* Optional: factory-hosted autopilot. Falls back to the built-in one if absent. */
  async autopilot(task) {
    const raw = await this._req("/api/autopilot", { method: "POST", body: { task }, timeout: 60000 });
    return this.normalize(raw, task);
  },

  /* ---- normalize whatever the factory returns into Sparkpage shape ---- */
  normalize(raw, query) {
    if (!raw) throw new Error("empty factory response");
    if (typeof raw === "string") raw = { report: raw };
    if (raw.error) throw new Error(raw.error);

    const title = raw.title || raw.topic || raw.subject || (query || "Factory result");
    const summary = raw.summary || raw.overview || "";

    // sections: array of {heading|h|title, body|text|p} OR markdown-ish report string
    let sections = [];
    if (Array.isArray(raw.sections) && raw.sections.length) {
      sections = raw.sections.map((s, i) => {
        if (typeof s === "string") return { h: i === 0 ? "Overview" : "Details " + (i + 1), p: [s], lede: i === 0 };
        const body = s.body ?? s.text ?? s.p ?? s.content ?? "";
        return { h: s.heading || s.h || s.title || `Section ${i + 1}`, p: Array.isArray(body) ? body : [body], lede: i === 0 };
      });
    } else {
      const report = raw.report || raw.markdown || raw.answer || raw.text || summary;
      if (report) sections = markdownToSections(report);
    }
    if (!sections.length && summary) sections = [{ h: "Overview", p: [summary], lede: true }];
    if (!sections.length) throw new Error("factory returned no content");
    if (summary && sections[0]?.h !== "Overview")
      sections.unshift({ h: "Overview", p: [summary], lede: true });

    // facts: [{k,v}] or {key: value}
    let facts = [];
    const rf = raw.facts || raw.key_facts || raw.highlights;
    if (Array.isArray(rf)) facts = rf.slice(0, 6).map(f => f.k ? f : { k: f.key || f.name || "Fact", v: String(f.v ?? f.value ?? f) });
    else if (rf && typeof rf === "object") facts = Object.entries(rf).slice(0, 6).map(([k, v]) => ({ k, v: String(v) }));

    // related: [string] or [{title}]
    const rl = raw.related || raw.related_topics || raw.suggested || [];
    const related = rl.slice(0, 6).map(r => ({ title: typeof r === "string" ? r : (r.title || r.name || String(r)), id: null }));

    // sources
    const rs = raw.sources || raw.citations || [];
    const sources = [
      { title: "🏭 hoolulu-factory", url: this.url(), fav: null },
      ...rs.slice(0, 5).map(s => typeof s === "string" ? { title: s, url: null, fav: null } : { title: s.title || s.url || "source", url: s.url || null, fav: null }),
    ];

    return {
      kind: "spark",
      query,
      title,
      emoji: "🏭",
      source: "factory",
      sourceLabel: "hoolulu-factory · live",
      category: raw.category || raw.type || "",
      generatedAt: Date.now(),
      heroImage: raw.image || raw.hero_image || null,
      heroCaption: raw.caption || title,
      sources,
      facts,
      sections,
      gallery: Array.isArray(raw.images) ? raw.images.slice(0, 4).map(i => ({ src: i.src || i, caption: i.caption || title })) : [],
      related,
      articleText: [summary, ...sections.map(s => s.h + ". " + s.p.join(" "))].filter(Boolean).join("\n"),
    };
  },
};

/* markdown-ish → sections: "## Head" lines become headings, blank-line chunks become paragraphs */
function markdownToSections(md) {
  const lines = md.replace(/\r/g, "").split("\n");
  const out = [];
  let cur = { h: "Overview", p: [], lede: true };
  let buf = [];
  const flushBuf = () => { const s = buf.join(" ").trim().replace(/\*\*/g, ""); if (s) cur.p.push(s); buf = []; };
  const flushSec = () => { flushBuf(); if (cur.p.length) out.push(cur); };
  for (const line of lines) {
    const m = line.match(/^#{1,3}\s+(.+?)\s*#*$/) || line.match(/^\*\*(.+?)\*\*:?\s*$/);
    if (m) { flushSec(); cur = { h: m[1].trim(), p: [], lede: false }; continue; }
    if (!line.trim()) { flushBuf(); continue; }
    const clean = line.replace(/^[-*•]\s+/, "• ").trim();
    buf.push(clean);
  }
  flushSec();
  out.forEach((s, i) => { s.lede = i === 0; });
  if (!out.length) out.push({ h: "Overview", p: [md], lede: true });
  return out.slice(0, 8);
}

window.Factory = Factory;
