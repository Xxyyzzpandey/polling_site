import React, { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { Slider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../store/zustand";
import Navbar from "../Nav/Navbar";

const URL = process.env.NODE_ENV === "production" ? undefined : "http://localhost:3000";

export default function Teacher() {
  const { name, user } = useStore();
  const navigate = useNavigate();

  const roomId = useMemo(() => {
    const cleaned = (name || "").trim();
    return cleaned.length ? `${cleaned}_room` : `room_${Math.random().toString(36).slice(2, 8)}`;
  }, [name]);

  const socket = useMemo(() => io(URL), []);

  const [sliderTime, setSliderTime] = useState(20);
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const intervalRef = useRef(null);

  const [newQuestion, setNewQuestion] = useState({
    questionText: "No Previous Question!",
    options: [
      { id: 1, optionVotes: 0, optionText: "Option A" },
      { id: 2, optionVotes: 0, optionText: "Option B" },
      { id: 3, optionVotes: 0, optionText: "Option C" },
      { id: 4, optionVotes: 0, optionText: "Option D" },
    ],
    correctId: -1,
    totalVotes: 0,
    remainingTime: 0,
    status: "ended",
  });

  const [formData, setFormData] = useState({
    questionText: "What would you like to call yourself?",
    options: [
      { id: 1, optionVotes: 0, optionText: "Software Developer" },
      { id: 2, optionVotes: 0, optionText: "Coder" },
      { id: 3, optionVotes: 0, optionText: "Programmer" },
      { id: 4, optionVotes: 0, optionText: "Software Engineer" },
    ],
    correctId: -1,
    timer: 0,
  });

  // ---------------- Socket setup ----------------
  useEffect(() => {
    socket.on("connect", () => {
      socket.emit("joinRoom", roomId, "teacher");
    });

    // Real-time updates from server
    socket.on("updateQuestion", (data) => {
      setNewQuestion(data);
    });

    socket.on("timerUpdate", ({ remainingTime }) => {
      setNewQuestion((prev) => ({ ...prev, remainingTime }));
    });
   
    socket.on("pollResults", (data) => {
  setNewQuestion({
    questionText: data.questionText,
    options: data.options,
    totalVotes: data.totalParticipants,
    correctId: data.correctOption?.id ?? -1,
    status: "ended"
  });
  setTimer(0);
});


    socket.on("pollEnded", () => {
      clearCountdown();
      setSubmitDisabled(false);
      setNewQuestion((prev) => ({ ...prev, status: "ended", remainingTime: 0 }));
    });

    return () => {
      clearCountdown();
      socket.disconnect();
    };
  }, [roomId, socket]);

  // ---------------- Navigation Guard ----------------
  useEffect(() => {
    if (user === "student") navigate("/student");
    if (!user) navigate("/");
  }, [user, navigate]);

  // ---------------- Countdown ----------------
  const clearCountdown = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startCountdown = (duration) => {
    clearCountdown();
    setSubmitDisabled(true);
    let count = duration || sliderTime;

    intervalRef.current = setInterval(() => {
      count -= 1;
      socket.emit("timerUpdate", { roomId, remainingTime: count });

      if (count <= 0) {
        clearCountdown();
        setSubmitDisabled(false);
        socket.emit("pollEnded", roomId);
      }
    }, 1000);
  };

  // ---------------- Form Handlers ----------------
  const handleOptionChange = (id, newText) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((o) => (o.id === id ? { ...o, optionText: newText } : o)),
    }));
  };

  const handleQuestionTextChange = (newText) =>
    setFormData((prev) => ({ ...prev, questionText: newText }));

  const handleOptionSelect = (index) =>
    setFormData((prev) => ({ ...prev, correctId: prev.options[index].id }));

  const validateForm = () => {
    if (!formData.questionText.trim()) return "Question text is required";
    if (formData.options.some((o) => !o.optionText.trim())) return "All options must be filled";
    if (formData.correctId === -1) return "Select correct answer";
    return null;
  };

  const handleQuestionSubmit = () => {
    const err = validateForm();
    if (err) return alert(err);

    const payload = {
      roomId,
      formData: {
        ...formData,
        timer: sliderTime,
        options: formData.options.map((o) => ({ ...o, optionVotes: 0 })),
        totalVotes: 0,
        remainingTime: sliderTime,
        status: "active",
      },
    };

    socket.emit("uploadQuestion", payload);
    setNewQuestion(payload.formData);
    startCountdown(sliderTime);
  };

  const handleClearForm = () => {
    setFormData((prev) => ({
      ...prev,
      questionText: "",
      options: prev.options.map((o) => ({ ...o, optionText: "" })),
      correctId: -1,
    }));
    setSubmitDisabled(false);
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomId);
    alert("Room code copied: " + roomId);
  };

  // ---------------- Render ----------------
  return (<>
    <Navbar/>
    <div className="flex flex-col lg:flex-row justify-evenly items-start m-10">
      {/* Question Form */}
      <div className="w-full lg:w-[50%] p-5">
        <h1 className="text-4xl font-bold mb-4 text-center">Create New Question</h1>

        <div className="flex items-center gap-2 mb-4 justify-center">
          <span>Room:</span>
          <span className="px-3 py-1 bg-gray-200 rounded">{roomId}</span>
          <button
            onClick={copyRoomCode}
            className="px-3 py-1 bg-blue-500 text-white rounded"
          >
            Copy
          </button>
        </div>

        <input
          type="text"
          value={formData.questionText}
          onChange={(e) => handleQuestionTextChange(e.target.value)}
          placeholder="Enter your question"
          className="w-full px-4 py-2 mb-4 border rounded focus:outline-none focus:ring"
        />

        {formData.options.map((opt, idx) => (
          <div key={opt.id} className="flex items-center mb-3">
            <input
              type="radio"
              name="correctOption"
              checked={formData.correctId === opt.id}
              onChange={() => handleOptionSelect(idx)}
              className="mr-2 h-5 w-5"
            />
            <input
              type="text"
              value={opt.optionText}
              onChange={(e) => handleOptionChange(opt.id, e.target.value)}
              placeholder={`Option ${idx + 1}`}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
            />
          </div>
        ))}

        <div className="mt-4">
          <Slider
            value={sliderTime}
            onChange={(e, val) => setSliderTime(val)}
            aria-label="Timer"
            valueLabelDisplay="auto"
            step={5}
            min={10}
            max={60}
          />
        </div>

        <div className="flex gap-4 mt-4 justify-center">
          <button
            onClick={handleQuestionSubmit}
            disabled={submitDisabled}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Submit
          </button>
          <button
            onClick={handleClearForm}
            disabled={submitDisabled}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="w-full lg:w-[40%] mt-10 lg:mt-0 p-5 bg-gray-100 rounded-lg">
        <h2 className="text-2xl font-bold text-center mb-4">Poll Stats</h2>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-4 bg-white rounded shadow">
            <p>Timer</p>
            <p className="text-xl font-bold">{newQuestion.remainingTime}</p>
          </div>
          <div className="p-4 bg-white rounded shadow">
            <p>Participated</p>
            <p className="text-xl font-bold">{newQuestion.correctId > -1 ? newQuestion.options[newQuestion.correctId - 1]?.optionVotes || 0 : 0}</p>

          </div>
          <div className="p-4 bg-white rounded shadow">
  <p>Passed</p>
  <p className="text-xl font-bold">
    {newQuestion.correctId > -1
      ? newQuestion.options.find(o => o.id === newQuestion.correctId)?.optionVotes || 0
      : 0}
  </p>
</div>
<div className="p-4 bg-white rounded shadow">
  <p>Failed</p>
  <p className="text-xl font-bold">
    {newQuestion.correctId > -1
      ? newQuestion.totalVotes -
        (newQuestion.options.find(o => o.id === newQuestion.correctId)?.optionVotes || 0)
      : 0}
  </p>
</div>

        </div>

        <h3 className="text-xl font-bold mt-6 mb-2 text-center">Question Stats</h3>
        <div className="space-y-2">
          {newQuestion.options.map((opt) => (
            <div key={opt.id} className="relative bg-blue-600 text-white px-4 py-2 rounded font-bold">
              {opt.optionText}
              <span className="absolute right-3 top-2">
                {newQuestion.totalVotes
                  ? `${((opt.optionVotes / newQuestion.totalVotes) * 100).toFixed(0)}%`
                  : "0%"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </>);
}
