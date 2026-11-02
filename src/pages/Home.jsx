import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BookOpen, Check, Compass, GraduationCap, Layers3, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { courseAPI } from '../api/course';
import CourseCard from '../components/CourseCard';

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchCourses = async () => {
      try {
        const response = await courseAPI.getCourses();
        if (active && response.data?.success !== false) {
          const courses = response.data.courses || response.data.data?.courses || response.data.data;
          setCourses(Array.isArray(courses) ? courses : []);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        if (active) setHasError(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchCourses();
    return () => { active = false; };
  }, []);

  const categories = useMemo(() => {
    const tags = courses.flatMap((course) => {
      if (Array.isArray(course.tags)) return course.tags;
      return typeof course.tags === 'string' ? course.tags.split(',') : [];
    });
    const seen = new Set();
    return tags.map((tag) => String(tag).trim()).filter((tag) => {
      const key = tag.toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 4);
  }, [courses]);

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-inner">
          <div className="home-hero-copy">
            <span className="eyebrow"><span className="eyebrow-dot" /> Learning that moves you forward</span>
            <h1>Build skills for the <span>work you want.</span></h1>
            <p>Discover thoughtfully designed courses and learn from wherever you are. Your next chapter starts with one good lesson.</p>
            <div className="hero-actions">
              <Link to="/courses" className="button button-primary button-large">Explore courses <ArrowRight size={18} /></Link>
              <Link to="/register" className="button button-secondary button-large"><PlayCircle size={18} /> Start learning</Link>
            </div>
            <div className="hero-assurance">
              <span><Check size={15} /> Learn at your own pace</span>
              <span><Check size={15} /> Pick up where you left off</span>
            </div>
          </div>
          <div className="home-hero-art" aria-label="Explore a curated collection of online courses">
            <div className="hero-art-orbit orbit-one" />
            <div className="hero-art-orbit orbit-two" />
            <div className="hero-art-book"><BookOpen size={62} strokeWidth={1.4} /></div>
            <div className="hero-art-card hero-art-card-top">
              <span className="hero-art-icon violet"><GraduationCap size={19} /></span>
              <span><strong>Learn something new</strong><small>One lesson at a time</small></span>
            </div>
            <div className="hero-art-card hero-art-card-bottom">
              <span className="hero-art-icon navy"><Layers3 size={19} /></span>
              <span><strong>Your next skill</strong><small>Starts right here</small></span>
            </div>
            <span className="hero-art-spark spark-one">✦</span>
            <span className="hero-art-spark spark-two">✦</span>
          </div>
        </div>
      </section>

      <section className="category-section">
        <div className="page-wrap">
          <div className="category-intro">
            <span className="eyebrow eyebrow-muted">Find your focus</span>
            <h2>Explore by interest</h2>
          </div>
          {categories.length > 0 ? (
            <div className="category-list">
              {categories.map((category) => (
                <Link
                  key={category}
                  to={`/courses?category=${encodeURIComponent(category)}`}
                  className="category-chip"
                >
                  <Compass size={17} /> {category} <ArrowRight size={15} />
                </Link>
              ))}
              <Link to="/courses" className="category-chip category-chip-all">All courses <ArrowRight size={15} /></Link>
            </div>
          ) : (
            <Link to="/courses" className="category-chip category-chip-all">Browse all courses <ArrowRight size={15} /></Link>
          )}
        </div>
      </section>

      <section className="featured-section">
        <div className="page-wrap">
          <div className="section-title-row">
            <div>
              <span className="eyebrow eyebrow-muted">Keep growing</span>
              <h2>Courses to get you started</h2>
              <p>Find a new interest, deepen a skill, or take the next step in your career.</p>
            </div>
            <Link className="text-link" to="/courses">Browse all courses <ArrowRight size={17} /></Link>
          </div>
          {loading ? (
            <div className="course-grid">
              {[1, 2, 3].map((item) => <div key={item} className="course-skeleton" aria-hidden="true" />)}
            </div>
          ) : hasError ? (
            <div className="state-card state-error">
              <BookOpen size={27} />
              <h3>Courses are unavailable right now</h3>
              <p>Please try again shortly, or browse the catalog directly.</p>
              <Link className="button button-secondary" to="/courses">Open course catalog</Link>
            </div>
          ) : courses.length > 0 ? (
            <div className="course-grid">
              {courses.slice(0, 3).map((course) => <CourseCard key={course._id} course={course} />)}
            </div>
          ) : (
            <div className="state-card">
              <BookOpen size={27} />
              <h3>New courses are on the way</h3>
              <p>There are no courses to feature just yet. Check back soon.</p>
            </div>
          )}
        </div>
      </section>

      <section className="benefits-section">
        <div className="page-wrap benefits-layout">
          <div className="benefits-intro">
            <span className="eyebrow eyebrow-muted">A better way to learn</span>
            <h2>Learning should fit your life.</h2>
            <p>Build momentum with a learning experience designed to make it easier to start, stay curious, and keep making progress.</p>
            <Link to="/courses" className="text-link">Find your next course <ArrowRight size={17} /></Link>
          </div>
          <div className="benefit-list">
            <article className="benefit-item">
              <span className="benefit-icon"><BookOpen size={20} /></span>
              <div><h3>Learn by doing</h3><p>Explore practical courses made to help you apply what you learn.</p></div>
            </article>
            <article className="benefit-item">
              <span className="benefit-icon"><PlayCircle size={20} /></span>
              <div><h3>Move at your pace</h3><p>Study when it works for you and return to your courses whenever you need.</p></div>
            </article>
            <article className="benefit-item">
              <span className="benefit-icon"><GraduationCap size={20} /></span>
              <div><h3>Keep your progress</h3><p>Track your learning journey and celebrate the milestones you earn.</p></div>
            </article>
          </div>
        </div>
      </section>

      <section className="home-cta-section">
        <div className="page-wrap">
          <div className="home-cta">
            <div><span className="eyebrow">Your next step starts here</span><h2>Make learning part of your everyday.</h2><p>Explore the catalog and find a course that meets you where you are.</p></div>
            <Link to="/courses" className="button button-light button-large">Explore courses <ArrowRight size={18} /></Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
