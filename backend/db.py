"""Hoolulu Factory database — schema mirrored from the live Termux factory."""
from __future__ import annotations

import json
import os
import random
import sqlite3
from datetime import datetime, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
DB_PATH = Path(os.environ.get("FACTORY_DB", DATA_DIR / "factory.db"))

OFFER = "AI Visibility Install $1500 setup + $99/month"
ANGLE = "Improve online visibility, capture more leads, and automate bookings."


def now_iso() -> str:
    return datetime.now().isoformat()


def connect() -> sqlite3.Connection:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def _init_schema(conn: sqlite3.Connection) -> None:
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY,
            business TEXT,
            industry TEXT,
            location TEXT,
            website TEXT,
            phone TEXT,
            email TEXT,
            score REAL,
            status TEXT,
            source TEXT,
            notes TEXT,
            category TEXT,
            city TEXT,
            message TEXT,
            outreach_status TEXT,
            outreach_channel TEXT,
            sent_at TEXT,
            follow_up_date TEXT,
            reply_status TEXT,
            intel_status TEXT DEFAULT 'PENDING',
            digital_score INTEGER DEFAULT 0,
            opportunity_score INTEGER DEFAULT 0,
            pain_points TEXT,
            recommended_offer TEXT,
            sales_angle TEXT,
            intel_report TEXT,
            scan_date TEXT
        );

        CREATE TABLE IF NOT EXISTS opportunities (
            id INTEGER PRIMARY KEY,
            lead_id INTEGER,
            title TEXT,
            stage TEXT,
            value REAL,
            notes TEXT,
            created_at TEXT,
            FOREIGN KEY(lead_id) REFERENCES leads(id)
        );

        CREATE TABLE IF NOT EXISTS proposals (
            id INTEGER PRIMARY KEY,
            lead_id INTEGER,
            opportunity_id INTEGER,
            title TEXT,
            offer TEXT,
            amount REAL,
            status TEXT,
            body TEXT,
            created_at TEXT,
            FOREIGN KEY(lead_id) REFERENCES leads(id)
        );

        CREATE TABLE IF NOT EXISTS clients (
            id INTEGER PRIMARY KEY,
            lead_id INTEGER,
            business TEXT,
            started_at TEXT,
            mrr REAL,
            status TEXT,
            notes TEXT,
            FOREIGN KEY(lead_id) REFERENCES leads(id)
        );

        CREATE TABLE IF NOT EXISTS delivery_tasks (
            id INTEGER PRIMARY KEY,
            client_id INTEGER,
            title TEXT,
            status TEXT,
            due_at TEXT,
            completed_at TEXT
        );

        CREATE TABLE IF NOT EXISTS sparkpages (
            id INTEGER PRIMARY KEY,
            title TEXT,
            kind TEXT,
            lead_id INTEGER,
            prompt TEXT,
            content TEXT,
            created_at TEXT
        );

        CREATE TABLE IF NOT EXISTS conversations (
            id INTEGER PRIMARY KEY,
            title TEXT,
            created_at TEXT
        );

        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY,
            conversation_id INTEGER,
            role TEXT,
            content TEXT,
            meta TEXT,
            created_at TEXT
        );

        CREATE TABLE IF NOT EXISTS memory (
            id INTEGER PRIMARY KEY,
            key TEXT UNIQUE,
            value TEXT,
            updated_at TEXT
        );

        CREATE TABLE IF NOT EXISTS factory_runs (
            id INTEGER PRIMARY KEY,
            started_at TEXT,
            finished_at TEXT,
            report TEXT,
            leads_touched INTEGER DEFAULT 0
        );
        """
    )
    conn.commit()


def _phone(seed: str) -> str:
    n = abs(hash(seed)) % 9000000 + 1000000
    s = f"{n:07d}"
    return f"808-{s[:3]}-{s[3:]}"


def _email(business: str) -> str:
    slug = "".join(c.lower() if c.isalnum() else "" for c in business)[:18] or "aloha"
    return f"info@{slug}.com"


def _outreach(business: str) -> str:
    return (
        f"Aloha {business},\n\n"
        "I was looking into local Hawaii businesses and noticed there may be opportunities "
        "to improve your digital visibility, capture more customer leads, and make booking easier.\n\n"
        "Would you be open to a quick conversation about a few ideas?\n\nMahalo"
    )


def _intel(business: str, digital: int, opp: int, issues: list[str], offer: str, angle: str, tier: str) -> str:
    issue_lines = "\n".join(f"- {i}" for i in issues) or "- None flagged"
    return (
        f"\nHIE808 SALES INTELLIGENCE REPORT\n\n"
        f"BUSINESS:\n{business}\n\n"
        f"DIGITAL SCORE:\n{digital}/100\n\n"
        f"OPPORTUNITY SCORE:\n{opp}\n\n"
        f"TIER:\n{tier}\n\n"
        f"ISSUES:\n{issue_lines}\n\n\n"
        f"OFFER:\n{offer}\n\n"
        f"ANGLE:\n{angle}\n"
    )


# Live factory snapshot (from Hoolulu autopilot 2026-08-09) plus named BOOKED / OUTREACH_READY leads.
LEAD_ROWS = [
    # Exact first-5 records from factory dump
    dict(
        business="Demo Hawaii Business",
        industry="Local Service",
        location="Honolulu",
        website=None,
        phone=None,
        email=None,
        score=8.5,
        status="BOOKED",
        source="Manus",
        notes="Positive reply. Meeting opportunity created.",
        category="Local Service",
        city="Honolulu",
        message=None,
        outreach_status=None,
        outreach_channel=None,
        sent_at=None,
        follow_up_date=None,
        reply_status=None,
        intel_status="PENDING",
        digital_score=0,
        opportunity_score=0,
        pain_points=None,
        recommended_offer=None,
        sales_angle=None,
        intel_report=None,
        scan_date=None,
    ),
    dict(
        business="Honolulu Test Company",
        industry="Local Service",
        location="Honolulu",
        website=None,
        phone=None,
        email=None,
        score=8.5,
        status="SCORED",
        source="Manus",
        notes="Scored by Hoolulu scoring agent",
        category="Local Service",
        city="Honolulu",
        message=_outreach("Honolulu Test Company"),
        outreach_status="READY",
        outreach_channel=None,
        sent_at=None,
        follow_up_date=None,
        reply_status=None,
        intel_status="COMPLETE",
        digital_score=0,
        opportunity_score=80,
        pain_points="No website provided",
        recommended_offer=OFFER,
        sales_angle=ANGLE,
        intel_report=_intel(
            "Honolulu Test Company", 0, 80, ["No website provided"], OFFER, ANGLE, "READY"
        ),
        scan_date="2026-07-28T18:47:17.642530",
    ),
    dict(
        business="Honolulu Coffee Shop",
        industry="Cafe",
        location="Honolulu",
        website=None,
        phone=None,
        email=None,
        score=5.0,
        status="NURTURE",
        source="Content Agent",
        notes="Create educational content, recheck website in 30 days, monitor social activity.",
        category="Cafe",
        city="Honolulu",
        intel_status="PENDING",
    ),
    dict(
        business="Oahu Landscaping Company",
        industry="Landscaping",
        location="Oahu",
        website=None,
        phone=None,
        email=None,
        score=2.0,
        status="NURTURE",
        source="Content Agent",
        notes="Create educational content, recheck website in 30 days, monitor social activity.",
        category="Landscaper",
        city="Honolulu",
        intel_status="PENDING",
    ),
    dict(
        business="Island Ohana Tree & Landscaping Services",
        industry="Landscaping",
        location="Honolulu, HI",
        website=None,
        phone=None,
        email=None,
        score=8.0,
        status="CLIENT",
        source="Manus",
        notes="Delivery completed at 2026-07-28T10:05:23.579808",
        category="Landscaper",
        city="Honolulu, HI",
        message="Aloha Island Ohana Tree & Landscaping Services, I noticed there may be opportunities to improve your digital presence. Would you be open to a quick conversation?",
        outreach_status="SENT",
        outreach_channel="MANUAL",
        sent_at="2026-07-28T09:47:44.345417",
        reply_status="CALL_BOOKED",
        intel_status="PENDING",
    ),
]


def _booked(
    business: str,
    industry: str,
    city: str,
    score: float,
    source: str = "Manus",
    website: str | None = None,
) -> dict:
    issues = []
    digital = 22
    if not website:
        issues.append("No website provided")
        digital = 8
    else:
        issues.append("Website exists but booking path is weak")
        issues.append("Inconsistent NAP / Google Business Profile signals")
        digital = 34
    opp = int(min(95, max(55, score * 10 + 8)))
    return dict(
        business=business,
        industry=industry,
        location=city,
        website=website,
        phone=_phone(business),
        email=_email(business),
        score=score,
        status="BOOKED",
        source=source,
        notes="Positive reply. Meeting opportunity created.",
        category=industry,
        city=city,
        message=_outreach(business),
        outreach_status="SENT",
        outreach_channel="MANUAL",
        sent_at="2026-07-28T09:47:44.345417",
        reply_status="CALL_BOOKED",
        intel_status="COMPLETE" if score >= 8 else "PENDING",
        digital_score=digital,
        opportunity_score=opp,
        pain_points="; ".join(issues),
        recommended_offer=OFFER,
        sales_angle=ANGLE,
        intel_report=_intel(business, digital, opp, issues, OFFER, ANGLE, "BOOKED"),
        scan_date="2026-08-09T16:45:56.347372",
    )


def _ready(business: str, industry: str, city: str, score: float) -> dict:
    issues = ["Thin or missing website", "Low review velocity", "No automated booking"]
    return dict(
        business=business,
        industry=industry,
        location=city,
        website=None,
        phone=_phone(business),
        email=_email(business),
        score=score,
        status="OUTREACH_READY",
        source="Factory Runner",
        notes="Scored. Ready for outreach sequence.",
        category=industry,
        city=city,
        message=_outreach(business),
        outreach_status="READY",
        intel_status="COMPLETE",
        digital_score=12,
        opportunity_score=int(score * 10),
        pain_points="; ".join(issues),
        recommended_offer=OFFER,
        sales_angle=ANGLE,
        intel_report=_intel(business, 12, int(score * 10), issues, OFFER, ANGLE, "READY"),
        scan_date="2026-08-09T16:45:56.347372",
    )


BOOKED_NAMED = [
    ("Haraguchi Glenn Y", "Local Service", "Honolulu", 8.4),
    ("Coldtech 2010", "HVAC", "Honolulu", 8.8),
    ("Cool It Kauai Air", "HVAC", "Kauai", 8.6),
    ("Aloha 'Aina Landscaping", "Landscaping", "Kauai", 8.3),
    ("The LAB", "Salon", "Honolulu", 8.1),
    ("Epic Hair Boutique", "Salon", "Honolulu", 8.0),
    ("Boston Hair Design", "Salon", "Honolulu", 7.9),
    ("Kauai Beauty Bar", "Salon", "Kauai", 8.2),
    ("Oahu Beauty Salon", "Salon", "Oahu", 7.8),
    ("Kauai Garden Services", "Landscaping", "Kauai", 8.4),
    ("Oahu Landscaping Design", "Landscaping", "Oahu", 8.1),
    ("Kauai Beauty Boutique", "Salon", "Kauai", 7.7),
    ("Oahu HVAC Repair", "HVAC", "Oahu", 8.7),
    ("Kauai Air Pros", "HVAC", "Kauai", 8.5),
    ("Kauai Salon Pros", "Salon", "Kauai", 7.9),
    ("Kauai Landscaping Experts", "Landscaping", "Kauai", 8.2),
    ("Kauai Garden Pros", "Landscaping", "Kauai", 8.0),
    ("Oahu HVAC Solutions", "HVAC", "Oahu", 8.6),
    ("Kauai Landscaping Pros", "Landscaping", "Kauai", 8.3),
    ("Kauai Salon Experts", "Salon", "Kauai", 7.8),
    ("Kauai Garden Experts", "Landscaping", "Kauai", 8.1),
    ("Island Comfort", "HVAC", "Honolulu", 8.9),
    ("Koloa Town Salon", "Salon", "Koloa", 7.6),
    ("Oahu Tree Services", "Landscaping", "Oahu", 8.4),
    ("Kauai Hair Studio", "Salon", "Kauai", 7.7),
    ("Oahu Salon & Spa", "Salon", "Oahu", 8.0),
    ("Oahu Hair Boutique", "Salon", "Oahu", 7.5),
    ("Kauai Beauty Pros", "Salon", "Kauai", 7.9),
    ("Oahu Salon Experts", "Salon", "Oahu", 7.8),
    ("Kauai Hair Experts", "Salon", "Kauai", 7.6),
    ("Oahu Salon Pros", "Salon", "Oahu", 7.7),
    ("Kauai Air Conditioning & Plumbing", "HVAC", "Kauai", 8.8),
    ("Oahu Air Conditioning", "HVAC", "Oahu", 8.5),
    ("Hapa Landscaping", "Landscaping", "Honolulu", 8.2),
    ("Studio 203 Salon", "Salon", "Honolulu", 8.1),
    ("Brand New Lead", "Local Service", "Honolulu", 7.4),
    ("Honolulu Plumbing Co", "Plumbing", "Honolulu", 8.0),
    ("Maui Breeze HVAC", "HVAC", "Maui", 8.3),
    ("Pearl City Lawn Care", "Landscaping", "Pearl City", 7.9),
    ("Waikiki Salon House", "Salon", "Waikiki", 7.8),
    ("Kapaa Garden Works", "Landscaping", "Kapaa", 8.0),
    ("Windward AC Repair", "HVAC", "Kailua", 8.4),
    ("Lihue Beauty Lounge", "Salon", "Lihue", 7.5),
    ("Kailua Landscaping Co", "Landscaping", "Kailua", 8.1),
    ("Honolulu Hair Lab", "Salon", "Honolulu", 7.9),
    ("Kauai Comfort Systems", "HVAC", "Kauai", 8.6),
    ("Aiea Tree Care", "Landscaping", "Aiea", 8.0),
    ("Poipu Salon Studio", "Salon", "Poipu", 7.4),
    ("North Shore Gardens", "Landscaping", "North Shore", 8.2),
]

READY_NAMED = [
    ("Cheapest Yard Service", "Landscaping", "Oahu", 7.2),
    ("Oahu Tree Trimming and Removal Experts", "Landscaping", "Oahu", 7.8),
    ("Kendall Landscape Services", "Landscaping", "Oahu", 7.5),
    ("Treescape Hawaii LLC", "Landscaping", "Honolulu", 8.1),
    ("Serenitree Palm and Tree Services", "Landscaping", "Oahu", 7.6),
]

LEAD_COLUMNS = [
    "business",
    "industry",
    "location",
    "website",
    "phone",
    "email",
    "score",
    "status",
    "source",
    "notes",
    "category",
    "city",
    "message",
    "outreach_status",
    "outreach_channel",
    "sent_at",
    "follow_up_date",
    "reply_status",
    "intel_status",
    "digital_score",
    "opportunity_score",
    "pain_points",
    "recommended_offer",
    "sales_angle",
    "intel_report",
    "scan_date",
]


def _seed_leads(conn: sqlite3.Connection) -> None:
    if conn.execute("SELECT COUNT(*) FROM leads").fetchone()[0] > 0:
        return

    rows = list(LEAD_ROWS)
    existing = {r["business"] for r in rows}
    for name, industry, city, score in BOOKED_NAMED:
        if name in existing:
            continue
        website = None if score < 8.0 else f"https://www.{''.join(c.lower() if c.isalnum() else '' for c in name)[:16]}.com"
        rows.append(_booked(name, industry, city, score, website=website))
        existing.add(name)
    for name, industry, city, score in READY_NAMED:
        if name in existing:
            continue
        rows.append(_ready(name, industry, city, score))
        existing.add(name)

    placeholders = ",".join("?" for _ in LEAD_COLUMNS)
    cols = ",".join(LEAD_COLUMNS)
    for row in rows:
        values = [row.get(c) for c in LEAD_COLUMNS]
        conn.execute(f"INSERT INTO leads ({cols}) VALUES ({placeholders})", values)

    # Opportunities — factory reported 62
    leads = conn.execute("SELECT id, business, status, score FROM leads").fetchall()
    created = 0
    stages = ["DISCOVERY", "MEETING", "PROPOSAL", "WON", "NURTURE"]
    for lead in leads:
        n = 2 if lead["status"] in ("BOOKED", "CLIENT") else 1
        for i in range(n):
            if created >= 62:
                break
            stage = "WON" if lead["status"] == "CLIENT" and i == 0 else (
                "MEETING" if lead["status"] == "BOOKED" else (
                    "PROPOSAL" if lead["status"] == "SCORED" else "NURTURE"
                )
            )
            value = round(1500 + (lead["score"] or 5) * 99, 2)
            conn.execute(
                """INSERT INTO opportunities (lead_id, title, stage, value, notes, created_at)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (
                    lead["id"],
                    f"{lead['business']} — Visibility Install",
                    stage,
                    value,
                    "Factory-generated opportunity",
                    "2026-07-28T10:00:00",
                ),
            )
            created += 1
        if created >= 62:
            break
    # pad to 62
    while created < 62:
        lead = leads[created % len(leads)]
        conn.execute(
            """INSERT INTO opportunities (lead_id, title, stage, value, notes, created_at)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (
                lead["id"],
                f"{lead['business']} — Follow-on offer",
                "DISCOVERY",
                1500.0,
                "Additional factory opportunity",
                "2026-08-01T10:00:00",
            ),
        )
        created += 1

    # Proposals — factory reported 55
    opps = conn.execute(
        "SELECT id, lead_id, title, value FROM opportunities ORDER BY id"
    ).fetchall()
    for i, opp in enumerate(opps[:55]):
        status = "SENT" if i < 50 else "DRAFT"
        conn.execute(
            """INSERT INTO proposals (lead_id, opportunity_id, title, offer, amount, status, body, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                opp["lead_id"],
                opp["id"],
                opp["title"].replace("Visibility Install", "Proposal"),
                OFFER,
                opp["value"],
                status,
                f"Proposal for {opp['title']}.\n\nOffer: {OFFER}\nAmount: ${opp['value']:.0f}\n\n{ANGLE}",
                "2026-08-02T12:00:00",
            ),
        )

    # 1 client + 1 delivery task (factory dump)
    client_lead = conn.execute(
        "SELECT id, business FROM leads WHERE status='CLIENT' LIMIT 1"
    ).fetchone()
    if client_lead:
        cur = conn.execute(
            """INSERT INTO clients (lead_id, business, started_at, mrr, status, notes)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (
                client_lead["id"],
                client_lead["business"],
                "2026-07-28T10:05:23.579808",
                99.0,
                "ACTIVE",
                "Delivery completed at 2026-07-28T10:05:23.579808",
            ),
        )
        conn.execute(
            """INSERT INTO delivery_tasks (client_id, title, status, due_at, completed_at)
               VALUES (?, ?, ?, ?, ?)""",
            (
                cur.lastrowid,
                "AI Visibility Install — Island Ohana",
                "DONE",
                "2026-07-28",
                "2026-07-28T10:05:23.579808",
            ),
        )

    conn.execute(
        "INSERT OR REPLACE INTO memory (key, value, updated_at) VALUES (?, ?, ?)",
        (
            "last_run",
            "2026-08-09 16:45:56.347372",
            "2026-08-09 16:45:56.347372",
        ),
    )
    conn.execute(
        "INSERT OR REPLACE INTO memory (key, value, updated_at) VALUES (?, ?, ?)",
        (
            "factory_name",
            "Hoolulu Factory",
            now_iso(),
        ),
    )
    conn.execute(
        "INSERT OR REPLACE INTO memory (key, value, updated_at) VALUES (?, ?, ?)",
        (
            "operator",
            json.dumps({"name": "Xavier", "org": "Hoolulu", "area": "808"}),
            now_iso(),
        ),
    )
    conn.execute(
        """INSERT INTO factory_runs (started_at, finished_at, report, leads_touched)
           VALUES (?, ?, ?, ?)""",
        (
            "2026-08-09 16:45:50",
            "2026-08-09 16:45:56.347372",
            "HOOLULU FACTORY RUN complete. Database online. Autopilot complete.",
            59,
        ),
    )

    # Starter sparkpage
    conn.execute(
        """INSERT INTO sparkpages (title, kind, lead_id, prompt, content, created_at)
           VALUES (?, ?, ?, ?, ?, ?)""",
        (
            "Hoolulu Factory — CEO Briefing",
            "dashboard",
            None,
            "Show me the factory",
            json.dumps({"kind": "briefing"}),
            "2026-08-09T16:46:00",
        ),
    )
    conn.commit()


def init_db() -> sqlite3.Connection:
    conn = connect()
    _init_schema(conn)
    _seed_leads(conn)
    return conn


def row_to_dict(row: sqlite3.Row | None) -> dict | None:
    if row is None:
        return None
    return {k: row[k] for k in row.keys()}


def rows_to_list(rows) -> list[dict]:
    return [row_to_dict(r) for r in rows]


def pipeline_counts(conn: sqlite3.Connection) -> dict:
    rows = conn.execute(
        "SELECT status, COUNT(*) as n FROM leads GROUP BY status"
    ).fetchall()
    counts = {r["status"]: r["n"] for r in rows}
    for key in ("NEW", "SCORED", "NURTURE", "OUTREACH_READY", "BOOKED", "CLIENT"):
        counts.setdefault(key, 0)
    return counts


def dashboard(conn: sqlite3.Connection) -> dict:
    counts = pipeline_counts(conn)
    leads = conn.execute("SELECT COUNT(*) FROM leads").fetchone()[0]
    opps = conn.execute("SELECT COUNT(*) FROM opportunities").fetchone()[0]
    props = conn.execute("SELECT COUNT(*) FROM proposals").fetchone()[0]
    clients = conn.execute("SELECT COUNT(*) FROM clients").fetchone()[0]
    tasks = conn.execute("SELECT COUNT(*) FROM delivery_tasks").fetchone()[0]
    last = conn.execute(
        "SELECT value FROM memory WHERE key='last_run'"
    ).fetchone()
    folders = [
        "core",
        "leads",
        "outreach",
        "intel",
        "proposals",
        "clients",
        "logs",
        "memory",
    ]
    return {
        "factory": "Hoolulu Factory",
        "connected": True,
        "database": "ONLINE",
        "pipeline": counts,
        "sales": {
            "leads": leads,
            "opportunities": opps,
            "proposals": props,
            "clients": clients,
            "delivery_tasks": tasks,
        },
        "system": {
            "database": "ONLINE",
            "factory_folders": len(folders),
            "folders": folders,
        },
        "last_run": last["value"] if last else None,
        "operator": "Xavier · Hoolulu · 808",
    }


def get_memory(conn: sqlite3.Connection) -> dict:
    rows = conn.execute("SELECT key, value, updated_at FROM memory").fetchall()
    return {r["key"]: {"value": r["value"], "updated_at": r["updated_at"]} for r in rows}


def set_memory(conn: sqlite3.Connection, key: str, value: str) -> None:
    conn.execute(
        "INSERT OR REPLACE INTO memory (key, value, updated_at) VALUES (?, ?, ?)",
        (key, value, now_iso()),
    )
    conn.commit()
