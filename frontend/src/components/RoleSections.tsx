import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './RoleSections.css';

const roles = [
  {
    title: 'Customer',
    subtitle: 'For Land Owners',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    features: [
      'Live Farming Updates',
      'Photo & Video Reports',
      'Remote Monitoring',
      'Download Reports',
      'Complaint & Communication',
      'Land Activity Timeline'
    ],
    cta: 'Monitor Your Land',
    color: '#22c55e',
    route: '/customer',
    roleHint: 'customer'
  },
  {
    title: 'Owner',
    subtitle: 'Farm Management & Operations',
    image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    features: [
      'Task Assignment',
      'Worker Tracking',
      'Productivity Analytics',
      'Land-wise Monitoring',
      'Media Management',
      'Performance Reports'
    ],
    cta: 'Manage Operations',
    color: '#f59e0b',
    route: '/owner',
    roleHint: 'owner'
  },
  {
    title: 'Worker / Agent',
    subtitle: 'Smart Field Work Upload',
    image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    features: [
      'Upload Photos/Videos/PDF',
      'Daily Work Reports',
      'Task Progress Updates',
      'Farming Notes',
      'Mobile Friendly Upload',
      'Instant Notifications'
    ],
    cta: "Upload Today's Work",
    color: '#38bdf8',
    route: '/agent',
    roleHint: 'agent'
  }
];

const RoleSections: React.FC = () => {
  const navigate = useNavigate();

  const handleRoleClick = (route: string) => {
    // Navigate to the portal — each portal has its own login guard
    navigate(route);
  };

  return (
    <section className="roles-section section-padding" id="features">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">Platform Roles</span>
          <h2 className="section-title">Ecosystem Roles</h2>
          <p className="section-desc">
            A complete farm management platform with dedicated dashboards for every stakeholder.
          </p>
        </div>

        <div className="roles-grid">
          {roles.map((role, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ delay: index * 0.15, duration: 0.55 }}
              className="role-card"
            >
              {/* Card image */}
              <div className="role-image-container">
                <img src={role.image} alt={role.title} className="role-image" loading="lazy" />
                <div className="role-overlay">
                  <h3 className="role-main-title">{role.title}</h3>
                  <h4 className="role-subtitle">{role.subtitle}</h4>
                </div>
              </div>

              {/* Card body */}
              <div className="role-content">
                <ul className="role-features">
                  {role.features.map((feature, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.15 + i * 0.07 }}
                    >
                      <CheckCircle2 size={17} style={{ color: role.color, flexShrink: 0 }} />
                      <span>{feature}</span>
                    </motion.li>
                  ))}
                </ul>

                <button
                  className="role-btn"
                  style={{ '--hover-color': role.color, borderColor: role.color } as React.CSSProperties}
                  onClick={() => handleRoleClick(role.route)}
                >
                  {role.cta} <ArrowRight size={17} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoleSections;
