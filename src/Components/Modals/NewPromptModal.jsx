import Modal from 'react-bootstrap/Modal';

function NewPromptModal({show, setShow, animation, prompt, round, participating, totalRounds}) {
    function handleClose() {
        setShow(false);
    }
    return (
        <Modal
            show={show}
            fullscreen={!participating}
            animation={animation}
            id="NewPromptModal"
            backdrop="static"
            keyboard={false}
            onHide={handleClose}
            style={{
                userSelect: "none",
                WebkitUserSelect: "none",
                MozUserSelect: "none",
                overscrollBehavior: "contain"
            }}>
            <Modal.Header style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                <Modal.Title style={{textAlign: "center"}}>{round + 1 >= totalRounds ? `Last Round! (Round ${round + 1})` : `Round ${round + 1}!`}</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{display: "flex", textAlign: "center", justifyContent: "center", alignItems: "center"}}>
                {participating && <h2>{prompt}</h2>}
                {!participating && <h1 style={{fontSize: window.innerWidth < 900 ? "200%" : "600%"}}>{prompt}</h1>}
            </Modal.Body>
        </Modal>
    )
}

export default NewPromptModal;