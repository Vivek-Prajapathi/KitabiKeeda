import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyticsAPI } from '../../api/analytics';

const AdminAnalytics = () => {
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [courseAnalytics, setCourseAnalytics] = useState(null);
  const [orderAnalytics, setOrderAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [usersRes, coursesRes, ordersRes] = await Promise.all([
          analyticsAPI.getUserAnalytics(),
          analyticsAPI.getCourseAnalytics(),
          analyticsAPI.getOrderAnalytics(),
        ]);

        if (usersRes.data.success) {
          setUserAnalytics(usersRes.data.users);
        }
        if (coursesRes.data.success) {
          setCourseAnalytics(coursesRes.data.courses);
        }
        if (ordersRes.data.success) {
          setOrderAnalytics(ordersRes.data.orders);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setHasError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-64 bg-white rounded-lg shadow-sm p-6 animate-pulse"></div>
        <div className="h-64 bg-white rounded-lg shadow-sm p-6 animate-pulse"></div>
        <div className="h-64 bg-white rounded-lg shadow-sm p-6 animate-pulse"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-heading">
        <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600">View platform analytics and trends</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* User Analytics */}
        {Array.isArray(userAnalytics?.last12Months) && userAnalytics.last12Months.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">User Signups (Last 12 Months)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userAnalytics.last12Months}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Course Analytics */}
        {courseAnalytics && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Course Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-indigo-600">{Number.isFinite(courseAnalytics.total) ? courseAnalytics.total : '—'}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Published</p>
                <p className="text-2xl font-bold text-green-600">{Number.isFinite(courseAnalytics.published) ? courseAnalytics.published : '—'}</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-gray-600">Draft</p>
                <p className="text-2xl font-bold text-yellow-600">{Number.isFinite(courseAnalytics.draft) ? courseAnalytics.draft : '—'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Order Analytics */}
        {orderAnalytics && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-purple-600">{Number.isFinite(orderAnalytics.total) ? orderAnalytics.total : '—'}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{Number.isFinite(orderAnalytics.completed) ? orderAnalytics.completed : '—'}</p>
              </div>
              {Number.isFinite(orderAnalytics.revenue) && <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${orderAnalytics.revenue.toFixed(2)}
                </p>
              </div>}
            </div>
          </div>
        )}
      </div>
      {hasError && !userAnalytics && !courseAnalytics && !orderAnalytics && (
        <div className="state-card state-error admin-state-card">
          <p>Analytics could not be loaded. Please try again later.</p>
        </div>
      )}
      {!userAnalytics && !courseAnalytics && !orderAnalytics && !hasError && (
        <div className="state-card admin-state-card"><p>No analytics data is available yet.</p></div>
      )}
    </div>
  );
};

export default AdminAnalytics;
