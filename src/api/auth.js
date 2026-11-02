import axiosInstance from './axios';

export const authAPI = {
  // Register new user
  register: (data) => axiosInstance.post('/auth/register', data),

  // Activate user account
  activateUser: (data) => axiosInstance.post('/auth/activate-user', data),

  // Login user
  login: (data) => axiosInstance.post('/auth/login', data),

  // Logout user
  logout: () => axiosInstance.get('/auth/logout'),

  // Get current user profile
  getMe: () => axiosInstance.get('/auth/me'),

  // Social authentication
  socialAuth: (data) => axiosInstance.post('/auth/social-auth', data),

  // Update user info
  updateUserInfo: (data) => axiosInstance.put('/auth/update-user-info', data),

  // Update user password
  updateUserPassword: (data) => axiosInstance.put('/auth/update-user-password', data),

  // Update user profile picture
  updateUserProfilePicture: (data) => axiosInstance.put('/auth/update-user-profile-picture', data),

  // Get all users (admin)
  getAllUsers: () => axiosInstance.get('/auth/get-all-user-dashboard'),

  // Update user role (admin)
  updateUserRole: (data) => axiosInstance.put('/auth/update-user-roles', data),

  // Delete user (admin)
  deleteUser: (id) => axiosInstance.delete(`/auth/delete-user/${id}`),

  // Forgot password
  forgotPassword: (data) => axiosInstance.post('/auth/forgot-password', data),

  // Reset password
  resetPassword: (data) => axiosInstance.post('/auth/reset-password', data),
};
