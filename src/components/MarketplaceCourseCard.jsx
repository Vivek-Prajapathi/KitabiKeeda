import { ArrowUpRight, BookOpen, Heart, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const formatPrice = (price) => {
  const numericPrice = Number(price);
  if (price == null || !Number.isFinite(numericPrice)) return 'Price unavailable';
  return numericPrice === 0
    ? 'Free'
    : new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(numericPrice);
};

const MarketplaceCourseCard = ({ course, isWishlisted, wishlistLoading, onToggleWishlist }) => {
  const category = course.category?.title || course.category?.name || course.category
    || (typeof course.tags === 'string' ? course.tags.split(',')[0]?.trim() : course.tags?.[0])
    || 'General';
  const instructor = course.instructor?.name || course.instructorName || course.user?.name;
  const learners = Number(course.purchased);
  const hasLearnerCount = course.purchased != null && course.purchased !== '' && Number.isFinite(learners);

  return (
    <article className="lms-course-card">
      <div className="lms-course-art">
        {course.thumbnail?.url ? (
          <img src={course.thumbnail.url} alt={course.name || 'Course'} />
        ) : (
          <span className="lms-course-placeholder"><BookOpen size={34} /></span>
        )}
        <span className="lms-course-category">{category}</span>
        <button
          type="button"
          className={`lms-wishlist-button ${isWishlisted ? 'is-saved' : ''}`}
          onClick={() => onToggleWishlist(course)}
          disabled={wishlistLoading}
          aria-label={`${isWishlisted ? 'Remove' : 'Add'} ${course.name || 'course'} ${isWishlisted ? 'from' : 'to'} wishlist`}
          aria-pressed={isWishlisted}
        >
          <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="lms-course-card-body">
        <div className="lms-course-card-topline">
          {course.level && <span>{course.level}</span>}
          {hasLearnerCount && learners >= 0 && (
            <span className="lms-course-learner-count"><Users size={14} /> {learners}</span>
          )}
        </div>
        <h2>{course.name || 'Untitled course'}</h2>
        <p>{course.description || 'Course details are not available yet.'}</p>
        {instructor && <span className="lms-course-instructor">By {instructor}</span>}
        <div className="lms-course-card-footer">
          <strong>{formatPrice(course.price)}</strong>
          <Link to={`/marketplace/${course._id}`} className="lms-course-view-link">
            View course <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default MarketplaceCourseCard;
