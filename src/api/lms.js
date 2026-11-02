import axiosInstance from './axios';

export const lmsAPI = {
  // List published courses
  getCourses: (params) => axiosInstance.get('/lms/courses', { params }),

  // Get my learning (enrollments, progress, certificates)
  getMyLearning: () => axiosInstance.get('/lms/my-learning'),

  // Create payment
  createPayment: (data) => axiosInstance.post('/lms/payments/create', data),

  // Verify payment
  verifyPayment: (data) => axiosInstance.post('/lms/payments/verify', data),

  // List categories
  getCategories: () => axiosInstance.get('/lms/categories'),

  // Create category (admin)
  createCategory: (data) => axiosInstance.post('/lms/categories', data),

  // Search courses
  searchCourses: (query) => axiosInstance.get('/lms/search', { params: { q: query } }),

  // Get marketplace home
  getHome: () => axiosInstance.get('/lms/home'),

  // Get course detail
  getCourseDetail: (courseId) => axiosInstance.get(`/lms/courses/${courseId}`),

  // Get course curriculum
  getCourseCurriculum: (courseId) => axiosInstance.get(`/lms/courses/${courseId}/curriculum`),

  // Get course sections
  getCourseSections: (courseId) => axiosInstance.get(`/lms/courses/${courseId}/sections`),

  // Get section by ID
  getSection: (sectionId) => axiosInstance.get(`/lms/sections/${sectionId}`),

  // Get lectures in section
  getSectionLectures: (sectionId) => axiosInstance.get(`/lms/sections/${sectionId}/lectures`),

  // Get lecture
  getLecture: (lectureId) => axiosInstance.get(`/lms/lectures/${lectureId}`),

  // Check lecture access
  checkLectureAccess: (lectureId) => axiosInstance.get(`/lms/lectures/${lectureId}/access`),

  // Save lecture progress
  saveLectureProgress: (lectureId, data) => axiosInstance.post(`/lms/lectures/${lectureId}/progress`, data),

  // Mark lecture complete
  markLectureComplete: (lectureId) => axiosInstance.post(`/lms/lectures/${lectureId}/complete`),

  // Get purchase history
  getPurchases: () => axiosInstance.get('/lms/purchases'),

  // Get orders
  getOrders: () => axiosInstance.get('/lms/orders'),

  // Get single order
  getOrder: (orderId) => axiosInstance.get(`/lms/orders/${orderId}`),

  // Get enrollments
  getEnrollments: () => axiosInstance.get('/lms/enrollments'),

  // Get single enrollment
  getEnrollment: (enrollmentId) => axiosInstance.get(`/lms/enrollments/${enrollmentId}`),

  // Get wishlist
  getWishlist: () => axiosInstance.get('/lms/wishlist'),

  // Toggle wishlist
  toggleWishlist: (data) => axiosInstance.post('/lms/wishlist/toggle', data),

  // Get course reviews
  getCourseReviews: (courseId) => axiosInstance.get(`/lms/reviews/${courseId}`),

  // Add course review
  addCourseReview: (courseId, data) => axiosInstance.post(`/lms/reviews/${courseId}`, data),

  // Validate coupon
  validateCoupon: (data) => axiosInstance.post('/lms/coupons/validate', data),

  // List coupons (admin)
  getCoupons: () => axiosInstance.get('/lms/coupons'),

  // Create coupon (admin)
  createCoupon: (data) => axiosInstance.post('/lms/coupons', data),

  // Get certificates
  getCertificates: () => axiosInstance.get('/lms/certificates'),

  // Get certificate
  getCertificate: (certificateId) => axiosInstance.get(`/lms/certificates/${certificateId}`),

  // Download certificate
  downloadCertificate: (certificateId) =>
    axiosInstance.get(`/lms/certificates/${certificateId}/download`, { responseType: 'blob' }),

  // Instructor: get my courses
  getInstructorCourses: () => axiosInstance.get('/lms/instructor/courses'),

  // Instructor: create course as draft
  createDraftCourse: (data) => axiosInstance.post('/lms/instructor/courses', data),

  // Instructor: update course
  updateInstructorCourse: (courseId, data) => axiosInstance.put(`/lms/instructor/courses/${courseId}`, data),

  // Instructor: add lecture
  addLecture: (courseId, data) => axiosInstance.post(`/lms/instructor/courses/${courseId}/lectures`, data),

  // Instructor: submit course for review
  submitCourse: (courseId) => axiosInstance.post(`/lms/instructor/courses/${courseId}/submit`),

  // Instructor: get students
  getInstructorStudents: () => axiosInstance.get('/lms/instructor/students'),

  // Instructor: get revenue
  getInstructorRevenue: () => axiosInstance.get('/lms/instructor/revenue'),

  // Instructor: get analytics
  getInstructorAnalytics: () => axiosInstance.get('/lms/instructor/analytics'),

  // Admin: get all courses
  adminGetAllCourses: () => axiosInstance.get('/lms/admin/courses'),

  // Admin: update course status
  adminUpdateCourseStatus: (courseId, data) => axiosInstance.put(`/lms/admin/courses/${courseId}/status`, data),

  // Admin: get instructors
  adminGetInstructors: () => axiosInstance.get('/lms/admin/instructors'),

  // Admin: get all orders
  adminGetAllOrders: () => axiosInstance.get('/lms/admin/orders'),

  // Admin: get all enrollments
  adminGetAllEnrollments: () => axiosInstance.get('/lms/admin/enrollments'),

  // Admin: get analytics
  adminGetAnalytics: () => axiosInstance.get('/lms/admin/analytics'),

  // Admin: export enrollments
  adminExportEnrollments: () => axiosInstance.get('/lms/admin/enrollments/export', { responseType: 'blob' }),

  // Refund payment
  refundPayment: (data) => axiosInstance.post('/lms/payments/refund', data),

  // Get all categories (admin)
  adminGetAllCategories: () => axiosInstance.get('/lms/categories/all'),

  // Update category (admin)
  updateCategory: (categoryId, data) => axiosInstance.put(`/lms/categories/${categoryId}`, data),

  // Delete category (admin)
  deleteCategory: (categoryId) => axiosInstance.delete(`/lms/categories/${categoryId}`),

  // Get progress analytics
  getProgressAnalytics: () => axiosInstance.get('/lms/progress-analytics'),

  // Clone course (admin)
  cloneCourse: (data) => axiosInstance.post('/lms/courses/clone', data),
};
