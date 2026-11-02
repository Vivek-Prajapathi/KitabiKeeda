import { useState } from 'react';
import {
  BarChart3, Bell, BookOpen, ChevronRight, FileText, Layers, LayoutDashboard,
  LogOut, Menu, Settings, ShoppingBag, Store, Tag, Users, X,
} from 'lucide-react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuth } from '../hooks/useAuth';

const menuItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Overview' },
  { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/admin/users', icon: Users, label: 'Users' },
  { path: '/admin/courses', icon: BookOpen, label: 'Courses' },
  { path: '/marketplace', icon: Store, label: 'LMS Marketplace' },
  { path: '/admin/marketplace', icon: ShoppingBag, label: 'Course lifecycle' },
  { path: '/admin/lms-admin', icon: Layers, label: 'LMS administration' },
  { path: '/admin/coupons', icon: Tag, label: 'Coupons' },
  { path: '/admin/orders', icon: FileText, label: 'Orders' },
  { path: '/admin/notifications', icon: Bell, label: 'Notifications' },
  { path: '/admin/layout', icon: Settings, label: 'Site content' },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const activeItem = menuItems.find(({ path }) =>
    path === '/admin' ? location.pathname === path : location.pathname.startsWith(path)
  );

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="admin-shell">
      {sidebarOpen && <button className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} aria-label="Close navigation" />}
      <aside className={`admin-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <Link to="/admin" className="admin-brand" onClick={() => setSidebarOpen(false)}>
          <span className="brand-mark"><BookOpen size={20} /></span>
          <span>Kitabi<span>Keeda</span><small>ADMIN CONSOLE</small></span>
        </Link>
        <div className="admin-nav-label">PLATFORM</div>
        <nav className="admin-nav" aria-label="Admin navigation">
          {menuItems.map(({ path, icon: Icon, label }) => {
            const active = path === '/admin'
              ? location.pathname === path
              : location.pathname.startsWith(path);
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setSidebarOpen(false)}
                className={active ? 'active' : ''}
              >
                <Icon size={18} />
                <span>{label}</span>
                {active && <ChevronRight className="admin-nav-chevron" size={15} />}
              </Link>
            );
          })}
        </nav>
        <div className="admin-sidebar-user">
          {user?.avatar?.url ? (
            <img src={user.avatar.url} alt="" className="avatar avatar-image" />
          ) : (
            <span className="avatar">{user?.name?.charAt(0)?.toUpperCase() || <Users size={17} />}</span>
          )}
          <div className="admin-sidebar-user-copy">
            <strong>{user?.name || 'Administrator'}</strong>
            <span>Administrator</span>
          </div>
          <button type="button" className="icon-button" onClick={handleLogout} aria-label="Sign out">
            <LogOut size={17} />
          </button>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <button
            type="button"
            className="workspace-menu-toggle"
            onClick={() => setSidebarOpen((open) => !open)}
            aria-label={sidebarOpen ? 'Close admin navigation' : 'Open admin navigation'}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="breadcrumbs">
            <Link to="/admin">Admin</Link><span>/</span><strong>{activeItem?.label || 'Overview'}</strong>
          </div>
          <div className="admin-topbar-actions">
            <span className="admin-role-pill">Administrator</span>
            <Link to="/" className="admin-view-site">View site</Link>
          </div>
        </header>
        <main className="admin-content"><Outlet /></main>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
};

export default AdminLayout;
