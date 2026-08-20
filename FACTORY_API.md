# 🔌 Connecting `hoolulu-factory` to the GenSpark clone

The clone treats your factory as its **primary brain**. When connected, every request tries:

```
🏭 hoolulu-factory  →  🌐 live web (Wikipedia)  →  📦 offline knowledge base
```

so the app keeps working no matter what's up or down. Click **⚙ (Backend settings)** in the top bar, enter your factory's URL (default `http://localhost:8000`), hit **Test connection** — done. A `🏭 Factory` badge appears in the top bar while connected.

## Endpoint contract

Implement these in `router.py` (or wherever your routes live). All three are optional individually — the clone degrades gracefully for each.

### 1. `GET /api/health` — liveness probe

**Response** `200 OK`

```json
{ "ok": true, "service": "hoolulu-factory", "version": "1.0" }
```

The clone also tries `/health` then `/` as fallbacks, so any existing route will satisfy it.

### 2. `POST /api/search` — Sparkpage generation

**Request**

```json
{ "query": "quantum computing" }
```

**Response** — any of these shapes work; the adapter normalizes them:

```jsonc
{
  "title": "Quantum Computing",          // or topic / subject
  "summary": "One-paragraph overview…",  // or overview
  "category": "Technology",              // or type
  "facts": [                              // array of {k,v}…
    { "k": "Basic unit", "v": "Qubit" }
  ],
  // …or an object: "facts": { "Basic unit": "Qubit" }
  "sections": [                           // or just "report"/"answer" as markdown text
    { "heading": "How it works", "body": "…" }   // heading|h|title, body|text|p|content
  ],
  "related": ["Machine learning", "…"],   // strings or [{title}]
  "sources": [{ "title": "…", "url": "…" }],
  "image": "https://…",                   // optional hero image URL
  "images": [{ "src": "…", "caption": "…" }]     // optional gallery
}
```

If you return plain text or `{ "report": "…markdown…" }`, the clone converts `## Headings` + paragraphs into Sparkpage sections automatically.

### 3. `POST /api/chat` — copilot answers

**Request**

```json
{
  "question": "how much has earth warmed?",
  "page_title": "Climate Change",
  "context": "…first 4000 chars of the open Sparkpage…",
  "persona": "spark"
}
```

**Response**: `{ "answer": "…" }` (also accepts `text` / `response` / `message`, or a raw string body).

### 4. `POST /api/autopilot` — *optional*

**Request**: `{ "task": "research the EV market" }` → same shape as `/api/search`. If missing, the built-in local autopilot handles it.

## ⚠️ Two gotchas when running locally

**CORS** — the clone is a web page, so your factory must send permissive headers:

```python
# Flask
from flask_cors import CORS
CORS(app)                       # or: origins="*"

# without flask_cors:
@app.after_request
def cors(r):
    r.headers["Access-Control-Allow-Origin"] = "*"
    r.headers["Access-Control-Allow-Headers"] = "Content-Type"
    r.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
    return r
```

```python
# FastAPI
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
```

**Private Network Access (Chrome)** — if you load the clone over **https** (e.g. the Arena preview) and the factory runs on `http://localhost`, Chrome sends a preflight. Answer `OPTIONS` with:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: Content-Type
Access-Control-Allow-Private-Network: true
```

…or simply serve the clone from localhost too (`python3 -m http.server 8080`) and it's http→http with no preflight drama.

## Ready-to-paste Flask shim

Drop this into your factory (adjust the two `TODO` calls to your real functions in `factory_brain.py` / `librarian.py`):

```python
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.after_request
def cors(r):
    r.headers["Access-Control-Allow-Origin"] = "*"
    r.headers["Access-Control-Allow-Headers"] = "Content-Type"
    r.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
    r.headers["Access-Control-Allow-Private-Network"] = "true"
    return r

@app.get("/api/health")
def health():
    return jsonify(ok=True, service="hoolulu-factory", version="1.0")

@app.post("/api/search")
def search():
    q = request.get_json(force=True).get("query", "")
    # TODO: return factory_brain.research(q) — any dict/text shape listed above works
    return jsonify(title=q, report=f"## Overview\nStub answer for **{q}** — wire me to factory_brain.")

@app.post("/api/chat")
def chat():
    d = request.get_json(force=True)
    # TODO: return factory_brain.answer(d["question"], d.get("context"))
    return jsonify(answer=f"(factory stub) you asked: {d.get('question','')}")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
```

Then: open the clone → ⚙ → `http://localhost:8000` → **Test connection** → 🟢
