import "../Components/DrawPage/DrawPage.css";
import Card from 'react-bootstrap/Card';
import Toolbar from '../Components/DrawPage/Toolbar.jsx';
import DrawingCanvas from '../Components/DrawPage/DrawingCanvas.jsx';
import SingleplayerGuessesModal from '../Components/DrawPage/SingleplayerGuessesModal.jsx';
import {useState, useMemo, useEffect, useRef} from 'react';
import { Modes } from "../index.js";
import Spinner from 'react-bootstrap/Spinner';

const SingleplayerDrawPage = ({mode, time, providedPrompt}) => {
    const [showGuessesModal, setShowGuessesModal] = useState(false);
    const [guesses, setGuesses] = useState([]);
    const [prompt, setPrompt] = useState(providedPrompt || "...");
    let [showSpinner, setShowSpinner] = useState(true);
    const [remainingTime, setRemainingTime] = useState(0);
    const canvas = useMemo(() => {
        return <DrawingCanvas setGuesses={setGuesses} setShowSpinner={setShowSpinner} />;
    }, []);
    function getRemainingTime(end_time) {
        const new_time = new Date().getTime();
        const seconds = Math.floor(((end_time - new_time) % (1000 * 60)) / 1000);
        return seconds;
    }
    useEffect(() => {
        let interval = setInterval(() => {
            setRemainingTime(Math.max(getRemainingTime(time), 0));
        }, 1000);
        return () => clearInterval(interval);
    }, [time, getRemainingTime]);

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
        }}>
            <Card id="DrawPage">
                <Card.Header id="DrawPageHeader">
                    <h1 id="title">Start Drawing!</h1>
                    {mode === Modes.Multi && <h2 id="timer" className="multiplayer">{remainingTime}</h2>}
                    <h4 id="Prompt">Prompt: {prompt}</h4>
                </Card.Header>
                <Card.Body id="DrawPageBody">
                    <Toolbar id="toolbar" setShowGuessesModal={setShowGuessesModal} setPrompt={setPrompt} setGuesses={setGuesses} />
                    {canvas}
                </Card.Body>
            </Card>
            <SingleplayerGuessesModal show={showGuessesModal} setShow={setShowGuessesModal} guesses={guesses} prompt={prompt}/>
            {showSpinner && <Spinner id="CanvasSpinner" role="status" aria-hidden="true" animation="border"/>}
        </div>

    );
};

export default SingleplayerDrawPage;