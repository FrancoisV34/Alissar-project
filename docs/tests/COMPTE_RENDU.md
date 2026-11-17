# Compte rendu de la campagne de tests

| | |
|---|---|
| Date | 16/11/2026 |
| Version testée | branche `dp/qualite`, commit `5b6df7c` |
| Environnement | macOS, Node 24 (local) ; build de production ; base SQLite temporaire + `seed-test.js` |
| Référence | `PLAN_DE_TESTS.md` |

## 1. Synthèse

| Type | Outil | Tests | Réussis | Durée |
|---|---|---|---|---|
| Unitaires serveur | Vitest | 17 | 17 | < 1 s |
| Intégration API + base | Vitest + Supertest | 70 | 70 | ≈ 2 s |
| Sécurité | Vitest + Supertest | 51 | 51 | ≈ 1 s |
| Fuzzing (150 entrées par propriété, 500 en vérification) | fast-check | 9 | 9 | ≈ 3 s (10 s à 500) |
| Unitaires front | Vitest + Testing Library | 21 | 21 | ≈ 1,5 s |
| **Total Vitest** | | **168** | **168** | |
| Bout en bout (ordinateur + mobile) | Playwright | 15 | 15 | ≈ 22 s |
| Accessibilité WCAG 2.1 AA | axe-core (dans Playwright) | 8 écrans | 0 violation | |
| Charge | autocannon | 4 routes + montée en charge | 0 erreur | 2 min |
| Jeu d'essai fonctionnel | | 35 scénarios | 35 | |

**Couverture** du code serveur : **83 %** des lignes (seuil bloquant : 80 %). Le front est couvert surtout par les tests de bout en bout : les composants testés unitairement sont ceux qui portent une règle (sécurité, accès, consentement, thème).

**Critères de sortie** (plan §6) : tous atteints. Seule la recette par la cliente reste à faire, sur l'environnement de recette.

## 2. Anomalies trouvées pendant la campagne

| # | Anomalie | Trouvée par | Gravité | Cause | Correction | Non-régression |
|---|---|---|---|---|---|---|
| A1 | Version d'origine : **191 erreurs 500** sur 2 100 requêtes aléatoires, et des piles d'appels exposées sur toutes les routes | Fuzzing HTTP de `main` | Élevée | Aucune validation de type : un objet ou un tableau atteignait la requête SQL | Validation Zod (phase 2) | `fuzz.test.js` : 0 erreur sur 7 500 requêtes (500 essais par propriété) |
| A2 | Enregistrer le profil d'un administrateur renvoyait 400 | Test de non-régression de l'administration | Moyenne | Régression de ma propre validation : le formulaire renvoie `role: "admin"` | Schéma accepte la valeur, la route refuse seulement la promotion | `admin-crud.test.js` |
| A3 | Contraste insuffisant sur le bouton principal pendant l'animation d'apparition ; animations imposées même si l'utilisateur demande à les réduire | axe-core dans Playwright | Faible | Pas de prise en compte de `prefers-reduced-motion` | Media query `prefers-reduced-motion` (RGAA 13.8) | `accessibilite.spec.js` |
| A4 | Statuts 501/404 intermittents dans les tests | Fuzzing | — (outillage) | Serveur de test sur un port aléatoire en IPv6, appelé en IPv4 : un autre programme local répondait parfois | Serveur de test lié à `127.0.0.1` | Suite stable sur 3 exécutions consécutives |
| A5 | Migrations : les routes préparaient leurs requêtes avant la création des tables | Revue de code (base neuve) | Élevée (plantage au démarrage sur base neuve) | `db.prepare` au chargement du module | Requêtes préparées dans les gestionnaires | `bootstrap.test.js` |
| A6 | Restauration : une sauvegarde illisible faisait planter le script | Test de restauration | Faible | Exception non interceptée | Refus propre avec message | Procédure testée |

Toutes les anomalies sont corrigées et couvertes par un test ou une procédure vérifiée.

## 3. Analyse

- **Ce que les tests ont apporté** : le fuzzing a montré de façon chiffrée l'effet de la validation (191 → 0 erreur 500). Le test de non-régression de l'administration a trouvé une régression que j'avais introduite moi-même, avant qu'elle n'arrive en production.
- **Faux positifs traités** : deux échecs venaient des tests eux-mêmes (le mot « password » dans `must_change_password`, l'astérisque des champs obligatoires de Mantine). Ils sont corrigés dans les tests, pas en affaiblissant les vérifications.
- **Limites** : les tests automatiques d'accessibilité ne couvrent qu'une partie du RGAA ; la navigation au clavier et au lecteur d'écran reste à vérifier à la main. Le test de charge a été fait en local : les chiffres doivent être confirmés sur la recette.

## 4. Décision

La version `dp/qualite` peut être déployée sur l'**environnement de recette**. La mise en production est soumise à la recette par la cliente (`RECETTE.md`), notamment pour le changement de teinte des boutons.
