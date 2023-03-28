import "./DrawPage.css";
import Card from 'react-bootstrap/Card';
import Toolbar from './Toolbar.jsx';

function DrawPage() {
    return (
        <Card id="DrawPage">
            <Card.Header id="DrawPageHeader">
                <h1 id="title">Start Drawing!</h1>
                <h4 id="Prompt">Prompt: ...</h4>
            </Card.Header>
            <Card.Body id="DrawPageBody">
                <Toolbar>

                </Toolbar>
            </Card.Body>
            <Card.Footer>

            </Card.Footer>
        </Card>
    );
}

export default DrawPage;