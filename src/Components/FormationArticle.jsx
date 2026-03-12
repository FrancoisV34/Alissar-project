import React from 'react';
import { motion } from 'framer-motion';
import '../Style/FormationArticle.scss';
import { useFormations } from '../hooks/useFormations.js';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function FormationArticle() {
  const { data: formations, isLoading, isError } = useFormations();

  if (isLoading) return <div className="loading-placeholder" />;
  if (isError) return null;

  return (
    <motion.section
      id="formations"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
    >
      {formations.map((formation) => (
        <motion.article className="formation" key={formation.id} variants={cardVariants}>
          <div className="formation-text">
            <h3 className="formation-title">{formation.title}</h3>
            <p className="formation-infos">{formation.description}</p>
          </div>
          <div className="formation-image">
            <img
              src={formation.image}
              alt={formation.title}
              className="formation-pic"
            />
          </div>
        </motion.article>
      ))}
    </motion.section>
  );
}
