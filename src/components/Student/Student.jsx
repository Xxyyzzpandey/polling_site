import React, { useEffect, useState, useRef } from "react";
import { useStore } from "../../store/zustand";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import Navbar from "../Nav/Navbar";

// const URL = process.env.NODE_ENV === "production" ? undefined : "http://localhost:3000";
const URL = "https://polling-backend-1nih.onrender.com"

export default function Student() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const { user } = useStore();

  const [question, setQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isSelectionLocked, setIsSelectionLocked] = useState(false);
  const [isTeacherPresent, setIsTeacherPresent] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);

  const socketRef = useRef(null);
  if (!socketRef.current) {
    socketRef.current = io(URL,{
  transports: ["websocket"],
  withCredentials: true,
});
  }
  const socket = socketRef.current;

  // Navigation guard
  useEffect(() => {
    if (!user) return navigate("/");
    if (user === "teacher") navigate(`/teacher/${roomId}`);
  }, [user, navigate, roomId]);

  // Handle incoming new question
  const handleNewQuestion = (data) => {
    setQuestion(data);
    setTimeLeft(data.remainingTime ?? 0);

    // Reset for a new question
    setSelectedOption(null);
    setHasAnswered(false);
    setIsSelectionLocked(false);
  };

  // Handle poll results
  const handlePollResults = (data) => {
    setQuestion({
      questionText: data.questionText,
      options: data.options,
      totalVotes: data.totalParticipants,
      correctId: data.correctOption?.id ?? -1,
      status: "ended",
    });
    setTimeLeft(0);
    setIsSelectionLocked(true);

    // If student answered, keep their selection visible
    if (hasAnswered && selectedOption) {
      setIsSelectionLocked(true);
    }
  };

  // Handle timer updates
  const handleTimerUpdate = ({ remainingTime }) => {
    setTimeLeft(remainingTime);
    if (remainingTime <= 0) setIsSelectionLocked(true);
  };

  // Socket setup
  useEffect(() => {
    socket.on("connect", () => {
      socket.emit("joinRoom", roomId, "student");
    });

    socket.on("newQuestion", handleNewQuestion);
    socket.on("pollResults", handlePollResults);
    socket.on("timerUpdate", handleTimerUpdate);
    socket.on("updateQuestion", setQuestion);
    socket.on("pollEnded", () => setIsSelectionLocked(true));
    socket.on("teacherLeft", () => {
      setIsTeacherPresent(false);
      setQuestion(null);
    });

    return () => {
      socket.off("connect");
      socket.off("newQuestion", handleNewQuestion);
      socket.off("pollResults", handlePollResults);
      socket.off("timerUpdate", handleTimerUpdate);
      socket.off("updateQuestion", setQuestion);
      socket.off("pollEnded");
      socket.off("teacherLeft");
    };
  }, [roomId]);

  // Handle option selection
  const handleOptionClick = (optionId) => {
  // Only allow click if timeLeft > 0, student hasn't answered, and question exists
  if (timeLeft > 0 && !hasAnswered && question) {
    setSelectedOption(optionId);
    setIsSelectionLocked(true);
    setHasAnswered(true);
    socket.emit("submit", { choosedAns: optionId, roomId });
  }
};


  // UI if teacher left
  if (!isTeacherPresent)
    return (
      <>
        <Navbar />
        <div className="mt-20 text-center text-4xl font-bold">Teacher Left</div>
      </>
    );

  // UI while waiting for question
  if (!question)
    return (
      <>
        <Navbar />
        <div className="mt-20 text-center text-4xl font-bold">
          Waiting for teacher to ask a question...
        </div>
      </>
    );

  // Main UI
  return (
    <>
      <Navbar />
      <div className="mt-20 flex flex-col items-center px-4">
        <h1 className="text-4xl font-bold mb-8 text-center">{question.questionText}</h1>
        <div className="mb-6 text-xl font-semibold">Time Left: {timeLeft} sec</div>

        <div className="grid gap-4 w-full max-w-md">
          {question.options.map((option) => {
            let bgClass = "bg-blue-500";
            if (selectedOption !== null || question.status === "ended") {
              if (option.id === question.correctId) bgClass = "bg-green-800";
              else if (option.id === selectedOption && selectedOption !== question.correctId)
                bgClass = "bg-red-600";
            }

            const percent =
              question.totalVotes > 0
                ? ((option.optionVotes / question.totalVotes) * 100).toFixed(0)
                : 0;

            return (
              <button
                key={option.id}
                className={`w-full px-6 py-4 rounded-lg text-xl text-white font-bold ${bgClass}`}
                onClick={() => handleOptionClick(option.id)}
                disabled={isSelectionLocked}
              >
                <div className="flex justify-between items-center">
                  <span>{option.optionText}</span>
                  {(selectedOption !== null || question.status === "ended") && <span>{percent}%</span>}
                </div>
              </button>
            );
          })}
        </div>

        {selectedOption !== null && (
          <div className="mt-6 text-lg font-medium">Total Participants: {question.totalVotes}</div>
        )}
      </div>
    </>
  );
}
