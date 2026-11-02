import axiosInstance from './axios';

export const notificationAPI = {
  // Get all notifications (admin)
  getAllNotifications: () => axiosInstance.get('/notifications/get-all-notification'),

  // Update notification status (admin)
  updateNotificationStatus: (id) => axiosInstance.put(`/notifications/update-notification-status/${id}`),
};
