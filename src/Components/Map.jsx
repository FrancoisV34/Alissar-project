import React from 'react';

export default function Map() {
  return (
    <div className="googlemap">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2886.482067138589!2d3.9722819!3d43.6589431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12b6a7193b8a1ea5%3A0xf18456d31e8c4d65!2sOst%C3%A9opathe%20D.O%20Vendargues%20Alissar%20ATIK!5e0!3m2!1sfr!2sfr!4v1761640976393!5m2!1sfr!2sfr"
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
