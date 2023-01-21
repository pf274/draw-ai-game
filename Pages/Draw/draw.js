function calculateMouseCoords(event, canvas) {
  const clientX = event.clientX || event.touches[0].clientX;
  const clientY = event.clientY || event.touches[0].clientY;
  let rect = canvas.getBoundingClientRect();
  return [clientX - rect.left, clientY - rect.top];
}

function setPrimaryButtonState(event) { // since it's possible to click out of the canvas and still have mouseDown set to more than 0, double check!
  var flags = event.buttons !== undefined ? event.buttons : event.which;
  return (flags & 1) === 1;
}
function setColor(color) {
  let canvas = document.getElementById('DrawingCanvas');
  canvas.setAttribute("penColor", color);
}

window.onload = function() {
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
      context = canvas.getContext("2d");
      let thickness = 4 * document.getElementById('ThicknessSlider').value;
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

  canvas.addEventListener('mousedown', function(event) {
    startDraw(event);
  });
  canvas.addEventListener('touchstart', function(event) {
    startDraw(event);
  });

  canvas.addEventListener('mouseup', function(event) {
    endDraw(event);
  });
  canvas.addEventListener('touchend', function(event) {
    endDraw(event);
  });

  canvas.addEventListener('mousemove', function(event) {
    continueDraw(event);
  });

  canvas.addEventListener('touchmove', function(event) {
    continueDraw(event);
  });
}

function clearCanvas() {
  let canvas = document.getElementById('DrawingCanvas');
  let context = canvas.getContext("2d");
  context.fillStyle = "rgba(255, 255, 255, 0.75)";
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.beginPath();
}

/**
 * Redirects to the home page.
**/
function goToHome() {
  console.log("Going to home page...")
  window.location.assign('../../index.html');
}

function setSliderPosition() {
  let slider = document.getElementById('ThicknessSlider');
  let canvas = document.getElementById('DrawingCanvas');
  let rect = canvas.getBoundingClientRect();
  console.log(rect.left, rect.top, rect.width, rect.height);

  slider.style.left = rect.left + rect.height / 2 + 10;
  slider.style.top = rect.top + rect.width / 2 - 12;
}

addEventListener("resize", (event) => { setSliderPosition() });