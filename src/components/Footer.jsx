import { ArrowUpRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const currentYear = new Date().getFullYear();

const Footer = () => (
  <footer className="site-footer">
    <div className="footer-inner">
      <div className="footer-brand">
        <Link to="/" className="brand">
          <span className="brand-mark"><BookOpen size={20} /></span>
          <span>Kitabi<span>Keeda</span></span>
        </Link>
        <p>Make room for what you want to learn.</p>
      </div>
      <div className="footer-links">
        <Link to="/">Home</Link>
        <Link to="/courses">Explore courses <ArrowUpRight size={14} /></Link>
        <Link to="/register">Create an account <ArrowUpRight size={14} /></Link>
      </div>
      <p className="footer-copyright">© {currentYear} KitabiKeeda</p>
    </div>
  </footer>
);

export default Footer;
