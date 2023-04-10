import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import {useState, useRef, useEffect} from 'react';

function SignupModal({show, setShow, setLoggedIn}) {
    const [loading, setLoading] = useState(false);
    const [visibleAlert, setVisibleAlert] = useState(false);
    let alertText = useRef("Error");
    useEffect(() => {
        setVisibleAlert(false);
    }, [show])
    const handleClose = () => setShow(false);
    const handleSubmit = async () => {
        if (loading) {return; };
        setLoading(true);
        let usernameField = document.getElementById("signupUsernameElement");
        let passwordField = document.getElementById("signupPasswordElement");
        let reenterPasswordField = document.getElementById("signupRePasswordElement");
    
        let username = usernameField.value;
        let password = passwordField.value;
        let reenteredPassword = reenterPasswordField.value;
        if (password.length === 0) {
            alertText.current="Please enter a password";
            setVisibleAlert(true);
            setLoading(false);
            return;
        }
        if (password !== reenteredPassword) {
            alertText.current="Passwords do not match";
            setVisibleAlert(true);
            setLoading(false);
            return;
        }
        let response = await fetch('/api/auth/create', {
            method: "post",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                username: username,
                password: password,
            })
        });
        let body = await response.json();
        if (response.status === 200) {
            console.log("Signup successful!");
            // console.log(response);
            localStorage.setItem("username", username);
            setLoggedIn(true);
            setShow(false);
            setVisibleAlert(false);
        } else {
            if (response.status === 409) {
                alertText.current="User already exists";
            } else {
                alertText.current="An Unknown Error occurred";
                console.log(body.msg);
            }
            setVisibleAlert(true);

        }
        setLoading(false);
    }
    return (
    <Modal show={show} onHide={handleClose} style={{overscrollBehavior: "contain"}}>
        <Modal.Header>
            <Modal.Title>Sign Up</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form>
                <Form.Group>
                    <Form.Label>Username</Form.Label>
                    <Form.Control type="text" placeholder="Username" id="signupUsernameElement"></Form.Control>
                </Form.Group>
                <Form.Group className="mt-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" placeholder="Password" id="signupPasswordElement"></Form.Control>
                    <Form.Control className="mt-2" type="password" placeholder="Re-enter Password" id="signupRePasswordElement"></Form.Control>
                </Form.Group>
            </Form>
            <Alert bsStyle="danger" show={visibleAlert}>{alertText.current}</Alert>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
                Close
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
            {!loading && "Sign Up"}
            {loading && <div><Spinner as="span" variant="light" size="sm" role="status" aria-hidden="true" animation="border"/> Loading...</div>}
            </Button>
        </Modal.Footer>
    </Modal>
    );
  }
  
  export default SignupModal;