import "./Toolbar.css";
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import FormRange from 'react-bootstrap/FormRange';
import rawCategoryData from '../../Data/categories.txt';
import {useState, useEffect, useRef} from 'react';

import * as ml5 from "ml5";
import {AIGuess} from '../GameClass.js';


function Toolbar({setShowGuessesModal, setPrompt, setGuesses}) {
    let classifier = useRef();
    const [sliderValue, setSliderValue] = useState(1);
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
        let allCategories = await fetch(rawCategoryData).then(result => result.text());
        allCategories = allCategories.split("\n").map((item) => Capitalize(item.trim()));
        let newCategory = allCategories[Math.floor(Math.random() * allCategories.length)];
        setPrompt(newCategory);
    }
    function handleSliderChange(event) {
        setSliderValue(event.target.value);
    }
    function handleOpenGuessModal() {
        AIGuess(classifier).then(results => {
            setGuesses(results.results);
            setShowGuessesModal(true);
        });
    }
    useEffect(() => {
        newPrompt();
        setTimeout(() => {
            function modelLoaded() {
                console.log('Model Loaded!');
            }
            classifier.current = ml5.imageClassifier('DoodleNet', modelLoaded);
        }, 1000);
    }, []);
    return (
        <Card className="toolbarBody">
            <Button onClick={newPrompt}>New Prompt</Button>
            <Button onClick={clearCanvas}>Clear Canvas</Button>
            <Button onClick={handleOpenGuessModal}>Guess</Button>
            <FormRange min="0.5" max="3" step="0.1" value={sliderValue} id="thicknessSlider" onChange={handleSliderChange}></FormRange>
            <input type="color" id="colorPicker" />
        </Card>
    );
}

export default Toolbar;