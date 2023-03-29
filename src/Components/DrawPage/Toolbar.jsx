import "./Toolbar.css";
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import FormRange from 'react-bootstrap/FormRange';
import rawCategoryData from '../../Data/categories.txt';
import {useState} from 'react';
function Toolbar() {
    const [value, setValue] = useState(1);
    function Capitalize(text) {
        return text.toLowerCase().split(' ')
            .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
            .join(' ');
    }
    function clearCanvas() {
        const drawingCanvas = document.getElementById("drawingCanvas");
        let context = drawingCanvas.getContext("2d");
        context.fillStyle = "rgba(255, 255, 255, 1)";
        context.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    }
    async function newPrompt() {
        const Prompt = document.getElementById("Prompt");
        let allCategories = await fetch(rawCategoryData).then(result => result.text());
        allCategories = allCategories.split("\n").map((item) => Capitalize(item.trim()));
        let newCategory = allCategories[Math.floor(Math.random() * allCategories.length)];
        Prompt.innerText = newCategory;
    }
    function handleSliderChange(event) {
        setValue(event.target.value);
    }
    return (
        <Card className="toolbarBody">
            <Button onClick={newPrompt}>New Prompt</Button>
            <Button onClick={clearCanvas}>Clear Canvas</Button>
            <Button>Guess</Button>
            <FormRange min="0.5" max="3" step="0.1" value={value} id="thicknessSlider" onChange={handleSliderChange}></FormRange>
            <input type="color" id="colorPicker" />
        </Card>
    );
}

export default Toolbar;