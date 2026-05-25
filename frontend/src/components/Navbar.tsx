import React, { useState, useEffect } from 'react';
import { Menu, X, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-container">
        {/* Logo */}
        <div className="logo-container" onClick={() => scrollTo('home')} style={{ cursor: 'pointer' }}>
          <img src="/logo.png" alt="Panimugil Farm Developers" className="nav-logo" />
        </div>

        {/* Desktop + Mobile nav links */}
        <div className={`nav-links ${menuOpen ? 'active' : ''}`}>
          <button className="nav-link-btn" onClick={() => scrollTo('home')}>Home</button>
          <button className="nav-link-btn" onClick={() => scrollTo('projects')}>Projects</button>
          <button className="nav-link-btn" onClick={() => scrollTo('features')}>Features</button>
          <button className="nav-link-btn nav-contact-btn" onClick={() => scrollTo('contact')}>Contact Us</button>
          <Link to="/admin/login" onClick={() => setMenuOpen(false)} className="nav-admin-btn">
            <ShieldCheck size={15} style={{ verticalAlign: 'middle', marginRight: 5 }} />
            Admin Panel
          </Link>
        </div>

        <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
