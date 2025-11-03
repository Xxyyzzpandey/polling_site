import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/zustand";

const Home = () => {
  const navigate = useNavigate();
  const { user, setUserType } = useStore();

  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");

  // ------------------ Student Selection ------------------
  const studentHandler = () => {
    setUserType("student");
  };

  // ------------------ Teacher Selection ------------------
  const teacherHandler = () => {
    let room = localStorage.getItem("teacherRoom");
    if (!room) {
      room = `room-${Math.floor(1000 + Math.random() * 9000)}`;
      localStorage.setItem("teacherRoom", room);
    }
    setUserType("teacher", room);
    navigate(`/teacher/${room}`);
  };

  // ------------------ Student Join Form ------------------
  const handleStudentSubmit = (e) => {
    e.preventDefault();
    if (!username || !roomCode) return alert("Enter both name and room code!");
    setUserType("student", username);
    navigate(`/student/${roomCode}`);
  };

  // ------------------ Render ------------------
  // If user already selected "student", show join form
  if (user === "student") {
    return (
      <div className="flex flex-col items-center justify-center mt-[15%]">
        <h1 className="text-3xl font-bold mb-8">Join a Poll Room</h1>
        <form
          onSubmit={handleStudentSubmit}
          className="flex flex-col items-center w-[300px]"
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
      </div>
    );
  }

  // Default view: ask what kind of user
  return (
    <div className="flex flex-col items-center justify-center mt-[20%]">
      <h1 className="text-4xl font-bold mb-8">What kind of user are you?</h1>
      <div className="flex gap-4">
        <button
          onClick={studentHandler}
          className="bg-blue-500 text-white px-12 py-6 rounded-lg cursor-pointer hover:bg-blue-600 transition duration-300"
        >
          <h2 className="text-2xl font-bold">Student</h2>
        </button>
        <button
          onClick={teacherHandler}
          className="bg-green-500 text-white px-12 py-6 rounded-lg cursor-pointer hover:bg-green-600 transition duration-300"
        >
          <h2 className="text-2xl font-bold">Teacher</h2>
        </button>
      </div>
    </div>
  );
};

export default Home;
