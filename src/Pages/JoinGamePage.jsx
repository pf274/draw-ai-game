import "../Components/Styles/JoinGamePage.css";
import MultiplayerResultsModal from '../Components/Modals/MultiplayerResultsModal.jsx';
import MultiplayerDrawPage from './SubPages/MultiplayerDrawPage.jsx';
import DoneDrawingModal from '../Components/Modals/DoneDrawingModal.jsx';
import Participants from '../Components/Participants.jsx';
import WinnerModal from '../Components/Modals/WinnerModal';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import io from 'socket.io-client';
import {useState, useEffect, useRef} from 'react';
import {Modes} from '../index.js';
import * as ml5 from "ml5";
import {
    AIGuess,
    addParticipantRow,
    calculatePoints,
    clearCanvas,
    newPrompt,
    removeParticipantRow,
} from '../Components/GameParts.js';
import {
    socketSendResults,
    socketIAmHere,
    socketJoinRoom,
    socketIAmLeaving,
    socketWhoIsHere
} from '../Components/SocketCommands';
import { useInterval } from "react-use";
import NewPromptModal from '../Components/Modals/NewPromptModal';

function JoinGamePage() {
    const [showDoneDrawingModal, setShowDoneDrawingModal] = useState(false);
    const [showWinnerModal, setShowWinnerModal] = useState(false);
    const [participantRows, setParticipantRows] = useState([]);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [showNewPrompt, setShowNewPrompt] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [totalRounds, setTotalRounds] = useState(4);
    const [resultsRows, setResultsRows] = useState([]);
    const [showTimer, setShowTimer] = useState(false);
    const [socket, setSocket] = useState(null);
    const [inRoom, setInRoom] = useState(false);
    const [inGame, setInGame] = useState(false);
    const [gameID, setGameID] = useState("");
    const [prompt, setPrompt] = useState("...");
    const [round, setRound] = useState(-1);
    
    let classifier = useRef();
    function addResultsRow(data) {
        if (resultsRows.map(row => row.username).includes(data.username) === false) {
            setResultsRows(resultsRows => [...resultsRows, data]);
        }
    }
    function handleGameCodeInputChange(event) {
        setGameID(event.target.value.toUpperCase().slice(0, 4));
    }

    // ---------- socket.io ----------
    function handleJoinRoom() {
        localStorage.setItem("gameID", gameID);
        socketJoinRoom(socket, gameID, false);
    }
    useInterval(() => {
        setTimeRemaining(Math.max(timeRemaining - 1, 0));
    }, 1000);
    useEffect(() => {
        let myParticipants = [];
        let myPrompt = "";
        let myTotalPoints = 0;
        if (socket) {
            socket.off("receive_message");
            socket.on("receive_message", (data) => {
                if (data.message === "joined room") {
                    socketWhoIsHere(socket, localStorage.getItem("gameID"));
                    setInRoom(true);
                    myParticipants = addParticipantRow(myParticipants, {username: localStorage.getItem("username")});
                    setParticipantRows(myParticipants);
                } else if (data.message === "failed to join room") {
                    alert("The room you entered does not exist.");
                } else if (data.message === "who is here?") {
                    myParticipants = addParticipantRow(myParticipants, data);
                    setParticipantRows(myParticipants);
                    socketIAmHere(socket, localStorage.getItem("gameID"), false);
                } else if (data.message === "I am here") {
                    myParticipants = addParticipantRow(myParticipants, data);
                    setParticipantRows(myParticipants);
                } else if (data.message === "starting game") {
                    setInGame(true);
                    setTotalRounds(data.rounds);
                } else if (data.message === "new phase") {
                    setTimeRemaining(data.phaseInfo.time);
                    newPrompt(data.phaseInfo.prompt_index).then(result => {
                        myPrompt = result;
                        setPrompt(result);
                    });
                    switch (data.phaseInfo.phase) {
                        case "get new prompt":
                            setRound(round => round + 1);
                            setResultsRows([]);
                            setShowResults(false);
                            setShowNewPrompt(true);
                            setShowTimer(false);
                            setShowDoneDrawingModal(false);
                            // console.log("get new prompt!");
                            clearCanvas();
                        break;
                        case "draw":
                            setShowResults(false);
                            setShowNewPrompt(false);
                            setShowTimer(true);
                            setShowDoneDrawingModal(false);
                            // console.log("time to draw!");
                        break;
                        case "done drawing":
                            setShowResults(false);
                            setShowNewPrompt(false);
                            setShowTimer(false);
                            setShowDoneDrawingModal(true);
                            AIGuess(classifier).then(stuff => {
                                let points = calculatePoints(stuff.results, myPrompt);
                                myTotalPoints += points;
                                socketSendResults(socket, {...stuff, points: points, totalPoints: myTotalPoints}, localStorage.getItem("gameID"), false);
                                addResultsRow({
                                    message: "my results",
                                    room: localStorage.getItem("gameID"),
                                    username: localStorage.getItem("username"),
                                    isHost: false,
                                    results: stuff.results,
                                    picture: stuff.picture,
                                    points: points,
                                    totalPoints: myTotalPoints
                                });
                            });
                            // console.log("done drawing!");
                        break;
                        case "review results":
                            setShowDoneDrawingModal(false);
                            setShowResults(true);
                            setShowTimer(false);
                            setShowNewPrompt(false);
                            // console.log("review results!");
                        break;
                        case "Game Over!":
                            setShowWinnerModal(true);
                            setShowResults(false);
                        break;
                        default:
                            console.log("Unrecognized phase!");
                        break;
                    }
                } else if (data.message === "my results") {
                    addResultsRow(data);
                } else if (data.message === "I am leaving") {
                    myParticipants = removeParticipantRow(myParticipants, data);
                    setParticipantRows(myParticipants);
                    console.log(`${data.username} has left.`);
                    if (data.isHost) {
                        alert("Host has left. The game will no longer work properly.");
                    }
                } else {
                    // alert(data.message);
                }
            });
        }
    }, [socket]);

    useEffect(() => {
        let socketAddress = process.env.NODE_ENV === 'development' ? "http://localhost:4000" : "https://startup.peterfullmer.net";
        let socket = io.connect(socketAddress);
        console.log("socket connected");
        setSocket(socket); // the url to the backend server.
        setTimeout(() => {
            function modelLoaded() {
                console.log('AI Model Loaded!');
            }
            classifier.current = ml5.imageClassifier('DoodleNet', modelLoaded);
        }, 1000);
        return (() => {
            socket.off("receive_message");
            socketIAmLeaving(socket, false, localStorage.getItem("gameID"));
            socket.disconnect();
            console.log("socket disconnected");
        })
    }, []);
    
    return (<div style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    }}>
        {(!inRoom && !inGame) &&
            <Card>
                <Card.Header>
                    <h2>Join Game</h2>
                </Card.Header>
                <Card.Body>
                    <Form>
                        <Form.Group>
                            <Form.Control placeholder="Enter room code" value={gameID} onChange={handleGameCodeInputChange}/>
                        </Form.Group>
                    </Form>
                    
                </Card.Body>
                <Card.Footer>
                    <Button disabled={gameID.length !== 4} onClick={handleJoinRoom}>Join Game</Button>
                </Card.Footer>
            </Card>
        }
        {(inRoom && !inGame) &&
            <Card id="JoinGameCard">
                <Card.Header>
                    <h3>{gameID}</h3>
                </Card.Header>
                <Card.Body>
                    <Participants rows={participantRows} />
                </Card.Body>
            </Card>
        }
        {(inRoom && inGame) &&
            <div style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                height: "100%",
                justifyContent: "center",
                alignItems: "center",
            }}>
                <MultiplayerDrawPage fullscreen={false} animation={false} mode={Modes.Multi} time={timeRemaining} prompt={prompt} showTimer={showTimer} />
                <MultiplayerResultsModal fullscreen={false} animation={false} show={showResults} round={round} isGameOver={round >= totalRounds - 1} setShow={setShowResults} rows={resultsRows} isHost={false} />
                <DoneDrawingModal fullscreen={false} animation={false} show={showDoneDrawingModal} setShow={setShowDoneDrawingModal} />
                <NewPromptModal fullscreen={false} animation={false} show={showNewPrompt} setShow={setShowNewPrompt} prompt={prompt} round={round} />
                <WinnerModal fullscreen={false} animation={false} show={showWinnerModal} setShow={setShowWinnerModal} rows={resultsRows} />
            </div>
        }

    </div>)
}

export default JoinGamePage;