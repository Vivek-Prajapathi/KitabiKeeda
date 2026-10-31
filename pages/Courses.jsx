import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    GetMarketplaceHomeApi,
    GetPublishedCoursesApi,
    SearchCoursesApi,
    GetCategoriesApi,
    ToggleWishlistApi,
} from "../api/marketplace";
import "./Courses.css";

const COURSE_KEYS = [
    "courses",
    "publishedCourses",
    "allCourses",
    "items",
    "results",
    "data",
];
const CATEGORY_KEYS = ["categories", "items", "results", "data"];

function unwrap(value) {
    return value?.data?.data ?? value?.data ?? value ?? {};
}

function findArray(value, keys, depth = 0) {
    if (Array.isArray(value)) return value;
    if (!value || typeof value !== "object" || depth > 5) return null;

    for (const key of keys) {
        if (Array.isArray(value[key])) return value[key];
    }

    for (const child of Object.values(value)) {
        const found = findArray(child, keys, depth + 1);
        if (found) return found;
    }

    return null;
}

function courseName(course) {
    return course?.name || course?.title || course?.courseName || "Untitled Course";
}

function courseId(course) {
    return String(
        course?._id ??
        course?.id ??
        course?.courseId ??
        course?.slug ??
        `${courseName(course)}-${coursePrice(course)}`
    );
}

function coursePrice(course) {
    return course?.price ?? course?.salePrice ?? course?.sellingPrice ?? 0;
}

function courseImage(course) {
    const image = course?.thumbnail ?? course?.image ?? course?.coverImage;
    if (typeof image === "string") return image;
    return (
        image?.url ||
        course?.thumbnailUrl ||
        course?.imageUrl ||
        course?.coverImageUrl ||
        course?.bannerImage ||
        ""
    );
}

function courseRating(course) {
    const rating =
        course?.rating ??
        course?.ratings ??
        course?.averageRating ??
        course?.ratingAverage ??
        0;
    const numeric = Number(rating);
    return Number.isFinite(numeric) ? numeric : 0;
}

function courseCategory(course) {
    const value = course?.categoryName ?? course?.category;
    if (typeof value === "string") return value;
    return value?.name || value?.title || "";
}

function courseDate(course) {
    const value =
        course?.publishedAt ??
        course?.createdAt ??
        course?.created_at ??
        course?.updatedAt;
    const date = value ? new Date(value) : null;
    return date && !Number.isNaN(date.getTime()) ? date.getTime() : 0;
}

function dedupeCourses(courses) {
    const seen = new Set();
    return (Array.isArray(courses) ? courses : []).filter((course) => {
        if (!course || typeof course !== "object") return false;

        // Prefer a content signature so identical duplicate records don't create duplicate cards.
        const key = [
            courseName(course).trim().toLowerCase(),
            String(coursePrice(course)),
            courseImage(course),
        ].join("|");

        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function displayPrice(price) {
    const value = Number(price);
    if (!Number.isFinite(value)) return `₹${price ?? 0}`;
    return `₹${value.toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    })}`;
}

function categoryName(category) {
    if (typeof category === "string") return category;
    return category?.name || category?.title || category?.categoryName || "";
}

function categoryCount(category) {
    return category?.courseCount ?? category?.count ?? category?.coursesCount ?? null;
}

function CourseCard({ course, isWishlisted, onWishlist, onView }) {
    const [imageFailed, setImageFailed] = useState(false);
    const image = courseImage(course);
    const name = courseName(course);
    const rating = courseRating(course);
    const price = coursePrice(course);
    const originalPrice =
        course?.originalPrice ?? course?.estimatedPrice ?? course?.regularPrice;

    return (
        <article className="market-course-card">
            <div className="market-course-image">
                {image && !imageFailed ? (
                    <img
                        src={image}
                        alt={name}
                        loading="lazy"
                        onError={() => setImageFailed(true)}
                    />
                ) : (
                    <div className="market-no-thumbnail">
                        <span className="market-play-icon">▶</span>
                        <span>No thumbnail</span>
                    </div>
                )}

                <button
                    type="button"
                    className={`market-wishlist ${isWishlisted ? "is-wishlisted" : ""}`}
                    aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    onClick={() => onWishlist(course)}
                >
                    {isWishlisted ? "♥" : "♡"}
                </button>
            </div>

            <div className="market-course-content">
                <h3 title={name}>{name}</h3>

                <div className="market-course-meta">
                    <span className="market-price">{displayPrice(price)}</span>
                    {originalPrice != null &&
                        Number(originalPrice) > Number(price) && (
                            <del>{displayPrice(originalPrice)}</del>
                        )}
                    <span className="market-rating" aria-label={`Rating ${rating}`}>
                        <span>⭐</span> {rating ? rating.toFixed(1) : "0"}
                    </span>
                </div>

                <button
                    type="button"
                    className="market-view-course"
                    onClick={() => onView(course)}
                >
                    View course
                </button>
            </div>
        </article>
    );
}

function CourseSection({ title, courses, wishlist, onWishlist, onView }) {
    if (!courses.length) return null;

    return (
        <section className="market-section">
            <div className="market-section-heading">
                <h2>{title}</h2>
                <span>{courses.length}</span>
            </div>
            <div className="market-course-grid">
                {courses.map((course, index) => {
                    const id = courseId(course);
                    return (
                        <CourseCard
                            key={`${id}-${index}`}
                            course={course}
                            isWishlisted={wishlist.has(id)}
                            onWishlist={onWishlist}
                            onView={onView}
                        />
                    );
                })}
            </div>
        </section>
    );
}

export default function Courses() {
    const navigate = useNavigate();

    const [allCourses, setAllCourses] = useState([]);
    const [homeData, setHomeData] = useState({});
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState("");
    const [submittedSearch, setSubmittedSearch] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [wishlist, setWishlist] = useState(() => new Set());
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadMarketplace() {
            setLoading(true);
            setError("");

            const [homeResult, coursesResult, categoriesResult] =
                await Promise.allSettled([
                    GetMarketplaceHomeApi(),
                    GetPublishedCoursesApi(),
                    GetCategoriesApi(),
                ]);

            if (cancelled) return;

            const home =
                homeResult.status === "fulfilled"
                    ? unwrap(homeResult.value)
                    : {};

            const coursesData =
                coursesResult.status === "fulfilled"
                    ? unwrap(coursesResult.value)
                    : null;

            const categoryData =
                categoriesResult.status === "fulfilled"
                    ? unwrap(categoriesResult.value)
                    : null;

            const coursesFromApi =
                findArray(coursesData, COURSE_KEYS) ??
                findArray(home, COURSE_KEYS) ??
                [];

            const normalizedCourses = dedupeCourses(coursesFromApi);

            const categoriesFromApi =
                findArray(categoryData, CATEGORY_KEYS) ??
                findArray(home, CATEGORY_KEYS) ??
                [];

            const categoriesFromCourses = normalizedCourses
                .map(courseCategory)
                .filter(Boolean)
                .filter((name, index, arr) =>
                    arr.findIndex(
                        (candidate) => candidate.toLowerCase() === name.toLowerCase()
                    ) === index
                )
                .map((name) => ({ name }));

            setHomeData(home && typeof home === "object" ? home : {});
            setAllCourses(normalizedCourses);
            setCategories(
                categoriesFromApi.length
                    ? categoriesFromApi
                    : categoriesFromCourses
            );

            if (!normalizedCourses.length && homeResult.status === "rejected" &&
                coursesResult.status === "rejected") {
                setError(
                    coursesResult.reason?.response?.data?.message ||
                    homeResult.reason?.response?.data?.message ||
                    "Unable to load published courses. Please try again."
                );
            }

            setLoading(false);
        }

        loadMarketplace();

        return () => {
            cancelled = true;
        };
    }, []);

    const homeFeatured = useMemo(
        () =>
            dedupeCourses(
                findArray(homeData, [
                    "featuredCourses",
                    "featured",
                    "featuredCourse",
                    "featuredItems",
                ]) ?? []
            ),
        [homeData]
    );

    const homeTopRated = useMemo(
        () =>
            dedupeCourses(
                findArray(homeData, [
                    "topRatedCourses",
                    "topRated",
                    "highestRatedCourses",
                ]) ?? []
            ),
        [homeData]
    );

    const homeNewest = useMemo(
        () =>
            dedupeCourses(
                findArray(homeData, [
                    "newestCourses",
                    "newest",
                    "latestCourses",
                    "recentCourses",
                ]) ?? []
            ),
        [homeData]
    );

    const sourceCourses = submittedSearch ?? allCourses;

    const visibleCourses = useMemo(() => {
        const query = search.trim().toLowerCase();

        return sourceCourses.filter((course) => {
            const category = courseCategory(course).toLowerCase();
            const selectedMatches =
                selectedCategory === "All" ||
                category === selectedCategory.toLowerCase();

            const tags = Array.isArray(course.tags)
                ? course.tags.join(" ")
                : String(course.tags || "");

            const searchableText = [
                courseName(course),
                course.description,
                tags,
                course.level,
                category,
            ]
                .map((value) => String(value || ""))
                .join(" ")
                .toLowerCase();

            return selectedMatches && (!query || searchableText.includes(query));
        });
    }, [sourceCourses, search, selectedCategory]);

    const featuredCourses = useMemo(() => {
        const currentIds = new Set(visibleCourses.map(courseId));
        const featured = homeFeatured.filter((course) => currentIds.has(courseId(course)));
        return (featured.length ? featured : visibleCourses).slice(0, 8);
    }, [homeFeatured, visibleCourses]);

    const topRatedCourses = useMemo(() => {
        const currentIds = new Set(visibleCourses.map(courseId));
        const fromHome = homeTopRated.filter((course) => currentIds.has(courseId(course)));
        return (fromHome.length
            ? fromHome
            : [...visibleCourses].sort((a, b) => courseRating(b) - courseRating(a))
        ).slice(0, 8);
    }, [homeTopRated, visibleCourses]);

    const newestCourses = useMemo(() => {
        const currentIds = new Set(visibleCourses.map(courseId));
        const fromHome = homeNewest.filter((course) => currentIds.has(courseId(course)));
        return (fromHome.length
            ? fromHome
            : [...visibleCourses].sort((a, b) => courseDate(b) - courseDate(a))
        ).slice(0, 8);
    }, [homeNewest, visibleCourses]);

    const handleSearch = async (event) => {
        event.preventDefault();
        setNotice("");

        const query = search.trim();
        if (!query) {
            setSubmittedSearch(null);
            return;
        }

        try {
            setSearching(true);
            const result = unwrap(await SearchCoursesApi(query));
            const found = findArray(result, COURSE_KEYS);

            // If the API returned a recognizable course list, use that response.
            // Otherwise, the local search still works on the already loaded list.
            if (found) {
                setSubmittedSearch(dedupeCourses(found));
            } else {
                setSubmittedSearch(null);
            }
        } catch (searchError) {
            console.error(
                "Course search failed:",
                searchError.response?.data || searchError.message
            );
            setSubmittedSearch(null);
            setNotice("Online search is unavailable; showing local matches instead.");
        } finally {
            setSearching(false);
        }
    };

    const handleWishlist = async (course) => {
        const id = courseId(course);
        setNotice("");

        try {
            const response = unwrap(await ToggleWishlistApi(id));
            const nextValue =
                typeof response?.wishlisted === "boolean"
                    ? response.wishlisted
                    : !wishlist.has(id);

            setWishlist((previous) => {
                const next = new Set(previous);
                if (nextValue) next.add(id);
                else next.delete(id);
                return next;
            });
        } catch (wishlistError) {
            console.error(
                "Wishlist update failed:",
                wishlistError.response?.data || wishlistError.message
            );
            setNotice(
                wishlistError.response?.data?.message ||
                "Please log in to add courses to your wishlist."
            );
        }
    };

    const handleView = (course) => {
        navigate(`/courses/${courseId(course)}`);
    };

    if (loading) {
        return (
            <main className="marketplace-page">
                <div className="marketplace-loading">
                    <span className="marketplace-spinner" />
                    <p>Loading the marketplace...</p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="marketplace-page">
                <section className="marketplace-error">
                    <h1>Marketplace could not load</h1>
                    <p>{error}</p>
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                    >
                        Try again
                    </button>
                </section>
            </main>
        );
    }

    const totalCount = visibleCourses.length;

    return (
        <main className="marketplace-page">
            <div className="marketplace-inner-nav">
                <h1>LMS Marketplace</h1>
                <div className="marketplace-inner-links">
                    <button
                        type="button"
                        className="active"
                        onClick={() => navigate("/courses")}
                    >
                        Marketplace
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/profile/my-learning")}
                    >
                        My Learning
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/instructor")}
                    >
                        Instructor
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/admin/manage-courses")}
                    >
                        LMS Admin
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/")}
                    >
                        ← Site home
                    </button>
                </div>
            </div>

            <form className="marketplace-search" onSubmit={handleSearch}>
                <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search published courses..."
                    aria-label="Search published courses"
                />
                <button type="submit" disabled={searching}>
                    {searching ? "Searching..." : "Search"}
                </button>
            </form>

            <div className="marketplace-categories" aria-label="Course categories">
                <button
                    type="button"
                    className={selectedCategory === "All" ? "selected" : ""}
                    onClick={() => setSelectedCategory("All")}
                >
                    All courses ({allCourses.length})
                </button>

                {categories.map((category, index) => {
                    const name = categoryName(category);
                    if (!name) return null;

                    return (
                        <button
                            type="button"
                            key={`${name}-${index}`}
                            className={
                                selectedCategory.toLowerCase() === name.toLowerCase()
                                    ? "selected"
                                    : ""
                            }
                            onClick={() => setSelectedCategory(name)}
                        >
                            {name}
                            {categoryCount(category) != null
                                ? ` (${categoryCount(category)})`
                                : ""}
                        </button>
                    );
                })}
            </div>

            {notice && <p className="marketplace-notice">{notice}</p>}

            {search && (
                <p className="marketplace-result-count">
                    Showing {totalCount} course{totalCount === 1 ? "" : "s"}
                    {submittedSearch ? " matching your search" : ""}
                </p>
            )}

            {visibleCourses.length === 0 ? (
                <section className="marketplace-empty">
                    <h2>No courses found</h2>
                    <p>Try another search or choose a different category.</p>
                    <button
                        type="button"
                        onClick={() => {
                            setSearch("");
                            setSubmittedSearch(null);
                            setSelectedCategory("All");
                        }}
                    >
                        Show all courses
                    </button>
                </section>
            ) : (
                <>
                    <CourseSection
                        title="Featured"
                        courses={featuredCourses}
                        wishlist={wishlist}
                        onWishlist={handleWishlist}
                        onView={handleView}
                    />

                    <CourseSection
                        title="Top Rated"
                        courses={topRatedCourses}
                        wishlist={wishlist}
                        onWishlist={handleWishlist}
                        onView={handleView}
                    />

                    <CourseSection
                        title="Newest"
                        courses={newestCourses}
                        wishlist={wishlist}
                        onWishlist={handleWishlist}
                        onView={handleView}
                    />

                    <CourseSection
                        title="All Courses"
                        courses={visibleCourses}
                        wishlist={wishlist}
                        onWishlist={handleWishlist}
                        onView={handleView}
                    />
                </>
            )}
        </main>
    );
}
