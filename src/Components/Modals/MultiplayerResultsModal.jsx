import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import { Capitalize } from '../GameParts';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

function MultiplayerResultsModal({show, fullscreen, animation, setShow, rows, setRound, round, isGameOver, setGameRunning, gameRunning, isHost, setShowWinnerModal}) {
    function handleProceed() {
        if (isGameOver) {
            setShowWinnerModal(true);
            setShow(false);
        } else {
            setTimeout(() => {
                setRound(round => round + 1);
            }, 1400);
            setGameRunning(true);
        }
    }
    function handleReady() {
        // TODO: HANDLE BEING READY FOR THE NEXT ROUND
    }
    function handleClose() {
        setShow(false);
    }
    let uniqueRows = [];
    for (const row of rows) {
        if (uniqueRows.map(row => row.username).includes(row.username) === false) {
            uniqueRows.push(row);
        }
    }
    return (
        <Modal
            show={show}
            fullscreen={fullscreen}
            animation={animation}
            onHide={handleClose}
            id="MultiplayerResultsModal"
            backdrop="static"
            keyboard={false}
            style={{
                userSelect: "none",
                WebkitUserSelect: "none",
                MozUserSelect: "none",
                touchAction: "none"
            }}>
            <Modal.Header style={{display: "flex", justifyContent: "center"}}>
                {!isGameOver && <h1>{`Round ${round + 1}`}</h1>}
                {isGameOver && <h1>Game Over!</h1>}
            </Modal.Header>
            <Modal.Body>
            <Table>
                <thead>
                    <tr style={{textAlign: "center"}}>
                        <th>Results</th>
                    </tr>
                </thead>
                <tbody>
                    {uniqueRows.sort((a, b) => {return b.points - a.points}).map((row) => {
                        return (
                            <tr key={row.username} style={{textAlign: "center"}}>
                                <td style={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
                                    <div style={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
                                        <p style={{margin: 0}}>{`${row.username}`}</p>
                                        <p style={{margin: 0}}>Points: {row.points}</p>
                                        <p style={{margin: 0}}>Total Points: <strong>{row.totalPoints}</strong></p>
                                    </div>
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: 150,
                                        height: 250,
                                        margin: 0,
                                    }}>
                                        <img style={{
                                            maxWidth: "100%",
                                            maxHeight: "100%"
                                        }} src={row.picture} />
                                    </div>
                                    <DropdownButton title="See guesses  " drop="centered">
                                    {row.results.map((guess, index) => {
                                    return (
                                        <Dropdown.Item
                                            style={{
                                                display: "flex",
                                                flexDirection: "row",
                                                color: row.points === (10 - index) * 100 ? "#00AAAA": "#000000"
                                            }}
                                            id={guess.label}
                                        >
                                            <p
                                                style={{
                                                    margin: "0px",
                                                    padding: "0px"
                                                }}
                                            >
                                                {`${Capitalize(guess.label.replace(/_/g, " "))}`}
                                            </p>
                                            <p
                                                style={{
                                                    margin: "0px",
                                                    padding: "0px",
                                                    flex: 1,
                                                    textAlign: "right",
                                                    marginLeft: "1em"
                                                }}
                                            >
                                                {`${Math.floor(guess.confidence * 10000) / 100}%`}
                                            </p>
                                        </Dropdown.Item>);
                                    })}
                                    </DropdownButton>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
            </Modal.Body>
            <Modal.Footer style={{justifyContent: "center"}}>
                {isHost && <Button size={fullscreen ? "lg" : "normal"} disabled={gameRunning} onClick={handleProceed}>{isGameOver ? "End Game" : "Next Round"}</Button>}
                {(!isHost && !isGameOver) && <Button size={fullscreen ? "lg" : "normal"} disabled={gameRunning} onClick={handleReady}>Ready!</Button>}
            </Modal.Footer>
        </Modal>
    );
}

export default MultiplayerResultsModal;