import axios from "axios";

export const BASE_URL = "https://mockapi-mauve.vercel.app/api/v1";

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Attach token to requests
api.interceptors.request.use(
    (config) => {
        const token =
            localStorage.getItem("token") ||
            localStorage.getItem("TOKEN");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Handle API errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error(
            "API Error:",
            error.response?.status,
            error.response?.data || error.message
        );

        return Promise.reject(error);
    }
);

export default api;
// import axios from "axios";

// export const BASE_URL = "https://mockapi-mauve.vercel.app/api/v1";

// const api = axios.create({
//     baseURL: BASE_URL,
//     headers: {
//         "Content-Type": "application/json",
//     },
// });

// // Request Interceptor
// api.interceptors.request.use(
//     (config) => {
//         const token =
//             localStorage.getItem("token") ||
//             localStorage.getItem("TOKEN");

//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//         }

//         return config;
//     },
//     (error) => Promise.reject(error)
// );

// // Response Interceptor
// api.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         console.error(
//             "API Error:",
//             error.response?.status,
//             error.response?.data || error.message
//         );

//         return Promise.reject(error);
//     }
// );

// export default api;








// import axios from "axios";

// const axiosInstance = axios.create({
//     baseURL: "https://mockapi-mauve.vercel.app/api/v1/auth",
//     headers: {
//         "Content-Type": "application/json",
//     },
// });

// axiosInstance.interceptors.request.use(
//     (config) => {
//         const token = localStorage.getItem("token");

//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//         }

//         return config;
//     },
//     (error) => Promise.reject(error)
// );

// axiosInstance.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         console.error(
//             "API Error:",
//             error.response?.status,
//             error.response?.data || error.message
//         );

//         return Promise.reject(error);
//     }
// );

// export default axiosInstance;