import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Smartphone, Cloud, Cpu } from 'lucide-react';
import './Performance.css';

const features = [
  { icon: <Zap size={32} />, title: '< 1 Second', desc: 'Page Load Time' },
  { icon: <Shield size={32} />, title: 'Enterprise', desc: 'Grade Security' },
  { icon: <Smartphone size={32} />, title: 'Optimized', desc: 'Mobile + Desktop' },
  { icon: <Cloud size={32} />, title: 'Cloud Ready', desc: 'Architecture' },
  { icon: <Cpu size={32} />, title: 'AI Powered', desc: 'Agriculture Ecosystem' },
];

const Performance: React.FC = () => {
  return (
    <section className="performance-section section-padding">
      <div className="container">
        <div className="performance-grid">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="perf-card glass-card"
            >
              <div className="perf-icon pulse-animation">{feature.icon}</div>
              <h3 className="perf-title">{feature.title}</h3>
              <p className="perf-desc">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Performance;
