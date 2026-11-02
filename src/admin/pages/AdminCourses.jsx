import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, BookOpen, Eye } from 'lucide-react';
import { adminAPI } from '../../api/admin';
import { toast } from 'sonner';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await adminAPI.getAllCourses();
        if (response.data.success) {
          setCourses(response.data.courses);
          setFilteredCourses(response.data.courses);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast.error('Failed to fetch courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = courses.filter(
        (course) =>
          course.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.tags?.toLowerCase?.().includes(searchQuery.toLowerCase())
      );
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses(courses);
    }
  }, [searchQuery, courses]);

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      const response = await adminAPI.deleteCourse(courseId);
      if (response.data.success) {
        toast.success('Course deleted successfully');
        setCourses(courses.filter((course) => course._id !== courseId));
        setFilteredCourses(filteredCourses.filter((course) => course._id !== courseId));
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Failed to delete course');
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Management</h1>
          <p className="text-gray-600">Create and manage courses</p>
        </div>
        <Link
          to="/admin/courses/create"
          className="inline-flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Create Course</span>
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
              <div className="h-40 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div key={course._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              {course.thumbnail?.url ? (
                <img
                  src={course.thumbnail.url}
                  alt={course.name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                  <BookOpen className="h-16 w-16 text-indigo-400" />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{course.name}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-indigo-600">
                    {course.price != null && Number.isFinite(Number(course.price)) ? `$${Number(course.price).toFixed(2)}` : 'Pricing unavailable'}
                  </span>
                  {course.purchased != null && <span className="text-sm text-gray-500">{course.purchased} enrolled</span>}
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/courses/${course._id}`}
                    className="flex-1 flex items-center justify-center space-x-1 text-sm text-indigo-600 border border-indigo-600 py-2 rounded hover:bg-indigo-50 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View</span>
                  </Link>
                  <Link
                    to={`/admin/courses/edit/${course._id}`}
                    className="flex-1 flex items-center justify-center space-x-1 text-sm text-gray-600 border border-gray-300 py-2 rounded hover:bg-gray-50 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </Link>
                  <button
                    onClick={() => handleDeleteCourse(course._id)}
                    className="flex items-center justify-center text-red-600 hover:bg-red-50 p-2 rounded transition-colors"
                    title="Delete course"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-600 mb-4">Create your first course to get started</p>
          <Link
            to="/admin/courses/create"
            className="inline-flex items-center space-x-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Create Course</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default AdminCourses;
