
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Styles from "./_admin.module.css";
import toast from "react-hot-toast";
import { fetchAllUsers } from "../api/auth";

export default function AdminHome() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchUsers = async () => {
            try {
                const response = await fetchAllUsers();

                console.log("Dashboard users response:", response);

                const userData = Array.isArray(response)
                    ? response
                    : Array.isArray(response?.users)
                    ? response.users
                    : Array.isArray(response?.data)
                    ? response.data
                    : [];

                if (isMounted) {
                    setUsers(userData);
                }
            } catch (error) {
                console.error(
                    "Error fetching dashboard statistics:",
                    error.response?.data || error.message
                );

                if (isMounted) {
                    toast.error("Failed to load dashboard statistics");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchUsers();

        return () => {
            isMounted = false;
        };
    }, []);

    const totalUsers = users.length;

    const totalAdmins = users.filter(
        (user) => user.role?.toLowerCase() === "admin"
    ).length;

    const regularUsers = users.filter(
        (user) => user.role?.toLowerCase() !== "admin"
    ).length;

    const currentDate = new Date();

    return (
        <div className={Styles.adminHome}>
            <header className={Styles.adminHeader}>
                <div>
                    <p className={Styles.adminLabel}>
                        KITABIKEEDA / ADMIN
                    </p>

                    <h1>Admin Dashboard</h1>

                    <p className={Styles.adminSubtitle}>
                        Welcome back! Here's what's happening in your community.
                    </p>
                </div>

                <div className={Styles.dateCard}>
                    <strong>
                        {currentDate.toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                        })}
                    </strong>

                    <span>
                        {currentDate.toLocaleDateString("en-IN", {
                            weekday: "long",
                        })}
                    </span>
                </div>
            </header>

            <section className={Styles.statsGrid}>
                <article className={Styles.statCard}>
                    <p>Total Users</p>
                    <h2>{loading ? "..." : totalUsers}</h2>
                    <span>Registered accounts</span>
                </article>

                <article className={Styles.statCard}>
                    <p>Administrators</p>
                    <h2>{loading ? "..." : totalAdmins}</h2>
                    <span>Admin accounts</span>
                </article>

                <article className={Styles.statCard}>
                    <p>Regular Users</p>
                    <h2>{loading ? "..." : regularUsers}</h2>
                    <span>Standard accounts</span>
                </article>
            </section>

            <section className={Styles.quickActions}>
                <h2>Quick Actions</h2>
                <p>Manage your community from one place.</p>

                <div className={Styles.actionGrid}>
                    <article className={Styles.actionCard}>
                        <h3>Manage Users</h3>
                        <p>View, search and manage user accounts.</p>
                        <Link to="/admin/admin-dashboard">
                            View Users →
                        </Link>
                    </article>

                    <article className={Styles.actionCard}>
                        <h3>Manage Courses</h3>
                        <p>View and manage your courses.</p>
                        <Link to="/admin/manage-courses">
                            Manage Courses →
                        </Link>
                    </article>

                    <article className={Styles.actionCard}>
                        <h3>My Profile</h3>
                        <p>View your account information.</p>
                        <Link to="/user/profile">
                            View Profile →
                        </Link>
                    </article>
                </div>
            </section>
        </div>
    );
}
