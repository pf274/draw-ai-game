import "../Components/DrawPage/DrawPage.css";
import Card from 'react-bootstrap/Card';
import Toolbar from '../Components/DrawPage/Toolbar.jsx';
import DrawingCanvas from '../Components/DrawPage/DrawingCanvas.jsx';
import SingleplayerGuessesModal from '../Components/DrawPage/GuessesModal.jsx';
import {useState, useMemo} from 'react';
import { Modes } from "../index.js";
import Spinner from 'react-bootstrap/Spinner';

const DrawPage = ({mode}) => {
    const [showGuessesModal, setShowGuessesModal] = useState(false);
    const [guesses, setGuesses] = useState([]);
    const [prompt, setPrompt] = useState("...");
    let [showSpinner, setShowSpinner] = useState(true);
    const canvas = useMemo(() => {
        return <DrawingCanvas setGuesses={setGuesses} setShowSpinner={setShowSpinner} />;
    }, []);
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
                    {mode === Modes.Multi && <h2 id="timer" className="multiplayer">Timer</h2>}
                    <h4 id="Prompt">Prompt: {prompt}</h4>
                </Card.Header>
                <Card.Body id="DrawPageBody">
                    {mode !== Modes.Multi && <Toolbar id="toolbar" setShowGuessesModal={setShowGuessesModal} setPrompt={setPrompt} />}
                    {canvas}
                </Card.Body>
            </Card>
            {mode !== Modes.Multi && <SingleplayerGuessesModal show={showGuessesModal} setShow={setShowGuessesModal} guesses={guesses} prompt={prompt}/>}
            {showSpinner && <Spinner id="CanvasSpinner" role="status" aria-hidden="true" animation="border"/>}
        </div>

    );
};

export default DrawPage;