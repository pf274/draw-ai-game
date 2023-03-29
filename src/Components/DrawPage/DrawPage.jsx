import "./DrawPage.css";
import Card from 'react-bootstrap/Card';
import Toolbar from './Toolbar.jsx';
import DrawingCanvas from './DrawingCanvas.jsx';
import {useEffect} from 'react';
import { Pages } from "../../App";

const DrawPage = (props) => {

    function goBack() {
        props.setPage(Pages.Home);
        window.history.back();
    }

    useEffect(() => {
        window.addEventListener("popstate", goBack);
        window.history.pushState({}, "Test");
        return (() => {
            window.removeEventListener("popstate", goBack);
        })
    }, []);
    return (
        <Card id="DrawPage">
            <Card.Header id="DrawPageHeader">
                <h1 id="title">Start Drawing!</h1>
                <h2 id="timer">Timer</h2>
                <h4 id="Prompt">Prompt: ...</h4>
            </Card.Header>
            <Card.Body id="DrawPageBody">
                <Toolbar />
                <DrawingCanvas></DrawingCanvas>
            </Card.Body>
            <Card.Footer>

            </Card.Footer>
        </Card>
    );
};

export default DrawPage;