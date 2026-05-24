import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './RoleSections.css';

const roles = [
  {
    title: 'Customer',
    subtitle: 'For Land Owners',
    image: 'https://images.openai.com/static-rsc-4/5VK1PU2Hfdvo0ix3PBiiJ1UhG9RezrRwJTAvREx9yHKvKJPgSwsY6qGMJ5AfY5jYf8bSnfguyFUTcGVV9gSJo010RPTdzWc3RQIJM1qfGUBekRWN3H7-lT2qg7qXkGApANBAI2uoUcAac0vlPqy6bYvhSdnYg8wFMX7UXAdDCFTkD6XtXZCFD6S3Tgj2joIF?purpose=fullsize',
    features: [
      'Live Farming Updates',
      'Photo & Video Reports',
      'Remote Monitoring',
      'Download Reports',
      'Complaint & Communication',
      'Land Activity Timeline'
    ],
    cta: 'Monitor Your Land',
    color: 'var(--primary-green)'
  },
  {
    title: 'Owner',
    subtitle: 'Farm Management & Operations',
    image: 'https://images.openai.com/static-rsc-4/8u-C2fMfjS6AvA4hvCdRz6cJa6LuA8Q839cbYcssAINMEPgn9QYfBUgTjctDZvkjSuwu7zo3grZY_eYwPR28jxZK6LHvhRgO8R_Hia9yVZLmdZgVbF4-0wyGkuAE69Q0v6yfV0ME4F0GvWkhnHhuNxXkZUHxnLhxpXxHHGzhk0J4IwTm1yyc847flm_NL-nC?purpose=fullsize',
    features: [
      'Task Assignment',
      'Worker Tracking',
      'Productivity Analytics',
      'Land-wise Monitoring',
      'Media Management',
      'Performance Reports'
    ],
    cta: 'Manage Operations',
    color: 'var(--earth-brown)'
  },
  {
    title: 'Worker / Agent',
    subtitle: 'Smart Field Work Upload',
    image: 'https://images.openai.com/static-rsc-4/UYO6ME_UVfCfe5hrzlZ1WWItsb5KX_N6i9ZV6yUevM5G8OaG-IjXsbyXI3lonpXOJ6gY37fNP4wdyfZO-AuzMC-sRzIdMdB4WBgIzg5HWHh6zPnb2keDwe8CohLtl1fK8ldqEjLituCGtKBcPJcL8f-twIq3CKgiz4pfr7xZ71JpYnZgSSuw3gxFYrA5BxlM?purpose=fullsize',
    features: [
      'Upload Photos/Videos/PDF',
      'Daily Work Reports',
      'Task Progress Updates',
      'Farming Notes',
      'Mobile Friendly Upload',
      'Instant Notifications'
    ],
    cta: "Upload Today's Work",
    color: 'var(--sky-blue)'
  }
];

const RoleSections: React.FC = () => {
  return (
    <section className="roles-section section-padding" id="login">
      <div className="container">
        <h2 className="section-title">Ecosystem Roles</h2>
        
        <div className="roles-grid">
          {roles.map((role, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              className="role-card"
            >
              <div className="role-image-container">
                <img src={role.image} alt={role.title} className="role-image" loading="lazy" />
                <div className="role-overlay" style={{ background: `linear-gradient(to top, rgba(0,0,0,0.8), transparent)` }}>
                  <h3 className="role-main-title">{role.title}</h3>
                  <h4 className="role-subtitle">{role.subtitle}</h4>
                </div>
              </div>
              
              <div className="role-content">
                <ul className="role-features">
                  {role.features.map((feature, i) => (
                    <motion.li 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: (index * 0.2) + (i * 0.1) }}
                    >
                      <CheckCircle2 size={18} style={{ color: role.color }} className="feature-icon" />
                      <span>{feature}</span>
                    </motion.li>
                  ))}
                </ul>
                
                <Link to="/admin/login" className="role-btn" style={{ '--hover-color': role.color, display: 'flex', textDecoration: 'none' } as React.CSSProperties}>
                  {role.cta} <ArrowRight size={18} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoleSections;
