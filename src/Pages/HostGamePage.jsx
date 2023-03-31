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
        async function initializeGame() {
            setGameID(generateCode());
            await game.broadcastEvent(EVENTS.GameHost, {
                gameCode: gameID,
                host: game.getUsername()
            });
            // console.log("Game initiated");
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

                            {/* <Button variant="warning">Test</Button> */}
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