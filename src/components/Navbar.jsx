
import { NavLink, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function Navbar() {
    const navigate = useNavigate();
    const { token, user, logout } = useAuth();

    const isAdmin = user?.role === "admin";

    const avatarUrl =
        user?.avatar?.url ||
        user?.profilePicture?.url ||
        user?.profilePicture ||
        user?.avatarUrl ||
        user?.profileImage ||
        "";

    const displayName =
        user?.name ||
        user?.fullName ||
        user?.username ||
        user?.email ||
        "User";

    const initials = displayName
        .split(/[\s@._-]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("");

    const handleLogout = () => {
        logout();

        sessionStorage.removeItem("activationToken");
        sessionStorage.removeItem("activationCode");
        sessionStorage.removeItem("email");

        navigate("/login");
    };

    return (
        <>
            <style>{`
                .kk-navbar {
                    position: sticky;
                    top: 0;
                    z-index: 1000;

                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 24px;

                    width: 100%;
                    min-height: 82px;
                    padding: 12px clamp(20px, 3vw, 48px);
                    box-sizing: border-box;

                    background: #1b211a;
                    border-bottom: 4px solid #628141;
                    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.12);

                    font-family: Inter, -apple-system, BlinkMacSystemFont,
                        "Segoe UI", sans-serif;
                }

                .kk-navbar-brand {
                    display: inline-flex;
                    align-items: center;
                    gap: 9px;
                    flex-shrink: 0;

                    padding: 0;
                    border: 0;
                    background: transparent;
                    color: #ebd5ab;

                    font-family: inherit;
                    font-size: clamp(24px, 2.3vw, 32px);
                    font-weight: 800;
                    letter-spacing: -1.1px;
                    white-space: nowrap;

                    cursor: pointer;
                }

                .kk-navbar-brand-icon {
                    font-size: 0.85em;
                    letter-spacing: 0;
                }

                .kk-navbar-right {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    gap: clamp(14px, 2vw, 30px);
                    min-width: 0;
                }

                .kk-navbar-links {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    gap: 6px;
                }

                .kk-navbar-link {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;

                    min-height: 42px;
                    padding: 10px 15px;
                    border: 1px solid transparent;
                    border-radius: 10px;

                    color: #e8d6b2;
                    background: transparent;

                    font-family: inherit;
                    font-size: 15px;
                    font-weight: 600;
                    text-decoration: none;
                    white-space: nowrap;

                    transition: background 0.2s ease,
                        color 0.2s ease,
                        border-color 0.2s ease;
                }

                .kk-navbar-link:hover {
                    background: rgba(255, 255, 255, 0.07);
                    color: #ffffff;
                }

                .kk-navbar-link.active {
                    background: rgba(139, 174, 102, 0.13);
                    border-color: rgba(139, 174, 102, 0.22);
                    color: #a8ca85;
                }

                .kk-navbar-profile {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    flex-shrink: 0;
                }

                .kk-navbar-avatar {
                    display: grid;
                    place-items: center;
                    width: 46px;
                    height: 46px;
                    padding: 3px;
                    overflow: hidden;

                    border: 2px solid #789456;
                    border-radius: 50%;
                    background: #303a2c;
                    color: #34432d;
                    text-decoration: none;

                    box-shadow: 0 0 0 3px rgba(120, 148, 86, 0.12);
                    transition: border-color 0.2s ease,
                        box-shadow 0.2s ease,
                        transform 0.2s ease;
                }

                .kk-navbar-avatar:hover {
                    border-color: #c0d9a5;
                    box-shadow: 0 0 0 4px rgba(120, 148, 86, 0.22);
                    transform: translateY(-1px);
                }

                .kk-navbar-avatar-inner {
                    position: relative;
                    display: grid;
                    place-items: center;

                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                    border-radius: 50%;

                    background: #e9efdf;
                    font-size: 14px;
                    font-weight: 800;
                }

                .kk-navbar-avatar-inner img {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 50%;
                }

                .kk-navbar-chevron {
                    color: #a9bc96;
                    font-size: 11px;
                }

                .kk-navbar-logout {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;

                    min-height: 44px;
                    padding: 11px 23px;
                    border: 1px solid transparent;
                    border-radius: 11px;

                    background: #628141;
                    color: #ffffff;

                    font-family: inherit;
                    font-size: 14px;
                    font-weight: 700;
                    white-space: nowrap;
                    cursor: pointer;

                    transition: background 0.2s ease,
                        transform 0.2s ease;
                }

                .kk-navbar-logout:hover {
                    background: #789653;
                    transform: translateY(-1px);
                }

                @media (max-width: 950px) {
                    .kk-navbar {
                        flex-wrap: wrap;
                        gap: 12px;
                        padding: 13px 20px;
                    }

                    .kk-navbar-right {
                        flex-wrap: wrap;
                        gap: 10px;
                    }

                    .kk-navbar-links {
                        flex-wrap: wrap;
                    }
                }

                @media (max-width: 580px) {
                    .kk-navbar {
                        justify-content: center;
                    }

                    .kk-navbar-brand {
                        width: 100%;
                        justify-content: center;
                        font-size: 25px;
                    }

                    .kk-navbar-right {
                        width: 100%;
                        justify-content: center;
                    }

                    .kk-navbar-links {
                        justify-content: center;
                        gap: 2px;
                    }

                    .kk-navbar-link {
                        min-height: 38px;
                        padding: 8px 10px;
                        font-size: 13px;
                    }

                    .kk-navbar-avatar {
                        width: 40px;
                        height: 40px;
                    }

                    .kk-navbar-logout {
                        min-height: 39px;
                        padding: 9px 14px;
                    }
                }
            `}</style>

            <nav className="kk-navbar">
                <button
                    type="button"
                    className="kk-navbar-brand"
                    onClick={() => navigate("/")}
                    aria-label="KitabiKeeda home"
                >
                    KitabiKeeda
                    <span className="kk-navbar-brand-icon">📚</span>
                </button>

                <div className="kk-navbar-right">
                    <div className="kk-navbar-links">
                        <NavLink
                            to="/"
                            end
                            className={({ isActive }) =>
                                `kk-navbar-link${isActive ? " active" : ""}`
                            }
                        >
                            Home
                        </NavLink>

                        <NavLink
                            to="/courses"
                            end
                            className={({ isActive }) =>
                                `kk-navbar-link${isActive ? " active" : ""}`
                            }
                        >
                            Courses
                        </NavLink>

                        {token && isAdmin && (
                            <NavLink
                                to="/admin/lms-marketplace"
                                className={({ isActive }) =>
                                    `kk-navbar-link${isActive ? " active" : ""}`
                                }
                            >
                                LMS Marketplace
                            </NavLink>
                        )}

                        {token && (
                            <NavLink
                                to={isAdmin ? "/admin" : "/dashboard"}
                                end
                                className={({ isActive }) =>
                                    `kk-navbar-link${isActive ? " active" : ""}`
                                }
                            >
                                Dashboard
                            </NavLink>
                        )}

                        {!token && (
                            <>
                                <NavLink
                                    to="/register"
                                    className={({ isActive }) =>
                                        `kk-navbar-link${isActive ? " active" : ""}`
                                    }
                                >
                                    Register
                                </NavLink>

                                <NavLink
                                    to="/login"
                                    className={({ isActive }) =>
                                        `kk-navbar-link${isActive ? " active" : ""}`
                                    }
                                >
                                    Login
                                </NavLink>
                            </>
                        )}
                    </div>

                    {token && (
                        <>
                            <div className="kk-navbar-profile">
                                <NavLink
                                    to="/user/profile"
                                    className="kk-navbar-avatar"
                                    title={`Open ${displayName}'s profile`}
                                    aria-label="Open profile"
                                >
                                    <span className="kk-navbar-avatar-inner">
                                        {initials || "U"}

                                        {avatarUrl && (
                                            <img
                                                src={avatarUrl}
                                                alt=""
                                                onError={(event) => {
                                                    event.currentTarget.style.display =
                                                        "none";
                                                }}
                                            />
                                        )}
                                    </span>
                                </NavLink>

                                <span
                                    className="kk-navbar-chevron"
                                    aria-hidden="true"
                                >
                                    ▼
                                </span>
                            </div>

                            <button
                                type="button"
                                className="kk-navbar-logout"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </>
                    )}
                </div>
            </nav>
        </>
    );
}




// import { NavLink, useNavigate } from "react-router-dom";
// import useAuth from "../hooks/useAuth";

// export default function Navbar() {
//     const navigate = useNavigate();
//     const { token, user, logout } = useAuth();

//     const isAdmin = user?.role === "admin";

//     const handleLogout = () => {
//         logout();

//         sessionStorage.removeItem("activationToken");
//         sessionStorage.removeItem("activationCode");
//         sessionStorage.removeItem("email");

//         navigate("/login");
//     };

//     const getStyle = ({ isActive }) => ({
//         color: isActive ? "#8BAE66" : "#EBD5AB",
//         textDecoration: isActive ? "underline" : "none",
//         fontWeight: isActive ? "bold" : "500",
//     });

//     return (
//         <nav style={styles.navbar}>
//             <h2 style={styles.logo}>
//                 KitabiKeeda 📚🐛🧟
//             </h2>

//             <div style={styles.links}>
//                 <NavLink to="/" style={getStyle}>
//                     Home
//                 </NavLink>

//                 {!token && (
//                     <>
//                         <NavLink to="/register" style={getStyle}>
//                             Register
//                         </NavLink>

//                         <NavLink to="/activate" style={getStyle}>
//                             Activate Account
//                         </NavLink>

//                         <NavLink to="/login" style={getStyle}>
//                             Login
//                         </NavLink>
//                     </>
//                 )}

//                 {token && (
//                     <>
//                         {isAdmin ? (
//                             <NavLink to="/admin" style={getStyle}>
//                                 Admin Dashboard
//                             </NavLink>
//                         ) : (
//                             <NavLink to="/dashboard" style={getStyle}>
//                                 Dashboard
//                             </NavLink>
//                         )}

//                         <NavLink to="/user/profile" style={getStyle}>
//                             Profile
//                         </NavLink>

//                         <button
//                             onClick={handleLogout}
//                             style={styles.button}
//                         >
//                             Logout
//                         </button>
//                     </>
//                 )}
//             </div>
//         </nav>
//     );
// }

// const styles = {
//     navbar: {
//         display: "flex",
//         justifyContent: "space-between",
//         alignItems: "center",
//         flexWrap: "wrap",
//         gap: "15px",
//         padding: "15px 30px",
//         backgroundColor: "#1B211A",
//         color: "#EBD5AB",
//         borderBottom: "4px solid #628141",
//         boxSizing: "border-box",
//         width: "100%",
//     },

//     logo: {
//         margin: 0,
//         fontSize: "clamp(20px, 2.5vw, 32px)",
//         fontWeight: "800",
//         color: "#EBD5AB",
//     },

//     links: {
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         flexWrap: "wrap",
//         gap: "24px",
//     },

//     button: {
//         padding: "10px 20px",
//         backgroundColor: "#628141",
//         color: "#FFFFFF",
//         border: "none",
//         borderRadius: "8px",
//         fontSize: "16px",
//         fontWeight: "600",
//         cursor: "pointer",
//     },
// };
