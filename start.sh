#!/bin/sh
# Start Knotty on this computer (macOS / Linux).
exec node "$(dirname "$0")/start.mjs" "$@"
