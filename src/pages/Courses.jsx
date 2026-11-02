import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { courseAPI } from '../api/course';
import CourseCard from '../components/CourseCard';

const getCourses = (response) => {
  const data = response?.data;
  if (Array.isArray(data?.courses)) return data.courses;
  if (Array.isArray(data?.data?.courses)) return data.data.courses;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const courseTags = (course) => {
  const tags = Array.isArray(course?.tags)
    ? course.tags
    : typeof course?.tags === 'string'
      ? course.tags.split(',')
      : [];
  return tags.map((tag) => String(tag).trim()).filter(Boolean);
};

const categoryOf = (course) => {
  const category = course?.category;
  if (typeof category === 'string' && category.trim()) return category.trim();
  if (category && typeof category === 'object') return category.title || category.name || '';
  return courseTags(course)[0] || 'General';
};

const Courses = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const selectedCategory = searchParams.get('category') || 'all';

  useEffect(() => {
    let active = true;
    courseAPI.getCourses()
      .then((response) => {
        if (response.data?.success === false) {
          throw new Error(response.data.message || 'Courses could not be loaded.');
        }
        if (active) setCourses(getCourses(response));
      })
      .catch((error) => {
        console.error('Error fetching public courses:', error);
        if (active) setHasError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  const categories = useMemo(
    () => [...new Set(courses.map(categoryOf).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [courses],
  );

  const visibleCourses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return courses.filter((course) => {
      const matchesCategory = selectedCategory === 'all'
        || categoryOf(course).toLowerCase() === selectedCategory.toLowerCase();
      const searchableText = [course.name, course.description, categoryOf(course), ...courseTags(course)]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return matchesCategory && (!query || searchableText.includes(query));
    });
  }, [courses, searchQuery, selectedCategory]);

  return (
    <div className="catalog-page">
      <section className="catalog-hero">
        <div className="page-wrap">
          <span className="eyebrow eyebrow-muted">Explore KitabiKeeda</span>
          <h1>Find a course for <span>what’s next.</span></h1>
          <p>Browse the public course catalog, explore topics, and discover your next learning goal.</p>
        </div>
      </section>

      <section className="page-wrap catalog-content">
        <div className="catalog-toolbar">
          <label className="catalog-search">
            <Search size={18} aria-hidden="true" />
            <span className="visually-hidden">Search courses</span>
            <input
              type="search"
              placeholder="Search courses, skills, or topics"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </label>
          <label className="catalog-filter">
            <span className="visually-hidden">Filter by category</span>
            <select value={selectedCategory} onChange={(event) => {
              const next = new URLSearchParams(searchParams);
              if (event.target.value === 'all') next.delete('category');
              else next.set('category', event.target.value);
              setSearchParams(next);
            }}>
              <option value="all">All categories</option>
              {categories.map((category) => <option value={category} key={category}>{category}</option>)}
            </select>
          </label>
        </div>

        <div className="catalog-result-row">
          <h2>{selectedCategory === 'all' ? 'All courses' : selectedCategory}</h2>
          {!loading && !hasError && <span>{visibleCourses.length} {visibleCourses.length === 1 ? 'course' : 'courses'}</span>}
        </div>

        {loading ? (
          <div className="course-grid" aria-label="Loading courses">
            {[1, 2, 3].map((item) => <div key={item} className="course-skeleton" aria-hidden="true" />)}
          </div>
        ) : hasError ? (
          <div className="state-card state-error" role="alert">
            <BookOpen size={27} />
            <h3>Courses are unavailable right now</h3>
            <p>Please try again shortly.</p>
          </div>
        ) : visibleCourses.length ? (
          <div className="course-grid">
            {visibleCourses.map((course) => <CourseCard key={course._id} course={course} />)}
          </div>
        ) : (
          <div className="state-card">
            <BookOpen size={27} />
            <h3>{courses.length ? 'No courses match these filters' : 'No courses are available yet'}</h3>
            <p>{courses.length ? 'Try another search or category.' : 'Check back soon for new courses.'}</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Courses;
