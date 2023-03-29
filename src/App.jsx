import './App.css';
import HomePage from './Components/HomePage/HomePage.jsx';
import DrawPage from './Components/DrawPage/DrawPage.jsx';
import { useState, useRef, useEffect } from 'react';
export const Pages = {
  Home: "home",
  Draw: "draw"
}
export const Modes = {
  Single: "singleplayer",
  Multi: "multiplayer"
}
function App() {
  let [page, setPage] = useState(Pages.Home);
  let [mode, setMode] = useState(Modes.Multi);
  return (
    <div className="App">
      {page == Pages.Home ? <HomePage setMode={setMode} setPage={setPage} /> :
      page = Pages.Draw ? <DrawPage setPage={setPage} /> : <div></div>}
    </div>
  );
}

export default App;
