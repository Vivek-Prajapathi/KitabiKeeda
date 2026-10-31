
import { BrowserRouter, Routes, Route } from "react-router-dom";

// My Learning and Instructor
import MyLearning from "./profile/MyLearning";
import Instructor from "./pages/Instructor";
// import LMSAdminCoupons from "./admin/LMSAdminCoupons";
// Public pages
import Home from "./pages/Home";
import Register from "./pages/Register";
import ActivateAccount from "./pages/ActivateAccount";
import Login from "./pages/Login";
import RegularCourses from "./pages/RegularCourses";
import CourseDetails from "./pages/CourseDetails";
import Dashboard from "./pages/Dashboard";

// LMS Marketplace and Admin Overview
import Courses from "./pages/Courses";
import LMSAdminOverview from "./admin/LMSAdminOverview";

// Profile components
import ProfileDashboard from "./profile/ProfileDashboard";
import ProfileContentIndex from "./profile/ProfileContentIndex";
import ProfileSettings from "./profile/ProfileSettings";
import UpdateProfileInfo from "./profile/UpdateProfileInfo";
import UpdatedProfilePicture from "./profile/UpdatedProfilePicture";
import UpdateProfilePassword from "./profile/UpdateProfilePassword";

// Common components
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// Admin components
import AdminHome from "./admin/AdminHome";
import AdminDashboard from "./admin/AdminDashboard";
import AdminContent from "./admin/AdminContent";
import GetAllUsers from "./admin/GetAllUsers";
import SingleUser from "./admin/SingleUser";
import ManageCourses from "./admin/ManageCourses";
import AdminOrders from "./admin/AdminOrders";
import AdminNotifications from "./admin/AdminNotifications";
import AdminAnalytics from "./admin/AdminAnalytics";
import AdminLayout from "./admin/AdminLayout";

export default function App() {
    return (
        <BrowserRouter>
            <Navbar />

            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register />} />
                <Route path="/activate" element={<ActivateAccount />} />
                <Route path="/login" element={<Login />} />

                {/* Regular Courses */}
                <Route
                    path="/courses"
                    element={<RegularCourses />}
                />

                <Route
                    path="/courses/:id"
                    element={<CourseDetails />}
                />

                {/* User Protected Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route
                        path="/dashboard"
                        element={<Dashboard />}
                    />

                    {/* My Learning */}
                    <Route
                        path="/profile/my-learning"
                        element={<MyLearning />}
                    />

                    {/* Instructor */}
                    <Route
                        path="/instructor"
                        element={<Instructor />}
                    />

                    {/* User Profile */}
                    <Route
                        path="/user/profile"
                        element={<ProfileDashboard />}
                    >
                        <Route
                            index
                            element={<ProfileContentIndex />}
                        />

                        <Route
                            path="settings"
                            element={<ProfileSettings />}
                        />

                        <Route
                            path="update-user-info"
                            element={<UpdateProfileInfo />}
                        />

                        <Route
                            path="update-profile-picture"
                            element={<UpdatedProfilePicture />}
                        />

                        <Route
                            path="update-password"
                            element={<UpdateProfilePassword />}
                        />
                    </Route>
                </Route>

                {/* Admin Protected Routes */}
                <Route
                    element={
                        <ProtectedRoute allowedRoles={["admin"]} />
                    }
                >
                    {/* LMS Marketplace */}
                    <Route
                        path="/admin/lms-marketplace"
                        element={<Courses />}
                    />
                    {/* <Route
                    path="lms-coupons"
                    element={<LMSAdminCoupons />}
                        /> */}

                    {/* Admin Dashboard with Sidebar */}
                    <Route
                        path="/admin"
                        element={<AdminDashboard />}
                    >
                        <Route
                            index
                            element={<AdminHome />}
                        />

                        {/* Users */}
                        <Route element={<AdminContent />}>
                            <Route
                                path="admin-dashboard"
                                element={<GetAllUsers />}
                            />

                            <Route
                                path="admin-dashboard/user/:id"
                                element={<SingleUser />}
                            />
                        </Route>

                        {/* Manage Courses */}
                        <Route
                            path="manage-courses"
                            element={<ManageCourses />}
                        />

                        {/* LMS Admin Overview */}
                        <Route
                            path="lms-admin"
                            element={<LMSAdminOverview />}
                        />

                        {/* Orders */}
                        <Route
                            path="orders"
                            element={<AdminOrders />}
                        />

                        {/* Notifications */}
                        <Route
                            path="notifications"
                            element={<AdminNotifications />}
                        />

                        {/* Analytics */}
                        <Route
                            path="analytics"
                            element={<AdminAnalytics />}
                        />

                        {/* Layout */}
                        <Route
                            path="layout"
                            element={<AdminLayout />}
                        />
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}


// import { BrowserRouter, Routes, Route } from "react-router-dom";

// // Public pages
// import Home from "./pages/Home";
// import Register from "./pages/Register";
// import ActivateAccount from "./pages/ActivateAccount";
// import Login from "./pages/Login";
// import RegularCourses from "./pages/RegularCourses";
// import CourseDetails from "./pages/CourseDetails";
// import Dashboard from "./pages/Dashboard";

// // LMS Marketplace
// import Courses from "./pages/Courses";
// import LMSAdminOverview from "./admin/LMSAdminOverview";

// // Profile components
// import ProfileDashboard from "./profile/ProfileDashboard";
// import ProfileContentIndex from "./profile/ProfileContentIndex";
// import ProfileSettings from "./profile/ProfileSettings";
// import UpdateProfileInfo from "./profile/UpdateProfileInfo";
// import UpdatedProfilePicture from "./profile/UpdatedProfilePicture";
// import UpdateProfilePassword from "./profile/UpdateProfilePassword";

// // Common components
// import Navbar from "./components/Navbar";
// import ProtectedRoute from "./components/ProtectedRoute";

// // Main admin components
// import AdminHome from "./admin/AdminHome";
// import AdminDashboard from "./admin/AdminDashboard";
// import AdminContent from "./admin/AdminContent";
// import GetAllUsers from "./admin/GetAllUsers";
// import SingleUser from "./admin/SingleUser";
// import ManageCourses from "./admin/ManageCourses";
// import AdminOrders from "./admin/AdminOrders";
// import AdminNotifications from "./admin/AdminNotifications";
// import AdminAnalytics from "./admin/AdminAnalytics";
// import AdminLayout from "./admin/AdminLayout";

// export default function App() {
//     return (
//         <BrowserRouter>
//             <Navbar />

//             <Routes>
//                 {/* Public Routes */}
//                 <Route path="/" element={<Home />} />
//                 <Route path="/register" element={<Register />} />
//                 <Route path="/activate" element={<ActivateAccount />} />
//                 <Route path="/login" element={<Login />} />

//                 {/* Regular Courses */}
//                 <Route
//                     path="/courses"
//                     element={<RegularCourses />}
//                 />

//                 <Route
//                     path="/courses/:id"
//                     element={<CourseDetails />}
//                 />

//                 {/* User Protected Routes */}
//                 <Route element={<ProtectedRoute />}>
//                     <Route
//                         path="/dashboard"
//                         element={<Dashboard />}
//                     />

//                     <Route
//                         path="/user/profile"
//                         element={<ProfileDashboard />}
//                     >
//                         <Route
//                             index
//                             element={<ProfileContentIndex />}
//                         />

//                         <Route
//                             path="settings"
//                             element={<ProfileSettings />}
//                         />

//                         <Route
//                             path="update-user-info"
//                             element={<UpdateProfileInfo />}
//                         />

//                         <Route
//                             path="update-profile-picture"
//                             element={<UpdatedProfilePicture />}
//                         />

//                         <Route
//                             path="update-password"
//                             element={<UpdateProfilePassword />}
//                         />
//                     </Route>
//                 </Route>

//                 {/* Admin Protected Routes */}
//                 <Route
//                     element={
//                         <ProtectedRoute allowedRoles={["admin"]} />
//                     }
//                 >
//                     {/* LMS Admin — separate management dashboard */}
//                     <Route
//                         path="/admin/lms-admin"
//                         element={<LMSAdminOverview />}
//                     />

//                     {/* LMS Marketplace — keep separate */}
//                     <Route
//                         path="/admin/lms-marketplace"
//                         element={<Courses />}
//                     />

//                     {/* Existing Main Admin Dashboard with sidebar */}
//                     <Route
//                         path="/admin"
//                         element={<AdminDashboard />}
//                     >
//                         <Route
//                             index
//                             element={<AdminHome />}
//                         />

//                         <Route element={<AdminContent />}>
//                             <Route
//                                 path="admin-dashboard"
//                                 element={<GetAllUsers />}
//                             />

//                             <Route
//                                 path="admin-dashboard/user/:id"
//                                 element={<SingleUser />}
//                             />
//                         </Route>

//                         <Route
//                             path="manage-courses"
//                             element={<ManageCourses />}
//                         />

//                         <Route
//                             path="orders"
//                             element={<AdminOrders />}
//                         />

//                         <Route
//                             path="notifications"
//                             element={<AdminNotifications />}
//                         />

//                         <Route
//                             path="analytics"
//                             element={<AdminAnalytics />}
//                         />

//                         <Route
//                             path="layout"
//                             element={<AdminLayout />}
//                         />
//                     </Route>
//                 </Route>
//             </Routes>
//         </BrowserRouter>
//     );
// }
// import { BrowserRouter, Routes, Route } from "react-router-dom";

// // Public pages
// import Home from "./pages/Home";
// import Register from "./pages/Register";
// import ActivateAccount from "./pages/ActivateAccount";
// import Login from "./pages/Login";
// import RegularCourses from "./pages/RegularCourses";
// import CourseDetails from "./pages/CourseDetails";
// import Dashboard from "./pages/Dashboard";

// // Existing LMS Marketplace
// import Courses from "./pages/Courses";

// // Profile components
// import ProfileDashboard from "./profile/ProfileDashboard";
// import ProfileContentIndex from "./profile/ProfileContentIndex";
// import ProfileSettings from "./profile/ProfileSettings";
// import UpdateProfileInfo from "./profile/UpdateProfileInfo";
// import UpdatedProfilePicture from "./profile/UpdatedProfilePicture";
// import UpdateProfilePassword from "./profile/UpdateProfilePassword";

// // Common components
// import Navbar from "./components/Navbar";
// import ProtectedRoute from "./components/ProtectedRoute";

// // Admin components
// import AdminHome from "./admin/AdminHome";
// import AdminDashboard from "./admin/AdminDashboard";
// import AdminContent from "./admin/AdminContent";
// import GetAllUsers from "./admin/GetAllUsers";
// import SingleUser from "./admin/SingleUser";
// import ManageCourses from "./admin/ManageCourses";
// import AdminOrders from "./admin/AdminOrders";
// import AdminNotifications from "./admin/AdminNotifications";
// import AdminAnalytics from "./admin/AdminAnalytics";
// import AdminLayout from "./admin/AdminLayout";

// export default function App() {
//     return (
//         <BrowserRouter>
//             <Navbar />

//             <Routes>
//                 {/* Public Routes */}
//                 <Route path="/" element={<Home />} />
//                 <Route path="/register" element={<Register />} />
//                 <Route path="/activate" element={<ActivateAccount />} />
//                 <Route path="/login" element={<Login />} />

//                 {/* Regular Courses Page */}
//                 <Route
//                     path="/courses"
//                     element={<RegularCourses />}
//                 />

//                 <Route
//                     path="/courses/:id"
//                     element={<CourseDetails />}
//                 />

//                 {/* User Protected Routes */}
//                 <Route element={<ProtectedRoute />}>
//                     <Route
//                         path="/dashboard"
//                         element={<Dashboard />}
//                     />

//                     <Route
//                         path="/user/profile"
//                         element={<ProfileDashboard />}
//                     >
//                         <Route
//                             index
//                             element={<ProfileContentIndex />}
//                         />

//                         <Route
//                             path="settings"
//                             element={<ProfileSettings />}
//                         />

//                         <Route
//                             path="update-user-info"
//                             element={<UpdateProfileInfo />}
//                         />

//                         <Route
//                             path="update-profile-picture"
//                             element={<UpdatedProfilePicture />}
//                         />

//                         <Route
//                             path="update-password"
//                             element={<UpdateProfilePassword />}
//                         />
//                     </Route>
//                 </Route>

//                 {/* Admin Protected Routes */}
//                 <Route
//                     element={
//                         <ProtectedRoute allowedRoles={["admin"]} />
//                     }
//                 >
//                     {/* LMS Marketplace WITHOUT AdminDashboard layout */}
//                     <Route
//                         path="/admin/lms-marketplace"
//                         element={<Courses />}
//                     />

//                     {/* All other admin pages WITH sidebar */}
//                     <Route
//                         path="/admin"
//                         element={<AdminDashboard />}
//                     >
//                         <Route
//                             index
//                             element={<AdminHome />}
//                         />

//                         <Route element={<AdminContent />}>
//                             <Route
//                                 path="admin-dashboard"
//                                 element={<GetAllUsers />}
//                             />

//                             <Route
//                                 path="admin-dashboard/user/:id"
//                                 element={<SingleUser />}
//                             />
//                         </Route>

//                         <Route
//                             path="manage-courses"
//                             element={<ManageCourses />}
//                         />

//                         <Route
//                             path="orders"
//                             element={<AdminOrders />}
//                         />

//                         <Route
//                             path="notifications"
//                             element={<AdminNotifications />}
//                         />

//                         <Route
//                             path="analytics"
//                             element={<AdminAnalytics />}
//                         />

//                         <Route
//                             path="layout"
//                             element={<AdminLayout />}
//                         />
//                     </Route>
//                 </Route>
//             </Routes>
//         </BrowserRouter>
//     );
// }


// import { BrowserRouter, Routes, Route } from "react-router-dom";

// import Home from "./pages/Home";
// import Register from "./pages/Register";
// import ActivateAccount from "./pages/ActivateAccount";
// import Login from "./pages/Login";
// import Dashboard from "./pages/Dashboard";
// import Courses from "./pages/Courses";
// import CourseDetails from "./pages/CourseDetails";

// // Profile components
// import ProfileDashboard from "./profile/ProfileDashboard";
// import ProfileContentIndex from "./profile/ProfileContentIndex";
// import ProfileSettings from "./profile/ProfileSettings";
// import UpdateProfileInfo from "./profile/UpdateProfileInfo";
// import UpdatedProfilePicture from "./profile/UpdatedProfilePicture";
// import UpdateProfilePassword from "./profile/UpdateProfilePassword";

// // Common components
// import Navbar from "./components/Navbar";
// import ProtectedRoute from "./components/ProtectedRoute";

// // Admin components
// import AdminHome from "./admin/AdminHome";
// import AdminDashboard from "./admin/AdminDashboard";
// import AdminContent from "./admin/AdminContent";
// import GetAllUsers from "./admin/GetAllUsers";
// import SingleUser from "./admin/SingleUser";
// import ManageCourses from "./admin/ManageCourses";
// import AdminOrders from "./admin/AdminOrders";
// import AdminNotifications from "./admin/AdminNotifications";
// import AdminAnalytics from "./admin/AdminAnalytics";
// import AdminLayout from "./admin/AdminLayout";

// export default function App() {
//     return (
//         <BrowserRouter>
//             <Navbar />

//             <Routes>
//                 {/* Public Routes */}
//                 <Route path="/" element={<Home />} />
//                 <Route path="/register" element={<Register />} />
//                 <Route path="/activate" element={<ActivateAccount />} />
//                 <Route path="/login" element={<Login />} />

//                 {/* Course Routes */}
//                 <Route path="/courses" element={<Courses />} />
//                 <Route path="/courses/:id" element={<CourseDetails />} />

//                 {/* User Protected Routes */}
//                 <Route element={<ProtectedRoute />}>
//                     <Route path="/dashboard" element={<Dashboard />} />

//                     {/* Profile Layout and Nested Routes */}
//                     <Route
//                         path="/user/profile"
//                         element={<ProfileDashboard />}
//                     >
//                         {/* Default Profile Page */}
//                         <Route
//                             index
//                             element={<ProfileContentIndex />}
//                         />

//                         {/* Profile Settings */}
//                         <Route
//                             path="settings"
//                             element={<ProfileSettings />}
//                         />

//                         {/* Update Profile Information */}
//                         <Route
//                             path="update-user-info"
//                             element={<UpdateProfileInfo />}
//                         />

//                         {/* Update Profile Picture */}
//                         <Route
//                             path="update-profile-picture"
//                             element={<UpdatedProfilePicture />}
//                         />

//                         {/* Update Password */}
//                         <Route
//                             path="update-password"
//                             element={<UpdateProfilePassword />}
//                         />
//                     </Route>
//                 </Route>

//                 {/* Admin Protected Routes */}
//                 <Route
//                     element={<ProtectedRoute allowedRoles={["admin"]} />}
//                 >
//                     <Route path="/admin" element={<AdminDashboard />}>
//                         <Route index element={<AdminHome />} />

//                         <Route element={<AdminContent />}>
//                             <Route
//                                 path="admin-dashboard"
//                                 element={<GetAllUsers />}
//                             />

//                             <Route
//                                 path="admin-dashboard/user/:id"
//                                 element={<SingleUser />}
//                             />
//                         </Route>

//                         <Route
//                             path="manage-courses"
//                             element={<ManageCourses />}
//                         />

//                         <Route
//                             path="orders"
//                             element={<AdminOrders />}
//                         />

//                         <Route
//                             path="notifications"
//                             element={<AdminNotifications />}
//                         />

//                         <Route
//                             path="analytics"
//                             element={<AdminAnalytics />}
//                         />

//                         <Route
//                             path="layout"
//                             element={<AdminLayout />}
//                         />
//                     </Route>
//                 </Route>
//             </Routes>
//         </BrowserRouter>
//     );
// }