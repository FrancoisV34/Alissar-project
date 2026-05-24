import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../Components/Hero.jsx';
import Specialties from '../Components/Specialties.jsx';
import About from '../Components/About.jsx';
import Formations from '../Components/Formations.jsx';
import Reviews from '../Components/Reviews.jsx';
import Pratique from '../Components/Pratique.jsx';
import Faq from '../Components/Faq.jsx';

export default function Homepage() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(hash.slice(1));
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, [hash]);

  return (
    <>
      <Hero />
      <Specialties />
      <About />
      <Formations />
      <Reviews />
      <Pratique />
      <Faq />
    </>
  );
}
