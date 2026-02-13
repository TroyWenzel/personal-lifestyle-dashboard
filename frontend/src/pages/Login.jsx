import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/pages/Home.css";

function Login() {
    // State for form inputs and UI feedback
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState(""); // For displaying error/success messages
    const [errors, setErrors] = useState({});    // Field-specific validation errors
    const [loading, setLoading] = useState(false); // Loading state for form submission
    
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    // Validate form inputs before submission
    const validateForm = () => {
        const newErrors = {};
        if (!email.includes('@') || !email.includes('.')) {
            newErrors.email = 'Please enter a valid email address';
        }
        if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        
        // Validate form before making API call
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }
        
        setErrors({});
        setLoading(true);

        try {
            // POST request to login endpoint
            const response = await fetch("http://localhost:5000/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Handle different possible token field names from backend
                const token = data.access_token || data.token || data.jwt;
                
                if (token) {
                    login(token); // Store token via AuthContext
                    navigate("/home"); // Redirect to dashboard on success
                } else {
                    setMessage("Authentication failed - no token received");
                }
            } else {
                setMessage(data.message || "Login failed");
            }
        } catch (error) {
            console.error("Login error:", error);
            setMessage("Unable to connect to server. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            // Clear field error when user starts typing
                            if (errors.email) setErrors({...errors, email: ''});
                        }}
                        required
                        className={errors.email ? "error-input" : ""}
                    />
                    {errors.email && <span className="error-text">{errors.email}</span>}
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            if (errors.password) setErrors({...errors, password: ''});
                        }}
                        required
                        className={errors.password ? "error-input" : ""}
                    />
                    {errors.password && <span className="error-text">{errors.password}</span>}
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            {message && <p className="error-message">{message}</p>}
            <p className="auth-link">
                Don't have an account? <a href="/register">Register here</a>
            </p>
        </div>
    );
}

export default Login;