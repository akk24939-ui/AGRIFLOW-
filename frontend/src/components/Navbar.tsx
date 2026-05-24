import React, { useState, useEffect } from 'react';
import { Menu, X, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-container">
        <div className="logo-container">
          <img src="/logo.jpg" alt="Panimugil Farm Developers" className="nav-logo" />
        </div>
        
        <div className={`nav-links ${menuOpen ? 'active' : ''}`}>
          <a href="#home"     onClick={() => setMenuOpen(false)}>Home</a>
          <a href="#projects" onClick={() => setMenuOpen(false)}>Projects</a>
          <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#contact"  onClick={() => setMenuOpen(false)} className="nav-contact-btn">Contact Us</a>
          <Link
            to="/admin/login"
            onClick={() => setMenuOpen(false)}
            className="nav-admin-btn"
          >
            <ShieldCheck size={15} style={{ verticalAlign:'middle', marginRight:5 }}/>
            Admin Panel
          </Link>
        </div>

        <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

