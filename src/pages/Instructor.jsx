

import { useCallback, useEffect, useState } from "react";
import {
    getInstructorCourses,
    createInstructorCourse,
    updateInstructorCourse,
} from "../api/lms";

const emptyForm = {
    name: "",
    description: "",
    price: "",
    estimatedPrice: "",
    thumbnailUrl: "",
    tags: "",
    level: "Beginner",
    demoUrl: "",
    benefits: "",
    prerequisites: "",
};

function getCourseList(payload, depth = 0) {
    if (Array.isArray(payload)) return payload;

    if (!payload || typeof payload !== "object" || depth > 5) {
        return [];
    }

    for (const key of ["courses", "items", "results"]) {
        if (Array.isArray(payload[key])) {
            return payload[key];
        }
    }

    if (Array.isArray(payload.data)) {
        return payload.data;
    }

    for (const key of ["data", "result", "payload"]) {
        const result = getCourseList(payload[key], depth + 1);
        if (result.length) return result;
    }

    return [];
}

function courseId(course) {
    return course?._id ?? course?.id ?? course?.courseId ?? "";
}

function getMessage(error) {
    return (
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Something went wrong."
    );
}

function toTitles(value) {
    if (!Array.isArray(value)) return "";

    return value
        .map((item) =>
            typeof item === "string" ? item : item?.title || ""
        )
        .filter(Boolean)
        .join("\n");
}

function inputValue(value) {
    return value == null ? "" : String(value);
}

function normalizeCourse(course) {
    const thumbnail = course?.thumbnail;

    return {
        name: course?.name || course?.title || "",
        description: course?.description || "",
        price: inputValue(course?.price),
        estimatedPrice: inputValue(course?.estimatedPrice),
        thumbnailUrl:
            typeof thumbnail === "string"
                ? thumbnail
                : thumbnail?.url || "",
        tags: Array.isArray(course?.tags)
            ? course.tags.join(", ")
            : course?.tags || "",
        level: course?.level || "Beginner",
        demoUrl: course?.demoUrl || "",
        benefits: toTitles(course?.benefits),
        prerequisites: toTitles(course?.prerequisites),
    };
}

function toTitleObjects(value) {
    return value
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((title) => ({ title }));
}

function buildPayload(form) {
    const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        thumbnail: {
            public_id: "",
            url: form.thumbnailUrl.trim(),
        },
        tags: form.tags.trim(),
        level: form.level,
        demoUrl: form.demoUrl.trim(),
        benefits: toTitleObjects(form.benefits),
        prerequisites: toTitleObjects(form.prerequisites),
    };

    if (form.estimatedPrice.trim() !== "") {
        payload.estimatedPrice = Number(form.estimatedPrice);
    }

    return payload;
}

export default function Instructor() {
    const [courses, setCourses] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    const loadCourses = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getInstructorCourses();
            setCourses(getCourseList(response));
        } catch (err) {
            console.error(
                "Instructor courses error:",
                err.response?.data || err.message
            );

            const status = err.response?.status;

            if (status === 401) {
                setError(
                    "Please log in again. Your login session may have expired."
                );
            } else if (status === 403) {
                setError(
                    "Instructor or admin access is required to manage courses."
                );
            } else {
                setError(getMessage(err));
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCourses();
    }, [loadCourses]);

    const changeField = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId("");
    };

    const startEdit = (course) => {
        setEditingId(String(courseId(course)));
        setForm({
            ...emptyForm,
            ...normalizeCourse(course),
        });
        setNotice("");
        setError("");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setNotice("");

        if (!form.name.trim() || !form.description.trim()) {
            setError("Course name and description are required.");
            return;
        }

        if (
            form.price.trim() === "" ||
            !Number.isFinite(Number(form.price)) ||
            Number(form.price) < 0
        ) {
            setError("Enter a valid course price.");
            return;
        }

        if (
            form.estimatedPrice.trim() !== "" &&
            (!Number.isFinite(Number(form.estimatedPrice)) ||
                Number(form.estimatedPrice) < 0)
        ) {
            setError("Enter a valid estimated price.");
            return;
        }

        const payload = buildPayload(form);

        try {
            setSaving(true);

            if (editingId) {
                await updateInstructorCourse(editingId, payload);
                setNotice("Course updated successfully.");
            } else {
                await createInstructorCourse(payload);
                setNotice("Course created as a draft successfully.");
            }

            resetForm();
            await loadCourses();
        } catch (err) {
            console.error(
                "Instructor course save error:",
                err.response?.data || err.message
            );

            setError(getMessage(err));
        } finally {
            setSaving(false);
        }
    };

    return (
        <main className="instructor-page">
            <style>{`
                .instructor-page {
                    min-height: 100vh;
                    padding: 34px clamp(16px, 4vw, 52px) 60px;
                    background: #f7f5ec;
                    color: #263522;
                    font-family: Inter, -apple-system, BlinkMacSystemFont,
                        "Segoe UI", sans-serif;
                    box-sizing: border-box;
                }

                .instructor-page *,
                .instructor-page *::before,
                .instructor-page *::after {
                    box-sizing: border-box;
                }

                .instructor-hero {
                    padding: clamp(24px, 4vw, 42px);
                    border-radius: 22px;
                    background: linear-gradient(120deg, #1b211a, #405538);
                    color: #fffdf5;
                    margin-bottom: 26px;
                }

                .instructor-eyebrow {
                    margin: 0 0 10px;
                    color: #d7e5c8;
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: 2px;
                }

                .instructor-hero h1 {
                    margin: 0 0 12px;
                    font-size: clamp(28px, 4vw, 42px);
                }

                .instructor-hero p:last-child {
                    margin: 0;
                    max-width: 680px;
                    color: #e1e8d8;
                    line-height: 1.7;
                }

                .instructor-panel {
                    padding: clamp(18px, 3vw, 30px);
                    margin-bottom: 25px;
                    background: #fffdf7;
                    border: 1px solid #e3e5d8;
                    border-radius: 18px;
                }

                .instructor-panel h2 {
                    margin: 0 0 20px;
                    font-size: 23px;
                }

                .instructor-form-grid {
                    display: grid;
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    gap: 17px;
                }

                .instructor-field {
                    display: flex;
                    flex-direction: column;
                    gap: 7px;
                    min-width: 0;
                }

                .instructor-field.full {
                    grid-column: 1 / -1;
                }

                .instructor-field label {
                    color: #53604b;
                    font-size: 13px;
                    font-weight: 700;
                }

                .instructor-field input,
                .instructor-field select,
                .instructor-field textarea {
                    width: 100%;
                    padding: 12px 13px;
                    border: 1px solid #dce3d4;
                    border-radius: 9px;
                    background: #fbfcf9;
                    color: #263522;
                    font: inherit;
                    font-size: 14px;
                }

                .instructor-field textarea {
                    min-height: 90px;
                    resize: vertical;
                }

                .instructor-actions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    margin-top: 20px;
                }

                .instructor-btn {
                    padding: 11px 17px;
                    border: 1px solid #d6dfcb;
                    border-radius: 9px;
                    background: #eef2e7;
                    color: #43563a;
                    font: inherit;
                    font-size: 13px;
                    font-weight: 800;
                    cursor: pointer;
                }

                .instructor-btn.primary {
                    background: #628141;
                    border-color: #628141;
                    color: white;
                }

                .instructor-btn:disabled {
                    opacity: .6;
                    cursor: wait;
                }

                .instructor-message {
                    margin: 0 0 18px;
                    padding: 13px 15px;
                    border-radius: 9px;
                    font-size: 13px;
                    line-height: 1.6;
                }

                .instructor-message.error {
                    background: #fff0ec;
                    color: #963b2d;
                    border: 1px solid #f0c9c1;
                }

                .instructor-message.success {
                    background: #edf5e8;
                    color: #426331;
                    border: 1px solid #d2e2c6;
                }

                .instructor-course-grid {
                    display: grid;
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                    gap: 16px;
                }

                .instructor-course-card {
                    min-width: 0;
                    padding: 19px;
                    background: #fffdf7;
                    border: 1px solid #e3e5d8;
                    border-radius: 15px;
                }

                .instructor-course-card h3 {
                    margin: 0 0 9px;
                    overflow-wrap: anywhere;
                    font-size: 17px;
                }

                .instructor-course-card p {
                    color: #68715f;
                    font-size: 13px;
                    line-height: 1.6;
                    overflow-wrap: anywhere;
                }

                .instructor-status {
                    display: inline-block;
                    margin-bottom: 10px;
                    padding: 5px 9px;
                    border-radius: 20px;
                    background: #f4eddb;
                    color: #78632e;
                    font-size: 10px;
                    font-weight: 800;
                }

                .instructor-empty {
                    padding: 24px;
                    border: 1px dashed #d5dfc9;
                    border-radius: 12px;
                    color: #68715f;
                    text-align: center;
                    line-height: 1.7;
                }

                @media (max-width: 900px) {
                    .instructor-course-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                    }
                }

                @media (max-width: 600px) {
                    .instructor-form-grid,
                    .instructor-course-grid {
                        grid-template-columns: 1fr;
                    }

                    .instructor-field.full {
                        grid-column: auto;
                    }
                }
            `}</style>

            <section className="instructor-hero">
                <p className="instructor-eyebrow">
                    KITABIKEEDA / INSTRUCTOR STUDIO
                </p>

                <h1>Instructor Workspace</h1>

                <p>
                    Create draft courses, review your course list
                    and update your course information.
                </p>
            </section>

            {error && (
                <div className="instructor-message error" role="alert">
                    {error}
                </div>
            )}

            {notice && (
                <div className="instructor-message success" role="status">
                    {notice}
                </div>
            )}

            <section className="instructor-panel">
                <h2>
                    {editingId ? "Update Course" : "Create a Course"}
                </h2>

                <form onSubmit={handleSubmit}>
                    <div className="instructor-form-grid">
                        <div className="instructor-field full">
                            <label htmlFor="course-name">Course name *</label>
                            <input
                                id="course-name"
                                name="name"
                                value={form.name}
                                onChange={changeField}
                                placeholder="e.g. Full Stack Development"
                                required
                            />
                        </div>

                        <div className="instructor-field full">
                            <label htmlFor="course-description">
                                Description *
                            </label>
                            <textarea
                                id="course-description"
                                name="description"
                                value={form.description}
                                onChange={changeField}
                                placeholder="Describe what learners will learn..."
                                required
                            />
                        </div>

                        <div className="instructor-field">
                            <label htmlFor="course-price">Price *</label>
                            <input
                                id="course-price"
                                name="price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.price}
                                onChange={changeField}
                                required
                            />
                        </div>

                        <div className="instructor-field">
                            <label htmlFor="course-estimated-price">
                                Estimated / original price
                            </label>
                            <input
                                id="course-estimated-price"
                                name="estimatedPrice"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.estimatedPrice}
                                onChange={changeField}
                            />
                        </div>

                        <div className="instructor-field full">
                            <label htmlFor="course-thumbnail">
                                Thumbnail image URL
                            </label>
                            <input
                                id="course-thumbnail"
                                name="thumbnailUrl"
                                type="url"
                                value={form.thumbnailUrl}
                                onChange={changeField}
                                placeholder="https://..."
                            />
                        </div>

                        <div className="instructor-field">
                            <label htmlFor="course-level">Level</label>
                            <select
                                id="course-level"
                                name="level"
                                value={form.level}
                                onChange={changeField}
                            >
                                <option>Beginner</option>
                                <option>Intermediate</option>
                                <option>Advanced</option>
                            </select>
                        </div>

                        <div className="instructor-field">
                            <label htmlFor="course-tags">
                                Tags (comma-separated)
                            </label>
                            <input
                                id="course-tags"
                                name="tags"
                                value={form.tags}
                                onChange={changeField}
                                placeholder="react, nodejs, typescript"
                            />
                        </div>

                        <div className="instructor-field full">
                            <label htmlFor="course-demo">
                                Demo URL
                            </label>
                            <input
                                id="course-demo"
                                name="demoUrl"
                                type="url"
                                value={form.demoUrl}
                                onChange={changeField}
                                placeholder="https://..."
                            />
                        </div>

                        <div className="instructor-field">
                            <label htmlFor="course-benefits">
                                Benefits (one per line)
                            </label>
                            <textarea
                                id="course-benefits"
                                name="benefits"
                                value={form.benefits}
                                onChange={changeField}
                                placeholder={"Source code included\nProject practice"}
                            />
                        </div>

                        <div className="instructor-field">
                            <label htmlFor="course-prerequisites">
                                Prerequisites (one per line)
                            </label>
                            <textarea
                                id="course-prerequisites"
                                name="prerequisites"
                                value={form.prerequisites}
                                onChange={changeField}
                                placeholder="Basic JavaScript knowledge"
                            />
                        </div>
                    </div>

                    <div className="instructor-actions">
                        <button
                            className="instructor-btn primary"
                            type="submit"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : editingId
                                    ? "Update Course"
                                    : "Create Draft"}
                        </button>

                        {editingId && (
                            <button
                                className="instructor-btn"
                                type="button"
                                onClick={resetForm}
                                disabled={saving}
                            >
                                Cancel Edit
                            </button>
                        )}

                        <button
                            className="instructor-btn"
                            type="button"
                            onClick={loadCourses}
                            disabled={loading || saving}
                        >
                            Refresh Courses
                        </button>
                    </div>
                </form>
            </section>

            <section className="instructor-panel">
                <h2>My Courses</h2>

                {loading ? (
                    <p>Loading your courses...</p>
                ) : courses.length === 0 ? (
                    <div className="instructor-empty">
                        No instructor courses were returned by the API.
                        Create your first draft above.
                    </div>
                ) : (
                    <div className="instructor-course-grid">
                        {courses.map((course, index) => {
                            const id = courseId(course);
                            const status =
                                course.status ||
                                course.lifecycleStatus ||
                                course.state ||
                                "DRAFT";

                            return (
                                <article
                                    className="instructor-course-card"
                                    key={id || index}
                                >
                                    <span className="instructor-status">
                                        {String(status).toUpperCase()}
                                    </span>

                                    <h3>
                                        {course.name ||
                                            course.title ||
                                            "Untitled Course"}
                                    </h3>

                                    <p>
                                        {course.description ||
                                            "No description provided."}
                                    </p>

                                    <p>
                                        Price: ₹{course.price ?? 0}
                                    </p>

                                    {id && (
                                        <button
                                            className="instructor-btn"
                                            type="button"
                                            onClick={() => startEdit(course)}
                                        >
                                            Edit Course
                                        </button>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </main>
    );
}
