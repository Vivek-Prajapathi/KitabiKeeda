
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Styles from "./_admin.module.css";
import api from "../api/axios";

const AdminNotifications = () => {
    const [items, setItems] = useState(null);
    const [busyId, setBusyId] = useState("");

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const { data } = await api.get(
                    "/notifications/get-all-notification"
                );

                setItems(
                    Array.isArray(data?.notifications)
                        ? data.notifications
                        : []
                );
            } catch (error) {
                console.error(
                    "Failed to load notifications:",
                    error.response?.data || error.message
                );

                toast.error("Failed to load notifications");
                setItems([]);
            }
        };

        fetchNotifications();
    }, []);

    const markRead = async (id) => {
        try {
            setBusyId(id);

            const { data } = await api.put(
                `/notifications/update-notification-status/${id}`
            );

            if (Array.isArray(data?.notifications)) {
                setItems(data.notifications);
            } else {
                setItems((previousItems) =>
                    previousItems.map((item) =>
                        item._id === id
                            ? { ...item, status: "read" }
                            : item
                    )
                );
            }

            toast.success("Notification marked as read");
        } catch (error) {
            console.error(
                "Failed to update notification:",
                error.response?.data || error.message
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to update notification"
            );
        } finally {
            setBusyId("");
        }
    };

    if (items === null) {
        return (
            <section className={Styles.notificationsPage}>
                <p className={Styles.notificationEmpty}>
                    Loading notifications...
                </p>
            </section>
        );
    }

    const unread = items.filter(
        (item) => item.status === "unread"
    ).length;

    return (
        <section className={Styles.notificationsPage}>
            <header className={Styles.notificationsHeader}>
                <div>
                    <span className={Styles.notificationsEyebrow}>
                        KITABIKEEDA / ADMIN
                    </span>

                    <h1>Notifications</h1>

                    <p>Stay updated with activity in your community.</p>
                </div>

                <div className={Styles.notificationSummary}>
                    <span className={Styles.notificationSummaryNumber}>
                        {unread}
                    </span>

                    <span>
                        Unread
                        <br />
                        notifications
                    </span>
                </div>
            </header>

            <div className={Styles.notificationSectionHeader}>
                <div>
                    <h2>Recent Activity</h2>
                    <p>
                        You have {items.length} notifications in total.
                    </p>
                </div>

                <span className={Styles.notificationCount}>
                    {items.length} total
                </span>
            </div>

            {items.length === 0 ? (
                <div className={Styles.notificationEmpty}>
                    <span>🔔</span>
                    <h3>You're all caught up!</h3>
                    <p>No notifications to display right now.</p>
                </div>
            ) : (
                <div className={Styles.notificationList}>
                    {items.map((item) => {
                        const isUnread = item.status === "unread";

                        return (
                            <article
                                key={item._id}
                                className={`${Styles.notificationCard} ${
                                    isUnread
                                        ? Styles.notificationCardUnread
                                        : ""
                                }`}
                            >
                                <div className={Styles.notificationIcon}>
                                    {item.title
                                        ?.toLowerCase()
                                        .includes("order")
                                        ? "📦"
                                        : item.title
                                              ?.toLowerCase()
                                              .includes("review")
                                          ? "⭐"
                                          : item.title
                                                ?.toLowerCase()
                                                .includes("question")
                                            ? "💬"
                                            : "🔔"}
                                </div>

                                <div className={Styles.notificationContent}>
                                    <div className={Styles.notificationTitleRow}>
                                        <h3>{item.title}</h3>

                                        {isUnread && (
                                            <span
                                                className={
                                                    Styles.notificationUnreadBadge
                                                }
                                            >
                                                New
                                            </span>
                                        )}
                                    </div>

                                    <p>{item.message}</p>

                                    <div
                                        className={
                                            Styles.notificationMeta
                                        }
                                    >
                                        <span>
                                            🕒{" "}
                                            {item.createdAt
                                                ? new Date(
                                                      item.createdAt
                                                  ).toLocaleDateString(
                                                      "en-IN",
                                                      {
                                                          day: "2-digit",
                                                          month: "short",
                                                          year: "numeric",
                                                      }
                                                  )
                                                : "Date unavailable"}
                                        </span>
                                    </div>
                                </div>

                                <div
                                    className={
                                        Styles.notificationActions
                                    }
                                >
                                    {isUnread ? (
                                        <button
                                            type="button"
                                            className={
                                                Styles.markReadButton
                                            }
                                            disabled={busyId === item._id}
                                            onClick={() =>
                                                markRead(item._id)
                                            }
                                        >
                                            {busyId === item._id
                                                ? "Updating..."
                                                : "Mark as read"}
                                        </button>
                                    ) : (
                                        <span
                                            className={
                                                Styles.notificationReadBadge
                                            }
                                        >
                                            ✓ Read
                                        </span>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
};

export default AdminNotifications;
