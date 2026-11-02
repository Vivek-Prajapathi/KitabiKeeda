import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../api/axios";
import "./CourseDetails.css";

export default function CourseDetails() {
    const { id } = useParams();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const fetchCourse = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await axiosInstance.get(
                    `/course/get-course/${id}`
                );

                console.log("Course details:", response.data);

                if (!cancelled) {
                    setCourse(response.data.course);
                }
            } catch (err) {
                console.error(
                    "Failed to fetch course:",
                    err.response?.data || err.message
                );

                if (!cancelled) {
                    setError(
                        err.response?.data?.message ||
                        "Unable to load course details."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchCourse();

        return () => {
            cancelled = true;
        };
    }, [id]);

    if (loading) {
        return (
            <main className="course-details-page">
                <div className="course-details-loading">
                    <div className="course-details-spinner"></div>
                    <p>Loading course details...</p>
                </div>
            </main>
        );
    }

    if (error || !course) {
        return (
            <main className="course-details-page">
                <div className="course-details-error">
                    <h2>Course unavailable</h2>
                    <p>{error || "Course not found."}</p>

                    <Link
                        to="/courses"
                        className="course-back-button"
                    >
                        Back to Courses
                    </Link>
                </div>
            </main>
        );
    }

    // Course information
    const imageUrl =
        typeof course.thumbnail === "string"
            ? course.thumbnail
            : course.thumbnail?.url;

    const tags = Array.isArray(course.tags)
        ? course.tags.join(", ")
        : course.tags;

    const rating =
        course.ratings ??
        course.rating ??
        course.averageRating;

    const students =
        course.students ??
        course.studentsCount ??
        course.purchased ??
        course.enrolledStudents;

    const originalPrice =
        course.estimatedPrice ??
        course.originalPrice;

    const benefits = course.benefits;
    const prerequisites = course.prerequisites;
    const courseContent = course.courseContent;
    const reviews = course.reviews;

    return (
        <main className="course-details-page">
            <div className="course-details-container">

                {/* Back link */}
                <Link
                    to="/courses"
                    className="course-back-link"
                >
                    ← Back to Courses
                </Link>

                <article className="course-details-card">

                    {/* Course image */}
                    <div className="course-details-image-wrapper">
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={course.name || "Course"}
                                className="course-details-image"
                                onError={(event) => {
                                    event.currentTarget.style.display = "none";

                                    const fallback =
                                        event.currentTarget.parentElement?.querySelector(
                                            ".course-details-image-fallback"
                                        );

                                    if (fallback) {
                                        fallback.style.display = "flex";
                                    }
                                }}
                            />
                        ) : null}

                        <div
                            className="course-details-image-fallback"
                            style={{
                                display: imageUrl ? "none" : "flex",
                            }}
                        >
                            <span>📚</span>
                            <p>KitabiKeeda</p>
                        </div>
                    </div>

                    {/* Course details */}
                    <div className="course-details-content">
                        {course.level && (
                            <span className="course-level">
                                {course.level}
                            </span>
                        )}

                        <h1>
                            {course.name || "Untitled Course"}
                        </h1>

                        <p className="course-details-description">
                            {course.description ||
                                "Explore this course and develop new skills."}
                        </p>

                        <div className="course-details-info">
                            <p>
                                <strong>Level:</strong>{" "}
                                {course.level || "Not specified"}
                            </p>

                            {tags && (
                                <p>
                                    <strong>Tags:</strong> {tags}
                                </p>
                            )}
                        </div>

                        {/* Price */}
                        <div className="course-details-price">
                            <span>
                                ₹
                                {course.price != null
                                    ? Number(course.price).toLocaleString(
                                        "en-IN"
                                    )
                                    : "0"}
                            </span>

                            {originalPrice != null &&
                                Number(originalPrice) >
                                    Number(course.price) && (
                                    <del className="course-details-original-price">
                                        ₹
                                        {Number(originalPrice).toLocaleString(
                                            "en-IN"
                                        )}
                                    </del>
                                )}
                        </div>

                        {/* Rating */}
                        <div className="course-details-rating">
                            <span className="rating-star">⭐</span>

                            <span>
                                {rating != null &&
                                Number.isFinite(Number(rating))
                                    ? Number(rating).toFixed(1)
                                    : "0"}
                            </span>
                        </div>

                        {/* Students */}
                        <p className="course-details-students">
                            👥{" "}
                            {students != null
                                ? `${students} students`
                                : "Student count unavailable"}
                        </p>

                        {/* Action buttons */}
                        <div className="course-details-actions">
                            {course.demoUrl && (
                                <a
                                    href={course.demoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="course-demo-button"
                                >
                                    Watch Demo
                                </a>
                            )}

                            <button
                                type="button"
                                className="course-buy-button"
                                onClick={() => {
                                    alert(
                                        "Course purchase is not configured yet."
                                    );
                                }}
                            >
                                Buy Course
                            </button>
                        </div>
                    </div>

                    {/* Additional sections */}
                    <div className="course-details-sections">

                        {/* Benefits */}
                        <section className="course-info-section">
                            <h2>What You Will Learn</h2>

                            {Array.isArray(benefits) &&
                            benefits.length > 0 ? (
                                <ul className="course-info-list">
                                    {benefits.map((benefit, index) => (
                                        <li key={index}>
                                            {typeof benefit === "string"
                                                ? benefit
                                                : benefit.title ||
                                                  benefit.description ||
                                                  JSON.stringify(benefit)}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No benefits added.</p>
                            )}
                        </section>

                        {/* Prerequisites */}
                        <section className="course-info-section">
                            <h2>Prerequisites</h2>

                            {Array.isArray(prerequisites) &&
                            prerequisites.length > 0 ? (
                                <ul className="course-info-list">
                                    {prerequisites.map((item, index) => (
                                        <li key={index}>
                                            {typeof item === "string"
                                                ? item
                                                : item.title ||
                                                  item.description ||
                                                  JSON.stringify(item)}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No prerequisites added.</p>
                            )}
                        </section>

                        {/* Course content */}
                        <section className="course-info-section">
                            <h2>Course Content</h2>

                            {Array.isArray(courseContent) &&
                            courseContent.length > 0 ? (
                                <ul className="course-info-list">
                                    {courseContent.map((item, index) => (
                                        <li key={item._id || index}>
                                            {typeof item === "string"
                                                ? item
                                                : item.title ||
                                                  item.name ||
                                                  `Lesson ${index + 1}`}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No course content available.</p>
                            )}
                        </section>

                        {/* Reviews */}
                        <section className="course-info-section">
                            <h2>Reviews</h2>

                            {Array.isArray(reviews) &&
                            reviews.length > 0 ? (
                                reviews.map((review, index) => (
                                    <div
                                        className="course-review"
                                        key={review._id || index}
                                    >
                                        <p>
                                            <strong>
                                                {review.user?.name ||
                                                    review.name ||
                                                    "Student"}
                                            </strong>
                                        </p>

                                        {review.rating != null && (
                                            <p>
                                                ⭐ {review.rating}
                                            </p>
                                        )}

                                        <p>
                                            {review.comment ||
                                                review.review ||
                                                ""}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p>No reviews yet.</p>
                            )}
                        </section>

                    </div>
                </article>
            </div>
        </main>
    );
}
// import { useEffect, useState } from "react";
// import { useParams, Link } from "react-router-dom";
// import axiosInstance from "../api/axios";
// import ApplyLmsCoupon from "../components/ApplyLmsCoupon";
// import "./CourseDetails.css";

// export default function CourseDetails() {
//     const { id } = useParams();

//     const [course, setCourse] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");
//     const [couponResult, setCouponResult] = useState(null);

//     useEffect(() => {
//         let cancelled = false;

//         const fetchCourse = async () => {
//             try {
//                 setLoading(true);
//                 setError("");

//                 const response = await axiosInstance.get(
//                     `/course/get-course/${id}`
//                 );

//                 console.log("Course details:", response.data);

//                 if (!cancelled) {
//                     setCourse(response.data.course);
//                 }
//             } catch (err) {
//                 console.error(
//                     "Failed to fetch course:",
//                     err.response?.data || err.message
//                 );

//                 if (!cancelled) {
//                     setError(
//                         err.response?.data?.message ||
//                         "Unable to load course details."
//                     );
//                 }
//             } finally {
//                 if (!cancelled) {
//                     setLoading(false);
//                 }
//             }
//         };

//         fetchCourse();

//         return () => {
//             cancelled = true;
//         };
//     }, [id]);

//     if (loading) {
//         return (
//             <main className="course-details-page">
//                 <div className="course-details-loading">
//                     <div className="course-details-spinner"></div>
//                     <p>Loading course details...</p>
//                 </div>
//             </main>
//         );
//     }

//     if (error || !course) {
//         return (
//             <main className="course-details-page">
//                 <div className="course-details-error">
//                     <h2>Course unavailable</h2>
//                     <p>{error || "Course not found."}</p>

//                     <Link
//                         to="/courses"
//                         className="course-back-button"
//                     >
//                         Back to Courses
//                     </Link>
//                 </div>
//             </main>
//         );
//     }

//     // Course information
//     const imageUrl =
//         typeof course.thumbnail === "string"
//             ? course.thumbnail
//             : course.thumbnail?.url;

//     const tags = Array.isArray(course.tags)
//         ? course.tags.join(", ")
//         : course.tags;

//     const rating =
//         course.ratings ??
//         course.rating ??
//         course.averageRating;

//     const students =
//         course.students ??
//         course.studentsCount ??
//         course.purchased ??
//         course.enrolledStudents;

//     const originalPrice =
//         course.estimatedPrice ??
//         course.originalPrice;

//     const benefits = course.benefits;
//     const prerequisites = course.prerequisites;
//     const courseContent = course.courseContent;
//     const reviews = course.reviews;

//     const courseId = course._id ?? course.id ?? id;

//     return (
//         <main className="course-details-page">
//             <div className="course-details-container">

//                 {/* Back link */}
//                 <Link
//                     to="/courses"
//                     className="course-back-link"
//                 >
//                     ← Back to Courses
//                 </Link>

//                 <article className="course-details-card">

//                     {/* Course image */}
//                     <div className="course-details-image-wrapper">
//                         {imageUrl ? (
//                             <img
//                                 src={imageUrl}
//                                 alt={course.name || "Course"}
//                                 className="course-details-image"
//                                 onError={(event) => {
//                                     event.currentTarget.style.display = "none";

//                                     const fallback =
//                                         event.currentTarget.parentElement?.querySelector(
//                                             ".course-details-image-fallback"
//                                         );

//                                     if (fallback) {
//                                         fallback.style.display = "flex";
//                                     }
//                                 }}
//                             />
//                         ) : null}

//                         <div
//                             className="course-details-image-fallback"
//                             style={{
//                                 display: imageUrl ? "none" : "flex",
//                             }}
//                         >
//                             <span>📚</span>
//                             <p>KitabiKeeda</p>
//                         </div>
//                     </div>

//                     {/* Course details */}
//                     <div className="course-details-content">
//                         {course.level && (
//                             <span className="course-level">
//                                 {course.level}
//                             </span>
//                         )}

//                         <h1>
//                             {course.name || "Untitled Course"}
//                         </h1>

//                         <p className="course-details-description">
//                             {course.description ||
//                                 "Explore this course and develop new skills."}
//                         </p>

//                         <div className="course-details-info">
//                             <p>
//                                 <strong>Level:</strong>{" "}
//                                 {course.level || "Not specified"}
//                             </p>

//                             {tags && (
//                                 <p>
//                                     <strong>Tags:</strong> {tags}
//                                 </p>
//                             )}
//                         </div>

//                         {/* Price */}
//                         <div className="course-details-price">
//                             <span>
//                                 ₹
//                                 {course.price != null
//                                     ? Number(course.price).toLocaleString(
//                                         "en-IN"
//                                     )
//                                     : "0"}
//                             </span>

//                             {originalPrice != null &&
//                                 Number(originalPrice) >
//                                     Number(course.price) && (
//                                     <del className="course-details-original-price">
//                                         ₹
//                                         {Number(originalPrice).toLocaleString(
//                                             "en-IN"
//                                         )}
//                                     </del>
//                                 )}
//                         </div>

//                         {/* Rating */}
//                         <div className="course-details-rating">
//                             <span className="rating-star">⭐</span>

//                             <span>
//                                 {rating != null &&
//                                 Number.isFinite(Number(rating))
//                                     ? Number(rating).toFixed(1)
//                                     : "0"}
//                             </span>
//                         </div>

//                         {/* Students */}
//                         <p className="course-details-students">
//                             👥{" "}
//                             {students != null
//                                 ? `${students} students`
//                                 : "Student count unavailable"}
//                         </p>

//                         {/* Coupon validation */}
//                         <ApplyLmsCoupon
//                             courseId={courseId}
//                             coursePrice={course.price}
//                             onCouponValidated={setCouponResult}
//                         />

//                         {couponResult && (
//                             <p
//                                 role="status"
//                                 style={{
//                                     marginTop: "12px",
//                                     color: "#405538",
//                                     fontSize: "13px",
//                                 }}
//                             >
//                                 Coupon {couponResult.code} validated.
//                                 Payable amount: ₹
//                                 {Number(
//                                     couponResult.payable
//                                 ).toLocaleString("en-IN", {
//                                     maximumFractionDigits: 2,
//                                 })}
//                             </p>
//                         )}

//                         {/* Action buttons */}
//                         <div className="course-details-actions">
//                             {course.demoUrl && (
//                                 <a
//                                     href={course.demoUrl}
//                                     target="_blank"
//                                     rel="noopener noreferrer"
//                                     className="course-demo-button"
//                                 >
//                                     Watch Demo
//                                 </a>
//                             )}

//                             <button
//                                 type="button"
//                                 className="course-buy-button"
//                                 onClick={() => {
//                                     alert(
//                                         "Course purchase is not configured yet."
//                                     );
//                                 }}
//                             >
//                                 Buy Course
//                             </button>
//                         </div>
//                     </div>

//                     {/* Additional sections */}
//                     <div className="course-details-sections">

//                         {/* Benefits */}
//                         <section className="course-info-section">
//                             <h2>What You Will Learn</h2>

//                             {Array.isArray(benefits) &&
//                             benefits.length > 0 ? (
//                                 <ul className="course-info-list">
//                                     {benefits.map((benefit, index) => (
//                                         <li key={index}>
//                                             {typeof benefit === "string"
//                                                 ? benefit
//                                                 : benefit.title ||
//                                                   benefit.description ||
//                                                   JSON.stringify(benefit)}
//                                         </li>
//                                     ))}
//                                 </ul>
//                             ) : (
//                                 <p>No benefits added.</p>
//                             )}
//                         </section>

//                         {/* Prerequisites */}
//                         <section className="course-info-section">
//                             <h2>Prerequisites</h2>

//                             {Array.isArray(prerequisites) &&
//                             prerequisites.length > 0 ? (
//                                 <ul className="course-info-list">
//                                     {prerequisites.map((item, index) => (
//                                         <li key={index}>
//                                             {typeof item === "string"
//                                                 ? item
//                                                 : item.title ||
//                                                   item.description ||
//                                                   JSON.stringify(item)}
//                                         </li>
//                                     ))}
//                                 </ul>
//                             ) : (
//                                 <p>No prerequisites added.</p>
//                             )}
//                         </section>

//                         {/* Course content */}
//                         <section className="course-info-section">
//                             <h2>Course Content</h2>

//                             {Array.isArray(courseContent) &&
//                             courseContent.length > 0 ? (
//                                 <ul className="course-info-list">
//                                     {courseContent.map((item, index) => (
//                                         <li key={item._id || index}>
//                                             {typeof item === "string"
//                                                 ? item
//                                                 : item.title ||
//                                                   item.name ||
//                                                   `Lesson ${index + 1}`}
//                                         </li>
//                                     ))}
//                                 </ul>
//                             ) : (
//                                 <p>No course content available.</p>
//                             )}
//                         </section>

//                         {/* Reviews */}
//                         <section className="course-info-section">
//                             <h2>Reviews</h2>

//                             {Array.isArray(reviews) &&
//                             reviews.length > 0 ? (
//                                 reviews.map((review, index) => (
//                                     <div
//                                         className="course-review"
//                                         key={review._id || index}
//                                     >
//                                         <p>
//                                             <strong>
//                                                 {review.user?.name ||
//                                                     review.name ||
//                                                     "Student"}
//                                             </strong>
//                                         </p>

//                                         {review.rating != null && (
//                                             <p>
//                                                 ⭐ {review.rating}
//                                             </p>
//                                         )}

//                                         <p>
//                                             {review.comment ||
//                                                 review.review ||
//                                                 ""}
//                                         </p>
//                                     </div>
//                                 ))
//                             ) : (
//                                 <p>No reviews yet.</p>
//                             )}
//                         </section>

//                     </div>
//                 </article>
//             </div>
//         </main>
//     );
// }



// import { useEffect, useState } from "react";
// import { useParams, Link } from "react-router-dom";
// import axiosInstance from "../api/axios";
// import "./CourseDetails.css";

// export default function CourseDetails() {
//     const { id } = useParams();

//     const [course, setCourse] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");

//     useEffect(() => {
//         const fetchCourse = async () => {
//             try {
//                 setLoading(true);
//                 setError("");

//                 const response = await axiosInstance.get(
//                     `/course/get-course/${id}`
//                 );

//                 console.log("Course details:", response.data);

//                 setCourse(response.data.course);
//             } catch (err) {
//                 console.error(
//                     "Failed to fetch course:",
//                     err.response?.data || err.message
//                 );

//                 setError("Unable to load course details.");
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchCourse();
//     }, [id]);

//     if (loading) {
//         return (
//             <main className="course-details-page">
//                 <div className="course-details-loading">
//                     <div className="course-details-spinner"></div>
//                     <p>Loading course details...</p>
//                 </div>
//             </main>
//         );
//     }

//     if (error || !course) {
//         return (
//             <main className="course-details-page">
//                 <div className="course-details-error">
//                     <h2>Course unavailable</h2>
//                     <p>{error || "Course not found."}</p>

//                     <Link
//                         to="/courses"
//                         className="course-back-button"
//                     >
//                         Back to Courses
//                     </Link>
//                 </div>
//             </main>
//         );
//     }

//     // Course information
//     const imageUrl = course.thumbnail?.url;

//     const tags = Array.isArray(course.tags)
//         ? course.tags.join(", ")
//         : course.tags;

//     const rating =
//         course.ratings ??
//         course.rating ??
//         course.averageRating;

//     const students =
//         course.students ??
//         course.studentsCount ??
//         course.purchased ??
//         course.enrolledStudents;

//     const originalPrice =
//         course.estimatedPrice ??
//         course.originalPrice;

//     const benefits = course.benefits;
//     const prerequisites = course.prerequisites;
//     const courseContent = course.courseContent;
//     const reviews = course.reviews;

//     return (
//         <main className="course-details-page">
//             <div className="course-details-container">

//                 {/* Back link */}
//                 <Link
//                     to="/courses"
//                     className="course-back-link"
//                 >
//                     ← Back to Courses
//                 </Link>

//                 <article className="course-details-card">

//                     {/* Course image */}
//                     <div className="course-details-image-wrapper">
//                         {imageUrl ? (
//                             <img
//                                 src={imageUrl}
//                                 alt={course.name || "Course"}
//                                 className="course-details-image"
//                                 onError={(e) => {
//                                     e.currentTarget.style.display = "none";

//                                     const fallback =
//                                         e.currentTarget.parentElement?.querySelector(
//                                             ".course-details-image-fallback"
//                                         );

//                                     if (fallback) {
//                                         fallback.style.display = "flex";
//                                     }
//                                 }}
//                             />
//                         ) : null}

//                         <div
//                             className="course-details-image-fallback"
//                             style={{
//                                 display: imageUrl ? "none" : "flex",
//                             }}
//                         >
//                             <span>📚</span>
//                             <p>KitabiKeeda</p>
//                         </div>
//                     </div>

//                     {/* Course details */}
//                     <div className="course-details-content">
//                         {course.level && (
//                             <span className="course-level">
//                                 {course.level}
//                             </span>
//                         )}

//                         <h1>
//                             {course.name || "Untitled Course"}
//                         </h1>

//                         <p className="course-details-description">
//                             {course.description ||
//                                 "Explore this course and develop new skills."}
//                         </p>

//                         <div className="course-details-info">
//                             <p>
//                                 <strong>Level:</strong>{" "}
//                                 {course.level || "Not specified"}
//                             </p>

//                             {tags && (
//                                 <p>
//                                     <strong>Tags:</strong> {tags}
//                                 </p>
//                             )}
//                         </div>

//                         {/* Price */}
//                         <div className="course-details-price">
//                             <span>
//                                 ₹
//                                 {course.price != null
//                                     ? Number(course.price).toLocaleString(
//                                         "en-IN"
//                                     )
//                                     : "0"}
//                             </span>

//                             {originalPrice != null &&
//                                 Number(originalPrice) >
//                                     Number(course.price) && (
//                                     <del className="course-details-original-price">
//                                         ₹
//                                         {Number(originalPrice).toLocaleString(
//                                             "en-IN"
//                                         )}
//                                     </del>
//                                 )}
//                         </div>

//                         {/* Rating */}
//                         <div className="course-details-rating">
//                             <span className="rating-star">⭐</span>

//                             <span>
//                                 {rating != null &&
//                                 Number.isFinite(Number(rating))
//                                     ? Number(rating).toFixed(1)
//                                     : "0"}
//                             </span>
//                         </div>

//                         {/* Students */}
//                         <p className="course-details-students">
//                             👥{" "}
//                             {students != null
//                                 ? `${students} students`
//                                 : "Student count unavailable"}
//                         </p>

//                         {/* Action buttons */}
//                         <div className="course-details-actions">
//                             {course.demoUrl && (
//                                 <a
//                                     href={course.demoUrl}
//                                     target="_blank"
//                                     rel="noopener noreferrer"
//                                     className="course-demo-button"
//                                 >
//                                     Watch Demo
//                                 </a>
//                             )}

//                             <button
//                                 type="button"
//                                 className="course-buy-button"
//                                 onClick={() => {
//                                     alert(
//                                         "Course purchase is not configured yet."
//                                     );
//                                 }}
//                             >
//                                 Buy Course
//                             </button>
//                         </div>
//                     </div>

//                     {/* Additional sections */}
//                     <div className="course-details-sections">

//                         {/* Benefits */}
//                         <section className="course-info-section">
//                             <h2>What You Will Learn</h2>

//                             {Array.isArray(benefits) &&
//                             benefits.length > 0 ? (
//                                 <ul className="course-info-list">
//                                     {benefits.map((benefit, index) => (
//                                         <li key={index}>
//                                             {typeof benefit === "string"
//                                                 ? benefit
//                                                 : benefit.title ||
//                                                   benefit.description ||
//                                                   JSON.stringify(benefit)}
//                                         </li>
//                                     ))}
//                                 </ul>
//                             ) : (
//                                 <p>No benefits added.</p>
//                             )}
//                         </section>

//                         {/* Prerequisites */}
//                         <section className="course-info-section">
//                             <h2>Prerequisites</h2>

//                             {Array.isArray(prerequisites) &&
//                             prerequisites.length > 0 ? (
//                                 <ul className="course-info-list">
//                                     {prerequisites.map((item, index) => (
//                                         <li key={index}>
//                                             {typeof item === "string"
//                                                 ? item
//                                                 : item.title ||
//                                                   item.description ||
//                                                   JSON.stringify(item)}
//                                         </li>
//                                     ))}
//                                 </ul>
//                             ) : (
//                                 <p>No prerequisites added.</p>
//                             )}
//                         </section>

//                         {/* Course content */}
//                         <section className="course-info-section">
//                             <h2>Course Content</h2>

//                             {Array.isArray(courseContent) &&
//                             courseContent.length > 0 ? (
//                                 <ul className="course-info-list">
//                                     {courseContent.map((item, index) => (
//                                         <li key={item._id || index}>
//                                             {typeof item === "string"
//                                                 ? item
//                                                 : item.title ||
//                                                   item.name ||
//                                                   `Lesson ${index + 1}`}
//                                         </li>
//                                     ))}
//                                 </ul>
//                             ) : (
//                                 <p>No course content available.</p>
//                             )}
//                         </section>

//                         {/* Reviews */}
//                         <section className="course-info-section">
//                             <h2>Reviews</h2>

//                             {Array.isArray(reviews) &&
//                             reviews.length > 0 ? (
//                                 reviews.map((review, index) => (
//                                     <div
//                                         className="course-review"
//                                         key={review._id || index}
//                                     >
//                                         <p>
//                                             <strong>
//                                                 {review.user?.name ||
//                                                     review.name ||
//                                                     "Student"}
//                                             </strong>
//                                         </p>

//                                         {review.rating != null && (
//                                             <p>
//                                                 ⭐ {review.rating}
//                                             </p>
//                                         )}

//                                         <p>
//                                             {review.comment ||
//                                                 review.review ||
//                                                 ""}
//                                         </p>
//                                     </div>
//                                 ))
//                             ) : (
//                                 <p>No reviews yet.</p>
//                             )}
//                         </section>

//                     </div>
//                 </article>
//             </div>
//         </main>
//     );
// }
