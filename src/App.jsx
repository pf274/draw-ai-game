import {Route, Routes, Navigate, BrowserRouter} from 'react-router-dom';
import SingleplayerDrawPage from './Pages/SingleplayerDrawPage.jsx';
import HomePage from './Pages/HomePage.jsx';
import HostGamePage from './Pages/HostGamePage.jsx';
import JoinGamePage from './Pages/JoinGamePage.jsx';
import AboutPage from './Pages/AboutPage';
import Particle from './Components/Particle';
import ReactFullscreen from 'react-easyfullscreen';
import { useState } from 'react';
import { createContext, useRef } from 'react';
export const ModalContext = createContext(null);

function App() {
    const fullscreenRef = useRef(null);
    const [fullscreen, setFullscreen] = useState(false);
    return (
        <ModalContext.Provider value={fullscreenRef}>
            <ReactFullscreen className="fullscreen" id="fullscreenElement" ref={fullscreenRef}>
                {({ onRequest, onExit }) => (
                <div className="fullscreen">
                    <BrowserRouter>
                    <Particle />
                    <Routes>
                        <Route path="/" element={<HomePage fullscreenRequest={onRequest} fullscreenExit={onExit} fullscreenEnabled={fullscreen} setFullscreen={setFullscreen} />} />
                        <Route path="/game/singleplayer" element={<SingleplayerDrawPage />} />
                        <Route path="/game/host" element={<HostGamePage fullscreenRequest={onRequest} fullscreenExit={onExit} fullscreenEnabled={fullscreen} setFullscreen={setFullscreen} />} />
                        <Route path="/game/play" element={<JoinGamePage fullscreenRequest={onRequest} fullscreenExit={onExit} fullscreenEnabled={fullscreen} setFullscreen={setFullscreen} />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                    </BrowserRouter>
                </div>
                )}
            </ReactFullscreen>
        </ModalContext.Provider>

    )
}

export default App;