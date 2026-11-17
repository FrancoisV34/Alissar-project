# Compte rendu de réunion n° 3 : retours sur la V1 et refonte (maquettage en direct)

| | |
|---|---|
| Date | 09/05/2026 |
| Format | Visio avec partage d'écran |
| Participants | La praticienne (cliente), François Vittecoq (développeur) |
| Rédacteur | François Vittecoq |

## Ordre du jour
1. Retours de la cliente après quelques mois d'utilisation de la V1
2. Maquettage de la nouvelle page d'accueil, en direct
3. Ce que la cliente veut pouvoir modifier seule
4. Périmètre de la livraison

## Points abordés
- **Retours sur la V1 :** le contenu convient, mais la cliente veut un rendu plus moderne et plus « premium ». Surtout, chaque modification (horaire, tarif, formation) passe par le développeur, ce qui n'est pas tenable dans la durée.
- **Maquettage en direct :** pendant la visio, plusieurs variantes de la page d'accueil sont générées avec Claude Design et comparées à l'écran : palettes de couleurs, polices de titres, mise en page du bandeau d'accueil. La cliente réagit en direct, sans passer par des wireframes ni un aller-retour de maquettes.
- **Hésitations de la cliente :** elle aime plusieurs variantes. D'où l'idée de ne pas trancher une fois pour toutes, mais de **lui laisser le choix dans l'administration**.
- **Téléphone :** sur mobile, deux actions doivent être immédiatement accessibles, « Appeler » et « Prendre RDV ».
- **Questions fréquentes :** ses patients lui posent souvent les mêmes questions (déroulé d'une séance, remboursement, à partir de quel âge…).
- **Référencement :** elle veut être trouvée sur « ostéopathe Vendargues ».

## Décisions
| # | Décision | Validée par |
|---|---|---|
| D1 | Nouveau design « corail et crème », avec Instrument Serif comme police de titres | Cliente |
| D2 | **Administration de l'apparence (onglet Personnalisation) :** 5 palettes (corail/crème, corail/sauge, terracotta/sable, prune/rose, forêt/crème), 4 polices de titres, mode sombre, 3 mises en page du bandeau d'accueil (plein cadre, éditorial, scindé) | Cliente et développeur |
| D3 | **Administration du contenu :** spécialités, tarifs, horaires, formations, FAQ, liens externes (Doctolib, Google), photos avec leurs textes alternatifs | Cliente |
| D4 | Ajout d'une section FAQ et d'une section avis Google | Cliente |
| D5 | Référencement local : données structurées (fiche « Physician »), sitemap, balises de partage sur les réseaux sociaux, bandeau cookies (RGPD) | Développeur, validé par la cliente |
| D6 | Mise en ligne sur Fly.io avec une base SQLite : coût quasi nul, conforme à la décision D4 de la réunion n° 1 | Développeur, validé par la cliente |

## Actions
| # | Action | Responsable | Échéance | Statut |
|---|---|---|---|---|
| A1 | Développer la refonte et l'administration | François | 14/05/2026 | Fait |
| A2 | Fournir les textes de la FAQ et vérifier les textes existants | Cliente | Avant la livraison | Fait **[à confirmer]** |
| A3 | Préparer la mise en ligne et la démonstration | François | 24/05/2026 | Fait |
