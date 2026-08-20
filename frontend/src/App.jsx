import { useEffect, useMemo, useRef, useState } from "react";
import { api, runAgent } from "./api";

const SUGGESTIONS = [
  { title: "Run Hoolulu autopilot", body: "System check, factory run, memory, dashboard refresh." },
  { title: "CEO dashboard", body: "Live pipeline, sales, and last factory run." },
  { title: "Call the ready list", body: "Draft Aloha outreach for every OUTREACH_READY lead." },
  { title: "Sparkpage · Island Ohana", body: "Open intel + delivery on your one CLIENT." },
];

function Logo({ size = 32, className = "" }) {
  return (
    <svg className={`logo ${className}`} width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="9" fill="#111113" />
      <path d="M10 21.5h12" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12.2 14.2l2.3-2.3 2.3 2.3 2.4-3.4 2.6 3.4" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="20.6" cy="9.2" r="1.15" fill="white" />
      <circle cx="14.5" cy="10.4" r="0.9" fill="white" />
    </svg>
  );
}

function Ico({ name }) {
  const p = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
  };
  if (name === "home")
    return (
      <svg {...p}>
        <path d="M4 11.5 12 5l8 6.5" />
        <path d="M6.5 10.5V19h11v-8.5" />
      </svg>
    );
  if (name === "spark")
    return (
      <svg {...p}>
        <path d="M12 3v3M12 18v3M4.5 12H7.5M16.5 12H19.5M7 7l2 2M15 15l2 2M17 7l-2 2M9 15l-2 2" />
        <circle cx="12" cy="12" r="2.2" />
      </svg>
    );
  if (name === "factory")
    return (
      <svg {...p}>
        <path d="M3 20h18" />
        <path d="M5 20V10l5 3V10l5 3V8h4v12" />
      </svg>
    );
  if (name === "pipe")
    return (
      <svg {...p}>
        <rect x="3" y="5" width="5" height="14" rx="1" />
        <rect x="10" y="9" width="5" height="10" rx="1" />
        <rect x="17" y="3" width="4" height="16" rx="1" />
      </svg>
    );
  if (name === "pages")
    return (
      <svg {...p}>
        <path d="M7 4h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
        <path d="M14 4v5h5" />
      </svg>
    );
  if (name === "grid")
    return (
      <svg {...p}>
        <rect x="4" y="4" width="7" height="7" rx="1.2" />
        <rect x="13" y="4" width="7" height="7" rx="1.2" />
        <rect x="4" y="13" width="7" height="7" rx="1.2" />
        <rect x="13" y="13" width="7" height="7" rx="1.2" />
      </svg>
    );
  if (name === "slides")
    return (
      <svg {...p}>
        <rect x="3" y="5" width="18" height="12" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    );
  if (name === "me")
    return (
      <svg {...p}>
        <circle cx="12" cy="8" r="3" />
        <path d="M5 19c1.5-3 4-4.5 7-4.5S17.5 16 19 19" />
      </svg>
    );
  return (
    <svg {...p}>
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}

function mdToHtml(src) {
  if (!src) return "";
  const fences = [];
  let text = src.replace(/```([\s\S]*?)```/g, (_, code) => {
    fences.push(code.replace(/</g, "&lt;"));
    return `@@FENCE${fences.length - 1}@@`;
  });
  text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const lines = text.split("\n");
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("|") && lines[i + 1] && /^\|?\s*-+/.test(lines[i + 1])) {
      const rows = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        rows.push(lines[i]);
        i += 1;
      }
      const parse = (r) =>
        r
          .split("|")
          .slice(1, -1)
          .map((c) => c.trim());
      const head = parse(rows[0]);
      const body = rows.slice(2).map(parse);
      out.push(
        "<table><thead><tr>" +
          head.map((h) => `<th>${h}</th>`).join("") +
          "</tr></thead><tbody>" +
          body.map((r) => "<tr>" + r.map((c) => `<td>${c}</td>`).join("") + "</tr>").join("") +
          "</tbody></table>"
      );
      continue;
    }
    if (/^### /.test(line)) out.push(`<h3>${line.slice(4)}</h3>`);
    else if (/^## /.test(line)) out.push(`<h2>${line.slice(3)}</h2>`);
    else if (/^# /.test(line)) out.push(`<h1>${line.slice(2)}</h1>`);
    else if (/^> /.test(line)) out.push(`<blockquote>${line.slice(2)}</blockquote>`);
    else if (/^[-*] /.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) {
        items.push(`<li>${lines[i].slice(2)}</li>`);
        i += 1;
      }
      out.push(`<ul>${items.join("")}</ul>`);
      continue;
    } else if (/^\d+\. /.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(`<li>${lines[i].replace(/^\d+\. /, "")}</li>`);
        i += 1;
      }
      out.push(`<ol>${items.join("")}</ol>`);
      continue;
    } else if (line.trim() === "") out.push("");
    else out.push(`<p>${line}</p>`);
    i += 1;
  }
  let html = out.join("\n");
  html = html
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/@@FENCE(\d+)@@/g, (_, n) => `<pre><code>${fences[Number(n)]}</code></pre>`);
  return html;
}

function Markdown({ text }) {
  return <div className="md" dangerouslySetInnerHTML={{ __html: mdToHtml(text) }} />;
}

function PromptBox({ value, setValue, onSubmit, running }) {
  return (
    <div className="prompt">
      <textarea
        rows={3}
        placeholder="Ask Super Agent to run the factory, research a lead, draft outreach…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
          }
        }}
      />
      <div className="prompt-bar">
        <div className="prompt-tools">
          <span className="chip active">Super Agent</span>
          <span className="chip">Hoolulu Factory</span>
          <span className="chip">808</span>
        </div>
        <button className="send" disabled={running || !value.trim()} onClick={onSubmit} aria-label="Send">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function statusTag(status) {
  const s = (status || "").toLowerCase();
  const cls =
    s === "booked" ? "booked" : s === "client" ? "client" : s === "outreach_ready" ? "ready" : s === "scored" ? "scored" : "nurture";
  return <span className={`tag ${cls}`}>{status}</span>;
}

export default function App() {
  const [view, setView] = useState("home");
  const [dash, setDash] = useState(null);
  const [leads, setLeads] = useState([]);
  const [agents, setAgents] = useState([]);
  const [sparks, setSparks] = useState([]);
  const [convos, setConvos] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [running, setRunning] = useState(false);
  const [turns, setTurns] = useState([]);
  const [cid, setCid] = useState(null);
  const [lead, setLead] = useState(null);
  const [spark, setSpark] = useState(null);
  const [status, setStatus] = useState("");
  const [opps, setOpps] = useState([]);
  const [props, setProps] = useState([]);
  const bottomRef = useRef(null);

  const refresh = async () => {
    const [d, l, a, s, c, o, p] = await Promise.all([
      api("/api/dashboard"),
      api("/api/leads"),
      api("/api/agents"),
      api("/api/sparkpages"),
      api("/api/conversations"),
      api("/api/opportunities"),
      api("/api/proposals"),
    ]);
    setDash(d);
    setLeads(l);
    setAgents(a);
    setSparks(s);
    setConvos(c);
    setOpps(o);
    setProps(p);
  };

  useEffect(() => {
    refresh().catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, status]);

  const pipeline = dash?.pipeline || {};
  const sales = dash?.sales || {};

  async function submit(text) {
    const q = (text ?? prompt).trim();
    if (!q || running) return;
    setPrompt("");
    setView("agent");
    setRunning(true);
    setStatus("Connecting to Hoolulu factory…");
    const turn = { id: Date.now(), user: q, plan: [], tools: [], message: "", spark: null, thought: "" };
    setTurns((t) => [...t, turn]);
    const idx = { n: 0 };
    setTurns((t) => {
      idx.n = t.length - 1;
      return t;
    });
    const patch = (fn) =>
      setTurns((t) => {
        const copy = t.slice();
        const cur = { ...copy[copy.length - 1] };
        fn(cur);
        copy[copy.length - 1] = cur;
        return copy;
      });
    try {
      const id = await runAgent(q, cid, (evt) => {
        if (evt.type === "hello" && evt.conversation_id) setCid(evt.conversation_id);
        if (evt.type === "status") setStatus(evt.text);
        if (evt.type === "thought") patch((c) => (c.thought = evt.text));
        if (evt.type === "plan") patch((c) => (c.plan = evt.steps || []));
        if (evt.type === "tool_start")
          patch((c) => c.tools.push({ name: evt.name, detail: evt.detail, running: true, output: null }));
        if (evt.type === "tool_end")
          patch((c) => {
            const last = [...c.tools].reverse().find((x) => x.name === evt.name && x.running);
            if (last) {
              last.running = false;
              last.output = evt.output;
            }
          });
        if (evt.type === "message") patch((c) => (c.message = evt.text));
        if (evt.type === "sparkpage") patch((c) => (c.spark = evt));
        if (evt.type === "error") patch((c) => (c.message = evt.text));
      });
      if (id) setCid(id);
      await refresh();
    } catch (err) {
      patch((c) => (c.message = String(err.message || err)));
    } finally {
      setRunning(false);
      setStatus("");
    }
  }

  async function openLead(id) {
    const data = await api(`/api/leads/${id}`);
    setLead(data);
    setView("lead");
  }

  async function openSpark(id) {
    const data = await api(`/api/sparkpages/${id}`);
    setSpark(data);
    setView("spark");
  }

  const grouped = useMemo(() => {
    const cols = ["NEW", "SCORED", "NURTURE", "OUTREACH_READY", "BOOKED", "CLIENT"];
    const map = Object.fromEntries(cols.map((c) => [c, []]));
    for (const l of leads) {
      const k = l.status && map[l.status] ? l.status : "NEW";
      map[k].push(l);
    }
    return map;
  }, [leads]);

  const advanced = agents.filter((a) => a.group === "advanced");

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand" onClick={() => setView("home")}>
          <Logo />
          <div className="brand-name">
            gen<span>808</span>
          </div>
        </div>
        <nav className="nav">
          <button className={`nav-item ${view === "home" ? "active" : ""}`} onClick={() => setView("home")}>
            <span className="ico">
              <Ico name="home" />
            </span>
            Home
          </button>
          <button className={`nav-item ${view === "agent" ? "active" : ""}`} onClick={() => setView("agent")}>
            <span className="ico">
              <Ico name="spark" />
            </span>
            Super Agent
          </button>
          <button className={`nav-item ${view === "factory" ? "active" : ""}`} onClick={() => setView("factory")}>
            <span className="ico">
              <Ico name="factory" />
            </span>
            Factory
          </button>
          <button className={`nav-item ${view === "pipeline" ? "active" : ""}`} onClick={() => setView("pipeline")}>
            <span className="ico">
              <Ico name="pipe" />
            </span>
            Pipeline
          </button>
          <button className={`nav-item ${view === "sparks" || view === "spark" ? "active" : ""}`} onClick={() => setView("sparks")}>
            <span className="ico">
              <Ico name="pages" />
            </span>
            Sparkpages
          </button>
          <button className={`nav-item ${view === "agents" ? "active" : ""}`} onClick={() => setView("agents")}>
            <span className="ico">
              <Ico name="grid" />
            </span>
            All Agents
          </button>
          <button
            className={`nav-item ${view === "slides" ? "active" : ""}`}
            onClick={() => {
              setView("home");
              submit("Build a 6-slide investor deck for Hoolulu");
            }}
          >
            <span className="ico">
              <Ico name="slides" />
            </span>
            AI Slides
          </button>
        </nav>
        <div className="nav-label">Recents</div>
        <div className="recents">
          {convos.slice(0, 12).map((c) => (
            <button key={c.id} className="recent" onClick={() => setView("agent")}>
              {c.title}
            </button>
          ))}
        </div>
        <div className="side-foot">
          <div className="factory-pill">
            <span className="dot" />
            <div>
              <b>Hoolulu Factory</b>
              <small>{dash ? `${sales.leads} leads · ${dash.database}` : "connecting…"}</small>
            </div>
          </div>
          <div className="me">
            <div className="avatar">X</div>
            <div>
              <b style={{ fontSize: 12.5 }}>Xavier</b>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>808 · Hoolulu</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <h1>
            {view === "home" && "Home"}
            {view === "agent" && "Super Agent"}
            {view === "factory" && "Hoolulu Factory"}
            {view === "pipeline" && "Pipeline"}
            {view === "sparks" && "Sparkpages"}
            {view === "spark" && "Sparkpage"}
            {view === "agents" && "All Agents"}
            {view === "lead" && (lead?.business || "Lead")}
          </h1>
          <button className="ghost" onClick={() => refresh()}>
            Refresh factory
          </button>
        </div>

        <div className="content">
          {view === "home" && (
            <div className="home">
              <div className="home-hero">
                <Logo size={56} className="lg" />
                <h2>What can I help you with?</h2>
                <p>gen808 Super Agent · connected to your Hoolulu factory backend</p>
              </div>
              <PromptBox value={prompt} setValue={setPrompt} onSubmit={() => submit()} running={running} />
              <div className="suggestions">
                {SUGGESTIONS.map((s) => (
                  <button key={s.title} className="sug" onClick={() => submit(s.title)}>
                    <b>{s.title}</b>
                    {s.body}
                  </button>
                ))}
              </div>
              <div className="section-title">
                <h3>Advanced Agents</h3>
                <span>Work autonomously on factory tasks</span>
              </div>
              <div className="agent-grid">
                {advanced.map((a) => (
                  <button key={a.id} className="acard" onClick={() => submit(a.tasks[0])}>
                    <div className="acard-head">
                      <h4>
                        {a.name}
                        {a.badge && (
                          <span className={`badge ${a.badge === "Live" ? "live" : a.badge === "808" ? "hi" : ""}`}>
                            {a.badge}
                          </span>
                        )}
                      </h4>
                      <span className="taskbtn">+ Task</span>
                    </div>
                    <div className="pop">{a.blurb}</div>
                    <ul>
                      {a.tasks.slice(0, 2).map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>
            </div>
          )}

          {view === "agent" && (
            <div className="agent-page">
              {turns.length === 0 && (
                <div className="home-hero" style={{ paddingTop: 40 }}>
                  <h2 style={{ fontSize: 28 }}>Super Agent</h2>
                  <p>More than a chatbot — plans, calls factory tools, ships a Sparkpage.</p>
                </div>
              )}
              {turns.map((t) => (
                <div key={t.id} className="bubble">
                  <div className="bubble user">
                    <div className="bubble-body">{t.user}</div>
                  </div>
                  {t.thought && <div className="status-line">{t.thought}</div>}
                  {t.plan?.length > 0 && (
                    <div className="plan">
                      <h5>Plan</h5>
                      <ol>
                        {t.plan.map((s) => (
                          <li key={s}>{s}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                  {t.tools.map((tool, i) => (
                    <div className="tool" key={i}>
                      <div className="tool-h">
                        {tool.running ? <span className="spin" /> : <span className="okdot" />}
                        <code>{tool.name}</code>
                        <span style={{ color: "var(--muted)", fontWeight: 500 }}>{tool.detail}</span>
                      </div>
                      {tool.output && <pre>{JSON.stringify(tool.output, null, 2)}</pre>}
                    </div>
                  ))}
                  {t.spark && (
                    <div className="spark-card">
                      <div>
                        <small>Sparkpage</small>
                        <b>{t.spark.title}</b>
                      </div>
                      <button className="ghost" onClick={() => openSpark(t.spark.id)}>
                        Open
                      </button>
                    </div>
                  )}
                  {t.message && <Markdown text={t.message} />}
                </div>
              ))}
              {running && status && (
                <div className="status-line">
                  <span className="spin" /> {status}
                </div>
              )}
              <div ref={bottomRef} />
              <div className="composer-dock">
                <PromptBox value={prompt} setValue={setPrompt} onSubmit={() => submit()} running={running} />
              </div>
            </div>
          )}

          {view === "factory" && dash && (
            <div className="page">
              <h2>Hoolulu CEO Dashboard</h2>
              <p className="sub">
                Live factory backend · last run {dash.last_run || "—"} · {dash.operator}
              </p>
              <div className="kpi-row">
                <div className="kpi">
                  <div className="lbl">Leads</div>
                  <div className="num">{sales.leads}</div>
                </div>
                <div className="kpi">
                  <div className="lbl">Opportunities</div>
                  <div className="num">{sales.opportunities}</div>
                </div>
                <div className="kpi">
                  <div className="lbl">Proposals</div>
                  <div className="num">{sales.proposals}</div>
                </div>
                <div className="kpi">
                  <div className="lbl">Clients</div>
                  <div className="num">{sales.clients}</div>
                </div>
                <div className="kpi">
                  <div className="lbl">Booked</div>
                  <div className="num">{pipeline.BOOKED || 0}</div>
                </div>
              </div>
              <div className="actions">
                <button
                  className="btn"
                  onClick={async () => {
                    await api("/api/autopilot", { method: "POST", body: {} });
                    await refresh();
                    submit("Run Hoolulu autopilot and brief me");
                  }}
                >
                  Run autopilot
                </button>
                <button className="btn alt" onClick={() => setView("pipeline")}>
                  Open pipeline
                </button>
              </div>
              <pre className="ascii">{`================================
       HOOLULU CEO DASHBOARD
================================

PIPELINE
----------------
NEW: ${pipeline.NEW || 0}
SCORED: ${pipeline.SCORED || 0}
NURTURE: ${pipeline.NURTURE || 0}
OUTREACH_READY: ${pipeline.OUTREACH_READY || 0}
BOOKED: ${pipeline.BOOKED || 0}
CLIENT: ${pipeline.CLIENT || 0}

SALES
----------------
OPPORTUNITIES: ${sales.opportunities}
PROPOSALS: ${sales.proposals}

SYSTEM
----------------
DATABASE: ${dash.database}
FACTORY FOLDERS: ${dash.system?.factory_folders}

Last Run:
${dash.last_run || "—"}

================================
         DASHBOARD ONLINE
================================`}</pre>
            </div>
          )}

          {view === "pipeline" && (
            <div className="page">
              <h2>Pipeline</h2>
              <p className="sub">Same leads table as ~/hoolulu-factory/core — status, score, intel, outreach.</p>
              <div className="kanban">
                {Object.entries(grouped).map(([col, items]) => (
                  <div className="col" key={col}>
                    <h4>
                      {col} <span>{items.length}</span>
                    </h4>
                    {items.map((l) => (
                      <button key={l.id} className="lead-card" onClick={() => openLead(l.id)}>
                        <b>{l.business}</b>
                        <div className="meta">
                          {l.industry || "Local"} · {l.city || l.location || "Hawaii"}
                        </div>
                        {l.score != null && <span className="score">{l.score}</span>}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === "lead" && lead && (
            <div className="page">
              <h2>{lead.business}</h2>
              <p className="sub">
                {statusTag(lead.status)} {lead.industry} · {lead.city || lead.location} · source {lead.source || "Factory"}
              </p>
              <div className="lead-hero">
                <div className="panel">
                  <div className="kpi-row" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
                    <div>
                      <div className="lbl">Score</div>
                      <div className="num" style={{ fontSize: 24 }}>
                        {lead.score ?? "—"}
                      </div>
                    </div>
                    <div>
                      <div className="lbl">Digital</div>
                      <div className="num" style={{ fontSize: 24 }}>
                        {lead.digital_score || 0}
                      </div>
                    </div>
                    <div>
                      <div className="lbl">Opportunity</div>
                      <div className="num" style={{ fontSize: 24 }}>
                        {lead.opportunity_score || 0}
                      </div>
                    </div>
                  </div>
                  <p>
                    <b>Phone</b> {lead.phone || "—"} · <b>Email</b> {lead.email || "—"}
                  </p>
                  <p>
                    <b>Website</b> {lead.website || "None"}
                  </p>
                  <p>
                    <b>Pain</b> {lead.pain_points || "—"}
                  </p>
                  <p>
                    <b>Offer</b> {lead.recommended_offer || "AI Visibility Install $1500 setup + $99/month"}
                  </p>
                  <div className="actions">
                    <button
                      className="btn"
                      onClick={async () => {
                        const u = await api(`/api/leads/${lead.id}/score`, { method: "POST", body: {} });
                        setLead(u);
                        refresh();
                      }}
                    >
                      Run intel
                    </button>
                    <button
                      className="btn alt"
                      onClick={async () => {
                        const u = await api(`/api/leads/${lead.id}/outreach`, { method: "POST", body: {} });
                        setLead(u);
                      }}
                    >
                      Draft outreach
                    </button>
                    <button className="btn alt" onClick={() => submit(`Build a Sparkpage for ${lead.business}`)}>
                      Super Agent
                    </button>
                  </div>
                  {lead.message && (
                    <blockquote style={{ whiteSpace: "pre-wrap", background: "var(--blue-soft)", padding: 12, borderRadius: 12 }}>
                      {lead.message}
                    </blockquote>
                  )}
                </div>
                <div className="panel">
                  <h3 style={{ marginTop: 0 }}>HIE808 report</h3>
                  <pre className="ascii" style={{ fontSize: 11.5 }}>
                    {lead.intel_report || "Intel PENDING"}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {view === "sparks" && (
            <div className="page">
              <h2>Sparkpages</h2>
              <p className="sub">Finished Super Agent work, saved against the factory.</p>
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Kind</th>
                    <th>When</th>
                  </tr>
                </thead>
                <tbody>
                  {sparks.map((s) => (
                    <tr key={s.id} onClick={() => openSpark(s.id)}>
                      <td>{s.title}</td>
                      <td>{s.kind}</td>
                      <td>{(s.created_at || "").replace("T", " ").slice(0, 19)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {view === "spark" && spark && (
            <div className="page" style={{ maxWidth: 860 }}>
              <h2>{spark.title}</h2>
              <p className="sub">
                {spark.kind} · {spark.created_at}
              </p>
              <Markdown text={spark.parsed?.body || spark.content || ""} />
            </div>
          )}

          {view === "agents" && (
            <div className="page">
              <h2>Advanced Agents</h2>
              <p className="sub">Work autonomously on your complex tasks.</p>
              <div className="agent-grid">
                {agents.map((a) => (
                  <button key={a.id} className="acard" onClick={() => submit(a.tasks[0])}>
                    <div className="acard-head">
                      <h4>
                        {a.name}
                        {a.badge && <span className="badge">{a.badge}</span>}
                      </h4>
                      <span className="taskbtn">+ Task</span>
                    </div>
                    <div className="pop">{a.blurb}</div>
                    <ul>
                      {a.tasks.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>
              <div className="section-title">
                <h3>Office + sales</h3>
                <span>{opps.length} opportunities · {props.length} proposals</span>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
