import {
  calculateMouseCoords,
  setPrimaryButtonState,
  clearCanvas,
  setSliderPosition
} from './helper_functions.js';

/**
 * When the page loads up, set up the drawing experience!
 */
window.onload = function() {
  const classifier = ml5.imageClassifier('doodlenet', modelReady); // 'mobilenet', 'darknet', 'doodlenet'
  function modelReady() { // loading the AI model
    console.log('ml5 version:', ml5.version);
    console.log("Model Ready!");
  }
  setSliderPosition();
  let canvas = document.getElementById('DrawingCanvas');
  let context = canvas.getContext("2d");
  canvas.setAttribute("penColor", "#000000");
  let mouseDown = 0;
  let newCoords = [0, 0];
  let prevCoords = [0, 0];
  let primaryMouseButtonDown = false;
  clearCanvas();

  function startDraw(event) {
    prevCoords = calculateMouseCoords(event, canvas);
    mouseDown = 1;
  }

  function continueDraw(event) {
    primaryMouseButtonDown = setPrimaryButtonState(event);
    if (mouseDown == 1 && (event?.touches || primaryMouseButtonDown)) {
      newCoords = calculateMouseCoords(event, canvas);
      console.log(newCoords);
      context = canvas.getContext("2d");
      let thickness = 16 * document.getElementById('ThicknessSlider').value;
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

  /**
   * Uses free online datasets to classify your drawing
   */
  async function AIGuess() {
    let image = new Image();
    image.src = canvas.toDataURL();
    classifier.classify(canvas, 10, (err, results) => {
      let output = document.getElementById("top_guess");
      // console.log(results);
      let text = results.map(guess => `${guess.label.replaceAll("_", " ")} ${Math.floor(guess.confidence * 10000) / 100}%`).join("\n");
      output.innerText = text;
    });
  }

  // AI Guessing every 250 milliseconds
  let guessInterval = setInterval(function() {
    AIGuess();
  }, 250)

  // Start Draw Event Listeners
  canvas.addEventListener('mousedown', function(event) {
    startDraw(event);
  });
  canvas.addEventListener('touchstart', function(event) {
    startDraw(event);
  });

  // Continue Draw Event Listeners
  canvas.addEventListener('mousemove', function(event) {
    continueDraw(event);
  });
  canvas.addEventListener('touchmove', function(event) {
    continueDraw(event);
  });

  // End Draw Event Listeners
  canvas.addEventListener('mouseup', function(event) {
    endDraw(event);
  });
  canvas.addEventListener('touchend', function(event) {
    endDraw(event);
  });
}



addEventListener("resize", (event) => { setSliderPosition() });

