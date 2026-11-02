import { useEffect, useState } from 'react';
import { ArrowLeft, ImagePlus, Plus, Save, Trash2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { adminAPI } from '../../api/admin';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  estimatedPrice: '',
  thumbnail: '',
  tags: '',
  level: '',
  demoUrl: '',
  benefits: [''],
  prerequisites: [''],
};

const listToText = (items) => Array.isArray(items) ? items.map((item) => item.title || '').join('\n') : '';

const AdminCourseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!editing) return undefined;
    let active = true;
    const fetchCourse = async () => {
      try {
        const response = await adminAPI.getAllCourses();
        const course = response.data?.courses?.find((item) => String(item._id) === String(id));
        if (!course) throw new Error('This course could not be found.');
        if (active) {
          setForm({
            name: course.name || '',
            description: course.description || '',
            price: course.price ?? '',
            estimatedPrice: course.estimatedPrice ?? '',
            thumbnail: course.thumbnail?.url || '',
            tags: Array.isArray(course.tags) ? course.tags.join(', ') : course.tags || '',
            level: course.level || '',
            demoUrl: course.demoUrl || '',
            benefits: listToText(course.benefits).split('\n').length ? listToText(course.benefits).split('\n') : [''],
            prerequisites: listToText(course.prerequisites).split('\n').length ? listToText(course.prerequisites).split('\n') : [''],
          });
        }
      } catch (error) {
        console.error('Error fetching course:', error);
        if (active) setFormError(error.response?.data?.message || error.message || 'Unable to load this course.');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchCourse();
    return () => { active = false; };
  }, [editing, id]);

  const updateField = (field, value) => setForm((previous) => ({ ...previous, [field]: value }));

  const handleThumbnail = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateField('thumbnail', reader.result);
    reader.onerror = () => {
      setFormError('The selected image could not be read.');
      toast.error('The selected image could not be read');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    const price = Number(form.price);
    const estimatedPrice = Number(form.estimatedPrice);
    if (!Number.isFinite(price) || !Number.isFinite(estimatedPrice)) {
      setFormError('Enter valid course prices.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      estimatedPrice,
      tags: form.tags.trim(),
      level: form.level.trim(),
      demoUrl: form.demoUrl.trim(),
      benefits: form.benefits.map((title) => title.trim()).filter(Boolean).map((title) => ({ title })),
      prerequisites: form.prerequisites.map((title) => title.trim()).filter(Boolean).map((title) => ({ title })),
    };
    if (form.thumbnail) payload.thumbnail = form.thumbnail;

    setSaving(true);
    try {
      const response = editing
        ? await adminAPI.editCourse(id, payload)
        : await adminAPI.createCourse(payload);
      if (!response.data?.success) {
        throw new Error(response.data?.message || `Unable to ${editing ? 'update' : 'create'} this course.`);
      }
      toast.success(`Course ${editing ? 'updated' : 'created'} successfully`);
      navigate('/admin/courses');
    } catch (error) {
      console.error(`Error ${editing ? 'updating' : 'creating'} course:`, error);
      const message = error.response?.data?.message || error.message || 'Unable to save this course.';
      setFormError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const renderListFields = (field, label, placeholder) => (
    <div className="course-form-list">
      <div className="course-form-list-heading">
        <label>{label}</label>
        <button type="button" className="button button-secondary button-small" onClick={() => updateField(field, [...form[field], ''])}>
          <Plus size={15} /> Add item
        </button>
      </div>
      {form[field].map((value, index) => (
        <div className="course-form-list-row" key={`${field}-${index}`}>
          <input
            type="text"
            value={value}
            onChange={(event) => updateField(field, form[field].map((item, itemIndex) => itemIndex === index ? event.target.value : item))}
            placeholder={placeholder}
          />
          {form[field].length > 1 && (
            <button type="button" className="icon-button course-form-remove" onClick={() => updateField(field, form[field].filter((_, itemIndex) => itemIndex !== index))} aria-label={`Remove ${label.toLowerCase()} item`}>
              <Trash2 size={16} />
            </button>
          )}
        </div>
      ))}
    </div>
  );

  if (loading) {
    return <div className="state-card"><span className="button-spinner" /><p>Loading course details…</p></div>;
  }

  return (
    <section className="admin-course-form-page">
      <div className="page-heading">
        <div>
          <Link className="text-link" to="/admin/courses"><ArrowLeft size={16} /> Back to courses</Link>
          <h1>{editing ? 'Edit course' : 'Create a course'}</h1>
          <p>Manage the information learners see in the course catalog.</p>
        </div>
      </div>
      {formError && <div className="form-alert" role="alert">{formError}</div>}
      <form className="admin-course-form" onSubmit={handleSubmit}>
        <section className="course-form-section">
          <h2>Course information</h2>
          <div className="course-form-grid">
            <label className="course-form-field course-form-wide">Course title
              <input required value={form.name} onChange={(event) => updateField('name', event.target.value)} />
            </label>
            <label className="course-form-field course-form-wide">Description
              <textarea required rows={5} value={form.description} onChange={(event) => updateField('description', event.target.value)} />
            </label>
            <label className="course-form-field">Price
              <input required type="number" min="0" step="0.01" value={form.price} onChange={(event) => updateField('price', event.target.value)} />
            </label>
            <label className="course-form-field">Estimated price
              <input required type="number" min="0" step="0.01" value={form.estimatedPrice} onChange={(event) => updateField('estimatedPrice', event.target.value)} />
            </label>
            <label className="course-form-field">Level
              <input required value={form.level} onChange={(event) => updateField('level', event.target.value)} placeholder="Beginner, Intermediate…" />
            </label>
            <label className="course-form-field">Tags
              <input required value={form.tags} onChange={(event) => updateField('tags', event.target.value)} placeholder="design, illustration, typography" />
            </label>
            <label className="course-form-field course-form-wide">Demo URL
              <input required type="url" value={form.demoUrl} onChange={(event) => updateField('demoUrl', event.target.value)} placeholder="https://" />
            </label>
          </div>
        </section>

        <section className="course-form-section">
          <h2>Course thumbnail</h2>
          <label className="thumbnail-upload">
            <ImagePlus size={19} />
            <span>{form.thumbnail ? 'Replace thumbnail image' : 'Choose a thumbnail image'}</span>
            <input type="file" accept="image/*" onChange={handleThumbnail} />
          </label>
          {form.thumbnail && <img className="thumbnail-preview" src={form.thumbnail} alt="Course thumbnail preview" />}
        </section>

        <section className="course-form-section course-form-lists">
          {renderListFields('benefits', 'What learners will get', 'Add a course benefit')}
          {renderListFields('prerequisites', 'Prerequisites', 'Add a prerequisite')}
        </section>

        <div className="course-form-actions">
          <Link className="button button-secondary" to="/admin/courses">Cancel</Link>
          <button type="submit" className="button button-primary" disabled={saving}>
            {saving ? <><span className="button-spinner" /> Saving…</> : <><Save size={16} /> {editing ? 'Save changes' : 'Create course'}</>}
          </button>
        </div>
      </form>
    </section>
  );
};

export default AdminCourseForm;
