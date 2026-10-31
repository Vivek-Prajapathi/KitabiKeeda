import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMyLearning } from "../api/lms";
import "./Home.css";

const PREVIEW_COURSES = [
    {
        id: "preview-react-tailwind",
        title: "React & Tailwind Basics",
        progress: 70,
        icon: "⚛️",
        lesson: "Lesson 8 · Responsive layouts",
        accent: "mint",
        preview: true,
    },
    {
        id: "preview-javascript",
        title: "JavaScript Fundamentals",
        progress: 42,
        icon: "🟨",
        lesson: "Lesson 5 · Array methods",
        accent: "butter",
        preview: true,
    },
    {
        id: "preview-sql",
        title: "SQL for Developers",
        progress: 25,
        icon: "🗃️",
        lesson: "Lesson 3 · Grouping data",
        accent: "lavender",
        preview: true,
    },
];

function getCollection(payload, depth = 0) {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== "object" || depth > 4) return [];

    for (const key of ["courses", "myLearning", "enrollments", "items", "results"]) {
        if (Array.isArray(payload[key])) return payload[key];
    }

    if (Array.isArray(payload.data)) return payload.data;

    for (const key of ["data", "result", "learning", "payload"]) {
        const found = getCollection(payload[key], depth + 1);
        if (found.length) return found;
    }

    return [];
}

function getProgress(item, course) {
    const raw =
        item?.progressPercentage ??
        item?.completionPercentage ??
        item?.progress?.percentage ??
        item?.progress?.percent ??
        (typeof item?.progress === "number" || typeof item?.progress === "string"
            ? item.progress
            : undefined) ??
        course?.progressPercentage ??
        course?.completionPercentage ??
        0;

    const parsed = Number.parseFloat(String(raw).replace("%", ""));
    return Number.isFinite(parsed) ? Math.min(100, Math.max(0, parsed)) : 0;
}

function getCourseIcon(title = "") {
    const value = title.toLowerCase();
    if (value.includes("react")) return "⚛️";
    if (value.includes("javascript") || value.includes("typescript")) return "🟨";
    if (value.includes("sql") || value.includes("database")) return "🗃️";
    if (value.includes("java")) return "☕";
    if (value.includes("python")) return "🐍";
    if (value.includes("node")) return "🟩";
    return "📘";
}

function normalizeLearningItem(item, index) {
    const course = item?.course ?? item?.courseDetails ?? item?.courseInfo ?? item;
    const courseId =
        course?._id ??
        course?.id ??
        (typeof item?.courseId === "string" ? item.courseId : item?.courseId?._id) ??
        item?._id ??
        item?.id;
    const title =
        course?.name ??
        course?.title ??
        item?.courseName ??
        item?.title ??
        "Your learning course";
    const progress = getProgress(item, course);

    return {
        id: courseId ? String(courseId) : `learning-${index}`,
        title,
        progress,
        icon: getCourseIcon(title),
        lesson:
            item?.nextLesson?.title ??
            item?.currentLesson?.title ??
            item?.lastLesson?.title ??
            "Pick up where you left off",
        accent: index % 3 === 0 ? "mint" : index % 3 === 1 ? "butter" : "lavender",
        preview: false,
    };
}

function ArrowIcon({ direction = "right" }) {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="kk-home-arrow-icon">
            {direction === "left" ? (
                <path d="M15 18 9 12l6-6" />
            ) : (
                <path d="m9 18 6-6-6-6" />
            )}
        </svg>
    );
}

export default function Home() {
    const navigate = useNavigate();
    const carouselRef = useRef(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [learningCourses, setLearningCourses] = useState([]);
    const [learningLoading, setLearningLoading] = useState(true);
    const [learningError, setLearningError] = useState(false);

    useEffect(() => {
        const token =
            localStorage.getItem("token") ||
            localStorage.getItem("TOKEN");
        const loggedIn = Boolean(token);
        setIsLoggedIn(loggedIn);

        if (!loggedIn) {
            setLearningLoading(false);
            return undefined;
        }

        let cancelled = false;

        getMyLearning()
            .then((response) => {
                if (cancelled) return;
                const items = getCollection(response);
                const normalized = items.map(normalizeLearningItem);
                setLearningCourses(normalized);
            })
            .catch((error) => {
                if (cancelled) return;
                console.warn(
                    "Unable to load continue-learning data:",
                    error?.response?.data || error?.message
                );
                setLearningError(true);
            })
            .finally(() => {
                if (!cancelled) setLearningLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const visibleCourses = useMemo(() => {
        if (learningCourses.length) return learningCourses;
        // Clearly labelled preview cards keep the home page designed even when
        // the account has no enrollments yet or the API doesn't return data.
        return isLoggedIn && !learningLoading ? PREVIEW_COURSES : [];
    }, [isLoggedIn, learningCourses, learningLoading]);

    const dashboardPath = isLoggedIn ? "/dashboard" : "/login";

    const scrollCarousel = (direction) => {
        if (!carouselRef.current) return;
        const amount = Math.max(280, Math.round(carouselRef.current.clientWidth * 0.78));
        carouselRef.current.scrollBy({
            left: direction * amount,
            behavior: "smooth",
        });
    };

    const resumeCourse = (course) => {
        if (course.preview || !course.id || String(course.id).startsWith("learning-")) {
            navigate("/courses");
            return;
        }
        navigate(`/courses/${course.id}`);
    };

    return (
        <main className="kk-home">
            <section className="kk-home-hero" aria-labelledby="kk-home-title">
                <div className="kk-home-hero-copy">
                    <div className="kk-home-eyebrow">
                        <span className="kk-home-eyebrow-dot" />
                        YOUR NEXT CHAPTER STARTS HERE
                    </div>

                    <h1 id="kk-home-title">
                        Learn something new.<br />
                        <span>Grow every day.</span>
                    </h1>

                    <p className="kk-home-subtitle">
                        Discover online courses, learn practical skills, and take the next step in your learning journey with KitabiKeeda.
                    </p>

                    <div className="kk-home-hero-actions">
                        <Link className="kk-home-button kk-home-button-primary" to="/courses">
                            Explore Courses <span aria-hidden="true">➔</span>
                        </Link>
                        <Link className="kk-home-button kk-home-button-secondary" to={dashboardPath}>
                            Go to Dashboard
                        </Link>
                    </div>

                    <div className="kk-home-social-proof" aria-label="Learning values">
                        <div className="kk-home-avatar-stack" aria-hidden="true">
                            <span>🧑🏽‍💻</span><span>👩🏻‍🎨</span><span>🧑🏼‍🎓</span>
                        </div>
                        <p><strong>Small steps. Big progress.</strong><span>Build a learning habit that lasts.</span></p>
                    </div>
                </div>

                <div className="kk-home-hero-art" aria-label="Learning dashboard preview">
                    <div className="kk-home-art-orbit kk-home-art-orbit-one" />
                    <div className="kk-home-art-orbit kk-home-art-orbit-two" />
                    <div className="kk-home-streak-badge">
                        <span className="kk-home-streak-flame">🔥</span>
                        <span><strong>5-Day Streak!</strong><small>You're showing up every day</small></span>
                    </div>

                    <div className="kk-home-learning-board">
                        <div className="kk-home-board-topline">
                            <span className="kk-home-board-label">YOUR LEARNING SPACE</span>
                            <span className="kk-home-board-sparkle" aria-hidden="true">✦</span>
                        </div>
                        <div className="kk-home-board-illustration">
                            <div className="kk-home-book-stack" aria-hidden="true">
                                <span className="kk-home-book book-one"><i /></span>
                                <span className="kk-home-book book-two"><i /></span>
                                <span className="kk-home-book book-three"><i /></span>
                                <span className="kk-home-bookworm">🐛</span>
                            </div>
                            <div className="kk-home-board-note">
                                <span>Today's focus</span>
                                <strong>One lesson at a time.</strong>
                                <small>Keep your curiosity growing.</small>
                            </div>
                        </div>
                        <div className="kk-home-board-progress-head">
                            <span>Weekly learning goal</span><strong>4 / 5 days</strong>
                        </div>
                        <div className="kk-home-week-dots" aria-label="4 of 5 learning days completed">
                            <span className="done">M</span><span className="done">T</span><span className="done">W</span><span className="done">T</span><span>F</span>
                        </div>
                    </div>

                    <div className="kk-home-floating-card kk-home-floating-card-top">
                        <span className="kk-home-floating-icon">✦</span>
                        <span><strong>Stay curious</strong><small>Learn at your own pace</small></span>
                    </div>
                    <div className="kk-home-floating-card kk-home-floating-card-bottom">
                        <span className="kk-home-check">✓</span>
                        <span><strong>Progress adds up</strong><small>Every lesson counts</small></span>
                    </div>
                </div>
            </section>

            <section className="kk-home-benefits" aria-label="Why learn with KitabiKeeda">
                <article className="kk-home-benefit">
                    <span className="kk-home-benefit-icon">📚</span>
                    <div><strong>Learn your way</strong><p>Pick up skills at your own pace.</p></div>
                </article>
                <article className="kk-home-benefit">
                    <span className="kk-home-benefit-icon">🌱</span>
                    <div><strong>Grow with practice</strong><p>Turn little lessons into big wins.</p></div>
                </article>
                <article className="kk-home-benefit">
                    <span className="kk-home-benefit-icon">🎯</span>
                    <div><strong>Keep your momentum</strong><p>See your effort become progress.</p></div>
                </article>
            </section>

            <section className="kk-home-learning-section" aria-labelledby="kk-continue-title">
                <div className="kk-home-section-heading">
                    <div>
                        <p className="kk-home-section-kicker">PICK UP WHERE YOU LEFT OFF</p>
                        <h2 id="kk-continue-title">Continue Learning</h2>
                        <p className="kk-home-section-subtitle">Your next small win is only one lesson away.</p>
                    </div>
                    <div className="kk-home-carousel-controls" aria-label="Course carousel controls">
                        <button type="button" onClick={() => scrollCarousel(-1)} aria-label="Scroll courses left"><ArrowIcon direction="left" /></button>
                        <button type="button" onClick={() => scrollCarousel(1)} aria-label="Scroll courses right"><ArrowIcon direction="right" /></button>
                    </div>
                </div>

                {!isLoggedIn ? (
                    <div className="kk-home-empty-learning">
                        <div className="kk-home-empty-icon">🌱</div>
                        <div>
                            <h3>Your learning shelf is waiting</h3>
                            <p>Log in to see your courses, track progress, and continue where you left off.</p>
                        </div>
                        <Link className="kk-home-button kk-home-button-primary" to="/login">Log in to continue <span aria-hidden="true">➔</span></Link>
                    </div>
                ) : learningLoading ? (
                    <div className="kk-home-loading-learning"><span className="kk-home-spinner" /> Loading your learning progress…</div>
                ) : (
                    <>
                        {visibleCourses.some((course) => course.preview) && (
                            <p className="kk-home-preview-note">
                                {learningError
                                    ? "Showing sample cards because your learning data couldn't be loaded."
                                    : "Sample preview cards — your enrolled courses and live progress will appear here."}
                            </p>
                        )}
                        <div className="kk-home-course-rail" ref={carouselRef}>
                            {visibleCourses.map((course) => (
                                <article className="kk-home-course-card" key={course.id}>
                                    <div className={`kk-home-course-art kk-home-course-art-${course.accent}`}>
                                        <div className="kk-home-course-icon" aria-hidden="true">{course.icon}</div>
                                        <span className="kk-home-course-type">{course.preview ? "PREVIEW" : "IN PROGRESS"}</span>
                                        <span className="kk-home-course-art-star" aria-hidden="true">✦</span>
                                    </div>
                                    <div className="kk-home-course-body">
                                        <div className="kk-home-course-title-row">
                                            <h3>{course.title}</h3>
                                            <span className="kk-home-course-progress-number">{course.progress}%</span>
                                        </div>
                                        <p className="kk-home-course-lesson">{course.lesson}</p>
                                        <div className="kk-home-progress-track" role="progressbar" aria-label={`${course.title} progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={course.progress}>
                                            <span style={{ width: `${course.progress}%` }} />
                                        </div>
                                        <div className="kk-home-progress-caption"><span>Course progress</span><strong>{course.progress}% complete</strong></div>
                                        <button className="kk-home-resume-button" type="button" onClick={() => resumeCourse(course)}>
                                            Resume Lesson <span aria-hidden="true">→</span>
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </>
                )}

                <div className="kk-home-browse-row">
                    <p>Curiosity looks good on you. Keep going.</p>
                    <Link to="/courses" className="kk-home-text-link">Browse all courses <span aria-hidden="true">↗</span></Link>
                </div>
            </section>
        </main>
    );
}
