import { Link, NavLink } from "react-router-dom";
import { FaPencilAlt } from "react-icons/fa";
import { HiOutlinePencilAlt } from "react-icons/hi";

import Styles from "./_profile.module.css";
import useAuth from "../hooks/useAuth";

const ProfileSidebar = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === "admin";

    const linkClass = ({ isActive }) =>
        isActive
            ? `${Styles.sidebarLink} ${Styles.sidebarLinkActive}`
            : Styles.sidebarLink;

    return (
        <aside className={Styles.sidebar}>
            <picture>
                <Link
                    to="/user/profile/settings?tab=picture"
                    className={Styles.profilePic}
                >
                    <HiOutlinePencilAlt />
                    <img
                        src={user?.avatar?.url || "/avatar-placeholder.svg"}
                        alt="avatar"
                    />
                </Link>
            </picture>

            <figcaption>
                <Link to="/user/profile/settings?tab=info">
                    <span className={Styles.icon}>
                        <FaPencilAlt />
                    </span>
                </Link>

                <h1>{user?.name}</h1>
            </figcaption>

            <nav className={Styles.sidebarNav}>
                <NavLink
                    to="/user/profile"
                    end
                    className={linkClass}
                >
                    {isAdmin ? "Overview" : "My Learning"}
                </NavLink>

                <NavLink
                    to="/user/profile/settings"
                    className={linkClass}
                >
                    Profile Settings
                </NavLink>
            </nav>
        </aside>
    );
};

export default ProfileSidebar;