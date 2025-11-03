import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ showLogoutButton = true }) => {
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [userVote, setUserVote] = useState(null); // 'like' | 'dislike' | null
const navigate =useNavigate();
  useEffect(() => {
    const savedVote = localStorage.getItem('sudpollVote');
    if (savedVote) setUserVote(savedVote);
  }, []);

  const handleVote = (voteType) => {
    if (userVote === voteType) return; // same vote, do nothing

    // Undo previous vote
    if (userVote === 'like') setLikes((prev) => prev - 1);
    if (userVote === 'dislike') setDislikes((prev) => prev - 1);

    // Apply new vote
    if (voteType === 'like') setLikes((prev) => prev + 1);
    if (voteType === 'dislike') setDislikes((prev) => prev + 1);

    setUserVote(voteType);
    localStorage.setItem('sudpollVote', voteType);
  };

  const logoutHandler = () => {
    localStorage.clear();
    navigate("/")
  };

  return (
    <nav className="bg-gray-800 py-4 px-6 flex justify-between items-center shadow-md">
      {/* Logo */}
      <div className="flex items-center gap-4">
        <Link to="/" className="text-white text-2xl font-bold hover:text-blue-400 transition">
          LiveVote
        </Link>
        <span className="text-gray-300 italic">— Real-time Polling</span>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-6">
        {/* Voting */}
        <div className="flex items-center gap-2 text-white">
          <button
            onClick={() => handleVote('like')}
            className={`px-3 py-1 rounded hover:bg-green-600 transition ${
              userVote === 'like' ? 'bg-green-700 font-bold' : ''
            }`}
          >
            👍 {likes}
          </button>
          <button
            onClick={() => handleVote('dislike')}
            className={`px-3 py-1 rounded hover:bg-red-600 transition ${
              userVote === 'dislike' ? 'bg-red-700 font-bold' : ''
            }`}
          >
            👎 {dislikes}
          </button>
        </div>

        {/* Optional Logout */}
        {showLogoutButton && (
          <button
            onClick={logoutHandler}
            className="text-gray-300 hover:text-white px-3 py-1 rounded border border-gray-500 hover:border-white transition"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
