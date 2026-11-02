import { useState } from 'react';
import { BookOpen, ChevronDown, LayoutDashboard, LogOut, Menu, UserRound, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const { isAuthenticated, user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  };

  const handleLogout = async () => {
    closeMenus();
    await logout();
    navigate('/');
  };

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <header className="site-header">
      <nav className="site-nav" aria-label="Main navigation">
        <Link to="/" className="brand" onClick={closeMenus} aria-label="KitabiKeeda home">
          <span className="brand-mark"><BookOpen size={21} strokeWidth={2.2} /></span>
          <span>Kitabi<span>Keeda</span></span>
        </Link>

        <div className="nav-links">
          <Link className={isActive('/') ? 'active' : ''} to="/">Home</Link>
          <Link className={isActive('/courses') ? 'active' : ''} to="/courses">Courses</Link>
          <Link className={isActive('/marketplace') ? 'active' : ''} to="/marketplace">LMS Marketplace</Link>
          {isAuthenticated && (
            <Link className={isActive('/dashboard') ? 'active' : ''} to="/dashboard">
              My learning
            </Link>
          )}
        </div>

        <div className="nav-actions">
          {isAuthenticated ? (
            <div className="profile-menu">
              <button
                type="button"
                className="profile-trigger"
                onClick={() => setProfileDropdownOpen((open) => !open)}
                aria-expanded={profileDropdownOpen}
                aria-label="Open account menu"
              >
                {user?.avatar?.url ? (
                  <img src={user.avatar.url} alt="" className="avatar avatar-image" />
                ) : (
                  <span className="avatar"><UserRound size={17} /></span>
                )}
                <span className="profile-name">{user?.name || 'My account'}</span>
                <ChevronDown size={16} />
              </button>
              {profileDropdownOpen && (
                <div className="profile-dropdown">
                  <Link to="/dashboard/profile" onClick={closeMenus}>
                    <UserRound size={16} /> Profile
                  </Link>
                  <Link to={isAdmin ? '/admin' : '/dashboard'} onClick={closeMenus}>
                    <LayoutDashboard size={16} /> {isAdmin ? 'Admin dashboard' : 'Dashboard'}
                  </Link>
                  <button type="button" onClick={handleLogout}>
                    <LogOut size={16} /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-links">
              <Link className="nav-login" to="/login">Log in</Link>
              <Link className="button button-primary button-small" to="/register">Get started</Link>
            </div>
          )}
          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </nav>
      {mobileMenuOpen && (
        <div className="mobile-nav">
          <Link to="/" onClick={closeMenus}>Home</Link>
          <Link to="/courses" onClick={closeMenus}>Courses</Link>
          <Link to="/marketplace" onClick={closeMenus}>LMS Marketplace</Link>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" onClick={closeMenus}>My learning</Link>
              <Link to="/dashboard/profile" onClick={closeMenus}>Profile</Link>
              {isAdmin && <Link to="/admin" onClick={closeMenus}>Admin dashboard</Link>}
              <button type="button" onClick={handleLogout}><LogOut size={17} /> Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={closeMenus}>Log in</Link>
              <Link to="/register" onClick={closeMenus}>Create account</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
