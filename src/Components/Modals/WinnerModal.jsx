import { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import { useNavigate } from 'react-router-dom';

function WinnerModal({ show, setShow, rows, participating, animation }) {
    const navigate = useNavigate();
    const [winner, setWinner] = useState("...");
    function handleClose() {
        setShow(false);
    }
    useEffect(() => {
        const scores = {};
        rows.forEach((row) => scores[row.totalPoints] = row.username);
        const sortedScores = Object.keys(scores).map(score => parseInt(score)).sort((a, b) => b - a);
        setWinner(sortedScores?.length ? `${scores[sortedScores[0]]}: ${sortedScores[0]}` : "Nobody");
    }, [rows]);

    return (
        <Modal show={show} fullscreen={!participating} animation={animation} id="WinnerModal" backdrop="static" keyboard={false} onHide={handleClose} style={{ overscrollBehavior: "contain" }}>
            <Modal.Header style={{ display: "flex", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
                <Modal.Title style={{ fontSize: !participating ? "400%" : "200%" }}>Winner!</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ display: "flex", textAlign: "center", alignItems: "center", justifyContent: "center" }}>
                {participating && <h2>{winner}</h2>}
                {!participating && <h1 style={{ fontSize: "600%" }}>{winner}</h1>}
            </Modal.Body>
            <Modal.Footer style={{ justifyContent: "center" }}>
                <Button size={!participating ? "lg" : "normal"} onClick={() => { navigate('/') }}>Return to Main Menu</Button>
            </Modal.Footer>
        </Modal>
    )
}

export default WinnerModal;