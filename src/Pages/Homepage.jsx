import React from 'react';
import '../Style/Main.scss';
import '../Style/Homepage.scss';
import Lightcab from '../assets/Cab.jpg';
import Section from '../Components/Section';
import FormationArticle from '../Components/FormationArticle.jsx';
import BullePEC from '../Components/BullePEC.jsx';
import Tarifs from '../Components/Tarifs.jsx';
import Accessibilite from '../Components/Accessibilite.jsx';
import Map from '../Components/Map.jsx';

export default function Homepage() {
  return (
    <>
      <div className="backimg">
        <img src={Lightcab} alt="Image du cabinet" className="cabimg" />
      </div>
      <Section />
      <FormationArticle />
      <BullePEC />
      <div className="tarifs-access">
        <Tarifs />
        <Accessibilite />
        <Map />
      </div>
    </>
  );
}
