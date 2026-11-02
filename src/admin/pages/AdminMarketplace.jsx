import { useEffect, useState } from 'react';
import { lmsAPI } from '../../api/lms';
import { BookOpen, Eye, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import LMSNavigation from '../../components/LMSNavigation';

const AdminMarketplace = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await lmsAPI.adminGetAllCourses();
        if (response.data?.success && response.data?.courses) {
          setCourses(response.data.courses);
        }
      } catch (error) {
        console.error('Error fetching marketplace courses:', error);
        setHasError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleStatusUpdate = async (courseId, status) => {
    if (status === 'ARCHIVED' && !window.confirm('Archive this course? It may no longer be visible to learners.')) {
      return;
    }

    try {
      const response = await lmsAPI.adminUpdateCourseStatus(courseId, { status });
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Unable to update course status.');
      }
      setCourses(
        courses.map((course) => (course._id === courseId ? { ...course, status } : course))
      );
      toast.success('Course status updated');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || error.message || 'Unable to update course status');
    }
  };

  return (
    <div className="lms-area lms-admin-marketplace">
      <LMSNavigation />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">LMS Marketplace</h1>
        <p className="text-gray-600">Manage course lifecycle and publishing</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : courses.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enrolled
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {courses.map((course) => (
                <tr key={course._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      {course.thumbnail?.url ? (
                        <img
                          src={course.thumbnail.url}
                          alt={course.name}
                          className="h-12 w-12 object-cover rounded"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-indigo-100 rounded flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-indigo-400" />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{course.name}</div>
                        <div className="text-sm text-gray-500">{course.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={course.status || 'DRAFT'}
                      onChange={(e) => handleStatusUpdate(course._id, e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="SUBMITTED">Submitted</option>
                      <option value="UNDER_REVIEW">Under Review</option>
                      <option value="PUBLISHED">Published</option>
                      <option value="UNPUBLISHED">Unpublished</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {course.price != null && Number.isFinite(Number(course.price)) ? `$${Number(course.price).toFixed(2)}` : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {course.purchased != null ? course.purchased : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Link to={`/marketplace/${course._id}`} className="text-indigo-600 hover:text-indigo-700" title="View" aria-label={`View ${course.name}`}>
                        <Eye className="h-5 w-5" />
                      </Link>
                      <Link to={`/admin/courses/edit/${course._id}`} className="text-gray-600 hover:text-gray-700" title="Edit" aria-label={`Edit ${course.name}`}>
                        <Edit className="h-5 w-5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses in marketplace</h3>
          <p className="text-gray-600">Courses will appear here once created</p>
        </div>
      )}
      {hasError && (
        <div className="state-card state-error admin-state-card">
          <p>Marketplace courses could not be loaded.</p>
        </div>
      )}
    </div>
  );
};

export default AdminMarketplace;
