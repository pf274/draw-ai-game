import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import {useEffect, useState} from 'react';

function SingleplayerGuessesModal({show, setShow, guesses, prompt}) {
    function Capitalize(text) {
        return text.toLowerCase().split(' ')
            .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
            .join(' ');
    }
    const [tableRows, setTableRows] = useState([]);
    function compareGuessToPrompt(guess, prompt) {
        let formattedGuess = Capitalize(guess.replace(/_/g, " "));
        return formattedGuess == prompt;
    }
    useEffect(() => {
        if (guesses) {
            let rows = guesses.map((guessInfo, index) => {
                let variant = compareGuessToPrompt(guessInfo.label, prompt) ? "cyan" : "white";
                return (
                    <tr style={{textAlign: "center", borderRadius: 5}} key={index} bgColor={variant}>
                        <td>{index + 1}</td>
                        <td>{Capitalize(guessInfo.label.replace(/_/g, " "))}</td>
                        <td>{`${Math.floor(guessInfo.confidence * 10000) / 100}%`}</td>
                    </tr>
                );
            })
            setTableRows(rows);
        }
    }, [show, guesses]);
    const handleClose = () => setShow(false);

    return (
        <Modal show={show} onHide={handleClose} id="SingleplayerGuessesModal">
            <Modal.Header>
                Guesses
            </Modal.Header>
            <Modal.Body>
                <Table>
                    <thead>
                        <tr style={{textAlign: "center"}}>
                            <th>#</th>
                            <th>Guess</th>
                            <th>Confidence</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableRows}
                    </tbody>
                </Table>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={handleClose}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default SingleplayerGuessesModal;