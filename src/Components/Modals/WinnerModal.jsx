import { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import { useNavigate } from 'react-router-dom';

function WinnerModal({show, setShow, rows, fullscreen, animation}) {
    const navigate = useNavigate();
    const [winner, setWinner] = useState("...");
    function handleClose() {
        setShow(false);
    }
    useEffect(() => {
        let scores = {};
        rows.forEach((row) => scores[row.totalPoints] = row.username);
        let sortedScores = Object.keys(scores).map(score => parseInt(score)).sort((a, b) => b - a);
        setWinner(sortedScores?.length ? `${scores[sortedScores[0]]}: ${sortedScores[0]}` : "Nobody");
    }, [rows]);

    return (
        <Modal show={show} fullscreen={fullscreen} animation={animation} id="WinnerModal" backdrop="static" keyboard={false} onHide={handleClose} style={{touchAction: "none"}}>
            <Modal.Header style={{display: "flex", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
                <Modal.Title style={{fontSize: fullscreen ? "400%" : "200%"}}>Winner!</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{display: "flex", textAlign: "center", alignItems: "center", justifyContent: "center"}}>
                {!fullscreen && <h2>{winner}</h2>}
                {fullscreen && <h1 style={{fontSize: "600%"}}>{winner}</h1>}
            </Modal.Body>
            <Modal.Footer style={{justifyContent: "center"}}>
                <Button size={fullscreen ? "lg" : "normal"} onClick={() => {navigate('/')}}>Return to Main Menu</Button>
            </Modal.Footer>
        </Modal>
    )
}

export default WinnerModal;