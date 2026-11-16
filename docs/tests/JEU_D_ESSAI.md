# Jeu d'essai fonctionnel

Données : jeu d'essai déterministe `server/seed-test.js` (comptes `admin@test.local`, `praticienne@test.local`, `nouvelle@test.local` ; 3 tarifs, 7 horaires, 3 FAQ…).
Exécution : 16/11/2026, build de production local. Colonne « Test » : test automatisé qui rejoue le cas à chaque intégration continue.

## Visiteur

| # | Scénario | Données d'entrée | Résultat attendu | Résultat obtenu | Statut | Test |
|---|---|---|---|---|---|---|
| V1 | Ouvrir l'accueil | `/` | Titre « L'ostéopathie, *à votre rythme.* », 3 cartes de spécialités, titre d'onglet du cabinet | Conforme | ✅ | `visiteur.spec.js` US-01 |
| V2 | Cliquer « Prendre RDV » | — | Lien Doctolib, nouvel onglet, `rel="noopener"` | `https://www.doctolib.fr/test`, `_blank`, `noopener noreferrer` | ✅ | US-02 |
| V3 | Consulter la section pratique | — | 3 tarifs (dont un à 0 €), 7 horaires, « Dimanche : Fermé », adresse | Conforme | ✅ | US-04 |
| V4 | Ouvrir le site sur mobile (Pixel 7) | largeur 412 px | Navigation masquée ; barre du haut avec « Téléphone » (`tel:0400000000`) et « Prendre RDV », toujours visible après défilement ; pas de défilement horizontal | Conforme | ✅ | US-03 `@mobile` |
| V5 | Accepter la mesure d'audience | clic « Accepter » | Choix `granted` mémorisé, événement envoyé à Analytics, bandeau masqué | Conforme | ✅ | `CookieBanner.test.jsx` |
| V6 | Refuser la mesure d'audience | clic « Refuser » | Choix `denied` mémorisé, Analytics jamais chargé, bandeau ne revient pas | Conforme | ✅ | `CookieBanner.test.jsx` |
| V7 | Navigateur réglé sur « réduire les animations » | `prefers-reduced-motion: reduce` | Aucune animation en cours | 0 animation | ✅ | `accessibilite.spec.js` |
| V8 | Lire `robots.txt` et `sitemap.xml` | — | `/admin` interdit ; sitemap sur le domaine canonique | Conforme | ✅ | `public.test.js` |
| V9 | Masquer la FAQ dans l'admin puis lire le sitemap | `show_faq = 0` | `#faq` absent du sitemap | Conforme | ✅ | `public.test.js` US-16 |

## Praticienne et administrateur

| # | Scénario | Données d'entrée | Résultat attendu | Résultat obtenu | Statut | Test |
|---|---|---|---|---|---|---|
| P1 | Connexion valide | `praticienne@test.local` / mot de passe correct | Accès au tableau de bord, date de dernière connexion enregistrée | Conforme | ✅ | `auth.test.js`, `praticienne.spec.js` |
| P2 | Connexion, e-mail en majuscules et espaces | `  PRATICIENNE@Test.Local ` | Connexion acceptée | 200 | ✅ | `auth.test.js` |
| P3 | Mauvais mot de passe | mot de passe `mauvais` | « Identifiants invalides », reste sur `/login` | Conforme | ✅ | US-10 |
| P4 | E-mail inconnu | `inconnu@test.local` | Même message et même temps de réponse que P3 | Même corps ; écart de temps < ×2 | ✅ | `security.test.js` S10 |
| P5 | 21e tentative en 15 min | 21 connexions | HTTP 429 « Trop de tentatives » | 429 (testé avec une limite de 3) | ✅ | `security.test.js` |
| P6 | Première connexion avec mot de passe provisoire | `nouvelle@test.local` | Redirection forcée vers `/change-password`, y compris en tapant `/admin` | Conforme | ✅ | US-11 |
| P7 | Nouveau mot de passe trop court | `court` | Message « au moins 12 caractères », rien n'est modifié | Conforme | ✅ | US-11 |
| P8 | Nouveau mot de passe valide | `Mon-nouveau-mdp-2026` | Accès au tableau de bord ; l'ancien mot de passe ne fonctionne plus | Conforme | ✅ | US-11, `auth.test.js` |
| P9 | Modifier l'horaire du lundi | `8h – 20h` | Visible sur l'accueil au rechargement | Conforme | ✅ | US-12 |
| P10 | Ajouter un tarif | « Séance sportive », 65 | Ajouté en fin de liste, visible sur le site | Conforme | ✅ | `admin-crud.test.js` |
| P11 | Tarif invalide | prestation vide, prix `cher` | HTTP 400, liste des champs en erreur, rien n'est écrit | Conforme | ✅ | `admin-crud.test.js` |
| P12 | Titre avec mise en forme | `Bienvenue <em>ici</em>` | Italique conservé | Conforme | ✅ | `admin-crud.test.js` |
| P13 | Titre piégé | `<img src=x onerror=alert(1)><script>…` | Balises dangereuses supprimées à l'enregistrement | `Bienvenue <em>ici</em>` | ✅ | `admin-crud.test.js`, `security.test.js` S3 |
| P14 | Envoyer une photo PNG | `mon portrait.png` | Acceptée, renommée aléatoirement, servie avec une CSP `sandbox` | Conforme | ✅ | `upload.test.js` |
| P15 | Envoyer un SVG / un HTML renommé en `.png` / un fichier de 8 Mo | — | Refusés avec un message clair | 400 × 3 | ✅ | `upload.test.js` |
| P16 | Lien de réservation `javascript:` | `javascript:alert(1)` | Refusé | 400 | ✅ | `security.test.js` S14 |
| P17 | Praticienne ouvre l'onglet Utilisateurs | — | Onglet absent ; l'API répond 403 | Conforme | ✅ | US-21 |
| A1 | Admin crée un compte praticien | `Nouvelle.Praticienne@test.local` | Compte créé en minuscules, mot de passe provisoire | Conforme | ✅ | `admin-crud.test.js` |
| A2 | Admin crée un compte avec un e-mail existant | `praticienne@test.local` | HTTP 409 | 409 | ✅ | `admin-crud.test.js` |
| A3 | Promouvoir une praticienne en admin | `role: admin` | Refusé (403) | 403 | ✅ | `security.test.js` S2 |
| A4 | Supprimer un admin | — | Refusé (403) ; un praticien peut être supprimé (204) | Conforme | ✅ | `admin-crud.test.js` |
| A5 | Jeton d'un compte supprimé | — | Refusé immédiatement (401) | 401 | ✅ | `security.test.js` S11 |

## Exploitation

| # | Scénario | Résultat attendu | Résultat obtenu | Statut | Preuve |
|---|---|---|---|---|---|
| E1 | Premier démarrage sur base vide | Migrations, contenu par défaut, compte admin | Conforme | ✅ | `bootstrap.test.js` |
| E2 | Migration modifiée après application | Démarrage refusé | Message explicite | ✅ | `unit.test.js` |
| E3 | Sauvegarde à chaud, suppression de données, restauration | Données revenues, état abîmé conservé | Conforme | ✅ | Procédure testée (`DEPLOY.md`) |
| E4 | Restauration depuis une sauvegarde corrompue | Refusée sans rien modifier | Conforme | ✅ | Idem |

**Bilan : 35 scénarios, 35 conformes.**
