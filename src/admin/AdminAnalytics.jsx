
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Styles from "./_admin.module.css";

const API_BASE = "https://mockapi-mauve.vercel.app/api/v1";

const api = axios.create({
    baseURL: API_BASE,
    headers: {
        "Content-Type": "application/json",
    },
});

// Attach the login token to protected API requests.
const addAuthToken = (config) => {
    const token =
        localStorage.getItem("token") ||
        localStorage.getItem("TOKEN");

    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
};

api.interceptors.request.use(
    addAuthToken,
    (error) => Promise.reject(error)
);

// Official analytics endpoints from your API documentation.
const SECTIONS = [
    {
        key: "users",
        title: "User Signups",
        icon: "👥",
        endpoint: () =>
            api.get("/analytics/get-users-analytics"),
    },
    {
        key: "courses",
        title: "Courses",
        icon: "📚",
        endpoint: () =>
            api.get("/analytics/get-course-analytics"),
    },
    {
        key: "orders",
        title: "Orders",
        icon: "📦",
        endpoint: () =>
            api.get("/analytics/get-order-analytics"),
    },
];

// Extract the API response payload.
function getPayload(response) {
    return response?.data?.data ?? response?.data ?? {};
}

// Find an array inside the API response.
function findArray(value, depth = 0) {
    if (Array.isArray(value)) {
        return value;
    }

    if (
        !value ||
        typeof value !== "object" ||
        depth > 4
    ) {
        return [];
    }

    const preferredKeys = [
        "last12Months",
        "users",
        "courses",
        "orders",
        "results",
        "items",
        "data",
    ];

    for (const key of preferredKeys) {
        if (Array.isArray(value[key])) {
            return value[key];
        }
    }

    for (const child of Object.values(value)) {
        if (Array.isArray(child)) {
            return child;
        }
    }

    for (const child of Object.values(value)) {
        const result = findArray(child, depth + 1);

        if (result.length) {
            return result;
        }
    }

    return [];
}

// Get the date from a record when available.
function getDate(item) {
    const value =
        item?.createdAt ??
        item?.created_at ??
        item?.createdOn ??
        item?.date ??
        item?.orderDate;

    if (!value) {
        return null;
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? null
        : date;
}

// Build a series for the last 12 months.
function createMonthlySeries(items) {
    const now = new Date();

    const months = Array.from(
        { length: 12 },
        (_, index) => {
            const date = new Date(
                now.getFullYear(),
                now.getMonth() - 11 + index,
                1
            );

            return {
                key: `${date.getFullYear()}-${date.getMonth()}`,
                label: date.toLocaleDateString("en-IN", {
                    month: "short",
                }),
                value: 0,
            };
        }
    );

    const monthMap = new Map(
        months.map((month) => [
            month.key,
            month,
        ])
    );

    items.forEach((item) => {
        const date = getDate(item);

        if (!date) {
            return;
        }

        const key =
            `${date.getFullYear()}-${date.getMonth()}`;

        const month = monthMap.get(key);

        if (month) {
            month.value += 1;
        }
    });

    return months;
}

// Convert monthly analytics response into chart data.
function getAnalyticsSeries(payload) {
    const rows = findArray(payload);

    if (!rows.length) {
        return createMonthlySeries([]);
    }

    const firstRow = rows[0];

    // Analytics APIs may return already-aggregated monthly data.
    if (
        firstRow &&
        typeof firstRow === "object" &&
        (
            firstRow.month !== undefined ||
            firstRow.label !== undefined
        ) &&
        (
            firstRow.count !== undefined ||
            firstRow.value !== undefined ||
            firstRow.total !== undefined
        )
    ) {
        return rows.map((row, index) => ({
            key: `${row.year ?? ""}-${row.month ?? row.label ?? index}`,
            label: String(
                row.monthName ??
                row.month ??
                row.label ??
                row.name ??
                ""
            ),
            value: Number(
                row.count ??
                row.value ??
                row.total ??
                0
            ),
        }));
    }

    // Otherwise, count records using their dates.
    return createMonthlySeries(rows);
}

// Chart component.
function BarChart({ data, title }) {
    if (!data.length) {
        return (
            <div className={Styles.analyticsEmpty}>
                No monthly data available.
            </div>
        );
    }

    const max = Math.max(
        ...data.map((item) => item.value),
        1
    );

    return (
        <div className={Styles.analyticsChart}>
            {data.map((item, index) => {
                const height =
                    item.value > 0
                        ? Math.max(
                              (item.value / max) * 100,
                              4
                          )
                        : 0;

                return (
                    <div
                        className={Styles.analyticsBarColumn}
                        key={`${item.key}-${index}`}
                        title={`${title}: ${item.label} - ${item.value}`}
                    >
                        <span className={Styles.analyticsBarValue}>
                            {item.value}
                        </span>

                        <div className={Styles.analyticsBarTrack}>
                            <div
                                className={Styles.analyticsBar}
                                style={{
                                    height: `${height}%`,
                                }}
                            />
                        </div>

                        <span className={Styles.analyticsBarLabel}>
                            {item.label.slice(0, 3)}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

// Summary card.
function AnalyticsCard({
    title,
    icon,
    total,
    error,
}) {
    return (
        <article className={Styles.analyticsStatCard}>
            <div className={Styles.analyticsStatTop}>
                <div className={Styles.analyticsIcon}>
                    {icon}
                </div>

                <span className={Styles.analyticsStatLabel}>
                    {title}
                </span>
            </div>

            <h2 className={Styles.analyticsStatNumber}>
                {error ? "—" : total ?? "—"}
            </h2>

            <p className={Styles.analyticsStatFooter}>
                {error
                    ? "Data currently unavailable"
                    : "Total records"}
            </p>
        </article>
    );
}

export default function AdminAnalytics() {
    const [results, setResults] = useState({
        users: null,
        courses: null,
        orders: null,
    });

    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchAnalytics = useCallback(async () => {
        setLoading(true);

        try {
            const requests = await Promise.allSettled(
                SECTIONS.map((section) =>
                    section.endpoint()
                )
            );

            const updated = {};

            requests.forEach((result, index) => {
                const key = SECTIONS[index].key;

                if (result.status === "rejected") {
                    updated[key] = {
                        error:
                            result.reason?.response?.data?.message ||
                            result.reason?.message ||
                            "Unable to load data.",
                        total: null,
                        series: [],
                    };

                    return;
                }

                const payload = getPayload(result.value);

                // Support the common analytics response shapes.
                const sectionPayload =
                    payload[key] ??
                    payload.analytics ??
                    payload;

                const items = findArray(sectionPayload);

                const series = getAnalyticsSeries(sectionPayload);

                const total =
                    sectionPayload.total ??
                    sectionPayload.totalCount ??
                    sectionPayload.totalUsers ??
                    sectionPayload.totalCourses ??
                    sectionPayload.totalOrders ??
                    payload.total ??
                    payload.totalCount ??
                    (
                        items.length
                            ? items.reduce(
                                  (sum, item) =>
                                      sum +
                                      Number(
                                          item.count ??
                                          item.value ??
                                          item.total ??
                                          1
                                      ),
                                  0
                              )
                            : series.reduce(
                                  (sum, item) =>
                                      sum + item.value,
                                  0
                              )
                    );

                updated[key] = {
                    error: null,
                    total,
                    series,
                };
            });

            setResults(updated);
            setLastUpdated(new Date());
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    return (
        <section className={Styles.analyticsPage}>
            <header className={Styles.analyticsHeader}>
                <div>
                    <span className={Styles.analyticsEyebrow}>
                        KITABIKEEDA / REPORTS
                    </span>

                    <h1>Admin Analytics</h1>

                    <p>
                        Track your platform's activity and
                        monitor your learning community.
                    </p>
                </div>

                <button
                    type="button"
                    className={Styles.analyticsRefresh}
                    onClick={fetchAnalytics}
                    disabled={loading}
                >
                    <span
                        className={
                            loading
                                ? Styles.analyticsSpin
                                : ""
                        }
                    >
                        ↻
                    </span>

                    {loading ? "Loading..." : "Refresh Data"}
                </button>
            </header>

            {lastUpdated && (
                <p className={Styles.analyticsUpdated}>
                    Last updated:{" "}
                    {lastUpdated.toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </p>
            )}

            <div className={Styles.analyticsStatsGrid}>
                {SECTIONS.map((section) => (
                    <AnalyticsCard
                        key={section.key}
                        title={section.title}
                        icon={section.icon}
                        total={
                            results[section.key]?.total
                        }
                        error={
                            results[section.key]?.error
                        }
                    />
                ))}
            </div>

            {results.users?.error && (
                <div className={Styles.analyticsNotice}>
                    <strong>User analytics unavailable</strong>

                    <p>
                        {results.users.error}
                    </p>

                    {results.users.error.includes("Login first") ||
                    results.users.error.includes("401") ? (
                        <span>
                            Please log in again with your admin account.
                        </span>
                    ) : (
                        <span>
                            Please check the API response and try again.
                        </span>
                    )}
                </div>
            )}

            <div className={Styles.analyticsSectionHeading}>
                <div>
                    <h2>Platform Overview</h2>

                    <p>
                        Monthly activity over the last 12 months.
                    </p>
                </div>

                <span className={Styles.analyticsPeriod}>
                    LAST 12 MONTHS
                </span>
            </div>

            {["users", "courses", "orders"].map((key) => {
                const section = SECTIONS.find(
                    (item) => item.key === key
                );

                const result = results[key];

                return (
                    <article
                        className={Styles.analyticsChartCard}
                        key={key}
                    >
                        <div className={Styles.analyticsChartHeader}>
                            <div>
                                <div className={Styles.analyticsChartTitleRow}>
                                    <span className={Styles.analyticsChartIcon}>
                                        {section.icon}
                                    </span>

                                    <h3>{section.title}</h3>
                                </div>

                                <p>
                                    {key === "users"
                                        ? "User registration activity"
                                        : key === "courses"
                                        ? "Course creation activity"
                                        : "Order activity across your platform"}
                                </p>
                            </div>

                            <div className={Styles.analyticsChartTotal}>
                                <span>Total</span>

                                <strong>
                                    {result?.error
                                        ? "—"
                                        : result?.total ?? "—"}
                                </strong>
                            </div>
                        </div>

                        {loading && !result ? (
                            <div className={Styles.analyticsLoading}>
                                Loading analytics...
                            </div>
                        ) : result?.error ? (
                            <div className={Styles.analyticsError}>
                                {result.error}
                            </div>
                        ) : (
                            <BarChart
                                data={result?.series || []}
                                title={section.title}
                            />
                        )}
                    </article>
                );
            })}

            <footer className={Styles.analyticsFooter}>
                <span>📊</span>

                <p>
                    Analytics overview for your KitabiKeeda
                    learning platform.
                </p>
            </footer>
        </section>
    );
}
