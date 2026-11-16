import Topbar from './Topbar.jsx';
import VitrineFooter from './VitrineFooter.jsx';
import JsonLd from './JsonLd.jsx';
import Analytics from './Analytics.jsx';
import CookieBanner from './CookieBanner.jsx';
import { useSeoMeta } from '../hooks/useSeoMeta.js';
import { useSiteConfig } from '../hooks/useSiteConfig.js';

export default function VitrineLayout({ children }) {
  useSeoMeta();
  const { isPending } = useSiteConfig();

  // Tant que la configuration n'est pas chargée, on n'affiche rien plutôt qu'une
  // page par défaut qui se réorganise ensuite (décalage de mise en page, CLS).
  if (isPending) return <div className="vitrine" style={{ minHeight: '100vh' }} aria-busy="true" />;

  return (
    <div className="vitrine">
      <JsonLd />
      <Analytics />
      <Topbar />
      <main>{children}</main>
      <VitrineFooter />
      <CookieBanner />
    </div>
  );
}
