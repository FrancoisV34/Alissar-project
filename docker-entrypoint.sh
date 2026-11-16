#!/bin/sh
# Point d'entrée du conteneur.
# Les volumes (Docker comme Fly.io) sont montés en root : l'utilisateur de
# l'application ne pourrait pas y écrire. On attribue donc /data à « node »
# (uid 1000) puis on remplace ce processus par l'application exécutée en
# « node », sans aucun droit root (setpriv, fourni par util-linux).
set -e
if [ "$(id -u)" = "0" ]; then
  mkdir -p /data/uploads
  chown -R node:node /data
  chmod 0700 /data
  exec setpriv --reuid=node --regid=node --init-groups --inh-caps=-all "$@"
fi
exec "$@"
