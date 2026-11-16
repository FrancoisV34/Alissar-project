-- 002 : traçabilité des connexions et index de lecture.
-- last_login_at : critère « Preuve » (DICP), l'administrateur voit quand chaque compte s'est connecté.
-- idx_external_links_type : la page publique filtre les liens par type (/api/external-links?type=booking).

ALTER TABLE users ADD COLUMN last_login_at TEXT;

CREATE INDEX IF NOT EXISTS idx_external_links_type ON external_links (type, sort_order);
