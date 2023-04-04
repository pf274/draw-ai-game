import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import "../Components/HostGamePage/HostGamePage.css";
import {useState, useEffect, useMemo} from 'react';
import io from 'socket.io-client';

function HostGamePage() {
    const [inGame, setInGame] = useState(false);
    const [gameID, setGameID] = useState("...");
    const [socket, setSocket] = useState(null);
    const [isPublic, setIsPublic] = useState(false);
    function getGameID() {
        return gameID;
    }
    function generateCode() {
        return ((36 ** 3) + Math.floor(Math.random() * (34 * 36**3 + 35 * 36**2 + 35 * 36 + 35))).toString(36).toUpperCase();
      }
    useEffect(() => {
    }, []);
    // ---------- socket.io ----------
    useEffect(() => {
        if (socket) {
            socket.on("receive_message", (data) => {
                if (data.message === "joined room") {
                    
                } else if (data.message === "who is here?") {
                    alert("new player joined");
                    socketIAmHere();
                } else {
                    alert(data.message);
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
            room: getGameID(),
            username: localStorage.getItem("username")
        });
    }
    // function sendMessage() {
    //     socket.emit("send_message", {
    //         message: "hello",
    //         room: gameID,
    //         username: localStorage.getItem("username")
    //     });
    // };
    // -------------------------------
    return (<div style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    }}>
        <Card id="HostGameCard">
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
                <Table>
                    <thead>
                        <tr style={{textAlign: "center"}}>
                            <th>#</th>
                            <th>Username</th>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </Table>
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
                <Button disabled={false} style={{display: "inline"}}>Start Game</Button>
            </Card.Footer>
        </Card>
    </div>)
}

export default HostGamePage;