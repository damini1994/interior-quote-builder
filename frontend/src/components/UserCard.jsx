import axios from 'axios';
import React from 'react'
import { useDispatch } from 'react-redux';


const UserCard = ({ user }) => {
    const { firstName, lastName, email } = user;
    const dispatch = useDispatch();


    return (
        <div className="card bg-base-300 w-96 shadow-xl">

            <div className="card-body">
                <h2 className="card-title">{firstName + " " + lastName}</h2>
                {/* {age && gender && <p>{age + ", " + gender}</p>} */}
                <h2>{email}</h2>

            </div>
        </div>
    )
}

export default UserCard