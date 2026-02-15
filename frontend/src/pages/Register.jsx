import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";

function Register() {
    // State for registration form
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [birthday, setBirthday] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    // Comprehensive form validation for registration
    const validateForm = () => {
        const newErrors = {};
        if (!name.trim() || name.length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }
        if (!email.includes('@') || !email.includes('.')) {
            newErrors.email = 'Please enter a valid email address';
        }
        if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        if (phoneNumber && !/^[\d\s\-\+\(\)]+$/.test(phoneNumber)) {
            newErrors.phoneNumber = 'Please enter a valid phone number';
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
                body: JSON.stringify({ 
                    email, 
                    password,
                    username: name,
                    birthday,
                    phoneNumber
                }),
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
                    
                    // Extract user data with registration info
                    const userData = {
                        email: email,
                        username: name,
                        displayName: name,
                        birthday: birthday,
                        phoneNumber: phoneNumber,
                        id: loginData.user_id || loginData.user?.id,
                        ...loginData.user
                    };
                    
                    login(token, userData);
                    navigate("/");
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
            <h2>Create Your Account</h2>
            <p className="register-subtitle">Join LifeHub and start organizing your digital life</p>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Full Name: *</label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            if (errors.name) setErrors({...errors, name: ''});
                        }}
                        placeholder="John Doe"
                        required
                        className={errors.name ? "error-input" : ""}
                    />
                    {errors.name && <span className="error-text">{errors.name}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email: *</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (errors.email) setErrors({...errors, email: ''});
                        }}
                        placeholder="john@example.com"
                        required
                        className={errors.email ? "error-input" : ""}
                    />
                    {errors.email && <span className="error-text">{errors.email}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="birthday">Birthday: *</label>
                    <input
                        id="birthday"
                        name="birthday"
                        type="date"
                        value={birthday}
                        onChange={(e) => {
                            setBirthday(e.target.value);
                            if (errors.birthday) setErrors({...errors, birthday: ''});
                        }}
                        required
                        className={errors.birthday ? "error-input" : ""}
                    />
                    {errors.birthday && <span className="error-text">{errors.birthday}</span>}
                    <small className="field-hint">We'll celebrate with you! 🎂</small>
                </div>

                <div className="form-group">
                    <label htmlFor="phoneNumber">Phone Number: (Optional)</label>
                    <input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => {
                            setPhoneNumber(e.target.value);
                            if (errors.phoneNumber) setErrors({...errors, phoneNumber: ''});
                        }}
                        placeholder="+1 (555) 123-4567"
                        className={errors.phoneNumber ? "error-input" : ""}
                    />
                    {errors.phoneNumber && <span className="error-text">{errors.phoneNumber}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password: *</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            if (errors.password) setErrors({...errors, password: ''});
                        }}
                        placeholder="At least 6 characters"
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