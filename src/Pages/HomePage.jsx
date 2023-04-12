import '../Components/Styles/HomePage.css';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import {useEffect, useState} from 'react';
import LoginModal from '../Components/Modals/LoginModal.jsx';
import SignupModal from '../Components/Modals/SignupModal.jsx';
import Spinner from 'react-bootstrap/Spinner';
import {FiMaximize2, FiMinimize2} from 'react-icons/fi';

const HomePage = ({fullscreenExit, fullscreenRequest, fullscreenEnabled, setFullscreen}) => {
    const [showLogin, setShowLogin] = useState(false);
    const [showSignup, setShowSignup] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);
    useEffect(() => {
        if (localStorage.getItem("username")) {
            fetch(`/api/user/${localStorage.getItem("username")}`, {
                headers: {'Content-Type': 'application/json'}
            }).then((response) => {
                if (response.status === 200) {
                    setLoggedIn(true);
                } else {
                    setLoggedIn(false);
                    localStorage.removeItem("username");
                }
            });
        }
    }, []);
    function toggleFullscreen() {
        
        if (fullscreenEnabled) {
            setFullscreen(false);
            fullscreenExit();
        } else {
            setFullscreen(true);
            fullscreenRequest();
        }
    }
    const navigate = useNavigate();

    function goToSingleplayerDrawPage() {
        navigate('/game/singleplayer');
    }
    function goToMultiplayerDrawPage() {
        navigate('/game/multiplayer');
    }
    function goToHostGamePage() {
        navigate('/game/host');
    }
    function goToJoinGamePage() {
        navigate('/game/play');
    }
    function goToAboutPage() {
        navigate('/about');
    }
    const handleShowLogin = () => setShowLogin(true);
    const handleShowSignup = () => setShowSignup(true);
    const handleLogout = async () => {
        if (logoutLoading) {return; };
        setLogoutLoading(true);
        let response = await fetch('/api/auth/logout', {
            method: "delete",
            headers: {'Content-Type': 'application/json'}
        });
        let body = await response.json();
        if (response.status === 200) {
            // console.log("Logout Successful!");
            setLoggedIn(false);
            localStorage.removeItem("username");
        } else {
            console.log(body.msg);
        }
        setLogoutLoading(false);
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
            <Card id="HomePage">
                <Card.Header>
                    {!loggedIn && <Card.Title>Draw AI</Card.Title>}
                    {loggedIn && <Card.Title id="LobbyTitle">{`Welcome, ${localStorage.getItem("username")}!`}</Card.Title>}
                </Card.Header>
                <Card.Body className="HomePageBody">
                    {!loggedIn && <div className="HomePageBody">
                        <h3 className="mb-3">Log In to Play</h3>
                        <Button variant="primary" onClick={handleShowSignup}>Sign Up</Button>
                        <Button variant="primary" onClick={handleShowLogin}>Log In</Button>
                        
                    </div>}
                    {loggedIn && <div className="HomePageBody">
                        <div>
                            <h2>Multiplayer</h2>
                            <Button variant="primary" onClick={goToJoinGamePage}>Join Game</Button>
                            <Button variant="primary" id="hostGameModalButton" onClick={goToHostGamePage}>Host Game</Button>
                        </div>
                        <div id="singleplayerOptions">
                            <h2 className="mt-2">Singleplayer</h2>
                            <Button variant="primary" id="freeDrawButton" onClick={goToSingleplayerDrawPage}>Free Draw</Button>
                        </div>
                    </div>}
                </Card.Body>
                <Card.Footer className="d-flex justify-content-between">
                    {loggedIn && 
                        <Button variant="secondary" onClick={handleLogout}>
                            {!logoutLoading && "Log Out"}
                            {logoutLoading && <div><Spinner as="span" variant="light" size="sm" role="status" aria-hidden="true" animation="border"/> Loading...</div>}
                        </Button>
                    }
                    <Button variant="secondary" onClick={goToAboutPage}>About</Button>
                </Card.Footer>
            </Card>
            <LoginModal show={showLogin} setShow={setShowLogin} setLoggedIn={setLoggedIn} />
            <SignupModal show={showSignup} setShow={setShowSignup} setLoggedIn={setLoggedIn}/>
            <p id="Author"><a href="https://github.com/pf274/startup" target="_blank" rel="noopener noreferrer">Github Repository</a>  -  Peter Fullmer</p>
            {fullscreenEnabled && <FiMinimize2 className="fullscreenIcon" size="1.5em" onClick={toggleFullscreen} />}
            {!fullscreenEnabled && <FiMaximize2 className="fullscreenIcon" size="1.5em" onClick={toggleFullscreen} />}

        </div>
    );
};

export default HomePage;