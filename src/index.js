import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';
// import reportWebVitals from './reportWebVitals';
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

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
