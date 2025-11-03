import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/zustand";

const Home = () => {
  const navigate = useNavigate();
  const { setUserType } = useStore();

  const [role, setRole] = useState(null); // "student" or "teacher"
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");

  // ------------------ Teacher Handler ------------------
  const handleTeacher = () => {
    let room = localStorage.getItem("teacherRoom");
    if (!room) {
      room = `room-${Math.floor(1000 + Math.random() * 9000)}`;
      localStorage.setItem("teacherRoom", room);
    }
    setUserType("teacher", room);
    navigate(`/teacher/${room}`);
  };

  // ------------------ Student Submit ------------------
  const handleStudentSubmit = (e) => {
    e.preventDefault();
    if (!username || !roomCode) return alert("Enter both name and room code!");
    setUserType("student", username);
    navigate(`/student/${roomCode}`);
  };

  // ------------------ Reset Role ------------------
  const resetRole = () => {
    setRole(null);
    setUsername("");
    setRoomCode("");
  };

  // ------------------ Render ------------------
  return (
    <div className="flex flex-col items-center justify-center mt-[15%] px-4">
      {!role ? (
        <>
          <h1 className="text-4xl font-bold mb-10">What kind of user are you?</h1>
          <div className="flex gap-6">
            <button
              onClick={() => setRole("student")}
              className="bg-blue-500 text-white px-10 py-6 rounded-lg hover:bg-blue-600 transition duration-300 shadow-lg"
            >
              <h2 className="text-2xl font-bold">Student</h2>
            </button>
            <button
              onClick={() => handleTeacher()}
              className="bg-green-500 text-white px-10 py-6 rounded-lg hover:bg-green-600 transition duration-300 shadow-lg"
            >
              <h2 className="text-2xl font-bold">Teacher</h2>
            </button>
          </div>
        </>
      ) : (
        role === "student" && (
          <div className="flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-6">Join a Poll Room</h1>
            <form
              onSubmit={handleStudentSubmit}
              className="flex flex-col items-center w-full max-w-sm"
            >
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-2 mb-4 text-xl border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-500"
              />
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="Enter room code"
                className="w-full px-4 py-2 mb-4 text-xl border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-8 py-2 rounded-lg font-bold text-xl cursor-pointer hover:bg-blue-600 transition duration-300"
              >
                Join Room
              </button>
            </form>
            <button
              onClick={resetRole}
              className="mt-4 text-sm text-gray-600 underline hover:text-gray-800"
            >
              ← Back
            </button>
          </div>
        )
      )}
    </div>
  );
};

export default Home;
