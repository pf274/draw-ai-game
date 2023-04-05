import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import "../Components/JoinGamePage/JoinGamePage.css";
import {useState, useEffect, useRef} from 'react';
import io from 'socket.io-client';

import Participants from '../Components/Participants.jsx';
import MultiplayerDrawPage from './MultiplayerDrawPage.jsx';
import {Modes} from '../index.js';
import rawCategoryData from '../Data/categories.txt';
import * as ml5 from "ml5";
import {AIGuess} from '../Components/GameClass.js';
import MultiplayerModal from '../Components/MultiplayerModal.jsx';
import DoneDrawingModal from '../Components/DoneDrawingModal.jsx';

function JoinGamePage() {
    let classifier = useRef();
    const [socket, setSocket] = useState(null);
    const [inRoom, setInRoom] = useState(false);
    const [inGame, setInGame] = useState(false);
    const [participantRows, setParticipantRows] = useState([]);
    const [gameID, setGameID] = useState("");
    const [loading, setLoading] = useState(false);
    const [phase, setPhase] = useState("");
    const [roundEndTime, setRoundEndTime] = useState(0);
    const [prompt, setPrompt] = useState("...");
    const [showResults, setShowResults] = useState(false);
    const [resultsRows, setResultsRows] = useState([]);
    const [totalPoints, setTotalPoints] = useState(0);
    const [showDoneDrawingModal, setShowDoneDrawingModal] = useState(false);
    function addParticipantRow(myParticipants, data) {
        if (myParticipants.map(row => row.username).includes(data.username) === false) {
            return [...myParticipants, data];
        }
    }
    function removeParticipantRow(myParticipants, data) {
        if (myParticipants.map(row => row.username).includes(data.username) === true) {
            console.log(myParticipants.filter((row) => row.username !== data.username));
            return myParticipants.filter((row) => row.username !== data.username);
        }
    }
    function clearCanvas() {
        const drawingCanvas = document.getElementById("drawingCanvas");
        if (drawingCanvas) {
            let context = drawingCanvas.getContext("2d");
            context.fillStyle = "rgba(255, 255, 255, 1)";
            context.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
        }
    }
    function addPoints(points) {
        setTotalPoints(totalPoints => totalPoints + points);
    }
    function addResultsRow(data) {
        if (resultsRows.map(row => row.username).includes(data.username) === false) {
            setResultsRows(resultsRows => [...resultsRows, data]);
        }
    }
    async function newPrompt(index) {
        let allCategories = await fetch(rawCategoryData).then(result => result.text());
        allCategories = allCategories.split("\n").map((item) => Capitalize(item.trim()));
        let newCategory = allCategories[index];
        return newCategory;
    }
    function Capitalize(text) {
        return text.toLowerCase().split(' ')
            .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
            .join(' ');
    }
    function handleGameCodeInputChange(event) {
        setGameID(event.target.value.toUpperCase().slice(0, 4));
    }
    function calculatePoints(guesses, thePrompt) {
        let matchingIndex = 10;
        function compareGuessToPrompt(guess, thePrompt) {
            let formattedGuess = Capitalize(guess.replace(/_/g, " "));
            let formattedPrompt = Capitalize(thePrompt.replace(/_/g, " "));
            return formattedGuess === formattedPrompt;
        }
        for (let index = 0; index < guesses.length; index++) {
            let guess = guesses[index];
            if (compareGuessToPrompt(guess.label, thePrompt)) {
                matchingIndex = index;
            }
        }
        let points = (10 - matchingIndex) * 100;
        return points;
    }
    // ---------- socket.io ----------
    function handleJoinRoom() {
        setLoading(true);
        socket.emit("join_room", {
            room: gameID,
            asHost: false,
            username: localStorage.getItem("username")
        });
    }
    function sendResults(stuff) {
        socket.emit("send_message", {
            message: "my results",
            room: gameID,
            username: localStorage.getItem("username"),
            isHost: false,
            results: stuff.results,
            picture: stuff.picture,
            points: stuff.points,
            totalPoints: stuff.totalPoints
        });
    }
    useEffect(() => {
        let myParticipants = [];
        if (socket) {
            socket.off("receive_message");
            socket.on("receive_message", (data) => {
                if (data.message == "joined room") {
                    socketWhoIsHere();
                    setInRoom(true);
                    setLoading(false);
                    myParticipants = addParticipantRow(myParticipants, {username: localStorage.getItem("username")});
                    setParticipantRows(myParticipants);
                } else if (data.message == "failed to join room") {
                    alert("The room you entered does not exist.");
                    setLoading(false);
                } else if (data.message == "who is here?") {
                    myParticipants = addParticipantRow(myParticipants, data);
                    setParticipantRows(myParticipants);
                    socketIAmHere();
                } else if (data.message == "I am here") {
                    myParticipants = addParticipantRow(myParticipants, data);
                    setParticipantRows(myParticipants);
                } else if (data.message == "starting game") {
                    setInGame(true);
                } else if (data.message == "new phase") {
                    setPhase(data.phaseInfo.phase);
                    let endTime = new Date();
                    endTime.setSeconds(endTime.getSeconds() + (data.phaseInfo.time));
                    setRoundEndTime(endTime);
                    newPrompt(data.phaseInfo.prompt_index).then(result => setPrompt(result));
                    switch (data.phaseInfo.phase) {
                        case "get new prompt":
                            setResultsRows([]);
                            setShowResults(false);
                            // console.log("get new prompt!");
                            clearCanvas();
                        break;
                        case "draw":
                            setShowResults(false);
                            // console.log("time to draw!");
                        break;
                        case "done drawing":
                            setShowResults(false);
                            setShowDoneDrawingModal(true);
                            AIGuess(classifier).then(stuff => {
                                let points = calculatePoints(stuff.results, prompt);
                                sendResults({...stuff, points: points, totalPoints: totalPoints + points});
                                addResultsRow({
                                    message: "my results",
                                    room: gameID,
                                    username: localStorage.getItem("username"),
                                    isHost: false,
                                    results: stuff.results,
                                    picture: stuff.picture,
                                    points: points,
                                    totalPoints: totalPoints + points
                                });
                                addPoints(points);
                            });
                            // console.log("done drawing!");
                        break;
                        case "review results":
                            setShowDoneDrawingModal(false);
                            setShowResults(true);
                            // console.log("review results!");
                        break;
                    }
                } else if (data.message == "my results") {
                    addResultsRow(data);
                } else if (data.message == "I am leaving") {
                    myParticipants = removeParticipantRow(myParticipants, data);
                    setParticipantRows(myParticipants);
                    console.log(`${data.username} has left.`);
                    // TODO: remove the person
                } else {
                    // alert(data.message);
                }
            });
        }
    }, [socket, resultsRows, setResultsRows, addResultsRow, prompt]);

    useEffect(() => {
        let socketAddress = process.env.NODE_ENV === 'development' ? "http://localhost:4000" : "https://startup.peterfullmer.net";
        let socket = io.connect(socketAddress);
        console.log("socket connected");
        setSocket(socket); // the url to the backend server.
        setTimeout(() => {
            function modelLoaded() {
                console.log('Model Loaded!');
            }
            classifier.current = ml5.imageClassifier('DoodleNet', modelLoaded);
        }, 1000);
        return (() => {
            socket.off("receive_message");
            socket.emit("send_message", {
                message: "I am leaving",
                username: localStorage.getItem("username"),
                isHost: false,
            });
            socket.disconnect();
            console.log("socket disconnected");
        })
    }, []);

    function socketWhoIsHere() {
        socket.emit("send_message", {
            message: "who is here?",
            room: gameID,
            username: localStorage.getItem("username")
        });
    }
    function socketIAmHere() {
        socket.emit("send_message", {
            message: "I am here",
            room: gameID,
            username: localStorage.getItem("username"),
            isHost: false,
        });
    }


    
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
                <MultiplayerDrawPage mode={Modes.Multi} time={roundEndTime} prompt={prompt} />
                <MultiplayerModal show={showResults} setShow={setShowResults} rows={resultsRows} />
                <DoneDrawingModal show={showDoneDrawingModal} setShow={setShowDoneDrawingModal} />
            </div>
        }

    </div>)
}

export default JoinGamePage;