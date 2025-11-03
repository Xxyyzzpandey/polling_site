import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Nav/Navbar';
import Home from './components/Home';
import Student from './components/Student/Student';
import Teacher from './components/Teacher/Teacher';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home page with Navbar */}
        <Route
          path="/"
          element={
            <>
              <Navbar showLogoutButton={false} />
              <Home />
            </>
          }
        />

        {/* Teacher room page */}
        <Route path="/teacher/:roomId" element={<Teacher />} />

        {/* Student room page */}
        <Route path="/student/:roomId" element={<Student />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
