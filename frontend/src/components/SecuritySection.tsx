import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Key, Users, FileDigit, Server, Database } from 'lucide-react';
import './SecuritySection.css';

const securityFeatures = [
  { icon: <Key size={30} />, title: 'JWT Authentication' },
  { icon: <Lock size={30} />, title: 'Secure Login' },
  { icon: <Users size={30} />, title: 'Role Based Access' },
  { icon: <FileDigit size={30} />, title: 'Encrypted Data' },
  { icon: <Server size={30} />, title: 'Enterprise FastAPI Backend' },
  { icon: <Database size={30} />, title: 'PostgreSQL Secure Architecture' }
];

const SecuritySection: React.FC = () => {
  return (
    <section className="security-section section-padding">
      <div className="container">
        <h2 className="section-title" style={{ color: 'white' }}>Enterprise Grade Security</h2>
        
        <div className="security-grid">
          {securityFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="security-card glass-card-dark"
            >
              <div className="security-icon-wrapper pulse-animation">
                {feature.icon}
              </div>
              <h4 className="security-title">{feature.title}</h4>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;
