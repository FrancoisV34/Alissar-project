import '../Style/Tarifs.scss';
import React from 'react';
import { motion } from 'framer-motion';
import { useTarifs } from '../hooks/useTarifs.js';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function Tarifs() {
  const { data: tarifs, isLoading, isError } = useTarifs();

  if (isLoading) return <div className="loading-placeholder" />;
  if (isError) return null;

  return (
    <motion.section
      className="tarifs"
      id="tarifs"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
    >
      {tarifs.map((tarif) => (
        <motion.a
          className="presta-tarifs"
          key={tarif.id}
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.doctolib.fr/osteopathe/vendargues/alissar-atik/booking/motive-categories?specialityId=10&telehealth=false&placeId=practice-200784&bookingFunnelSource=profile"
          variants={cardVariants}
        >
          <h3>{tarif.prestation} : {tarif.prix}€</h3>
          <h4>{tarif.texte}</h4>
        </motion.a>
      ))}
    </motion.section>
  );
}
