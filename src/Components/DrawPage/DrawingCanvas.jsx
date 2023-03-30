import './DrawingCanvas.css';
import {useEffect, useRef, useCallback} from 'react';
import * as ml5 from "ml5";

function DrawingCanvas() {
    let classifier = useRef();
    const resizing = useRef(false);
    let drawing = useRef(false);
    let prevCoords = useRef([0, 0]);
    let resizeTimeout = useRef();
    let tap = useRef(false);
    const cleanup = useCallback(() => {
        console.log("cleaned up");
        window.removeEventListener('resize', startResize);
        window.removeEventListener('mousedown', startDraw);
        window.removeEventListener('touchstart', startDraw);
        window.removeEventListener('mousemove', continueDraw);
        window.removeEventListener('touchmove', continueDraw);
        window.removeEventListener('mouseup', endDraw);
        window.removeEventListener('touchend', endDraw);
    });
    const initialize = useCallback(() => {
        console.log("intialized");
        window.addEventListener('resize', startResize);
        window.addEventListener('mousedown', startDraw);
        window.addEventListener('touchstart', startDraw);
        window.addEventListener('mousemove', continueDraw);
        window.addEventListener('touchmove', continueDraw);
        window.addEventListener('mouseup', endDraw);
        window.addEventListener('touchend', endDraw);
    });
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
                tap = false;
                const thicknessSlider = document.getElementById("thicknessSlider");
                let newCoords = calculateMouseCoords(event, drawingCanvas);
                let context = drawingCanvas?.getContext("2d");
                let thickness = 16 * (thicknessSlider?.value || 1) * Math.min((window.innerWidth / 650), (window.innerHeight / 850));
                if (event?.targetTouches) {
                    if (event.targetTouches.length > 0) {
                        thickness = 0.5 * thickness + (1.5 * thickness * event?.targetTouches[0].force);
                    }
                }
                context.lineWidth = thickness;
                context.lineCap = "round";
                context.strokeStyle = drawingCanvas.getAttribute("penColor");
                context.moveTo(...prevCoords);
                context.lineTo(...newCoords);
                context.stroke();
                context.beginPath();
                prevCoords = [...newCoords];
            }
        }
    }
    async function classifyImg(image) {
        if (classifier.current) {
            return classifier.current.predict(image, 5).then(results => {
                return results;
            });
        }
    }
    function endDraw(event) {
        const drawingCanvas = document.getElementById("drawingCanvas");
        if (drawingCanvas) {
            if (drawing) classifyImg(drawingCanvas).then(results => console.log(results));
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
                let context = drawingCanvas.getContext("2d");
                context.lineWidth = thickness;
                context.lineCap = "round";
                context.strokeStyle = drawingCanvas.getAttribute("penColor");
                context.moveTo(...newCoords);
                context.lineTo(newCoords[0], newCoords[1] + 1);
                context.stroke();
                context.beginPath();
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
}

export default DrawingCanvas;