import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import "../Components/JoinGamePage/JoinGamePage.css";
import {useState, useEffect, useRef} from 'react';
import io from 'socket.io-client';

import Participants from '../Components/Participants.jsx';
import MultiplayerDrawPage from './MultiplayerDrawPage.jsx';
import {Modes} from '../index.js';
import * as ml5 from "ml5";
import MultiplayerResultsModal from '../Components/MultiplayerResultsModal.jsx';
import DoneDrawingModal from '../Components/DoneDrawingModal.jsx';
import {
    AIGuess,
    addParticipantRow,
    calculatePoints,
    clearCanvas,
    newPrompt,
    removeParticipantRow,
} from '../Components/GameClass.js';
import {
    socketSendResults,
    socketIAmHere,
    socketJoinRoom,
    socketIAmLeaving,
    socketWhoIsHere
} from '../Components/SocketCommands';
import { useInterval } from "react-use";
import NewPromptModal from '../Components/NewPromptModal';

function JoinGamePage() {
    let classifier = useRef();
    const [socket, setSocket] = useState(null);
    const [inRoom, setInRoom] = useState(false);
    const [inGame, setInGame] = useState(false);
    const [participantRows, setParticipantRows] = useState([]);
    const [gameID, setGameID] = useState("");
    const [roundEndTime, setRoundEndTime] = useState(0);
    const [prompt, setPrompt] = useState("...");
    const [showResults, setShowResults] = useState(false);
    const [resultsRows, setResultsRows] = useState([]);
    const [showDoneDrawingModal, setShowDoneDrawingModal] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [round, setRound] = useState(-1);
    const [showNewPrompt, setShowNewPrompt] = useState(false);
    const [totalRounds, setTotalRounds] = useState(4);

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
                            setShowDoneDrawingModal(false);
                            // console.log("get new prompt!");
                            clearCanvas();
                        break;
                        case "draw":
                            setShowResults(false);
                            setShowNewPrompt(false);
                            setShowDoneDrawingModal(false);
                            // console.log("time to draw!");
                        break;
                        case "done drawing":
                            setShowResults(false);
                            setShowNewPrompt(false);
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
                            setShowNewPrompt(false);
                            // console.log("review results!");
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
                <MultiplayerDrawPage mode={Modes.Multi} time={timeRemaining} prompt={prompt} />
                <MultiplayerResultsModal show={showResults} round={round} isGameOver={round >= totalRounds - 1} setShow={setShowResults} rows={resultsRows} isHost={false} />
                <DoneDrawingModal show={showDoneDrawingModal} setShow={setShowDoneDrawingModal} />
                <NewPromptModal show={showNewPrompt} setShow={setShowNewPrompt} prompt={prompt} round={round} />
            </div>
        }

    </div>)
}

export default JoinGamePage;