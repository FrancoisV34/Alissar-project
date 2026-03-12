import { motion } from 'framer-motion';
import Button from '../Components/Button.jsx';
import Telephone from '../Components/Telephone.jsx';
import Separator from './Separator.jsx';
import { useSections } from '../hooks/useSections.js';

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function Section() {
  const { data: sections, isLoading, isError } = useSections();

  if (isLoading) return <div className="loading-placeholder" />;
  if (isError) return null;

  return (
    <>
      {sections.map((data, index) => (
        <motion.section
          className={`presentation ${index % 2 === 0 ? 'normal' : 'reverse'} ${index === 0 ? 'first' : 'other'}`}
          key={data.id}
          id={data.idlink}
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <div className="text-pres">
            <h2 className="title-pres">{data.title}</h2>
            <Separator index={index} />
            {data.paragraphs.map((text, i) => (
              <p className="presentation-text" key={i}>{text}</p>
            ))}
            <div className="rdv-tel">
              <Button />
              <Telephone />
            </div>
          </div>
          <div className="img-pres">
            <img src={data.image} alt={data.title} className="selfie" />
          </div>
        </motion.section>
      ))}
    </>
  );
}
