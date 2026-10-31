
import useAuth from "../hooks/useAuth";
import "./Profile.css";

export default function Profile() {
    const { user } = useAuth();

    if (!user) {
        return <p className="profile-loading">Loading profile...</p>;
    }

    return (
        <main className="profile-page">
            <section className="profile-card">
                <div className="profile-header">
                    <div className="profile-avatar">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>

                    <h1>My Profile</h1>
                    <p>Your KitabiKeeda account details</p>
                </div>

                <div className="profile-details">
                    <div className="profile-item">
                        <span>Full Name</span>
                        <strong>{user.name || "Not available"}</strong>
                    </div>

                    <div className="profile-item">
                        <span>Email Address</span>
                        <strong>{user.email || "Not available"}</strong>
                    </div>

                    <div className="profile-item">
                        <span>Account Role</span>
                        <strong className="profile-role">
                            {user.role || "User"}
                        </strong>
                    </div>
                </div>
            </section>
        </main>
    );
}
