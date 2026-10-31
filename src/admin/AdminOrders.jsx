
import { useEffect, useState } from "react";
import axios from "axios";
import Styles from "./_admin.module.css";

const API_BASE = "https://mockapi-mauve.vercel.app/api/v1";

const orderAPI = axios.create({
    baseURL: `${API_BASE}/order`,
});

const courseAPI = axios.create({
    baseURL: `${API_BASE}/course`,
});

const authAPI = axios.create({
    baseURL: `${API_BASE}/auth`,
});

const addAuthToken = (config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
};

orderAPI.interceptors.request.use(addAuthToken);
courseAPI.interceptors.request.use(addAuthToken);
authAPI.interceptors.request.use(addAuthToken);

function extractArray(response, keys) {
    const data = response?.data?.data ?? response?.data;

    if (Array.isArray(data)) return data;

    for (const key of keys) {
        if (Array.isArray(data?.[key])) return data[key];
    }

    return [];
}

function getId(value) {
    if (!value) return "";

    if (typeof value === "object") {
        return String(value._id ?? value.id ?? "");
    }

    return String(value);
}

function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function getPaymentStatus(order) {
    return (
        order.payment_info?.status ??
        order.paymentInfo?.status ??
        order.paymentStatus ??
        order.status ??
        "Unknown"
    );
}

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [courseNames, setCourseNames] = useState({});
    const [userNames, setUserNames] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        async function loadOrders() {
            setLoading(true);
            setError("");

            const [ordersResult, coursesResult, usersResult] =
                await Promise.allSettled([
                    orderAPI.get("/get-all-order-dashboard"),
                    courseAPI.get("/get-all-course-dashboard"),
                    authAPI.get("/get-all-user-dashboard"),
                ]);

            if (!active) return;

            if (ordersResult.status === "rejected") {
                setError(
                    ordersResult.reason?.response?.data?.message ||
                    "Unable to load orders. Please try again."
                );
                setOrders([]);
                setLoading(false);
                return;
            }

            const orderList = extractArray(ordersResult.value, [
                "orders",
                "allOrders",
            ]);

            setOrders(orderList);

            if (coursesResult.status === "fulfilled") {
                const courses = extractArray(coursesResult.value, [
                    "courses",
                    "allCourses",
                ]);

                const names = {};

                courses.forEach((course) => {
                    const id = getId(course._id ?? course.id);
                    if (id) {
                        names[id] =
                            course.name ??
                            course.title ??
                            "Unnamed course";
                    }
                });

                setCourseNames(names);
            }

            if (usersResult.status === "fulfilled") {
                const users = extractArray(usersResult.value, [
                    "users",
                    "allUsers",
                ]);

                const names = {};

                users.forEach((user) => {
                    const id = getId(user._id ?? user.id);

                    if (id) {
                        names[id] =
                            user.name ??
                            user.fullName ??
                            user.email ??
                            "Unnamed user";
                    }
                });

                setUserNames(names);
            }

            setLoading(false);
        }

        loadOrders();

        return () => {
            active = false;
        };
    }, []);

    if (loading) {
        return (
            <section className={Styles.adminMain}>
                <h1>Orders</h1>
                <p>Loading orders...</p>
            </section>
        );
    }

    const paidOrders = orders.filter(
        (order) =>
            getPaymentStatus(order).toLowerCase() === "succeeded"
    );

    const formatAmount = (amount) =>
        `₹${Number(amount || 0).toLocaleString("en-IN")}`;

    const getOrderAmount = (order) =>
        order.totalAmount ??
        order.amount ??
        order.total ??
        order.price ??
        0;

    return (
        <section className={Styles.adminMain}>
            <div style={styles.header}>
                <div>
                    <h1>Orders</h1>
                    <p>View customer orders and payment status.</p>
                </div>

                <button
                    type="button"
                    style={styles.refreshButton}
                    onClick={() => window.location.reload()}
                >
                    Refresh
                </button>
            </div>

            {error && (
                <p style={styles.error}>{error}</p>
            )}

            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <span>Total Orders</span>
                    <h2>{orders.length}</h2>
                </div>

                <div style={styles.statCard}>
                    <span>Successful Payments</span>
                    <h2>{paidOrders.length}</h2>
                </div>

                <div style={styles.statCard}>
                    <span>Successful Payment Amount</span>
                    <h2>
                        {formatAmount(
                            paidOrders.reduce(
                                (sum, order) =>
                                    sum +
                                    Number(getOrderAmount(order)),
                                0
                            )
                        )}
                    </h2>
                </div>
            </div>

            {orders.length === 0 ? (
                <p style={styles.empty}>
                    {error ? "Orders could not be loaded." : "No orders found."}
                </p>
            ) : (
                <div style={styles.tableWrap}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Course</th>
                                <th>User</th>
                                <th>Amount</th>
                                <th>Payment Status</th>
                                <th>Payment ID</th>
                                <th>Date</th>
                            </tr>
                        </thead>

                        <tbody>
                            {orders.map((order, index) => {
                                const orderId = getId(
                                    order._id ?? order.id
                                );

                                const courseId = getId(
                                    order.courseId ??
                                    order.course ??
                                    order.course_id
                                );

                                const userId = getId(
                                    order.userId ??
                                    order.user ??
                                    order.user_id
                                );

                                const status = getPaymentStatus(order);
                                const successful =
                                    status.toLowerCase() === "succeeded";

                                return (
                                    <tr key={orderId || index}>
                                        <td style={styles.mono}>
                                            {orderId || "—"}
                                        </td>

                                        <td>
                                            {courseNames[courseId] ||
                                                order.course?.name ||
                                                courseId ||
                                                "—"}
                                        </td>

                                        <td>
                                            {userNames[userId] ||
                                                order.user?.name ||
                                                userId ||
                                                "—"}
                                        </td>

                                        <td>
                                            {formatAmount(
                                                getOrderAmount(order)
                                            )}
                                        </td>

                                        <td>
                                            <span
                                                style={{
                                                    ...styles.badge,
                                                    ...(successful
                                                        ? styles.success
                                                        : styles.pending),
                                                }}
                                            >
                                                {status}
                                            </span>
                                        </td>

                                        <td style={styles.mono}>
                                            {order.payment_info?.id ??
                                                order.paymentInfo?.id ??
                                                "—"}
                                        </td>

                                        <td>
                                            {formatDate(
                                                order.createdAt ??
                                                order.created_at ??
                                                order.orderDate
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}

const styles = {
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px",
        marginBottom: "24px",
    },
    refreshButton: {
        padding: "10px 16px",
        border: "none",
        borderRadius: "6px",
        background: "#2563eb",
        color: "#fff",
        cursor: "pointer",
    },
    statsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "16px",
        marginBottom: "24px",
    },
    statCard: {
        padding: "20px",
        border: "1px solid #e5e7eb",
        borderRadius: "10px",
        background: "#fff",
    },
    tableWrap: {
        width: "100%",
        overflowX: "auto",
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "10px",
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
        textAlign: "left",
    },
    mono: {
        fontFamily: "monospace",
        fontSize: "12px",
        overflowWrap: "anywhere",
    },
    badge: {
        display: "inline-block",
        padding: "5px 9px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "600",
    },
    success: {
        background: "#dcfce7",
        color: "#166534",
    },
    pending: {
        background: "#fef3c7",
        color: "#92400e",
    },
    error: {
        padding: "12px",
        borderRadius: "8px",
        background: "#fee2e2",
        color: "#991b1b",
    },
    empty: {
        padding: "20px",
        textAlign: "center",
    },
};
