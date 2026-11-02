import axiosInstance from './axios';

export const analyticsAPI = {
  // Get users analytics (admin)
  getUserAnalytics: () => axiosInstance.get('/analytics/get-users-analytics'),

  // Get course analytics (admin)
  getCourseAnalytics: () => axiosInstance.get('/analytics/get-course-analytics'),

  // Get order analytics (admin)
  getOrderAnalytics: () => axiosInstance.get('/analytics/get-order-analytics'),
};
