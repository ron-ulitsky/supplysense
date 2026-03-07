#!/bin/sh
# Start the ADK Python backend in the background
python3 agent/server.py &

# Start the Next.js server in the foreground
HOSTNAME="0.0.0.0" node server.js
