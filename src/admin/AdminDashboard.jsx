
import "./KitabiKeedaAdminTheme.css";

import { NavLink, Outlet } from "react-router-dom";
import Styles from "./_admin.module.css";

const AdminDashboard = () => {
    const menuItems = [
        { label: "Dashboard", icon: "🏠", path: "/admin", end: true },
        { label: "Users", icon: "👥", path: "/admin/admin-dashboard" },
        { label: "Manage Courses", icon: "🎓", path: "/admin/manage-courses" },
        { label: "LMS Marketplace", icon: "🛍️", path: "/admin/lms-marketplace" },
        { label: "LMS Admin", icon: "📊", path: "/admin/lms-admin" },
        { label: "Orders", icon: "📦", path: "/admin/orders" },
        { label: "Notifications", icon: "🔔", path: "/admin/notifications" },
        { label: "Analytics", icon: "📈", path: "/admin/analytics" },
        { label: "Layout", icon: "🖼️", path: "/admin/layout" },
        
    ];

    return (
        <section className={Styles.adminLayout}>
            <aside className={Styles.sidebar}>
                <h2 className={Styles.sidebarTitle}>
                    🎓 Admin Panel
                </h2>

                <p className={Styles.sidebarLabel}>
                    MANAGEMENT
                </p>

                <nav className={Styles.sidebarNav}>
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.label}
                            to={item.path}
                            end={item.end ?? true}
                            className={({ isActive }) =>
                                isActive
                                    ? `${Styles.sidebarLink} ${Styles.activeLink}`
                                    : Styles.sidebarLink
                            }
                        >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className={Styles.sidebarFooter}>
                    🎓 KitabiKeeda
                    <span>Learning Management System</span>
                </div>
            </aside>

            <main className={Styles.adminMain}>
                <Outlet />
            </main>
        </section>
    );
};

export default AdminDashboard;
