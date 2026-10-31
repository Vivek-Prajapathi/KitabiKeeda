import { useCallback, useEffect, useState } from "react";
import {
    getAdminAnalytics,
    exportAdminEnrollments,
} from "../api/lms";

const METRICS = [
    {
        key: "users",
        label: "Users",
        icon: "👥",
        aliases: [
            "users",
            "totalUsers",
            "userCount",
            "total_users",
            "registeredUsers",
        ],
    },
    {
        key: "courses",
        label: "Courses",
        icon: "📚",
        aliases: [
            "courses",
            "totalCourses",
            "courseCount",
            "total_courses",
        ],
    },
    {
        key: "orders",
        label: "Orders",
        icon: "📦",
        aliases: [
            "orders",
            "totalOrders",
            "orderCount",
            "total_orders",
        ],
    },
    {
        key: "enrollments",
        label: "Enrollments",
        icon: "🎓",
        aliases: [
            "enrollments",
            "totalEnrollments",
            "enrollmentCount",
            "total_enrollments",
        ],
    },
    {
        key: "certificates",
        label: "Certificates",
        icon: "🏆",
        aliases: [
            "certificates",
            "totalCertificates",
            "certificateCount",
            "issuedCertificates",
        ],
    },
];

const normalizeKey = (key) =>
    key.replace(/[_\s-]/g, "").toLowerCase();

function findMetric(source, aliases) {
    if (!source || typeof source !== "object") {
        return null;
    }

    const aliasSet = new Set(aliases.map(normalizeKey));
    const queue = [source];
    const visited = new Set();

    while (queue.length) {
        const current = queue.shift();

        if (!current || typeof current !== "object") continue;
        if (visited.has(current)) continue;

        visited.add(current);

        if (Array.isArray(current)) {
            current.forEach((item) => {
                if (item && typeof item === "object") {
                    queue.push(item);
                }
            });
            continue;
        }

        for (const [key, value] of Object.entries(current)) {
            if (!aliasSet.has(normalizeKey(key))) continue;

            if (typeof value === "number" && Number.isFinite(value)) {
                return value;
            }

            if (
                typeof value === "string" &&
                value.trim() !== "" &&
                Number.isFinite(Number(value))
            ) {
                return Number(value);
            }

            if (Array.isArray(value)) {
                return value.length;
            }

            if (value && typeof value === "object") {
                for (const countKey of [
                    "total",
                    "count",
                    "value",
                    "length",
                ]) {
                    const count = value[countKey];

                    if (
                        typeof count === "number" &&
                        Number.isFinite(count)
                    ) {
                        return count;
                    }
                }
            }
        }

        Object.values(current).forEach((value) => {
            if (value && typeof value === "object") {
                queue.push(value);
            }
        });
    }

    return null;
}

export default function LMSAdminOverview() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [exporting, setExporting] = useState(false);
    const [exportError, setExportError] = useState("");
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchAnalytics = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getAdminAnalytics();

            setAnalytics(data);
            setLastUpdated(new Date());
        } catch (err) {
            console.error(
                "LMS analytics error:",
                err.response?.data || err.message
            );

            setError(
                err.response?.data?.message ||
                    "Unable to load LMS analytics. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    const handleExport = async () => {
        try {
            setExporting(true);
            setExportError("");

            const blob = await exportAdminEnrollments();

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = `lms-enrollments-${new Date()
                .toISOString()
                .slice(0, 10)}.csv`;

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(
                "Enrollment export error:",
                err.response?.data || err.message
            );

            setExportError(
                "Could not export enrollments. Check your admin access and try again."
            );
        } finally {
            setExporting(false);
        }
    };

    return (
        <main className="lms-admin-overview">
            <style>{`
                .lms-admin-overview {
                    min-height: 100%;
                    padding: 28px;
                    background: #f7f5ec;
                    color: #263522;
                    font-family: Inter, -apple-system,
                        BlinkMacSystemFont, "Segoe UI", sans-serif;
                }

                .lms-admin-overview *,
                .lms-admin-overview *::before,
                .lms-admin-overview *::after {
                    box-sizing: border-box;
                }

                .lms-admin-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 20px;
                    margin-bottom: 30px;
                }

                .lms-admin-eyebrow {
                    margin: 0 0 9px;
                    color: #628141;
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: 1.8px;
                }

                .lms-admin-header h1 {
                    margin: 0 0 9px;
                    color: #263522;
                    font-size: clamp(28px, 3vw, 38px);
                    font-weight: 800;
                    letter-spacing: -1px;
                    line-height: 1.2;
                }

                .lms-admin-subtitle {
                    margin: 0;
                    color: #70776a;
                    font-size: 14px;
                    line-height: 1.7;
                }

                .lms-admin-updated {
                    margin-top: 10px;
                    color: #858b7e;
                    font-size: 11px;
                }

                .lms-admin-actions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                }

                .lms-admin-button {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    min-height: 42px;
                    padding: 10px 15px;
                    border: 1px solid #d7dfcb;
                    border-radius: 10px;
                    background: #fffdf7;
                    color: #43563a;
                    font: inherit;
                    font-size: 12px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: background 0.2s ease,
                        transform 0.2s ease;
                }

                .lms-admin-button:hover {
                    background: #edf2e5;
                    transform: translateY(-1px);
                }

                .lms-admin-button.primary {
                    border-color: #628141;
                    background: #628141;
                    color: #ffffff;
                }

                .lms-admin-button.primary:hover {
                    background: #4e6934;
                }

                .lms-admin-button:disabled {
                    opacity: 0.65;
                    cursor: wait;
                    transform: none;
                }

                .lms-admin-section-title {
                    margin: 0 0 5px;
                    color: #263522;
                    font-size: 20px;
                    font-weight: 800;
                    letter-spacing: -0.4px;
                }

                .lms-admin-section-description {
                    margin: 0 0 20px;
                    color: #7a8073;
                    font-size: 12px;
                    line-height: 1.6;
                }

                .lms-admin-stats {
                    display: grid;
                    grid-template-columns: repeat(5, minmax(0, 1fr));
                    gap: 15px;
                }

                .lms-admin-stat {
                    position: relative;
                    min-width: 0;
                    padding: 20px 17px;
                    overflow: hidden;
                    border: 1px solid #e4e5d7;
                    border-radius: 15px;
                    background: #fffdf7;
                    box-shadow: 0 4px 14px rgba(38, 53, 34, 0.035);
                    transition: transform 0.2s ease,
                        box-shadow 0.2s ease;
                }

                .lms-admin-stat:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 9px 20px rgba(38, 53, 34, 0.075);
                }

                .lms-admin-stat-top {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 8px;
                }

                .lms-admin-stat-label {
                    color: #68715f;
                    font-size: 12px;
                    font-weight: 700;
                }

                .lms-admin-stat-icon {
                    display: grid;
                    flex-shrink: 0;
                    place-items: center;
                    width: 36px;
                    height: 36px;
                    border-radius: 11px;
                    background: #edf2e5;
                    font-size: 17px;
                }

                .lms-admin-stat:nth-child(2) .lms-admin-stat-icon {
                    background: #f4eddb;
                }

                .lms-admin-stat:nth-child(3) .lms-admin-stat-icon {
                    background: #e8eee2;
                }

                .lms-admin-stat:nth-child(4) .lms-admin-stat-icon {
                    background: #e7eee5;
                }

                .lms-admin-stat:nth-child(5) .lms-admin-stat-icon {
                    background: #f2eadf;
                }

                .lms-admin-stat-value {
                    display: block;
                    margin-top: 17px;
                    color: #263522;
                    font-size: clamp(26px, 2.5vw, 34px);
                    font-weight: 800;
                    letter-spacing: -1px;
                    line-height: 1.1;
                    overflow-wrap: anywhere;
                }

                .lms-admin-stat-caption {
                    margin: 8px 0 0;
                    color: #8b9083;
                    font-size: 11px;
                }

                .lms-admin-error {
                    margin: 20px 0;
                    padding: 16px;
                    border: 1px solid #e8c9c2;
                    border-radius: 12px;
                    background: #fff4f0;
                    color: #9b3929;
                    font-size: 13px;
                    line-height: 1.7;
                }

                .lms-admin-export-error {
                    margin: 16px 0 0;
                    color: #9b3929;
                    font-size: 12px;
                    line-height: 1.6;
                }

                .lms-admin-loading {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin: 15px 0;
                    padding: 24px;
                    border: 1px solid #e4e5d7;
                    border-radius: 14px;
                    background: #fffdf7;
                    color: #697260;
                    font-size: 13px;
                }

                .lms-admin-spinner {
                    width: 19px;
                    height: 19px;
                    border: 2px solid #dce5d2;
                    border-top-color: #628141;
                    border-radius: 50%;
                    animation: lmsAdminSpin 0.8s linear infinite;
                }

                @keyframes lmsAdminSpin {
                    to { transform: rotate(360deg); }
                }

                .lms-admin-note {
                    margin-top: 24px;
                    padding: 16px 18px;
                    border: 1px solid #e2e5d7;
                    border-radius: 12px;
                    background: #f0f2e8;
                    color: #68715f;
                    font-size: 12px;
                    line-height: 1.7;
                }

                @media (max-width: 1200px) {
                    .lms-admin-stats {
                        grid-template-columns: repeat(3, minmax(0, 1fr));
                    }
                }

                @media (max-width: 760px) {
                    .lms-admin-overview {
                        padding: 20px 16px;
                    }

                    .lms-admin-header {
                        flex-direction: column;
                    }

                    .lms-admin-stats {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                        gap: 12px;
                    }

                    .lms-admin-stat {
                        padding: 16px 13px;
                    }
                }

                @media (max-width: 420px) {
                    .lms-admin-stats {
                        grid-template-columns: 1fr;
                    }

                    .lms-admin-actions {
                        width: 100%;
                    }

                    .lms-admin-button {
                        flex: 1;
                    }
                }
            `}</style>

            <header className="lms-admin-header">
                <div>
                    <p className="lms-admin-eyebrow">
                        KITABIKEEDA / LMS ADMIN
                    </p>

                    <h1>LMS Overview</h1>

                    <p className="lms-admin-subtitle">
                        Manage your learning platform from one place.
                    </p>

                    {lastUpdated && !loading && (
                        <p className="lms-admin-updated">
                            Last updated:{" "}
                            {lastUpdated.toLocaleTimeString()}
                        </p>
                    )}
                </div>

                <div className="lms-admin-actions">
                    <button
                        type="button"
                        className="lms-admin-button"
                        onClick={fetchAnalytics}
                        disabled={loading}
                    >
                        ↻ {loading ? "Refreshing..." : "Refresh"}
                    </button>

                    <button
                        type="button"
                        className="lms-admin-button primary"
                        onClick={handleExport}
                        disabled={exporting}
                    >
                        ↓ {exporting ? "Exporting..." : "Export CSV"}
                    </button>
                </div>
            </header>

            <section aria-labelledby="lms-admin-stats-title">
                <h2
                    id="lms-admin-stats-title"
                    className="lms-admin-section-title"
                >
                    Platform Statistics
                </h2>

                <p className="lms-admin-section-description">
                    Overview of your LMS platform records.
                </p>

                {loading && !analytics ? (
                    <div className="lms-admin-loading">
                        <span className="lms-admin-spinner" />
                        Loading LMS statistics...
                    </div>
                ) : (
                    <div className="lms-admin-stats">
                        {METRICS.map((metric) => {
                            const value = findMetric(
                                analytics,
                                metric.aliases
                            );

                            return (
                                <article
                                    className="lms-admin-stat"
                                    key={metric.key}
                                >
                                    <div className="lms-admin-stat-top">
                                        <span className="lms-admin-stat-label">
                                            {metric.label}
                                        </span>

                                        <span
                                            className="lms-admin-stat-icon"
                                            aria-hidden="true"
                                        >
                                            {metric.icon}
                                        </span>
                                    </div>

                                    <strong className="lms-admin-stat-value">
                                        {loading && !analytics
                                            ? "—"
                                            : value === null
                                              ? "—"
                                              : value.toLocaleString()}
                                    </strong>

                                    <p className="lms-admin-stat-caption">
                                        {value === null
                                            ? "Not provided by analytics"
                                            : "Total records"}
                                    </p>
                                </article>
                            );
                        })}
                    </div>
                )}

                {error && (
                    <div className="lms-admin-error" role="alert">
                        <strong>Analytics unavailable.</strong>
                        <br />
                        {error}
                        <br />
                        Check that you are logged in with an admin account.
                        <br />
                        <button
                            type="button"
                            className="lms-admin-button"
                            onClick={fetchAnalytics}
                        >
                            Try again
                        </button>
                    </div>
                )}

                {exportError && (
                    <p className="lms-admin-export-error" role="alert">
                        {exportError}
                    </p>
                )}

                <div className="lms-admin-note">
                    Statistics are read from the LMS analytics API.
                    A dash means that the endpoint did not return a
                    matching metric; no sample figures are added.
                </div>
            </section>
        </main>
    );
}