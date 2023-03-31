import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import {
  createBrowserRouter,
  RouterProvider,
  Route,
} from 'react-router-dom';
import DrawPage from './Pages/DrawPage.jsx';
import HomePage from './Pages/HomePage.jsx';

export const Pages = {
  Home: "home",
  Draw: "draw"
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
    path: '/draw/multiplayer',
    element: <DrawPage mode={Modes.Multi} />
  },
  {
    path: '/draw/singleplayer',
    element: <DrawPage mode={Modes.Single} />
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
