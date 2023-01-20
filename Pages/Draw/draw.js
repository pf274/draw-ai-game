function calculateMouseCoords(event, canvas) {
  let rect = canvas.getBoundingClientRect();
  return [event.clientX - rect.left, event.clientY - rect.top];
}

function setPrimaryButtonState(event) { // since it's possible to click out of the canvas and still have mouseDown set to more than 0, double check!
  var flags = event.buttons !== undefined ? event.buttons : event.which;
  return (flags & 1) === 1;
}

window.onload = function() {
  let canvas = document.getElementById('DrawingCanvas');
  let context = canvas.getContext("2d");
  let mouseDown = 0;
  let newCoords = [0, 0];
  let prevCoords = [0, 0];
  let primaryMouseButtonDown = false;

  context.fillStyle = "#FFFFFF";
  context.fillRect(0, 0, canvas.width, canvas.height);

  
  canvas.addEventListener('mousedown', function(event) {
    prevCoords = calculateMouseCoords(event, canvas);
    mouseDown = 1;
  });

  canvas.addEventListener('mouseup', function(event) {
    prevCoords = calculateMouseCoords(event, canvas);
    mouseDown = 0;
  });

  canvas.addEventListener('mousemove', function(event) {
    primaryMouseButtonDown = setPrimaryButtonState(event);
    if (mouseDown > 1 && primaryMouseButtonDown) {
      newCoords = calculateMouseCoords(event, canvas);
      context = canvas.getContext("2d");
      context.fillStyle = "#000000";
      context.moveTo(...prevCoords);
      context.lineTo(...newCoords);
      context.stroke();
      prevCoords = [...newCoords];
    } else if (mouseDown == 1) {
      prevCoords = calculateMouseCoords(event, canvas);
      mouseDown++;
    }
  })
}

function clearCanvas() {
  let canvas = document.getElementById('DrawingCanvas');
  let context = canvas.getContext("2d");
  context.fillStyle = "#FFFFFF";
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