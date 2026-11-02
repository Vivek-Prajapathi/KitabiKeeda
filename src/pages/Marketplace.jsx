import { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, Search, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import { lmsAPI } from '../api/lms';
import LMSNavigation from '../components/LMSNavigation';
import MarketplaceCourseCard from '../components/MarketplaceCourseCard';
import { useAuth } from '../hooks/useAuth';

const getList = (response, keys) => {
  const data = response?.data ?? response;
  if (Array.isArray(data)) return data;
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
    if (Array.isArray(data?.data?.[key])) return data.data[key];
  }
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const courseIdOf = (entry) =>
  entry?.courseId?._id || entry?.courseId || entry?.course?._id || entry?._id;
const EMPTY_SET = new Set();
const fetchAllPublishedCourses = async () => {
  const firstResponse = await lmsAPI.getCourses({ page: 1 });
  if (!firstResponse.data?.success) {
    throw new Error(firstResponse.data?.message || 'Unable to load courses.');
  }
  const firstPageCourses = getList(firstResponse, ['courses']);
  const total = Number.isFinite(Number(firstResponse.data.total))
    && firstResponse.data.total != null
    && firstResponse.data.total !== ''
    ? Number(firstResponse.data.total)
    : firstPageCourses.length;
  const limit = Number(firstResponse.data.limit);
  const pageCount = Number.isFinite(limit) && limit > 0 ? Math.ceil(total / limit) : 1;
  const pages = await Promise.all(
    Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) =>
      lmsAPI.getCourses({ page: index + 2 })
    )
  );
  const rest = pages.flatMap((response) => {
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Some marketplace courses could not be loaded.');
    }
    return getList(response, ['courses']);
  });
  const byId = new Map([...firstPageCourses, ...rest].map((course, index) => [course._id || `course-${index}`, course]));
  return { courses: [...byId.values()], total };
};

const tagList = (tags) => Array.isArray(tags)
  ? tags.map((tag) => String(tag).trim()).filter(Boolean)
  : typeof tags === 'string'
    ? tags.split(',').map((tag) => tag.trim()).filter(Boolean)
    : [];
const matchesCategory = (course, selected) => {
  const rawCategory = course?.category;
  const category = typeof rawCategory === 'string'
    ? rawCategory
    : rawCategory?.title || rawCategory?.name;
  const normalized = selected.toLowerCase();
  if (normalized === 'general' && !category) return true;
  return [category, ...tagList(course?.tags)]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase() === normalized);
};

const Marketplace = () => {
  const { isAuthenticated, user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [savedWishlistOwner, setSavedWishlistOwner] = useState(null);
  const [savedWishlistIds, setSavedWishlistIds] = useState(() => new Set());
  const searchRequestId = useRef(0);
  const currentUserId = user?._id || user?.id || user?.email;
  const wishlistIds = isAuthenticated && String(savedWishlistOwner) === String(currentUserId)
    ? savedWishlistIds
    : EMPTY_SET;
  const [wishlistLoadingId, setWishlistLoadingId] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category') || 'all';

  useEffect(() => {
    let active = true;
    const fetchMarketplace = async () => {
      const [courseResult, categoryResult] = await Promise.allSettled([
        fetchAllPublishedCourses(),
        lmsAPI.getCategories(),
      ]);
      if (!active) return;

      if (courseResult.status === 'fulfilled') {
        setCourses(courseResult.value.courses);
        setTotalCourses(courseResult.value.total);
      } else {
        console.error('Error fetching courses:', courseResult.reason);
        setHasError(true);
      }

      if (categoryResult.status === 'fulfilled') {
        setCategoryData(getList(categoryResult.value, ['categories']));
      } else {
        console.error('Error fetching marketplace categories:', categoryResult.reason);
        toast.error(categoryResult.reason.response?.data?.message || 'Marketplace categories could not be loaded.');
      }
      setLoading(false);
    };

    fetchMarketplace();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

    let active = true;
    lmsAPI.getWishlist()
      .then((response) => {
        if (!active) return;
        if (response.data?.success === false) {
          throw new Error(response.data.message || 'Wishlist data could not be loaded.');
        }
        setSavedWishlistIds(new Set(getList(response, ['wishlist', 'courses']).map(courseIdOf).filter(Boolean).map(String)));
        setSavedWishlistOwner(currentUserId);
      })
      .catch((error) => {
        console.error('Error loading marketplace wishlist:', error);
        if (active) toast.error(error.response?.data?.message || error.message || 'Wishlist data could not be loaded.');
      });
    return () => { active = false; };
  }, [currentUserId, isAuthenticated]);

  const categories = useMemo(() => {
    const names = new Map();
    categoryData.forEach((item) => {
      const title = item.title || item.name || item.category;
      if (typeof title === 'string' && title.trim()) {
        const count = item.count != null && item.count !== '' && Number.isFinite(Number(item.count))
          ? Number(item.count)
          : null;
        names.set(title.trim(), count);
      }
    });
    if (!names.has('General')) {
      const generalCount = courses.filter((course) => {
        const category = course.category;
        const name = typeof category === 'string' ? category : category?.title || category?.name;
        return !name || String(name).toLowerCase() === 'general';
      }).length;
      names.set('General', generalCount);
    }
    return [...names.entries()].map(([name, count]) => ({ name, count }));
  }, [categoryData, courses]);

  const filteredCourses = useMemo(() => {
    if (selectedCategory === 'all') return courses;
    return courses.filter((course) => matchesCategory(course, selectedCategory));
  }, [courses, selectedCategory]);

  const handleSearch = async (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    setSearchError('');
    if (!query) {
      clearSearch();
      return;
    }

    const requestId = ++searchRequestId.current;
    setSearching(true);
    try {
      const response = await lmsAPI.searchCourses(query);
      if (response.data?.success === false) {
        throw new Error(response.data.message || 'Course search failed.');
      }
      const results = getList(response, ['courses', 'results']);
      if (requestId !== searchRequestId.current) return;
      setCourses(results);
      setSubmittedQuery(query);
    } catch (error) {
      if (requestId !== searchRequestId.current) return;
      console.error('Error searching courses:', error);
      setSearchError(error.response?.data?.message || error.message || 'Unable to search courses right now.');
      setCourses([]);
      setSubmittedQuery(query);
    } finally {
      if (requestId === searchRequestId.current) setSearching(false);
    }
  };

  const clearSearch = () => {
    searchRequestId.current += 1;
    setSearching(false);
    setSearchQuery('');
    setSubmittedQuery('');
    setSearchError('');
    setLoading(true);
    fetchAllPublishedCourses()
      .then(({ courses: listedCourses, total }) => {
        setCourses(listedCourses);
        setTotalCourses(total);
        setHasError(false);
      })
      .catch((error) => {
        console.error('Error reloading courses:', error);
        setHasError(true);
      })
      .finally(() => setLoading(false));
  };

  const updateCategory = (category) => {
    setSearchParams(category === 'all' ? {} : { category });
  };

  const handleWishlistToggle = async (course) => {
    if (!isAuthenticated) {
      toast.error('Sign in to save courses to your wishlist.');
      return;
    }
    const id = String(course._id);
    setWishlistLoadingId(id);
    try {
      const response = await lmsAPI.toggleWishlist({ courseId: id });
      if (typeof response.data?.wishlisted !== 'boolean') {
        throw new Error('The wishlist response did not include its updated status.');
      }
      setSavedWishlistIds((current) => {
        const next = new Set(current);
        if (response.data.wishlisted) next.add(id);
        else next.delete(id);
        return next;
      });
      setSavedWishlistOwner(currentUserId);
      toast.success(response.data.wishlisted ? 'Course added to wishlist.' : 'Course removed from wishlist.');
    } catch (error) {
      console.error('Error updating marketplace wishlist:', error);
      toast.error(error.response?.data?.message || error.message || 'Unable to update your wishlist.');
    } finally {
      setWishlistLoadingId(null);
    }
  };

  const visibleCount = submittedQuery
    ? filteredCourses.length
    : selectedCategory === 'all'
      ? totalCourses
      : (categories.find(({ name }) => name.toLowerCase() === selectedCategory.toLowerCase())?.count ?? filteredCourses.length);

  return (
    <div className="lms-area marketplace-page">
      <Toaster position="top-right" richColors />
      <LMSNavigation />
      <section className="lms-marketplace-hero">
        <div className="lms-page-wrap">
          <span className="lms-eyebrow">Learn something that matters</span>
          <h1>Find your next course.</h1>
          <p>Explore practical courses, build new skills, and keep moving forward.</p>
          <form className="lms-search-form" onSubmit={handleSearch} role="search">
            <Search size={19} aria-hidden="true" />
            <label className="visually-hidden" htmlFor="marketplace-search">Search published courses</label>
            <input
              id="marketplace-search"
              type="text"
              inputMode="search"
              placeholder="Search courses, skills, or topics"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  handleSearch(event);
                }
              }}
            />
            {searchQuery && (
              <button type="button" className="lms-search-clear" onClick={clearSearch} aria-label="Clear search">
                <X size={17} />
              </button>
            )}
            <button type="submit" className="lms-button-primary" disabled={searching}>
              {searching ? 'Searching…' : 'Search'}
            </button>
          </form>
        </div>
      </section>

      <section className="lms-page-wrap lms-marketplace-content">
        <div className="lms-category-row" role="group" aria-label="Filter courses by category">
          <button type="button" className={selectedCategory === 'all' ? 'is-active' : ''} onClick={() => updateCategory('all')}>
            All Courses <span>{totalCourses}</span>
          </button>
          {categories.map(({ name, count }) => (
            <button
              type="button"
              key={name}
              className={selectedCategory.toLowerCase() === name.toLowerCase() ? 'is-active' : ''}
              onClick={() => updateCategory(name)}
            >
              {name} <span>{count ?? '—'}</span>
            </button>
          ))}
        </div>

        <div className="lms-section-heading">
          <div>
            <span className="lms-eyebrow">Marketplace</span>
            <h2>{selectedCategory === 'all' ? 'Explore courses' : selectedCategory}</h2>
          </div>
          {!loading && !hasError && <span>{visibleCount} {visibleCount === 1 ? 'course' : 'courses'}</span>}
        </div>

        {searchError && <div className="lms-state lms-state-error" role="alert">{searchError}</div>}
        {loading || searching ? (
          <div className="lms-course-grid" aria-label="Loading courses">
            {[1, 2, 3].map((item) => <div key={item} className="lms-course-skeleton" />)}
          </div>
        ) : hasError ? (
          <div className="lms-state lms-state-error">
            <BookOpen size={30} />
            <h3>Courses couldn’t be loaded</h3>
            <p>Please check your connection and try again.</p>
            <button type="button" className="lms-button-secondary" onClick={() => window.location.reload()}>Try again</button>
          </div>
        ) : filteredCourses.length ? (
          <div className="lms-course-grid">
            {filteredCourses.map((course) => (
              <MarketplaceCourseCard
                key={course._id}
                course={course}
                isWishlisted={wishlistIds.has(String(course._id))}
                wishlistLoading={wishlistLoadingId === String(course._id)}
                onToggleWishlist={handleWishlistToggle}
              />
            ))}
          </div>
        ) : (
          <div className="lms-state">
            <BookOpen size={30} />
            <h3>{submittedQuery ? 'No courses match your search' : 'No courses in this category yet'}</h3>
            <p>{submittedQuery ? `No published courses were found for “${submittedQuery}”.` : 'Try another category or explore all courses.'}</p>
            {(submittedQuery || selectedCategory !== 'all') && (
              <button type="button" className="lms-button-secondary" onClick={() => { clearSearch(); updateCategory('all'); }}>
                Clear filters
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default Marketplace;
