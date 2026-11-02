
import axios from "axios";

const courseAPI = axios.create({
    baseURL: "https://mockapi-mauve.vercel.app/api/v1",
    headers: {
        "Content-Type": "application/json",
    },
});

courseAPI.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

courseAPI.interceptors.response.use(
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

export default courseAPI;
