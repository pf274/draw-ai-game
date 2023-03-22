import { resizeCanvasToDisplaySize, openModal, closeModal, game } from '../../local_modules/helper_functions.js';

let gameInstance = new game({multiplayer: false});

// get elements
let canvas = document.getElementById('DrawingCanvas');
let guessButton = document.getElementById("GuessButton");
let colorPicker = document.getElementById("colorPicker");
let doodlenetSelect = document.getElementById("doodlenetSelect");
let mobilenetSelect = document.getElementById("mobilenetSelect");
let darknetSelect = document.getElementById("darknetSelect");
let modelButton = document.getElementById("modelButton");
let NewPromptButton = document.getElementById("NewPromptButton");
let ClearCanvasButton = document.getElementById("ClearCanvasButton");

// Start Draw Event Listeners
canvas.addEventListener('mousedown', function (event) {
  gameInstance.startDraw(event);
});
canvas.addEventListener('touchstart', function (event) {
  gameInstance.startDraw(event);
});

// Continue Draw Event Listeners
canvas.addEventListener('mousemove', function (event) {
  gameInstance.continueDraw(event);
});
canvas.addEventListener('touchmove', function (event) {
  gameInstance.continueDraw(event);
});

// End Draw Event Listeners
canvas.addEventListener('mouseup', function (event) {
  gameInstance.endDraw(event);
});
canvas.addEventListener('touchend', function (event) {
  gameInstance.endDraw(event);
});

// other listeners
guessButton.addEventListener('click', function (event) {
  gameInstance.guess(gameInstance.classifier);
})
colorPicker.addEventListener('change', function (event) {
  gameInstance.setColor(event);
});
NewPromptButton.addEventListener('click', function(event) {
  gameInstance.newPrompt();
});
ClearCanvasButton.addEventListener('click', function(event) {
  gameInstance.clear();
});

// AI Models
doodlenetSelect.addEventListener('click', function (event) {
  openModal("loadingModal");
  gameInstance.classifier = ml5.imageClassifier('doodlenet', closeModal("loadingModal"));
  modelButton.innerText = "doodlenet";
  gameInstance.guess(classifier);
});
mobilenetSelect.addEventListener('click', function (event) {
  openModal("loadingModal");
  gameInstance.classifier = ml5.imageClassifier('mobilenet', closeModal("loadingModal"));
  modelButton.innerText = "mobilenet";
  gameInstance.guess(classifier);
});
darknetSelect.addEventListener('click', function (event) {
  openModal("loadingModal");
  gameInstance.classifier = ml5.imageClassifier('darknet', closeModal("loadingModal"));
  modelButton.innerText = "darknet";
  gameInstance.guess(classifier);
});

addEventListener("resize", (event) => {
  resizeCanvasToDisplaySize();
});