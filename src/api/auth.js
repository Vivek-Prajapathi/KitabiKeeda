
import api from "./axios";

// Register User
export const registerUser = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    console.log("Registration response:", data);
    return data;
};

// Activate Account
export const ActivationServiceApi = async (payload) => {
    const { data } = await api.post("/auth/activate-user", payload);
    return data;
};

// Login
export const Login = async (payload) => {
    const { data } = await api.post("/auth/login", payload);
    return data;
};

// Get Logged-in User
export const GetMe = async () => {
    const { data } = await api.get("/auth/me");
    return data;
};

// Logout
export const Logout = async () => {
    const { data } = await api.get("/auth/logout");
    return data;
};

// Update User Information
export const UpdateUserInfoApi = async (payload) => {
    const { data } = await api.put("/auth/update-user-info", payload);
    return data;
};

// Update Profile Picture
export const UpdateProfilePictureApi = async (payload) => {
    const { data } = await api.put(
        "/auth/update-user-profile-picture",
        payload
    );
    return data;
};

// Update Password
export const UpdateProfilePasswordApi = async (payload) => {
    const { data } = await api.put("/auth/update-user-password", payload);
    return data;
};

// Fetch All Users for Admin Dashboard
export const fetchAllUsers = async () => {
    const { data } = await api.get("/auth/get-all-user-dashboard");
    return data;
};

// Update User Role
export const updateRole = async (payload) => {
    const { data } = await api.put("/auth/update-user-roles", payload);
    return data;
};

// Delete User
export const deleteUser = async (id) => {
    const { data } = await api.delete(`/auth/delete-user/${id}`);
    return data;
};

// Existing function aliases
export const createUser = registerUser;
export const activateUser = ActivationServiceApi;
export const loginUser = Login;







// import axiosInstance from "./axios";

// export const registerUser = async (userData) => {
//     const response = await axiosInstance.post("/register", userData);
//     //register endpoint pe userData ko POST request ke through bhejte hain aur response ko response variable mein store karte hain.
//     //jab user form submit karega tab ye fuction call hoga form se hame details milega in the form of userData and then we will send this data to the backend API using axios.post method. The response from the backend will be stored in the response variable.
//     //yahan se data api me jaane ke baad backend ye karta hai ki wo user ko database me store karta hai aur fir ek response bhejta hai jisme message aur activation code hota hai. Ye response hame axios ke response variable me milta hai.
//     return response.data;
// };

// //-------------------------------------------
// // Account Activation API
// export const activateUser = async (activationToken, activationCode) => {
//     const response = await axiosInstance.post(
//         "/activate-user",
//         {
//             activation_token: activationToken,
//             activation_code: activationCode
//         }
//     );

//     return response.data;
// };

// //-------------------------------------------
// // Login API
// export const loginUser = async (userData) => {
//     const response = await axiosInstance.post("/login", userData);
//     return response.data;
// };










///B4

// import axios from "axios";

// const API_URL = "https://mockapi-mauve.vercel.app/api/v1/auth";

// export const registerUser = async (userData) => {
//     const response = await axios.post(`${API_URL}/register`, userData);//register endpoint pe userData ko POST request ke through bhejte hain aur response ko response variable mein store karte hain.
//     //jab user form submit karega tab ye fuction call hoga form se hame details milega in the form of userData and then we will send this data to the backend API using axios.post method. The response from the backend will be stored in the response variable.
//     //yahan se data api me jaane ke baad backend ye karta hai ki wo user ko database me store karta hai aur fir ek response bhejta hai jisme message aur activation code hota hai. Ye response hame axios ke response variable me milta hai.
//     return response.data;//
// };

// //-------------------------------------------
// // Account Activation API
// export const activateUser = async (activationToken, activationCode) => {
//     const response = await axios.post(
//         `${API_URL}/activate-user`,
//         {
//             activation_token: activationToken,
//             activation_code: activationCode
//         }
//     );

//     return response.data;
// };

// //-------------------------------------------
// // Login API
// export const loginUser = async (userData) => {
//     const response = await axios.post(`${API_URL}/login`, userData);
//     return response.data;
// };