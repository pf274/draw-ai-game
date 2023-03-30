import './App.css';
import HomePage from './Pages/HomePage.jsx';
import DrawPage from './Pages/DrawPage.jsx';
import { useState, useRef, useEffect } from 'react';
import {Pages, Modes} from './index.js';


function App() {
  let [page, setPage] = useState(Pages.Home);
  let [mode, setMode] = useState(Modes.Multi);
  return (
    <div className="App">
      {page == Pages.Home && <HomePage />}
      {page == Pages.Draw && <DrawPage mode={mode}/>}
    </div>
  );
}

export default App;

// I'M CURRENTLY NOT USING APP