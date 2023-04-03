import {Game, ROLES, EVENTS} from '../Components/GameClass.js';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import "../Components/JoinGamePage/JoinGamePage.css";
import {useState, useEffect} from 'react';
function JoinGamePage() {
    const [inLobby, setInLobby] = useState(false);
    const [inGame, setInGame] = useState(false);
    const [rows, setRows] = useState([]);
    const game = new Game(ROLES.Participant, undefined, setRows);
    const [gameID, setGameID] = useState("");
    async function initializeGame() {
        // register as a host
        let newCode = "AAAA";
        await game.broadcastEvent(EVENTS.DeclareJoin, {
            gameCode: newCode // the host is recognized by their websocket connection, so no need to specify the host here.
        });
        // console.log("Game initialized");
        // save it using dynamodb
        // let response = await fetch('/api/game/join', {
        //     method: "post",
        //     headers: {'Content-Type': 'application/json'},
        //     body: JSON.stringify({
        //         host: game.getUsername(),
        //         id: newCode,
        //     })
        // });
    }

    function handleGameCodeInputChange(event) {
        setGameID(event.target.value.toUpperCase().slice(0, 4));
    }
    function handleJoinGame() {
        game.broadcastEvent(EVENTS.DeclareJoin, {
            gameCode: gameID,
        }).then((response) => {console.log(response)});
        setInLobby(true);
    }
    return (<div style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    }}>
        {(inLobby && !inGame) && <Card id="JoinGameCard">
            <Card.Header>
                <h3>{gameID}</h3>
            </Card.Header>
            <Card.Body>
                <Table>
                    <thead>
                        <tr style={{textAlign: "center"}}>
                            <th>#</th>
                            <th>Username</th>
                        </tr>
                    </thead>
                    <tbody>{rows}</tbody>
                </Table>
            </Card.Body>
            <Card.Footer>
            </Card.Footer>
        </Card>}
        {(!inLobby && !inGame) && <Card>
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
                <Button disabled={gameID.length !== 4} onClick={handleJoinGame}>Join Game</Button>
            </Card.Footer>
            </Card>}
    </div>)
}

export default JoinGamePage;