import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { loginUser } from "../api/auth";
import useAuth from "../hooks/useAuth";

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        if (!email.trim() || !password) {
            setMessage("Please fill all fields.");
            return;
        }

        try {
            setLoading(true);

            const result = await loginUser({
                email: email.trim(),
                password,
            });

            console.log("Login response:", result);

            const responseData =
                result?.data?.data ??
                result?.data ??
                result;

            const accessToken = responseData?.accessToken;
            const user = responseData?.user || null;

            if (!accessToken) {
                setMessage(
                    responseData?.message ||
                    "Login response did not contain an access token."
                );
                return;
            }

            // Update authentication context.
            login(user, accessToken);

            if (user?.role === "admin") {
                navigate("/admin");
            } else {
                navigate("/dashboard");
            }
        } catch (error) {
            console.error(
                "Login error:",
                error.response?.data || error.message
            );

            setMessage(
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Login failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <h2>Login</h2>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="login-email">Email:</label>
                    <input
                        id="login-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="login-password">Password:</label>
                    <input
                        id="login-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>

            {message && <p role="alert">{message}</p>}
        </div>
    );
}

// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "../App.css";
// import { loginUser } from "../api/auth";
// import useAuth from "../hooks/useAuth";

// export default function Login() {
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [message, setMessage] = useState("");
//     const [loading, setLoading] = useState(false);

//     const navigate = useNavigate();
//     const { login } = useAuth();

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         if (!email || !password) {
//             setMessage("Please fill all fields");
//             return;
//         }

//         try {
//             setLoading(true);
//             setMessage("");

//             const userData = { email, password };
//             const result = await loginUser(userData);

//             console.log("Login response:", result);

        
// if (result.accessToken) {
//     // Context API updates the authentication state
//     // and stores the token and user in localStorage.
//     login(result.user || null, result.accessToken);

//     if (result.user?.role === "admin") {
//         navigate("/admin");
//     } else {
//         navigate("/dashboard");
//     }
// } else {
//     setMessage(result.message || "Login response did not contain a token.");
// }


//         } catch (error) {
//             console.error(
//                 "Login error:",
//                 error.response?.data || error.message
//             );

//             setMessage(
//                 error.response?.data?.message || "Login failed. Please try again."
//             );
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="auth-container">
//             <h2>Login</h2>

//             <form onSubmit={handleSubmit}>
//                 <div>
//                     <label>Email:</label>
//                     <input
//                         type="email"
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                         placeholder="Enter your email"
//                     />
//                 </div>

//                 <div>
//                     <label>Password:</label>
//                     <input
//                         type="password"
//                         value={password}
//                         onChange={(e) => setPassword(e.target.value)}
//                         placeholder="Enter your password"
//                     />
//                 </div>

//                 <button type="submit" disabled={loading}>
//                     {loading ? "Logging in..." : "Login"}
//                 </button>
//             </form>

//             {message && <p>{message}</p>}
//         </div>
//     );
// }





// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "../App.css";
// import { loginUser } from "../api/auth";

// export default function Login() {
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [message, setMessage] = useState("");
//     const [loading, setLoading] = useState(false);

//     const navigate = useNavigate();

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         if (!email || !password) {
//             setMessage("Please fill all fields");
//             return;
//         }

//         try {
//             setLoading(true);
//             setMessage("");

//             const userData = { email, password };
//             const result = await loginUser(userData);

//             console.log("Login response:", result);

//             if (result.accessToken) {//Why did we make this change?
// //- result.accessToken checks whether the API returned an access token.
// //- sessionStorage.setItem() stores the token so we can use it for authentication.
// //- navigate("/dashboard") redirects the user to the Dashboard after successful login.
//     sessionStorage.setItem("token", result.accessToken);
// }

//             setMessage(result.message || "Login successful!");

//             if (result.accessToken) {
//     navigate("/dashboard");
// }
//         } catch (error) {
//             console.error(
//                 "Login error:",
//                 error.response?.data || error.message
//             );

//             setMessage(
//                 error.response?.data?.message || "Login failed. Please try again."
//             );
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="auth-container">
//             <h2>Login</h2>

//             <form onSubmit={handleSubmit}>
//                 <div>
//                     <label>Email:</label>
//                     <input
//                         type="email"
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                         placeholder="Enter your email"
//                     />
//                 </div>

//                 <div>
//                     <label>Password:</label>
//                     <input
//                         type="password"
//                         value={password}
//                         onChange={(e) => setPassword(e.target.value)}
//                         placeholder="Enter your password"
//                     />
//                 </div>

//                 <button type="submit" disabled={loading}>
//                     {loading ? "Logging in..." : "Login"}
//                 </button>
//             </form>

//             {message && <p>{message}</p>}
//         </div>
//     );
// }