import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

function SignupModal({show, setShow, setLoggedIn}) {
    // const [show, setShow] = useState(false);
  
    const handleClose = () => setShow(false);
    const handleSubmit = async () => {
        let usernameField = document.getElementById("signupUsernameElement");
        let passwordField = document.getElementById("signupPasswordElement");
        let reenterPasswordField = document.getElementById("signupRePasswordElement");
    
        let username = usernameField.value;
        let password = passwordField.value;
        let reenteredPassword = reenterPasswordField.value;
    
        if (password !== reenteredPassword) {
            console.log("Passwords do not match!");
            return;
        }
        if (password.length === 0) {
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
            console.log(response);
            localStorage.setItem("username", username);
            setLoggedIn(true);
            setShow(false);
        } else {
            console.log("User already exists!");
            console.log(body.msg);
        }
    }
    return (
    <Modal show={show} onHide={handleClose}>
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
            
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
                Close
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
                Sign Up
            </Button>
        </Modal.Footer>
    </Modal>
    );
  }
  
  export default SignupModal;