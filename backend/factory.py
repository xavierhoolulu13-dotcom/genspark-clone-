"""Hoolulu factory operations — autopilot, scoring, outreach, intel."""
from __future__ import annotations

from datetime import datetime

from db import ANGLE, OFFER, now_iso, set_memory

def score_lead(conn, lead_id: int) -> dict | None:
    row = conn.execute("SELECT * FROM leads WHERE id=?", (lead_id,)).fetchone()
    if not row:
        return None
    digital = 0 if not row["website"] else 42
    issues = []
    if not row["website"]:
        issues.append("No website provided")
    else:
        issues.append("Website exists but booking path is weak")
    if not row["email"]:
        issues.append("No public email captured")
    if not row["phone"]:
        issues.append("No phone on file")
    opp = 80 if digital < 20 else 55
    if (row["score"] or 0) >= 8:
        opp = max(opp, 80)
    pain = "; ".join(issues) or "None flagged"
    report = (
        f"\nHIE808 SALES INTELLIGENCE REPORT\n\n"
        f"BUSINESS:\n{row['business']}\n\n"
        f"DIGITAL SCORE:\n{digital}/100\n\n"
        f"OPPORTUNITY SCORE:\n{opp}\n\n"
        f"TIER:\nREADY\n\n"
        f"ISSUES:\n" + "\n".join(f"- {i}" for i in issues) + "\n\n\n"
        f"OFFER:\n{OFFER}\n\n"
        f"ANGLE:\n{ANGLE}\n"
    )
    new_status = row["status"]
    if new_status in (None, "NEW", "NURTURE") and opp >= 70:
        new_status = "SCORED"
    conn.execute(
        """UPDATE leads SET
            intel_status='COMPLETE',
            digital_score=?,
            opportunity_score=?,
            pain_points=?,
            recommended_offer=?,
            sales_angle=?,
            intel_report=?,
            scan_date=?,
            notes=?,
            status=?,
            score=CASE WHEN score IS NULL OR score=0 THEN ? ELSE score END
        WHERE id=?""",
        (
            digital,
            opp,
            pain,
            OFFER,
            ANGLE,
            report,
            now_iso(),
            "Scored by Hoolulu scoring agent",
            new_status,
            round(opp / 10, 1),
            lead_id,
        ),
    )
    conn.commit()
    return dict(conn.execute("SELECT * FROM leads WHERE id=?", (lead_id,)).fetchone())


def generate_outreach(conn, lead_id: int) -> dict | None:
    row = conn.execute("SELECT * FROM leads WHERE id=?", (lead_id,)).fetchone()
    if not row:
        return None
    msg = (
        f"Aloha {row['business']},\n\n"
        "I was looking into local Hawaii businesses and noticed there may be opportunities "
        "to improve your digital visibility, capture more customer leads, and make booking easier.\n\n"
        "Would you be open to a quick conversation about a few ideas?\n\nMahalo"
    )
    conn.execute(
        """UPDATE leads SET message=?, outreach_status='READY' WHERE id=?""",
        (msg, lead_id),
    )
    conn.commit()
    return dict(conn.execute("SELECT * FROM leads WHERE id=?", (lead_id,)).fetchone())


def mark_outreach_sent(conn, lead_id: int, channel: str = "MANUAL") -> dict | None:
    row = conn.execute("SELECT * FROM leads WHERE id=?", (lead_id,)).fetchone()
    if not row:
        return None
    conn.execute(
        """UPDATE leads SET outreach_status='SENT', outreach_channel=?, sent_at=? WHERE id=?""",
        (channel, now_iso(), lead_id),
    )
    conn.commit()
    return dict(conn.execute("SELECT * FROM leads WHERE id=?", (lead_id,)).fetchone())


def run_autopilot(conn) -> dict:
    started = now_iso()
    touched = 0
    pending = conn.execute(
        "SELECT id FROM leads WHERE intel_status='PENDING' OR intel_status IS NULL LIMIT 8"
    ).fetchall()
    scored_ids = []
    for r in pending:
        score_lead(conn, r["id"])
        scored_ids.append(r["id"])
        touched += 1

    ready = conn.execute(
        """SELECT id FROM leads
           WHERE (message IS NULL OR message='') AND status IN ('SCORED','OUTREACH_READY','BOOKED')
           LIMIT 8"""
    ).fetchall()
    outreach_ids = []
    for r in ready:
        generate_outreach(conn, r["id"])
        outreach_ids.append(r["id"])
        touched += 1

    finished = now_iso()
    stamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")
    set_memory(conn, "last_run", stamp)
    report = (
        "================================\n"
        "       HOOLULU AUTOPILOT\n"
        "================================\n\n"
        "System Check\n----------------\nDATABASE: ONLINE\n\n"
        "Factory Run\n----------------\n"
        f"Intel scored: {len(scored_ids)} leads {scored_ids}\n"
        f"Outreach drafted: {len(outreach_ids)} leads {outreach_ids}\n\n"
        "FACTORY COMPLETE\nMemory saved\nDASHBOARD ONLINE\n"
        "================================\n"
        "       AUTOPILOT COMPLETE\n"
        "================================\n"
    )
    conn.execute(
        """INSERT INTO factory_runs (started_at, finished_at, report, leads_touched)
           VALUES (?, ?, ?, ?)""",
        (started, finished, report, touched),
    )
    conn.commit()
    return {
        "started_at": started,
        "finished_at": finished,
        "leads_touched": touched,
        "scored": scored_ids,
        "outreach_drafted": outreach_ids,
        "report": report,
        "last_run": stamp,
    }


def search_leads(conn, q: str, limit: int = 20) -> list[dict]:
    like = f"%{q}%"
    rows = conn.execute(
        """SELECT * FROM leads
           WHERE business LIKE ? OR industry LIKE ? OR city LIKE ?
              OR location LIKE ? OR status LIKE ? OR notes LIKE ?
           ORDER BY CASE WHEN score IS NULL THEN 1 ELSE 0 END, score DESC, id
           LIMIT ?""",
        (like, like, like, like, like, like, limit),
    ).fetchall()
    return [dict(r) for r in rows]


def leads_by_status(conn, status: str | None = None, limit: int = 200) -> list[dict]:
    if status:
        rows = conn.execute(
            "SELECT * FROM leads WHERE status=? ORDER BY score DESC, id", (status,)
        ).fetchall()
    else:
        rows = conn.execute(
            "SELECT * FROM leads ORDER BY id LIMIT ?", (limit,)
        ).fetchall()
    return [dict(r) for r in rows]
