import React from 'react';
import { useSiteConfig } from '../hooks/useSiteConfig.js';

export default function Map() {
  const { data: config } = useSiteConfig();
  const src = config?.maps_embed_url;

  if (!src) return null;

  return (
    <div className="googlemap">
      <iframe
        src={src}
        width="600"
        height="450"
        style={{ border: 0 }}
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  );
}
