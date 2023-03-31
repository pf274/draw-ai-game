import '../Components/HomePage/HomePage.css';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import {useEffect, useState} from 'react';
import LoginModal from '../Components/HomePage/LoginModal.jsx';
import SignupModal from '../Components/HomePage/SignupModal.jsx';
import Spinner from 'react-bootstrap/Spinner';
const HomePage = () => {
    const [showLogin, setShowLogin] = useState(false);
    const [showSignup, setShowSignup] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);
    useEffect(() => {
        if (localStorage.getItem("username")) {
            let response = fetch(`/api/user/${localStorage.getItem("username")}`, {
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
    const navigate = useNavigate();

    function goToSingleplayerDrawPage() {
        navigate('/draw/singleplayer');
    }
    function goToMultiplayerDrawPage() {
        navigate('/draw/multiplayer');
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
                    {loggedIn && <Card.Title id="LobbyTitle">Lobby</Card.Title>}
                </Card.Header>
                <Card.Body id="HomePageBody">
                    {!loggedIn && <div>
                        <h3 className="mb-3">Log In to Play</h3>
                        <Button variant="primary" onClick={handleShowSignup}>Sign Up</Button>
                        <Button variant="primary" onClick={handleShowLogin}>Log In</Button>
                        
                    </div>}
                    {loggedIn && <div>
                        <h2>Multiplayer</h2>
                        <Button variant="primary">Join Game</Button>
                        <Button variant="primary" id="hostGameModalButton" onClick={goToMultiplayerDrawPage}>Host Game</Button>
                        <h2 className="mt-2">Singleplayer</h2>
                        <Button variant="primary" id="freeDrawButton" onClick={goToSingleplayerDrawPage}>Free Draw</Button>
                    </div>}
                </Card.Body>
                <Card.Footer>
                    {loggedIn && 
                        <Button variant="secondary" onClick={handleLogout}>
                            {!logoutLoading && "Log Out"}
                            {logoutLoading && <div><Spinner as="span" variant="light" size="sm" role="status" aria-hidden="true" animation="border"/> Loading...</div>}
                        </Button>
                    }
                </Card.Footer>
            </Card>
            <LoginModal show={showLogin} setShow={setShowLogin} setLoggedIn={setLoggedIn} />
            <SignupModal show={showSignup} setShow={setShowSignup} setLoggedIn={setLoggedIn}/>
        </div>
    );
};

export default HomePage;