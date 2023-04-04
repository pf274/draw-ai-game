import './App.css';
import HomePage from './Pages/HomePage.jsx';
import SingleplayerDrawPage from './Pages/SingleplayerDrawPage.jsx';
import { useState} from 'react';
import {Pages, Modes} from './index.js';


function App() {
  let [page, /*setPage*/] = useState(Pages.Home);
  let [mode, /*setMode*/] = useState(Modes.Multi);
  return (
    <div className="App">
      {page == Pages.Home && <HomePage />}
      {page == Pages.Draw && <SingleplayerDrawPage />}
    </div>
  );
}

export default App;

// I'M CURRENTLY NOT USING APP