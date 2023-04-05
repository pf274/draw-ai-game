import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';
function MultiplayerModal({show, setShow, rows}) {
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
        <Modal show={show} onHide={handleClose} id="MultiplayerModal" backdrop="static" keyboard={false}>
            <Modal.Header>
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
            </Modal.Header>
            <Modal.Body>

            </Modal.Body>
            {/* <Modal.Footer>
                <Button onClick={handleClose}>Close</Button>
            </Modal.Footer> */}
        </Modal>
    );
}

export default MultiplayerModal;