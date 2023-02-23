import {
  calculateMouseCoords,
  setPrimaryButtonState,
  resizeCanvasToDisplaySize,
  AIGuess,
  newPrompt,
} from './helper_functions.js';

/**
 * When the page loads up, set up the drawing experience!
 */
window.onload = function () {
  // get elements
  let canvas = document.getElementById('DrawingCanvas');
  let guessButton = document.getElementById("GuessButton");
  // prepare AI model
  const classifier = ml5.imageClassifier('doodlenet', modelReady); // 'mobilenet', 'darknet', 'doodlenet'
  function modelReady() { // loading the AI model
    console.log('ml5 version:', ml5.version);
    console.log("Model Ready!");
  }
  // prepare prompt
  newPrompt();
  
  // prepare canvas
  resizeCanvasToDisplaySize();
  let context = canvas.getContext("2d");
  canvas.setAttribute("penColor", "#000000");

  // prepare drawing variables
  let mouseDown = 0;
  let newCoords = [0, 0];
  let prevCoords = [0, 0];
  let primaryMouseButtonDown = false;

  // define the drawing functions

  function startDraw(event) {
    prevCoords = calculateMouseCoords(event, canvas);
    mouseDown = 1;
  }

  function continueDraw(event) {
    primaryMouseButtonDown = setPrimaryButtonState(event);
    if (mouseDown == 1 && (event?.touches || primaryMouseButtonDown)) {
      newCoords = calculateMouseCoords(event, canvas);
      context = canvas.getContext("2d");
      let thickness = 16 * document.getElementById('thicknessSlider').value;
      if (event?.targetTouches) {
        thickness = 0.5 * thickness + 1.5 * thickness * event?.targetTouches[0].force;
      }
      context.lineWidth = thickness;
      context.lineCap = "round";
      context.strokeStyle = canvas.getAttribute("penColor");
      context.moveTo(...prevCoords);
      context.lineTo(...newCoords);
      context.stroke();
      context.beginPath();
      prevCoords = [...newCoords];
    }

  }
  function endDraw(event) {
    mouseDown = 0;
  }

  // let guessInterval = setInterval(function () {
  //   console.log(document.getElementById('thicknessSlider').value);
  // }, 1000)

  // Start Draw Event Listeners
  canvas.addEventListener('mousedown', function (event) {
    startDraw(event);
  });
  canvas.addEventListener('touchstart', function (event) {
    startDraw(event);
  });

  // Continue Draw Event Listeners
  canvas.addEventListener('mousemove', function (event) {
    continueDraw(event);
  });
  canvas.addEventListener('touchmove', function (event) {
    continueDraw(event);
  });

  // End Draw Event Listeners
  canvas.addEventListener('mouseup', function (event) {
    endDraw(event);
  });
  canvas.addEventListener('touchend', function (event) {
    endDraw(event);
  });
  guessButton.addEventListener('click', function (event) {
    AIGuess(classifier);
  })
}

addEventListener("resize", (event) => {
  resizeCanvasToDisplaySize()
});

