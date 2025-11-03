import React, { useEffect, useState, useMemo, useRef } from "react";
import { useStore } from "../../store/zustand";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import Navbar from "../Nav/Navbar";

const URL = process.env.NODE_ENV === "production" ? undefined : "http://localhost:3000";

const Student = () => {
  const navigate = useNavigate();
  const { roomId } = useParams(); // match teacher URL exactly
  const { user } = useStore();

  const socket = useMemo(() => io(URL), []);

  const [question, setQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSelectionLocked, setIsSelectionLocked] = useState(false);
  const [isTeacherPresent, setIsTeacherPresent] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);

  const timerRef = useRef(null);

  // ---------------- Navigation guard ----------------
  useEffect(() => {
    if (!user) navigate("/");
    if (user === "teacher") navigate(`/teacher/${roomId}`);
  }, [user, navigate, roomId]);

  // ---------------- Socket setup ----------------
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Student connected:", socket.id);
      socket.emit("joinRoom", roomId, "student");
    });

    socket.on("newQuestion", (data) => {
      clearInterval(timerRef.current);
      setQuestion(data);
      setSelectedOption(null);
      setIsSelectionLocked(false);
      setTimeLeft(data.timer || 20);

      // Start countdown
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsSelectionLocked(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    });

    socket.on("updateQuestion", (data) => setQuestion(data));

    socket.on("pollEnded", () => {
      clearInterval(timerRef.current);
      setIsSelectionLocked(true);
    });

    socket.on("teacherLeft", () => {
      setIsTeacherPresent(false);
      setQuestion(null);
    });
   
    return () => {
      clearInterval(timerRef.current);
      socket.disconnect();
    };
  }, [roomId, socket]);

  // ---------------- Option click handler ----------------
  const handleOptionClick = (optionId) => {
    if (!isSelectionLocked && question) {
      setSelectedOption(optionId);
      setIsSelectionLocked(true);

      socket.emit("submit", {
        choosedAns: optionId,
        roomId,
      });
    }
  };

  // ---------------- Render ----------------
  if (!isTeacherPresent) {
    return (
      <>
        <Navbar />
        <div className="mt-20 flex justify-center items-center">
          <h1 className="text-4xl font-bold">Teacher Left</h1>
        </div>
      </>
    );
  }

  if (!question) {
    return (
      <>
        <Navbar />
        <div className="mt-20 flex justify-center items-center">
          <h1 className="text-4xl font-bold">
            Waiting for teacher to ask a question...
          </h1>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="mt-20 flex flex-col items-center justify-center px-4">
        {/* Question */}
        <h1 className="text-4xl font-bold mb-8 text-center">
          {question.questionText}
        </h1>

        {/* Timer */}
        <div className="mb-6 text-xl font-semibold">Time Left: {timeLeft} sec</div>

        {/* Options */}
        <div className="grid gap-4 w-full max-w-md">
          {question.options.map((option) => {
            let bgClass = "bg-blue-500";
            if (selectedOption !== null) {
              if (option.id === question.correctId) bgClass = "bg-green-800";
              else if (option.id === selectedOption) bgClass = "bg-red-600";
            }

            const percent =
              question.totalVotes > 0
                ? ((option.optionVotes / question.totalVotes) * 100).toFixed(0)
                : 0;

            return (
              <button
                key={option.id}
                className={`w-full px-6 py-4 rounded-lg font-bold text-xl text-white cursor-pointer transition duration-300 ${bgClass}`}
                onClick={() => handleOptionClick(option.id)}
                disabled={isSelectionLocked}
              >
                <div className="flex justify-between items-center">
                  <span>{option.optionText}</span>
                  {selectedOption !== null && <span>{percent}%</span>}
                </div>
              </button>
            );
          })}
        </div>

        {/* Total votes */}
        {selectedOption !== null && (
          <div className="mt-6 text-lg font-medium">
            Total Participants: {question.totalVotes}
          </div>
        )}
      </div>
    </>
  );
};

export default Student;
