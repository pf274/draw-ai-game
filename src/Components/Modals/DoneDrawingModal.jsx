import Modal from 'react-bootstrap/Modal';

function DoneDrawingModal({ show, setShow, participating, animation }) {
    function handleClose() {
        setShow(false);
    }
    return (
        <Modal
            show={show}
            animation={animation}
            fullscreen={!participating}
            id="DoneDrawingModal"
            backdrop="static"
            keyboard={false}
            onHide={handleClose}
            style={{
                userSelect: "none",
                WebkitUserSelect: "none",
                MozUserSelect: "none",
                overscrollBehavior: "contain"
            }}>
            <Modal.Body style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center"
            }}>
                <h1>Done Drawing!</h1>
            </Modal.Body>
        </Modal>
    )
}

export default DoneDrawingModal;