import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import "../Components/HostGamePage/HostGamePage.css";
import {useState, useEffect, useRef, useCallback} from 'react';
import io from 'socket.io-client';
import Participants from '../Components/Participants.jsx';
import MultiplayerDrawPage from './MultiplayerDrawPage.jsx';
import rawCategoryData from '../Data/categories.txt';
import DoneDrawingModal from '../Components/DoneDrawingModal.jsx';
import MultiplayerModal from '../Components/MultiplayerModal.jsx';
import * as ml5 from "ml5";
import {AIGuess} from '../Components/GameClass.js';

function HostGamePage() {
    let classifier = useRef();
    const [inGame, setInGame] = useState(false);
    const [gameID, setGameID] = useState("...");
    const [isPublic, setIsPublic] = useState(false);
    const [socket, setSocket] = useState(null);
    const [participating, setParticipating] = useState(false);
    const [participantRows, setParticipantRows] = useState([{username: localStorage.getItem("username"), isHost: false}]);
    const [roundEndTime, setRoundEndTime] = useState(0);
    const [prompt, setPrompt] = useState('...');
    const [categoriesLength, setCategoriesLength] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [resultsRows, setResultsRows] = useState([]);
    const [showDoneDrawingModal, setShowDoneDrawingModal] = useState(false);
    function Capitalize(text) {
        return text.toLowerCase().split(' ')
            .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
            .join(' ');
    }
    function calculatePoints(guesses, thePrompt) {
        let matchingIndex = 10;
        function compareGuessToPrompt(guess, thePrompt) {
            let formattedGuess = Capitalize(guess.replace(/_/g, " "));
            let formattedPrompt = Capitalize(thePrompt.replace(/_/g, " "));
            // console.log(`Formatted Guess: ${formattedGuess}`);
            // console.log(`Formatted Prompt: ${formattedPrompt}`);
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
    async function numberOfCategories() {
        let allCategories = await fetch(rawCategoryData).then(result => result.text());
        allCategories = allCategories.split("\n").map((item) => Capitalize(item.trim()));
        return allCategories.length;
    }
    async function newPrompt(index) {
        let allCategories = await fetch(rawCategoryData).then(result => result.text());
        allCategories = allCategories.split("\n").map((item) => Capitalize(item.trim()));
        let newCategory = allCategories[index];
        return newCategory;
    }
    function addParticipantRow(data) {
        if (participantRows.map(row => row.username).includes(data.username) === false) {
            setParticipantRows([...participantRows, data]);
        }
    }
    function addResultsRow(data) {
        if (resultsRows.map(row => row.username).includes(data.username) === false) {
            setResultsRows(resultsRows => [...resultsRows, data]);
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
    function startGame() {
        if (socket) {
            setInGame(true);
            socket.emit("send_message", {
                message: "starting game",
                room: gameID,
                username: localStorage.getItem("username"),
                isHost: true,
            });
            runCycle({rounds: 5});
        }
    }
    function sendResults(stuff) {
        socket.emit("send_message", {
            message: "my results",
            room: gameID,
            username: localStorage.getItem("username"),
            isHost: true,
            results: stuff.results,
            picture: stuff.picture,
            points: stuff.points,
            totalPoints: stuff.totalPoints
        });
    }
    function generateCode() {
        return ((36 ** 3) + Math.floor(Math.random() * (34 * 36**3 + 35 * 36**2 + 35 * 36 + 35))).toString(36).toUpperCase();
    }

    function newPhase(phase_name, time, prompt_index) {
        socket.emit("send_message", {
            message: "new phase",
            room: gameID,
            username: localStorage.getItem("username"),
            isHost: true,
            phaseInfo: {
                phase: phase_name,
                time: time,
                prompt_index: prompt_index
            }
        });
    }
    function runCycle(parameters) {
        const {rounds, currentPrompt} = parameters;
        let start_time = new Date().getTime();
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
            if (phaseName == "get new prompt") {
                setShowResults(false);
                setResultsRows([]);
                clearCanvas();
            } else if (phaseName == "draw") {
                setShowResults(false);
            } else {
                setShowResults(false);
            }
            if (phaseName == "done drawing") {
                setShowDoneDrawingModal(true);
                setShowResults(false);
                AIGuess(classifier).then(stuff => {
                    points = calculatePoints(stuff.results, currentPrompt);
                    
                    sendResults({...stuff, points: points, totalPoints: totalPoints + points});
                    addResultsRow({
                        message: "my results",
                        room: gameID,
                        username: localStorage.getItem("username"),
                        isHost: false,
                        results: stuff.results,
                        picture: stuff.picture,
                        points: points,
                        totalPoints: totalPoints + points,
                    });
                });
            }
            if (phaseName == "review results") {
                setShowResults(true);
                setShowDoneDrawingModal(false);
            }
            newPhase(phaseName, duration, prompt_index);
            
            console.log("Starting phase:", phaseName);
            setTimeout(() => {
                if (phase + 1 == phases.length) {
                    // trigger event for end of round
                    console.log("Round ended:", round);
                    round++;
                    phase = 0;
                    let new_prompt_index = Math.floor(Math.random() * categoriesLength);
                    newPrompt(new_prompt_index).then(result => {setPrompt(result); runPhase(result, new_prompt_index, totalPoints + points);});
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
        // --------- Socket ---------
        let socketAddress = process.env.NODE_ENV === 'development' ? "http://localhost:4000" : "https://startup.peterfullmer.net";
        let socket = io.connect(socketAddress); // the url to the backend server.
        setSocket(socket);
        console.log("socket connected");
        socket.on("receive_message", (data) => {
            if (data.message === "joined room") {
                
            } else if (data.message === "who is here?") {
                addParticipantRow(data);
                socketIAmHere(socket);
            } else if (data.message === "I am here") {
                addParticipantRow(data);
            } else if (data.message == "my results") {
                // TODO: handle incoming results
                addResultsRow(data);
            } else {
                // alert(data.message);
            }
        });
        // --------- AI Model ---------
        setTimeout(() => {
            function modelLoaded() {
                console.log('Model Loaded!');
            }
            classifier.current = ml5.imageClassifier('DoodleNet', modelLoaded);
        }, 1000);

        return (() => {
            // --------- Socket ---------
            socket.off("receive_message");
            socket.disconnect();
            console.log("socket disconnected");
        });
    }, [])
    function socketIAmHere(socket) {
        socket.emit("send_message", {
            message: "I am here",
            room: gameID,
            username: localStorage.getItem("username"),
            isHost: true,
        });
    }
    function toggleParticipate() {
        setParticipating(!participating);
    }
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
                <Button disabled={isPublic} onClick={() => {
                    if (socket) {
                        socket.emit("join_room", {
                            room: gameID,
                            asHost: true
                        });
                        setIsPublic(true);
                    }
                }}>Post</Button>
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
                    <Form.Check type="switch" id="theSwitch" checked={participating} label="I am Participating" onChange={toggleParticipate} />
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