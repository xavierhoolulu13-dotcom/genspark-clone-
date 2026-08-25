"""gen808 factory backend — HTTP API over the Hoolulu factory schema."""
from __future__ import annotations

import json
import os
import time
from typing import Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from agent import AGENTS, run_agent
from db import dashboard, get_memory, init_db, now_iso, row_to_dict, rows_to_list, set_memory
from factory import generate_outreach, mark_outreach_sent, run_autopilot, score_lead, search_leads

app = FastAPI(title="gen808 Factory", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

conn = init_db()
FACTORY_URL = os.environ.get("FACTORY_URL", "").rstrip("/")


class PromptIn(BaseModel):
    prompt: str
    conversation_id: Optional[int] = None


class LeadPatch(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    outreach_status: Optional[str] = None
    reply_status: Optional[str] = None


class MemoryIn(BaseModel):
    key: str
    value: str


class ConnectIn(BaseModel):
    url: Optional[str] = Field(None, description="Remote factory base URL")


@app.get("/api/health")
def health():
    return {
        "ok": True,
        "name": "gen808",
        "factory": "Hoolulu Factory",
        "database": "ONLINE",
        "remote": FACTORY_URL or None,
    }


@app.get("/api/connection")
def connection():
    return {
        "product": "gen808",
        "factory": "Hoolulu Factory",
        "backend": FACTORY_URL or "local",
        "db": str(os.environ.get("FACTORY_DB", "backend/data/factory.db")),
        "schema": "hoolulu-factory/core leads+opportunities+proposals+clients",
        "operator": "Xavier · 808",
        "online": True,
    }


@app.get("/api/dashboard")
def api_dashboard():
    return dashboard(conn)


@app.get("/api/leads")
def api_leads(
    status: Optional[str] = None,
    q: Optional[str] = None,
    limit: int = Query(200, le=500),
):
    if q:
        return search_leads(conn, q, limit)
    if status:
        rows = conn.execute(
            "SELECT * FROM leads WHERE status=? ORDER BY score DESC, id", (status,)
        ).fetchall()
    else:
        rows = conn.execute(
            "SELECT * FROM leads ORDER BY id LIMIT ?", (limit,)
        ).fetchall()
    return rows_to_list(rows)


@app.get("/api/leads/{lead_id}")
def api_lead(lead_id: int):
    row = conn.execute("SELECT * FROM leads WHERE id=?", (lead_id,)).fetchone()
    if not row:
        raise HTTPException(404, "Lead not found")
    lead = row_to_dict(row)
    lead["opportunities"] = rows_to_list(
        conn.execute(
            "SELECT * FROM opportunities WHERE lead_id=? ORDER BY id", (lead_id,)
        ).fetchall()
    )
    lead["proposals"] = rows_to_list(
        conn.execute(
            "SELECT * FROM proposals WHERE lead_id=? ORDER BY id", (lead_id,)
        ).fetchall()
    )
    return lead


@app.patch("/api/leads/{lead_id}")
def api_patch_lead(lead_id: int, body: LeadPatch):
    row = conn.execute("SELECT id FROM leads WHERE id=?", (lead_id,)).fetchone()
    if not row:
        raise HTTPException(404, "Lead not found")
    fields = {k: v for k, v in body.model_dump().items() if v is not None}
    if not fields:
        return api_lead(lead_id)
    sets = ", ".join(f"{k}=?" for k in fields)
    conn.execute(f"UPDATE leads SET {sets} WHERE id=?", [*fields.values(), lead_id])
    conn.commit()
    return api_lead(lead_id)


@app.post("/api/leads/{lead_id}/score")
def api_score(lead_id: int):
    lead = score_lead(conn, lead_id)
    if not lead:
        raise HTTPException(404, "Lead not found")
    return lead


@app.post("/api/leads/{lead_id}/outreach")
def api_outreach(lead_id: int, send: bool = False):
    lead = generate_outreach(conn, lead_id)
    if not lead:
        raise HTTPException(404, "Lead not found")
    if send:
        lead = mark_outreach_sent(conn, lead_id)
    return lead


@app.get("/api/opportunities")
def api_opps():
    return rows_to_list(
        conn.execute(
            """SELECT o.*, l.business FROM opportunities o
               LEFT JOIN leads l ON l.id=o.lead_id ORDER BY o.id"""
        ).fetchall()
    )


@app.get("/api/proposals")
def api_props():
    return rows_to_list(
        conn.execute(
            """SELECT p.*, l.business FROM proposals p
               LEFT JOIN leads l ON l.id=p.lead_id ORDER BY p.id"""
        ).fetchall()
    )


@app.get("/api/clients")
def api_clients():
    return rows_to_list(conn.execute("SELECT * FROM clients").fetchall())


@app.get("/api/runs")
def api_runs():
    return rows_to_list(
        conn.execute("SELECT * FROM factory_runs ORDER BY id DESC LIMIT 20").fetchall()
    )


@app.post("/api/autopilot")
def api_autopilot():
    return run_autopilot(conn)


@app.get("/api/memory")
def api_memory():
    return get_memory(conn)


@app.post("/api/memory")
def api_set_memory(body: MemoryIn):
    set_memory(conn, body.key, body.value)
    return get_memory(conn)


@app.get("/api/agents")
def api_agents():
    return AGENTS


@app.get("/api/sparkpages")
def api_sparks():
    return rows_to_list(
        conn.execute("SELECT * FROM sparkpages ORDER BY id DESC LIMIT 50").fetchall()
    )


@app.get("/api/sparkpages/{sid}")
def api_spark(sid: int):
    row = conn.execute("SELECT * FROM sparkpages WHERE id=?", (sid,)).fetchone()
    if not row:
        raise HTTPException(404, "Sparkpage not found")
    data = row_to_dict(row)
    try:
        data["parsed"] = json.loads(data["content"] or "{}")
    except json.JSONDecodeError:
        data["parsed"] = {"body": data["content"]}
    return data


@app.get("/api/conversations")
def api_convos():
    return rows_to_list(
        conn.execute("SELECT * FROM conversations ORDER BY id DESC LIMIT 40").fetchall()
    )


@app.get("/api/conversations/{cid}")
def api_convo(cid: int):
    row = conn.execute("SELECT * FROM conversations WHERE id=?", (cid,)).fetchone()
    if not row:
        raise HTTPException(404, "Not found")
    data = row_to_dict(row)
    data["messages"] = rows_to_list(
        conn.execute(
            "SELECT * FROM messages WHERE conversation_id=? ORDER BY id", (cid,)
        ).fetchall()
    )
    return data


@app.post("/api/agent")
def api_agent(body: PromptIn):
    prompt = (body.prompt or "").strip()
    if not prompt:
        raise HTTPException(400, "prompt required")

    cid = body.conversation_id
    if not cid:
        title = prompt[:72]
        cur = conn.execute(
            "INSERT INTO conversations (title, created_at) VALUES (?, ?)",
            (title, now_iso()),
        )
        conn.commit()
        cid = cur.lastrowid
    conn.execute(
        """INSERT INTO messages (conversation_id, role, content, meta, created_at)
           VALUES (?, 'user', ?, NULL, ?)""",
        (cid, prompt, now_iso()),
    )
    conn.commit()

    def gen():
        chunks = []
        # Small heartbeat so the UI can show "connected"
        yield f"data: {json.dumps({'type': 'hello', 'conversation_id': cid})}\n\n"
        try:
            for raw in run_agent(conn, prompt, cid):
                payload = json.loads(raw)
                if payload.get("type") == "message":
                    chunks.append(payload.get("text") or "")
                yield f"data: {raw}\n\n"
                # Pace the stream so Super Agent feels like it is working
                if payload.get("type") in ("plan", "tool_start", "tool_end", "thought", "status"):
                    time.sleep(0.18)
        except Exception as exc:  # noqa: BLE001
            yield f"data: {json.dumps({'type': 'error', 'text': str(exc)})}\n\n"
        final = "\n\n".join(chunks)
        conn.execute(
            """INSERT INTO messages (conversation_id, role, content, meta, created_at)
               VALUES (?, 'assistant', ?, ?, ?)""",
            (cid, final, json.dumps({"conversation_id": cid}), now_iso()),
        )
        conn.commit()
        yield f"data: {json.dumps({'type': 'done', 'conversation_id': cid})}\n\n"

    return StreamingResponse(
        gen(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# Optional static frontend (vite build → ../frontend/dist)
DIST = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.isdir(DIST):
    app.mount("/assets", StaticFiles(directory=os.path.join(DIST, "assets")), name="assets")

    @app.get("/{full_path:path}")
    def spa(full_path: str):
        if full_path.startswith("api/"):
            raise HTTPException(404, "Not found")
        index = os.path.join(DIST, "index.html")
        file_path = os.path.join(DIST, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(index)
