import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, ChevronDown } from 'lucide-react';
import './Hero.css';

const Hero: React.FC = () => {
  return (
    <section className="hero-section" id="home">
      <div className="hero-bg">
        <div className="glass-overlay"></div>
        <div className="water-ripple"></div>
      </div>
      
      <div className="hero-content container">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="kural-container glass-card-dark"
        >
          <h2 className="tamil-text kural">
            "உழுதுண்டு வாழ்வாரே வாழ்வார் மற்றெல்லாம்<br/>
            தொழுதுண்டு பின்செல்லுபவர்."
          </h2>
          <p className="kural-meaning">
            "Those who live by farming truly live; the rest survive by depending on others."
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="main-title-container"
        >
          <h1 className="main-title">
            <span className="leaf-icon"><Leaf size={48} /></span>
            AGRIFLOW
          </h1>
          <h3 className="sub-title">Smart Agriculture Land Management Ecosystem</h3>
          <p className="description">
            Remote Farm Monitoring • Land Management • Real-Time Agriculture Workflow Tracking
          </p>
          
          <div className="hero-actions">
            <button className="btn-primary">
              Explore Ecosystem <ChevronDown size={20} />
            </button>
          </div>
        </motion.div>
      </div>

      <div className="scroll-indicator floating">
        <div className="mouse"></div>
      </div>
    </section>
  );
};

export default Hero;
