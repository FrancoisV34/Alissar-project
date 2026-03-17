import React from 'react';
import '../Style/Homepage.scss';
import { useSiteConfig } from '../hooks/useSiteConfig.js';

export default function BaniereAvis() {
  const { data: config } = useSiteConfig();
  const widgetId = config?.elfsight_widget_id;

  if (!widgetId) return null;

  return (
    <div className="avis" width="90%">
      <script src="https://elfsightcdn.com/platform.js" async></script>
      <div
        className={`elfsight-app-${widgetId}`}
        data-elfsight-app-lazy
      ></div>
    </div>
  );
}
