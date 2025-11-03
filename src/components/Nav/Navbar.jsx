import React from 'react';
import {Link} from 'react-router-dom';
import {useNavigate} from 'react-router-dom';

const Navbar = ({showLogoutButton = true}) => {
    const logoutHandler = () => {
        localStorage.clear();
    };

    return (
        <nav className="bg-gray-800 py-4">
            <div className=" mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    <div className="flex-shrink-0">
                        <Link to="/" className="text-white text-2xl font-bold">Instavote</Link>
                    </div>
                    <div>
                        <div className="flex space-x-9">
                            <a href="https://github.com/gaurav89830/instaVote-frontend" className="cursor-pointer text-gray-300 hover:text-white">Github</a>
                            {showLogoutButton && (
                                <a href="/" onClick={logoutHandler} className="cursor-pointer text-gray-300 hover:text-white">Logout</a>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
