import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight, BookOpen, CheckCircle2, GraduationCap, Plus, Save, Users, X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { lmsAPI } from '../api/lms';
import LMSNavigation from '../components/LMSNavigation';
import { useAuth } from '../hooks/useAuth';

const emptyCourse = {
  name: '',
  description: '',
  price: '',
  estimatedPrice: '',
  tags: '',
  level: '',
  demoUrl: '',
};
const emptyLecture = {
  title: '',
  description: '',
  videoUrl: '',
  videoSection: '',
  videoLength: '',
  isPreview: false,
};

const getRecord = (response) => response?.data?.data || response?.data || {};
const getList = (response, keys) => {
  const data = getRecord(response);
  if (Array.isArray(data)) return data;
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }
  return Array.isArray(data?.data) ? data.data : [];
};
const courseIdOf = (course) => course?._id || course?.courseId?._id || course?.courseId;
const numericValue = (value) => value != null && Number.isFinite(Number(value)) ? Number(value) : null;

const InstructorDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [savingCourse, setSavingCourse] = useState(false);
  const [courseForm, setCourseForm] = useState(null);
  const [courseError, setCourseError] = useState('');
  const [lectureCourse, setLectureCourse] = useState(null);
  const [lectureForm, setLectureForm] = useState(emptyLecture);
  const [savingLecture, setSavingLecture] = useState(false);
  const [submittingCourseId, setSubmittingCourseId] = useState(null);

  const loadInstructorData = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setLoading(true);
      setLoadError('');
    }
    const results = await Promise.allSettled([
      lmsAPI.getInstructorCourses(),
      lmsAPI.getInstructorStudents(),
      lmsAPI.getInstructorAnalytics(),
      lmsAPI.getInstructorRevenue(),
    ]);
    const failed = [];
    if (results[0].status === 'fulfilled' && results[0].value.data?.success !== false) {
      setCourses(getList(results[0].value, ['courses']));
    } else failed.push(results[0].status === 'rejected' ? results[0].reason : new Error('Courses could not be loaded.'));

    if (results[1].status === 'fulfilled' && results[1].value.data?.success !== false) {
      setStudents(getList(results[1].value, ['students', 'enrollments']));
    } else failed.push(results[1].status === 'rejected' ? results[1].reason : new Error('Student enrollments could not be loaded.'));

    if (results[2].status === 'fulfilled' && results[2].value.data?.success !== false) {
      setAnalytics(getRecord(results[2].value));
    } else failed.push(results[2].status === 'rejected' ? results[2].reason : new Error('Teaching analytics could not be loaded.'));

    if (results[3].status === 'fulfilled' && results[3].value.data?.success !== false) {
      setRevenue(getRecord(results[3].value));
    } else failed.push(results[3].status === 'rejected' ? results[3].reason : new Error('Revenue data could not be loaded.'));

    if (failed.length) {
      failed.forEach((error) => console.error('Instructor data request failed:', error));
      setLoadError('Some instructor data could not be loaded. The available sections are still shown.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadInstructorData();
  }, [loadInstructorData]);

  const courseStats = useMemo(() => ({
    total: numericValue(analytics?.courses) ?? courses.length,
    enrollments: numericValue(analytics?.enrollments) ?? numericValue(revenue?.totalEnrollments),
    completed: numericValue(analytics?.completions) ?? numericValue(analytics?.completed),
    revenue: numericValue(revenue?.totalRevenue),
  }), [analytics, courses.length, revenue]);

  const openCreateForm = () => {
    setCourseError('');
    setCourseForm({ ...emptyCourse, editingId: null });
  };

  const openEditForm = (course) => {
    setCourseError('');
    setCourseForm({
      name: course.name || '',
      description: course.description || '',
      price: course.price ?? '',
      estimatedPrice: course.estimatedPrice ?? '',
      tags: Array.isArray(course.tags) ? course.tags.join(', ') : course.tags || '',
      level: course.level || '',
      demoUrl: course.demoUrl || '',
      editingId: courseIdOf(course),
    });
  };

  const handleCourseSubmit = async (event) => {
    event.preventDefault();
    setCourseError('');
    const price = numericValue(courseForm.price);
    const estimatedPrice = numericValue(courseForm.estimatedPrice);
    if (!courseForm.name.trim() || !courseForm.description.trim() || price == null || price < 0 || estimatedPrice == null || estimatedPrice < 0) {
      setCourseError('Enter a course title, description, and valid non-negative prices.');
      return;
    }
    const payload = {
      name: courseForm.name.trim(),
      description: courseForm.description.trim(),
      price,
      estimatedPrice,
      tags: courseForm.tags.trim(),
      level: courseForm.level.trim(),
      demoUrl: courseForm.demoUrl.trim(),
    };

    setSavingCourse(true);
    try {
      const response = courseForm.editingId
        ? await lmsAPI.updateInstructorCourse(courseForm.editingId, payload)
        : await lmsAPI.createDraftCourse(payload);
      if (response.data?.success === false) throw new Error(response.data.message || 'The course could not be saved.');
      toast.success(courseForm.editingId ? 'Course updated.' : 'Draft course created.');
      setCourseForm(null);
      await loadInstructorData(true);
    } catch (error) {
      console.error('Error saving instructor course:', error);
      const message = error.response?.data?.message || error.message || 'Unable to save this course.';
      setCourseError(message);
      toast.error(message);
    } finally {
      setSavingCourse(false);
    }
  };

  const handleLectureSubmit = async (event) => {
    event.preventDefault();
    const courseId = courseIdOf(lectureCourse);
    if (!courseId || !lectureForm.title.trim() || !lectureForm.videoUrl.trim() || !lectureForm.videoSection.trim()) {
      toast.error('Enter the lesson title, video URL, and section.');
      return;
    }
    const videoLength = numericValue(lectureForm.videoLength);
    if (videoLength == null || videoLength < 0) {
      toast.error('Enter a valid lesson length.');
      return;
    }
    setSavingLecture(true);
    try {
      const response = await lmsAPI.addLecture(courseId, {
        ...lectureForm,
        title: lectureForm.title.trim(),
        description: lectureForm.description.trim(),
        videoUrl: lectureForm.videoUrl.trim(),
        videoSection: lectureForm.videoSection.trim(),
        videoLength,
      });
      if (response.data?.success === false) throw new Error(response.data.message || 'The lesson could not be added.');
      toast.success('Lesson added to the course.');
      setLectureCourse(null);
      setLectureForm(emptyLecture);
      await loadInstructorData(true);
    } catch (error) {
      console.error('Error adding course lesson:', error);
      toast.error(error.response?.data?.message || error.message || 'Unable to add this lesson.');
    } finally {
      setSavingLecture(false);
    }
  };

  const handleSubmitForReview = async (course) => {
    const id = courseIdOf(course);
    if (!id) return;
    setSubmittingCourseId(String(id));
    try {
      const response = await lmsAPI.submitCourse(id);
      if (response.data?.success === false) throw new Error(response.data.message || 'Course submission failed.');
      toast.success('Course submitted for review.');
      await loadInstructorData(true);
    } catch (error) {
      console.error('Error submitting course:', error);
      toast.error(error.response?.data?.message || error.message || 'Unable to submit course.');
    } finally {
      setSubmittingCourseId(null);
    }
  };

  return (
    <section className="lms-area lms-instructor-page">
      <LMSNavigation />
      <div className="lms-page-wrap lms-instructor-wrap">
        <header className="lms-learning-heading">
          <div>
            <span className="lms-eyebrow">Instructor workspace</span>
            <h1>Welcome, {user?.name || 'Instructor'}</h1>
            <p>Manage your courses, lessons, and enrolled learners.</p>
          </div>
          <button type="button" className="lms-button-primary" onClick={openCreateForm}><Plus size={17} /> Create course</button>
        </header>

        <div className="lms-learning-tabs" role="tablist" aria-label="Instructor sections">
          {[
            ['overview', 'Overview'],
            ['courses', 'My Courses'],
            ['students', 'Students'],
          ].map(([id, label]) => (
            <button type="button" role="tab" aria-selected={activeTab === id} className={activeTab === id ? 'is-active' : ''} key={id} onClick={() => setActiveTab(id)}>
              {label}
            </button>
          ))}
        </div>

        {loadError && <div className="lms-state lms-state-error" role="status">{loadError}</div>}

        {loading ? (
          <div className="lms-learning-skeletons">{[1, 2, 3].map((item) => <div key={item} className="lms-learning-skeleton" />)}</div>
        ) : activeTab === 'overview' ? (
          <>
            <div className="lms-progress-stats">
              {[
                ['Courses', courseStats.total, BookOpen],
                ['Enrollments', courseStats.enrollments, Users],
                ['Completions', courseStats.completed, CheckCircle2],
                ['Revenue', courseStats.revenue == null ? 'Unavailable' : new Intl.NumberFormat(undefined, { style: 'currency', currency: revenue?.currency || 'USD' }).format(courseStats.revenue), GraduationCap],
              ].map(([label, value, Icon]) => (
                <article className="lms-stat-card" key={label}>
                  <span><Icon size={18} /></span><div><small>{label}</small><strong>{value ?? 'Unavailable'}</strong></div>
                </article>
              ))}
            </div>
            <section className="lms-instructor-panel">
              <div className="lms-section-heading"><div><span className="lms-eyebrow">Recently managed</span><h2>My courses</h2></div><button type="button" className="lms-inline-link" onClick={() => setActiveTab('courses')}>View all <ArrowUpRight size={15} /></button></div>
              {courses.length ? <CourseList courses={courses.slice(0, 3)} onEdit={openEditForm} onAddLecture={(course) => setLectureCourse(course)} onSubmit={handleSubmitForReview} submittingId={submittingCourseId} /> : <EmptyInstructorCourses onCreate={openCreateForm} />}
            </section>
          </>
        ) : activeTab === 'courses' ? (
          <section className="lms-instructor-panel">
            <div className="lms-section-heading"><div><span className="lms-eyebrow">Course management</span><h2>My Courses</h2></div><button type="button" className="lms-button-primary" onClick={openCreateForm}><Plus size={16} /> Create course</button></div>
            {courses.length ? <CourseList courses={courses} onEdit={openEditForm} onAddLecture={(course) => setLectureCourse(course)} onSubmit={handleSubmitForReview} submittingId={submittingCourseId} /> : <EmptyInstructorCourses onCreate={openCreateForm} />}
          </section>
        ) : (
          <section className="lms-instructor-panel">
            <div className="lms-section-heading"><div><span className="lms-eyebrow">Learner activity</span><h2>Students</h2></div><span>{students.length} {students.length === 1 ? 'enrollment' : 'enrollments'}</span></div>
            {students.length ? (
              <div className="lms-table-wrap">
                <table className="lms-data-table">
                  <thead><tr><th>Student</th><th>Course</th><th>Progress</th><th>Status</th></tr></thead>
                  <tbody>
                    {students.map((enrollment, index) => {
                      const course = enrollment.course || enrollment.courseId;
                      const learner = enrollment.user || enrollment.student || enrollment.userId;
                      const progress = numericValue(enrollment.progress);
                      return (
                        <tr key={enrollment._id || index}>
                          <td>{learner?.name || learner?.email || 'Student information unavailable'}</td>
                          <td>{course?.name || 'Course information unavailable'}</td>
                          <td>{progress == null ? 'Unavailable' : `${Math.min(100, Math.max(0, progress))}%`}</td>
                          <td><span className={`lms-status-badge ${enrollment.completed ? 'is-success' : 'is-progress'}`}>{enrollment.completed ? 'Completed' : 'In progress'}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : <div className="lms-state"><Users size={30} /><h3>No student enrollments available</h3><p>Enrolled learners will appear here when available.</p></div>}
          </section>
        )}
      </div>

      {courseForm && (
        <div className="lms-dialog-backdrop">
          <form className="lms-dialog lms-form-dialog" onSubmit={handleCourseSubmit}>
            <button type="button" className="lms-dialog-close" onClick={() => setCourseForm(null)} aria-label="Close course editor"><X size={18} /></button>
            <span className="lms-eyebrow">{courseForm.editingId ? 'Course details' : 'New draft'}</span>
            <h2>{courseForm.editingId ? 'Edit course' : 'Create a course'}</h2>
            <p>Course thumbnail upload and publishing are not available through the documented instructor API.</p>
            {courseError && <div className="lms-state-error lms-form-error" role="alert">{courseError}</div>}
            <label>Course title<input required value={courseForm.name} onChange={(event) => setCourseForm({ ...courseForm, name: event.target.value })} /></label>
            <label>Description<textarea required rows="4" value={courseForm.description} onChange={(event) => setCourseForm({ ...courseForm, description: event.target.value })} /></label>
            <div className="lms-form-row">
              <label>Price<input required type="number" min="0" step="0.01" value={courseForm.price} onChange={(event) => setCourseForm({ ...courseForm, price: event.target.value })} /></label>
              <label>Estimated price<input required type="number" min="0" step="0.01" value={courseForm.estimatedPrice} onChange={(event) => setCourseForm({ ...courseForm, estimatedPrice: event.target.value })} /></label>
            </div>
            <div className="lms-form-row">
              <label>Level<input value={courseForm.level} onChange={(event) => setCourseForm({ ...courseForm, level: event.target.value })} /></label>
              <label>Tags<input value={courseForm.tags} onChange={(event) => setCourseForm({ ...courseForm, tags: event.target.value })} /></label>
            </div>
            <label>Demo URL<input type="url" value={courseForm.demoUrl} onChange={(event) => setCourseForm({ ...courseForm, demoUrl: event.target.value })} /></label>
            <div className="lms-dialog-actions">
              <button type="button" className="lms-button-secondary" onClick={() => setCourseForm(null)}>Cancel</button>
              <button type="submit" className="lms-button-primary" disabled={savingCourse}>{savingCourse ? 'Saving…' : <><Save size={16} /> Save draft</>}</button>
            </div>
          </form>
        </div>
      )}

      {lectureCourse && (
        <div className="lms-dialog-backdrop">
          <form className="lms-dialog lms-form-dialog" onSubmit={handleLectureSubmit}>
            <button type="button" className="lms-dialog-close" onClick={() => setLectureCourse(null)} aria-label="Close lesson form"><X size={18} /></button>
            <span className="lms-eyebrow">Course content</span>
            <h2>Add a lesson</h2>
            <p>For {lectureCourse.name || 'selected course'}</p>
            <label>Lesson title<input required value={lectureForm.title} onChange={(event) => setLectureForm({ ...lectureForm, title: event.target.value })} /></label>
            <label>Description<textarea rows="3" value={lectureForm.description} onChange={(event) => setLectureForm({ ...lectureForm, description: event.target.value })} /></label>
            <label>Video URL<input required type="url" value={lectureForm.videoUrl} onChange={(event) => setLectureForm({ ...lectureForm, videoUrl: event.target.value })} /></label>
            <div className="lms-form-row">
              <label>Section<input required value={lectureForm.videoSection} onChange={(event) => setLectureForm({ ...lectureForm, videoSection: event.target.value })} /></label>
              <label>Length (minutes)<input required type="number" min="0" step="0.1" value={lectureForm.videoLength} onChange={(event) => setLectureForm({ ...lectureForm, videoLength: event.target.value })} /></label>
            </div>
            <label className="lms-checkbox-label"><input type="checkbox" checked={lectureForm.isPreview} onChange={(event) => setLectureForm({ ...lectureForm, isPreview: event.target.checked })} /> Make this lesson a preview</label>
            <div className="lms-dialog-actions">
              <button type="button" className="lms-button-secondary" onClick={() => setLectureCourse(null)}>Cancel</button>
              <button type="submit" className="lms-button-primary" disabled={savingLecture}>{savingLecture ? 'Adding…' : 'Add lesson'}</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
};

const CourseList = ({ courses, onEdit, onAddLecture, onSubmit, submittingId }) => (
  <div className="lms-instructor-course-list">
    {courses.map((course, index) => {
      const id = courseIdOf(course);
      const status = course.status || 'Status unavailable';
      return (
        <article className="lms-instructor-course" key={id || index}>
          <div className="lms-course-mini-art">{course.thumbnail?.url ? <img src={course.thumbnail.url} alt="" /> : <BookOpen size={23} />}</div>
          <div className="lms-instructor-course-copy">
            <h3>{course.name || 'Untitled course'}</h3>
            <p>{course.description || 'Description unavailable.'}</p>
            <span className={`lms-status-badge ${String(status).toLowerCase() === 'published' ? 'is-success' : 'is-progress'}`}>{status}</span>
          </div>
          <div className="lms-instructor-actions">
            {id && <Link to={`/marketplace/${id}`} className="lms-icon-action" aria-label={`View ${course.name}`} title="View course"><ArrowUpRight size={17} /></Link>}
            <button type="button" className="lms-button-secondary" onClick={() => onEdit(course)}>Edit</button>
            <button type="button" className="lms-button-secondary" onClick={() => onAddLecture(course)}>Add lesson</button>
            {!['SUBMITTED', 'UNDER_REVIEW', 'PUBLISHED'].includes(String(status).toUpperCase()) && id && (
              <button type="button" className="lms-button-primary" onClick={() => onSubmit(course)} disabled={submittingId === String(id)}>
                {submittingId === String(id) ? 'Submitting…' : 'Submit for review'}
              </button>
            )}
          </div>
        </article>
      );
    })}
  </div>
);

const EmptyInstructorCourses = ({ onCreate }) => (
  <div className="lms-state"><BookOpen size={30} /><h3>No instructor courses yet</h3><p>Create a draft course to start building your teaching catalog.</p><button type="button" className="lms-button-primary" onClick={onCreate}><Plus size={16} /> Create course</button></div>
);

export default InstructorDashboard;
