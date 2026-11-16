#!/bin/sh
# Test de charge de l'API publique avec autocannon (version épinglée, non installée dans le projet).
# usage : sh tests/load/load.sh [url-de-base] [durée-en-secondes] [connexions]
BASE=${1:-http://127.0.0.1:3002}
DURATION=${2:-15}
CONN=${3:-50}
for path in /api/site-config /api/tarifs /api/horaires / ; do
  echo "=== GET $path : $CONN connexions simultanées pendant ${DURATION} s ==="
  npx -y autocannon@8.0.0 -c "$CONN" -d "$DURATION" -H "Accept-Encoding: gzip" "$BASE$path" 2>&1 \
    | grep -E "Latency|Req/Sec|Bytes/Sec|2xx|requests in|errors|^│ (Stat|Latency|Req)" | grep -v "^$"
  echo
done
