import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { activateUser } from "../api/auth";

export default function ActivateAccount() {
    const navigate = useNavigate();

    const [activationCode, setActivationCode] = useState(
        sessionStorage.getItem("activationCode") || ""
    );

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [isActivated, setIsActivated] = useState(false);

    const email = sessionStorage.getItem("email");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        if (!activationCode.trim()) {
            setMessage("Please enter activation code.");
            return;
        }

        const activationToken =
            sessionStorage.getItem("activationToken");

        if (!activationToken) {
            setMessage("Activation token missing. Please register again.");
            return;
        }

        try {
            setLoading(true);

            // Follow the field names used in your teacher's code.
            const result = await activateUser({
                activation_token: activationToken,
                activation_code: activationCode.trim(),
            });

            console.log("Activation response:", result);

            if (result?.success === false) {
                setMessage(
                    result.message || "Account activation failed."
                );
                return;
            }

            setMessage(
                result?.message || "Account activated successfully!"
            );

            setIsActivated(true);

            sessionStorage.removeItem("activationToken");
            sessionStorage.removeItem("activationCode");
            sessionStorage.removeItem("email");
        } catch (error) {
            console.error(
                "Activation error:",
                error.response?.data || error.message
            );

            setMessage(
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Account activation failed."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <h2>ACTIVATE ACCOUNT</h2>

            <p>Account: {email || "Not available"}</p>

            <form onSubmit={handleSubmit}>
                <label htmlFor="activationCode">
                    Activation Code
                </label>

                <input
                    id="activationCode"
                    name="activationCode"
                    type="text"
                    inputMode="numeric"
                    value={activationCode}
                    onChange={(e) =>
                        setActivationCode(e.target.value)
                    }
                    placeholder="Enter activation code"
                    required
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Activating..." : "Activate Account"}
                </button>
            </form>

            {message && <p role="alert">{message}</p>}

            {isActivated && (
                <button
                    type="button"
                    onClick={() => navigate("/login")}
                >
                    Go to Login
                </button>
            )}
        </div>
    );
}


// //Is page par user sirf activation code enter karega. Activation token hum sessionStorage se lenge.
// import { useState } from "react";
// import "../App.css";
// import { activateUser } from "../api/auth";
// import { useNavigate } from "react-router-dom";

// export default function ActivateAccount() {
//     const [activationCode, setActivationCode] = useState(
//         sessionStorage.getItem("activationCode") || ""
//     );

//     const navigate = useNavigate();

//     const [message, setMessage] = useState("");
//     const [loading, setLoading] = useState(false);
//     const [isActivated, setIsActivated] = useState(false);

//     const email = sessionStorage.getItem("email");

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         if (!activationCode) {
//             setMessage("Please enter activation code");
//             return;
//         }

//         try {
//             setLoading(true);
//             setMessage("");

//             const activationToken = sessionStorage.getItem("activationToken");

//             if (!activationToken) {
//             setMessage("Token missing. Please register again.");
//              return;
// }

//             const result = await activateUser(
//                 activationToken,
//                 activationCode
//             );

//             setMessage(result.message || "Account activated successfully!");
//             setIsActivated(true);

//             sessionStorage.removeItem("activationToken");
//             sessionStorage.removeItem("activationCode");//learn
//         } catch (error) {
//             console.error("Activation error:", error.response?.data || error.message);

//             setMessage(
//                 error.response?.data?.message || "Account activation failed"
//             );
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="auth-container">
//             <h2>ACTIVATE ACCOUNT</h2>

//             <p>Account: {email}</p>

//             <label>Activation Code</label>

//             <form onSubmit={handleSubmit}>
//                 <input
//                     type="text"
//                     value={activationCode}
//                     onChange={(e) => setActivationCode(e.target.value)}
//                     placeholder="Enter activation code"
//                 />

//                 <button type="submit" disabled={loading}>
//                     {loading ? "Activating..." : "Activate Account"}
//                 </button>
//             </form>

//             {message && <p>{message}</p>}

//             {isActivated && (
//     <button
//         type="button"
//         onClick={() => navigate("/login")}
//     >
//         Go to Login
//     </button>
// )}
//         </div>
//     );
// }