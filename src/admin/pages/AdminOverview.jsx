import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, ShoppingCart } from 'lucide-react';
import { adminAPI } from '../../api/admin';

const AdminOverview = () => {
  const [stats, setStats] = useState({
    totalUsers: null,
    totalCourses: null,
    totalOrders: null,
  });
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, coursesRes, ordersRes] = await Promise.all([
          adminAPI.getAllUsers(),
          adminAPI.getAllCourses(),
          adminAPI.getAllOrders(),
        ]);

        if (usersRes.data.success) {
          setStats((prev) => ({
            ...prev,
            totalUsers: Array.isArray(usersRes.data.users) ? usersRes.data.users.length : null,
          }));
        }
        if (coursesRes.data.success) {
          setStats((prev) => ({
            ...prev,
            totalCourses: Array.isArray(coursesRes.data.courses) ? coursesRes.data.courses.length : null,
          }));
        }
        if (ordersRes.data.success) {
          setStats((prev) => ({
            ...prev,
            totalOrders: Array.isArray(ordersRes.data.orders) ? ordersRes.data.orders.length : null,
          }));
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        setHasError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'indigo',
    },
    {
      title: 'Total Courses',
      value: stats.totalCourses,
      icon: BookOpen,
      color: 'green',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'purple',
    },
  ];

  return (
    <div>
      <div className="page-heading">
        <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Overview</h1>
        <p className="text-gray-600">Dashboard overview and statistics</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat) => (
            <div key={stat.title} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <stat.icon
                  className={`h-8 w-8 ${
                    stat.color === 'indigo'
                      ? 'text-indigo-600'
                      : stat.color === 'green'
                      ? 'text-green-600'
                      : stat.color === 'purple'
                      ? 'text-purple-600'
                      : 'text-yellow-600'
                  }`}
                />
                <span className="text-sm text-gray-500">{stat.title}</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stat.value ?? '—'}</p>
            </div>
          ))}
        </div>
      )}

      {hasError && (
        <div className="state-card state-error admin-state-card">
          <p>Some dashboard totals could not be loaded. Check the relevant management pages for current data.</p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/users"
            className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
          >
            <Users className="h-6 w-6 text-indigo-600 mb-2" />
            <h3 className="font-medium text-gray-900">Manage Users</h3>
            <p className="text-sm text-gray-600">View and manage user accounts</p>
          </Link>
          <Link
            to="/admin/courses"
            className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
          >
            <BookOpen className="h-6 w-6 text-indigo-600 mb-2" />
            <h3 className="font-medium text-gray-900">Manage Courses</h3>
            <p className="text-sm text-gray-600">Create and edit courses</p>
          </Link>
          <Link
            to="/admin/orders"
            className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
          >
            <ShoppingCart className="h-6 w-6 text-indigo-600 mb-2" />
            <h3 className="font-medium text-gray-900">View Orders</h3>
            <p className="text-sm text-gray-600">Track and manage orders</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
