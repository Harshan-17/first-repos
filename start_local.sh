#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

cleanup() {
  if [[ -n "${BACK_PID:-}" ]] && kill -0 "$BACK_PID" 2>/dev/null; then
    kill "$BACK_PID" || true
  fi
}
trap cleanup EXIT INT TERM

cd "$ROOT_DIR/backend"
python -m pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACK_PID=$!

cd "$ROOT_DIR/frontend"
npm install
npm start
