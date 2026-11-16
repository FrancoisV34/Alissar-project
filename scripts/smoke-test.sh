#!/bin/sh
# Test de fumée après déploiement : vérifie en 10 secondes que le site répond
# correctement. En cas d'échec, appliquer la procédure de retour arrière (DEPLOY.md).
# usage : sh scripts/smoke-test.sh https://alissar-vitrine.fly.dev
set -eu
BASE=${1:?URL de base attendue}
ok() { printf '  ✔ %s\n' "$1"; }
ko() { printf '  ✖ %s\n' "$1"; exit 1; }

for i in 1 2 3 4 5 6; do curl -fsS "$BASE/healthz" > /dev/null 2>&1 && break; sleep 5; done
curl -fsS "$BASE/healthz" | grep -q '"ok":true'                          && ok "sonde de santé"           || ko "sonde de santé"
curl -fsS "$BASE/api/site-config" | grep -q '"site_name"'               && ok "API publique"             || ko "API publique"
curl -fsS "$BASE/" | grep -q '<div id="root">'                          && ok "page d'accueil"           || ko "page d'accueil"
[ "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/admin/users")" = 401 ] && ok "administration protégée" || ko "administration protégée"
curl -sI "$BASE/" | grep -qi '^content-security-policy:'                && ok "en-tête CSP"              || ko "en-tête CSP"
curl -fsS "$BASE/robots.txt" | grep -q 'Disallow: /admin'               && ok "robots.txt"               || ko "robots.txt"
echo "Test de fumée réussi : $BASE"
