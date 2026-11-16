# Plan de tests

| | |
|---|---|
| Projet | Site vitrine administrable du cabinet |
| Version | 1.0, 16/11/2026 |
| Rédacteur | François Vittecoq |
| Références | `docs/conception/besoins.md` (user stories), `docs/securite/AUDIT.md` |

## 1. Objectifs

1. Vérifier que chaque user story « Must » respecte ses critères d'acceptation.
2. Empêcher le retour des 14 failles corrigées lors de l'audit de sécurité (tests de non-régression).
3. Vérifier l'accessibilité (WCAG 2.1 AA) et le comportement sous charge.
4. Bloquer automatiquement toute fusion qui casse un de ces points (intégration continue).

## 2. Périmètre

| Inclus | Exclu (et pourquoi) |
|---|---|
| API Express : routes publiques, authentification, administration, envoi de fichiers | Doctolib, Google Maps, Elfsight, Google Analytics : services tiers, seul leur chargement sous CSP est vérifié |
| Couche d'accès aux données (SQLite, migrations, sauvegarde) | Infrastructure Fly.io (couverte par la sonde `/healthz` et le test de fumée après déploiement) |
| Composants React critiques : assainissement HTML, routes protégées, consentement, thème | Rendu pixel par pixel |
| Parcours utilisateurs de bout en bout (visiteur, praticienne) | |

## 3. Niveaux et types de tests

| Niveau / type | Outil | Ce qui est testé | Fichiers | Quand |
|---|---|---|---|---|
| **Unitaire (serveur)** | Vitest | Fonctions pures : `buildUpdate`, `sanitizeRichText`, `detectImageType`, schémas Zod, `migrate` | `server/__tests__/unit.test.js` | Chaque commit (local) et chaque push (CI) |
| **Unitaire (front)** | Vitest + Testing Library + jsdom | `SafeHtml`, `ProtectedRoute`, `CookieBanner`, `ThemeProvider`, `apiFetch`, consentement | `src/**/*.test.jsx` | Idem |
| **Intégration (API + base)** | Vitest + Supertest, base SQLite temporaire par fichier de test, jeu d'essai `seed-test.js` | Chaque route : cas nominal, validation (400), ressource absente (404), droits (401/403), effet réel en base | `server/__tests__/*.test.js` | Idem |
| **Sécurité** | Vitest + Supertest | Les 14 contrôles de l'audit + accès sans jeton à **toutes** les routes d'administration, jetons falsifiés, injections SQL et XSS, upload, limitation des tentatives | `server/__tests__/security.test.js` | Idem |
| **Fuzzing** | fast-check | Entrées aléatoires sur la connexion et les routes d'administration : jamais d'erreur 500, jamais de pile d'appels | `server/__tests__/fuzz.test.js` | Idem |
| **Bout en bout (système)** | Playwright (Chromium) sur le build de production | Parcours visiteur et praticienne, XSS injectée en base neutralisée, accessibilité axe-core | `e2e/*.spec.js` | CI, avant déploiement |
| **Charge** | autocannon | Débit et latence de l'API publique | `tests/load/load.js` | Avant mise en production, manuel |
| **Acceptation** | Liste de contrôle | Validation par la cliente sur l'environnement de recette | `docs/tests/RECETTE.md` | Avant chaque mise en production |
| **Accessibilité / performance** | Lighthouse, axe-core | Pages publiques et administration | `docs/accessibilite/AUDIT.md` | À chaque évolution de l'interface |

## 4. Environnements

| Environnement | Base | Données | Usage |
|---|---|---|---|
| Local (développeur) | `server/database.sqlite` | seed de production | Développement |
| Tests automatisés | fichier SQLite temporaire, un par fichier de test | `seed-test.js`, rechargé avant chaque test | Vitest, Playwright |
| Intégration continue | idem, sur un runner GitHub Actions (Ubuntu, Node 22) | idem | Chaque push et pull request |
| Recette | application Fly.io `alissar-staging`, volume séparé | copie anonymisée ou seed | Tests d'acceptation par la cliente |
| Production | application Fly.io `alissar-vitrine` | réelles | Test de fumée après déploiement |

## 5. Organisation : qui, quoi, quand

| Activité | Responsable | Moment |
|---|---|---|
| Écriture des tests unitaires et d'intégration | Développeur | En même temps que le code (une fonctionnalité n'est terminée qu'avec ses tests) |
| Exécution automatique | GitHub Actions | Chaque push, chaque pull request |
| Analyse d'un échec de CI | Développeur | Avant toute autre tâche : la branche principale doit rester verte |
| Test de charge | Développeur | Avant une mise en production qui touche l'API |
| Recette | Cliente, guidée par le développeur | Avant chaque mise en production visible |

## 6. Critères d'entrée et de sortie

**Entrée** (pour lancer la campagne) : le code compile, le lint passe, le jeu d'essai se charge.

**Sortie** (pour autoriser la mise en production) :
- 100 % des tests automatisés au vert ;
- couverture des lignes du serveur ≥ 80 % (seuil bloquant dans la CI) ;
- 0 violation axe-core sur les pages testées ;
- 0 vulnérabilité élevée ou critique dans les dépendances de production ;
- recette validée par la cliente pour les évolutions visibles.

## 7. Matrice de couverture : user stories → tests

| User story | Critère vérifié | Tests |
|---|---|---|
| US-01 Présentation | Hero, spécialités affichés | e2e `visiteur.spec.js` ; intégration `public.test.js` (site-config, pec) |
| US-02 Prendre RDV | Lien Doctolib, nouvel onglet | e2e `visiteur.spec.js` |
| US-03 Appeler (mobile) | Barre du haut avec `tel:` et RDV sous 880 px, navigation masquée | e2e `visiteur.spec.js` (viewport mobile) |
| US-04 Horaires, tarifs, adresse | Données affichées et triées | intégration `public.test.js` ; e2e `visiteur.spec.js` |
| US-06 FAQ | Affichage, HTML autorisé conservé, script supprimé | intégration `admin-crud.test.js` ; unitaire `SafeHtml.test.jsx` |
| US-07 Consentement | GA chargé seulement après acceptation, refus mémorisé | unitaire `CookieBanner.test.jsx` |
| US-08 Accessibilité | 0 violation WCAG AA | e2e `accessibilite.spec.js` |
| US-10 Connexion | Succès, erreur générique, blocage après N essais | intégration `auth.test.js` ; sécurité `security.test.js` |
| US-11 Mot de passe provisoire | Redirection obligatoire, ≥ 12 caractères | unitaire `ProtectedRoute.test.jsx` ; intégration `auth.test.js` ; e2e `praticienne.spec.js` |
| US-12 Horaires et tarifs | CRUD, validation, effet sur le site public | intégration `admin-crud.test.js` ; e2e `praticienne.spec.js` |
| US-13 Textes et images | CRUD, upload JPEG/PNG/WebP/GIF, refus du reste | intégration `admin-crud.test.js`, `upload.test.js` |
| US-14 Apparence | Liste fermée de palettes | unitaire `ThemeProvider.test.jsx` ; intégration (validation `hero_variant`) |
| US-15 Référencement | robots.txt, sitemap.xml | intégration `public.test.js` |
| US-16 Sections masquables | sitemap suit les choix | intégration `public.test.js` |
| US-20 Créer un compte | Mot de passe provisoire, 409 si doublon | intégration `admin-crud.test.js` (users) |
| US-21 Rôle admin protégé | Non attribuable, non supprimable, réservé | sécurité `security.test.js` |
| US-22 Premier démarrage | Migrations, seed, admin créé | unitaire `unit.test.js` (migrate) ; intégration `bootstrap` |

## 8. Gestion des anomalies

Toute anomalie trouvée par un test est consignée dans le compte rendu de tests (`COMPTE_RENDU.md`) : description, gravité, cause, correction, test de non-régression ajouté.
