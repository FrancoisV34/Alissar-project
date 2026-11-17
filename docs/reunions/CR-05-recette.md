# Compte rendu de réunion n° 5 : recette de la version « qualité et sécurité »

| | |
|---|---|
| Date | 17/11/2026 |
| Format | **[à confirmer : visio ou sur place]** |
| Participants | La praticienne (cliente), François Vittecoq (développeur) |
| Rédacteur | François Vittecoq |

## Ordre du jour
1. Présentation des changements de la version
2. Déroulé de la liste de recette (`docs/tests/RECETTE.md`) sur le site de recette
3. Décision de mise en production

## Points abordés
- **Changements présentés :**
  - sécurité renforcée ;
  - mots de passe de 12 caractères minimum ;
  - onglet « Utilisateurs » réservé à l'administrateur ;
  - colonne « Dernière connexion » ;
  - site plus rapide au chargement ;
  - **boutons principaux d'un corail plus soutenu**.
- **Couleur des boutons :** le corail d'origine n'offrait qu'un contraste de 2,99:1 avec le texte blanc, alors que la norme d'accessibilité (RGAA/WCAG) exige 4,5:1. La teinte retenue, la plus proche de l'originale qui respecte la norme, atteint 5,28:1. La cliente a comparé les captures avant/après.
- **Vérifications :** la liste de recette a été déroulée sur https://alissar-staging.fly.dev, sur le site public (ordinateur et téléphone) puis dans l'espace praticienne.
- **Remarques de la cliente :** **[à compléter, ou « aucune »]**

## Décisions
| # | Décision | Validée par |
|---|---|---|
| D1 | Nouvelle teinte des boutons acceptée | Cliente |
| D2 | Recette validée, mise en production autorisée | Cliente |

## Actions
| # | Action | Responsable | Échéance | Statut |
|---|---|---|---|---|
| A1 | Fusionner dans `main` et approuver le déploiement en production | François | 17/11/2026 | Fait (PR #3 et #4, production v3, test de fumée réussi) |
