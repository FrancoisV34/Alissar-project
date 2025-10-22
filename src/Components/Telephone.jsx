import React from 'react';
import '../Style/Telephone.scss';

export default function Telephone() {
  return (
    <div className="telephone-container">
      <a href="tel:+33650348873" className="telephone-num">
        <button className="telephone-button">06 50 34 88 73</button>
      </a>
    </div>
  );
}
