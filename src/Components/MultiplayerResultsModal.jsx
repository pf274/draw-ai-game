import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';

function MultiplayerResultsModal({show, setShow, rows, setRound, round, isGameOver, setGameRunning, gameRunning, isHost, setShowWinnerModal}) {
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
        <Modal show={show} onHide={handleClose} id="MultiplayerResultsModal" backdrop="static" keyboard={false}>
            <Modal.Header>
                {!isGameOver && <h1>{`Round ${round + 1}`}</h1>}
                {isGameOver && <h1>Game Over!</h1>}
            </Modal.Header>
            <Modal.Body>
            <Table>
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Picture</th>
                        <th>Round Points</th>
                        <th>Total Points</th>
                    </tr>
                </thead>
                <tbody>
                    {uniqueRows.map((row) => {
                        return (
                            <tr key={row.username}>
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
            <Modal.Footer>
                {isHost && <Button disabled={gameRunning} onClick={handleProceed}>{isGameOver ? "End Game" : "Next Round"}</Button>}
            </Modal.Footer>
        </Modal>
    );
}

export default MultiplayerResultsModal;