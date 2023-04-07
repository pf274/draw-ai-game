import Modal from 'react-bootstrap/Modal';

function NewPromptModal({show, setShow, prompt, round}) {
    function handleClose() {
        setShow(false);
    }
    return (
        <Modal show={show} id="NewPromptModal" backdrop="static" keyboard={false} onHide={handleClose}>
            <Modal.Header>
                <Modal.Title style={{textAlign: "center"}}>{`Round ${round + 1}!`}</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{textAlign: "center"}}>
                <h2>{prompt}</h2>
            </Modal.Body>
        </Modal>
    )
}

export default NewPromptModal;