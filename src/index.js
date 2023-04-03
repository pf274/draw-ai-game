import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// import App from './App.jsx';
import {
  createBrowserRouter,
  RouterProvider,
  // Route,
} from 'react-router-dom';
import DrawPage from './Pages/DrawPage.jsx';
import HomePage from './Pages/HomePage.jsx';
import HostGamePage from './Pages/HostGamePage.jsx';
import JoinGamePage from './Pages/JoinGamePage.jsx';

export const Pages = {
  Home: "home",
  Draw: "draw",
  Host: "host", // play game as host
  Join: "join", // play game as participant
}
export const Modes = {
  Single: "singleplayer",
  Multi: "multiplayer"
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />
  },
  {
    path: '/game/multiplayer',
    element: <DrawPage mode={Modes.Multi} />
  },
  {
    path: '/game/singleplayer',
    element: <DrawPage mode={Modes.Single} />
  },
  {
    path: 'game/host',
    element: <HostGamePage />
  },
  {
    path: 'game/play',
    element: <JoinGamePage />
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
