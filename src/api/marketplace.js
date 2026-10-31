import api from "./axios";

// These wrappers use the shared API instance, so your existing token handling remains intact.
const get = async (url, config) => (await api.get(url, config)).data;
const post = async (url, body) => (await api.post(url, body)).data;
const put = async (url, body) => (await api.put(url, body)).data;
const del = async (url) => (await api.delete(url)).data;

// Payments (the webhook is called by the backend, not from the frontend).
export const CreatePaymentApi = (payload) =>
    post("/lms/payments/create", payload);
export const VerifyPaymentApi = (payload) =>
    post("/lms/payments/verify", payload);
export const RefundPaymentApi = (orderId) =>
    post("/lms/payments/refund", { orderId });

// Marketplace
export const GetMarketplaceHomeApi = () => get("/lms/home");
export const GetPublishedCoursesApi = () => get("/lms/courses");
export const SearchCoursesApi = (q) =>
    get("/lms/search", { params: { q } });
export const GetLmsCourseApi = (courseId) =>
    get(`/lms/courses/${courseId}`);
export const GetCategoriesApi = () => get("/lms/categories");

// Wishlist
export const GetWishlistApi = () => get("/lms/wishlist");
export const ToggleWishlistApi = (courseId) =>
    post("/lms/wishlist/toggle", { courseId });

// Keep general LMS APIs available for the next steps.
export const GetCurriculumApi = (courseId) =>
    get(`/lms/courses/${courseId}/curriculum`);
export const GetSectionsApi = (courseId) =>
    get(`/lms/courses/${courseId}/sections`);
export const GetSectionApi = (sectionId) =>
    get(`/lms/sections/${sectionId}`);
export const GetSectionLecturesApi = (sectionId) =>
    get(`/lms/sections/${sectionId}/lectures`);
export const GetLectureApi = (lectureId) =>
    get(`/lms/lectures/${lectureId}`);
export const CheckLectureAccessApi = (lectureId) =>
    get(`/lms/lectures/${lectureId}/access`);
export const SaveLectureProgressApi = (lectureId, watchedSeconds) =>
    post(`/lms/lectures/${lectureId}/progress`, { watchedSeconds });
export const CompleteLectureApi = (lectureId) =>
    post(`/lms/lectures/${lectureId}/complete`);

export const GetMyLearningApi = () => get("/lms/my-learning");
export const GetMyEnrollmentsApi = () => get("/lms/enrollments");
export const GetEnrollmentApi = (id) => get(`/lms/enrollments/${id}`);
export const GetProgressAnalyticsApi = () => get("/lms/progress-analytics");
export const GetMyPurchasesApi = () => get("/lms/purchases");
export const GetMyOrdersApi = () => get("/lms/orders");
export const GetOrderApi = (id) => get(`/lms/orders/${id}`);

export const GetLmsReviewsApi = (courseId) =>
    get(`/lms/reviews/${courseId}`);
export const AddLmsReviewApi = (courseId, payload) =>
    post(`/lms/reviews/${courseId}`, payload);

export const ValidateCouponApi = (payload) =>
    post("/lms/coupons/validate", payload);
export const GetCouponsApi = () => get("/lms/coupons");
export const CreateCouponApi = (payload) => post("/lms/coupons", payload);

export const GetCertificatesApi = () => get("/lms/certificates");
export const GetCertificateApi = (id) => get(`/lms/certificates/${id}`);

export const GetInstructorCoursesApi = () => get("/lms/instructor/courses");
export const CreateInstructorCourseApi = (payload) =>
    post("/lms/instructor/courses", payload);
export const UpdateInstructorCourseApi = (courseId, payload) =>
    put(`/lms/instructor/courses/${courseId}`, payload);
export const AddInstructorLectureApi = (courseId, payload) =>
    post(`/lms/instructor/courses/${courseId}/lectures`, payload);
export const SubmitCourseForReviewApi = (courseId) =>
    post(`/lms/instructor/courses/${courseId}/submit`);
export const GetInstructorStudentsApi = () =>
    get("/lms/instructor/students");
export const GetInstructorRevenueApi = () =>
    get("/lms/instructor/revenue");
export const GetInstructorAnalyticsApi = () =>
    get("/lms/instructor/analytics");

export const GetAdminAllCoursesApi = () => get("/lms/admin/courses");
export const SetCourseStatusApi = (courseId, status) =>
    put(`/lms/admin/courses/${courseId}/status`, { status });
export const GetInstructorsApi = () => get("/lms/admin/instructors");
export const GetAdminOrdersApi = () => get("/lms/admin/orders");
export const GetAdminEnrollmentsApi = () => get("/lms/admin/enrollments");
export const GetMarketplaceAnalyticsApi = () =>
    get("/lms/admin/analytics");
export const CloneCourseApi = (courseId) =>
    post("/lms/courses/clone", { courseId });

export const GetAllCategoriesApi = () => get("/lms/categories/all");
export const CreateCategoryApi = (payload) =>
    post("/lms/categories", payload);
export const UpdateCategoryApi = (id, payload) =>
    put(`/lms/categories/${id}`, payload);
export const DeleteCategoryApi = (id) => del(`/lms/categories/${id}`);

function saveBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

export const DownloadCertificateApi = async (
    id,
    filename = "certificate.pdf"
) => {
    const response = await api.get(`/lms/certificates/${id}/download`, {
        responseType: "blob",
    });
    saveBlob(response.data, filename);
};

export const ExportEnrollmentsCsvApi = async () => {
    const response = await api.get("/lms/admin/enrollments/export", {
        responseType: "blob",
    });
    saveBlob(response.data, "enrollments.csv");
};
