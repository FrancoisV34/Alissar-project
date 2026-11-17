# Procédure de déploiement

| | Recette | Production |
|---|---|---|
| Application Fly.io | `alissar-staging` | `alissar-vitrine` |
| URL | https://alissar-staging.fly.dev | https://alissar-vitrine.fly.dev |
| Configuration | `fly.staging.toml` | `fly.toml` |
| Volume (données) | `alissar_staging_data` → `/data` | `alissar_data` → `/data` |
| Branche Git | `develop` | `main` |
| Déclenchement | automatique si la CI est verte | CI verte **+ approbation** (environnement GitHub `production`) |
| Secret GitHub | `FLY_API_TOKEN_STAGING` | `FLY_API_TOKEN` |

## 1. Prérequis

- Compte Fly.io et `flyctl` installé (`brew install flyctl`, puis `fly auth login`).
- Secrets de chaque application Fly (jamais dans le dépôt) :

| Secret Fly | Rôle | Commande |
|---|---|---|
| `JWT_SECRET` | Signature des sessions (≥ 32 caractères aléatoires) | `fly secrets set JWT_SECRET=$(openssl rand -hex 32) -a <app>` |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Compte administrateur créé au **premier** démarrage uniquement | `fly secrets set ADMIN_EMAIL=… ADMIN_PASSWORD=… -a <app>` |

- Secrets GitHub (Settings → Secrets and variables → Actions) : un jeton de déploiement **par application**, limité à cette application : `fly tokens create deploy -a <app>`.

## 2. Chaîne de déploiement

```
branche de travail ──PR──▶ develop ──CI verte──▶ RECETTE (automatique)
                                │
                     recette validée par la cliente (docs/tests/RECETTE.md)
                                ▼
                          PR develop → main ──CI verte──▶ approbation ──▶ PRODUCTION
```

Chaque déploiement (jobs `recette` et `production` de `.github/workflows/ci.yml`) :
1. ne démarre que si le workflow **CI** a réussi sur ce commit (lint, 168 tests, couverture ≥ 80 %, 15 tests e2e, audit, gitleaks, image Docker + test de fumée) ;
2. en production : **instantané du volume** avant toute chose (bloquant), puis copie SQLite sur le volume avec `db-backup.js` (complément) ;
3. construit l'image sur les serveurs de Fly (`--remote-only`) et remplace la machine ; Fly attend que la sonde `/healthz` réponde avant de basculer le trafic ;
4. au démarrage, l'application applique les **migrations** en attente (une transaction par migration ; en cas d'erreur, la machine ne démarre pas et l'ancienne version reste en service) ;
5. lance le **test de fumée** (`scripts/smoke-test.sh`) : sonde de santé, API publique, page d'accueil, administration protégée (401), en-tête CSP, `robots.txt`.

## 3. Première mise en place d'un environnement (une seule fois)

```bash
fly apps create alissar-staging
fly volumes create alissar_staging_data --app alissar-staging --region cdg --size 1
fly secrets set --app alissar-staging JWT_SECRET=$(openssl rand -hex 32) \
    ADMIN_EMAIL=<e-mail> ADMIN_PASSWORD=<mot de passe provisoire>
fly tokens create deploy --app alissar-staging      # → secret GitHub FLY_API_TOKEN_STAGING
fly deploy --config fly.staging.toml                 # premier déploiement manuel
sh scripts/smoke-test.sh https://alissar-staging.fly.dev
```

Le premier démarrage crée la base (migrations), le contenu par défaut et le compte administrateur, qui devra changer son mot de passe à la première connexion.

## 4. Déploiement manuel (dépannage uniquement)

À n'utiliser que si GitHub Actions est indisponible, et **seulement depuis un commit dont la CI est verte** :

```bash
git switch main && git pull
npm ci && npm run lint && npm test           # mêmes contrôles qu'en CI
fly volumes snapshots create $(fly volumes list -a alissar-vitrine --json | jq -r '.[0].id') -a alissar-vitrine
fly deploy -a alissar-vitrine --remote-only
sh scripts/smoke-test.sh https://alissar-vitrine.fly.dev
```

## 5. Vérification après déploiement

1. Le job « Test de fumée » est vert dans GitHub Actions.
2. `fly status -a alissar-vitrine` : machine `started`, contrôle de santé `passing`.
3. `fly logs -a alissar-vitrine` : lignes `[migrate] … appliquée` éventuelles, puis `Serveur démarré`, sans erreur.
4. Ouvrir le site, se connecter à l'administration, vérifier une page.

## 6. Retour arrière

**Cas 1 : le nouveau code pose problème, les données sont saines** (le cas le plus fréquent).

```bash
fly releases -a alissar-vitrine --image          # liste des versions avec leur image
fly deploy -a alissar-vitrine --image registry.fly.io/alissar-vitrine:<image-de-la-version-précédente>
sh scripts/smoke-test.sh https://alissar-vitrine.fly.dev
```
Puis `git revert` du commit fautif sur `main`, pour que le dépôt reflète ce qui tourne.

Les migrations du projet sont **additives** (ajout de tables, de colonnes, d'index) : l'ancienne version du code fonctionne avec le nouveau schéma, il n'y a donc pas de migration à défaire. Une migration destructive (suppression ou renommage de colonne) devra être découpée en deux mises en production pour conserver cette propriété.

**Cas 2 : les données sont abîmées** (fausse manipulation, migration défectueuse).

```bash
fly ssh console -a alissar-vitrine
  ls /data/backups/                                    # sauvegardes horodatées (14 dernières)
  node server/scripts/db-restore.js /data/backups/<fichier>.sqlite          # simulation : vérifie l'intégrité
exit
fly machine stop -a alissar-vitrine <id-machine>       # le serveur doit être arrêté
fly ssh console -a alissar-vitrine -C "node server/scripts/db-restore.js /data/backups/<fichier>.sqlite --yes"
fly machine start -a alissar-vitrine <id-machine>
sh scripts/smoke-test.sh https://alissar-vitrine.fly.dev
```
La restauration conserve la base abîmée (`database.sqlite.avant-restauration-<date>`) : elle peut elle-même être annulée.

**Cas 3 : le volume est perdu.** Fly.io prend un instantané quotidien des volumes (conservé 5 jours) : `fly volumes snapshots list <id-volume>`, puis création d'un volume à partir de l'instantané (`fly volumes create alissar_data --snapshot-id <id> …`).

## 7. Sauvegardes

| Quand | Quoi | Où |
|---|---|---|
| Avant chaque déploiement en production | Instantané du volume (`fly volumes snapshots create`), automatique dans le job `production` de `ci.yml` | Infrastructure Fly |
| Avant chaque déploiement en production | `db-backup.js` (automatique, non bloquant) | `/data/backups/` sur le volume, 14 conservées |
| Chaque jour | Instantané du volume par Fly.io | Infrastructure Fly, 5 jours |
| À la demande | `fly ssh console -C "node server/scripts/db-backup.js"` puis `fly ssh sftp get` pour une copie hors de Fly | Poste de l'administrateur |

Procédure de restauration testée le 16/11/2026 (incident simulé, voir le dossier de preuves).

## 8. Environnement local identique à la production

```bash
cp .env.example .env        # JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
docker compose up --build   # http://localhost:8080 — même image que la production
```
