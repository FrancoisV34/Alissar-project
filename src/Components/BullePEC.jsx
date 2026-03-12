import React from 'react';
import { motion } from 'framer-motion';
import '../Style/BullePEC.scss';
import { usePec } from '../hooks/usePec.js';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const bubbleVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function BullePEC() {
  const { data, isLoading, isError } = usePec();

  if (isLoading) return <div className="loading-placeholder" />;
  if (isError) return null;

  return (
    <motion.section
      className="pretarifs"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
    >
      {data.map((item) => (
        <motion.div className="bulle-pec" key={item.id} variants={bubbleVariants}>
          <div className="img-container">
            <img src={item.image} alt={item.title} className="img-pec" />
          </div>
          <div className="text">
            <h2 className="title-pec">{item.title}</h2>
            <p className="pec-text">{item.content}</p>
          </div>
        </motion.div>
      ))}
    </motion.section>
  );
}
