import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import "../Components/HostGamePage/HostGamePage.css";
import {useState, useEffect, useRef} from 'react';
import io from 'socket.io-client';
import Participants from '../Components/Participants.jsx';
import MultiplayerDrawPage from './MultiplayerDrawPage.jsx';
import rawCategoryData from '../Data/categories.txt';
import DoneDrawingModal from '../Components/DoneDrawingModal.jsx';
import MultiplayerModal from '../Components/MultiplayerModal.jsx';
import * as ml5 from "ml5";
import {
    AIGuess,
    Capitalize,
    addParticipantRow,
    calculatePoints,
    clearCanvas,
    generateCode,
    newPrompt,
    numberOfCategories,
    removeParticipantRow
} from '../Components/GameClass.js';
import {
    socketStartGame,
    socketSendResults,
    socketNewPhase,
    socketIAmHere,
    socketJoinRoom,
    socketIAmLeaving
} from '../Components/SocketCommands';


function HostGamePage() {
    let classifier = useRef();
    const [inGame, setInGame] = useState(false);
    const [gameID, setGameID] = useState("...");
    const [isPublic, setIsPublic] = useState(false);
    const [socket, setSocket] = useState(null);
    const [participating, setParticipating] = useState(true);
    const [participantRows, setParticipantRows] = useState([]);
    const [roundEndTime, setRoundEndTime] = useState(0);
    const [prompt, setPrompt] = useState('...');
    const [categoriesLength, setCategoriesLength] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [resultsRows, setResultsRows] = useState([]);
    const [showDoneDrawingModal, setShowDoneDrawingModal] = useState(false);


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
        socketStartGame(socket, gameID, true);
        runCycle();
    }
    function runCycle() {
        let phases = [
            {
                time: 2,
                name: "get new prompt"
            },
            {
                time: 15,
                name: "draw"
            },
            {
                time: 3,
                name: "done drawing"
            },
            {
                time: 5,
                name: "review results"
            }
        ];
        let phase = 0;
        let round = 0;
        let prompt_index = Math.floor(Math.random() * categoriesLength);
        let totalPoints = 0;
        newPrompt(prompt_index).then(result => {setPrompt(result); runPhase(result, prompt_index, totalPoints);});
        function runPhase(currentPrompt, prompt_index, totalPoints) {
            let points = 0;
            let phaseName = phases[phase].name;
            let duration = phases[phase].time;
            let endTime = new Date();
            endTime.setSeconds(endTime.getSeconds() + duration);
            setRoundEndTime(endTime);
            if (phaseName === "get new prompt") {
                setShowResults(false);
                setResultsRows([]);
                clearCanvas();
            } else if (phaseName === "draw") {
                setShowResults(false);
            } else {
                setShowResults(false);
            }
            if (phaseName === "done drawing") {
                setShowDoneDrawingModal(true);
                setShowResults(false);
                AIGuess(classifier).then(stuff => {
                    points = calculatePoints(stuff.results, currentPrompt);
                    socketSendResults(socket, {...stuff, points: points, totalPoints: totalPoints + points}, gameID, true);
                    addResultsRow({
                        message: "my results",
                        room: gameID,
                        username: localStorage.getItem("username"),
                        isHost: true,
                        results: stuff.results,
                        picture: stuff.picture,
                        points: points,
                        totalPoints: totalPoints + points,
                    });
                });
            }
            if (phaseName === "review results") {
                setShowResults(true);
                setShowDoneDrawingModal(false);
            }
            socketNewPhase(socket, phaseName, duration, prompt_index, gameID, true);
            
            console.log("Starting phase:", phaseName);
            setTimeout(() => {
                if (phase + 1 === phases.length) {
                    // trigger event for end of round
                    console.log("Round ended:", round);
                    round++;
                    if (round <= 5) {
                        phase = 0;
                        let new_prompt_index = Math.floor(Math.random() * categoriesLength);
                        newPrompt(new_prompt_index).then(result => {setPrompt(result); runPhase(result, new_prompt_index, totalPoints + points);});
                    } else {
                        alert("Game over! There's still some details that need to be added, like announcing the round number, the prompt, and the winner at the end.");
                    }
                } else {
                    phase++;
                    runPhase(currentPrompt, prompt_index, totalPoints + points);
                }
                
            }, duration * 1000);
        };
    }
    useEffect(() => {
        let newCode = generateCode();
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
            setIsPublic(true);
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
                    alignItems: "center"
                }}>
                    <Form.Check type="switch" id="theSwitch" disabled checked={participating} label="I am Participating" onChange={toggleParticipate} />
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
                <MultiplayerDrawPage time={roundEndTime} prompt={prompt} />
                <MultiplayerModal show={showResults} setShow={setShowResults} rows={resultsRows} />
                <DoneDrawingModal show={showDoneDrawingModal} setShow={setShowDoneDrawingModal} />
            </div>
            }
    </div>)
}

export default HostGamePage;