import { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import { useNavigate } from 'react-router-dom';

function WinnerModal({show, setShow, rows}) {
    const navigate = useNavigate();
    const [winner, setWinner] = useState("...");
    function handleClose() {
        setShow(false);
    }
    useEffect(() => {
        let scores = {};
        console.log(rows);
        rows.forEach((row) => scores[row.totalPoints] = row.username);
        let sortedScores = Object.keys(scores).map(score => parseInt(score)).sort((a, b) => b - a);
        setWinner(`${scores[sortedScores[0]]}: ${sortedScores[0]}`);
    }, [rows]);

    return (
        <Modal show={show} id="WinnerModal" backdrop="static" keyboard={false} onHide={handleClose}>
            <Modal.Header>
                <Modal.Title style={{textAlign: "center"}}>Winner!</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{textAlign: "center"}}>
                <h2>{winner}</h2>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={() => {navigate('/')}}>Return to Main Menu</Button>
            </Modal.Footer>
        </Modal>
    )
}

export default WinnerModal;