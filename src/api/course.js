import axiosInstance from './axios';

export const courseAPI = {
  // Create course (admin)
  createCourse: (data) => axiosInstance.post('/course/create-course', data),

  // Edit course (admin)
  editCourse: (id, data) => axiosInstance.put(`/course/edit-course/${id}`, data),

  // Get single course
  getCourse: (id) => axiosInstance.get(`/course/get-course/${id}`),

  // Get all public courses
  getCourses: () => axiosInstance.get('/course/get-courses'),

  // Get course content (enrolled students)
  getCourseContent: (id) => axiosInstance.get(`/course/get-course-content/${id}`),

  // Add question to course
  addQuestion: (data) => axiosInstance.put('/course/add-question', data),

  // Add answer to question
  addAnswer: (data) => axiosInstance.put('/course/add-answer', data),

  // Add review to course
  addReview: (id, data) => axiosInstance.put(`/course/add-review/${id}`, data),

  // Add reply to review (admin)
  addReply: (data) => axiosInstance.put('/course/add-replay', data),

  // Get all courses for admin dashboard
  getAllCourses: () => axiosInstance.get('/course/get-all-course-dashboard'),

  // Delete course (admin)
  deleteCourse: (id) => axiosInstance.delete(`/course/delete-course/${id}`),
};
