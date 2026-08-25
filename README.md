# gen808

Genspark-style **Super Agent** workspace, named **gen808**, wired to the **Hoolulu Factory** backend (Hawaii 808 local-service pipeline).

Same factory shape as `~/hoolulu-factory/core` on Termux:

- `leads` (59) with intel, outreach, scores
- `opportunities` (62) · `proposals` (55) · `clients` (1) · `delivery_tasks` (1)
- Autopilot, HIE808 scoring agent, Aloha outreach drafts, Sparkpages

## Run

```bash
# factory API
cd backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python -m uvicorn app:app --host 0.0.0.0 --port 8000

# Super Agent UI (separate terminal)
cd frontend
npm install
npm run dev
```

Open the Vite URL. The UI proxies `/api` to the factory.

## Connect your own factory

By default gen808 runs a local SQLite replica of the Hoolulu dump (BOOKED HVAC / salon / landscaping leads, Island Ohana as CLIENT, last run 2026-08-09).

- Point at another DB: `FACTORY_DB=/path/to/factory.db`
- Drop in a live `factory.db` from Termux (`hoolulu-factory`) and restart the API

Operator: Xavier · Hoolulu · 808
