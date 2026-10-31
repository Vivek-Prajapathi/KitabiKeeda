
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Styles from "./_admin.module.css";
import toast from "react-hot-toast";
import axiosInstance from "../api/axios";

const SingleUser = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [role, setRole] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const normalizedRole = role.trim().toLowerCase();

        if (!["admin", "user"].includes(normalizedRole)) {
            toast.error("Role must be admin or user.");
            return;
        }

        try {
            setLoading(true);

            await axiosInstance.put("/auth/update-user-roles", {
                id,
                role: normalizedRole,
            });

            toast.success("Role updated successfully");
            navigate("/admin/admin-dashboard");
        } catch (error) {
            console.error(
                "Error updating role:",
                error.response?.data || error.message
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to update role"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <aside className={Styles.content}>
            <main className={Styles.updateForm}>
                <h1>Update User Role</h1>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="role">Role</label>

                        <select
                            id="role"
                            value={role}
                            required
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="">Select role</option>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <button type="submit" disabled={loading}>
                            {loading ? "Updating..." : "Update Role"}
                        </button>
                    </div>
                </form>
            </main>
        </aside>
    );
};

export default SingleUser;

// import { useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import Styles from "./_admin.module.css";
// import toast from "react-hot-toast";
// import axiosInstance from "../api/axios";

// const SingleUser = () => {
//     const navigate = useNavigate();
//     const { id } = useParams();
//     const [role, setRole] = useState("");

//     const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//         await axiosInstance.put("/update-user-roles", {
//             id,
//             role
//         });

//         toast.success("Role updated successfully");
//         navigate("/admin/admin-dashboard");
//     } catch (error) {
//         console.error("Error updating role:", error);
//         toast.error(
//             error.response?.data?.message || "Failed to update role"
//         );
//     }
// };

//     return (
//         <aside className={Styles.content}>
//             <main className={Styles.updateForm}>
//                 <h1>Update User Role</h1>

//                 <form onSubmit={handleSubmit}>
//                     <div className="form-group">
//                         <label htmlFor="role">Role</label>
//                         <input
//                             id="role"
//                             type="text"
//                             value={role}
//                             placeholder="Enter role (admin/user)"
//                             required
//                             onChange={(e) => setRole(e.target.value)}
//                         />
//                     </div>

//                     <div className="form-group">
//                         <button type="submit">Update Role</button>
//                     </div>
//                 </form>
//             </main>
//         </aside>
//     );
// };

// export default SingleUser;
