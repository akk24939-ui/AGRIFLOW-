import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Send } from 'lucide-react';
import './ContactSection.css';

const ContactSection: React.FC = () => {
  return (
    <section className="contact-section section-padding" id="contact">
      <div className="container">
        <h2 className="section-title">Get in Touch</h2>
        
        <div className="contact-wrapper">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="contact-info"
          >
            <h3>Contact Information</h3>
            <p className="contact-desc">
              Reach out to us for any inquiries about our agricultural land projects or farm management system.
            </p>
            
            <div className="info-items">
              <div className="info-item">
                <div className="info-icon"><Phone size={20} /></div>
                <div>
                  <h4>Phone</h4>
                  <p>+91 98765 43210</p>
                </div>
              </div>
              <div className="info-item">
                <div className="info-icon"><Mail size={20} /></div>
                <div>
                  <h4>Email</h4>
                  <p>info@agriflow.com</p>
                </div>
              </div>
              <div className="info-item">
                <div className="info-icon"><MapPin size={20} /></div>
                <div>
                  <h4>Office Address</h4>
                  <p>123 Agri Tower, Tech Park,<br/>Chennai, Tamil Nadu 600001</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="contact-form-container glass-card"
          >
            <h3>Send us a Message</h3>
            <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" placeholder="Enter your name" />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" placeholder="Enter your phone number" />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea placeholder="How can we help you?" rows={4}></textarea>
              </div>
              <button type="submit" className="btn-primary w-100">
                <Send size={18} /> Submit Details
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
