import './DrawingCanvas.css';
import {useEffect, useRef, useCallback} from 'react';

const DrawingCanvas = ({setShowSpinner, modifyDraw = false}) => {
    let drawing = useRef(false);
    let prevCoords = useRef([0, 0]);
    let resizeTimeout = useRef();
    let tap = useRef(false);
    let context = useRef();
    let drawTimeout = useRef();
    useEffect(() => {
        drawing.current = modifyDraw;
    }, [modifyDraw])
    
    const cleanup = useCallback(() => {
        const drawingCanvas = document.getElementById("drawingCanvas");
        window.removeEventListener('resize', startResize);
        if (drawingCanvas) {
            console.log("cleaned up");
            window.removeEventListener('mousedown', startDraw);
            window.removeEventListener('touchstart', startDraw);
            window.removeEventListener('mousemove', continueDraw);
            window.removeEventListener('touchmove', continueDraw);
            window.removeEventListener('mouseup', endDraw);
            window.removeEventListener('touchend', endDraw);
        }
    }, []);
    const initialize = useCallback(() => {
        const drawingCanvas = document.getElementById("drawingCanvas");
        console.log("intialized");
        window.addEventListener('resize', startResize);
        window.addEventListener('mousedown', startDraw, { passive: true });
        window.addEventListener('touchstart', startDraw, { passive: true });
        window.addEventListener('mousemove', continueDraw, { passive: true });
        window.addEventListener('touchmove', continueDraw, { passive: true });
        window.addEventListener('mouseup', endDraw, { passive: true });
        window.addEventListener('touchend', endDraw, { passive: true });
    }, []);
    useEffect(() => {
        finishResize();
        drawing.current = false;
        tap.current = false;
        initialize();
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
        setShowSpinner(false);
    }
    function startResize() {
        let canvas = document.getElementById("drawingCanvas");
        let canvasContainer = document.getElementById("canvasContainer");
        canvas.width = canvasContainer.offsetWidth;
        canvas.height = 0;
        canvas.style.border = "0px";
        setShowSpinner(true);
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(finishResize, 100);
    }
    function startDraw(event) {
        const drawingCanvas = document.getElementById("drawingCanvas");
        if (drawingCanvas) {
            drawing.current = true;
            const colorPicker = document.getElementById("colorPicker");
            prevCoords = calculateMouseCoords(event, drawingCanvas);
            drawingCanvas?.setAttribute("penColor", colorPicker?.value || "#000000");
            tap.current = true;
        }
    }
    function continueDraw(event) {
        const drawingCanvas = document.getElementById("drawingCanvas");
        if (drawingCanvas) {
            if (drawing.current) {
                tap.current = false;
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
        if (drawingCanvas) {
            drawing.current = false;
            if (tap.current) {
                const thicknessSlider = document.getElementById("thicknessSlider");
                let newCoords = calculateMouseCoords(event, drawingCanvas);
                tap.current = false;
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
            const clientX = event?.clientX || event?.touches[0]?.clientX || 0;
            const clientY = event?.clientY || event?.touches[0]?.clientY || 0;
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