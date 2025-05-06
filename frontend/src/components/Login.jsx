import axios from 'axios';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addUser } from './../utils/userSlice';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [signup, setSignup] = useState(false);
    const [error, setError] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const res = await axios.post(
                'http://localhost:8081/api/auth/login',
                { email, password },
                { withCredentials: true }
            );
            dispatch(addUser(res.data.user));
            navigate('/profile');
        } catch (err) {
            setError(err?.response?.data || 'Something went wrong');
        }
    };

    const handleSignup = async () => {
        try {
            await axios.post(
                'http://localhost:8081/api/auth/register',
                { firstName, lastName, email, password,  role: 'WORKER' },
                { withCredentials: true }
            );
            setSignup(false);
            navigate('/');
        } catch (err) {
            setError(err?.response?.data || 'Something went wrong');
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
            {/* Full-screen overlay with stronger blur */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[6px]"></div>

            {/* Login/Signup card */}
            <div className="relative z-10 w-full max-w-md p-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
                    {signup ? 'Sign Up' : 'Login'}
                </h2>

                {signup && (
                    <>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="John"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Doe"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </>
                )}

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

                <button
                    className="w-full py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                    onClick={signup ? handleSignup : handleLogin}
                >
                    {signup ? 'Sign Up' : 'Login'}
                </button>

                <p
                    className="mt-4 text-sm text-center text-gray-600 hover:text-indigo-600 cursor-pointer"
                    onClick={() => setSignup((prev) => !prev)}
                >
                    {signup ? 'Already have an account? Login here' : 'New user? Sign up here'}
                </p>
            </div>
        </div>
    );
};

export default Login;
