import './DrawingCanvas.css';
import {useEffect, useRef} from 'react';
function DrawingCanvas() {
    const resizing = useRef(false);
    let resizeTimeout = useRef();

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
    useEffect(() => {
        // when page loads, set an event listener
        window.addEventListener('resize', startResize);
        finishResize();
        return () => {
            window.removeEventListener('resize', startResize);
        }
    }, [])
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