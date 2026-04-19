import React from 'react';
import Layout from '../components/Layout';
import Hero from './HomeSections/Hero';
import Impact from './HomeSections/Impact';
import Sports from './HomeSections/Sports';
import Facilities from './HomeSections/Facilities';
import Journey from './HomeSections/Journey';
import Services from './HomeSections/Services';
import Testimonials from './HomeSections/Testimonials';
import Team from './HomeSections/Team';
import CTA from './HomeSections/CTA';

const Home = () => {
  return (
    <Layout>
      <Hero />
      <Impact />
      <Sports />
      <Facilities />
      <Journey />
      <Services />
      <Testimonials />
      <Team />
      <CTA />
    </Layout>
  );
};

export default Home;
