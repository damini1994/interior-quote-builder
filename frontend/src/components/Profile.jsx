import React from 'react';
import EditProfile from './EditProfile';
import { useSelector } from 'react-redux';

const Profile = () => {
    const user = useSelector((store) => store.user);

    if (!user) {
        return <div className="text-center mt-10">Loading user...</div>;
    }

    return <EditProfile user={user} />;
};

export default Profile;
