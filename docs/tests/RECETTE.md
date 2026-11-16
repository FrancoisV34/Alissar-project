# Procédure de recette (tests d'acceptation)

**But :** avant chaque mise en production, la praticienne vérifie sur le site de **recette** que tout fonctionne comme elle l'attend. La production n'est mise à jour qu'après son accord.

| | |
|---|---|
| Site de recette | https://alissar-staging.fly.dev |
| Espace praticien de recette | https://alissar-staging.fly.dev/login (identifiants de recette transmis séparément) |
| Durée | 15 minutes environ |
| Déroulé | En visio avec le développeur (partage d'écran), ou seule avec cette liste |

> Le site de recette a ses **propres données** : rien de ce qui y est modifié n'apparaît sur le vrai site.

## 1. Ce qui change dans cette version

*À remplir par le développeur avant chaque recette.*

Version du 16/11/2026 (branche `dp/qualite`) :
- sécurité renforcée (aucun changement visible, sauf la règle des mots de passe : 12 caractères minimum) ;
- **couleur des boutons principaux plus soutenue**, pour qu'ils restent lisibles par les personnes malvoyantes (norme d'accessibilité) ;
- site plus rapide et plus stable au chargement ;
- onglet « Utilisateurs » réservé à l'administrateur ;
- nouvelle colonne « Dernière connexion » dans les comptes.

## 2. Liste de contrôle

Cocher chaque ligne. Pour toute ligne « Non », noter ce qui a été constaté.

### Le site public (sur ordinateur puis sur téléphone)

| # | Vérification | Oui | Non | Remarque |
|---|---|---|---|---|
| R1 | La page d'accueil s'affiche avec ma photo, mon titre et mes spécialités | ☐ | ☐ | |
| R2 | La nouvelle couleur des boutons me convient | ☐ | ☐ | |
| R3 | « Prendre rendez-vous » ouvre bien ma page Doctolib | ☐ | ☐ | |
| R4 | Sur téléphone, le bouton d'appel lance l'appel vers mon numéro | ☐ | ☐ | |
| R5 | Mes horaires, mes tarifs et mon adresse sont exacts | ☐ | ☐ | |
| R6 | La carte indique le bon emplacement du cabinet | ☐ | ☐ | |
| R7 | Les questions fréquentes s'ouvrent et se referment | ☐ | ☐ | |
| R8 | Les avis s'affichent (si la section est activée) | ☐ | ☐ | |

### Mon espace praticienne

| # | Vérification | Oui | Non | Remarque |
|---|---|---|---|---|
| R9 | Je me connecte avec mes identifiants de recette | ☐ | ☐ | |
| R10 | Je modifie l'horaire d'un jour, j'enregistre, et je le vois sur le site | ☐ | ☐ | |
| R11 | J'ajoute un tarif puis je le supprime | ☐ | ☐ | |
| R12 | Je change une photo (JPEG ou PNG) et elle s'affiche sur le site | ☐ | ☐ | |
| R13 | Je modifie le texte « À propos » avec un mot en italique, et l'italique s'affiche | ☐ | ☐ | |
| R14 | Je change de palette de couleurs, puis je reviens à la mienne | ☐ | ☐ | |
| R15 | Je me déconnecte | ☐ | ☐ | |

## 3. Décision

| | |
|---|---|
| Date de la recette | |
| Version testée (commit) | |
| Résultat | ☐ Validée : mise en production autorisée ☐ Refusée : corrections à faire (voir remarques) |
| Validée par | La praticienne |
| Mise en production le | |

Le développeur reporte la décision dans la pull request `develop → main`, puis approuve le déploiement dans l'environnement GitHub `production`.

## 4. Vérifications techniques faites par le développeur (en complément)

- Pipeline CI entièrement vert sur le commit testé.
- Test de fumée de la recette vert.
- Navigation au clavier et zoom à 200 % sur l'accueil (contrôles d'accessibilité manuels).
- Test de charge sur la recette (`sh tests/load/load.sh https://alissar-staging.fly.dev 15 20`), jamais sur la production.
