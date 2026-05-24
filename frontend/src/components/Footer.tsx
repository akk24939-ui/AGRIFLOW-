import React from 'react';
import { motion } from 'framer-motion';
import { Car, MapPin, CheckCircle, Phone, Mail } from 'lucide-react';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer-section">
      <div className="visit-cta-container">
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="visit-card glass-card"
          >
            <div className="visit-content">
              <h2 className="visit-title">Schedule a Site Visit</h2>
              <p className="visit-desc">Experience our premium agricultural lands firsthand.</p>
              <ul className="visit-benefits">
                <li><CheckCircle size={18} className="benefit-icon" /> Free Site Visit Available</li>
                <li><CheckCircle size={18} className="benefit-icon" /> Clear Documents</li>
                <li><CheckCircle size={18} className="benefit-icon" /> Immediate Registration</li>
                <li><CheckCircle size={18} className="benefit-icon" /> Guided Land Visit</li>
                <li><CheckCircle size={18} className="benefit-icon" /> Transparent Process</li>
              </ul>
              <button className="btn-primary" style={{ marginTop: '20px' }}>
                <Car className="moving-car" size={20} /> Book Free Visit
              </button>
            </div>
            <div className="visit-illustration">
              <div className="map-pin pulse-animation">
                <MapPin size={40} />
              </div>
              <div className="road-line"></div>
              <Car className="animated-car" size={60} />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-grid">
          <div className="footer-brand">
            <h3 className="brand-name">AGRIFLOW</h3>
            <p>Smart Agriculture Land Management Ecosystem</p>
          </div>
          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Projects</a></li>
              <li><a href="#">Features</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
          <div className="footer-contact">
            <h4>Contact Us</h4>
            <p><Phone size={16} /> +91 98765 43210</p>
            <p><Mail size={16} /> info@agriflow.com</p>
          </div>
        </div>
        <div className="footer-copyright">
          <p>&copy; {new Date().getFullYear()} AgriFlow. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
