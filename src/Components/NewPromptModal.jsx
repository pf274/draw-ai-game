import Modal from 'react-bootstrap/Modal';

function NewPromptModal({show, setShow, animation, prompt, round, fullscreen}) {
    function handleClose() {
        setShow(false);
    }
    return (
        <Modal
            show={show}
            fullscreen={fullscreen}
            animation={animation}
            id="NewPromptModal"
            backdrop="static"
            keyboard={false}
            onHide={handleClose}
            style={{
                userSelect: "none",
                WebkitUserSelect: "none",
                MozUserSelect: "none"
            }}>
            <Modal.Header>
                <Modal.Title style={{textAlign: "center"}}>{`Round ${round + 1}!`}</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{display: "flex", textAlign: "center", justifyContent: "center", alignItems: "center"}}>
                {!fullscreen && <h2>{prompt}</h2>}
                {fullscreen && <h1 style={{fontSize: "600%"}}>{prompt}</h1>}
            </Modal.Body>
        </Modal>
    )
}

export default NewPromptModal;