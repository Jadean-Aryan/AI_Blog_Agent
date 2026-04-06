#!/usr/bin/env bash
# ─────────────────────────────────────────────
# BlogForge — Quick Start
# Run from the project root: bash start.sh
# ─────────────────────────────────────────────
set -e

echo ""
echo "╔══════════════════════════════════════╗"
echo "║     BlogForge — AI Blog Agent        ║"
echo "╚══════════════════════════════════════╝"
echo ""

# ── Backend ───────────────────────────────────
echo "▶ Starting FastAPI backend on :8000 …"
cd backend

if [ ! -d ".venv" ]; then
  echo "  Creating Python virtual environment…"
  python3 -m venv .venv
fi

source .venv/bin/activate
pip install -q -r requirements.txt

uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

# ── Frontend ──────────────────────────────────
echo "▶ Starting React frontend on :5173 …"
cd frontend

if [ ! -d "node_modules" ]; then
  echo "  Installing npm packages…"
  npm install
fi

npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✔ Backend  → http://localhost:8000"
echo "✔ API docs → http://localhost:8000/docs"
echo "✔ Frontend → http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers."
echo ""

# Wait and clean up on Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'" EXIT
wait
