import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import './Hero.css';

const Hero: React.FC = () => {
  const scrollToRoles = () => {
    const el = document.getElementById('features');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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
          {/* Brand Logo */}
          <div className="hero-logo-wrap">
            <img
              src="/panimugil-logo.png"
              alt="Panimugil Farm Developers"
              className="hero-brand-logo"
            />
          </div>

          <h1 className="main-title">AGRIFLOW</h1>
          <h3 className="sub-title">Smart Agriculture Land Management Ecosystem</h3>
          <p className="description">
            Remote Farm Monitoring • Land Management • Real-Time Agriculture Workflow Tracking
          </p>

          <div className="hero-actions">
            <button className="btn-primary" onClick={scrollToRoles}>
              Explore Ecosystem <ChevronDown size={20} />
            </button>
            <a href="/admin/login" className="btn-secondary">
              Login to Portal
            </a>
          </div>
        </motion.div>
      </div>

      <div className="scroll-indicator floating" onClick={scrollToRoles} style={{ cursor: 'pointer' }}>
        <div className="mouse"></div>
      </div>
    </section>
  );
};

export default Hero;
