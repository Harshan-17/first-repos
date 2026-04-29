# MedMemory AI — AI-Powered Patient Memory System

## What this now solves
This version includes an **AI Analyzer** aligned to the PS1 problem statement: it surfaces longitudinal clinical memory context from a report, including prior episodes, treatment response patterns, medication history, and risk signals.

## Project Structure

```
/backend
  main.py
  requirements.txt
/frontend
  package.json
  /public
    index.html
  /src
    App.js
    index.js
```

## One-command local run (both backend + frontend)

```bash
./start_local.sh
```

This starts FastAPI on `http://127.0.0.1:8000` and React on `http://localhost:3000`.

## Run Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Run Frontend

```bash
cd frontend
npm install
npm start
```

Open: `http://localhost:3000`

## API output fields
- disease
- medication
- risk
- timeline (max 3)
- prior_episodes
- treatment_response
- medication_history
- risk_signals
- care_insight


## Demo login credentials
- Doctor: `doctor@medmemory.ai` / `doctor123`
- Patient: `patient@medmemory.ai` / `patient123`
