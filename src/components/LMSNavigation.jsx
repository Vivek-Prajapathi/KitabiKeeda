import { BookOpen, GraduationCap, Home, LayoutDashboard, Store } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const LMSNavigation = () => {
  const { isAdmin, isInstructor } = useAuth();
  const location = useLocation();
  const links = [
    { to: '/marketplace', label: 'Marketplace', icon: Store },
    { to: '/dashboard/profile/my-learning', label: 'My Learning', icon: BookOpen },
    ...((isInstructor || isAdmin)
      ? [{ to: '/instructor', label: 'Instructor', icon: GraduationCap }]
      : []),
    ...(isAdmin
      ? [{ to: '/admin/lms-admin', label: 'LMS Admin', icon: LayoutDashboard }]
      : []),
    { to: '/', label: 'Back to Site Home', icon: Home },
  ];

  return (
    <nav className="lms-navigation" aria-label="LMS navigation">
      {links.map(({ to, label, icon: Icon }) => {
        const active = to === '/marketplace'
          ? location.pathname === '/marketplace'
            || location.pathname.startsWith('/marketplace/')
          : location.pathname === to || (to !== '/' && location.pathname.startsWith(`${to}/`));
        return (
          <Link
            key={to}
            to={to}
            className={active ? 'is-active' : ''}
            aria-current={active ? 'page' : undefined}
          >
            <Icon size={17} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default LMSNavigation;
