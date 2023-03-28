import './HomePage.css';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
function HomePage() {
    return (
        <Card id="HomePage">
            <Card.Header>
                <Card.Title className="noCredentials">Draw AI</Card.Title>
                <Card.Title className="loggedIn" id="LobbyTitle">Lobby</Card.Title>
            </Card.Header>
            <Card.Body id="HomePageBody">
                <div className="noCredentials">
                    <Card.Text>Log In to Play</Card.Text>
                </div>
                <div className="loggedIn">
                    <h2>Multiplayer</h2>
                    <Button variant="primary">Join Game</Button>
                    <Button variant="primary" id="hostGameModalButton">Host Game</Button>
                    <h2 class="mt-2">Singleplayer</h2>
                    <Button variant="primary" id="freeDrawButton">Free Draw</Button>
                </div>
            </Card.Body>
            <Card.Footer>
                <Button variant="secondary" id="logoutButton">Log Out</Button>
            </Card.Footer>
        </Card>
    );
}

export default HomePage;