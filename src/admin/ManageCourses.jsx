import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "https://mockapi-mauve.vercel.app/api/v1/course";

export default function ManageCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        estimatedPrice: "",
        level: "Beginner",
        tags: "",
        demoUrl: "",
        thumbnail: "",
    });

    const fetchCourses = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get(`${API_URL}/get-courses`);
            const data = response.data;

            const courseList = Array.isArray(data)
                ? data
                : data.courses || data.data || [];

            setCourses(courseList);
        } catch (err) {
            console.error(err);
            setError("Unable to load courses.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            const payload = {
                ...formData,
                price: Number(formData.price),
                estimatedPrice: formData.estimatedPrice
                    ? Number(formData.estimatedPrice)
                    : undefined,
                tags: formData.tags
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean),
            };

            await axios.post(`${API_URL}/create-course`, payload);

            setSuccess("Course created successfully!");
            setFormData({
                name: "",
                description: "",
                price: "",
                estimatedPrice: "",
                level: "Beginner",
                tags: "",
                demoUrl: "",
                thumbnail: "",
            });

            setShowForm(false);
            await fetchCourses();
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.message ||
                    "Unable to create course. Check the API requirements."
            );
        }
    };

    return (
        <div style={{ padding: "30px" }}>
            <h1>Manage Courses</h1>
            <p>View and manage all available courses.</p>

            <button
                onClick={() => {
                    setShowForm(!showForm);
                    setError("");
                    setSuccess("");
                }}
                style={buttonStyle}
            >
                {showForm ? "Cancel" : "+ Add Course"}
            </button>

            {success && <p style={{ color: "green" }}>{success}</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {showForm && (
                <form
                    onSubmit={handleSubmit}
                    style={{
                        display: "grid",
                        gap: "12px",
                        maxWidth: "600px",
                        margin: "25px 0",
                    }}
                >
                    <input
                        name="name"
                        placeholder="Course Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />

                    <textarea
                        name="description"
                        placeholder="Course Description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                    />

                    <input
                        name="price"
                        type="number"
                        min="0"
                        placeholder="Price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                    />

                    <input
                        name="estimatedPrice"
                        type="number"
                        min="0"
                        placeholder="Original Price (optional)"
                        value={formData.estimatedPrice}
                        onChange={handleChange}
                    />

                    <select
                        name="level"
                        value={formData.level}
                        onChange={handleChange}
                    >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                    </select>

                    <input
                        name="tags"
                        placeholder="Tags (comma separated)"
                        value={formData.tags}
                        onChange={handleChange}
                    />

                    <input
                        name="demoUrl"
                        type="url"
                        placeholder="Demo Video URL (optional)"
                        value={formData.demoUrl}
                        onChange={handleChange}
                    />

                    <input
                        name="thumbnail"
                        placeholder="Thumbnail URL (optional)"
                        value={formData.thumbnail}
                        onChange={handleChange}
                    />

                    <button type="submit" style={buttonStyle}>
                        Create Course
                    </button>
                </form>
            )}

            {loading ? (
                <p>Loading courses...</p>
            ) : courses.length === 0 ? (
                <p>No courses found.</p>
            ) : (
                <div style={{ overflowX: "auto", marginTop: "25px" }}>
                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                        }}
                    >
                        <thead>
                            <tr>
                                <th style={cellStyle}>Course Name</th>
                                <th style={cellStyle}>Price</th>
                                <th style={cellStyle}>Level</th>
                            </tr>
                        </thead>

                        <tbody>
                            {courses.map((course, index) => (
                                <tr key={course._id || course.id || index}>
                                    <td style={cellStyle}>
                                        {course.name || course.title || "N/A"}
                                    </td>
                                    <td style={cellStyle}>
                                        {course.price ?? "N/A"}
                                    </td>
                                    <td style={cellStyle}>
                                        {course.level || "N/A"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

const buttonStyle = {
    padding: "10px 18px",
    backgroundColor: "#6b8e4e",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
};

const cellStyle = {
    border: "1px solid #ddd",
    padding: "12px",
    textAlign: "left",
};