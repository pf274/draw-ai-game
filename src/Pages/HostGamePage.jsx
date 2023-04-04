import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import "../Components/HostGamePage/HostGamePage.css";
import {useState, useEffect, useRef} from 'react';
import io from 'socket.io-client';
import Participants from '../Components/JoinGamePage/Participants.jsx';
import MultiplayerDrawPage from './MultiplayerDrawPage.jsx';
import rawCategoryData from '../Data/categories.txt';

import * as ml5 from "ml5";
import {AIGuess} from '../Components/GameClass.js';

function HostGamePage() {
    let classifier = useRef();
    const [inGame, setInGame] = useState(false);
    const [gameID, setGameID] = useState("...");
    const [socket, setSocket] = useState(null);
    const [isPublic, setIsPublic] = useState(false);
    const [participating, setParticipating] = useState(false);
    const [rows, setRows] = useState([{username: localStorage.getItem("username"), isHost: false}]);
    const [roundEndTime, setRoundEndTime] = useState(0);
    const [startTime, setStartTime] = useState(0);
    const [prompt, setPrompt] = useState('...');
    const [categoriesLength, setCategoriesLength] = useState(0);
    const [canDraw, setCanDraw] = useState(false);
    let timerInterval;
    function Capitalize(text) {
        return text.toLowerCase().split(' ')
            .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
            .join(' ');
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
    function addRow(data) {
        if (rows.map(row => row.username).includes(data.username) === false) {
            setRows([...rows, data]);
        }
    }
    function startGame() {
        setInGame(true);
        socket.emit("send_message", {
            message: "starting game",
            room: gameID,
            username: localStorage.getItem("username"),
            isHost: true,
        });
        runCycle({rounds: 5});
    }
    function sendResults(results) {
        socket.emit("send_message", {
            message: "my results",
            room: gameID,
            username: localStorage.getItem("username"),
            isHost: true,
            results: results
        });
    }
    function generateCode() {
        return ((36 ** 3) + Math.floor(Math.random() * (34 * 36**3 + 35 * 36**2 + 35 * 36 + 35))).toString(36).toUpperCase();
    }
    function getTimer(start) {
        const new_time = new Date().getTime();
        const seconds = Math.floor(((new_time - start) % (1000 * 60)) / 1000);
        return seconds;
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
        const {rounds} = parameters;
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
        function runPhase() {
            let phaseName = phases[phase].name;
            let duration = phases[phase].time;
            let endTime = new Date();
            endTime.setSeconds(endTime.getSeconds() + duration);
            setRoundEndTime(endTime);
            if (phase == 0) {
                prompt_index = Math.floor(Math.random() * categoriesLength);
                newPrompt(prompt_index).then(result => setPrompt(result));
            }
            if (phaseName == "draw") {
                setCanDraw(true);
            } else {
                setCanDraw(false);
            }
            if (phaseName == "done drawing") {
                AIGuess(classifier).then(results => sendResults(results));
            }
            newPhase(phaseName, duration, prompt_index);
            
            console.log("Starting phase:", phaseName);
            setTimeout(() => {
                if (phase + 1 == phases.length) {
                    // trigger event for end of round
                    console.log("Round ended:", round);
                    round++;
                    phase = -1;
                }
                phase++;
                runPhase();
            }, duration * 1000);
        };
        runPhase();
    }
    useEffect(() => {
        if (socket) {
            socket.on("receive_message", (data) => {
                if (data.message === "joined room") {
                    
                } else if (data.message === "who is here?") {
                    // alert("new player joined");
                    addRow(data);
                    socketIAmHere();
                } else if (data.message == "my results") {
                    // TODO: handle incoming results
                } else {
                    // alert(data.message);
                }
            });
        }
    }, [socket]);
    useEffect(() => {
        setSocket(io.connect("http://localhost:4000")); // the url to the backend server
        let newCode = generateCode();
        setGameID(newCode);
        numberOfCategories().then(result => setCategoriesLength(result));
        setTimeout(() => {
            function modelLoaded() {
                console.log('Model Loaded!');
            }
            classifier.current = ml5.imageClassifier('DoodleNet', modelLoaded);
        }, 1000);
    }, [])
    function socketIAmHere() {
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
                    socket.emit("join_room", {
                        room: gameID,
                        asHost: true
                    });
                    setIsPublic(true);
                }}>Post</Button>
            </Card.Header>
            <Card.Body>
                <Participants rows={rows} />
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
                <Button disabled={rows.length < 2} style={{display: "inline"}} onClick={startGame}>Start Game</Button>
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
            </div>
            }
    </div>)
}

export default HostGamePage;