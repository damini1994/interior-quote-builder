import React, { useState } from 'react';
import UserCard from './UserCard';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { addUser } from "./../utils/userSlice";

const EditProfile = ({ user }) => {
    const [firstName, setFirstName] = useState(user?.firstName || '');
    const [lastName, setLastName] = useState(user?.lastName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [error, setError] = useState('');
    const [showToast, setShowToast] = useState(false);
    const dispatch = useDispatch();

    const saveProfile = async () => {
        setError("");
        try {
            const res = await axios.put( // ✅ Use PUT instead of PATCH
                "http://localhost:8081/api/auth/user", // ✅ Match backend endpoint
                { firstName, lastName, email },
                { withCredentials: true }
            );
            dispatch(addUser(res.data)); // assuming `res.data` is of type `UserResponse`
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to update profile");
        }
    };
    
    return (
        <>
            <div className='flex flex-col md:flex-row justify-center my-10 gap-10'>
                <div className='card bg-base-300 w-96 shadow-xl'>
                    <div className='card-body'>
                        <h2 className='card-title justify-center'>Edit Profile</h2>
                        <label className='form-control my-2'>
                            <span className='label-text'>First Name</span>
                            <input
                                type='text'
                                value={firstName}
                                className='input input-bordered w-full'
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                        </label>
                        <label className='form-control my-2'>
                            <span className='label-text'>Last Name</span>
                            <input
                                type='text'
                                value={lastName}
                                className='input input-bordered w-full'
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </label>
                        <label className='form-control my-2'>
                            <span className='label-text'>Email</span>
                            <input
                                type='text'
                                value={email}
                                className='input input-bordered w-full'
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </label>
                        <p className='text-red-500'>{error}</p>
                        <div className='card-actions justify-center mt-4'>
                            <button className='btn bg-primary text-white' onClick={saveProfile}>
                                Save Profile
                            </button>
                        </div>
                    </div>
                </div>
                <UserCard user={{ firstName, lastName, email }} />
            </div>
            {showToast && (
                <div className="toast toast-top toast-center">
                    <div className="alert alert-success">
                        <span>Profile saved successfully.</span>
                    </div>
                </div>
            )}
        </>
    );
};

export default EditProfile;
