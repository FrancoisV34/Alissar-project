import React from 'react';
import '../Style/Telephone.scss';
import { useContact } from '../hooks/useContact.js';

export default function Telephone() {
  const { data } = useContact();
  const phone = data?.contact?.phone;

  if (!phone) return null;

  const href = `tel:+33${phone.replace(/\s/g, '').slice(1)}`;

  return (
    <div className="telephone-container">
      <a href={href} className="telephone-num">
        <button className="telephone-button">{phone}</button>
      </a>
    </div>
  );
}
