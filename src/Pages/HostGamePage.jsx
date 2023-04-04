import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import "../Components/HostGamePage/HostGamePage.css";
import {useState, useEffect} from 'react';
import io from 'socket.io-client';
import Participants from '../Components/JoinGamePage/Participants.jsx';
import DrawPage from './DrawPage.jsx';
import {Modes} from '../index.js';
function HostGamePage() {
    const [inGame, setInGame] = useState(false);
    const [gameID, setGameID] = useState("...");
    const [socket, setSocket] = useState(null);
    const [isPublic, setIsPublic] = useState(false);
    const [rows, setRows] = useState([{username: localStorage.getItem("username"), isHost: false}]);
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
        })
    }
    function generateCode() {
        return ((36 ** 3) + Math.floor(Math.random() * (34 * 36**3 + 35 * 36**2 + 35 * 36 + 35))).toString(36).toUpperCase();
      }
    useEffect(() => {
        if (socket) {
            socket.on("receive_message", (data) => {
                if (data.message === "joined room") {
                    
                } else if (data.message === "who is here?") {
                    // alert("new player joined");
                    addRow(data);
                    socketIAmHere();
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
    }, [])
    function socketIAmHere() {
        socket.emit("send_message", {
            message: "I am here",
            room: gameID,
            username: localStorage.getItem("username"),
            isHost: true,
        });
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
                    <Form.Check type="switch" id="theSwitch" label="I am Participating" />
                </Form>
                <Button disabled={rows.length < 2} style={{display: "inline"}} onClick={startGame}>Start Game</Button>
            </Card.Footer>
        </Card>}
        {inGame &&
            <div style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                height: "100%",
                justifyContent: "center",
                alignItems: "center",
            }}>
                <DrawPage mode={Modes.Multi} />
            </div>
            }
    </div>)
}

export default HostGamePage;