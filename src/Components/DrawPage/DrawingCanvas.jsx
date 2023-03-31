import './DrawingCanvas.css';
import {useEffect, useRef, useCallback, forwardRef} from 'react';
import * as ml5 from "ml5";

const DrawingCanvas = ({setGuesses}) => {
    let classifier = useRef();
    let drawing = useRef(false);
    let prevCoords = useRef([0, 0]);
    let resizeTimeout = useRef();
    let guessTimeout = useRef();
    let tap = useRef(false);
    let context = useRef();
    async function cropContent(canvas) { // takes in the drawing canvas and outputs a cropped canvas
        context.current = context?.current || canvas.getContext("2d", { willReadFrequently: true });
        const width = canvas.width;
        const height = canvas.height;
        const tolerance = 20; // the tolerance to detect the difference between the background and the drawing
        const imageData = context.current.getImageData(0, 0, width, height).data;
        const bounds = {
          x: [width, 0],
          y: [height, 0]
        }
        for (let x = 0; x < width; x++) {
          for (let y = 0; y < height; y++) {
            const i = (y * width + x) * 4; // get the beginning of the pixel's data
            const pixelData = imageData.slice(i, i + 4);
            
            if ((pixelData[0] + pixelData[1] + pixelData[2] < 3 * 255 - tolerance) && pixelData[3] > 10) {
      
              bounds.x[0] = Math.min(bounds.x[0], x);
              bounds.x[1] = Math.max(bounds.x[1], x);
              bounds.y[0] = Math.min(bounds.y[0], y);
              bounds.y[1] = Math.max(bounds.y[1], y);
            }
          }
        }
        const croppedCanvas = document.createElement('canvas');
      
        const cropWidth = bounds.x[1] - bounds.x[0];
        const cropHeight = bounds.y[1] - bounds.y[0];
      
        croppedCanvas.width = cropWidth;
        croppedCanvas.height = cropHeight;
      
        const croppedContext = croppedCanvas.getContext('2d');
        croppedContext.drawImage(canvas, bounds.x[0], bounds.y[0], cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
      
        return croppedCanvas;
    }
    const cleanup = useCallback(() => {
        console.log("cleaned up");
        const drawingCanvas = document.getElementById("drawingCanvas");
        window.removeEventListener('resize', startResize);
        drawingCanvas.removeEventListener('mousedown', startDraw);
        drawingCanvas.removeEventListener('touchstart', startDraw);
        drawingCanvas.removeEventListener('mousemove', continueDraw);
        drawingCanvas.removeEventListener('touchmove', continueDraw);
        drawingCanvas.removeEventListener('mouseup', endDraw);
        drawingCanvas.removeEventListener('touchend', endDraw);
    });
    const initialize = useCallback(() => {
        const drawingCanvas = document.getElementById("drawingCanvas");
        console.log("intialized");
        window.addEventListener('resize', startResize);
        drawingCanvas.addEventListener('mousedown', startDraw);
        drawingCanvas.addEventListener('touchstart', startDraw);
        drawingCanvas.addEventListener('mousemove', continueDraw);
        drawingCanvas.addEventListener('touchmove', continueDraw);
        drawingCanvas.addEventListener('mouseup', endDraw);
        drawingCanvas.addEventListener('touchend', endDraw);
    });
    async function AIGuess() {
        console.log("Calculating guesses");
        if (classifier.current) {
            let drawingCanvas = document.getElementById("drawingCanvas");
            let shouldCrop = true;
            let numberOfGuesses = 5;
            // crop it
            let croppedCanvas = shouldCrop ? await cropContent(drawingCanvas) : drawingCanvas;
            
            // create a background
            const width = croppedCanvas.width;
            const height = croppedCanvas.height;
            const withBackground = document.createElement('canvas');
            withBackground.width = width;
            withBackground.height = height;
            
            let bgcontext = withBackground.getContext('2d');
            bgcontext.fillStyle = "rgba(255, 255, 255, 1)";
            bgcontext.fillRect(0, 0, withBackground.width, withBackground.height);
            
            // combine background and foreground
            bgcontext.drawImage(croppedCanvas, 0, 0, width, height, 0, 0, width, height);
          
            let results = await classifier.current.classify(withBackground, numberOfGuesses);
            setGuesses([...results]);
            console.log("Calculated guesses");
            withBackground.remove();
        }
    }
    useEffect(() => {
        initialize();
        finishResize();
        drawing = false;
        tap = false;
        setTimeout(() => {
            function modelLoaded() {
                console.log('Model Loaded!');
            }
            classifier.current = ml5.imageClassifier('DoodleNet', modelLoaded);
        }, 1000);
        return () => {
            cleanup();
        }
    }, [cleanup, initialize]);
    function finishResize() {
        let canvas = document.getElementById("drawingCanvas");
        let canvasContainer = document.getElementById("canvasContainer");
        canvas.width = canvasContainer.offsetWidth - 5;
        canvas.height = canvasContainer.offsetHeight - 10;
        canvas.style.border = "1px solid gray";
    }
    function startResize() {
        let canvas = document.getElementById("drawingCanvas");
        let canvasContainer = document.getElementById("canvasContainer");
        canvas.width = canvasContainer.offsetWidth;
        canvas.height = 0;
        canvas.style.border = "0px";
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(finishResize, 100);
    }
    function startDraw(event) {
        const drawingCanvas = document.getElementById("drawingCanvas");
        if (drawingCanvas) {
            clearTimeout(guessTimeout);
            drawing = true;
            const colorPicker = document.getElementById("colorPicker");
            prevCoords = calculateMouseCoords(event, drawingCanvas);
            drawingCanvas?.setAttribute("penColor", colorPicker?.value || "#000000");
            tap = true;
        }
    }
    function continueDraw(event) {
        const drawingCanvas = document.getElementById("drawingCanvas");
        if (drawingCanvas) {
            if (drawing) {
                clearTimeout(guessTimeout);
                tap = false;
                const thicknessSlider = document.getElementById("thicknessSlider");
                let newCoords = calculateMouseCoords(event, drawingCanvas);
                context.current = context?.current || drawingCanvas.getContext("2d", { willReadFrequently: true });
                let thickness = 16 * (thicknessSlider?.value || 1) * Math.min((window.innerWidth / 650), (window.innerHeight / 850));
                if (event?.targetTouches) {
                    if (event.targetTouches.length > 0) {
                        thickness = 0.5 * thickness + (1.5 * thickness * event?.targetTouches[0].force);
                    }
                }
                context.current.lineWidth = thickness;
                context.current.lineCap = "round";
                context.current.strokeStyle = drawingCanvas.getAttribute("penColor");
                context.current.moveTo(...prevCoords);
                context.current.lineTo(...newCoords);
                context.current.stroke();
                context.current.beginPath();
                prevCoords = [...newCoords];
            }
        }
    }
    function endDraw(event) {
        const drawingCanvas = document.getElementById("drawingCanvas");
        clearTimeout(guessTimeout);
        if (drawing) {
            guessTimeout = setTimeout(AIGuess, 1000);
        }
        if (drawingCanvas) {
            drawing = false;
            if (tap) {
                const thicknessSlider = document.getElementById("thicknessSlider");
                let newCoords = calculateMouseCoords(event, drawingCanvas);
                tap = false;
                let thickness = 16 * (thicknessSlider?.value || 1) * Math.min((window.innerWidth / 650), (window.innerHeight / 850));
                if (event?.targetTouches) {
                    if (event.targetTouches.length > 0) {
                        thickness = 0.5 * thickness + 1.5 * thickness * event?.targetTouches[0].force;
                    }        
                }
                context.current = context?.current || drawingCanvas.getContext("2d", { willReadFrequently: true });
                context.current.lineWidth = thickness;
                context.current.lineCap = "round";
                context.current.strokeStyle = drawingCanvas.getAttribute("penColor");
                context.current.moveTo(...newCoords);
                context.current.lineTo(newCoords[0], newCoords[1] + 1);
                context.current.stroke();
                context.current.beginPath();
            }
        }
    }
    function calculateMouseCoords(event, canvas) {
        try {
            const clientX = event?.clientX || event?.touches?.at(0)?.clientX || 0;
            const clientY = event?.clientY || event?.touches?.at(0)?.clientY || 0;
            let rect = canvas?.getBoundingClientRect();
            return [clientX - rect?.left, clientY - rect?.top];
        } catch (err) {
            console.log(err);
            return [0, 0];
        }
    }
    return (
        <div id="canvasContainer">
            <canvas style={{
                border: "1px solid gray",
                borderRadius: "10px"
            }} id="drawingCanvas" />
        </div>
    )
};

export default DrawingCanvas;