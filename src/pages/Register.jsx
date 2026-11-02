import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { registerUser } from "../api/auth";

export default function Register() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");

        if (!name.trim() || !email.trim() || !password) {
            setMessage("Please fill all fields.");
            return;
        }

        if (name.trim().length < 4) {
            setMessage("Name must contain at least 4 characters.");
            return;
        }

        try {
            setLoading(true);

            const userData = {
                name: name.trim(),
                email: email.trim(),
                password,
            };

            // Send registration request
            const result = await registerUser(userData);

            console.log("Registration response:", result);

            // Handle possible API response structures
            const responseData =
                result?.data?.data ??
                result?.data ??
                result;

            const activationToken =
                responseData?.activationToken ??
                result?.activationToken;

            const activationCode =
                responseData?.activationCode ??
                result?.activationCode;

            // Check whether activation details were returned
            if (!activationToken || !activationCode) {
                console.error(
                    "Activation details missing from response:",
                    result
                );

                setMessage(
                    responseData?.message ||
                    result?.message ||
                    "Registration response is missing activation details. Check the console."
                );

                return;
            }

            // Store activation details
            sessionStorage.setItem(
                "activationToken",
                activationToken
            );

            sessionStorage.setItem(
                "activationCode",
                activationCode
            );

            sessionStorage.setItem("email", email.trim());

            // Navigate to Activate Account page
            navigate("/activate");
        } catch (error) {
            console.error(
                "Registration error:",
                error.response?.data || error.message
            );

            setMessage(
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <h2>Register</h2>

            <form onSubmit={handleSubmit}>
                <label htmlFor="register-name">
                    Name:
                </label>

                <input
                    id="register-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    required
                />

                <label htmlFor="register-email">
                    Email:
                </label>

                <input
                    id="register-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                />

                <label htmlFor="register-password">
                    Password:
                </label>

                <input
                    id="register-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                />

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Registering..." : "Register"}
                </button>
            </form>

            {message && (
                <p role="alert">{message}</p>
            )}
        </div>
    );
}





// import { useState } from "react";
// import "../App.css";
// import { registerUser } from "../api/auth";
// import { useNavigate } from "react-router-dom";

// export default function Register() {
//     const navigate = useNavigate();//Registration ke baad user ko automatically Activate Account page par redirect karna chahiye. User ko Navbar mein dobara Activate Account click nahi karna chahiye.
//     const [name, setName] = useState("");
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [message, setMessage] = useState("");
//     const [loading, setLoading] = useState(false);

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         if (!name || !email || !password) {
//             setMessage("Please fill all fields");
//             return;
//         }
//         if (name.trim().length < 4) {
//     setMessage("Name must contain at least 4 characters");
//     return;
// }

//         try {
//             setLoading(true);//API request ke dauran loading start karta hai
//             setMessage("");//Purana message clear karta hai.

//             const userData = {
//                 name,
//                 email,
//                 password
//             };//User ne form mein jo details enter ki hain, unhe ek object mein store karte hain.

//             const result = await registerUser(userData);//registerUser function ko call karke userData ko backend API pe bhejte hain aur response ko result mein store karte hain.
//             sessionStorage.setItem("activationToken", result.activationToken);
//             sessionStorage.setItem("activationCode", result.activationCode);
//             sessionStorage.setItem("email", email);
//             //setItem() ka use storage mein data save karne ke liye hota hai.
//             //setItem(ket,value)

//             // Automatically navigate to Activate Account page
//             navigate("/activate");

//             console.log("Registration response:", result);

//             setMessage(result.message || "Registration successful!");//Backend se aayi hui message ko setMessage ke through display karte hain. Agar backend se message nahi aaya toh default message "Registration successful!" show karte hain.

//             if (result.activationCode) {
//                 console.log("Activation code:", result.activationCode);
//             }//Backend response mein activation code hai ya nahi, ye check karta hai.Agar code hai, toh Console mein print karega.
//         } catch (error) {
//             console.error("Registration error:", error.response?.data || error.message);//Agar registration ke dauran koi error aata hai, toh usko console mein print karta hai.
//                     //error.response?.data ka matlab hai ki agar error response available hai toh uska data print karega, warna error.message print karega.
//                     //data ye hai ki backend se kya response aaya hai, jaise ki error message ya status code.
//                     //data kuch bhi ho sakta hai, jaise ki error message, status code, ya backend se aayi hui aur information.
//                     //ham data ke jagah kuch aur likhe sakte hain, jaise ki error.response?.status ya error.response?.headers, lekin data sabse common hai.
//                     //optional chaining aise kaam karta hai ki agar error.response undefined hai, toh error.response?.data bhi undefined ho jaayega, aur code crash nahi karega.
//             setMessage(
//                 error.response?.data?.message || "Registration failed. Please try again."
//             );//Backend se aayi hui error message ko setMessage ke through display karte hain. Agar backend se message nahi aaya toh default message "Registration failed. Please try again." show karte hain.
//         } 
//         finally {
//             setLoading(false);//API request ke baad loading ko false karte hain, chahe request successful ho ya fail ho.
//         }
//     };

//     return (
//         <div className="auth-container">
//             <h2>Register</h2>

//             <form onSubmit={handleSubmit}>
//                 <label>Name:</label>
//                 <input
//                     type="text"
//                     value={name}
//                     onChange={(e) => setName(e.target.value)}
//                     placeholder="Enter your name"
//                 />

//                 <label>Email:</label>
//                 <input
//                     type="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     placeholder="Enter your email"
//                 />

//                 <label>Password:</label>
//                 <input
//                     type="password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     placeholder="Enter your password"
//                 />

//                 <button type="submit" disabled={loading}>
//                     {loading ? "Registering..." : "Register"}
//                     </button>
//             </form>
//             {/*Button ke text ko loading state ke hisaab se change karte hain. Agar loading true hai, toh button pe "Registering..." show karega, warna "Register" show karega.*/}
                

//             {message && <p>{message}</p>}{/*// Agar message state mein koi value hai, toh usko paragraph tag ke andar display karte hain. Agar message empty hai, toh ye line render nahi hogi.*/}
//         </div>
//     );
// }