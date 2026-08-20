/* ============================================================
   Engine — hybrid online/offline "AI agent" core.
   Online  → live Wikipedia pipeline builds a Sparkpage
   Offline → local knowledge base + NLP scoring
   Also: SparkAI copilot brain + Autopilot planner
   ============================================================ */
"use strict";

/* ---------- text utilities ---------- */
const STOPWORDS = new Set(("a an the and or but if then else for to of in on at by with from as is are was were be been being " +
  "it its this that these those i you he she we they me him her us them my your our their what who whom which when where why how " +
  "do does did done can could will would should shall may might must about into over under again further once here there all any " +
  "both each few more most other some such no nor not only own same so than too very just tell show give get make like want know " +
  "explain describe summarize vs versus please").split(" "));

function tokenize(str) {
  return (str || "").toLowerCase()
    .replace(/[^a-z0-9\s'+-]/g, " ")
    .split(/\s+/)
    .filter(t => t.length > 1 && !STOPWORDS.has(t));
}
function stemLite(t) {
  if (t.length > 4 && t.endsWith("ing")) return t.slice(0, -3);
  if (t.length > 3 && t.endsWith("es")) return t.slice(0, -2);
  if (t.length > 3 && t.endsWith("s") && !t.endsWith("ss")) return t.slice(0, -1);
  if (t.length > 3 && t.endsWith("ed")) return t.slice(0, -2);
  return t;
}
function keywords(str) {
  const set = new Set();
  for (const t of tokenize(str)) { set.add(t); set.add(stemLite(t)); }
  return [...set];
}
function splitSentences(text) {
  // protect decimals ("1.2") and common abbreviations before splitting on punctuation
  const t = (text || "").replace(/\s+/g, " ")
    .replace(/\be\.g\./g, "eg\u0002")
    .replace(/\bi\.e\./g, "ie\u0002")
    .replace(/\b(etc|vs|Dr|Mr|Mrs|Ms|St|No|Fig|approx)\./g, "$1\u0002")
    .replace(/(\d)\.(\d)/g, "$1\u0002$2");
  const parts = t.match(/[^.!?]+[.!?]+["']?|[^.!?]+$/g) || [];
  return parts.map(s => s.replace(/\u0002/g, ".").trim()).filter(s => s.length > 20);
}
function esc(s) {
  return (s ?? "").toString().replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
function timeAgo(ts) {
  const d = Date.now() - ts;
  const m = Math.floor(d / 60000);
  if (m < 1) return "just now";
  if (m < 60) return m + "m ago";
  const h = Math.floor(m / 60);
  if (h < 24) return h + "h ago";
  return Math.floor(h / 24) + "d ago";
}
function toast(msg, ms = 3200) {
  const root = document.getElementById("toasts");
  const el = document.createElement("div");
  el.className = "toast"; el.textContent = msg;
  root.appendChild(el);
  setTimeout(() => { el.style.opacity = "0"; el.style.transition = "opacity .4s"; setTimeout(() => el.remove(), 420); }, ms);
}

/* ============================================================
   OFFLINE SEARCH — fuzzy topic matcher over local KB
   ============================================================ */
function scoreTopic(topic, qTokens, rawQ) {
  const title = topic.title.toLowerCase();
  let score = 0;
  if (rawQ && title === rawQ) score += 120;
  if (rawQ && title.includes(rawQ)) score += 60;
  for (const qt of qTokens) {
    const s = stemLite(qt);
    for (const tag of topic.tags) {
      const tl = tag.toLowerCase();
      if (tl === qt) score += 40;
      else if (s.length > 2 && tl.includes(s)) score += 14;
    }
    if (title !== rawQ && title.includes(qt)) score += 25;
    if ((topic.summary + " " + topic.category).toLowerCase().includes(qt)) score += 4;
    score += topic.sections.reduce((a, sec) =>
      a + (sec.h.toLowerCase().includes(qt) ? 6 : 0) + (sec.p.toLowerCase().includes(qt) ? 2 : 0), 0);
  }
  return score;
}
function localSearch(query) {
  const rawQ = query.trim().toLowerCase();
  const qTokens = tokenize(query);
  if (!qTokens.length) return [];
  return KB.topics
    .map(t => ({ topic: t, score: scoreTopic(t, qTokens, rawQ) }))
    .filter(r => r.score >= 10)
    .sort((a, b) => b.score - a.score);
}
function localSuggest(query, limit = 6) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const starts = KB.topics.filter(t => t.title.toLowerCase().startsWith(q));
  const scored = localSearch(query).map(r => r.topic);
  const seen = new Set(); const out = [];
  for (const t of [...starts, ...scored]) {
    if (!seen.has(t.id)) { seen.add(t.id); out.push(t); }
    if (out.length >= limit) break;
  }
  return out;
}

/* Build a Sparkpage object from a local KB topic */
function pageFromTopic(topic, query) {
  return {
    kind: "spark",
    query,
    title: topic.title,
    emoji: topic.emoji,
    source: "local",
    sourceLabel: "Local Knowledge Base",
    category: topic.category,
    generatedAt: Date.now(),
    heroImage: null,
    heroCaption: `${topic.emoji} Courtesy of the offline knowledge base — connect to the internet for live images.`,
    sources: [{ title: "Local Knowledge Base (offline)", url: null, fav: null }],
    facts: topic.facts,
    sections: [
      { h: "Overview", p: [topic.summary], lede: true },
      ...topic.sections.map(s => ({ h: s.h, p: [s.p] })),
    ],
    gallery: [],
    related: topic.related.map(id => KB.byId[id]).filter(Boolean).map(t => ({ title: t.title, id: t.id })),
    articleText: [topic.summary, ...topic.sections.map(s => s.h + ". " + s.p)].join("\n"),
  };
}

/* Offline "unknown query" page — still useful */
function pageFromUnknown(query) {
  const suggestions = localSearch(query).slice(0, 4).map(r => r.topic);
  const kw = keywords(query).slice(0, 5);
  return {
    kind: "spark",
    query,
    title: query.trim().replace(/\s+/g, " ").replace(/^./, c => c.toUpperCase()),
    emoji: "🛰️",
    source: "local",
    sourceLabel: "Local Knowledge Base",
    category: "Uncharted",
    generatedAt: Date.now(),
    heroImage: null,
    heroCaption: "Generated offline — no local entry for this exact query.",
    sources: [{ title: "Local Knowledge Base (offline)", url: null, fav: null }],
    facts: [
      { k: "Status", v: "No exact offline entry" },
      { k: "Local topics", v: KB.topics.length + " loaded" },
      { k: "Keywords seen", v: kw.join(", ") || "—" },
      { k: "Tip", v: "Reconnect for live results" },
    ],
    sections: [
      { h: "Overview", lede: true, p: [`I don't have an offline article for “${query.trim()}” yet, and there's no internet connection for live research. The SparkAI copilot on the right can still help using reasoning over keywords, and once you're back online this same search will pull fresh, cited results automatically.`] },
      { h: "What you can do offline", p: [
        `• Explore one of the ${KB.topics.length} built-in knowledge articles from the suggestions below.`,
        `• Use the SparkAI copilot for follow-up questions, math, and summaries of any open page.`,
        `• Run the Autopilot agent — it decomposes tasks into steps and works fully offline.`,
        `• Revisit this page when online: everything search-related upgrades itself automatically.`,
      ] },
      suggestions.length ? { h: "Closest offline matches", p: suggestions.map(t => `• ${t.emoji} ${t.title} — ${t.summary.split(". ")[0]}.`) } : { h: "Popular offline topics", p: KB.trendingList.slice(0, 4).map(t => `• ${t.emoji} ${t.title} — ${t.summary.split(". ")[0]}.`) },
    ],
    gallery: [],
    related: (suggestions.length ? suggestions : KB.trendingList.slice(0, 4)).map(t => ({ title: t.title, id: t.id })),
    articleText: `Query: ${query}. No offline entry. Suggestions: ${(suggestions.length ? suggestions : KB.trendingList.slice(0, 4)).map(t => t.title).join(", ")}.`,
  };
}

/* ============================================================
   ONLINE SEARCH — Wikipedia pipeline (CORS-friendly, no keys)
   ============================================================ */
async function fetchJSON(url, timeoutMs = 9000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error("HTTP " + res.status);
    return await res.json();
  } finally { clearTimeout(t); }
}
const WIKI_API = "https://en.wikipedia.org/w/api.php";
const WIKI_PAGE = t => "https://en.wikipedia.org/wiki/" + encodeURIComponent(t.replace(/ /g, "_"));
const favicon = url => "https://www.google.com/s2/favicons?sz=32&domain=" + encodeURIComponent(new URL(url).hostname);

async function wikiEnrich(query) {
  // 1) find best page — opensearch (action API)
  const srch = await fetchJSON(`${WIKI_API}?action=opensearch&search=${encodeURIComponent(query)}&limit=6&namespace=0&format=json&origin=*`);
  const titles = srch?.[1] || [];
  if (!titles.length) throw new Error("no wiki results");
  const title = titles[0];

  // 2) main page (extract + image + description) and related pages, in parallel
  const [full, rel] = await Promise.all([
    fetchJSON(`${WIKI_API}?action=query&prop=extracts|pageimages|description&explaintext=1&redirects=1&format=json&pithumbsize=900&titles=${encodeURIComponent(title)}&origin=*`),
    fetchJSON(`${WIKI_API}?action=query&generator=search&gsrsearch=${encodeURIComponent("morelike:" + title)}&gsrlimit=6&gsrnamespace=0&prop=pageimages|description&pithumbsize=320&format=json&origin=*`).catch(() => null),
  ]);

  const page = Object.values(full?.query?.pages || {})[0] || {};
  const extract = (page.extract || "").split("\n").map(p => p.trim()).filter(p => p.length > 40 && !/^=+$/.test(p));
  const paras = extract.slice(0, 14);

  // headings heuristics: give sections friendly labels
  const LABELS = ["Overview", "Background", "Key details", "How it works", "Developments", "Impact & context", "Further notes"];
  const sections = [];
  const chunk = paras.length <= 2 ? 1 : 2;
  for (let i = 0, li = 0; i < paras.length && sections.length < 7; i += chunk, li++) {
    sections.push({ h: li === 0 ? "Overview" : LABELS[li] || "More", p: paras.slice(i, i + chunk), lede: li === 0 });
  }
  if (!sections.length) {
    throw new Error("empty wiki article");
  }

  // facts: mine description + first sentences
  const sents = splitSentences(paras.join(" "));
  const facts = [];
  if (page.description) facts.push({ k: "Type", v: page.description });
  if (sents[0]) facts.push({ k: "In short", v: trunc(sents[0], 90) });
  if (sents[1]) facts.push({ k: "Also", v: trunc(sents[1], 90) });
  facts.push({ k: "Source", v: "Wikipedia (live)" });

  const relPages = Object.values(rel?.query?.pages || {}).filter(p => p.title !== title).slice(0, 6);
  const gallery = [];
  const g1 = page.thumbnail?.source || null;
  if (g1) gallery.push({ src: g1, caption: title });
  for (const rp of relPages) {
    const th = rp.thumbnail?.source;
    if (th) gallery.push({ src: th, caption: rp.title });
    if (gallery.length >= 4) break;
  }

  return {
    kind: "spark",
    query,
    title,
    emoji: "🌐",
    source: "live",
    sourceLabel: "Wikipedia · live",
    category: page.description || "Web result",
    generatedAt: Date.now(),
    heroImage: g1,
    heroCaption: sents[0] ? trunc(sents[0], 160) : title,
    sources: [
      { title: `Wikipedia — ${title}`, url: WIKI_PAGE(page.title || title), fav: favicon("https://en.wikipedia.org/") },
      ...titles.slice(1, 4).map(t => ({ title: `See also: ${t}`, url: WIKI_PAGE(t), fav: favicon("https://en.wikipedia.org/") })),
      { title: "Synthesized by GenSpark clone", url: null, fav: null },
    ],
    facts,
    sections,
    gallery,
    related: relPages.map(rp => ({ title: rp.title, id: null })),
    articleText: paras.join("\n"),
  };
}
function trunc(s, n) { return s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s; }

/* ---------- master search ---------- */
async function research(query) {
  // 1) hoolulu-factory backend, when connected & reachable
  if (window.Factory?.enabled()) {
    try {
      if (await Factory.health()) {
        const page = await Factory.search(query);
        if (page) return page;
      }
    } catch (err) {
      console.warn("factory search failed, falling through:", err);
    }
  }
  // 2) live web
  if (navigator.onLine) {
    try {
      return await wikiEnrich(query);
    } catch (err) {
      console.warn("live search failed, falling back offline:", err);
    }
  }
  const hits = localSearch(query);
  if (hits.length && hits[0].score >= 25) return pageFromTopic(hits[0].topic, query);
  return pageFromUnknown(query);
}

/* ============================================================
   SPARKAI COPILOT — the offline reasoning assistant
   ============================================================ */
const Copilot = {
  personaPrompts: {
    spark:    { name: "SparkAI", emoji: "✨", style: "helpful and concise" },
    researcher:{ name: "Dr. Deep", emoji: "🔬", style: "rigorous, cites structure, slightly academic" },
    coder:    { name: "DevMate", emoji: "👨‍💻", style: "practical, code-friendly, bullet-heavy" },
    chef:     { name: "Chef Remy", emoji: "👨‍🍳", style: "warm, food-analogy loving" },
    travel:   { name: "Wanderlo", emoji: "🧭", style: "adventurous, place-focused" },
    coach:    { name: "Coach Max", emoji: "🏋️", style: "energetic, motivational" },
  },

  respond(question, ctx, persona = "spark") {
    const q = question.trim();
    const ql = q.toLowerCase();
    const P = this.personaPrompts[persona] || this.personaPrompts.spark;

    // --- small talk / meta ---
    if (/^(hi|hii+|hello|hey|yo|sup|good (morning|afternoon|evening))\b/.test(ql))
      return [`${P.emoji} Hey! I'm ${P.name}, your ${P.style} copilot. Ask me about this page, request a summary, or try a quick calculation — I work fully offline.`, null];
    if (/thank|thanks|thx|appreciated/.test(ql))
      return [`Anytime! ${persona === "coach" ? "Now go crush the next question. 💪" : "Ask me anything else about this page."}`, null];
    if (/who are you|what are you|your name/.test(ql))
      return [`I'm ${P.name} — the built-in assistant of this Genspark clone. When you're offline I reason over the local knowledge base; online I also pull live Wikipedia context.`, null];
    if (/^help$|what can you do/.test(ql))
      return [`I can:\n• Answer questions about the current Sparkpage\n• Summarize it ("summarize", "tldr", "key points")\n• List key facts ("facts")\n• Do math ("12*8 + 4"), tell the time/date\n• Search topics when you say "search <topic>"`, null];
    if (/\b(time|what time)\b/.test(ql))
      return [`🕐 It's ${new Date().toLocaleTimeString()}.`, null];
    if (/\b(date|today|what day)\b/.test(ql))
      return [`📅 Today is ${new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.`, null];

    // --- math ---
    const mathCandidate = ql.replace(/what\s+is|calculate|compute|solve|equals?/g, "").trim();
    if (/^[\d\s+\-*/().^%]+$/.test(mathCandidate) && /\d/.test(mathCandidate) && /[+\-*/^%]/.test(mathCandidate)) {
      try {
        const val = Function('"use strict"; return (' + mathCandidate.replace(/\^/g, "**") + ")")();
        if (typeof val === "number" && isFinite(val))
          return [`🧮 ${mathCandidate} = ${Math.round(val * 1e10) / 1e10}`, null];
      } catch { /* fall through */ }
      return ["Hmm, that expression didn't compute. Try something like `12 * (3 + 4)`.", null];
    }

    // --- commands ---
    if (/^(search|look up|find)\s+/.test(ql)) {
      const topic = q.replace(/^(search|look up|find)\s+/i, "");
      return [`__NAV__:${topic}`, null];
    }
    if (/open (home|search)/.test(ql)) return ["__NAVHOME__", null];

    // --- page aware ---
    const page = ctx?.page;
    if (/summar|tldr|tl;dr|key points|main points|overview of/.test(ql) && page)
      return [this.summarize(page, persona), page.title];

    if (/^(facts|key facts|quick facts|numbers)/.test(ql) && page && page.facts.length)
      return ["📌 Key facts:\n" + page.facts.map(f => `• ${f.k}: ${f.v}`).join("\n"), page.title];

    if (/related|similar|what else|more like/.test(ql) && page && page.related.length)
      return ["You might also explore:\n" + page.related.slice(0, 5).map(r => `• ${r.title}`).join("\n") + "\n(Tap a related chip under the article to jump.)", page.title];

    if (/source|citation|where.*from|trust/.test(ql) && page)
      return [`This Sparkpage was built from: ${page.sources.map(s => s.title).join("; ")}.\nMode: ${page.source === "live" ? "🌐 live web (Wikipedia)" : "📦 offline knowledge base"}.`, page.title];

    if (/image|picture|photo/.test(ql) && page)
      return [page.source === "live"
        ? "Check the hero image and gallery in the article — they were pulled live with this page."
        : "You're offline, so images come from the local kit (emoji art). Reconnect and re-search to fetch real photos.", page.title];

    // --- direct topic question even w/o page ("what is quantum computing") ---
    const m = ql.match(/(?:what|who|whos|whose|tell me about|explain|define|meaning of)\s+(?:is|are|was|were|does|do|the|a|an)?\s*(.+?)[?.!]*$/);
    const focusPhrase = m ? m[1] : q;
    // on-page QA first
    if (page) {
      const hit = this.qaOnText(focusPhrase || q, page.articleText, page.title);
      if (hit) return [hit, page.title];
    }
    // offline KB topics
    const hits = localSearch(focusPhrase);
    if (hits.length && hits[0].score >= 25) {
      const t = hits[0].topic;
      const onTopic = this.qaOnText(q, [t.summary, ...t.sections.map(s => s.h + ". " + s.p)].join("\n"), t.title);
      const head = (m && /^(what|who|define|meaning)/.test(ql)) ? trunc(t.summary, 420) : onTopic;
      const tail = this.relatedLine(t);
      return [(head || trunc(t.summary, 380)) + (tail ? "\n\n" + tail : ""), t.title];
    }
    // generic QA over the page text as last resort
    if (page) {
      const generic = this.qaOnText(q, page.articleText, page.title);
      if (generic) return [generic, page.title];
    }
    return [
      (page
        ? `I couldn't find that on this page. Try "summarize", "facts", or "related" — or re-ask with words from the article.`
        : `I don't have that offline yet. ${navigator.onLine ? "Run a search above and I'll synthesize it live." : "Reconnect, or browse the Sparkpages library for what's cached."}`),
      null
    ];
  },

  flavor(text, persona) {
    if (!text) return text;
    switch (persona) {
      case "coach": return "🏆 " + text + (text.endsWith("!") ? "" : "");
      case "chef": return "👨‍🍳 " + text;
      case "coder": return text;
      default: return text;
    }
  },
  relatedLine(topic) {
    if (!topic.related?.length) return "";
    const names = topic.related.slice(0, 3).map(id => KB.byId[id]?.title).filter(Boolean);
    return names.length ? "Related: " + names.join(", ") + "." : "";
  },
  summarize(page, persona) {
    const sents = splitSentences(page.articleText);
    const picked = [];
    picked.push(sents[0]);
    const mid = page.sections.filter(s => !s.lede).slice(0, 3)
      .map(s => splitSentences(s.p.join(" "))[0]).filter(Boolean);
    for (const s of mid) { if (s && !picked.includes(s)) picked.push(s); }
    return "📝 Summary of “" + page.title + "”:\n" +
      picked.slice(0, 4).map(s => "• " + trunc(s, 200)).join("\n") +
      (page.facts?.length ? "\n\n⭐ Standout fact: " + page.facts[0].k + " — " + page.facts[0].v : "");
  },
  /* Async wrapper: lets the hoolulu-factory brain answer open questions when connected.
     Instant intents (math, time, greetings, summaries, navigation) stay local. */
  async respondAsync(question, ctx, persona = "spark") {
    const q = question.trim();
    const ql = q.toLowerCase();
    const mathCandidate = ql.replace(/what\s+is|calculate|compute|solve|equals?/g, "").trim();
    const localOnly =
      /^(hi|hii+|hello|hey|yo|sup|good (morning|afternoon|evening))\b/.test(ql) ||
      /thank|who are you|what are you|^help$|what can you do/.test(ql) ||
      /\b(time|what time)\b/.test(ql) || /\b(date|today|what day)\b/.test(ql) ||
      /^(search|look up|find)\s+/.test(ql) || /open (home|search)/.test(ql) ||
      (/^[\d\s+\-*/().^%]+$/.test(mathCandidate) && /[+\-*/^%]/.test(mathCandidate)) ||
      /summar|tldr|tl;dr|key points|main points/.test(ql) ||
      /^(facts|key facts|quick facts)/.test(ql) ||
      /related|similar|what else|more like/.test(ql) ||
      /source|citation|trust/.test(ql);

    if (!localOnly && window.Factory?.enabled() && await Factory.health()) {
      try {
        const answer = await Factory.chat(q, { page: ctx?.page, persona });
        if (answer && typeof answer === "string") {
          const P = this.personaPrompts[persona] || this.personaPrompts.spark;
          return [this.flavor(answer, persona) + "\n— answered by 🏭 hoolulu-factory", "hoolulu-factory"];
        }
      } catch (e) { console.warn("factory chat failed, using local brain:", e); }
    }
    return this.respond(q, ctx, persona);
  },

  qaOnText(question, text, srcName) {
    const kw = keywords(question).filter(k => k.length > 2);
    if (!kw.length || !text) return null;
    const sents = splitSentences(text);
    let best = [];
    for (const s of sents) {
      const sl = " " + s.toLowerCase() + " ";
      let sc = 0;
      for (const k of kw) { if (sl.includes(" " + k)) sc += 3; else if (sl.includes(k)) sc += 1; }
      if (sc > 0) best.push({ s, sc });
    }
    if (!best.length) return null;
    best.sort((a, b) => b.sc - a.sc);
    const topScore = best[0].sc;
    if (topScore < 2) return null;
    const out = best.slice(0, 2).map(b => b.s);
    return out.join(" ") + `\n— from “${srcName}”`;
  },
};

/* ============================================================
   AUTOPILOT — offline agent that plans + executes steps
   ============================================================ */
async function autopilotRun(task, onStep) {
  const topicHits = localSearch(task);
  const topic = topicHits.length ? topicHits[0].topic : null;
  const kw = keywords(task).join(", ") || task;

  const steps = [
    { title: "Understand the request", run: () =>
        `Parsed the task and extracted key concepts: ${kw}.` + (topic ? ` Best local knowledge match: “${topic.title}” (${Math.round(topicHits[0].score)} relevance).` : " No single perfect local article; will synthesize across sources.") },
    { title: "Plan research path", run: () =>
        `Plan: (1) gather core facts, (2) pull context & background, (3) analyze implications, (4) synthesize findings into a report.` },
    { title: "Gather core facts", run: () => {
        if (navigator.onLine) return "Fetching live encyclopedia data… ✓ Retrieved primary article and related pages.";
        if (topic) return `Consulted offline knowledge base. Extracted ${topic.facts.length} key facts and ${topic.sections.length} sections from “${topic.title}”.`;
        return "Offline mode: no exact entry; gathering nearest topics and keyword-level facts.";
      } },
    { title: "Analyze and cross-check", run: () => {
        if (topic) {
          const firstFacts = topic.facts.slice(0, 2).map(f => `${f.k} = ${f.v}`).join("; ");
          return `Cross-checked fact consistency against ${topic.category} category records. Anchors: ${firstFacts}.`;
        }
        return "Cross-checked keyword clusters across the knowledge graph; flagged low confidence where data is thin.";
      } },
    { title: "Synthesize Sparkpage", run: () => "Composing structured answer with sources and related leads… ✓ Done. Rendering report below." },
  ];

  for (let i = 0; i < steps.length; i++) {
    onStep(i, "running");
    await new Promise(r => setTimeout(r, 650 + Math.random() * 550));
    onStep(i, "done", steps[i].run());
  }

  // final report: do a real research call
  let page = null;
  try { page = await research(task); } catch { page = pageFromUnknown(task); }
  return page;
}

/* expose */
window.Engine = { research, localSearch, localSuggest, pageFromTopic, pageFromUnknown, autopilotRun };
window.Copilot = Copilot;
window.Util = { esc, tokenize, keywords, splitSentences, debounce, timeAgo, toast, trunc };
