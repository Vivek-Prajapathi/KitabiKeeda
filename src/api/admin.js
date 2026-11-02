import axiosInstance from './axios';

export const adminAPI = {
  // Get all users
  getAllUsers: () => axiosInstance.get('/auth/get-all-user-dashboard'),

  // Update user role
  updateUserRole: (data) => axiosInstance.put('/auth/update-user-roles', data),

  // Delete user
  deleteUser: (id) => axiosInstance.delete(`/auth/delete-user/${id}`),

  // Get all courses
  getAllCourses: () => axiosInstance.get('/course/get-all-course-dashboard'),

  // Create course
  createCourse: (data) => axiosInstance.post('/course/create-course', data),

  // Edit course
  editCourse: (id, data) => axiosInstance.put(`/course/edit-course/${id}`, data),

  // Delete course
  deleteCourse: (id) => axiosInstance.delete(`/course/delete-course/${id}`),

  // Get all orders
  getAllOrders: () => axiosInstance.get('/order/get-all-order-dashboard'),

  // Get all notifications
  getAllNotifications: () => axiosInstance.get('/notifications/get-all-notification'),

  // Update notification status
  updateNotificationStatus: (id) => axiosInstance.put(`/notifications/update-notification-status/${id}`),

  // Get user analytics
  getUserAnalytics: () => axiosInstance.get('/analytics/get-users-analytics'),

  // Get course analytics
  getCourseAnalytics: () => axiosInstance.get('/analytics/get-course-analytics'),

  // Get order analytics
  getOrderAnalytics: () => axiosInstance.get('/analytics/get-order-analytics'),

  // Create layout
  createLayout: (data) => axiosInstance.post('/layout/create-layout', data),

  // Update layout
  updateLayout: (data) => axiosInstance.put('/layout/update-layout', data),

  // Get layout
  getLayout: (type) => axiosInstance.get(`/layout/get-layout?type=${type}`),
};
