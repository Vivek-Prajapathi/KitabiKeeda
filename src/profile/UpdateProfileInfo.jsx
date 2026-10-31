import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Styles from "./_profile.module.css";
import useAuth from "../hooks/useAuth";
import { AuthContext } from "../context/AuthContext";

const UpdateProfileInfo = ({ onSuccess }) => {
    const navigate = useNavigate();
    const { updateUserInfo } = useContext(AuthContext);
    const { user } = useAuth();

    const [name, setName] = useState(user?.name || "");
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const trimmed = name.trim();

        if (!trimmed) {
            return toast.error("Name cannot be empty");
        }

        if (trimmed === user?.name) {
            return toast("Nothing to update");
        }

        try {
            setSaving(true);

            await updateUserInfo({ name: trimmed });

            toast.success("Profile updated successfully");

            if (onSuccess) {
                onSuccess();
            } else {
                navigate("/user/profile");
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                error.message ||
                "Failed to update profile"
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <aside className={Styles.content}>
            <main className={Styles.updateForm}>
                <h1>Update profile</h1>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>

                        <input
                            id="email"
                            type="text"
                            value={user?.email || ""}
                            disabled
                            readOnly
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="name">Name</label>

                        <input
                            id="name"
                            type="text"
                            value={name}
                            placeholder="Enter name"
                            required
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <button disabled={saving}>
                            {saving ? "Saving..." : "Update info"}
                        </button>
                    </div>
                </form>
            </main>
        </aside>
    );
};

export default UpdateProfileInfo;