
import axios from "axios";

const lmsAPI = axios.create({
    baseURL: "https://mockapi-mauve.vercel.app/api/v1/lms",
    headers: {
        "Content-Type": "application/json",
    },
});


// Attach the saved login token to protected requests.
lmsAPI.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// USER: MY LEARNING
export const getMyLearning = async () => {
    const response = await lmsAPI.get("/my-learning");
    return response.data;
};

// USER: PROGRESS ANALYTICS
export const getProgressAnalytics = async () => {
    const response = await lmsAPI.get("/progress-analytics");
    return response.data;
};

// USER: CERTIFICATES
export const getMyCertificates = async () => {
    const response = await lmsAPI.get("/certificates");
    return response.data;
};

// USER: CERTIFICATE DETAILS
export const getCertificateById = async (certificateId) => {
    if (!certificateId) {
        throw new Error("Certificate ID is required.");
    }

    const response = await lmsAPI.get(
        `/certificates/${encodeURIComponent(certificateId)}`
    );

    return response.data;
};

// USER: DOWNLOAD CERTIFICATE PDF
export const downloadCertificatePdf = async (certificateId) => {
    if (!certificateId) {
        throw new Error("Certificate ID is required.");
    }

    const response = await lmsAPI.get(
        `/certificates/${encodeURIComponent(certificateId)}/download`,
        {
            responseType: "blob",
        }
    );

    return response.data;
};


/* ==============================
   LMS COUPONS
============================== */

// // Validate coupon for a course
// // Request body: { code, courseId }
// export const validateLmsCoupon = async (code, courseId) => {
//     if (!code?.trim() || !courseId) {
//         throw new Error("Coupon code and course ID are required.");
//     }

//     const response = await lmsAPI.post("/coupons/validate", {
//         code: code.trim(),
//         courseId: String(courseId),
//     });

//     return response.data;
// };

// // List coupons — Admin only
// export const getAdminCoupons = async () => {
//     const response = await lmsAPI.get("/coupons");
//     return response.data;
// };

// // Create coupon — Admin only
// export const createAdminCoupon = async (couponData) => {
//     const response = await lmsAPI.post("/coupons", couponData);
//     return response.data;
// };


// USER: PURCHASE HISTORY
export const getMyPurchases = async () => {
    const response = await lmsAPI.get("/purchases");
    return response.data;
};

// USER: GET WISHLIST
export const getMyWishlist = async () => {
    const response = await lmsAPI.get("/wishlist");
    return response.data;
};

// USER: TOGGLE WISHLIST
export const toggleMyWishlist = async (courseId) => {
    if (!courseId) {
        throw new Error("Course ID is required.");
    }

    const response = await lmsAPI.post("/wishlist", {
        courseId: String(courseId),
    });

    return response.data;
};

// INSTRUCTOR: GET MY COURSES
export const getInstructorCourses = async () => {
    const response = await lmsAPI.get("/instructor/courses");
    return response.data;
};

// INSTRUCTOR: CREATE COURSE AS DRAFT
export const createInstructorCourse = async (courseData) => {
    const response = await lmsAPI.post(
        "/instructor/courses",
        courseData
    );

    return response.data;
};

// INSTRUCTOR: UPDATE MY COURSE
export const updateInstructorCourse = async (
    courseId,
    courseData
) => {
    if (!courseId) {
        throw new Error("Course ID is required.");
    }

    const response = await lmsAPI.put(
        `/instructor/courses/${encodeURIComponent(courseId)}`,
        courseData
    );

    return response.data;
};

// LMS ADMIN: ANALYTICS
export const getAdminAnalytics = async () => {
    const response = await lmsAPI.get("/admin/analytics");
    return response.data;
};

// LMS ADMIN: COURSES
export const getAdminCourses = async () => {
    const response = await lmsAPI.get("/admin/courses");
    return response.data;
};

// LMS ADMIN: UPDATE COURSE STATUS
export const updateAdminCourseStatus = async (
    courseId,
    statusData
) => {
    if (!courseId) {
        throw new Error("Course ID is required.");
    }

    const response = await lmsAPI.put(
        `/admin/courses/${encodeURIComponent(courseId)}/status`,
        statusData
    );

    return response.data;
};

// LMS ADMIN: INSTRUCTORS
export const getAdminInstructors = async () => {
    const response = await lmsAPI.get("/admin/instructors");
    return response.data;
};

// LMS ADMIN: ORDERS
export const getAdminOrders = async () => {
    const response = await lmsAPI.get("/admin/orders");
    return response.data;
};

// LMS ADMIN: ENROLLMENTS
export const getAdminEnrollments = async () => {
    const response = await lmsAPI.get("/admin/enrollments");
    return response.data;
};

// LMS ADMIN: EXPORT ENROLLMENTS CSV
export const exportAdminEnrollments = async () => {
    const response = await lmsAPI.get(
        "/admin/enrollments/export",
        {
            responseType: "blob",
            headers: {
                Accept: "text/csv",
            },
        }
    );

    return response.data;
};

export default lmsAPI;


// import axios from "axios";

// const lmsAPI = axios.create({
//     baseURL: "https://mockapi-mauve.vercel.app/api/v1/lms",
//     headers: {
//         "Content-Type": "application/json",
//     },
// });

//  // USER: PROGRESS ANALYTICS
// export const getProgressAnalytics = async () => {
//     const response = await lmsAPI.get("/progress-analytics");
//     return response.data;
// };

// // USER: MY CERTIFICATES
// export const getMyCertificates = async () => {
//     const response = await lmsAPI.get("/certificates");
//     return response.data;
// };

//  // USER: GET MY WISHLIST
// export const getMyWishlist = async () => {
//     const response = await lmsAPI.get("/wishlist");
//     return response.data;
// };

// // USER: ADD / REMOVE COURSE FROM WISHLIST
// export const toggleMyWishlist = async (courseId) => {
//     if (!courseId) {
//         throw new Error("Course ID is required.");
//     }

//     const response = await lmsAPI.post("/wishlist", {
//         courseId: String(courseId),
//     });

//     return response.data;
// };



// // USER: CERTIFICATE DETAILS
// export const getCertificateById = async (certificateId) => {
//     if (!certificateId) {
//         throw new Error("Certificate ID is required.");
//     }

//     const response = await lmsAPI.get(
//         `/certificates/${encodeURIComponent(certificateId)}`
//     );

//     return response.data;
// };

// // USER: DOWNLOAD CERTIFICATE PDF
// export const downloadCertificatePdf = async (certificateId) => {
//     if (!certificateId) {
//         throw new Error("Certificate ID is required.");
//     }

//     const response = await lmsAPI.get(
//         `/certificates/${encodeURIComponent(certificateId)}/download`,
//         {
//             responseType: "blob",
//         }
//     );

//     return response.data;
// };


// // Automatically attach the login token
// lmsAPI.interceptors.request.use(
//     (config) => {
//         const token = localStorage.getItem("token");

//         if (token) {
//             config.headers = config.headers || {};
//             config.headers.Authorization = `Bearer ${token}`;
//         }

//         return config;
//     },
//     (error) => Promise.reject(error)
// );

// // USER: MY LEARNING
// export const getMyLearning = async () => {
//     const response = await lmsAPI.get("/my-learning");
//     return response.data;
// };

// // LMS ADMIN: ANALYTICS
// export const getAdminAnalytics = async () => {
//     const response = await lmsAPI.get("/admin/analytics");
//     return response.data;
// };

// // LMS ADMIN: COURSES
// export const getAdminCourses = async () => {
//     const response = await lmsAPI.get("/admin/courses");
//     return response.data;
// };

// // LMS ADMIN: UPDATE COURSE STATUS
// export const updateAdminCourseStatus = async (
//     courseId,
//     statusData
// ) => {
//     if (!courseId) {
//         throw new Error("Course ID is required.");
//     }

//     const response = await lmsAPI.put(
//         `/admin/courses/${courseId}/status`,
//         statusData
//     );

//     return response.data;
// };

// // LMS ADMIN: INSTRUCTORS
// export const getAdminInstructors = async () => {
//     const response = await lmsAPI.get("/admin/instructors");
//     return response.data;
// };

// // LMS ADMIN: ORDERS
// export const getAdminOrders = async () => {
//     const response = await lmsAPI.get("/admin/orders");
//     return response.data;
// };

//  // INSTRUCTOR: GET MY COURSES
// export const getInstructorCourses = async () => {
//     const response = await lmsAPI.get("/instructor/courses");
//     return response.data;
// };

// // INSTRUCTOR: CREATE COURSE AS DRAFT
// export const createInstructorCourse = async (courseData) => {
//     const response = await lmsAPI.post(
//         "/instructor/courses",
//         courseData
//     );

//     return response.data;
// };

// // INSTRUCTOR: UPDATE MY COURSE
// export const updateInstructorCourse = async (
//     courseId,
//     courseData
// ) => {
//     if (!courseId) {
//         throw new Error("Course ID is required.");
//     }

//     const response = await lmsAPI.put(
//         `/instructor/courses/${encodeURIComponent(courseId)}`,
//         courseData
//     );

//     return response.data;
// };


// // LMS ADMIN: ENROLLMENTS
// export const getAdminEnrollments = async () => {
//     const response = await lmsAPI.get("/admin/enrollments");
//     return response.data;
// };

// // LMS ADMIN: EXPORT ENROLLMENTS CSV
// export const exportAdminEnrollments = async () => {
//     const response = await lmsAPI.get(
//         "/admin/enrollments/export",
//         {
//             responseType: "blob",
//             headers: {
//                 Accept: "text/csv",
//             },
//         }
//     );

//     return response.data;
// };

// // Default API instance
// export default lmsAPI;



// import axios from "axios";

// const lmsAPI = axios.create({
//     baseURL: "https://mockapi-mauve.vercel.app/api/v1/lms",
//     headers: {
//         "Content-Type": "application/json",
//     },
// });

// // Automatically attach the login token
// lmsAPI.interceptors.request.use(
//     (config) => {
//         const token = localStorage.getItem("token");

//         if (token) {
//             config.headers = config.headers || {};
//             config.headers.Authorization = `Bearer ${token}`;
//         }

//         return config;
//     },
//     (error) => Promise.reject(error)
// );

// // ==============================
// // USER: MY LEARNING
// // ==============================

// export const getMyLearning = async () => {
//     const response = await lmsAPI.get("/my-learning");
//     return response.data;
// };

// // ==============================
// // LMS ADMIN: OVERVIEW / ANALYTICS
// // ==============================

// export const getAdminAnalytics = async () => {
//     const response = await lmsAPI.get("/admin/analytics");
//     return response.data;
// };

// // ==============================
// // LMS ADMIN: COURSES
// // Includes published and unpublished courses
// // ==============================

// export const getAdminCourses = async () => {
//     const response = await lmsAPI.get("/admin/courses");
//     return response.data;
// };

// // Update a course's lifecycle status
// export const updateAdminCourseStatus = async (courseId, statusData) => {
//     if (!courseId) {
//         throw new Error("Course ID is required.");
//     }

//     const response = await lmsAPI.put(
//         `/admin/courses/${courseId}/status`,
//         statusData
//     );

//     return response.data;
// };

// // ==============================
// // LMS ADMIN: INSTRUCTORS
// // ==============================

// export const getAdminInstructors = async () => {
//     const response = await lmsAPI.get("/admin/instructors");
//     return response.data;
// };

// // ==============================
// // LMS ADMIN: ORDERS
// // ==============================

// export const getAdminOrders = async () => {
//     const response = await lmsAPI.get("/admin/orders");
//     return response.data;
// };

// // ==============================
// // LMS ADMIN: ENROLLMENTS
// // ==============================

// export const getAdminEnrollments = async () => {
//     const response = await lmsAPI.get("/admin/enrollments");
//     return response.data;
// };

// // ==============================
// // LMS ADMIN: EXPORT ENROLLMENTS CSV
// // ==============================

// export const exportAdminEnrollments = async () => {
//     const response = await lmsAPI.get(
//         "/admin/enrollments/export",
//         {
//             responseType: "blob",
//             headers: {
//                 Accept: "text/csv",
//             },
//         }
//     );

//     return response.data;
// };

// // Keep the default API instance available
// export default lmsAPI;

// import axios from "axios";

// const lmsAPI = axios.create({
//     baseURL: "https://mockapi-mauve.vercel.app/api/v1/lms",
//     headers: {
//         "Content-Type": "application/json",
//     },
// });

// lmsAPI.interceptors.request.use(
//     (config) => {
//         const token = localStorage.getItem("token");

//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//         }

//         return config;
//     },
//     (error) => Promise.reject(error)
// );

// export const getMyLearning = async () => {
//     const response = await lmsAPI.get("/my-learning");
//     return response.data;
// };

// export default lmsAPI;