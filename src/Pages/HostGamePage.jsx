import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import "../Components/HostGamePage/HostGamePage.css";
import io from 'socket.io-client';
import Participants from '../Components/Participants.jsx';
import MultiplayerDrawPage from './MultiplayerDrawPage.jsx';
import DoneDrawingModal from '../Components/DoneDrawingModal.jsx';
import MultiplayerResultsModal from '../Components/MultiplayerResultsModal.jsx';
import NewPromptModal from '../Components/NewPromptModal';
import * as ml5 from "ml5";

import {useState, useEffect, useRef} from 'react';
import {
    AIGuess,
    addParticipantRow,
    calculatePoints,
    clearCanvas,
    generateCode,
    newPrompt,
    numberOfCategories,
    phases,
    removeParticipantRow,
} from '../Components/GameClass.js';
import {
    socketStartGame,
    socketSendResults,
    socketNewPhase,
    socketIAmHere,
    socketJoinRoom,
    socketIAmLeaving
} from '../Components/SocketCommands';
import { useInterval } from "react-use";
import WinnerModal from '../Components/WinnerModal';

function HostGamePage() {
    const [showDoneDrawingModal, setShowDoneDrawingModal] = useState(false);
    const [categoriesLength, setCategoriesLength] = useState(0);
    const [showWinnerModal, setShowWinnerModal] = useState(false);
    const [participantRows, setParticipantRows] = useState([]);
    const [participating, setParticipating] = useState(true);
    const [showNewPrompt, setShowNewPrompt] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [resultsRows, setResultsRows] = useState([]);
    const [gameRunning, setGameRunning] = useState(false);
    const [totalRounds, setTotalRounds] = useState(4);
    const [promptIndex, setPromptIndex] = useState(0);
    const [totalPoints, setTotalPoints] = useState(0);
    const [inGame, setInGame] = useState(false);
    const [gameID, setGameID] = useState("...");
    const [socket, setSocket] = useState(null);
    const [prompt, setPrompt] = useState('...');
    const [round, setRound] = useState(0);
    const [phase, setPhase] = useState(0);

    let classifier = useRef();
    function handleTotalRoundNumberChange(event) {
        setTotalRounds(event.target.value.split('').filter((character) => /^\d+$/.test(character)).join(''));
    }
    function addResultsRow(data) {
        if (resultsRows.map(row => row.username).includes(data.username) === false) {
            setResultsRows(resultsRows => [...resultsRows, data]);
        }
    }
    function toggleParticipate() {
        setParticipating(!participating);
    }
    function startGame() {
        setInGame(true);
        socketStartGame(socket, gameID, true, totalRounds); // GIVE THEM AN INITIAL PROMPT
        setGameRunning(true);
    }
    useInterval(() => {
        if (timeRemaining <= 0) {
            if (phase >= phases.length) {
                if (round >= totalRounds - 1) {
                    // Game over
                    console.log("Game over!");
                    setGameRunning(false);
                } else {
                    setPhase(0);
                    setTimeRemaining(0);
                    setGameRunning(false);
                }
            } else {
                // do the phase
                runPhase(prompt, totalPoints);
                // Start awaiting the next phase to next phase
                setTimeRemaining(phases[phase].time);
                setPhase(phase + 1);
            }
        } else {
            setTimeRemaining(timeRemaining - 1);
        }
    }, gameRunning ? 1000 : null);

    async function runPhase(currentPrompt) {
        let phaseName = phases[phase].name;
        let thePrompt = prompt;
        let thePromptIndex = promptIndex;
        console.log(`Starting phase '${phaseName}'`);
        switch (phaseName) {
            case "get new prompt":
                // get new prompt
                thePromptIndex = Math.floor(Math.random() * categoriesLength);
                setPromptIndex(thePromptIndex);
                thePrompt = await newPrompt(thePromptIndex);
                setPrompt(thePrompt);
                // display stuff
                setShowResults(false);
                setShowDoneDrawingModal(false);
                setShowNewPrompt(true);
                setResultsRows([]);
                clearCanvas();
            break;
            case "draw":
                setShowResults(false);
                setShowNewPrompt(false);
                setShowDoneDrawingModal(false);
            break;
            case "done drawing":
                setShowDoneDrawingModal(true);
                setShowNewPrompt(false);
                setShowResults(false);
                AIGuess(classifier).then(stuff => {
                    let roundPoints = calculatePoints(stuff.results, currentPrompt);
                    socketSendResults(socket, {...stuff, points: roundPoints, totalPoints: totalPoints + roundPoints}, gameID, true);
                    addResultsRow({
                        message: "my results",
                        room: gameID,
                        username: localStorage.getItem("username"),
                        isHost: true,
                        results: stuff.results,
                        picture: stuff.picture,
                        points: roundPoints,
                        totalPoints: totalPoints + roundPoints,
                    });
                    setTotalPoints(totalPoints + roundPoints);
                });
            break;
            case "review results":
                setShowResults(true);
                setShowNewPrompt(false);
                setShowDoneDrawingModal(false);
            break;
        }
        socketNewPhase(socket, phases[phase].name, phases[phase].time, thePromptIndex, gameID, true); // announce the phase to others!
    };

    useEffect(() => {
        let newCode = generateCode(4);
        setGameID(newCode);
        numberOfCategories().then(result => setCategoriesLength(result));
        let myParticipants = [];
        // --------- Socket ---------
        let socketAddress = process.env.NODE_ENV === 'development' ? "http://localhost:4000" : "https://startup.peterfullmer.net";
        let socket = io.connect(socketAddress); // the url to the backend server.
        setSocket(socket);
        console.log("socket connected");
        socket.on("connect", () => {
            socketJoinRoom(socket, newCode, true);
        });
        socket.on("receive_message", (data) => {
            if (data.message === "joined room") {
                myParticipants = addParticipantRow(myParticipants, {username: localStorage.getItem("username")});
                setParticipantRows(myParticipants);
            } else if (data.message === "who is here?") {
                myParticipants = addParticipantRow(myParticipants, data);
                setParticipantRows(myParticipants);
                socketIAmHere(socket, newCode, true);
            } else if (data.message === "I am here") {
                myParticipants = addParticipantRow(myParticipants, data);
                setParticipantRows(myParticipants);
            } else if (data.message === "my results") {
                addResultsRow(data);
            } else if (data.message === "I am leaving") {
                myParticipants = removeParticipantRow(myParticipants, data);
                setParticipantRows(myParticipants);
                console.log(`${data.username} has left.`);
            } else {
                // alert(data.message);
            }
        });
        // --------- AI Model ---------
        setTimeout(() => {
            function modelLoaded() {
                console.log('AI Model Loaded!');
            }
            classifier.current = ml5.imageClassifier('DoodleNet', modelLoaded);
        }, 1000);

        return (() => {
            // --------- Socket ---------
            socket.off("receive_message");
            socket.off("connect");
            socketIAmLeaving(socket, true, newCode);
            socket.disconnect();
            console.log("socket disconnected");
        });
    }, []);
    useEffect(() => {
        if (showWinnerModal) {
            socketNewPhase(socket, "Game Over!", 0, 0, gameID, true);
        }
    }, [showWinnerModal]);

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
        }}>
        {!inGame && <Card id="HostGameCard">
            <Card.Header>
                <h3>{gameID}</h3>
            </Card.Header>
            <Card.Body>
                <Participants rows={participantRows} />
            </Card.Body>
            <Card.Footer>
                <Form style={{
                    display: "flex",
                    flexDirection: "row",
                    flex: 1,
                    alignItems: "center",
                    flexWrap: 'wrap',
                    justifyContent: "center"
                }}>
                    <div className="mb-3">
                        <Form.Check type="switch" checked={participating} label="I am Participating" onChange={toggleParticipate} />
                    </div>
                    <div>
                        <label style={{marginRight: "1em"}}>{`Rounds:`}</label>
                        <Form.Control style={{display: "inline-flex", width: 40}} id="roundsField" placeholder="Enter number of rounds" value={totalRounds} onChange={handleTotalRoundNumberChange}/>
                    </div>
                    </Form>
                <Button disabled={participantRows.length < 2} style={{display: "inline"}} onClick={startGame}>Start Game</Button>
            </Card.Footer>
        </Card>}
        {(inGame && participating) &&
            <div style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                height: "100%",
                justifyContent: "center",
                alignItems: "center",
            }}>
                <MultiplayerDrawPage time={timeRemaining} prompt={prompt} />
                <MultiplayerResultsModal show={showResults} isGameOver={round >= totalRounds - 1} setShow={setShowResults} round={round} setRound={setRound} rows={resultsRows} setGameRunning={setGameRunning} gameRunning={gameRunning} isHost={true} setShowWinnerModal={setShowWinnerModal}/>
                <DoneDrawingModal show={showDoneDrawingModal} setShow={setShowDoneDrawingModal} />
                <NewPromptModal show={showNewPrompt} setShow={setShowNewPrompt} prompt={prompt} round={round} />
                <WinnerModal show={showWinnerModal} setShow={setShowWinnerModal} rows={resultsRows} />
            </div>
            }
    </div>)
}

export default HostGamePage;