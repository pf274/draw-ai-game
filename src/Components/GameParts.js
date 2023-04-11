import rawCategoryData from '../Data/categories.txt';

export const EVENTS = {
  GameEnd: "game_end",        // the host disconnects or ends the game
  GameStart: "game_start",    // the host starts the game
  DeclareJoin: "declare_join",      // a user joins a game
  DeclareHost: "declare_host",      // a user declares themselves as host
  GameLeave: "leave_game",    // a user leaves a game (not the host)
}
export const ROLES = {
  Host: "host",
  Participant: "participant"
}


async function cropContent(canvas) { // takes in the drawing canvas and outputs a cropped canvas
  const context = canvas.getContext("2d", { willReadFrequently: true });
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

      if ((pixelData[0] + pixelData[1] + pixelData[2] < 3 * 255 - tolerance) && pixelData[3] > 10) {

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

export async function AIGuess(classifier) {
  const drawingCanvas = document.getElementById("drawingCanvas");
  if (!drawingCanvas) return;
  // console.log("Calculating guesses");
  if (classifier.current) {
    const shouldCrop = true;
    const numberOfGuesses = 10;
    // crop it
    const croppedCanvas = shouldCrop ? await cropContent(drawingCanvas) : drawingCanvas;

    // create a background
    const width = croppedCanvas.width;
    const height = croppedCanvas.height;
    const withBackground = document.createElement('canvas');
    withBackground.width = width;
    withBackground.height = height;

    const bgcontext = withBackground.getContext('2d');
    bgcontext.fillStyle = "rgba(255, 255, 255, 1)";
    bgcontext.fillRect(0, 0, withBackground.width, withBackground.height);

    // combine background and foreground
    bgcontext.drawImage(croppedCanvas, 0, 0, width, height, 0, 0, width, height);

    const results = await classifier.current.classify(withBackground, numberOfGuesses);
    const pictureData = withBackground.toDataURL();
    withBackground.remove();
    croppedCanvas.remove();
    return { results: [...results], picture: pictureData };
  }
}

export function generateCode(n) {
  const characters = Array(n);
  // debugger;
  for (let index = 0; index < n; index++) {
    characters[index] = (Math.floor(Math.random() * 36)).toString(36).toUpperCase();
    while (['I', "1", "0", "O", "5", "S"].includes(characters[index])) {
      characters[index] = (Math.floor(Math.random() * 36)).toString(36).toUpperCase();
    }
  }
  return characters.join("");
}
export function addParticipantRow(myParticipants, data) {
  return myParticipants.map(row => row.username).includes(data.username) === false ? [...myParticipants, data] : myParticipants;
}
export function removeParticipantRow(myParticipants, data) {
  return myParticipants.map(row => row.username).includes(data.username) === true ? myParticipants.filter((row) => row.username !== data.username) : myParticipants;
}
export async function numberOfCategories() {
  let allCategories = await fetch(rawCategoryData).then(result => result.text());
  allCategories = allCategories.split("\n").map((item) => Capitalize(item.trim()));
  return allCategories.length;
}
export function Capitalize(text) {
  return text.toLowerCase().split(' ')
    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
    .join(' ');
}

function compareGuessToPrompt(guess, thePrompt) {
  const formattedGuess = Capitalize(guess.replace(/_/g, " "));
  const formattedPrompt = Capitalize(thePrompt.replace(/_/g, " "));
  return formattedGuess === formattedPrompt;
}

export function calculatePoints(guesses, thePrompt) {
  let matchingIndex = 10; // if none match, then when points are calculated, 10 will result in zero points.

  for (let index = 0; index < guesses.length; index++) {
    const guess = guesses[index];
    if (compareGuessToPrompt(guess.label, thePrompt)) {
      matchingIndex = index;
    }
  }
  return (10 - matchingIndex) * 100;
}

export async function newPrompt(index) {
  let allCategories = await fetch(rawCategoryData).then(result => result.text());
  allCategories = allCategories.split("\n").map((item) => Capitalize(item.trim()));
  return allCategories[index];
}
export function clearCanvas() {
  const drawingCanvas = document.getElementById("drawingCanvas");
  if (drawingCanvas) {
    const context = drawingCanvas.getContext("2d");
    context.fillStyle = "rgba(255, 255, 255, 1)";
    context.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
  }
}

export const phases = [
  {
    time: 2,
    name: "get new prompt"
  },
  {
    time: 15,
    name: "draw"
  },
  {
    time: 3,
    name: "done drawing"
  },
  {
    time: 2,
    name: "review results"
  }
];



/*
TODO: IMPLEMENT THIS
import React, { useRef } from 'react';

function FullscreenButton() {
  const elementRef = useRef(null);

function handleFullscreenButtonClick() {
  if (elementRef.current) {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      elementRef.current.requestFullscreen();
    }
  }
}

  return (
    <button onClick={handleFullscreenButtonClick}>
      {document.fullscreenElement ? 'Exit Fullscreen' : 'Fullscreen'}
    </button>
    <div ref={elementRef}>
      </div>
      );
    }

    
*/