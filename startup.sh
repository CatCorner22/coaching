#!/bin/sh
# Idempotent dev-server startup for Knotty preview (port 8080).
if curl -sf http://127.0.0.1:8080/ >/dev/null 2>&1; then
  exit 0
fi
cd /workspace && npm run dev >/tmp/knotty-dev.log 2>&1 &
