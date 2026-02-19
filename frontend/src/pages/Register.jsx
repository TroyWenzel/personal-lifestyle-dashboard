import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import "@/styles/GlassDesignSystem.css";
import apiClient from '../api/client';

// ═══════════════════════════════════════════════════════════════
// Register Page
// ═══════════════════════════════════════════════════════════════

function Register() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        birthday: "",
        phoneNumber: "",
        password: "",
        confirmPassword: ""
    });
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (formData.name.length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }
        
        if (!formData.email.includes('@') || !formData.email.includes('.')) {
            newErrors.email = 'Please enter a valid email address';
        }
        
        if (!formData.birthday) {
            newErrors.birthday = 'Birthday is required';
        }
        
        if (formData.phoneNumber && !/^\+?[\d\s()-]+$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = 'Please enter a valid phone number';
        }
        
        if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        
        if (formData.password !== formData.confirmPassword) {
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
            const response = await apiClient.post("/auth/register", {
                email: formData.email,
                password: formData.password,
                username: formData.name,
                birthday: formData.birthday,
                phoneNumber: formData.phoneNumber
            });

            const userData = {
                email: formData.email,
                username: formData.name,
                birthday: formData.birthday,
                phoneNumber: formData.phoneNumber,
                id: response.user_id,
                ...response.user
            };

            login(response.access_token, userData);
            setMessage("Registration successful! Redirecting...");
            setTimeout(() => navigate("/"), 1000);
        } catch (error) {
            console.error("Registration error:", error);
            setMessage(error.response?.data?.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-page" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: '100vh',
            padding: '2rem 1rem'
        }}>
            <div className="glass-card" style={{ 
                maxWidth: '500px', 
                width: '100%', 
                padding: '2.5rem'
            }}>
                <div style={{ 
                    textAlign: 'center', 
                    marginBottom: '2rem' 
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✨</div>
                    <h2 style={{ color: 'var(--text-primary)', fontSize: '2rem', marginBottom: '0.5rem' }}>
                        Create Account
                    </h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Join LifeHub today!</p>
                </div>

                {message && (
                    <div className="glass-card" style={{ 
                        marginBottom: '1.5rem', 
                        padding: '1rem',
                        background: message.includes('successful') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        borderColor: message.includes('successful') ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'
                    }}>
                        <p style={{ color: message.includes('successful') ? '#10b981' : '#ef4444', margin: 0, textAlign: 'center' }}>
                            {message.includes('successful') ? '✅' : '❌'} {message}
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '0.5rem', 
                            color: 'var(--text-secondary)', 
                            fontWeight: '500' 
                        }}>
                            Full Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            required
                            className="glass-input"
                            style={{ width: '100%' }}
                        />
                        {errors.name && (
                            <small style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                                {errors.name}
                            </small>
                        )}
                    </div>

                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '0.5rem', 
                            color: 'var(--text-secondary)', 
                            fontWeight: '500' 
                        }}>
                            Email Address *
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="your.email@example.com"
                            required
                            className="glass-input"
                            style={{ width: '100%' }}
                        />
                        {errors.email && (
                            <small style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                                {errors.email}
                            </small>
                        )}
                    </div>

                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '0.5rem', 
                            color: 'var(--text-secondary)', 
                            fontWeight: '500' 
                        }}>
                            Birthday * 🎂
                        </label>
                        <input
                            type="date"
                            name="birthday"
                            value={formData.birthday}
                            onChange={handleChange}
                            required
                            className="glass-input"
                            style={{ width: '100%' }}
                        />
                        <small style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', display: 'block', marginTop: '0.25rem' }}>
                            We'll celebrate with you!
                        </small>
                        {errors.birthday && (
                            <small style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                                {errors.birthday}
                            </small>
                        )}
                    </div>

                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '0.5rem', 
                            color: 'var(--text-secondary)', 
                            fontWeight: '500' 
                        }}>
                            Phone Number (Optional)
                        </label>
                        <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            placeholder="+1 (555) 123-4567"
                            className="glass-input"
                            style={{ width: '100%' }}
                        />
                        {errors.phoneNumber && (
                            <small style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                                {errors.phoneNumber}
                            </small>
                        )}
                    </div>

                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '0.5rem', 
                            color: 'var(--text-secondary)', 
                            fontWeight: '500' 
                        }}>
                            Password *
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Create a password"
                            required
                            className="glass-input"
                            style={{ width: '100%' }}
                        />
                        {errors.password && (
                            <small style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                                {errors.password}
                            </small>
                        )}
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '0.5rem', 
                            color: 'var(--text-secondary)', 
                            fontWeight: '500' 
                        }}>
                            Confirm Password *
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                            required
                            className="glass-input"
                            style={{ width: '100%' }}
                        />
                        {errors.confirmPassword && (
                            <small style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                                {errors.confirmPassword}
                            </small>
                        )}
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="glass-btn"
                        style={{ width: '100%', marginBottom: '1rem' }}
                    >
                        {loading ? 'Creating account...' : '🚀 Create Account'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Already have an account?{' '}
                            <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: '600', textDecoration: 'none' }}>
                                Sign in
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Register;