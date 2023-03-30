import "../Components/DrawPage/DrawPage.css";
import Card from 'react-bootstrap/Card';
import Toolbar from '../Components/DrawPage/Toolbar.jsx';
import DrawingCanvas from '../Components/DrawPage/DrawingCanvas.jsx';
import {useEffect, useRef, useCallback} from 'react';
import { Modes } from "../index.js";

const DrawPage = ({mode}) => {
    return (
            <Card id="DrawPage">
            <Card.Header id="DrawPageHeader">
                <h1 id="title">Start Drawing!</h1>
                <h2 id="timer" className="multiplayer">Timer</h2>
                <h4 id="Prompt">Prompt: ...</h4>
            </Card.Header>
            <Card.Body id="DrawPageBody">
                {mode !== Modes.Multi && <Toolbar id="toolbar" />}
                <DrawingCanvas />
            </Card.Body>
            <Card.Footer>

            </Card.Footer>
        </Card>
    );
};

export default DrawPage;