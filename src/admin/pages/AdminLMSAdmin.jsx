import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BookOpen, CheckCircle2, Download, Plus, Search, ShoppingCart, Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { lmsAPI } from '../../api/lms';
import LMSNavigation from '../../components/LMSNavigation';

const getRecord = (response) => response?.data?.data || response?.data || {};
const getList = (response, keys) => {
  const data = getRecord(response);
  if (Array.isArray(data)) return data;
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }
  return Array.isArray(data?.data) ? data.data : [];
};
const hasNumber = (value) => value != null && value !== '' && Number.isFinite(Number(value));

const AdminLMSAdmin = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [instructors, setInstructors] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sectionErrors, setSectionErrors] = useState({});
  const [search, setSearch] = useState('');
  const [categoryForm, setCategoryForm] = useState(null);
  const [savingCategory, setSavingCategory] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState(null);
  const [exporting, setExporting] = useState(false);

  const loadAdminData = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    const results = await Promise.allSettled([
      lmsAPI.adminGetAnalytics(),
      lmsAPI.adminGetInstructors(),
      lmsAPI.adminGetAllEnrollments(),
      lmsAPI.adminGetAllCategories(),
    ]);
    const nextErrors = {};
    const setters = [
      (response) => setAnalytics(getRecord(response)),
      (response) => setInstructors(getList(response, ['instructors'])),
      (response) => setEnrollments(getList(response, ['enrollments'])),
      (response) => setCategories(getList(response, ['categories'])),
    ];
    const labels = ['analytics', 'instructors', 'enrollments', 'categories'];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.data?.success !== false) {
        setters[index](result.value);
      } else {
        const error = result.status === 'rejected' ? result.reason : new Error(`${labels[index]} data was not returned.`);
        console.error(`Error fetching LMS admin ${labels[index]}:`, error);
        nextErrors[labels[index]] = error.response?.data?.message || error.message || `${labels[index]} could not be loaded.`;
      }
    });
    setSectionErrors(nextErrors);
    setLoading(false);
  }, []);

  useEffect(() => { loadAdminData(); }, [loadAdminData]);

  const filteredInstructors = useMemo(() => {
    const query = search.trim().toLowerCase();
    return instructors.filter((instructor) =>
      !query || [instructor.name, instructor.email, instructor.role]
        .some((value) => typeof value === 'string' && value.toLowerCase().includes(query))
    );
  }, [instructors, search]);

  const filteredEnrollments = useMemo(() => {
    const query = search.trim().toLowerCase();
    return enrollments.filter((enrollment) => {
      const student = enrollment.user || enrollment.student || enrollment.userId;
      const course = enrollment.course || enrollment.courseId;
      return !query || [student?.name, student?.email, course?.name, enrollment._id]
        .some((value) => typeof value === 'string' && value.toLowerCase().includes(query));
    });
  }, [enrollments, search]);

  const handleCategorySave = async (event) => {
    event.preventDefault();
    if (!categoryForm?.name.trim()) {
      toast.error('Enter a category name.');
      return;
    }
    setSavingCategory(true);
    try {
      const payload = { name: categoryForm.name.trim(), description: categoryForm.description.trim() };
      const response = categoryForm.id
        ? await lmsAPI.updateCategory(categoryForm.id, payload)
        : await lmsAPI.createCategory(payload);
      if (response.data?.success === false) throw new Error(response.data.message || 'Category could not be saved.');
      toast.success(categoryForm.id ? 'Category updated.' : 'Category created.');
      setCategoryForm(null);
      await loadAdminData(true);
    } catch (error) {
      console.error('Error saving LMS category:', error);
      toast.error(error.response?.data?.message || error.message || 'Unable to save category.');
    } finally {
      setSavingCategory(false);
    }
  };

  const handleCategoryDelete = async (category) => {
    if (!window.confirm(`Delete the “${category.name || category.title}” category?`)) return;
    setDeletingCategoryId(String(category._id));
    try {
      const response = await lmsAPI.deleteCategory(category._id);
      if (response.data?.success === false) throw new Error(response.data.message || 'Category could not be deleted.');
      setCategories((current) => current.filter((entry) => entry._id !== category._id));
      toast.success('Category deleted.');
    } catch (error) {
      console.error('Error deleting LMS category:', error);
      toast.error(error.response?.data?.message || error.message || 'Unable to delete category.');
    } finally {
      setDeletingCategoryId(null);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await lmsAPI.adminExportEnrollments();
      const url = URL.createObjectURL(response.data);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'lms-enrollments.csv';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error('Error exporting LMS enrollments:', error);
      toast.error(error.response?.data?.message || 'Unable to export enrollments.');
    } finally {
      setExporting(false);
    }
  };

  const tabs = [
    ['overview', 'Overview'],
    ['instructors', 'Instructors'],
    ['enrollments', 'Enrollments'],
    ['categories', 'Categories'],
  ];

  return (
    <section className="lms-area lms-admin-page">
      <LMSNavigation />
      <div className="lms-page-wrap lms-admin-wrap">
        <header className="lms-learning-heading">
          <div>
            <span className="lms-eyebrow">Platform management</span>
            <h1>LMS Administration</h1>
            <p>Review marketplace activity, categories, instructors, and enrollment records.</p>
          </div>
          <Link to="/marketplace" className="lms-button-primary"><BookOpen size={16} /> Browse Marketplace</Link>
        </header>

        <div className="lms-learning-tabs" role="tablist" aria-label="LMS administration sections">
          {tabs.map(([id, label]) => (
            <button type="button" role="tab" aria-selected={activeTab === id} className={activeTab === id ? 'is-active' : ''} key={id} onClick={() => { setActiveTab(id); setSearch(''); }}>
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="lms-learning-skeletons">{[1, 2, 3].map((item) => <div key={item} className="lms-learning-skeleton" />)}</div>
        ) : activeTab === 'overview' ? (
          <>
            {sectionErrors.analytics && <SectionError message={sectionErrors.analytics} />}
            <div className="lms-progress-stats">
              {[
                ['Users', analytics?.users, Users],
                ['Courses', analytics?.courses, BookOpen],
                ['Orders', analytics?.orders, ShoppingCart],
                ['Enrollments', analytics?.enrollments, CheckCircle2],
              ].map(([label, value, Icon]) => (
                <article className="lms-stat-card" key={label}>
                  <span><Icon size={18} /></span>
                  <div><small>{label}</small><strong>{hasNumber(value) ? Number(value).toLocaleString() : 'Unavailable'}</strong></div>
                </article>
              ))}
            </div>
            {hasNumber(analytics?.certificates) && (
              <article className="lms-admin-certificate-total"><strong>{Number(analytics.certificates).toLocaleString()}</strong><span>Certificates issued</span></article>
            )}
            <div className="lms-admin-shortcuts">
              <button type="button" onClick={() => setActiveTab('instructors')}><Users size={19} /><span><strong>Instructors</strong><small>Review platform instructors</small></span></button>
              <button type="button" onClick={() => setActiveTab('enrollments')}><CheckCircle2 size={19} /><span><strong>Enrollments</strong><small>Inspect learner enrollments</small></span></button>
              <button type="button" onClick={() => setActiveTab('categories')}><BookOpen size={19} /><span><strong>Categories</strong><small>Manage marketplace categories</small></span></button>
            </div>
          </>
        ) : activeTab === 'instructors' ? (
          <section className="lms-admin-panel">
            <SectionHeading eyebrow="Marketplace contributors" title="Instructors" count={filteredInstructors.length} />
            <SearchInput value={search} onChange={setSearch} placeholder="Search instructors by name or email" />
            {sectionErrors.instructors ? <SectionError message={sectionErrors.instructors} /> : filteredInstructors.length ? (
              <div className="lms-table-wrap">
                <table className="lms-data-table">
                  <thead><tr><th>Instructor</th><th>Email</th><th>Courses</th><th>Verification</th></tr></thead>
                  <tbody>
                    {filteredInstructors.map((instructor, index) => (
                      <tr key={instructor._id || index}>
                        <td><span className="lms-table-primary">{instructor.name || 'Name unavailable'}</span><small>{instructor.role || 'Instructor'}</small></td>
                        <td>{instructor.email || 'Unavailable'}</td>
                        <td>{Array.isArray(instructor.courses) ? instructor.courses.length : 'Unavailable'}</td>
                        <td><span className={`lms-status-badge ${instructor.isVerified === true ? 'is-success' : instructor.isVerified === false ? 'is-pending' : ''}`}>{instructor.isVerified == null ? 'Not provided' : instructor.isVerified ? 'Verified' : 'Pending'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <div className="lms-state"><Users size={30} /><h3>No instructors found</h3><p>Instructor records will appear here when available.</p></div>}
            <p className="lms-admin-note">Instructor verification and role changes are read-only here because no LMS instructor management endpoint is documented.</p>
          </section>
        ) : activeTab === 'enrollments' ? (
          <section className="lms-admin-panel">
            <SectionHeading eyebrow="Learner records" title="Enrollments" count={filteredEnrollments.length}>
              <button type="button" className="lms-button-secondary" onClick={handleExport} disabled={exporting}><Download size={16} /> {exporting ? 'Exporting…' : 'Export CSV'}</button>
            </SectionHeading>
            <SearchInput value={search} onChange={setSearch} placeholder="Search by student, course, or enrollment ID" />
            {sectionErrors.enrollments ? <SectionError message={sectionErrors.enrollments} /> : filteredEnrollments.length ? (
              <div className="lms-table-wrap">
                <table className="lms-data-table">
                  <thead><tr><th>Student</th><th>Course</th><th>Enrolled</th><th>Progress</th><th>Status</th></tr></thead>
                  <tbody>
                    {filteredEnrollments.map((enrollment, index) => {
                      const student = enrollment.user || enrollment.student || enrollment.userId;
                      const course = enrollment.course || enrollment.courseId;
                      const progress = hasNumber(enrollment.progress) ? Math.min(100, Math.max(0, Number(enrollment.progress))) : null;
                      return (
                        <tr key={enrollment._id || index}>
                          <td>{student?.name || student?.email || 'Unavailable'}</td>
                          <td>{course?.name || 'Unavailable'}</td>
                          <td>{enrollment.createdAt ? new Date(enrollment.createdAt).toLocaleDateString() : 'Unavailable'}</td>
                          <td>{progress == null ? 'Unavailable' : `${progress}%`}</td>
                          <td><span className={`lms-status-badge ${enrollment.completed ? 'is-success' : 'is-progress'}`}>{enrollment.completed ? 'Completed' : 'In progress'}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : <div className="lms-state"><CheckCircle2 size={30} /><h3>No enrollments found</h3><p>Enrollment data will appear here when available.</p></div>}
          </section>
        ) : (
          <section className="lms-admin-panel">
            <SectionHeading eyebrow="Marketplace organization" title="Categories" count={categories.length}>
              <button type="button" className="lms-button-primary" onClick={() => setCategoryForm({ name: '', description: '', id: null })}><Plus size={16} /> Add category</button>
            </SectionHeading>
            {sectionErrors.categories ? <SectionError message={sectionErrors.categories} /> : categories.length ? (
              <div className="lms-category-admin-list">
                {categories.map((category, index) => (
                  <article className="lms-category-admin-card" key={category._id || index}>
                    <div><strong>{category.name || category.title || 'Unnamed category'}</strong><p>{category.description || 'No description provided.'}</p></div>
                    {hasNumber(category.count) && <span>{Number(category.count)} courses</span>}
                    <div className="lms-instructor-actions">
                      <button type="button" className="lms-button-secondary" onClick={() => setCategoryForm({ id: category._id, name: category.name || category.title || '', description: category.description || '' })}>Edit</button>
                      <button type="button" className="lms-button-secondary lms-danger-button" onClick={() => handleCategoryDelete(category)} disabled={deletingCategoryId === String(category._id)}>{deletingCategoryId === String(category._id) ? 'Deleting…' : 'Delete'}</button>
                    </div>
                  </article>
                ))}
              </div>
            ) : <div className="lms-state"><BookOpen size={30} /><h3>No categories found</h3><p>Create a category to organize marketplace courses.</p></div>}
          </section>
        )}
      </div>

      {categoryForm && (
        <div className="lms-dialog-backdrop">
          <form className="lms-dialog lms-form-dialog" onSubmit={handleCategorySave}>
            <span className="lms-eyebrow">Marketplace</span>
            <h2>{categoryForm.id ? 'Edit category' : 'Create category'}</h2>
            <label>Category name<input required value={categoryForm.name} onChange={(event) => setCategoryForm({ ...categoryForm, name: event.target.value })} /></label>
            <label>Description<textarea rows="3" value={categoryForm.description} onChange={(event) => setCategoryForm({ ...categoryForm, description: event.target.value })} /></label>
            <div className="lms-dialog-actions">
              <button type="button" className="lms-button-secondary" onClick={() => setCategoryForm(null)}>Cancel</button>
              <button type="submit" className="lms-button-primary" disabled={savingCategory}>{savingCategory ? 'Saving…' : 'Save category'}</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
};

const SectionHeading = ({ eyebrow, title, count, children }) => (
  <div className="lms-section-heading">
    <div><span className="lms-eyebrow">{eyebrow}</span><h2>{title}</h2></div>
    <div className="lms-section-heading-actions">{children}<span>{count} {count === 1 ? 'record' : 'records'}</span></div>
  </div>
);
const SearchInput = ({ value, onChange, placeholder }) => (
  <label className="lms-table-search"><Search size={16} /><span className="visually-hidden">{placeholder}</span><input type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></label>
);
const SectionError = ({ message }) => <div className="lms-state lms-state-error" role="alert">{message}</div>;

export default AdminLMSAdmin;
