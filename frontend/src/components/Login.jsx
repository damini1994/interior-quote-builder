import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addUser } from './../utils/userSlice';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, ChevronLeft, AlertCircle } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
    });
    const [viewMode, setViewMode] = useState('login'); // 'login', 'signup', 'forgotPassword'
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [notification, setNotification] = useState(null);
    
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: '',
            });
        }
    };

    // Form validation
    const validateForm = () => {
        const newErrors = {};
        
        if (viewMode !== 'forgotPassword') {
            if (!formData.email) newErrors.email = 'Email is required';
            else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
            
            if (!formData.password) newErrors.password = 'Password is required';
            else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        } else {
            if (!formData.email) newErrors.email = 'Email is required';
            else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        }
        
        if (viewMode === 'signup') {
            if (!formData.firstName) newErrors.firstName = 'First name is required';
            if (!formData.lastName) newErrors.lastName = 'Last name is required';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setIsLoading(true);
        
        try {
            if (viewMode === 'login') {
                await handleLogin();
            } else if (viewMode === 'signup') {
                await handleSignup();
            } else if (viewMode === 'forgotPassword') {
                await handleForgotPassword();
            }
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async () => {
        try {
            const res = await axios.post(
                'http://localhost:8081/api/auth/login',
                { email: formData.email, password: formData.password },
                { withCredentials: true }
            );
            
            dispatch(addUser(res.data.user));
            showNotification('Login successful', 'success');
            setTimeout(() => navigate('/profile'), 1000);
        } catch (err) {
            showNotification(err?.response?.data || 'Login failed. Please check your credentials.', 'error');
        }
    };

    const handleSignup = async () => {
        try {
            await axios.post(
                'http://localhost:8081/api/auth/register',
                { 
                    firstName: formData.firstName, 
                    lastName: formData.lastName, 
                    email: formData.email, 
                    password: formData.password,
                    role: 'WORKER' 
                },
                { withCredentials: true }
            );
            
            showNotification('Account created successfully! Please log in.', 'success');
            setTimeout(() => setViewMode('login'), 1500);
        } catch (err) {
            showNotification(err?.response?.data || 'Registration failed. Please try again.', 'error');
        }
    };

    const handleForgotPassword = async () => {
        try {
            await axios.post(
                'http://localhost:8081/api/auth/forgot-password',
                { email: formData.email }
            );
            
            showNotification('Password reset link sent to your email!', 'success');
            setTimeout(() => setViewMode('login'), 3000);
        } catch (err) {
            showNotification(err?.response?.data || 'Failed to send reset link. Please try again.', 'error');
        }
    };

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 5000);
    };

    // Clear notification on view mode change
    useEffect(() => {
        setNotification(null);
        setErrors({});
    }, [viewMode]);

    // Form title based on view mode
    const getFormTitle = () => {
        switch (viewMode) {
            case 'signup': return 'Create Account';
            case 'forgotPassword': return 'Reset Password';
            default: return 'Welcome Back';
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
            style={{
                backgroundImage:
                    "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1470&q=80')",
            }}
        >
            {/* Improved overlay with gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-md"></div>

            {/* Login/Signup card */}
            <div className="relative z-10 w-full max-w-md p-8 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl transition-all duration-300 transform">
                
                {/* Back button for forgot password and signup views */}
                {viewMode !== 'login' && (
                    <button 
                        onClick={() => setViewMode('login')}
                        className="absolute top-4 left-4 text-gray-600 hover:text-indigo-600 flex items-center text-sm font-medium"
                    >
                        <ChevronLeft size={16} />
                        <span>Back</span>
                    </button>
                )}

                {/* Form title */}
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
                    {getFormTitle()}
                </h2>
                
                {/* Subtitle */}
                <p className="text-center text-gray-600 mb-6">
                    {viewMode === 'login' && 'Sign in to access your account'}
                    {viewMode === 'signup' && 'Join our community today'}
                    {viewMode === 'forgotPassword' && 'Enter your email to receive a reset link'}
                </p>

                {/* Notification */}
                {notification && (
                    <div className={`mb-4 p-3 rounded-lg flex items-center ${
                        notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                        <AlertCircle size={16} className="mr-2" />
                        <span>{notification.message}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* First & Last Name (Signup only) */}
                    {viewMode === 'signup' && (
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User size={16} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        placeholder="John"
                                        className={`w-full pl-10 pr-4 py-2 border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                    />
                                </div>
                                {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User size={16} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        placeholder="Doe"
                                        className={`w-full pl-10 pr-4 py-2 border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                    />
                                </div>
                                {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
                            </div>
                        </div>
                    )}

                    {/* Email Field */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail size={16} className="text-gray-400" />
                            </div>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                className={`w-full pl-10 pr-4 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                            />
                        </div>
                        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                    </div>

                    {/* Password Field (not shown for forgot password) */}
                    {viewMode !== 'forgotPassword' && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock size={16} className="text-gray-400" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className={`w-full pl-10 pr-10 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                        </div>
                    )}

                    {/* Forgot Password Link (Only in login mode) */}
                    {viewMode === 'login' && (
                        <div className="flex justify-end mb-4">
                            <button
                                type="button"
                                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                                onClick={() => setViewMode('forgotPassword')}
                            >
                                Forgot password?
                            </button>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center"
                    >
                        {isLoading ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </span>
                        ) : (
                            <span>
                                {viewMode === 'login' && 'Sign In'}
                                {viewMode === 'signup' && 'Create Account'}
                                {viewMode === 'forgotPassword' && 'Send Reset Link'}
                            </span>
                        )}
                    </button>
                </form>

                {/* Mode Switch (Login/Signup) */}
                {viewMode !== 'forgotPassword' && (
                    <p className="mt-6 text-sm text-center text-gray-600">
                        {viewMode === 'login' ? 'New here?' : 'Already have an account?'}{' '}
                        <button
                            className="text-indigo-600 hover:text-indigo-800 font-medium"
                            onClick={() => setViewMode(viewMode === 'login' ? 'signup' : 'login')}
                        >
                            {viewMode === 'login' ? 'Create an account' : 'Sign in'}
                        </button>
                    </p>
                )}
            </div>
        </div>
    );
};

export default Login;