import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Register() {
    // State for registration form
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    // Comprehensive form validation for registration
    const validateForm = () => {
        const newErrors = {};
        if (!email.includes('@') || !email.includes('.')) {
            newErrors.email = 'Please enter a valid email address';
        }
        if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }
        
        setErrors({});
        setLoading(true);

        try {
            // First, register the user
            const response = await fetch("http://localhost:5000/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage("Registration successful! Logging you in...");
                
                // Automatically log in the user after successful registration
                const loginResponse = await fetch("http://localhost:5000/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });

                const loginData = await loginResponse.json();
                
                if (loginResponse.ok) {
                    const token = loginData.access_token || loginData.token || loginData.jwt;
                    login(token);
                    navigate("/dashboard");
                } else {
                    setMessage("Registration successful but auto-login failed. Please log in manually.");
                }
            } else {
                setMessage(data.message || "Registration failed");
            }
        } catch (error) {
            console.error("Registration error:", error);
            setMessage("Unable to connect to server. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <h2>Register</h2>
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
                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password:</label>
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (errors.confirmPassword) setErrors({...errors, confirmPassword: ''});
                        }}
                        required
                        className={errors.confirmPassword ? "error-input" : ""}
                    />
                    {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>
            {message && (
                <p className={message.includes("successful") ? "success-message" : "error-message"}>
                    {message}
                </p>
            )}
            <p className="auth-link">
                Already have an account? <a href="/login">Login here</a>
            </p>
        </div>
    );
}

export default Register;