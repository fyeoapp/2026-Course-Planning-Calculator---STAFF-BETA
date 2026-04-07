#!/usr/bin/env bash
# Start a simple static HTTP server from this folder and open the planner in the default browser.
# Usage: ./start_server.sh

cd "$(dirname "$0")"
# start server in background
python3 -m http.server 8000 &
SERVER_PID=$!
# give server a moment to start
sleep 0.6
open "http://localhost:8000/StudyPlanner%20-%20v0.7.html"

echo "Static server started (pid $SERVER_PID). To stop: kill $SERVER_PID"
wait $SERVER_PID
