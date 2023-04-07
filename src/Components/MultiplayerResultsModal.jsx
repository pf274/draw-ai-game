import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';

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
        <Modal show={show} fullscreen={fullscreen} animation={animation} onHide={handleClose} id="MultiplayerResultsModal" backdrop="static" keyboard={false}>
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
                        <th>Round Points</th>
                        <th>Total Points</th>
                    </tr>
                </thead>
                <tbody>
                    {uniqueRows.map((row) => {
                        return (
                            <tr key={row.username} style={{textAlign: "center"}}>
                                <td>{row.username}</td>
                                <td>
                                    <img
                                        style={{
                                            maxWidth: 150,
                                            minWidth: 150
                                        }}
                                        src={row.picture}
                                    />
                                    </td>
                                <td>{row.points}</td>
                                <td>{row.totalPoints}</td>
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