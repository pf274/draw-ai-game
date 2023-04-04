import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import "../Components/JoinGamePage/JoinGamePage.css";
import {useState, useEffect} from 'react';
import io from 'socket.io-client';

import Participants from '../Components/JoinGamePage/Participants.jsx';
import MultiplayerDrawPage from './MultiplayerDrawPage.jsx';
import {Modes} from '../index.js';
import rawCategoryData from '../Data/categories.txt';

function JoinGamePage() {
    const [socket, setSocket] = useState(null);
    const [inRoom, setInRoom] = useState(false);
    const [inGame, setInGame] = useState(false);
    const [rows, setRows] = useState([{username: localStorage.getItem("username"), isHost: false}]);
    const [gameID, setGameID] = useState("");
    const [loading, setLoading] = useState(false);
    const [phase, setPhase] = useState("");
    const [roundEndTime, setRoundEndTime] = useState(0);
    const [categoriesLength, setCategoriesLength] = useState(0);
    const [prompt, setPrompt] = useState("...");
    const [canDraw, setCanDraw] = useState(false);
    function addRow(data) {
        if (rows.map(row => row.username).includes(data.username) == false) {
            setRows([...rows, data]);
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
    // ---------- socket.io ----------
    function handleJoinRoom() {
        setLoading(true);
        socket.emit("join_room", {
            room: gameID,
            asHost: false,
            username: localStorage.getItem("username")
        });
    }
    async function numberOfCategories() {
        let allCategories = await fetch(rawCategoryData).then(result => result.text());
        allCategories = allCategories.split("\n").map((item) => Capitalize(item.trim()));
        return allCategories.length;
    }
    useEffect(() => {
        if (socket) {
            socket.on("receive_message", (data) => {
                if (data.message == "joined room") {
                    socketWhoIsHere();
                    setInRoom(true);
                    setLoading(false);
                } else if (data.message == "failed to join room") {
                    alert("The room you entered does not exist.");
                    setLoading(false);
                } else if (data.message == "who is here?") {
                    socketIAmHere();
                } else if (data.message == "I am here") {
                    addRow(data);
                    // alert(data.message);
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
                            setCanDraw(false);
                            console.log("get new prompt!");
                        break;
                        case "draw":
                            setCanDraw(true);
                            console.log("time to draw!");
                        break;
                        case "done drawing":
                            setCanDraw(false);
                            console.log("done drawing!");
                        break;
                        case "review results":
                            setCanDraw(false);
                            console.log("review results!");
                        break;
                    }
                } else {
                    // alert(data.message);
                }
            });
        }
    }, [socket]);

    useEffect(() => {
        setSocket(io.connect("http://localhost:4000")); // the url to the backend server
        numberOfCategories().then(result => setCategoriesLength(result));
    }, [])

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
            isHost: true,
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
                    <Participants rows={rows} />
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
            </div>
        }

    </div>)
}

export default JoinGamePage;