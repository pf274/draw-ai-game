import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { Route, Routes, Navigate, BrowserRouter } from 'react-router-dom';
import SingleplayerDrawPage from './Pages/SingleplayerDrawPage.jsx';
import HomePage from './Pages/HomePage.jsx';
import HostGamePage from './Pages/HostGamePage.jsx';
import JoinGamePage from './Pages/JoinGamePage.jsx';
import AboutPage from './Pages/AboutPage';
import Particle from './Components/Particle';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Particle />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/game/singleplayer" element={<SingleplayerDrawPage />} />
        <Route path="/game/host" element={<HostGamePage />} />
        <Route path="/game/play" element={<JoinGamePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
