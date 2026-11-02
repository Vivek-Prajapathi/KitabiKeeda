
import { createContext, useState } from "react";
import {
    UpdateUserInfoApi,
    UpdateProfilePictureApi,
    UpdateProfilePasswordApi,
} from "../api/auth";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(
        localStorage.getItem("token") || null
    );

    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("user")) || null;
        } catch {
            return null;
        }
    });

    // Login
    const login = (userData, accessToken) => {
        setUser(userData);
        setToken(accessToken);

        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", accessToken);
    };

    // Logout
    const logout = () => {
        setUser(null);
        setToken(null);

        localStorage.removeItem("user");
        localStorage.removeItem("token");
    };

    // Update Profile Information
    const updateUserInfo = async ({ name }) => {
        const response = await UpdateUserInfoApi({ name });

        const updatedUser = response.user
            ? response.user
            : { ...user, name };

        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));

        return response;
    };

    // Update Profile Picture
    const updateProfilePicture = async (avatar) => {
        const response = await UpdateProfilePictureApi({ avatar });

        const updatedUser = response.user
            ? response.user
            : {
                ...user,
                avatar: response.avatar || avatar,
            };

        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));

        return response;
    };

    // Update Password
    const updatePassword = async ({ oldPassword, newPassword }) => {
        const response = await UpdateProfilePasswordApi({
            oldPassword,
            newPassword,
        });

        return response;
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                login,
                logout,
                updateUserInfo,
                updateProfilePicture,
                updatePassword,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
