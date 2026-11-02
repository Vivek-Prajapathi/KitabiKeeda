import { useState } from 'react';
import { BookOpen, LayoutDashboard, LogOut, Menu, ReceiptText, Settings, UserRound, X } from 'lucide-react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuth } from '../hooks/useAuth';

const navigation = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/dashboard/profile/my-learning', label: 'My learning', icon: BookOpen },
  { to: '/dashboard/orders', label: 'Orders', icon: ReceiptText },
  { to: '/dashboard/profile', label: 'Profile', icon: UserRound },
  { to: '/dashboard/profile/settings', label: 'Settings', icon: Settings },
];

const UserLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const pageName = navigation.find(({ to }) => location.pathname === to)?.label || 'Dashboard';

  return (
    <div className="workspace-shell">
      <header className="workspace-topbar">
        <button
          type="button"
          className="workspace-menu-toggle"
          onClick={() => setSidebarOpen((open) => !open)}
          aria-label={sidebarOpen ? 'Close dashboard navigation' : 'Open dashboard navigation'}
          aria-expanded={sidebarOpen}
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <Link to="/" className="brand">
          <span className="brand-mark"><BookOpen size={20} /></span>
          <span>Kitabi<span>Keeda</span></span>
        </Link>
        <div className="workspace-topbar-meta">
          <span className="workspace-greeting">Learning space</span>
          <span className="avatar">{user?.name?.charAt(0)?.toUpperCase() || <UserRound size={17} />}</span>
        </div>
      </header>
      <div className="workspace-body">
        {sidebarOpen && <button className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} aria-label="Close navigation" />}
        <aside className={`workspace-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
          <div className="sidebar-user">
            {user?.avatar?.url ? (
              <img src={user.avatar.url} alt="" className="avatar avatar-image" />
            ) : (
              <span className="avatar">{user?.name?.charAt(0)?.toUpperCase() || <UserRound size={18} />}</span>
            )}
            <div className="sidebar-user-copy">
              <strong>{user?.name || 'Learner'}</strong>
              <span>{user?.email}</span>
            </div>
          </div>
          <div className="sidebar-label">Workspace</div>
          <nav className="workspace-nav" aria-label="Student navigation">
            {navigation.map(({ to, label, icon: Icon }) => {
              const active = to === '/dashboard'
                ? location.pathname === to
                : location.pathname === to || location.pathname.startsWith(`${to}/`);
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setSidebarOpen(false)}
                  className={active ? 'active' : ''}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="workspace-sidebar-bottom">
            <Link to="/courses" onClick={() => setSidebarOpen(false)}><BookOpen size={18} /> Browse courses</Link>
            <button type="button" onClick={handleLogout}><LogOut size={18} /> Sign out</button>
          </div>
        </aside>
        <main className="workspace-main">
          <div className="workspace-pagebar">
            <div className="breadcrumbs"><Link to="/dashboard">Workspace</Link><span>/</span><strong>{pageName}</strong></div>
          </div>
          <div className="workspace-content"><Outlet /></div>
        </main>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
};

export default UserLayout;
