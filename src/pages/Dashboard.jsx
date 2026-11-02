import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Award, Clock, TrendingUp, Play, ArrowRight, Settings } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { lmsAPI } from '../api/lms';

const Dashboard = () => {
  const { user } = useAuth();
  const [myLearning, setMyLearning] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchMyLearning = async () => {
      try {
        const response = await lmsAPI.getMyLearning();
        if (response.data?.success) {
          setMyLearning(response.data);
        }
      } catch (error) {
        console.error('Error fetching my learning:', error);
        setHasError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchMyLearning();
  }, []);

  const stats = [
    Array.isArray(myLearning?.enrolledCourses) && {
      label: 'Enrolled courses',
      value: myLearning.enrolledCourses.length,
      icon: BookOpen,
      tone: 'violet',
    },
    Array.isArray(myLearning?.certificates) && {
      label: 'Certificates',
      value: myLearning.certificates.length,
      icon: Award,
      tone: 'violet',
    },
    Number.isFinite(myLearning?.inProgress) && {
      label: 'In progress',
      value: myLearning.inProgress,
      icon: TrendingUp,
      tone: 'navy',
    },
  ].filter(Boolean);

  return (
    <div className="student-dashboard">
      {/* Welcome Section */}
      <div className="dashboard-welcome">
        <div>
          <span className="eyebrow eyebrow-muted">Your learning space</span>
          <h1>Welcome back, {user?.name?.split(' ')[0] || 'Learner'}.</h1>
          <p>Pick up where you left off, or find something new to explore.</p>
        </div>
        <Link to="/marketplace" className="button button-primary"><BookOpen size={17} /> Explore courses</Link>
      </div>

      {/* Stats Cards */}
      {stats.length > 0 && (
        <div className="dashboard-stats">
          {stats.map(({ label, value, icon: Icon, tone }) => (
            <div className="dashboard-stat-card" key={label}>
              <span className={`dashboard-stat-icon ${tone}`}><Icon size={20} /></span>
              <div><span>{label}</span><strong>{value}</strong></div>
            </div>
          ))}
        </div>
      )}

      {/* Continue Learning */}
      <div className="dashboard-panel">
        <div className="dashboard-panel-heading">
          <div><h2>Continue learning</h2><p>Your courses, ready when you are.</p></div>
          <Link
            to="/dashboard/profile/my-learning"
            className="text-link"
          >
            View all <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="learning-preview-list">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="h-16 w-16 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : hasError ? (
          <div className="dashboard-message dashboard-error">
            <BookOpen size={24} />
            <div><h3>Learning data isn’t available</h3><p>We couldn’t load your courses. Please refresh and try again.</p></div>
          </div>
        ) : myLearning?.enrolledCourses?.length > 0 ? (
          <div className="learning-preview-list">
            {myLearning.enrolledCourses.slice(0, 3).map((enrollment) => {
              const progress = enrollment.progress != null && Number.isFinite(Number(enrollment.progress))
                ? Math.max(0, Math.min(100, Number(enrollment.progress)))
                : null;
              const courseId = enrollment.courseId?._id || enrollment.courseId || enrollment.course?._id;
              return (
                <Link
                  key={enrollment._id}
                  to={`/marketplace/${courseId}`}
                  className="learning-preview"
                >
                  {enrollment.course?.thumbnail?.url ? (
                    <img
                      src={enrollment.course.thumbnail.url}
                      alt={enrollment.course.name}
                      className="h-16 w-16 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="h-16 w-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-8 w-8 text-indigo-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{enrollment.course?.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{progress == null ? 'Progress unavailable' : `${progress}% complete`}</span>
                      </span>
                    </div>
                    {progress != null && (
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <Play className="h-5 w-5 text-indigo-600" />
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses yet</h3>
            <p className="text-gray-600 mb-4">Start your learning journey by enrolling in a course</p>
            <Link
              to="/marketplace"
              className="inline-flex items-center space-x-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              <span>Explore Courses</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/marketplace"
          className="dashboard-action-card"
        >
          <div className="flex items-center space-x-4">
            <BookOpen className="h-10 w-10" />
            <div>
              <h3 className="font-semibold text-lg mb-1">Browse Courses</h3>
              <p className="text-indigo-100 text-sm">Discover new courses to learn</p>
            </div>
          </div>
        </Link>
        <Link
          to="/dashboard/profile/settings"
          className="dashboard-action-card dashboard-action-secondary"
        >
          <div className="flex items-center space-x-4">
            <Settings className="h-10 w-10" />
            <div>
              <h3 className="font-semibold text-lg mb-1">Account settings</h3>
              <p className="text-indigo-100 text-sm">Keep your profile up to date</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
