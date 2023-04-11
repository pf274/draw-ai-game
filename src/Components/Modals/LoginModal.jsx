import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import { useState, useRef, useEffect } from 'react';

function LoginModal({ show, setShow, setLoggedIn }) {
    const [loading, setLoading] = useState(false);
    const [visibleAlert, setVisibleAlert] = useState(false);
    const alertText = useRef("Error");
    useEffect(() => {
        setVisibleAlert(false);
    }, [show])
    const handleClose = () => setShow(false);
    const handleSubmit = async () => {
        if (loading) { return; };
        setLoading(true);
        const usernameField = document.getElementById("loginUsernameElement");
        const passwordField = document.getElementById("loginPasswordElement");
        const username = usernameField.value;
        const password = passwordField.value;
        const response = await fetch('/api/auth/login', {
            method: "post",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                password,
            })
        });
        // const body = await response.json();
        if (response.status === 200) {
            // console.log("Login Successful!");
            localStorage.setItem("username", username);
            setLoggedIn(true);
            setVisibleAlert(false);
            setShow(false);
        } else {
            alertText.current = "Log In failed";
            setVisibleAlert(true);
            // console.log(body.msg);
        }
        setLoading(false);
    }
    return (
        <Modal show={show} onHide={handleClose} style={{ overscrollBehavior: "contain" }}>
            <Modal.Header>
                <Modal.Title>Log In</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group>
                        <Form.Label>Username</Form.Label>
                        <Form.Control type="text" placeholder="Username" id="loginUsernameElement" />
                    </Form.Group>
                    <Form.Group className="mt-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" placeholder="Password" id="loginPasswordElement" />
                    </Form.Group>
                </Form>
                <Alert bsStyle="danger" show={visibleAlert}>{alertText.current}</Alert>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                    {!loading && "Log In"}
                    {loading && <div><Spinner as="span" variant="light" size="sm" role="status" aria-hidden="true" animation="border" /> Loading...</div>}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default LoginModal;