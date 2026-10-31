
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyLearning } from "../api/lms";
import useAuth from "../hooks/useAuth";
import "./Dashboard.css";

function getCollection(payload, depth = 0) {
    if (Array.isArray(payload)) return payload;

    if (!payload || typeof payload !== "object" || depth > 5) {
        return [];
    }

    for (const key of [
        "courses",
        "myLearning",
        "enrollments",
        "items",
        "results",
    ]) {
        if (Array.isArray(payload[key])) {
            return payload[key];
        }
    }

    for (const key of ["data", "result", "learning", "payload"]) {
        const found = getCollection(payload[key], depth + 1);

        if (found.length) {
            return found;
        }
    }

    return [];
}

function normalizeCourse(item, index) {
    const course =
        item?.course ??
        item?.courseDetails ??
        item?.courseInfo ??
        item;

    const rawProgress =
        item?.progressPercentage ??
        item?.completionPercentage ??
        item?.progress?.percentage ??
        item?.progress?.percent ??
        (typeof item?.progress === "number" ||
        typeof item?.progress === "string"
            ? item.progress
            : undefined) ??
        course?.progressPercentage ??
        course?.completionPercentage ??
        0;

    const progress = Number.parseFloat(
        String(rawProgress).replace("%", "")
    );

    const status = String(
        item?.status ?? item?.enrollmentStatus ?? ""
    ).toLowerCase();

    const completed =
        item?.completed === true ||
        course?.completed === true ||
        status === "completed" ||
        (Number.isFinite(progress) && progress >= 100);

    const title =
        course?.name ??
        course?.title ??
        item?.courseName ??
        item?.title ??
        "Your learning course";

    const image =
        course?.thumbnailUrl ||
        course?.thumbnail?.url ||
        course?.thumbnail ||
        course?.imageUrl ||
        course?.image ||
        "";

    return {
        id:
            course?._id ??
            course?.id ??
            item?.courseId?._id ??
            item?.courseId ??
            item?._id ??
            item?.id ??
            `learning-${index}`,
        title,
        description:
            course?.description ||
            "Continue building your skills one lesson at a time.",
        image: typeof image === "string" ? image : "",
        progress: completed
            ? 100
            : Number.isFinite(progress)
              ? Math.min(100, Math.max(0, progress))
              : 0,
        completed,
        icon: title.toLowerCase().includes("react")
            ? "⚛️"
            : title.toLowerCase().includes("python")
              ? "🐍"
              : title.toLowerCase().includes("sql")
                ? "🗃️"
                : title.toLowerCase().includes("java")
                  ? "☕"
                  : "📚",
    };
}

export default function Dashboard() {
    const { user } = useAuth();

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let cancelled = false;

        async function loadLearning() {
            setLoading(true);
            setError("");

            try {
                const response = await getMyLearning();

                if (cancelled) return;

                const items = getCollection(response);
                setCourses(items.map(normalizeCourse));
            } catch (err) {
                if (cancelled) return;

                console.error(
                    "Unable to load learning dashboard:",
                    err.response?.data || err.message
                );

                setError(
                    err.response?.data?.message ||
                    "Your learning data could not be loaded right now."
                );
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadLearning();

        return () => {
            cancelled = true;
        };
    }, [reloadKey]);

    const completedCourses = courses.filter(
        (course) => course.completed
    ).length;

    const inProgressCourses = courses.filter(
        (course) => !course.completed
    ).length;

    const averageProgress = courses.length
        ? Math.round(
              courses.reduce(
                  (total, course) => total + course.progress,
                  0
              ) / courses.length
          )
        : 0;

    const displayName =
        user?.name?.trim()?.split(/\s+/)[0] ||
        user?.fullName?.trim()?.split(/\s+/)[0] ||
        "Learner";

    return (
        <main className="student-dashboard">
            <style>{`
                .student-dashboard {
                    --sd-ink: #283526;
                    --sd-green: #628141;
                    --sd-green-dark: #405637;
                    --sd-muted: #778071;
                    --sd-border: #e1e7d8;
                    --sd-cream: #f7f6ef;

                    min-height: calc(100vh - 82px);
                    padding: 34px clamp(18px, 4vw, 58px) 60px;
                    background: var(--sd-cream);
                    color: var(--sd-ink);
                    font-family: Inter, -apple-system, BlinkMacSystemFont,
                        "Segoe UI", sans-serif;
                    box-sizing: border-box;
                }

                .student-dashboard *,
                .student-dashboard *::before,
                .student-dashboard *::after {
                    box-sizing: border-box;
                }

                .sd-container {
                    max-width: 1500px;
                    margin: 0 auto;
                }

                .sd-topline {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 16px;
                    margin-bottom: 24px;
                }

                .sd-breadcrumb {
                    margin: 0;
                    color: var(--sd-green);
                    font-size: 12px;
                    font-weight: 800;
                    letter-spacing: 1.8px;
                }

                .sd-date {
                    color: #737c6c;
                    font-size: 13px;
                    font-weight: 600;
                }

                .sd-welcome {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 30px;
                    min-height: 245px;
                    margin-bottom: 28px;
                    padding: clamp(26px, 4vw, 46px);
                    overflow: hidden;

                    border: 1px solid #d8e3cd;
                    border-radius: 22px;
                    background: linear-gradient(
                        115deg,
                        #e8efdf 0%,
                        #edf2e5 65%,
                        #f3f1df 100%
                    );
                }

                .sd-welcome::after {
                    position: absolute;
                    top: -100px;
                    right: 80px;
                    width: 290px;
                    height: 290px;
                    content: "";
                    border: 1px solid rgba(98, 129, 65, 0.12);
                    border-radius: 50%;
                    box-shadow:
                        0 0 0 30px rgba(98, 129, 65, 0.035),
                        0 0 0 65px rgba(98, 129, 65, 0.025);
                    pointer-events: none;
                }

                .sd-welcome-copy {
                    position: relative;
                    z-index: 1;
                    max-width: 720px;
                }

                .sd-welcome-tag {
                    margin: 0 0 15px;
                    color: var(--sd-green);
                    font-size: 12px;
                    font-weight: 850;
                    letter-spacing: 2px;
                }

                .sd-welcome h1 {
                    margin: 0;
                    font-size: clamp(30px, 3.2vw, 45px);
                    font-weight: 800;
                    letter-spacing: -1.5px;
                    line-height: 1.15;
                }

                .sd-welcome-description {
                    max-width: 620px;
                    margin: 14px 0 24px;
                    color: #687263;
                    font-size: 16px;
                    line-height: 1.75;
                }

                .sd-button {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    min-height: 46px;
                    padding: 12px 19px;
                    border: 1px solid transparent;
                    border-radius: 10px;
                    background: var(--sd-green);
                    color: #fff;
                    font: inherit;
                    font-size: 14px;
                    font-weight: 750;
                    text-decoration: none;
                    cursor: pointer;
                    transition:
                        transform 0.2s ease,
                        background 0.2s ease,
                        box-shadow 0.2s ease;
                }

                .sd-button:hover {
                    background: var(--sd-green-dark);
                    transform: translateY(-2px);
                }

                .sd-welcome-art {
                    position: relative;
                    z-index: 1;
                    display: grid;
                    flex: 0 0 180px;
                    place-items: center;
                    width: 180px;
                    height: 180px;
                    border: 1px solid rgba(255,255,255,0.8);
                    border-radius: 32px;
                    background: rgba(255,255,255,0.65);
                    box-shadow: 0 14px 35px rgba(48,69,43,0.07);
                    font-size: 76px;
                    transform: rotate(4deg);
                }

                .sd-welcome-sparkle {
                    position: absolute;
                    top: 19px;
                    right: 22px;
                    font-size: 24px;
                }

                .sd-section-heading {
                    display: flex;
                    align-items: flex-end;
                    justify-content: space-between;
                    gap: 16px;
                    margin: 34px 0 18px;
                }

                .sd-section-heading h2 {
                    margin: 0;
                    font-size: 24px;
                    font-weight: 800;
                    letter-spacing: -0.6px;
                }

                .sd-section-heading p {
                    margin: 6px 0 0;
                    color: var(--sd-muted);
                    font-size: 13px;
                    line-height: 1.6;
                }

                .sd-refresh {
                    padding: 9px 13px;
                    border: 1px solid #d9e2d1;
                    border-radius: 9px;
                    background: #fff;
                    color: var(--sd-green-dark);
                    font: inherit;
                    font-size: 12px;
                    font-weight: 700;
                    cursor: pointer;
                }

                .sd-refresh:hover {
                    background: #edf3e7;
                }

                .sd-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, minmax(0, 1fr));
                    gap: 17px;
                }

                .sd-stat-card {
                    min-width: 0;
                    padding: 22px;
                    border: 1px solid var(--sd-border);
                    border-radius: 17px;
                    background: #fff;
                    box-shadow: 0 5px 18px rgba(40,53,38,0.025);
                }

                .sd-stat-top {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 10px;
                }

                .sd-stat-icon {
                    display: grid;
                    place-items: center;
                    width: 43px;
                    height: 43px;
                    border-radius: 13px;
                    background: #edf3e7;
                    font-size: 21px;
                }

                .sd-stat-caption {
                    margin: 18px 0 4px;
                    color: #747d6d;
                    font-size: 13px;
                    font-weight: 650;
                }

                .sd-stat-value {
                    margin: 0;
                    color: var(--sd-ink);
                    font-size: 34px;
                    font-weight: 800;
                    letter-spacing: -1px;
                }

                .sd-stat-note {
                    margin: 5px 0 0;
                    color: #91998b;
                    font-size: 11px;
                }

                .sd-content-grid {
                    display: grid;
                    grid-template-columns: minmax(0, 1.6fr) minmax(280px, 0.9fr);
                    align-items: start;
                    gap: 22px;
                    margin-top: 34px;
                }

                .sd-panel {
                    min-width: 0;
                    padding: 25px;
                    border: 1px solid var(--sd-border);
                    border-radius: 18px;
                    background: #fff;
                    box-shadow: 0 5px 18px rgba(40,53,38,0.025);
                }

                .sd-panel-heading {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 15px;
                    margin-bottom: 22px;
                }

                .sd-panel-heading h2 {
                    margin: 0;
                    font-size: 21px;
                    font-weight: 800;
                    letter-spacing: -0.5px;
                }

                .sd-panel-heading p {
                    margin: 7px 0 0;
                    color: var(--sd-muted);
                    font-size: 12px;
                    line-height: 1.6;
                }

                .sd-course-list {
                    display: grid;
                    gap: 15px;
                }

                .sd-course-item {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    min-width: 0;
                    padding: 14px;
                    border: 1px solid #e9ede3;
                    border-radius: 14px;
                    background: #fcfcf9;
                }

                .sd-course-art {
                    display: grid;
                    flex: 0 0 62px;
                    place-items: center;
                    width: 62px;
                    height: 62px;
                    overflow: hidden;
                    border-radius: 12px;
                    background: #edf3e7;
                    font-size: 27px;
                }

                .sd-course-art img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .sd-course-details {
                    flex: 1;
                    min-width: 0;
                }

                .sd-course-details h3 {
                    margin: 0 0 7px;
                    overflow-wrap: anywhere;
                    font-size: 15px;
                    font-weight: 750;
                    line-height: 1.4;
                }

                .sd-course-details p {
                    margin: 0;
                    color: var(--sd-muted);
                    font-size: 12px;
                }

                .sd-progress-track {
                    height: 6px;
                    margin-top: 12px;
                    overflow: hidden;
                    border-radius: 10px;
                    background: #e9eee4;
                }

                .sd-progress-fill {
                    height: 100%;
                    border-radius: inherit;
                    background: linear-gradient(90deg, #628141, #9cba7e);
                }

                .sd-progress-text {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 8px;
                    margin-top: 6px;
                    color: #78816f;
                    font-size: 10px;
                }

                .sd-course-open {
                    flex-shrink: 0;
                    padding: 9px 12px;
                    border: 1px solid #d9e4d0;
                    border-radius: 8px;
                    background: #f2f6ed;
                    color: #49643b;
                    font: inherit;
                    font-size: 12px;
                    font-weight: 750;
                    text-decoration: none;
                }

                .sd-course-open:hover {
                    background: #e6efdd;
                }

                .sd-empty {
                    padding: 30px 18px;
                    border: 1px dashed #d7e1ce;
                    border-radius: 13px;
                    background: #fafbf8;
                    text-align: center;
                }

                .sd-empty-icon {
                    margin-bottom: 10px;
                    font-size: 36px;
                }

                .sd-empty h3 {
                    margin: 0 0 8px;
                    font-size: 17px;
                }

                .sd-empty p {
                    max-width: 340px;
                    margin: 0 auto 16px;
                    color: var(--sd-muted);
                    font-size: 13px;
                    line-height: 1.7;
                }

                .sd-error {
                    margin-bottom: 15px;
                    padding: 12px 14px;
                    border: 1px solid #ecd8c8;
                    border-radius: 10px;
                    background: #fff7ef;
                    color: #875a34;
                    font-size: 13px;
                    line-height: 1.6;
                }

                .sd-actions {
                    display: grid;
                    gap: 12px;
                }

                .sd-action {
                    display: flex;
                    align-items: center;
                    gap: 13px;
                    padding: 15px;
                    border: 1px solid #e5eadd;
                    border-radius: 13px;
                    background: #fff;
                    color: var(--sd-ink);
                    text-decoration: none;
                    transition: background 0.2s ease,
                        border-color 0.2s ease,
                        transform 0.2s ease;
                }

                .sd-action:hover {
                    background: #f6f9f2;
                    border-color: #c9d9bc;
                    transform: translateY(-2px);
                }

                .sd-action-icon {
                    display: grid;
                    flex: 0 0 43px;
                    place-items: center;
                    width: 43px;
                    height: 43px;
                    border-radius: 12px;
                    background: #edf3e7;
                    font-size: 21px;
                }

                .sd-action-copy {
                    flex: 1;
                    min-width: 0;
                }

                .sd-action-copy strong {
                    display: block;
                    margin-bottom: 4px;
                    font-size: 13px;
                    font-weight: 750;
                }

                .sd-action-copy span {
                    display: block;
                    color: var(--sd-muted);
                    font-size: 11px;
                    line-height: 1.5;
                }

                .sd-action-arrow {
                    color: var(--sd-green);
                    font-size: 20px;
                }

                .sd-loading {
                    padding: 25px;
                    border-radius: 12px;
                    background: #fafbf8;
                    color: var(--sd-muted);
                    text-align: center;
                    font-size: 13px;
                }

                @media (max-width: 1100px) {
                    .sd-stats-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                    }

                    .sd-content-grid {
                        grid-template-columns: 1fr;
                    }

                    .sd-welcome-art {
                        flex-basis: 140px;
                        width: 140px;
                        height: 140px;
                        font-size: 60px;
                    }
                }

                @media (max-width: 650px) {
                    .student-dashboard {
                        padding: 22px 15px 38px;
                    }

                    .sd-topline {
                        align-items: flex-start;
                        flex-direction: column;
                        gap: 8px;
                    }

                    .sd-welcome {
                        align-items: flex-start;
                        flex-direction: column;
                        gap: 22px;
                        padding: 25px 21px;
                    }

                    .sd-welcome-art {
                        position: absolute;
                        right: 12px;
                        bottom: 13px;
                        width: 90px;
                        height: 90px;
                        font-size: 42px;
                        opacity: 0.65;
                    }

                    .sd-welcome-description {
                        max-width: 100%;
                        padding-right: 0;
                        font-size: 14px;
                    }

                    .sd-welcome h1 {
                        font-size: 32px;
                    }

                    .sd-stats-grid {
                        gap: 11px;
                    }

                    .sd-stat-card {
                        padding: 15px;
                    }

                    .sd-stat-value {
                        font-size: 29px;
                    }

                    .sd-stat-icon {
                        width: 37px;
                        height: 37px;
                        font-size: 18px;
                    }

                    .sd-panel {
                        padding: 17px;
                    }

                    .sd-course-item {
                        align-items: flex-start;
                        flex-wrap: wrap;
                        padding: 12px;
                    }

                    .sd-course-details {
                        flex-basis: calc(100% - 80px);
                    }

                    .sd-course-open {
                        margin-left: 77px;
                    }
                }
            `}</style>

            <div className="sd-container">
                {/* Dashboard heading */}
                <div className="sd-topline">
                    <p className="sd-breadcrumb">
                        KITABIKEEDA / STUDENT SPACE
                    </p>

                    <span className="sd-date">
                        📅 {new Date().toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                        })}
                    </span>
                </div>

                {/* Welcome banner */}
                <section className="sd-welcome">
                    <div className="sd-welcome-copy">
                        <p className="sd-welcome-tag">
                            YOUR LEARNING JOURNEY 🌱
                        </p>

                        <h1>Welcome back, {displayName}!</h1>

                        <p className="sd-welcome-description">
                            Every lesson is progress. Keep exploring,
                            build your skills, and take your next step
                            with KitabiKeeda.
                        </p>

                        <Link to="/courses" className="sd-button">
                            Explore Courses <span>→</span>
                        </Link>
                    </div>

                    <div className="sd-welcome-art" aria-hidden="true">
                        <span className="sd-welcome-sparkle">✦</span>
                        📚
                    </div>
                </section>

                {/* Learning statistics */}
                <section>
                    <div className="sd-section-heading">
                        <div>
                            <h2>Your Learning Overview</h2>
                            <p>A quick look at your learning journey.</p>
                        </div>

                        <button
                            type="button"
                            className="sd-refresh"
                            onClick={() => setReloadKey((key) => key + 1)}
                            disabled={loading}
                        >
                            {loading ? "Loading..." : "↻ Refresh"}
                        </button>
                    </div>

                    {error && (
                        <div className="sd-error">
                            {error} Statistics may be incomplete until the
                            learning service is available.
                        </div>
                    )}

                    <div className="sd-stats-grid">
                        <article className="sd-stat-card">
                            <div className="sd-stat-top">
                                <span className="sd-stat-caption">
                                    Enrolled Courses
                                </span>
                                <span className="sd-stat-icon">📚</span>
                            </div>

                            <p className="sd-stat-value">
                                {loading ? "—" : courses.length}
                            </p>

                            <p className="sd-stat-note">
                                Your learning library
                            </p>
                        </article>

                        <article className="sd-stat-card">
                            <div className="sd-stat-top">
                                <span className="sd-stat-caption">
                                    In Progress
                                </span>
                                <span className="sd-stat-icon">🚀</span>
                            </div>

                            <p className="sd-stat-value">
                                {loading ? "—" : inProgressCourses}
                            </p>

                            <p className="sd-stat-note">
                                Courses to keep working on
                            </p>
                        </article>

                        <article className="sd-stat-card">
                            <div className="sd-stat-top">
                                <span className="sd-stat-caption">
                                    Completed
                                </span>
                                <span className="sd-stat-icon">🏆</span>
                            </div>

                            <p className="sd-stat-value">
                                {loading ? "—" : completedCourses}
                            </p>

                            <p className="sd-stat-note">
                                Finished learning courses
                            </p>
                        </article>

                        <article className="sd-stat-card">
                            <div className="sd-stat-top">
                                <span className="sd-stat-caption">
                                    Average Progress
                                </span>
                                <span className="sd-stat-icon">🎯</span>
                            </div>

                            <p className="sd-stat-value">
                                {loading ? "—" : `${averageProgress}%`}
                            </p>

                            <p className="sd-stat-note">
                                Across enrolled courses
                            </p>
                        </article>
                    </div>
                </section>

                {/* My courses and quick actions */}
                <div className="sd-content-grid">
                    <section className="sd-panel">
                        <div className="sd-panel-heading">
                            <div>
                                <h2>My Courses</h2>
                                <p>
                                    Pick up your learning journey where you
                                    left off.
                                </p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="sd-loading">
                                Loading your learning data...
                            </div>
                        ) : courses.length === 0 ? (
                            <div className="sd-empty">
                                <div className="sd-empty-icon">🌱</div>
                                <h3>Your learning shelf is waiting</h3>
                                <p>
                                    Your enrolled courses will appear here
                                    when the learning service returns them.
                                    Start exploring to find your next skill.
                                </p>

                                <Link to="/courses" className="sd-button">
                                    Browse Courses →
                                </Link>
                            </div>
                        ) : (
                            <div className="sd-course-list">
                                {courses.slice(0, 4).map((course, index) => (
                                    <article
                                        className="sd-course-item"
                                        key={`${course.id}-${index}`}
                                    >
                                        <div className="sd-course-art">
                                            {course.image ? (
                                                <img
                                                    src={course.image}
                                                    alt=""
                                                    onError={(event) => {
                                                        event.currentTarget.style.display =
                                                            "none";
                                                    }}
                                                />
                                            ) : (
                                                course.icon
                                            )}
                                        </div>

                                        <div className="sd-course-details">
                                            <h3>{course.title}</h3>

                                            <p>
                                                {course.completed
                                                    ? "Completed 🎉"
                                                    : "Keep up the momentum"}
                                            </p>

                                            <div
                                                className="sd-progress-track"
                                                role="progressbar"
                                                aria-label={`${course.title} progress`}
                                                aria-valuemin={0}
                                                aria-valuemax={100}
                                                aria-valuenow={course.progress}
                                            >
                                                <div
                                                    className="sd-progress-fill"
                                                    style={{
                                                        width: `${course.progress}%`,
                                                    }}
                                                />
                                            </div>

                                            <div className="sd-progress-text">
                                                <span>Course progress</span>
                                                <strong>
                                                    {course.progress}%
                                                </strong>
                                            </div>
                                        </div>

                                        <Link
                                            to={
                                                course.completed
                                                    ? "/courses"
                                                    : `/courses/${course.id}`
                                            }
                                            className="sd-course-open"
                                        >
                                            {course.completed
                                                ? "Explore more"
                                                : "Continue →"}
                                        </Link>
                                    </article>
                                ))}

                                {courses.length > 4 && (
                                    <Link
                                        to="/courses"
                                        className="sd-course-open"
                                        style={{
                                            display: "inline-flex",
                                            justifyContent: "center",
                                        }}
                                    >
                                        Browse more courses →
                                    </Link>
                                )}
                            </div>
                        )}
                    </section>

                    <aside className="sd-panel">
                        <div className="sd-panel-heading">
                            <div>
                                <h2>Quick Actions</h2>
                                <p>Everything you need, one click away.</p>
                            </div>
                        </div>

                        <div className="sd-actions">
                            <Link to="/courses" className="sd-action">
                                <span className="sd-action-icon">🔎</span>

                                <span className="sd-action-copy">
                                    <strong>Explore Courses</strong>
                                    <span>Find your next learning goal.</span>
                                </span>

                                <span className="sd-action-arrow">→</span>
                            </Link>

                            <Link to="/user/profile" className="sd-action">
                                <span className="sd-action-icon">👤</span>

                                <span className="sd-action-copy">
                                    <strong>My Profile</strong>
                                    <span>View and update your account.</span>
                                </span>

                                <span className="sd-action-arrow">→</span>
                            </Link>

                            <button
                                type="button"
                                className="sd-action"
                                style={{
                                    width: "100%",
                                    font: "inherit",
                                    textAlign: "left",
                                    cursor: "pointer",
                                }}
                                onClick={() => setReloadKey((key) => key + 1)}
                                disabled={loading}
                            >
                                <span className="sd-action-icon">📈</span>

                                <span className="sd-action-copy">
                                    <strong>Refresh Progress</strong>
                                    <span>
                                        Reload your latest learning data.
                                    </span>
                                </span>

                                <span className="sd-action-arrow">↻</span>
                            </button>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}
