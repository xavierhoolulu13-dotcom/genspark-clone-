"""gen808 Super Agent — plans, calls Hoolulu factory tools, returns Sparkpages."""
from __future__ import annotations

import json
import re
from typing import Iterator

from db import dashboard, now_iso, row_to_dict
from factory import (
    generate_outreach,
    leads_by_status,
    run_autopilot,
    score_lead,
    search_leads,
)

AGENTS = [
    {
        "id": "super",
        "name": "gen808 Super Agent",
        "blurb": "Plans and runs factory work — research, outreach, decks, intel.",
        "badge": "New",
        "group": "advanced",
        "tasks": [
            "Run Hoolulu autopilot and brief me",
            "Who should we call this week?",
            "Build a Sparkpage for Island Ohana",
        ],
    },
    {
        "id": "factory",
        "name": "Factory Runner",
        "blurb": "Talks directly to your Hoolulu factory backend.",
        "badge": "Live",
        "group": "advanced",
        "tasks": [
            "Show CEO dashboard",
            "List OUTREACH_READY leads",
            "Score every PENDING intel lead",
        ],
    },
    {
        "id": "intel",
        "name": "HIE808 Intel",
        "blurb": "Sales intelligence reports, digital scores, offer angles.",
        "badge": "808",
        "group": "advanced",
        "tasks": [
            "Intel scan Honolulu Test Company",
            "Which BOOKED leads still need intel?",
            "Rewrite the sales angle for HVAC",
        ],
    },
    {
        "id": "outreach",
        "name": "Call For Me",
        "blurb": "Drafts Hawaii-native outreach and call scripts.",
        "badge": "New",
        "group": "advanced",
        "tasks": [
            "Draft outreach for Treescape Hawaii LLC",
            "Call script for Coldtech 2010",
            "Follow-up sequence for OUTREACH_READY",
        ],
    },
    {
        "id": "research",
        "name": "Agentic Deep Research",
        "blurb": "Multi-step research Sparkpages on a lead or market.",
        "group": "advanced",
        "tasks": [
            "Research the Kauai salon market",
            "Compare HVAC vs landscaping pipeline",
            "Why are 50 leads BOOKED?",
        ],
    },
    {
        "id": "slides",
        "name": "AI Slides",
        "blurb": "Pitch decks from live factory numbers.",
        "group": "office",
        "tasks": [
            "Build a 6-slide investor deck for Hoolulu",
            "Client pitch for Island Ohana",
        ],
    },
    {
        "id": "docs",
        "name": "AI Docs",
        "blurb": "Proposals and one-pagers from the offer book.",
        "group": "office",
        "tasks": [
            "Write the Visibility Install proposal",
            "One-pager for $1500 + $99/mo",
        ],
    },
    {
        "id": "sheets",
        "name": "AI Sheets",
        "blurb": "Live pipeline tables from the factory database.",
        "group": "office",
        "tasks": [
            "Sheet of all BOOKED HVAC leads",
            "Pipeline by island",
        ],
    },
]


def _evt(event_type: str, **payload) -> str:
    return json.dumps({"type": event_type, **payload}, default=str)


def _lead_names(conn) -> list[str]:
    rows = conn.execute("SELECT business FROM leads").fetchall()
    return [r["business"] for r in rows]


def _match_lead(conn, text: str) -> dict | None:
    t = text.lower()
    rows = conn.execute("SELECT * FROM leads").fetchall()
    # longest name first so "Oahu Salon Pros" beats "Oahu"
    ranked = sorted(rows, key=lambda r: len(r["business"] or ""), reverse=True)
    for r in ranked:
        name = (r["business"] or "").lower()
        if name and name in t:
            return dict(r)
    # fuzzy tokens
    for r in ranked:
        tokens = [w for w in re.split(r"[^a-z0-9]+", (r["business"] or "").lower()) if len(w) > 3]
        if tokens and all(tok in t for tok in tokens[:2]):
            return dict(r)
    return None


def _md_lead(lead: dict) -> str:
    bits = [
        f"**{lead.get('business')}**",
        f"Status: `{lead.get('status')}` · Score: **{lead.get('score') or '—'}**",
        f"Industry: {lead.get('industry') or '—'} · {lead.get('city') or lead.get('location') or 'Hawaii'}",
    ]
    if lead.get("phone"):
        bits.append(f"Phone: {lead['phone']}")
    if lead.get("email"):
        bits.append(f"Email: {lead['email']}")
    if lead.get("website"):
        bits.append(f"Web: {lead['website']}")
    if lead.get("opportunity_score"):
        bits.append(
            f"Digital {lead.get('digital_score') or 0}/100 · Opportunity **{lead.get('opportunity_score')}**"
        )
    if lead.get("pain_points"):
        bits.append(f"Pain: {lead['pain_points']}")
    if lead.get("recommended_offer"):
        bits.append(f"Offer: {lead['recommended_offer']}")
    if lead.get("message"):
        bits.append("\n> " + lead["message"].replace("\n", "\n> "))
    return "\n\n".join(bits)


def _spark_content(title: str, body: str, lead_id=None, kind="research") -> dict:
    return {
        "title": title,
        "kind": kind,
        "lead_id": lead_id,
        "body": body,
        "created_at": now_iso(),
    }


def _save_spark(conn, title, kind, prompt, content, lead_id=None) -> int:
    cur = conn.execute(
        """INSERT INTO sparkpages (title, kind, lead_id, prompt, content, created_at)
           VALUES (?, ?, ?, ?, ?, ?)""",
        (title, kind, lead_id, prompt, json.dumps(content), now_iso()),
    )
    conn.commit()
    return cur.lastrowid


def run_agent(conn, prompt: str, conversation_id: int | None = None) -> Iterator[str]:
    text = (prompt or "").strip()
    yield _evt("status", text="Planning")
    yield _evt(
        "thought",
        text="Super Agent is breaking this into factory tools, intel, and a finished Sparkpage.",
    )

    dash = dashboard(conn)
    lead = _match_lead(conn, text)
    low = text.lower()

    wants_auto = any(k in low for k in ("autopilot", "run factory", "factory run", "run the factory"))
    wants_dash = any(
        k in low
        for k in ("dashboard", "ceo", "pipeline", "how are we doing", "status", "brief", "factory")
    ) and not lead
    wants_outreach = any(k in low for k in ("outreach", "email", "call script", "call for me", "draft"))
    wants_score = any(k in low for k in ("score", "intel", "scan", "intelligence"))
    wants_slides = any(k in low for k in ("slide", "deck", "pitch"))
    wants_ready = "outreach_ready" in low or "outreach ready" in low
    wants_booked = "booked" in low
    wants_list = any(k in low for k in ("list", "show leads", "who should", "this week"))
    wants_compare = any(k in low for k in ("compare", "vs", "versus", "market", "kauai", "hvac"))
    wants_proposal = any(k in low for k in ("proposal", "one-pager", "one pager", "offer"))

    steps = []
    if wants_auto:
        steps.append("Run Hoolulu autopilot against the live factory database")
    if lead:
        steps.append(f"Pull factory record for {lead['business']}")
        if wants_score or lead.get("intel_status") != "COMPLETE":
            steps.append("Run HIE808 intel / scoring agent")
        if wants_outreach:
            steps.append("Draft Hawaii-native outreach")
    elif wants_dash or wants_list or wants_booked or wants_ready:
        steps.append("Read factory dashboard and pipeline")
        steps.append("Pull matching leads from SQLite")
    elif wants_slides:
        steps.append("Read live sales totals")
        steps.append("Compose a 6-slide Sparkpage deck")
    else:
        steps.append("Read factory status")
        steps.append("Ground the answer in Hoolulu leads")

    steps.append("Write the Sparkpage")
    yield _evt("plan", steps=steps)

    tool_results = {}

    def tool(name, detail, fn):
        yield _evt("tool_start", name=name, detail=detail)
        out = fn()
        tool_results[name] = out
        yield _evt("tool_end", name=name, detail=detail, output=_summarize_tool(name, out))

    if wants_auto:
        yield from tool("factory_autopilot", "python autopilot.py", lambda: run_autopilot(conn))
        dash = dashboard(conn)

    yield from tool("factory_status", "status.py · dashboard.py", lambda: dash)

    if lead:
        yield from tool(
            "get_lead",
            lead["business"],
            lambda: dict(conn.execute("SELECT * FROM leads WHERE id=?", (lead["id"],)).fetchone()),
        )
        if wants_score or lead.get("intel_status") != "COMPLETE":
            yield from tool("hie808_intel", f"score lead #{lead['id']}", lambda: score_lead(conn, lead["id"]))
            lead = tool_results.get("hie808_intel") or lead
        if wants_outreach:
            yield from tool("outreach_agent", lead["business"], lambda: generate_outreach(conn, lead["id"]))
            lead = tool_results.get("outreach_agent") or lead
    elif wants_ready:
        yield from tool("list_leads", "status=OUTREACH_READY", lambda: leads_by_status(conn, "OUTREACH_READY"))
    elif wants_booked:
        yield from tool(
            "list_leads",
            "status=BOOKED limit 12",
            lambda: leads_by_status(conn, "BOOKED")[:12],
        )
    elif wants_list or wants_dash:
        yield from tool(
            "search_leads",
            text[:80],
            lambda: search_leads(conn, _search_term(low), 12),
        )
    elif any(k in low for k in ("hvac", "salon", "landscape", "tree", "kauai", "oahu")):
        yield from tool("search_leads", text[:80], lambda: search_leads(conn, _search_term(low), 15))

    yield _evt("status", text="Writing")

    body, title, kind = _compose(text, dash, lead, tool_results, wants_slides, wants_proposal, wants_auto)
    spark_id = _save_spark(
        conn,
        title,
        kind,
        text,
        _spark_content(title, body, lead["id"] if lead else None, kind),
        lead["id"] if lead else None,
    )
    yield _evt("sparkpage", id=spark_id, title=title, kind=kind)
    yield _evt("message", text=body)
    yield _evt("done", conversation_id=conversation_id)


def _search_term(low: str) -> str:
    for token in (
        "hvac",
        "salon",
        "landscape",
        "landscaping",
        "tree",
        "kauai",
        "oahu",
        "honolulu",
        "maui",
        "booked",
        "nurture",
        "client",
        "outreach",
        "air",
        "garden",
        "hair",
        "beauty",
    ):
        if token in low:
            return token
    return "hawaii"


def _summarize_tool(name: str, out) -> dict:
    if name == "factory_status" and isinstance(out, dict):
        return {
            "database": out.get("database"),
            "pipeline": out.get("pipeline"),
            "sales": out.get("sales"),
            "last_run": out.get("last_run"),
        }
    if name == "factory_autopilot" and isinstance(out, dict):
        return {
            "leads_touched": out.get("leads_touched"),
            "scored": out.get("scored"),
            "last_run": out.get("last_run"),
        }
    if isinstance(out, list):
        return {"count": len(out), "names": [x.get("business") for x in out[:8]]}
    if isinstance(out, dict) and "business" in out:
        return {
            "id": out.get("id"),
            "business": out.get("business"),
            "status": out.get("status"),
            "score": out.get("score"),
            "opportunity_score": out.get("opportunity_score"),
        }
    return {"ok": True}


def _compose(prompt, dash, lead, tools, wants_slides, wants_proposal, wants_auto):
    p = dash.get("pipeline", {})
    s = dash.get("sales", {})
    last = dash.get("last_run") or "—"

    if lead:
        title = f"Sparkpage · {lead['business']}"
        intel = lead.get("intel_report") or ""
        body = (
            f"# {lead['business']}\n\n"
            f"Connected to **Hoolulu Factory**. Super Agent pulled this record live.\n\n"
            f"{_md_lead(lead)}\n\n"
            f"## Why this lead\n\n"
            f"{lead.get('notes') or 'In the 808 pipeline.'}\n\n"
            f"## Recommended next move\n\n"
            f"1. Send the Aloha outreach (channel: {lead.get('outreach_channel') or 'MANUAL'}).\n"
            f"2. Pitch **{lead.get('recommended_offer') or 'AI Visibility Install $1500 setup + $99/month'}**.\n"
            f"3. Angle: {lead.get('sales_angle') or 'Improve online visibility, capture more leads, and automate bookings.'}\n\n"
            f"## HIE808 intel\n\n```\n{intel.strip() or 'Intel pending — run scoring agent.'}\n```\n"
        )
        return body, title, "lead"

    if wants_slides:
        title = "Hoolulu · 6-slide factory deck"
        body = (
            "# Hoolulu Factory — Slide Sparkpage\n\n"
            "### Slide 1 · Title\n**gen808 × Hoolulu** — Super Agent for the 808 factory.\n\n"
            f"### Slide 2 · Snapshot\nLeads **{s.get('leads')}** · Opportunities **{s.get('opportunities')}** · "
            f"Proposals **{s.get('proposals')}** · Clients **{s.get('clients')}**.\n\n"
            f"### Slide 3 · Pipeline\nBOOKED **{p.get('BOOKED', 0)}** · CLIENT **{p.get('CLIENT', 0)}** · "
            f"OUTREACH_READY **{p.get('OUTREACH_READY', 0)}** · NURTURE **{p.get('NURTURE', 0)}** · "
            f"SCORED **{p.get('SCORED', 0)}**.\n\n"
            "### Slide 4 · Offer\n**AI Visibility Install** — $1,500 setup + $99/month. "
            "Make Hawaii local service businesses findable, bookable, and follow-up-ready.\n\n"
            "### Slide 5 · Proof\nIsland Ohana Tree & Landscaping is a live CLIENT. "
            "Delivery completed 2026-07-28. 50 meetings already BOOKED.\n\n"
            f"### Slide 6 · Ask\nRun autopilot daily. Last factory run: `{last}`.\n"
        )
        return body, title, "slides"

    if wants_proposal:
        title = "AI Visibility Install — one-pager"
        body = (
            "# AI Visibility Install\n\n"
            "**$1,500 setup + $99/month**\n\n"
            "For Hawaii local service businesses (HVAC, landscaping, salons) that are "
            "booked in the Hoolulu factory but still leaking demand online.\n\n"
            "## What we install\n"
            "- Google Business + site polish so they show up in the 808\n"
            "- Lead capture and booking path\n"
            "- Follow-up scripts the owner can actually send\n\n"
            "## Why now\n"
            f"Factory has **{p.get('BOOKED', 0)} BOOKED** meetings and **{s.get('proposals')} proposals** in flight. "
            "The scoring agent already tagged opportunity scores in the 70–80 range when a shop has no website.\n"
        )
        return body, title, "doc"

    auto_note = ""
    if wants_auto and "factory_autopilot" in tools:
        a = tools["factory_autopilot"]
        auto_note = (
            f"\n## Autopilot just ran\n\n"
            f"Touched **{a.get('leads_touched')}** records. "
            f"Scored `{a.get('scored')}` · outreach drafted `{a.get('outreach_drafted')}`.\n"
            f"Last run is now `{a.get('last_run')}`.\n"
        )

    listed = None
    for key in ("list_leads", "search_leads"):
        if key in tools and isinstance(tools[key], list):
            listed = tools[key]
            break

    list_md = ""
    if listed:
        lines = []
        for item in listed[:12]:
            lines.append(
                f"- **{item.get('business')}** — `{item.get('status')}` · "
                f"{item.get('city') or item.get('location') or 'Hawaii'} · score {item.get('score') or '—'}"
            )
        list_md = "\n## Matching leads\n\n" + "\n".join(lines) + "\n"

    title = "Hoolulu Factory briefing"
    body = (
        "# Factory briefing\n\n"
        "gen808 is connected to **your** Hoolulu factory backend — same SQLite shape as "
        "`~/hoolulu-factory/core` (leads, opportunities, proposals, clients, delivery_tasks).\n\n"
        f"**DATABASE:** ONLINE · **FOLDERS:** {dash.get('system', {}).get('factory_folders', 8)}\n"
        f"**Last run:** `{last}`\n\n"
        "## Pipeline\n\n"
        f"| Stage | Count |\n|---|---:|\n"
        f"| NEW | {p.get('NEW', 0)} |\n"
        f"| SCORED | {p.get('SCORED', 0)} |\n"
        f"| NURTURE | {p.get('NURTURE', 0)} |\n"
        f"| OUTREACH_READY | {p.get('OUTREACH_READY', 0)} |\n"
        f"| BOOKED | {p.get('BOOKED', 0)} |\n"
        f"| CLIENT | {p.get('CLIENT', 0)} |\n\n"
        "## Sales\n\n"
        f"- Leads: **{s.get('leads')}**\n"
        f"- Opportunities: **{s.get('opportunities')}**\n"
        f"- Proposals: **{s.get('proposals')}**\n"
        f"- Clients: **{s.get('clients')}**\n"
        f"- Delivery tasks: **{s.get('delivery_tasks')}**\n"
        f"{auto_note}{list_md}\n"
        "## Suggested Super Agent moves\n\n"
        "- Run autopilot\n"
        "- Draft outreach for OUTREACH_READY (Treescape, Kendall, Serenitree…)\n"
        "- Open a Sparkpage on Island Ohana (your CLIENT)\n"
        "- Build the 6-slide factory deck\n"
    )
    return body, title, "dashboard"
