import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ProtectedRoute } from '../components/ProtectedRoute';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import UserLayout from '../layouts/UserLayout';
import AdminLayout from '../layouts/AdminLayout';

// Public Pages
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ActivateAccount from '../pages/ActivateAccount';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';

// User Pages
import Dashboard from '../pages/Dashboard';
import Profile from '../profile/Profile';
import MyLearning from '../profile/MyLearning';
import ProfileSettings from '../profile/ProfileSettings';
import Orders from '../profile/Orders';

// Admin Pages
import AdminOverview from '../admin/pages/AdminOverview';
import AdminUsers from '../admin/pages/AdminUsers';
import AdminCourses from '../admin/pages/AdminCourses';
import AdminLayoutPage from '../admin/pages/AdminLayoutPage';
import AdminCoupons from '../admin/pages/AdminCoupons';
import AdminOrders from '../admin/pages/AdminOrders';
import AdminNotifications from '../admin/pages/AdminNotifications';
import AdminCourseForm from '../admin/pages/AdminCourseForm';

const AdminAnalytics = lazy(() => import('../admin/pages/AdminAnalytics'));
const CourseDetails = lazy(() => import('../pages/CourseDetails'));
const Courses = lazy(() => import('../pages/Courses'));
const Marketplace = lazy(() => import('../pages/Marketplace'));
const InstructorDashboard = lazy(() => import('../pages/InstructorDashboard'));
const AdminMarketplace = lazy(() => import('../admin/pages/AdminMarketplace'));
const AdminLMSAdmin = lazy(() => import('../admin/pages/AdminLMSAdmin'));

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route
              path="courses"
              element={
                <Suspense fallback={<div className="route-loading"><span className="loading-spinner" /> Loading courses…</div>}>
                  <Courses />
                </Suspense>
              }
            />
            <Route
              path="courses/:id"
              element={
                <Suspense fallback={<div className="route-loading"><span className="loading-spinner" /> Loading course…</div>}>
                  <CourseDetails />
                </Suspense>
              }
            />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="activate-account" element={<ActivateAccount />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route path="reset-password/:token" element={<ResetPassword />} />
          </Route>

          {/* User Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="profile/my-learning" element={<MyLearning />} />
            <Route path="profile/settings" element={<ProfileSettings />} />
            <Route path="orders" element={<Orders />} />
          </Route>

          <Route
            path="/instructor"
            element={
              <ProtectedRoute requireInstructor>
                <Suspense fallback={<div className="route-loading"><span className="loading-spinner" /> Loading instructor workspace…</div>}>
                  <InstructorDashboard />
                </Suspense>
              </ProtectedRoute>
            }
          />

          <Route
            path="/marketplace"
            element={
              <Suspense fallback={<div className="route-loading"><span className="loading-spinner" /> Loading LMS marketplace…</div>}>
                <Marketplace />
              </Suspense>
            }
          />
          <Route
            path="/marketplace/:id"
            element={
              <Suspense fallback={<div className="route-loading"><span className="loading-spinner" /> Loading course…</div>}>
                <CourseDetails />
              </Suspense>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminOverview />} />
            <Route
              path="analytics"
              element={
                <Suspense fallback={<div className="route-loading"><span className="loading-spinner" /> Loading analytics…</div>}>
                  <AdminAnalytics />
                </Suspense>
              }
            />
            <Route path="users" element={<AdminUsers />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="courses/create" element={<AdminCourseForm />} />
            <Route path="courses/edit/:id" element={<AdminCourseForm />} />
            <Route
              path="marketplace"
              element={
                <Suspense fallback={<div className="route-loading"><span className="loading-spinner" /> Loading LMS marketplace…</div>}>
                  <AdminMarketplace />
                </Suspense>
              }
            />
            <Route
              path="lms-admin"
              element={
                <Suspense fallback={<div className="route-loading"><span className="loading-spinner" /> Loading LMS administration…</div>}>
                  <AdminLMSAdmin />
                </Suspense>
              }
            />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="layout" element={<AdminLayoutPage />} />
          </Route>

          {/* Catch all - 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;
