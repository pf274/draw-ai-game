import Modal from 'react-bootstrap/Modal';

function DoneDrawingModal({show, setShow}) {
    function handleClose() {
        setShow(false);
    }
    return (
        <Modal show={show} id="DoneDrawingModal" backdrop="static" keyboard={false} onHide={handleClose}>
            <Modal.Body>
                <h1>Done Drawing!</h1>
            </Modal.Body>
        </Modal>
    )
}

export default DoneDrawingModal;