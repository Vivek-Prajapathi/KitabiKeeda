import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Award, Users, Play, Heart, ArrowLeft } from 'lucide-react';
import { lmsAPI } from '../api/lms';
import { courseAPI } from '../api/course';
import LMSNavigation from '../components/LMSNavigation';
import { useAuth } from '../hooks/useAuth';
import { Toaster, toast } from 'sonner';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isMarketplace = location.pathname.startsWith('/marketplace/');
  const coursesPath = isMarketplace ? '/marketplace' : '/courses';
  const { isAuthenticated, user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlistSaved, setWishlistSaved] = useState(false);
  const [wishlistOwner, setWishlistOwner] = useState(null);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const wishlistUserId = user?._id || user?.id;
  const isWishlistSaved = isAuthenticated && wishlistOwner === wishlistUserId && wishlistSaved;

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = isMarketplace
          ? await lmsAPI.getCourseDetail(id)
          : await courseAPI.getCourse(id);
        const detail = response.data?.course
          || response.data?.data?.course
          || response.data?.data
          || response.data;
        if (detail && (detail._id || detail.name)) {
          setCourse(detail);
        } else {
          setError('Course not found');
        }
      } catch (err) {
        setError('Failed to load course details');
        console.error('Error fetching course:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, isMarketplace]);

  useEffect(() => {
    let active = true;
    if (!isMarketplace || !isAuthenticated) return () => { active = false; };

    lmsAPI.getWishlist()
      .then((response) => {
        const data = response.data;
        const values = Array.isArray(data) ? data : data?.wishlist || data?.courses || [];
        const entries = Array.isArray(values) ? values : [];
        const saved = entries.some((entry) => {
          const courseId = entry.courseId?._id || entry.courseId || entry.course?._id || entry._id;
          return String(courseId) === String(id);
        });
        if (active) {
          setWishlistSaved(saved);
          setWishlistOwner(wishlistUserId);
        }
      })
      .catch((wishlistError) => {
        console.error('Error fetching wishlist:', wishlistError);
      });

    return () => { active = false; };
  }, [id, isAuthenticated, isMarketplace, wishlistUserId]);

  const handleEnroll = () => {
    if (!isAuthenticated) {
      toast.error('Please login to enroll in this course');
      navigate('/login');
      return;
    }
    toast.info('Checkout is not available in this version yet.');
  };

  const handleWishlistToggle = async () => {
    if (!isMarketplace) return;
    if (!isAuthenticated) {
      toast.error('Please sign in to save this course');
      navigate('/login');
      return;
    }

    setWishlistLoading(true);
    try {
      const response = await lmsAPI.toggleWishlist({ courseId: id });
      if (typeof response.data?.wishlisted !== 'boolean') {
        throw new Error('The wishlist response did not include its updated status.');
      }
      setWishlistSaved(response.data.wishlisted);
      setWishlistOwner(wishlistUserId);
      toast.success(response.data.wishlisted ? 'Course saved to your wishlist' : 'Course removed from your wishlist');
    } catch (wishlistError) {
      console.error('Error updating wishlist:', wishlistError);
      toast.error(wishlistError.response?.data?.message || 'Unable to update your wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`${isMarketplace ? 'lms-area' : ''} min-h-screen bg-gray-50 flex flex-col items-center justify-center`}>
        {isMarketplace && <Toaster position="top-right" richColors />}
        {isMarketplace && <LMSNavigation />}
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className={`${isMarketplace ? 'lms-area' : ''} min-h-screen bg-gray-50 flex flex-col items-center justify-center`}>
        {isMarketplace && <Toaster position="top-right" richColors />}
        {isMarketplace && <LMSNavigation />}
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Course Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The course you are looking for does not exist.'}</p>
          <Link
            to={coursesPath}
            className="inline-flex items-center space-x-2 text-indigo-600 font-medium hover:text-indigo-700"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Courses</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isMarketplace ? 'lms-area' : ''} min-h-screen bg-gray-50`}>
      {isMarketplace && <Toaster position="top-right" richColors />}
      {isMarketplace && <LMSNavigation />}
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to={coursesPath}
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-indigo-600"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Courses</span>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Image/Video */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              {course.thumbnail?.url ? (
                <img
                  src={course.thumbnail.url}
                  alt={course.name}
                  className="w-full h-96 object-cover"
                />
              ) : (
                <div className="w-full h-96 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                  <BookOpen className="h-24 w-24 text-indigo-400" />
                </div>
              )}
              {course.demoUrl && (
                <div className="p-4">
                  <a
                    href={course.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-indigo-600 font-medium hover:text-indigo-700"
                  >
                    <Play className="h-5 w-5" />
                    <span>Watch Demo</span>
                  </a>
                </div>
              )}
            </div>

            {/* Course Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center space-x-2 mb-4">
                {course.level && (
                  <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded">
                    {course.level}
                  </span>
                )}
                {course.rating != null && (
                  <div className="flex items-center space-x-1">
                    <Award className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-900">{course.rating}</span>
                  </div>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.name}</h1>
              <p className="text-gray-600 mb-6">{course.description}</p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {course.purchased > 0 && (
                  <div className="text-center">
                    <Users className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Students</p>
                    <p className="font-semibold text-gray-900">{course.purchased}</p>
                  </div>
                )}
                {course.level && (
                  <div className="text-center">
                    <Award className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Level</p>
                    <p className="font-semibold text-gray-900">{course.level}</p>
                  </div>
                )}
              </div>

              {/* Tags */}
              {course.tags && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(course.tags) ? course.tags : String(course.tags).split(',')).map((tag, index) => (
                      <span
                        key={index}
                        className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded"
                      >
                        {String(tag).trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Benefits */}
              {course.benefits && course.benefits.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">What You'll Learn</h3>
                  <ul className="space-y-2">
                    {course.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-indigo-600 mt-1">✓</span>
                        <span className="text-gray-600">{benefit.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {Array.isArray(course.courseData) && course.courseData.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Course curriculum</h3>
                  <ul className="divide-y divide-gray-200">
                    {course.courseData.map((lesson, index) => (
                      <li
                        key={lesson._id || `${lesson.title || 'lesson'}-${index}`}
                        className="flex items-start justify-between gap-4 py-4"
                      >
                        <div>
                          {lesson.videoSection && (
                            <p className="text-sm font-medium text-indigo-600 mb-1">
                              {lesson.videoSection}
                            </p>
                          )}
                          <p className="font-medium text-gray-900">
                            {lesson.title || `Lesson ${index + 1}`}
                          </p>
                          {lesson.description && (
                            <p className="text-sm text-gray-600 mt-1">{lesson.description}</p>
                          )}
                        </div>
                        {lesson.isPreview && (
                          <span className="shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                            Preview
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Prerequisites */}
              {course.prerequisites && course.prerequisites.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Prerequisites</h3>
                  <ul className="space-y-2">
                    {course.prerequisites.map((prereq, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-indigo-600 mt-1">•</span>
                        <span className="text-gray-600">{prereq.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <div className="mb-4">
                {course.estimatedPrice != null && Number.isFinite(Number(course.estimatedPrice)) && Number(course.estimatedPrice) > Number(course.price) && (
                  <p className="text-sm text-gray-500 line-through">
                    ${Number(course.estimatedPrice).toFixed(2)}
                  </p>
                )}
                <p className="text-3xl font-bold text-indigo-600">
                  {course.price != null && Number.isFinite(Number(course.price)) ? (Number(course.price) === 0 ? 'Free' : `$${Number(course.price).toFixed(2)}`) : 'Pricing unavailable'}
                </p>
              </div>

              <button
                onClick={handleEnroll}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors mb-3"
              >
                Enroll Now
              </button>

              {isMarketplace && (
                <button
                  type="button"
                  onClick={handleWishlistToggle}
                  disabled={wishlistLoading}
                  aria-pressed={isWishlistSaved}
                  className="w-full border-2 border-indigo-600 text-indigo-600 py-3 rounded-lg font-medium hover:bg-indigo-50 transition-colors mb-6"
                >
                  <Heart className="h-5 w-5 inline mr-2" />
                  {wishlistLoading ? 'Updating…' : isWishlistSaved ? 'Saved to Wishlist' : 'Add to Wishlist'}
                </button>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
