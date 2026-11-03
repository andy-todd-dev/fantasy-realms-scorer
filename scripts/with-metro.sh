#!/bin/sh
# Runs a command with Metro available, using a server that's already running
# or starting one that stops when the command finishes.
set -e

status_url=http://127.0.0.1:8081/status

if curl --silent --fail --max-time 2 "$status_url" > /dev/null; then
  exec sh -c "$1"
fi

exec start-server-and-test "expo start --dev-client --port 8081" "http-get://127.0.0.1:8081/status" "$1"
