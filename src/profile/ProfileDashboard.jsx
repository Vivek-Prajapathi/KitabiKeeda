import { Outlet } from "react-router-dom";
import ProfileSidebar from "./ProfileSidebar";
import Styles from "./_profile.module.css";

/*
  Layout for everything under /user/profile.
  Outlet renders the nested profile pages.
*/

const ProfileDashboard = () => {
    return (
        <section className={Styles.profileDashboard}>
            <div className={Styles.container}>
                <ProfileSidebar />

                <div className={Styles.main}>
                    <Outlet />
                </div>
            </div>
        </section>
    );
};

export default ProfileDashboard;