export function calculateMouseCoords(event, canvas) {
  const clientX = event.clientX || event.touches[0].clientX;
  const clientY = event.clientY || event.touches[0].clientY;
  let rect = canvas.getBoundingClientRect();
  // console.log(clientX);
  // console.log(clientY);
  // console.log(rect)
  return [clientX - rect.left, clientY - rect.top];
}

/**
 * Returns whether the left mouse button is down
 */
export function setPrimaryButtonState(event) { // since it's possible to click out of the canvas and still have mouseDown set to more than 0, double check!
  var flags = event.buttons !== undefined ? event.buttons : event.which;
  return (flags & 1) === 1;
}
/**
 * Sets the color of the pen
 */
export function setColor(color) {
  let canvas = document.getElementById('DrawingCanvas');
  canvas.setAttribute("penColor", color);
}
/**
 * Redirects to the home page.
 */
export function goToHome() {
  console.log("Going to home page...")
  window.location.assign('../../index.html');
}

export function clearCanvas() {
  let canvas = document.getElementById('DrawingCanvas');
  let context = canvas.getContext("2d");
  context.fillStyle = "rgba(255, 255, 255, 1)";
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.beginPath();
}

export function resizeCanvasToDisplaySize() {
  console.log("Resized!");
  let canvas = document.getElementById('DrawingCanvas');
  let slider = document.getElementById('ThicknessSlider');
  // Lookup the size the browser is displaying the canvas in CSS pixels.
  const displayWidth = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;

  // Check if the canvas is not the same size.
  const needResize = (canvas.width !== displayWidth ||
    canvas.height !== displayHeight);

  if (needResize) {
    // Make the canvas the same size
    canvas.width = displayWidth;
    canvas.height = displayHeight;
    slider.width = displayWidth;
    // gl.viewport(0, 0, displayWidth, displayHeight);
    clearCanvas();
  }
}