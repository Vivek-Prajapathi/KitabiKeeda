import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import courseAPI from "../api/course";

const getCourseId = (course) => course?._id || course?.id;

const getCourseTitle = (course) =>
    course?.name || course?.title || "Untitled Course";

const getCourseImage = (course) => {
    const image =
        course?.thumbnailUrl ||
        course?.thumbnail?.url ||
        course?.thumbnail ||
        course?.imageUrl ||
        course?.image ||
        course?.coverImageUrl;

    return typeof image === "string" ? image : "";
};

export default function RegularCourses() {
    const navigate = useNavigate();

    const [courses, setCourses] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedLevel, setSelectedLevel] = useState("All Levels");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const fetchCourses = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await courseAPI.get("/lms/courses");

                if (cancelled) return;

                const courseList = Array.isArray(response.data?.courses)
                    ? response.data.courses
                    : [];

                setCourses(courseList);
            } catch (err) {
                if (cancelled) return;

                console.error(
                    "Error fetching regular courses:",
                    err.response?.data || err.message
                );

                setError(
                    err.response?.data?.message ||
                        "Unable to load courses. Please try again."
                );
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchCourses();

        return () => {
            cancelled = true;
        };
    }, []);

    const levels = useMemo(() => {
        const availableLevels = courses
            .map((course) => course.level)
            .filter(Boolean);

        return ["All Levels", ...new Set(availableLevels)];
    }, [courses]);

    const filteredCourses = useMemo(() => {
        const searchText = search.toLowerCase().trim();

        return courses.filter((course) => {
            const searchableFields = [
                course.name,
                course.title,
                course.description,
                course.tags,
                course.level,
            ];

            const matchesSearch = searchableFields.some((value) => {
                const text = Array.isArray(value)
                    ? value.join(" ")
                    : String(value || "");

                return text.toLowerCase().includes(searchText);
            });

            const matchesLevel =
                selectedLevel === "All Levels" ||
                course.level === selectedLevel;

            return matchesSearch && matchesLevel;
        });
    }, [courses, search, selectedLevel]);

    const openCourse = (course) => {
        const id = getCourseId(course);

        if (id) {
            navigate(`/courses/${id}`);
        }
    };

    return (
        <main className="regular-courses-page">
            <style>{`
                /* ===== PAGE ===== */
                .regular-courses-page {
                    width: 100%;
                    min-height: 100vh;
                    padding: 22px clamp(18px, 3vw, 44px) 40px;
                    background: #f7f5ec;
                    color: #283526;
                    font-family: Inter, -apple-system, BlinkMacSystemFont,
                        "Segoe UI", sans-serif;
                    box-sizing: border-box;
                }

                .regular-courses-page *,
                .regular-courses-page *::before,
                .regular-courses-page *::after {
                    box-sizing: border-box;
                }

                /* ===== COMPACT HEADER ===== */
                .regular-courses-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 20px;
                    margin-bottom: 16px;
                }

                .regular-courses-label {
                    margin: 0 0 6px;
                    color: #628141;
                    font-size: 10px;
                    font-weight: 800;
                    letter-spacing: 1.6px;
                }

                .regular-courses-header h1 {
                    margin: 0 0 6px;
                    color: #283526;
                    font-size: clamp(28px, 2.4vw, 36px);
                    font-weight: 800;
                    letter-spacing: -1px;
                    line-height: 1.2;
                }

                .regular-courses-subtitle {
                    margin: 0;
                    color: #74796d;
                    font-size: 14px;
                    line-height: 1.5;
                }

                .regular-courses-count {
                    flex-shrink: 0;
                    min-width: 112px;
                    padding: 9px 16px;
                    background: #e9efdf;
                    border: 1px solid #dbe4ce;
                    border-radius: 10px;
                    text-align: center;
                }

                .regular-courses-count strong {
                    display: block;
                    color: #4e6934;
                    font-size: 22px;
                    font-weight: 800;
                }

                .regular-courses-count span {
                    color: #626b58;
                    font-size: 11px;
                }

                /* ===== SEARCH AND FILTER ===== */
                .regular-courses-toolbar {
                    display: flex;
                    align-items: flex-end;
                    gap: 14px;
                    width: 100%;
                    margin: 0 0 16px;
                    padding: 12px 14px;
                    background: #fffdf7;
                    border: 1px solid #e2e7d9;
                    border-radius: 13px;
                    box-shadow: 0 3px 12px rgba(40, 53, 38, 0.035);
                }

                .regular-courses-search {
                    display: block;
                    flex: 1;
                    min-width: 0;
                    width: 100%;
                    height: 44px;
                    padding: 0 14px;
                    border: 1px solid #dfe6d6;
                    border-radius: 9px;
                    outline: none;
                    background: #f8faf5;
                    color: #283526;
                    font-family: inherit;
                    font-size: 14px;
                    transition: border-color 0.2s ease,
                        box-shadow 0.2s ease,
                        background 0.2s ease;
                }

                .regular-courses-search::placeholder {
                    color: #98a18f;
                    opacity: 1;
                }

                .regular-courses-search:focus {
                    border-color: #628141;
                    background: #fff;
                    box-shadow: 0 0 0 3px rgba(98, 129, 65, 0.11);
                }

                .regular-courses-filter {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                    flex: 0 0 185px;
                    width: 185px;
                    min-width: 0;
                }

                .regular-courses-filter label {
                    color: #59664e;
                    font-size: 11px;
                    font-weight: 700;
                }

                .regular-courses-select {
                    display: block;
                    width: 100%;
                    height: 44px;
                    padding: 0 10px;
                    border: 1px solid #dfe6d6;
                    border-radius: 9px;
                    outline: none;
                    background: #f8faf5;
                    color: #34432d;
                    font-family: inherit;
                    font-size: 13px;
                    cursor: pointer;
                }

                .regular-courses-select:focus {
                    border-color: #628141;
                    box-shadow: 0 0 0 3px rgba(98, 129, 65, 0.11);
                }

                /* ===== RESULTS ===== */
                .regular-courses-results {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    margin-bottom: 14px;
                    color: #74796d;
                    font-size: 12px;
                }

                .regular-courses-results p {
                    margin: 0;
                }

                .regular-courses-reset {
                    padding: 7px 12px;
                    border: 1px solid #d6dfc9;
                    border-radius: 8px;
                    background: transparent;
                    color: #4e6934;
                    font: inherit;
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                }

                .regular-courses-reset:hover {
                    background: #e9efdf;
                }

                /* ===== FOUR COURSES PER ROW ===== */
                .regular-courses-grid {
                    display: grid;
                    grid-template-columns: repeat(4, minmax(0, 1fr));
                    align-items: stretch;
                    gap: 18px;
                }

                /* ===== COURSE CARD ===== */
                .regular-course-card {
                    display: flex;
                    flex-direction: column;
                    min-width: 0;
                    overflow: hidden;
                    border: 1px solid #e3dfd1;
                    border-radius: 13px;
                    background: #fffdf7;
                    box-shadow: 0 3px 10px rgba(40, 53, 38, 0.04);
                    transition: transform 0.2s ease,
                        box-shadow 0.2s ease,
                        border-color 0.2s ease;
                }

                .regular-course-card:hover {
                    transform: translateY(-3px);
                    border-color: #cbd8bf;
                    box-shadow: 0 9px 20px rgba(40, 53, 38, 0.09);
                }

                /* Smaller course images */
                .regular-course-image {
                    position: relative;
                    display: grid;
                    place-items: center;
                    width: 100%;
                    aspect-ratio: 1.9 / 1;
                    overflow: hidden;
                    background: linear-gradient(
                        135deg,
                        #e9efdf,
                        #dbe7ce
                    );
                    color: #4e6934;
                    font-size: 40px;
                }

                .regular-course-image img {
                    position: absolute;
                    inset: 0;
                    display: block;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.3s ease;
                }

                .regular-course-card:hover .regular-course-image img {
                    transform: scale(1.035);
                }

                /* ===== COURSE DETAILS ===== */
                .regular-course-body {
                    display: flex;
                    flex: 1;
                    flex-direction: column;
                    min-width: 0;
                    padding: 14px;
                }

                .regular-course-level {
                    display: inline-block;
                    align-self: flex-start;
                    max-width: 100%;
                    margin-bottom: 8px;
                    padding: 5px 8px;
                    border-radius: 7px;
                    background: #edf3e7;
                    color: #526b3e;
                    font-size: 10px;
                    font-weight: 700;
                }

                .regular-course-body h2 {
                    display: -webkit-box;
                    overflow: hidden;
                    margin: 0 0 8px;
                    color: #283526;
                    font-size: 16px;
                    font-weight: 750;
                    line-height: 1.4;
                    overflow-wrap: anywhere;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                }

                .regular-course-description {
                    display: -webkit-box;
                    overflow: hidden;
                    margin: 0 0 14px;
                    color: #74796d;
                    font-size: 12px;
                    line-height: 1.6;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                }

                .regular-course-open {
                    width: 100%;
                    min-height: 38px;
                    margin-top: auto;
                    padding: 9px 12px;
                    border: 0;
                    border-radius: 8px;
                    background: #628141;
                    color: #fff;
                    font-family: inherit;
                    font-size: 13px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: background 0.2s ease;
                }

                .regular-course-open:hover {
                    background: #4e6934;
                }

                .regular-course-open:focus-visible,
                .regular-courses-reset:focus-visible {
                    outline: 3px solid #b8cda2;
                    outline-offset: 3px;
                }

                /* ===== LOADING, ERROR AND EMPTY STATES ===== */
                .regular-courses-message {
                    padding: 32px 20px;
                    border: 1px solid #e3dfd1;
                    border-radius: 13px;
                    background: #fffdf7;
                    text-align: center;
                }

                .regular-courses-message h2 {
                    margin: 0 0 8px;
                    color: #283526;
                    font-size: 21px;
                }

                .regular-courses-message p {
                    color: #74796d;
                    font-size: 14px;
                    line-height: 1.7;
                }

                .regular-courses-message button {
                    padding: 10px 17px;
                    border: 0;
                    border-radius: 8px;
                    background: #628141;
                    color: #fff;
                    font: inherit;
                    font-size: 13px;
                    font-weight: 700;
                    cursor: pointer;
                }

                /* ===== MEDIUM DESKTOP: THREE CARDS ===== */
                @media (max-width: 1250px) {
                    .regular-courses-grid {
                        grid-template-columns: repeat(3, minmax(0, 1fr));
                        gap: 16px;
                    }
                }

                /* ===== TABLET: TWO CARDS ===== */
                @media (max-width: 900px) {
                    .regular-courses-page {
                        padding: 24px 20px 36px;
                    }

                    .regular-courses-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                        gap: 16px;
                    }

                    .regular-courses-toolbar {
                        align-items: stretch;
                    }

                    .regular-courses-filter {
                        flex-basis: 175px;
                        width: 175px;
                    }
                }

                /* ===== MOBILE ===== */
                @media (max-width: 700px) {
                    .regular-courses-page {
                        padding: 22px 16px 32px;
                    }

                    .regular-courses-header {
                        align-items: flex-start;
                        gap: 12px;
                        margin-bottom: 16px;
                    }

                    .regular-courses-header h1 {
                        font-size: 28px;
                    }

                    .regular-courses-count {
                        min-width: 90px;
                        padding: 8px 10px;
                    }

                    .regular-courses-count strong {
                        font-size: 20px;
                    }

                    .regular-courses-count span {
                        font-size: 10px;
                    }

                    .regular-courses-toolbar {
                        flex-direction: column;
                        align-items: stretch;
                        gap: 12px;
                        padding: 12px;
                    }

                    .regular-courses-search {
                        height: 44px;
                        font-size: 13px;
                    }

                    .regular-courses-filter {
                        flex: auto;
                        width: 100%;
                    }

                    .regular-courses-select {
                        height: 44px;
                    }
                }

                /* ===== SMALL PHONES: ONE CARD ===== */
                @media (max-width: 560px) {
                    .regular-courses-grid {
                        grid-template-columns: minmax(0, 1fr);
                        gap: 16px;
                    }

                    .regular-course-image {
                        aspect-ratio: 1.9 / 1;
                    }

                    .regular-course-body {
                        padding: 15px;
                    }

                    .regular-course-body h2 {
                        font-size: 17px;
                    }

                    .regular-course-description {
                        font-size: 13px;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .regular-courses-page *,
                    .regular-courses-page *::before,
                    .regular-courses-page *::after {
                        animation: none !important;
                        transition: none !important;
                    }
                }
            `}</style>

            <section className="regular-courses-header">
                <div>
                    <p className="regular-courses-label">
                        YOUR LEARNING JOURNEY
                    </p>

                    <h1>Explore Courses</h1>

                    <p className="regular-courses-subtitle">
                        Discover new skills. Learn at your own pace.
                    </p>
                </div>

                <div className="regular-courses-count">
                    <strong>{filteredCourses.length}</strong>
                    <span>
                        {filteredCourses.length === 1
                            ? "Course available"
                            : "Courses available"}
                    </span>
                </div>
            </section>

            {loading ? (
                <section className="regular-courses-message">
                    <h2>Finding courses for you...</h2>
                    <p>Please wait while courses are loading.</p>
                </section>
            ) : error ? (
                <section className="regular-courses-message">
                    <h2>Unable to load courses</h2>
                    <p>{error}</p>

                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                    >
                        Try Again
                    </button>
                </section>
            ) : (
                <>
                    <section className="regular-courses-toolbar">
                        <input
                            type="search"
                            className="regular-courses-search"
                            placeholder="Search courses, skills, or topics..."
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            aria-label="Search courses"
                        />

                        <div className="regular-courses-filter">
                            <label htmlFor="regular-course-level">
                                Course Level
                            </label>

                            <select
                                id="regular-course-level"
                                className="regular-courses-select"
                                value={selectedLevel}
                                onChange={(event) =>
                                    setSelectedLevel(event.target.value)
                                }
                            >
                                {levels.map((level) => (
                                    <option key={level} value={level}>
                                        {level}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </section>

                    <div className="regular-courses-results">
                        <p>
                            Showing {filteredCourses.length} of{" "}
                            {courses.length} courses
                        </p>

                        {(search || selectedLevel !== "All Levels") && (
                            <button
                                type="button"
                                className="regular-courses-reset"
                                onClick={() => {
                                    setSearch("");
                                    setSelectedLevel("All Levels");
                                }}
                            >
                                Clear filters
                            </button>
                        )}
                    </div>

                    {filteredCourses.length === 0 ? (
                        <section className="regular-courses-message">
                            <h2>No courses found</h2>
                            <p>
                                Try another keyword or change the course level.
                            </p>
                        </section>
                    ) : (
                        <section className="regular-courses-grid">
                            {filteredCourses.map((course, index) => {
                                const id = getCourseId(course);
                                const title = getCourseTitle(course);
                                const image = getCourseImage(course);

                                return (
                                    <article
                                        className="regular-course-card"
                                        key={id || `${title}-${index}`}
                                    >
                                        <div className="regular-course-image">
                                            {image ? (
                                                <img
                                                    src={image}
                                                    alt={title}
                                                    loading="lazy"
                                                    onError={(event) => {
                                                        event.currentTarget.style.display =
                                                            "none";
                                                    }}
                                                />
                                            ) : (
                                                "📚"
                                            )}
                                        </div>

                                        <div className="regular-course-body">
                                            {course.level && (
                                                <span className="regular-course-level">
                                                    {course.level}
                                                </span>
                                            )}

                                            <h2>{title}</h2>

                                            <p className="regular-course-description">
                                                {course.description ||
                                                    "Explore this course and build your skills."}
                                            </p>

                                            <button
                                                type="button"
                                                className="regular-course-open"
                                                onClick={() =>
                                                    openCourse(course)
                                                }
                                            >
                                                View Course
                                            </button>
                                        </div>
                                    </article>
                                );
                            })}
                        </section>
                    )}
                </>
            )}
        </main>
    );
}