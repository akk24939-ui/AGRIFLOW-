import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Sprout } from 'lucide-react';
import './LandShowcase.css';

const projects = [
  {
    name: 'Mustakuruchi',
    details: [{ label: 'Farm Land', value: '1 Acre 50 Cent' }, { label: 'Soil Type', value: 'Red Soil' }]
  },
  {
    name: 'Vetrilaimuriyanpatti',
    details: [{ label: 'Farm Land', value: '1 Acre 12 Cent' }, { label: 'Soil Type', value: 'Karisal Soil' }]
  },
  {
    name: 'Allalaperi',
    details: [
      { label: 'Land 1', value: '50 Cent (Sand Mixed Red Soil)' },
      { label: 'Land 2', value: '4 Acre 63 Cent (Sand Mixed Red Soil)' }
    ]
  },
  {
    name: 'T. Chettikulam',
    details: [{ label: 'Farm Land', value: '69.5 Cent' }, { label: 'Soil Type', value: 'Red Soil' }]
  },
  {
    name: 'Kambikudi',
    details: [
      { label: 'Land 1', value: '1 Acre 60 Cent' },
      { label: 'Land 2', value: '1 Acre 50 Cent (Karisal Mann)' }
    ]
  }
];

const LandShowcase: React.FC = () => {
  return (
    <section className="showcase-section section-padding" id="projects">
      <div className="container">
        <h2 className="section-title">Premium Land Projects</h2>
        
        <div className="showcase-grid">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="project-card glass-card"
            >
              <div className="project-header">
                <MapPin className="project-icon" size={24} />
                <h3 className="project-name">{project.name}</h3>
              </div>
              
              <div className="project-details">
                {project.details.map((detail, i) => (
                  <div key={i} className="detail-item">
                    <Sprout size={16} className="detail-icon" />
                    <span className="detail-label">{detail.label}:</span>
                    <span className="detail-value">{detail.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandShowcase;
