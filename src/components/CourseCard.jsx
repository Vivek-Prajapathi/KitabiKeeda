import { ArrowUpRight, BookOpen, Star, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const CourseCard = ({ course }) => {
  const tags = Array.isArray(course.tags)
    ? course.tags
    : typeof course.tags === 'string'
      ? course.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
      : [];
  const price = Number(course.price);

  return (
    <Link to={`/courses/${course._id}`} className="course-card">
      <div className="course-image-wrap">
        {course.thumbnail?.url ? (
          <img className="course-image" src={course.thumbnail.url} alt={course.name || 'Course'} />
        ) : (
          <div className="course-image-placeholder"><BookOpen size={35} /></div>
        )}
        {course.level && <span className="course-level">{course.level}</span>}
      </div>
      <div className="course-card-content">
        {tags[0] && <span className="course-category">{tags[0]}</span>}
        <h3>{course.name || 'Untitled course'}</h3>
        <p className="course-description">{course.description || 'Explore the course details to learn more.'}</p>
        <div className="course-card-meta">
          {course.rating != null && (
            <span><Star size={15} fill="currentColor" /> {course.rating}</span>
          )}
          {course.purchased != null && (
            <span><Users size={15} /> {course.purchased} learners</span>
          )}
          <span className="course-card-link">View course <ArrowUpRight size={15} /></span>
        </div>
        <div className="course-card-price">
          {Number.isFinite(price) ? (price === 0 ? 'Free' : `$${price.toFixed(2)}`) : 'View pricing'}
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
