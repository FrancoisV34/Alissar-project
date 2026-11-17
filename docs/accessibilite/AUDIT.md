# Audit d'accessibilité et de performance

| | |
|---|---|
| Date | 16/11/2026 |
| Référentiel | RGAA 4.1 (critères automatisables), WCAG 2.1 niveau AA |
| Outils | Lighthouse 12.3 (mobile et ordinateur), axe-core 4.10 via Playwright |
| Pages | Accueil, connexion, 6 onglets de l'administration (connecté) |
| Environnement | Build de production servi en local (`NODE_ENV=production`) |

> Les outils automatiques couvrent environ 30 % des critères RGAA. Les points manuels (navigation au clavier, lecteur d'écran, pertinence des alternatives) sont listés en fin de document.

## 1. Résultats

| Mesure | Avant | Après |
|---|---|---|
| Lighthouse accessibilité, accueil (mobile / ordinateur) | 93 / 93 | **100 / 100** |
| Lighthouse accessibilité, connexion | 94 / 94 | **100 / 100** |
| axe-core : violations WCAG AA (8 écrans) | 6 écrans en échec | **0** |
| Lighthouse performance, accueil (mobile / ordinateur) | ≈ 60 / 69 | **74 / 97** |
| Décalage de mise en page (CLS) | 0,57 | **0,04 à 0,08** (cible < 0,1) |
| Poids de la page (mobile) | 1 636 Kio | 958 à 1 415 Kio selon le chargement des tiers |
| Bundle JavaScript principal | 594 Ko | 357 Ko (113 Ko compressé) |

## 2. Corrections d'accessibilité

| Critère RGAA | Constat | Correction |
|---|---|---|
| 3.2 Contraste du texte | Texte blanc sur corail #e87265 : 2,98:1 (boutons « Prendre RDV ») | Nouvelle variable `--accent-strong` par palette, calculée automatiquement : la teinte d'origine assombrie jusqu'à 4,5:1 (#cb301e pour la palette corail) |
| 3.2 | Titres en italique corail : 2,55:1 | Variable `--accent-large` : seuil de 3:1 pour les textes de plus de 24 px, d'où un changement presque invisible (#e45c4d) |
| 3.2 | Gris secondaire `--ink-mute` : 2,96:1 | Assombri dans les 5 palettes et dans le thème sombre |
| 3.2 | Administration : boutons « light », badges, textes d'état (Mantine) | Variables CSS de Mantine redéfinies ; nuance primaire 8 (5,1:1) |
| 9.1 Hiérarchie des titres | `h4` (formations) et `h5` (pied de page) sans niveau intermédiaire | Passés en `h3` |
| 8.x / bonnes pratiques | Script inline dans `index.html` | Déplacé dans un fichier (exigé aussi par la CSP) |

Analyse statique : `eslint-plugin-jsx-a11y` vérifie à chaque commit les règles d'accessibilité du JSX (textes alternatifs, rôles ARIA, libellés).

**Impact visuel à valider par la cliente** : les boutons principaux passent du corail clair à un corail soutenu. Captures avant/après dans le dossier de preuves ; validation prévue en recette (`docs/tests/RECETTE.md`).

## 3. Corrections de performance (éco-conception)

| Constat | Correction | Effet |
|---|---|---|
| Aucune compression HTTP | Middleware `compression` (gzip) | JS, CSS et JSON environ 3 fois plus légers |
| Code de l'administration chargé par tous les visiteurs | `React.lazy` sur les pages de connexion et d'administration | Bundle principal −40 % |
| 4 dépendances jamais utilisées (`recharts`, `framer-motion`, `dayjs`, `@mantine/dates`) | Supprimées | Moins de code et de surface d'attaque |
| La page s'affichait avec une configuration vide puis se réorganisait | Attente de la configuration (un seul petit JSON) avant le premier rendu | CLS 0,57 → 0,05 |

Restent à traiter, avec l'accord de la cliente (photos fournies par elle) : conversion des photos en WebP et tailles adaptées à l'écran (gain estimé par Lighthouse : 350 Kio), réduction du nombre de polices chargées.

## 4. Vérifications manuelles à mener en recette

- Parcours complet au clavier (tabulation visible, ordre logique, menu, FAQ en accordéon, bandeau cookies).
- Lecture avec VoiceOver de l'accueil et du formulaire de connexion.
- Zoom à 200 % sans perte d'information.
- Pertinence des textes alternatifs saisis dans l'administration.
