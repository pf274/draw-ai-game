import "./Toolbar.css";
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import FormRange from 'react-bootstrap/FormRange';
function Toolbar() {
    function clearCanvas() {
        const drawingCanvas = document.getElementById("drawingCanvas");
        let context = drawingCanvas.getContext("2d");
        context.fillStyle = "rgba(255, 255, 255, 1)";
        context.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    }
    return (
        <Card id="Toolbar">
            <Button className="singleplayer">New Prompt</Button>
            <Button className="singleplayer" onClick={clearCanvas}>Clear Canvas</Button>
            <Button className="singleplayer">Guess</Button>
            <FormRange className="singleplayer" min="0.5" max="3" step="0.1" id="thicknessSlider"></FormRange>
            <input className="singleplayer" type="color" id="colorPicker" />
        </Card>
    );
}

export default Toolbar;