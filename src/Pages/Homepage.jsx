import React from 'react';
import '../Style/Main.scss';
import '../Style/Homepage.scss';
import Lightcab from '../assets/Facecab.jpg';
import Section from '../Components/Section';
import FormationArticle from '../Components/FormationArticle.jsx';

export default function Homepage() {
  return (
    <>
      <div className="backimg">
        <img src={Lightcab} alt="Image du cabinet" className="cabimg" />
      </div>
      <Section />
      <FormationArticle />
    </>
  );
}
