import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import { Capitalize } from '../GameParts';
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
                MozUserSelect: "none"
            }}>
            <Modal.Header style={{display: "flex", justifyContent: "center"}}>
                {!isGameOver && <h1>{`Round ${round + 1}`}</h1>}
                {isGameOver && <h1>Game Over!</h1>}
            </Modal.Header>
            <Modal.Body>
            <Table>
                <thead>
                    <tr style={{textAlign: "center"}}>
                        <th>Username</th>
                        <th>Picture</th>
                        <th>Top Guesses</th>
                        <th>Points</th>
                    </tr>
                </thead>
                <tbody>
                    {uniqueRows.map((row) => {
                        // debugger;
                        return (
                            <tr key={row.username} style={{textAlign: "center"}}>
                                <td>{row.username}</td>
                                <td>
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
                                </td>
                                <td>{row.results.map((guess, index) => {
                                    return (
                                        <div
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
                                        </div>);
                                    })}
                                </td>
                                <td><div><p style={{margin: "0px", padding: "0px"}}>{row.points}</p></div><div><p><strong>{row.totalPoints}</strong></p></div></td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
            </Modal.Body>
            <Modal.Footer style={{justifyContent: "center"}}>
                {isHost && <Button size={fullscreen ? "lg" : "normal"} disabled={gameRunning} onClick={handleProceed}>{isGameOver ? "End Game" : "Next Round"}</Button>}
            </Modal.Footer>
        </Modal>
    );
}

export default MultiplayerResultsModal;