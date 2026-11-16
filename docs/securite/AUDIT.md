# Audit de sécurité

| | |
|---|---|
| Date | 16/11/2026 |
| Auditeur | François Vittecoq |
| Périmètre | API Express (`server/`), front React (`src/`), en-têtes HTTP de production, dépendances npm |
| Référentiels | OWASP Top 10 (2021), recommandations ANSSI sur la sécurisation des sites web |
| Version auditée | `main` au commit `72f9815` |
| Version corrigée | `dp/qualite` au commit `66da2da` |

## 1. Méthode

1. **Revue de code** de chaque route, des middlewares et des composants qui affichent du HTML.
2. **Analyse statique** : ESLint avec `eslint-plugin-security` (serveur) et `eslint-plugin-jsx-a11y` (front).
3. **Analyse des dépendances** : `npm audit`.
4. **Inspection des en-têtes HTTP** de la production (`curl -I`).
5. **Preuves de concept** : un script envoie à l'API locale les requêtes d'un attaquant et vérifie la réponse (14 contrôles). Il est rejoué après correction. Les contrôles sont repris dans les tests automatisés (`server/__tests__/security.test.js`).

## 2. Constats et corrections

Gravité : **C** critique, **É** élevée, **M** moyenne, **F** faible.

| # | Constat | OWASP | Grav. | Preuve avant | Correction | Preuve après |
|---|---|---|---|---|---|---|
| S1 | Un compte `praticien` peut créer un compte **admin** (le rôle vient du corps de la requête) | A01 Contrôle d'accès | **C** | HTTP 201 | Gestion des comptes réservée à l'admin ; rôles attribuables limités à `praticien` | HTTP 403 |
| S2 | N'importe quelle chaîne est acceptée comme rôle (`superuser`) | A01 | É | 201 | Énumération Zod | 400 |
| S3 | **XSS stockée** : le HTML des champs riches (titre du Hero, À propos, FAQ) est affiché sans filtre ; un script s'exécute chez chaque visiteur et peut lire le jeton de session | A03 Injection | **É** | Bannière injectée affichée | Assainissement à l'écriture (`sanitize-html`, liste blanche de balises) **et** à l'affichage (DOMPurify) **et** CSP sans script inline | Balise supprimée ; la CSP bloque de toute façon les gestionnaires inline |
| S4 | Envoi d'un **SVG contenant un script**, servi depuis le même domaine | A03 / A04 | É | 200 | SVG refusé ; type détecté par la **signature du fichier** et non par le type MIME déclaré ; nom de fichier aléatoire ; `/uploads` servi avec une CSP `sandbox` | 400 |
| S5 | Fichier HTML renommé en `.png` accepté | A04 Conception | É | 200 | Idem S4 | 400 |
| S6 | Pas de **Content-Security-Policy** | A05 Configuration | É | En-tête absent | CSP limitée aux domaines réellement contactés par la page (relevés automatiquement) | En-tête présent, 0 violation |
| S7 | **CORS ouvert** (`Access-Control-Allow-Origin: *`) | A05 | M | `*` | Liste blanche (`CORS_ORIGINS`), vide par défaut en production (front et API sur le même domaine) | Pas d'en-tête pour un site tiers |
| S8 | **13 vulnérabilités** dans les dépendances de production (1 critique : `proxy-addr`) | A06 Composants vulnérables | É | `npm audit` | `npm audit fix` ; audit automatique dans la CI ; Dependabot | 0 en production |
| S9 | Aucune politique de mot de passe (« a » accepté) | A07 Authentification | É | 200 | 12 caractères minimum (API + formulaire) ; nouveau ≠ ancien | 400 |
| S10 | **Énumération des comptes** par le temps de réponse (3 ms si inconnu, 114 ms si connu) | A07 | M | Écart ×35 | Comparaison bcrypt avec une empreinte factice si l'e-mail est inconnu | 78 ms / 77 ms |
| S11 | Le jeton d'un compte **supprimé** reste valide 7 jours | A07 | M | 200 | Compte rechargé à chaque requête ; durée réduite à 1 jour ; algorithme imposé (`HS256`) | 401 |
| S12 | Types non contrôlés : un objet ou un booléen provoque une **erreur 500** | A03 / A04 | M | 500 | Validation Zod de chaque corps et paramètre | 400 avec la liste des champs |
| S13 | JSON malformé : page d'erreur **HTML avec pile d'appels** | A05 | F | HTML, chemins internes visibles | Gestionnaire d'erreurs JSON, détail uniquement dans les logs serveur | `{"error":"JSON invalide"}` |
| S14 | Lien externe `javascript:` enregistrable | A03 | F | 201 | URL `http(s)` uniquement | 400 |

## 3. Points vérifiés conformes dès le départ

- **Injection SQL** : requêtes préparées partout ; les `UPDATE` dynamiques n'utilisent que des noms de colonnes d'une liste blanche. Le code dupliqué dans 4 routes a été factorisé (`lib/sql.js`, `lib/crudRouter.js`).
- **Mots de passe** hachés avec bcrypt ; l'empreinte n'est jamais renvoyée par l'API.
- **Brute force** : 20 tentatives de connexion par 15 minutes (constaté pendant l'audit : les preuves de concept ont elles-mêmes été bloquées).
- **HTTPS** forcé et HSTS (Helmet + Fly.io).
- **Secrets** : `.env` ignoré par Git ; le serveur refuse désormais de démarrer sans `JWT_SECRET`.

## 4. Risques résiduels acceptés

| Risque | Justification |
|---|---|
| `style-src 'unsafe-inline'` dans la CSP | Mantine et framer-motion écrivent des attributs `style`. Le risque (injection de CSS) est faible et le HTML est déjà assaini. |
| `img-src https:` | Le widget d'avis affiche des photos hébergées sur des domaines variables ; une image ne peut pas exécuter de code. |
| Jeton stocké dans `localStorage` | Exposé en cas de XSS, mais les XSS sont traitées sur trois niveaux. Un cookie `HttpOnly` imposerait une protection CSRF ; à envisager si le site gagne des fonctionnalités. |
| 2 vulnérabilités modérées dans des outils de **développement** (`minimatch`) | Non présentes dans l'image de production ; correctif uniquement par mise à jour majeure, suivie par Dependabot. |
| SQLite sans gestion de droits | Traité au niveau système (processus non-root, volume non exposé). Voir `docs/conception/modele-donnees.md`. |

## 5. Observation hors sécurité

Le widget d'avis Google (Elfsight) ne s'affiche pas en production : l'identifiant saisi dans l'administration est un identifiant de fiche Google (`ChIJ…`) et non un identifiant de widget Elfsight (erreur `WIDGET_NOT_FOUND` dans la console). Il s'agit d'une donnée à corriger dans l'onglet « Personnalisation », pas d'un défaut du code.
