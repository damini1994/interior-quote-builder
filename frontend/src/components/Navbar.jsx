import { useSelector } from "react-redux";
import { useState } from "react";
import { FaCog } from "react-icons/fa";
import EditProfile from "./EditProfile";

const Navbar = () => {
    const user = useSelector((store) => store.user);
    const [showEdit, setShowEdit] = useState(false);

    if (!user) return null;

    return (
        <div className="flex justify-end items-center p-4 bg-gray-100 shadow">
            <span className="mr-4 font-semibold">{user.firstName}</span>
            <button onClick={() => setShowEdit(true)}>
                <FaCog className="text-xl" />
            </button>

            {showEdit && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-4 rounded-lg shadow-lg relative w-full max-w-3xl">
                        <button
                            onClick={() => setShowEdit(false)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-black"
                        >
                            ✖
                        </button>
                        <EditProfile user={user} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Navbar;