import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowUpRight, Award, BookOpen, CalendarDays, CheckCircle2, Clock3, Download,
  Heart, Layers3, LoaderCircle, RotateCw, ShoppingBag, TrendingUp, X,
} from 'lucide-react';
import { toast } from 'sonner';
import { lmsAPI } from '../api/lms';
import LMSNavigation from '../components/LMSNavigation';

const tabs = [
  { id: 'courses', label: 'My Courses', icon: BookOpen },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'certificates', label: 'Certificates', icon: Award },
  { id: 'purchases', label: 'Purchases', icon: ShoppingBag },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
];

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

const courseOf = (entry) => entry?.course || (entry?.courseId && typeof entry.courseId === 'object' ? entry.courseId : null);
const courseIdOf = (entry) => courseOf(entry)?._id || entry?.courseId?._id || entry?.courseId || entry?._id;
const uniqueByCourse = (items) => {
  const seen = new Set();
  return items.filter((item) => {
    const id = courseIdOf(item);
    if (id == null) return true;
    const key = String(id);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};
const progressOf = (enrollment) => {
  if (enrollment?.completed === true) return 100;
  const raw = enrollment?.progress ?? enrollment?.progressPercentage ?? enrollment?.completionPercentage;
  const progress = Number(raw);
  return raw != null && raw !== '' && Number.isFinite(progress) ? Math.min(100, Math.max(0, progress)) : null;
};
const formatDate = (value) => {
  if (!value) return 'Unavailable';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Unavailable' : date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};
const statusClass = (status) => {
  const normalized = String(status || '').toLowerCase();
  if (['succeeded', 'paid', 'completed', 'success'].includes(normalized)) return 'is-success';
  if (['pending', 'processing', 'created'].includes(normalized)) return 'is-pending';
  if (['failed', 'cancelled', 'canceled', 'refunded'].includes(normalized)) return 'is-failed';
  return '';
};
const EMPTY_ITEMS = [];

const MyLearning = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab');
  const activeTab = tabs.some(({ id }) => id === requestedTab) ? requestedTab : 'courses';
  const [tabData, setTabData] = useState({});
  const [downloadingId, setDownloadingId] = useState(null);
  const [viewingCertificate, setViewingCertificate] = useState(null);
  const [certificateLoadingId, setCertificateLoadingId] = useState(null);
  const [removingWishlistId, setRemovingWishlistId] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [orderDetails, setOrderDetails] = useState({});
  const [loadingOrderId, setLoadingOrderId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    const loadActiveTab = async () => {
      setTabData((current) => ({ ...current, [activeTab]: { ...current[activeTab], loading: true, error: '' } }));
      try {
        let response;
        if (activeTab === 'courses' || activeTab === 'progress') response = await lmsAPI.getMyLearning();
        if (activeTab === 'certificates') response = await lmsAPI.getCertificates();
        if (activeTab === 'purchases') response = await lmsAPI.getPurchases();
        if (activeTab === 'wishlist') response = await lmsAPI.getWishlist();

        if (response?.data?.success === false) {
          throw new Error(response.data.message || 'The requested learning data could not be loaded.');
        }

        const keys = activeTab === 'courses' || activeTab === 'progress'
          ? ['enrolledCourses', 'enrollments', 'courses']
          : activeTab === 'certificates'
            ? ['certificates']
            : activeTab === 'purchases'
              ? ['purchases', 'orders']
              : ['wishlist', 'courses'];
        const items = getList(response, keys);
        let data = activeTab === 'courses' || activeTab === 'progress'
          ? uniqueByCourse(items)
          : items;
        if (activeTab === 'wishlist') {
          data = await Promise.all(items.map(async (entry) => {
            const embeddedCourse = entry?.name ? entry : courseOf(entry);
            if (embeddedCourse?.name) return { ...entry, course: embeddedCourse };
            const courseId = courseIdOf(entry);
            if (!courseId) return entry;
            try {
              const courseResponse = await lmsAPI.getCourseDetail(courseId);
              const course = courseResponse.data?.course
                || courseResponse.data?.data?.course
                || courseResponse.data?.data
                || courseResponse.data;
              return course?.name ? { ...entry, course } : entry;
            } catch (courseError) {
              console.error(`Error loading wishlist course ${courseId}:`, courseError);
              return entry;
            }
          }));
        }

        if (active) setTabData((current) => ({ ...current, [activeTab]: { data, loading: false, error: '' } }));
      } catch (error) {
        console.error(`Error loading ${activeTab}:`, error);
        if (active) {
          setTabData((current) => ({
            ...current,
            [activeTab]: {
              data: current[activeTab]?.data || [],
              loading: false,
              error: error.response?.data?.message || error.message || 'Unable to load this section.',
            },
          }));
        }
      }
    };

    loadActiveTab();
    return () => { active = false; };
  }, [activeTab, refreshKey]);

  const items = tabData[activeTab]?.data || EMPTY_ITEMS;
  const loading = tabData[activeTab]?.loading ?? true;
  const error = tabData[activeTab]?.error;

  const progressStats = useMemo(() => {
    const progressValues = items.map(progressOf).filter((value) => value != null);
    const completed = items.filter((item) => item.completed === true || progressOf(item) === 100).length;
    const activityDates = items
      .map((item) => item.lastActivityAt || item.lastAccessedAt || item.updatedAt || item.completedAt)
      .map((value) => value ? new Date(value) : null)
      .filter((date) => date && !Number.isNaN(date.getTime()))
      .sort((a, b) => b - a);
    return {
      total: items.length,
      completed,
      inProgress: items.length - completed,
      average: progressValues.length
        ? Math.round(progressValues.reduce((total, value) => total + value, 0) / progressValues.length)
        : null,
      lastActivity: activityDates[0] || null,
    };
  }, [items]);

  const handleCertificateDownload = async (certificate) => {
    const id = certificate._id || certificate.id;
    if (!id) {
      toast.error('This certificate does not include a download identifier.');
      return;
    }
    setDownloadingId(id);
    try {
      const response = await lmsAPI.downloadCertificate(id);
      const fileUrl = URL.createObjectURL(response.data);
      const anchor = document.createElement('a');
      anchor.href = fileUrl;
      anchor.download = `${String(certificate.courseName || 'course').replace(/[^a-z0-9-_]/gi, '-')}-certificate.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
    } catch (downloadError) {
      console.error('Error downloading certificate:', downloadError);
      toast.error(downloadError.response?.data?.message || 'Unable to download certificate.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleViewCertificate = async (certificate) => {
    const id = certificate._id || certificate.id;
    if (!id) {
      setViewingCertificate(certificate);
      return;
    }
    setCertificateLoadingId(id);
    try {
      const response = await lmsAPI.getCertificate(id);
      const detail = response.data?.certificate || response.data?.data?.certificate || response.data?.data || response.data;
      setViewingCertificate(detail);
    } catch (viewError) {
      console.error('Error loading certificate details:', viewError);
      toast.error(viewError.response?.data?.message || 'Unable to view certificate details.');
    } finally {
      setCertificateLoadingId(null);
    }
  };

  const handleRemoveWishlist = async (item) => {
    const courseId = courseIdOf(item);
    if (!courseId) {
      toast.error('This wishlist entry does not include a course identifier.');
      return;
    }
    setRemovingWishlistId(String(courseId));
    try {
      const response = await lmsAPI.toggleWishlist({ courseId });
      if (typeof response.data?.wishlisted !== 'boolean') {
        throw new Error('The wishlist response did not include its updated status.');
      }
      if (response.data.wishlisted) {
        throw new Error('The course is still on your wishlist. Refresh and try again.');
      }
      setTabData((current) => ({
        ...current,
        wishlist: { ...current.wishlist, data: current.wishlist.data.filter((entry) => String(courseIdOf(entry)) !== String(courseId)) },
      }));
      toast.success('Course removed from your wishlist.');
    } catch (removeError) {
      console.error('Error removing wishlist course:', removeError);
      toast.error(removeError.response?.data?.message || removeError.message || 'Unable to remove this course.');
    } finally {
      setRemovingWishlistId(null);
    }
  };

  const handleOrderDetails = async (order) => {
    const id = order._id || order.id;
    if (!id) {
      toast.error('This order does not include an order identifier.');
      return;
    }
    if (expandedOrderId === id) {
      setExpandedOrderId(null);
      return;
    }
    setExpandedOrderId(id);
    if (orderDetails[id]) return;

    setLoadingOrderId(id);
    try {
      const response = await lmsAPI.getOrder(id);
      const detail = response.data?.order
        || response.data?.data?.order
        || response.data?.data
        || response.data;
      if (response.data?.success === false) throw new Error(response.data.message || 'Order details could not be loaded.');
      setOrderDetails((current) => ({ ...current, [id]: detail }));
    } catch (detailError) {
      console.error('Error loading order details:', detailError);
      toast.error(detailError.response?.data?.message || detailError.message || 'Unable to load order details.');
    } finally {
      setLoadingOrderId(null);
    }
  };

  const setTab = (tab) => {
    setSearchParams(tab === 'courses' ? {} : { tab });
  };

  const renderLoading = () => (
    <div className="lms-learning-skeletons" aria-label={`Loading ${activeTab}`}>
      {[1, 2, 3].map((item) => <div key={item} className="lms-learning-skeleton" />)}
    </div>
  );

  const renderEmpty = (title, description) => (
    <div className="lms-state">
      {activeTab === 'certificates' ? <Award size={31} /> : activeTab === 'wishlist' ? <Heart size={31} /> : <BookOpen size={31} />}
      <h3>{title}</h3>
      <p>{description}</p>
      {(activeTab === 'courses' || activeTab === 'wishlist') && (
        <Link to="/marketplace" className="lms-button-primary">Explore courses</Link>
      )}
    </div>
  );

  const renderCourses = (progressView = false) => {
    if (!items.length) return renderEmpty('No enrolled courses yet', 'Your enrolled courses and learning activity will appear here.');
    if (progressView) {
      return (
        <>
          <div className="lms-progress-stats">
            {[
              ['Total Enrollments', progressStats.total, Layers3],
              ['Completed', progressStats.completed, CheckCircle2],
              ['In Progress', progressStats.inProgress, TrendingUp],
              ['Average Progress', progressStats.average == null ? 'Unavailable' : `${progressStats.average}%`, BookOpen],
              ['Last Activity', progressStats.lastActivity ? formatDate(progressStats.lastActivity) : 'Unavailable', Clock3],
            ].map(([label, value, Icon]) => (
              <article className="lms-stat-card" key={label}>
                <span><Icon size={18} /></span>
                <div><small>{label}</small><strong>{value}</strong></div>
              </article>
            ))}
          </div>
          <h2 className="lms-list-heading">Course progress</h2>
          <div className="lms-learning-grid">
            {items.map((enrollment, index) => {
              const course = courseOf(enrollment);
              const courseId = courseIdOf(enrollment);
              const progress = progressOf(enrollment);
              const completed = enrollment.completed === true || progress === 100;
              return (
                <article className="lms-learning-card" key={enrollment._id || courseId || index}>
                  <CourseArtwork course={course} />
                  <div className="lms-learning-card-body">
                    <span className={`lms-status-badge ${completed ? 'is-success' : 'is-progress'}`}>
                      {completed ? 'Completed' : 'In Progress'}
                    </span>
                    <h3>{course?.name || 'Course'}</h3>
                    {progress == null ? (
                      <p className="lms-muted-line">Progress unavailable</p>
                    ) : (
                      <>
                        <div className="lms-progress-label"><span>Progress</span><strong>{progress}%</strong></div>
                        <div className="lms-progress-track" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
                          <span style={{ width: `${progress}%` }} />
                        </div>
                      </>
                    )}
                  </div>
                  {courseId && <Link className="lms-inline-link" to={`/marketplace/${courseId}`}>Open <ArrowUpRight size={15} /></Link>}
                </article>
              );
            })}
          </div>
        </>
      );
    }

    return (
      <>
        <div className="lms-list-summary"><strong>{items.length}</strong> {items.length === 1 ? 'course' : 'courses'}</div>
        <div className="lms-learning-grid">
          {items.map((enrollment, index) => {
            const course = courseOf(enrollment);
            const courseId = courseIdOf(enrollment);
            const progress = progressOf(enrollment);
            return (
              <article className="lms-learning-card lms-enrolled-course" key={enrollment._id || courseId || index}>
                <CourseArtwork course={course} />
                <div className="lms-learning-card-body">
                  <h3>{course?.name || 'Course'}</h3>
                  <p>{course?.description || 'Course description unavailable.'}</p>
                  <div className="lms-progress-label">
                    <span>{progress == null ? 'Progress unavailable' : `${progress}% complete`}</span>
                    {enrollment.completed && <span className="lms-status-badge is-success">Completed</span>}
                  </div>
                  {progress != null && (
                    <div className="lms-progress-track" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
                      <span style={{ width: `${progress}%` }} />
                    </div>
                  )}
                  {courseId ? (
                    <Link className="lms-button-primary" to={`/marketplace/${courseId}`}>
                      {progress > 0 ? 'Continue Learning' : 'Start Learning'} <ArrowUpRight size={16} />
                    </Link>
                  ) : <span className="lms-muted-line">Course link unavailable</span>}
                </div>
              </article>
            );
          })}
        </div>
      </>
    );
  };

  const renderCertificates = () => {
    if (!items.length) return renderEmpty('No certificates yet', 'Certificates will appear here when available.');
    return (
      <div className="lms-certificate-grid">
        {items.map((certificate, index) => {
          const id = certificate._id || certificate.id || index;
          const student = certificate.student?.name || certificate.user?.name || certificate.studentId?.name || certificate.userId?.name || certificate.studentName;
          return (
            <article className="lms-certificate-card" key={id}>
              <span className="lms-certificate-icon"><Award size={23} /></span>
              <div className="lms-learning-card-body">
                <span className="lms-eyebrow">Certificate</span>
                <h3>{certificate.courseName || certificate.course?.name || certificate.courseId?.name || 'Course certificate'}</h3>
                {student && <p>{student}</p>}
                <p><CalendarDays size={14} /> Issued {formatDate(certificate.issuedAt || certificate.createdAt)}</p>
                {certificate.status && <span className={`lms-status-badge ${statusClass(certificate.status)}`}>{certificate.status}</span>}
              </div>
              <div className="lms-certificate-actions">
                <button type="button" className="lms-button-secondary" onClick={() => handleViewCertificate(certificate)} disabled={certificateLoadingId === id}>
                  {certificateLoadingId === id ? <LoaderCircle size={16} className="lms-spin" /> : <ArrowUpRight size={16} />}
                  View
                </button>
                <button type="button" className="lms-button-primary" onClick={() => handleCertificateDownload(certificate)} disabled={downloadingId === id}>
                  {downloadingId === id ? <LoaderCircle size={16} className="lms-spin" /> : <Download size={16} />}
                  Download
                </button>
              </div>
            </article>
          );
        })}
      </div>
    );
  };

  const renderPurchases = () => {
    if (!items.length) return renderEmpty('No purchases yet', 'Your course orders will appear here after you make a purchase.');
    return (
      <div className="lms-purchase-list">
        {items.map((order, index) => {
          const id = order._id || order.id || `order-${index}`;
          const detail = orderDetails[id] || order;
          const course = courseOf(detail);
          const courseId = course?._id || (typeof detail.courseId === 'string' ? detail.courseId : null);
          const payment = detail.payment_info || detail.paymentInfo || {};
          const status = payment.status || detail.paymentStatus || detail.status;
          const amount = payment.amount ?? detail.amount ?? detail.totalAmount ?? detail.total;
          const currency = payment.currency || detail.currency || 'USD';
          const hasAmount = amount != null && Number.isFinite(Number(amount));
          const expanded = expandedOrderId === id;
          return (
            <article className="lms-purchase-card" key={id}>
              <span className="lms-purchase-icon"><ShoppingBag size={20} /></span>
              <div className="lms-purchase-main">
                <strong>{course?.name || detail.productName || 'Course purchase'}</strong>
                <span>Order ID: {id}</span>
                {courseId && <span><Link to={`/marketplace/${courseId}`}>View course details <ArrowUpRight size={13} /></Link></span>}
                <span><CalendarDays size={14} /> {formatDate(detail.createdAt || detail.purchaseDate)}</span>
              </div>
              <div className="lms-purchase-amount">
                <strong>{hasAmount ? new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(Number(amount) / (payment.amountInMinorUnits ? 100 : 1)) : 'Amount unavailable'}</strong>
                <span className={`lms-status-badge ${statusClass(status)}`}>{status || 'Status unavailable'}</span>
              </div>
              <button type="button" className="lms-button-secondary" onClick={() => handleOrderDetails(order)} aria-expanded={expanded} disabled={loadingOrderId === id}>
                {loadingOrderId === id ? 'Loading…' : expanded ? 'Hide details' : 'Order details'}
              </button>
              {expanded && (
                <div className="lms-order-details">
                  <span><strong>Payment status</strong>{status || 'Unavailable'}</span>
                  <span><strong>Order status</strong>{detail.orderStatus || detail.status || 'Unavailable'}</span>
                  <span><strong>Amount</strong>{hasAmount ? new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(Number(amount) / (payment.amountInMinorUnits ? 100 : 1)) : 'Unavailable'}</span>
                  {payment.id && <span><strong>Payment reference</strong>{payment.id}</span>}
                  {course?.name && <span><strong>Course</strong>{course.name}</span>}
                </div>
              )}
            </article>
          );
        })}
      </div>
    );
  };

  const renderWishlist = () => {
    if (!items.length) return renderEmpty('Your wishlist is empty', 'Save courses you are interested in and find them here later.');
    return (
      <div className="lms-learning-grid">
        {uniqueByCourse(items).map((entry, index) => {
          const course = courseOf(entry) || entry;
          const courseId = courseIdOf(entry);
          const price = course.price != null && Number.isFinite(Number(course.price))
            ? (Number(course.price) === 0 ? 'Free' : new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(Number(course.price)))
            : 'Price unavailable';
          return (
            <article className="lms-learning-card lms-wishlist-card" key={courseId || index}>
              <CourseArtwork course={course} />
              <div className="lms-learning-card-body">
                <span className="lms-eyebrow">{course.category?.title || course.category?.name || course.category || 'Course'}</span>
                <h3>{course.name || 'Course'}</h3>
                <p>{course.description || 'Course description unavailable.'}</p>
                <strong className="lms-wishlist-price">{price}</strong>
                <div className="lms-card-actions">
                  {courseId && <Link to={`/marketplace/${courseId}`} className="lms-button-primary">View Course <ArrowUpRight size={15} /></Link>}
                  <button type="button" className="lms-button-secondary" onClick={() => handleRemoveWishlist(entry)} disabled={removingWishlistId === String(courseId)}>
                    {removingWishlistId === String(courseId) ? 'Removing…' : <><X size={15} /> Remove</>}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    );
  };

  return (
    <section className="lms-area lms-learning-page">
      <LMSNavigation />
      <div className="lms-learning-wrap">
        <header className="lms-learning-heading">
          <div>
            <span className="lms-eyebrow">Your learning space</span>
            <h1>My Learning</h1>
          </div>
          {!loading && !error && <span className="lms-learning-heading-count">{items.length} {items.length === 1 ? 'item' : 'items'}</span>}
        </header>

        <nav className="lms-learning-tabs" aria-label="My Learning sections">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button type="button" key={id} onClick={() => setTab(id)} className={activeTab === id ? 'is-active' : ''} aria-current={activeTab === id ? 'page' : undefined}>
              <Icon size={17} /> {label}
            </button>
          ))}
        </nav>

        <div className="lms-learning-content">
          <header className="lms-learning-section-heading">
            <div>
              <span className="lms-eyebrow">{activeTab === 'progress' ? 'Your momentum' : 'Learning hub'}</span>
              <h2>{tabs.find(({ id }) => id === activeTab)?.label}</h2>
            </div>
            <button
              type="button"
              className="lms-refresh-button"
              onClick={() => setRefreshKey((key) => key + 1)}
              aria-label={`Refresh ${activeTab}`}
              title="Refresh"
            >
              <RotateCw size={17} />
            </button>
          </header>

          {loading ? renderLoading() : error ? (
            <div className="lms-state lms-state-error" role="alert">
              <BookOpen size={29} />
              <h3>This section couldn’t be loaded</h3>
              <p>{error}</p>
              <button type="button" className="lms-button-secondary" onClick={() => setRefreshKey((key) => key + 1)}>Try again</button>
            </div>
          ) : activeTab === 'courses' ? renderCourses() :
            activeTab === 'progress' ? renderCourses(true) :
              activeTab === 'certificates' ? renderCertificates() :
                activeTab === 'purchases' ? renderPurchases() : renderWishlist()}
        </div>
      </div>

      {viewingCertificate && (
        <div className="lms-dialog-backdrop" role="presentation" onClick={(event) => {
          if (event.target === event.currentTarget) setViewingCertificate(null);
        }}>
          <section className="lms-dialog" role="dialog" aria-modal="true" aria-labelledby="certificate-dialog-title">
            <button type="button" className="lms-dialog-close" onClick={() => setViewingCertificate(null)} aria-label="Close certificate details"><X size={18} /></button>
            <span className="lms-certificate-icon"><Award size={23} /></span>
            <h2 id="certificate-dialog-title">{viewingCertificate.courseName || viewingCertificate.course?.name || 'Certificate details'}</h2>
            <dl>
              <dt>Certificate ID</dt><dd>{viewingCertificate.certificateId || viewingCertificate._id || 'Unavailable'}</dd>
              <dt>Student</dt><dd>{viewingCertificate.student?.name || viewingCertificate.user?.name || viewingCertificate.studentId?.name || viewingCertificate.userId?.name || viewingCertificate.studentName || 'Unavailable'}</dd>
              <dt>Issued</dt><dd>{formatDate(viewingCertificate.issuedAt || viewingCertificate.createdAt)}</dd>
              {viewingCertificate.status && <><dt>Status</dt><dd>{viewingCertificate.status}</dd></>}
            </dl>
            <button type="button" className="lms-button-primary" onClick={() => handleCertificateDownload(viewingCertificate)}>
              <Download size={16} /> Download certificate
            </button>
          </section>
        </div>
      )}
    </section>
  );
};

const CourseArtwork = ({ course }) => (
  <div className="lms-learning-art">
    {course?.thumbnail?.url ? <img src={course.thumbnail.url} alt={course.name || 'Course'} /> : <BookOpen size={28} />}
  </div>
);

export default MyLearning;
