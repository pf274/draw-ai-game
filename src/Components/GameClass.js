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
    let drawingCanvas = document.getElementById("drawingCanvas");
    if (!drawingCanvas) return;
    // console.log("Calculating guesses");
    if (classifier.current) {
        let shouldCrop = true;
        let numberOfGuesses = 10;
        // crop it
        let croppedCanvas = shouldCrop ? await cropContent(drawingCanvas) : drawingCanvas;
        
        // create a background
        const width = croppedCanvas.width;
        const height = croppedCanvas.height;
        const withBackground = document.createElement('canvas');
        withBackground.width = width;
        withBackground.height = height;
        
        let bgcontext = withBackground.getContext('2d');
        bgcontext.fillStyle = "rgba(255, 255, 255, 1)";
        bgcontext.fillRect(0, 0, withBackground.width, withBackground.height);
        
        // combine background and foreground
        bgcontext.drawImage(croppedCanvas, 0, 0, width, height, 0, 0, width, height);
      
        let results = await classifier.current.classify(withBackground, numberOfGuesses);
        // setGuesses([...results]);
        // console.log("Calculated guesses");
        // console.log(`Guesses: ${JSON.stringify([...results], 0, 2)}`);
        let pictureData = withBackground.toDataURL();
        withBackground.remove();
        croppedCanvas.remove();
        return {results: [...results], picture: pictureData};
    }
}

export function generateCode() {
  return ((36 ** 3) + Math.floor(Math.random() * (34 * 36**3 + 35 * 36**2 + 35 * 36 + 35))).toString(36).toUpperCase();
}
export function addParticipantRow(myParticipants, data) {
  if (myParticipants.map(row => row.username).includes(data.username) === false) {
      return [...myParticipants, data];
  } else {
      return myParticipants;
  }
}
export function removeParticipantRow(myParticipants, data) {
  if (myParticipants.map(row => row.username).includes(data.username) === true) {
      return myParticipants.filter((row) => row.username !== data.username);
  } else {
      return myParticipants;
  }
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
  let formattedGuess = Capitalize(guess.replace(/_/g, " "));
  let formattedPrompt = Capitalize(thePrompt.replace(/_/g, " "));
  return formattedGuess === formattedPrompt;
}

export function calculatePoints(guesses, thePrompt) {
  let matchingIndex = 10; // if none match, then when points are calculated, 10 will result in zero points.

  for (let index = 0; index < guesses.length; index++) {
      let guess = guesses[index];
      if (compareGuessToPrompt(guess.label, thePrompt)) {
          matchingIndex = index;
      }
  }
  let points = (10 - matchingIndex) * 100;
  return points;
}

export async function newPrompt(index) {
  let allCategories = await fetch(rawCategoryData).then(result => result.text());
  allCategories = allCategories.split("\n").map((item) => Capitalize(item.trim()));
  let newCategory = allCategories[index];
  return newCategory;
}
export function clearCanvas() {
  const drawingCanvas = document.getElementById("drawingCanvas");
  if (drawingCanvas) {
      let context = drawingCanvas.getContext("2d");
      context.fillStyle = "rgba(255, 255, 255, 1)";
      context.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
  }
}