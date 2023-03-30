import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

function LoginModal({show, setShow, setLoggedIn}) {
  
    const handleClose = () => setShow(false);
    const handleSubmit = async () => {
        let usernameField = document.getElementById("loginUsernameElement");
        let passwordField = document.getElementById("loginPasswordElement");
    
        let username = usernameField.value;
        let password = passwordField.value;
        let response = await fetch('/api/auth/login', {
            method: "post",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                username: username,
                password: password,
            })
        });
        let body = await response.json();
        if (response.status === 200) {
            // console.log("Login Successful!");
            localStorage.setItem("username", username);
            setLoggedIn(true);
            setShow(false);
        } else {
            console.log(body.msg);
        }
    }
    return (
    <Modal show={show} onHide={handleClose}>
        <Modal.Header>
            <Modal.Title>Log In</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form>
                <Form.Group>
                    <Form.Label>Username</Form.Label>
                    <Form.Control type="text" placeholder="Username" id="loginUsernameElement"></Form.Control>
                </Form.Group>
                <Form.Group className="mt-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" placeholder="Password" id="loginPasswordElement"></Form.Control>
                </Form.Group>
            </Form>
            
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
                Close
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
                Log In
            </Button>
        </Modal.Footer>
    </Modal>
    );
  }
  
  export default LoginModal;