

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getMyLearning,
    getProgressAnalytics,
    getMyCertificates,
    downloadCertificatePdf,
    getMyPurchases,
    getMyWishlist,
    toggleMyWishlist,
} from "../api/lms";

import { GetPublishedCoursesApi } from "../api/marketplace";

const TABS = [
    { id: "courses", label: "My Courses" },
    { id: "progress", label: "Progress" },
    { id: "certificates", label: "Certificates" },
    { id: "purchases", label: "Purchases" },
    { id: "wishlist", label: "Wishlist" },
];

function findArray(payload, keys, depth = 0) {
    if (Array.isArray(payload)) return payload;

    if (
        !payload ||
        typeof payload !== "object" ||
        depth > 7
    ) {
        return null;
    }

    for (const key of keys) {
        if (Array.isArray(payload[key])) {
            return payload[key];
        }
    }

    for (const value of Object.values(payload)) {
        if (value && typeof value === "object") {
            const found = findArray(value, keys, depth + 1);

            if (found !== null) {
                return found;
            }
        }
    }

    return null;
}

function unwrapList(payload, keys) {
    return findArray(payload, keys) ?? [];
}

function idFrom(value) {
    if (typeof value === "string" || typeof value === "number") {
        return String(value);
    }

    if (!value || typeof value !== "object") {
        return "";
    }

    return String(
        value._id ??
        value.id ??
        value.courseId ??
        value.certificateId ??
        ""
    );
}

function getCourse(item) {
    if (item?.course && typeof item.course === "object") {
        return item.course;
    }

    if (item?.courseDetails && typeof item.courseDetails === "object") {
        return item.courseDetails;
    }

    if (item?.courseInfo && typeof item.courseInfo === "object") {
        return item.courseInfo;
    }

    if (item?.courseId && typeof item.courseId === "object") {
        return item.courseId;
    }

    return item ?? {};
}

function getCourseId(item) {
    return (
        idFrom(item?.courseId) ||
        idFrom(item?.course) ||
        idFrom(item?.courseDetails) ||
        idFrom(item?.courseInfo) ||
        idFrom(item)
    );
}

function getCertificateId(item) {
    return String(
        item?.certificateId ??
        item?._id ??
        item?.id ??
        ""
    );
}

function getTitle(item) {
    const course = getCourse(item);

    return (
        course?.name ??
        course?.title ??
        course?.courseName ??
        item?.courseName ??
        item?.title ??
        "Untitled Course"
    );
}

function getDescription(item) {
    const course = getCourse(item);

    return course?.description ?? item?.description ?? "";
}

function getImage(item) {
    const course = getCourse(item);

    const image =
        course?.thumbnail ??
        course?.image ??
        course?.coverImage;

    if (typeof image === "string") {
        return image;
    }

    return (
        image?.url ??
        course?.thumbnailUrl ??
        course?.imageUrl ??
        course?.coverImageUrl ??
        course?.bannerImage ??
        ""
    );
}

function getVideoUrl(item) {
    const course = getCourse(item);

    return (
        course?.demoUrl ??
        course?.videoUrl ??
        course?.previewUrl ??
        course?.previewVideo?.url ??
        course?.video?.url ??
        ""
    );
}

function getEmbedUrl(value) {
    if (!value || typeof value !== "string") {
        return "";
    }

    try {
        const url = new URL(value);
        const host = url.hostname.replace(/^www\./, "");

        if (
            host === "youtu.be" ||
            host === "youtube.com" ||
            host === "m.youtube.com" ||
            host === "youtube-nocookie.com"
        ) {
            let videoId = "";

            if (host === "youtu.be") {
                videoId =
                    url.pathname.split("/").filter(Boolean)[0] || "";
            } else {
                videoId =
                    url.searchParams.get("v") ||
                    url.pathname.match(
                        /\/(?:embed|shorts|live)\/([^/?]+)/
                    )?.[1] ||
                    "";
            }

            return videoId
                ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`
                : "";
        }

        if (host === "vimeo.com") {
            const videoId = url.pathname
                .split("/")
                .filter(Boolean)
                .find((part) => /^\d+$/.test(part));

            return videoId
                ? `https://player.vimeo.com/video/${videoId}`
                : "";
        }
    } catch {
        return "";
    }

    return "";
}

function isDirectVideo(url) {
    return /\.(mp4|webm|ogg|mov|m4v)(?:$|[?#])/i.test(url || "");
}

function getPrice(item) {
    const course = getCourse(item);

    const raw =
        course?.price ??
        course?.salePrice ??
        course?.sellingPrice ??
        course?.estimatedPrice;

    if (raw == null || raw === "") {
        return null;
    }

    const value = Number(raw);

    return Number.isFinite(value) ? value : null;
}

function getRating(item) {
    const course = getCourse(item);

    const raw =
        course?.rating ??
        course?.averageRating ??
        course?.ratingAverage;

    if (raw == null || raw === "") {
        return null;
    }

    const value = Number(raw);

    return Number.isFinite(value) ? value : null;
}

function getProgress(item) {
    const course = getCourse(item);

    const raw =
        item?.progressPercentage ??
        item?.completionPercentage ??
        item?.progress?.percentage ??
        item?.progress?.percent ??
        course?.progressPercentage ??
        course?.completionPercentage ??
        (typeof item?.progress === "number"
            ? item.progress
            : undefined);

    if (raw == null || raw === "") {
        return null;
    }

    const value = Number(String(raw).replace("%", ""));

    return Number.isFinite(value)
        ? Math.max(0, Math.min(100, value))
        : null;
}

function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? String(value)
        : date.toLocaleDateString("en-IN");
}

function formatMoney(value) {
    if (value == null || value === "") {
        return "Amount unavailable";
    }

    const number = Number(value);

    return Number.isFinite(number)
        ? `₹${number.toLocaleString("en-IN", {
              maximumFractionDigits: 2,
          })}`
        : String(value);
}

function getErrorMessage(error) {
    if (error.response?.status === 401) {
        return "Please log in again to access your learning data.";
    }

    if (error.response?.status === 403) {
        return "You do not have permission to access this information.";
    }

    return (
        error.response?.data?.message ||
        "Unable to load this information. Please try again."
    );
}

function getMetric(data, aliases) {
    if (!data || typeof data !== "object") {
        return null;
    }

    const normalize = (key) =>
        key.replace(/[_\s-]/g, "").toLowerCase();

    const accepted = new Set(aliases.map(normalize));
    const queue = [data];
    const visited = new Set();

    while (queue.length) {
        const current = queue.shift();

        if (
            !current ||
            typeof current !== "object" ||
            visited.has(current)
        ) {
            continue;
        }

        visited.add(current);

        if (Array.isArray(current)) {
            current.forEach((value) => {
                if (value && typeof value === "object") {
                    queue.push(value);
                }
            });

            continue;
        }

        for (const [key, value] of Object.entries(current)) {
            if (!accepted.has(normalize(key))) continue;

            if (
                typeof value === "number" &&
                Number.isFinite(value)
            ) {
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

function enrichCourses(items, publishedCourses) {
    const courseMap = new Map();

    publishedCourses.forEach((course) => {
        const id = idFrom(course);

        if (id) {
            courseMap.set(id, course);
        }
    });

    return items.map((item) => {
        const referenceId = getCourseId(item);
        const embeddedCourse = getCourse(item);

        const hasDetails = Boolean(
            embeddedCourse?.name ||
            embeddedCourse?.title ||
            embeddedCourse?.thumbnail ||
            embeddedCourse?.image ||
            embeddedCourse?.demoUrl ||
            embeddedCourse?.price != null
        );

        const matchedCourse = courseMap.get(referenceId);

        return {
            ...item,
            course:
                matchedCourse ||
                (hasDetails ? embeddedCourse : item),
        };
    });
}

function CourseMedia({ item }) {
    const videoUrl = getVideoUrl(item);
    const embedUrl = getEmbedUrl(videoUrl);
    const imageUrl = getImage(item);
    const title = getTitle(item);

    if (embedUrl) {
        return (
            <div className="kk-learning-media">
                <iframe
                    src={embedUrl}
                    title={`${title} video preview`}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                />
            </div>
        );
    }

    if (videoUrl && isDirectVideo(videoUrl)) {
        return (
            <div className="kk-learning-media">
                <video
                    controls
                    preload="metadata"
                    poster={imageUrl || undefined}
                >
                    <source src={videoUrl} />
                    Your browser does not support video playback.
                </video>
            </div>
        );
    }

    if (imageUrl) {
        return (
            <div className="kk-learning-media">
                <img
                    src={imageUrl}
                    alt={title}
                    loading="lazy"
                    onError={(event) => {
                        event.currentTarget.style.display = "none";
                    }}
                />

                {videoUrl && (
                    <a
                        className="kk-video-link"
                        href={videoUrl}
                        target="_blank"
                        rel="noreferrer"
                    >
                        Open video preview ↗
                    </a>
                )}
            </div>
        );
    }

    return (
        <div className="kk-learning-media kk-media-placeholder">
            <span aria-hidden="true">▶</span>
            <p>
                {videoUrl
                    ? "Video preview link available"
                    : "Preview not provided"}
            </p>

            {videoUrl && (
                <a
                    className="kk-video-link"
                    href={videoUrl}
                    target="_blank"
                    rel="noreferrer"
                >
                    Open video preview ↗
                </a>
            )}
        </div>
    );
}

export default function MyLearning() {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("courses");

    const [courses, setCourses] = useState([]);
    const [progress, setProgress] = useState(null);
    const [certificates, setCertificates] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [wishlist, setWishlist] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [downloadId, setDownloadId] = useState("");
    const [removingId, setRemovingId] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    const loadTab = useCallback(async (cancelled) => {
        setLoading(true);
        setError("");
        setNotice("");

        try {
            if (activeTab === "courses") {
                const [learningResult, publishedResult] =
                    await Promise.allSettled([
                        getMyLearning(),
                        GetPublishedCoursesApi(),
                    ]);

                if (learningResult.status === "rejected") {
                    throw learningResult.reason;
                }

                const learningItems = unwrapList(
                    learningResult.value,
                    [
                        "myLearning",
                        "enrollments",
                        "courses",
                        "items",
                        "results",
                    ]
                );

                const publishedCourses =
                    publishedResult.status === "fulfilled"
                        ? unwrapList(publishedResult.value, [
                              "publishedCourses",
                              "courses",
                              "allCourses",
                              "items",
                              "results",
                          ])
                        : [];

                if (!cancelled.value) {
                    setCourses(
                        enrichCourses(
                            learningItems,
                            publishedCourses
                        )
                    );
                }
            } else if (activeTab === "progress") {
                const response = await getProgressAnalytics();

                if (!cancelled.value) {
                    setProgress(response);
                }
            } else if (activeTab === "certificates") {
                const response = await getMyCertificates();

                const result = unwrapList(response, [
                    "certificates",
                    "items",
                    "results",
                ]);

                if (!cancelled.value) {
                    setCertificates(result);
                }
            } else if (activeTab === "purchases") {
                const response = await getMyPurchases();

                const result = unwrapList(response, [
                    "purchases",
                    "orders",
                    "items",
                    "results",
                ]);

                if (!cancelled.value) {
                    setPurchases(result);
                }
            } else if (activeTab === "wishlist") {
                const [wishlistResult, publishedResult] =
                    await Promise.allSettled([
                        getMyWishlist(),
                        GetPublishedCoursesApi(),
                    ]);

                if (wishlistResult.status === "rejected") {
                    throw wishlistResult.reason;
                }

                const wishlistItems = unwrapList(
                    wishlistResult.value,
                    [
                        "wishlist",
                        "wishlistedCourses",
                        "items",
                        "results",
                        "courses",
                    ]
                );

                const publishedCourses =
                    publishedResult.status === "fulfilled"
                        ? unwrapList(publishedResult.value, [
                              "publishedCourses",
                              "courses",
                              "allCourses",
                              "items",
                              "results",
                          ])
                        : [];

                if (!cancelled.value) {
                    setWishlist(
                        enrichCourses(
                            wishlistItems,
                            publishedCourses
                        )
                    );
                }
            }
        } catch (err) {
            console.error(
                `My Learning ${activeTab} error:`,
                err.response?.data || err.message
            );

            if (!cancelled.value) {
                setError(getErrorMessage(err));
            }
        } finally {
            if (!cancelled.value) {
                setLoading(false);
            }
        }
    }, [activeTab]);

    useEffect(() => {
        const cancellation = { value: false };

        loadTab(cancellation);

        return () => {
            cancellation.value = true;
        };
    }, [loadTab, refreshKey]);

    async function handleDownload(certificate) {
        const id = getCertificateId(certificate);

        if (!id) {
            setError("Certificate ID is missing.");
            return;
        }

        try {
            setDownloadId(id);
            setError("");

            const blob = await downloadCertificatePdf(id);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = `certificate-${id}.pdf`;

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.setTimeout(() => {
                window.URL.revokeObjectURL(url);
            }, 1000);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setDownloadId("");
        }
    }

    async function handleRemoveWishlist(item) {
        const id = getCourseId(item);

        if (!id) {
            setError("Course ID is missing from this wishlist item.");
            return;
        }

        try {
            setRemovingId(id);
            setError("");
            setNotice("");

            const response = await toggleMyWishlist(id);

            const isWishlisted =
                typeof response?.wishlisted === "boolean"
                    ? response.wishlisted
                    : typeof response?.data?.wishlisted === "boolean"
                      ? response.data.wishlisted
                      : false;

            if (isWishlisted) {
                setError(
                    "The API reports that this course is still wishlisted."
                );

                setRefreshKey((value) => value + 1);
                return;
            }

            setWishlist((previous) =>
                previous.filter(
                    (savedItem) => getCourseId(savedItem) !== id
                )
            );

            setNotice("Course removed from your wishlist.");
        } catch (err) {
            console.error(
                "Wishlist update failed:",
                err.response?.data || err.message
            );

            setError(getErrorMessage(err));
        } finally {
            setRemovingId("");
        }
    }

    const progressStats = [
        {
            label: "Total Enrollments",
            aliases: [
                "totalEnrollments",
                "enrollmentCount",
                "totalEnrollmentCount",
            ],
        },
        {
            label: "Completed Count",
            aliases: [
                "completedCount",
                "completedCourses",
                "completed",
            ],
        },
        {
            label: "In Progress Count",
            aliases: [
                "inProgressCount",
                "inProgressCourses",
                "inProgress",
            ],
        },
        {
            label: "Avg Progress",
            aliases: [
                "averageProgress",
                "avgProgress",
                "averageCompletion",
            ],
        },
        {
            label: "Last Activity",
            aliases: [
                "lastActivity",
                "lastActivityAt",
                "lastAccessedAt",
            ],
        },
    ];

    const progressCourses = progress
        ? unwrapList(progress, [
              "courseProgress",
              "progressByCourse",
              "perCourse",
              "courses",
              "items",
              "results",
          ])
        : [];

    return (
        <main className="kk-learning-page">
            <style>{`
                .kk-learning-page {
                    --kk-green: #628141;
                    --kk-green-dark: #405538;
                    --kk-green-light: #e6efdf;
                    --kk-cream: #f7f5ec;
                    --kk-card: #fffdf7;
                    --kk-text: #263522;
                    --kk-muted: #73796d;
                    --kk-border: #dce5d2;

                    min-height: calc(100vh - 80px);
                    padding: 32px clamp(16px, 4vw, 52px) 60px;
                    background: var(--kk-cream);
                    color: var(--kk-text);
                    font-family: Inter, -apple-system, BlinkMacSystemFont,
                        "Segoe UI", sans-serif;
                    box-sizing: border-box;
                }

                .kk-learning-page *,
                .kk-learning-page *::before,
                .kk-learning-page *::after {
                    box-sizing: border-box;
                }

                .kk-learning-heading {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 15px;
                    margin: 0 0 25px;
                }

                .kk-learning-heading h1 {
                    margin: 0;
                    color: var(--kk-text);
                    font-size: clamp(27px, 3vw, 36px);
                    font-weight: 800;
                    letter-spacing: -0.8px;
                }

                .kk-learning-count {
                    padding: 10px 17px;
                    border-radius: 25px;
                    background: #edf2e5;
                    color: var(--kk-green);
                    font-size: 14px;
                    font-weight: 800;
                }

                .kk-learning-tabs {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 11px;
                    margin: 0 0 28px;
                }

                .kk-learning-tab {
                    min-height: 43px;
                    padding: 10px 20px;
                    border: 1.5px solid #cbd9bf;
                    border-radius: 28px;
                    background: var(--kk-card);
                    color: #405538;
                    font: inherit;
                    font-size: 14px;
                    font-weight: 750;
                    cursor: pointer;
                    transition: background .18s ease,
                        color .18s ease, border-color .18s ease;
                }

                .kk-learning-tab:hover {
                    background: #edf2e5;
                }

                .kk-learning-tab.active {
                    border-color: var(--kk-green);
                    background: var(--kk-green);
                    color: #fff;
                }

                .kk-learning-panel {
                    padding: clamp(18px, 2.5vw, 30px);
                    border: 1px solid var(--kk-border);
                    border-radius: 18px;
                    background: var(--kk-card);
                    box-shadow: 0 7px 25px rgba(38, 53, 34, .045);
                }

                .kk-learning-section-title {
                    margin: 0 0 20px;
                    color: var(--kk-text);
                    font-size: 22px;
                    font-weight: 800;
                }

                .kk-learning-stats {
                    display: grid;
                    grid-template-columns: repeat(5, minmax(0, 1fr));
                    gap: 14px;
                    margin-bottom: 25px;
                }

                .kk-learning-stat {
                    min-width: 0;
                    padding: 20px;
                    border: 1px solid #e1e7d8;
                    border-radius: 14px;
                    background: #f0f3e9;
                }

                .kk-learning-stat span {
                    display: block;
                    color: #67715f;
                    font-size: 12px;
                    font-weight: 700;
                    line-height: 1.5;
                }

                .kk-learning-stat strong {
                    display: block;
                    margin-top: 8px;
                    color: var(--kk-green-dark);
                    font-size: clamp(22px, 2.2vw, 30px);
                    font-weight: 800;
                    overflow-wrap: anywhere;
                }

                .kk-learning-grid {
                    display: grid;
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                    gap: 20px;
                }

                .kk-learning-card {
                    min-width: 0;
                    overflow: hidden;
                    border: 1px solid #e1e5d8;
                    border-radius: 16px;
                    background: var(--kk-card);
                    box-shadow: 0 5px 16px rgba(38, 53, 34, .06);
                }

                .kk-learning-media {
                    position: relative;
                    display: grid;
                    place-items: center;
                    width: 100%;
                    aspect-ratio: 16 / 9;
                    overflow: hidden;
                    background: var(--kk-green-light);
                    color: var(--kk-green-dark);
                }

                .kk-learning-media > img,
                .kk-learning-media > iframe,
                .kk-learning-media > video {
                    display: block;
                    width: 100%;
                    height: 100%;
                    border: 0;
                    object-fit: cover;
                    background: var(--kk-green-light);
                }

                .kk-learning-media > iframe {
                    position: absolute;
                    inset: 0;
                }

                .kk-media-placeholder {
                    padding: 20px;
                    text-align: center;
                }

                .kk-media-placeholder > span {
                    font-size: 35px;
                }

                .kk-media-placeholder > p {
                    margin: 9px 0 0;
                    font-size: 12px;
                    font-weight: 700;
                }

                .kk-video-link {
                    position: absolute;
                    right: 10px;
                    bottom: 10px;
                    z-index: 2;
                    padding: 7px 10px;
                    border-radius: 7px;
                    background: rgba(38, 53, 34, .9);
                    color: white;
                    font-size: 11px;
                    font-weight: 750;
                    text-decoration: none;
                }

                .kk-learning-card-body {
                    padding: 18px;
                }

                .kk-learning-card h3 {
                    margin: 0 0 9px;
                    color: var(--kk-text);
                    font-size: 17px;
                    font-weight: 800;
                    line-height: 1.4;
                    overflow-wrap: anywhere;
                }

                .kk-learning-description {
                    min-height: 40px;
                    margin: 0 0 15px;
                    color: var(--kk-muted);
                    font-size: 13px;
                    line-height: 1.6;
                }

                .kk-learning-meta {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 10px;
                    margin: 12px 0;
                    color: var(--kk-text);
                    font-size: 13px;
                    font-weight: 750;
                }

                .kk-learning-progress-track {
                    height: 8px;
                    margin: 15px 0 8px;
                    overflow: hidden;
                    border-radius: 20px;
                    background: #e4eadb;
                }

                .kk-learning-progress-fill {
                    height: 100%;
                    border-radius: inherit;
                    background: var(--kk-green);
                    transition: width .25s ease;
                }

                .kk-learning-progress-label {
                    margin: 0;
                    color: var(--kk-muted);
                    font-size: 12px;
                    font-weight: 650;
                }

                .kk-learning-button {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    min-height: 43px;
                    margin-top: 11px;
                    padding: 11px 14px;
                    border: 1px solid var(--kk-green);
                    border-radius: 9px;
                    background: var(--kk-green);
                    color: white;
                    font: inherit;
                    font-size: 13px;
                    font-weight: 800;
                    cursor: pointer;
                    transition: background .18s ease;
                }

                .kk-learning-button:hover {
                    background: var(--kk-green-dark);
                }

                .kk-learning-button.secondary {
                    border-color: #cbd9bf;
                    background: #fffdf7;
                    color: var(--kk-green-dark);
                }

                .kk-learning-button.secondary:hover {
                    background: #edf2e5;
                }

                .kk-learning-button:disabled {
                    opacity: .55;
                    cursor: not-allowed;
                }

                .kk-learning-empty {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    min-height: 160px;
                    padding: 28px;
                    border: 1.5px dashed #cfdbc4;
                    border-radius: 14px;
                    background: #f8faf5;
                    color: #737d6b;
                    text-align: center;
                    font-size: 14px;
                    line-height: 1.7;
                }

                .kk-learning-error {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    margin-bottom: 18px;
                    padding: 15px;
                    border: 1px solid #e8c9c2;
                    border-radius: 10px;
                    background: #fff4f0;
                    color: #963b2d;
                    font-size: 13px;
                    line-height: 1.6;
                }

                .kk-learning-notice {
                    margin: 0 0 18px;
                    padding: 13px 15px;
                    border: 1px solid #d7e3cd;
                    border-radius: 9px;
                    background: #f0f5e9;
                    color: #496438;
                    font-size: 13px;
                }

                @media (max-width: 1150px) {
                    .kk-learning-stats {
                        grid-template-columns: repeat(3, minmax(0, 1fr));
                    }

                    .kk-learning-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                    }
                }

                @media (max-width: 680px) {
                    .kk-learning-stats,
                    .kk-learning-grid {
                        grid-template-columns: 1fr;
                    }

                    .kk-learning-page {
                        padding: 22px 14px 40px;
                    }

                    .kk-learning-tab {
                        padding: 9px 13px;
                        font-size: 12px;
                    }
                }
            `}</style>

            <header className="kk-learning-heading">
                <h1>My Learning</h1>

                <span className="kk-learning-count">
                    {activeTab === "courses"
                        ? `${courses.length} ${courses.length === 1 ? "course" : "courses"}`
                        : activeTab === "wishlist"
                          ? `${wishlist.length} saved`
                          : activeTab === "certificates"
                            ? `${certificates.length} certificates`
                            : activeTab === "progress"
                              ? "Learning progress"
                              : `${purchases.length} orders`}
                </span>
            </header>

            <nav
                className="kk-learning-tabs"
                aria-label="My Learning sections"
            >
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        className={
                            activeTab === tab.id
                                ? "kk-learning-tab active"
                                : "kk-learning-tab"
                        }
                        aria-pressed={activeTab === tab.id}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>

            {error && (
                <div className="kk-learning-error" role="alert">
                    {error}

                    <button
                        className="kk-learning-button"
                        type="button"
                        onClick={() =>
                            setRefreshKey((value) => value + 1)
                        }
                    >
                        Try Again
                    </button>
                </div>
            )}

            {notice && (
                <div className="kk-learning-notice" role="status">
                    {notice}
                </div>
            )}

            {loading ? (
                <div className="kk-learning-empty">
                    Loading{" "}
                    {TABS.find((tab) => tab.id === activeTab)?.label}...
                </div>
            ) : (
                <>
                    {/* MY COURSES */}
                    {activeTab === "courses" && (
                        <section className="kk-learning-panel">
                            {courses.length === 0 ? (
                                <div className="kk-learning-empty">
                                    <strong>No courses yet</strong>
                                    <span>
                                        Explore courses to begin your learning journey.
                                    </span>

                                    <button
                                        type="button"
                                        className="kk-learning-button"
                                        onClick={() => navigate("/courses")}
                                    >
                                        Explore Courses
                                    </button>
                                </div>
                            ) : (
                                <div className="kk-learning-grid">
                                    {courses.map((item, index) => {
                                        const id = getCourseId(item);
                                        const percent = getProgress(item);

                                        return (
                                            <article
                                                className="kk-learning-card"
                                                key={id || index}
                                            >
                                                <CourseMedia item={item} />

                                                <div className="kk-learning-card-body">
                                                    <h3>{getTitle(item)}</h3>

                                                    <p className="kk-learning-description">
                                                        {getDescription(item) ||
                                                            "Continue learning and build your skills."}
                                                    </p>

                                                    {percent !== null && (
                                                        <>
                                                            <div className="kk-learning-progress-track">
                                                                <div
                                                                    className="kk-learning-progress-fill"
                                                                    style={{
                                                                        width: `${percent}%`,
                                                                    }}
                                                                />
                                                            </div>

                                                            <p className="kk-learning-progress-label">
                                                                {percent}% complete
                                                            </p>
                                                        </>
                                                    )}

                                                    <button
                                                        type="button"
                                                        className="kk-learning-button"
                                                        disabled={!id}
                                                        onClick={() =>
                                                            navigate(`/courses/${id}`)
                                                        }
                                                    >
                                                        Start Learning
                                                    </button>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    )}

                    {/* PROGRESS */}
                    {activeTab === "progress" && (
                        <section className="kk-learning-panel">
                            {progress === null ? (
                                <div className="kk-learning-empty">
                                    No progress analytics available.
                                </div>
                            ) : (
                                <>
                                    <div className="kk-learning-stats">
                                        {progressStats.map((stat) => {
                                            const value = getMetric(
                                                progress,
                                                stat.aliases
                                            );

                                            let display = "—";

                                            if (value !== null) {
                                                display =
                                                    stat.label === "Last Activity"
                                                        ? formatDate(value)
                                                        : String(value);

                                                if (
                                                    stat.label === "Avg Progress" &&
                                                    !display.includes("%")
                                                ) {
                                                    display += "%";
                                                }
                                            }

                                            return (
                                                <article
                                                    className="kk-learning-stat"
                                                    key={stat.label}
                                                >
                                                    <span>{stat.label}</span>
                                                    <strong>{display}</strong>
                                                </article>
                                            );
                                        })}
                                    </div>

                                    <h2 className="kk-learning-section-title">
                                        Course Progress
                                    </h2>

                                    {progressCourses.length === 0 ? (
                                        <div className="kk-learning-empty">
                                            No per-course progress data was returned.
                                        </div>
                                    ) : (
                                        <div className="kk-learning-grid">
                                            {progressCourses.map((item, index) => {
                                                const percent = getProgress(item);

                                                return (
                                                    <article
                                                        className="kk-learning-card"
                                                        key={getCourseId(item) || index}
                                                    >
                                                        <CourseMedia item={item} />

                                                        <div className="kk-learning-card-body">
                                                            <h3>{getTitle(item)}</h3>

                                                            {percent !== null ? (
                                                                <>
                                                                    <div className="kk-learning-progress-track">
                                                                        <div
                                                                            className="kk-learning-progress-fill"
                                                                            style={{
                                                                                width: `${percent}%`,
                                                                            }}
                                                                        />
                                                                    </div>

                                                                    <p className="kk-learning-progress-label">
                                                                        {percent}% complete
                                                                    </p>
                                                                </>
                                                            ) : (
                                                                <p className="kk-learning-description">
                                                                    Progress is not provided for this course.
                                                                </p>
                                                            )}
                                                        </div>
                                                    </article>
                                                );
                                            })}
                                        </div>
                                    )}
                                </>
                            )}
                        </section>
                    )}

                    {/* CERTIFICATES */}
                    {activeTab === "certificates" && (
                        <section className="kk-learning-panel">
                            {certificates.length === 0 ? (
                                <div className="kk-learning-empty">
                                    <strong>No certificates yet</strong>
                                    <span>
                                        Certificates will appear here when available.
                                    </span>
                                </div>
                            ) : (
                                <div className="kk-learning-grid">
                                    {certificates.map((certificate, index) => {
                                        const id = getCertificateId(certificate);

                                        return (
                                            <article
                                                className="kk-learning-card"
                                                key={id || index}
                                            >
                                                <div className="kk-learning-card-body">
                                                    <h3>
                                                        {certificate.courseName ||
                                                            certificate.course?.name ||
                                                            certificate.title ||
                                                            "Course Certificate"}
                                                    </h3>

                                                    <p className="kk-learning-description">
                                                        Issued:{" "}
                                                        {formatDate(
                                                            certificate.issuedAt ||
                                                            certificate.createdAt
                                                        )}
                                                    </p>

                                                    <button
                                                        type="button"
                                                        className="kk-learning-button"
                                                        disabled={
                                                            !id || downloadId === id
                                                        }
                                                        onClick={() =>
                                                            handleDownload(certificate)
                                                        }
                                                    >
                                                        {downloadId === id
                                                            ? "Downloading..."
                                                            : "Download Certificate"}
                                                    </button>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    )}

                    {/* PURCHASES */}
                    {activeTab === "purchases" && (
                        <section className="kk-learning-panel">
                            {purchases.length === 0 ? (
                                <div className="kk-learning-empty">
                                    <strong>No purchases yet</strong>
                                    <span>
                                        Your purchase history will appear here.
                                    </span>

                                    <button
                                        type="button"
                                        className="kk-learning-button"
                                        onClick={() => navigate("/courses")}
                                    >
                                        Explore Courses
                                    </button>
                                </div>
                            ) : (
                                <div className="kk-learning-grid">
                                    {purchases.map((purchase, index) => {
                                        const id =
                                            purchase._id ??
                                            purchase.id ??
                                            purchase.orderId ??
                                            index;

                                        const orderItems =
                                            purchase.items ??
                                            purchase.courses ??
                                            purchase.orderItems ??
                                            [];

                                        const amount =
                                            purchase.totalAmount ??
                                            purchase.totalPrice ??
                                            purchase.amount ??
                                            purchase.total ??
                                            null;

                                        const status =
                                            purchase.status ??
                                            purchase.paymentStatus ??
                                            purchase.orderStatus ??
                                            "Status unavailable";

                                        return (
                                            <article
                                                className="kk-learning-card"
                                                key={id}
                                            >
                                                <div className="kk-learning-card-body">
                                                    <h3>
                                                        Order #{String(id)}
                                                    </h3>

                                                    <p className="kk-learning-description">
                                                        Date:{" "}
                                                        {formatDate(
                                                            purchase.createdAt ??
                                                            purchase.purchaseDate ??
                                                            purchase.date
                                                        )}
                                                    </p>

                                                    <div className="kk-learning-meta">
                                                        <span>
                                                            {formatMoney(amount)}
                                                        </span>
                                                        <span>{String(status)}</span>
                                                    </div>

                                                    {Array.isArray(orderItems) &&
                                                        orderItems.map(
                                                            (entry, itemIndex) => {
                                                                const course =
                                                                    entry?.course ??
                                                                    entry?.courseDetails ??
                                                                    entry;

                                                                return (
                                                                    <p key={itemIndex}>
                                                                        {course?.name ??
                                                                            course?.title ??
                                                                            entry?.courseName ??
                                                                            "Purchased item"}
                                                                    </p>
                                                                );
                                                            }
                                                        )}
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    )}

                    {/* WISHLIST */}
                    {activeTab === "wishlist" && (
                        <section className="kk-learning-panel">
                            {wishlist.length === 0 ? (
                                <div className="kk-learning-empty">
                                    <strong>Your wishlist is empty</strong>
                                    <span>
                                        Save courses from the marketplace to find them here.
                                    </span>

                                    <button
                                        type="button"
                                        className="kk-learning-button"
                                        onClick={() => navigate("/courses")}
                                    >
                                        Explore Courses
                                    </button>
                                </div>
                            ) : (
                                <div className="kk-learning-grid">
                                    {wishlist.map((item, index) => {
                                        const id = getCourseId(item);
                                        const price = getPrice(item);
                                        const rating = getRating(item);

                                        return (
                                            <article
                                                className="kk-learning-card"
                                                key={id || index}
                                            >
                                                <CourseMedia item={item} />

                                                <div className="kk-learning-card-body">
                                                    <h3>{getTitle(item)}</h3>

                                                    <p className="kk-learning-description">
                                                        {getDescription(item) ||
                                                            "Explore this course to learn more."}
                                                    </p>

                                                    <div className="kk-learning-meta">
                                                        <span>
                                                            {formatMoney(price)}
                                                        </span>
                                                        <span>
                                                            ⭐ {rating ?? "—"}
                                                        </span>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        className="kk-learning-button"
                                                        disabled={!id}
                                                        onClick={() =>
                                                            navigate(`/courses/${id}`)
                                                        }
                                                    >
                                                        View Course
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="kk-learning-button secondary"
                                                        disabled={
                                                            !id || removingId === id
                                                        }
                                                        onClick={() =>
                                                            handleRemoveWishlist(item)
                                                        }
                                                    >
                                                        {removingId === id
                                                            ? "Removing..."
                                                            : "Remove from Wishlist"}
                                                    </button>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    )}
                </>
            )}
        </main>
    );
}
