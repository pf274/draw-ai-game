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
  // Look up the size the browser is displaying the canvas in CSS pixels.
  const displayWidth = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;

  // Check if the canvas is not the same size.
  const needResize = (canvas.width !== displayWidth ||
    canvas.height !== displayHeight);

  if (needResize) {
    // Make the canvas the same size
    canvas.width = displayWidth;
    canvas.height = displayHeight;
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
  let guesses = [];
  return classifier.classify(shouldCrop ? await cropContent(canvas): canvas, 5, (err, results) => {
    guesses = results;
    for (let i = 0; i < 5; i++) {
      console.log(results[i]);
      const {label, confidence} = results[i];
      let guessElement = document.getElementById(`g${i+1}guess`);
      let confElement = document.getElementById(`g${i+1}conf`);
      guessElement.textContent = label.replaceAll('_',' ');
      confElement.textContent = `${Math.floor(confidence * 10000) / 100}%`;
    }
    return guesses;
  });
}

export function newPrompt() {
  // prepare categories
  let guesses_source = "../../Data/categories.txt";
  return fetch(guesses_source).then(response => response.text()).then(data => {
    let categories = data.split("\r\n");
    let new_prompt = categories[Math.floor(Math.random() * categories.length)];
    // prompt.innerText = `Draw ${new_prompt}`;
    return new_prompt;
  });
}
export function startLoading() {
  const modal = document.getElementById('loadingModal');
  modal.style.display = 'block';
  modal.classList.add('show');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-hidden', 'false');
}

export function endLoading() {
  const modal = document.getElementById('loadingModal');
  modal.style.display = 'none';
  modal.classList.remove('show');
  modal.setAttribute('aria-modal', 'false');
  modal.setAttribute('aria-hidden', 'true');
}

export function calculatePoints(guesses, prompt) {
  let points = 0;
  for (let guess_index = 0; guess_index < guesses.length; guess_index++) {
    let guess = guesses[guess_index];
    let label = guess.label.replaceAll("_", " ");
    if (label === prompt) {
      points = (5 - guess_index) * 100;
    }
  }
  return points;
}