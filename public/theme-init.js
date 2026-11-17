// Applique le thème clair/sombre avant le premier rendu (évite un flash).
// Fichier séparé plutôt qu'un script inline : la Content-Security-Policy interdit les scripts inline.
(function () {
  var stored = null;
  try { stored = localStorage.getItem('mb-color-scheme'); } catch (e) { /* stockage indisponible */ }
  document.documentElement.setAttribute('data-mantine-color-scheme', stored === 'dark' ? 'dark' : 'light');
})();
