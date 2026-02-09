import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./Login.css";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

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
        
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }
        
        setErrors({});
        setLoading(true);

        try {
            const response = await fetch("http://localhost:5000/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            console.log("API Response:", data);

            if (response.ok) {
                const token = data.access_token || data.token || data.jwt;
                console.log("Token found:", token);
                
                if (token) {
                    login(token);
                    navigate("/dashboard");
                } else {
                    setMessage("No token in response");
                }
            } else {
                setMessage(data.message || "Login failed");
            }
        } catch (error) {
            console.error("Login error:", error);
            setMessage("Error connecting to server");
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