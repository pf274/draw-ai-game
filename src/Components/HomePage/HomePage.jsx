import './HomePage.css';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import {Pages, Modes} from '../../App.jsx';
import {forwardRef} from 'react';

const HomePage = (props) => {
    function goToSingleplayerDrawPage() {
        props.setMode(Modes.Single);
        props.setPage(Pages.Draw);
    }
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
                    <h2 className="mt-2">Singleplayer</h2>
                    <Button variant="primary" id="freeDrawButton" onClick={goToSingleplayerDrawPage}>Free Draw</Button>
                </div>
            </Card.Body>
            <Card.Footer>
                <Button variant="secondary" id="logoutButton">Log Out</Button>
            </Card.Footer>
        </Card>
    );
};

export default HomePage;