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

export async function cropContent(canvas) { // takes in the drawing canvas and outputs a cropped canvas
  const context = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const tolerance = 20; // the tolerance to detect the difference between the background and the drawing
  const imageData = context.getImageData(0, 0, width, height).data;
  const bounds = {
    x: [width, 0],
    y: [height, 0]
  }
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const i = (y * width + x) * 4; // get the beginning of the pixel's data
      const pixelData = imageData.slice(i, i + 4);
      if (pixelData[0] + pixelData[1] + pixelData[2] < 3 * 255 - tolerance) {
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

/**
 * Uses free online datasets to classify your drawing
 */
export async function AIGuess(classifier) {
  let canvas = document.getElementById("DrawingCanvas");
  let shouldCrop = true;
  let image = new Image();
  image.src = canvas.toDataURL();
  classifier.classify(shouldCrop ? await cropContent(canvas): canvas, 10, (err, results) => {
    let output = document.getElementById("top_guess");
    // console.log(results);
    let text = results.map(guess => `${guess.label.replaceAll("_", " ")} ${Math.floor(guess.confidence * 10000) / 100}%`).join("\n");
    output.innerText = text;
  });
}