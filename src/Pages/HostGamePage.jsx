import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import "../Components/Styles/HostGamePage.css";
import io from 'socket.io-client';
import Participants from '../Components/Participants.jsx';
import MultiplayerDrawPage from './SubPages/MultiplayerDrawPage.jsx';
import DoneDrawingModal from '../Components/Modals/DoneDrawingModal.jsx';
import MultiplayerResultsModal from '../Components/Modals/MultiplayerResultsModal.jsx';
import NewPromptModal from '../Components/Modals/NewPromptModal';
import * as ml5 from "ml5";
import {useState, useEffect, useRef} from 'react';
import {useInterval} from "react-use";
import {
    AIGuess,
    addParticipantRow,
    calculatePoints,
    clearCanvas,
    generateCode,
    newPrompt,
    numberOfCategories,
    phases,
    removeParticipantRow,
} from '../Components/GameParts.js';
import {
    socketStartGame,
    socketSendResults,
    socketNewPhase,
    socketIAmHere,
    socketJoinRoom,
    socketIAmLeaving
} from '../Components/SocketCommands';
import WinnerModal from '../Components/Modals/WinnerModal';

// sounds
import { HiVolumeOff, HiVolumeUp } from "react-icons/hi";
import useSound from 'use-sound';
import Loop from './Sounds/Loop.mp3';
import Intro from './Sounds/Intro.mp3';
import Ding1 from './Sounds/bell1.mp3';
import Ding2 from './Sounds/bell2.mp3';
import Ding3 from './Sounds/bell3.mp3';
const dings = [Ding1, Ding2, Ding3];

function HostGamePage() {
    const [showDoneDrawingModal, setShowDoneDrawingModal] = useState(false);
    const [categoriesLength, setCategoriesLength] = useState(0);
    const [showWinnerModal, setShowWinnerModal] = useState(false);
    const [participantRows, setParticipantRows] = useState([]);
    const [participating, setParticipating] = useState(false);
    const [showNewPrompt, setShowNewPrompt] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [resultsRows, setResultsRows] = useState([]);
    const [gameRunning, setGameRunning] = useState(false);
    const [totalRounds, setTotalRounds] = useState(4);
    const [promptIndex, setPromptIndex] = useState(0);
    const [totalPoints, setTotalPoints] = useState(0);
    const [showTimer, setShowTimer] = useState(false);
    const [inGame, setInGame] = useState(false);
    const [gameID, setGameID] = useState("...");
    const [socket, setSocket] = useState(null);
    const [prompt, setPrompt] = useState('...');
    const [round, setRound] = useState(0);
    const [phase, setPhase] = useState(0);
    const [volume, setVolume] = useState(1);
    const [playersReady, setPlayersReady] = useState(0);
    const [playDing1] = useSound(dings[0]);
    const [playDing2] = useSound(dings[1]);
    const [playDing3] = useSound(dings[2]);
    const soundDings = [playDing1, playDing2, playDing3];
    const [playLoop, setPlayLoop] = useState(false);
    const [playSoundLoop, {sound: theLoopSound}] = useSound(Loop, {onend: () => {setPlayLoop(true);}});
    const [playSoundIntro, {sound: theIntroSound}] = useSound(Intro, {onend: () => {setPlayLoop(true);}});
    const currentTrack = useRef();

    useEffect(() => {
        if (playLoop) {
            setPlayLoop(false);
            if (volume) {
                currentTrack.current = theLoopSound;
                playSoundLoop();
            }
        }
    }, [playLoop]);
    let classifier = useRef();
    function handleTotalRoundNumberChange(event) {
        setTotalRounds(event.target.value.split('').filter((character) => /^\d+$/.test(character)).join(''));
    }
    function addResultsRow(data) {
        if (resultsRows.map(row => row.username).includes(data.username) === false) {
            setResultsRows(resultsRows => [...resultsRows, data]);
        }
    }
    function toggleParticipate() {
        setParticipating(!participating);
    }
    function startGame() {
        setInGame(true);
        socketStartGame(socket, gameID, true, totalRounds); // GIVE THEM AN INITIAL PROMPT
        setGameRunning(true);
        if (!participating && volume) {
            playSoundIntro();
            currentTrack.current = theIntroSound;
        }
    }
    function handleToggleVolume() {
        setVolume(!volume);
        if (currentTrack?.current) {
            volume ? currentTrack.current.pause() : currentTrack.current.play()
        } else {
            if (!volume) {
                playSoundIntro();
                currentTrack.current = theIntroSound;
            }
        }
    }
    useInterval(() => {
        if (timeRemaining <= 0) {
            if (phase >= phases.length) {
                if (round >= totalRounds - 1) {
                    // Game over
                    // console.log("Game over!");
                    setGameRunning(false);
                } else {
                    setPhase(0);
                    setPlayersReady(0);
                    setTimeRemaining(0);
                    setGameRunning(false);
                }
            } else {
                // do the phase
                runPhase(prompt, totalPoints);
                // Start awaiting the next phase to next phase
                setTimeRemaining(phases[phase].time);
                setPhase(phase + 1);
            }
        } else {
            setTimeRemaining(timeRemaining - 1);
        }
        const element = document.querySelector(`.countdown-number`);
        if (element && !participating) {
            element.classList.remove('animate');
            element.animate([
                { transform: 'scale(1.5)' },
                { transform: 'scale(1)' },
              ], {
                duration: 250,
              })
            void element.offsetWidth; // force reflow to restart the animation
            element.classList.add('animate');
        }
    }, gameRunning ? 1000 : null);

    async function runPhase(currentPrompt) {
        let phaseName = phases[phase].name;
        let thePrompt = prompt;
        let thePromptIndex = promptIndex;
        // console.log(`Starting phase '${phaseName}'`);
        switch (phaseName) {
            case "get new prompt":
                // get new prompt
                if (volume && !participating) {
                    soundDings[Math.floor(Math.random() * soundDings.length)]();
                }
                thePromptIndex = Math.floor(Math.random() * categoriesLength);
                setPromptIndex(thePromptIndex);
                thePrompt = await newPrompt(thePromptIndex);
                setPrompt(thePrompt);
                // display stuff
                setShowResults(false);
                setShowDoneDrawingModal(false);
                setShowNewPrompt(true);
                setShowTimer(false);
                setResultsRows([]);
                clearCanvas();
            break;
            case "draw":
                setShowResults(false);
                setShowNewPrompt(false);
                setShowTimer(true);
                setShowDoneDrawingModal(false);
            break;
            case "done drawing":
                setShowDoneDrawingModal(true);
                setShowNewPrompt(false);
                setShowTimer(false);
                setShowResults(false);
                if (participating) {
                    AIGuess(classifier).then(stuff => {
                        let roundPoints = calculatePoints(stuff.results, currentPrompt);
                        socketSendResults(socket, {...stuff, points: roundPoints, totalPoints: totalPoints + roundPoints}, gameID, true);
                        addResultsRow({
                            message: "my results",
                            room: gameID,
                            username: localStorage.getItem("username"),
                            isHost: true,
                            results: stuff.results,
                            picture: stuff.picture,
                            points: roundPoints,
                            totalPoints: totalPoints + roundPoints,
                        });
                        setTotalPoints(totalPoints + roundPoints);
                    });
                }
            break;
            case "review results":
                setShowResults(true);
                setShowNewPrompt(false);
                setShowTimer(false);
                setShowDoneDrawingModal(false);
            break;
        }
        socketNewPhase(socket, phases[phase].name, phases[phase].time, thePromptIndex, gameID, true); // announce the phase to others!
    };

    useEffect(() => {
        let newCode = generateCode(4);
        setGameID(newCode);
        numberOfCategories().then(result => setCategoriesLength(result));
        let myParticipants = [];
        // --------- Socket ---------
        let socketAddress = process.env.NODE_ENV === 'development' ? "http://localhost:4000" : "https://startup.peterfullmer.net";
        let socket = io.connect(socketAddress); // the url to the backend server.
        setSocket(socket);
        console.log("socket connected");
        socket.on("connect", () => {
            socketJoinRoom(socket, newCode, true);
        });
        socket.on("receive_message", (data) => {
            if (data.message === "joined room") {
                myParticipants = addParticipantRow(myParticipants, {username: localStorage.getItem("username")});
                setParticipantRows(myParticipants);
            } else if (data.message === "who is here?") {
                myParticipants = addParticipantRow(myParticipants, data);
                setParticipantRows(myParticipants);
                socketIAmHere(socket, newCode, true);
            } else if (data.message === "I am here") {
                myParticipants = addParticipantRow(myParticipants, data);
                setParticipantRows(myParticipants);
            } else if (data.message === "my results") {
                addResultsRow(data);
            } else if (data.message === "I am leaving") {
                myParticipants = removeParticipantRow(myParticipants, data);
                setParticipantRows(myParticipants);
                console.log(`${data.username} has left.`);
            } else if (data.message === "I am ready!") {
                setPlayersReady(playersReady => playersReady + 1);
            } else {
                // alert(data.message);
            }
        });
        // --------- AI Model ---------
        setTimeout(() => {
            function modelLoaded() {
                console.log('AI Model Loaded!');
            }
            classifier.current = ml5.imageClassifier('DoodleNet', modelLoaded);
        }, 1000);

        return (() => {
            currentTrack?.current?.stop();
            // --------- Socket ---------
            socket.off("receive_message");
            socket.off("connect");
            socketIAmLeaving(socket, true, newCode);
            socket.disconnect();
            console.log("socket disconnected");
        });
    }, []);
    useEffect(() => {
        if (showWinnerModal) {
            socketNewPhase(socket, "Game Over!", 0, 0, gameID, true);
        }
    }, [showWinnerModal]);
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
            userSelect: "none",
            WebkitUserSelect: "none",
            MozUserSelect: "none",
        }}>
        {!inGame &&
            <Card id="HostGameCard" style={{opacity: "90%"}}>
                <Card.Header>
                    <h3>{gameID}</h3>
                    
                </Card.Header>
                <Card.Body>
                    <Participants rows={participantRows} />
                </Card.Body>
                <Card.Footer>
                    <Form style={{
                        display: "flex",
                        flexDirection: "row",
                        flex: 1,
                        alignItems: "center",
                        flexWrap: 'wrap',
                        justifyContent: "center"
                    }}>
                        <div className="mb-3">
                            <Form.Check type="switch" checked={participating} label="I am Participating" onChange={toggleParticipate} />
                        </div>
                        <div>
                            <label style={{marginRight: "1em"}}>{`Rounds:`}</label>
                            <Form.Control style={{display: "inline-flex", width: 40}} id="roundsField" placeholder="Enter number of rounds" value={totalRounds} onChange={handleTotalRoundNumberChange}/>
                        </div>
                        </Form>
                    <Button disabled={participantRows.length - (!participating) < 2} style={{display: "inline"}} onClick={startGame}>Start Game</Button>
                </Card.Footer>
            </Card>}
        {(inGame) &&
            <div style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                height: "100%",
                justifyContent: "center",
                alignItems: "center",
            }}>
                {participating && <MultiplayerDrawPage time={timeRemaining} prompt={prompt} showTimer={showTimer} />}
                {(!participating && showTimer) && <div><h1>{prompt}</h1><h1 className="countdown-number" style={{fontSize: "600%", color: timeRemaining <= 3 ? "red" : "black"}}>{timeRemaining}</h1></div>}
                <MultiplayerResultsModal playersReady={playersReady} participating={participating} animation={participating} show={showResults} isGameOver={round >= totalRounds - 1} setShow={setShowResults} round={round} setRound={setRound} rows={resultsRows} setGameRunning={setGameRunning} gameRunning={gameRunning} isHost={true} setShowWinnerModal={setShowWinnerModal}/>
                <DoneDrawingModal participating={participating} animation={participating} show={showDoneDrawingModal} setShow={setShowDoneDrawingModal} />
                <NewPromptModal participating={participating} animation={participating} show={showNewPrompt} setShow={setShowNewPrompt} prompt={prompt} round={round} totalRounds={totalRounds} />
                <WinnerModal participating={participating} animation={participating} show={showWinnerModal} setShow={setShowWinnerModal} rows={resultsRows} />
            </div>
            }
        {!participating && <div
            style={{
                position: "absolute",
                right: "2em",
                bottom: "2em"
            }}
            onClick={handleToggleVolume}
        >
            {volume && <HiVolumeUp size={50} color={"black"}/>}
            {!volume && <HiVolumeOff size={50} color={"black"}/>}
        </div>}
        </div>);
}

export default HostGamePage;