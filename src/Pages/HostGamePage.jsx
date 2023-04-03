import {Game, ROLES, EVENTS} from '../Components/GameClass.js';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import "../Components/HostGamePage/HostGamePage.css";
import {useState, useEffect} from 'react';
function HostGamePage() {
    const game = new Game(ROLES.Host);
    const [inLobby, setInLobby] = useState(true);
    const [gameID, setGameID] = useState("...");
    function generateCode() {
        return ((36 ** 3) + Math.floor(Math.random() * (34 * 36**3 + 35 * 36**2 + 35 * 36 + 35))).toString(36).toUpperCase();
      }
    useEffect(() => {
        let newCode = generateCode()
        setGameID(newCode);
        async function initializeGame() {
            // register as a host
            await game.broadcastEvent(EVENTS.DeclareHost, {
                gameCode: newCode // the host is recognized by their websocket connection, so no need to specify the host here.
            });
            // console.log("Game initialized");
            // save it using dynamodb
            // let response = await fetch('/api/game/host', {
            //     method: "post",
            //     headers: {'Content-Type': 'application/json'},
            //     body: JSON.stringify({
            //         host: game.getUsername(),
            //         id: newCode,
            //     })
            // });
        }
        initializeGame();
    }, []);
    function startGame() {
        game.broadcastEvent(EVENTS.GameStart, {});
    }
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
                        <tr>
                            <td>1</td>
                            <td>{game.getUsername()} (Host) </td>
                        </tr>
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
                <Button disabled={true} style={{display: "inline"}}>Start Game</Button>
            </Card.Footer>
        </Card>
    </div>)
}

export default HostGamePage;