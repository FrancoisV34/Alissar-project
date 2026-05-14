import Topbar from './Topbar.jsx';
import VitrineFooter from './VitrineFooter.jsx';
import JsonLd from './JsonLd.jsx';
import Analytics from './Analytics.jsx';
import CookieBanner from './CookieBanner.jsx';
import { useSeoMeta } from '../hooks/useSeoMeta.js';

export default function VitrineLayout({ children }) {
  useSeoMeta();
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
