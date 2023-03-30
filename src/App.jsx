import './App.css';
import HomePage from './Components/HomePage/HomePage.jsx';
import DrawPage from './Components/DrawPage/DrawPage.jsx';
import { useState, useRef, useEffect } from 'react';
import * as ml5 from "ml5";

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
  let classifier = useRef();

  useEffect(() => {
    setTimeout(() => {
      function modelLoaded() {
        console.log('Model Loaded!');
      }
      classifier.current = ml5.imageClassifier('DoodleNet', modelLoaded);
    }, 1000)
  });
  return (
    <div className="App">
      {page == Pages.Home && <HomePage setMode={setMode} setPage={setPage} />}
      {page == Pages.Draw && <DrawPage mode={mode} classifier={classifier}/>}
    </div>
  );
}

export default App;
