// import {$,jQuery} from 'jquery';
// // export for other scripts to use
// window.$ = $;
// window.jQuery = jQuery;

export function calculateMouseCoords(event, canvas) {
  const clientX = event?.clientX || event.touches[0]?.clientX;
  const clientY = event?.clientY || event.touches[0]?.clientY;
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
  window.location.assign('../../index.html');
}

export function clearCanvas() {
  let canvas = document.getElementById('DrawingCanvas');
  let context = canvas.getContext("2d");
  context.fillStyle = "rgba(255, 255, 255, 1)";
  context.clearRect(0, 0, canvas.width, canvas.height);
  // context.fillRect(0, 0, canvas.width, canvas.height);
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

/**
 * Uses free online datasets to classify your drawing
 */
export async function AIGuess(classifier) {
  let canvas = document.getElementById("DrawingCanvas");
  let shouldCrop = true;
  let numberOfGuesses = 5;
  // crop the image
  let croppedCanvas = shouldCrop ? await cropContent(canvas) : canvas;
  
  // make a background
  const context = croppedCanvas.getContext("2d");
  const width = croppedCanvas.width;
  const height = croppedCanvas.height;
  const withBackground = document.createElement('canvas');
  withBackground.width = width;
  withBackground.height = height;
  let bgcontext = withBackground.getContext('2d');
  bgcontext.fillStyle = "rgba(255, 255, 255, 1)";
  bgcontext.fillRect(0, 0, withBackground.width, withBackground.height);

  bgcontext.drawImage(croppedCanvas, 0, 0, width, height, 0, 0, width, height);

  return classifier.classify(withBackground, numberOfGuesses, (err, results) => {
    for (let i = 0; i < results.length; i++) {
      // console.log(results[i]);
      const {label, confidence} = results[i];
      let guessElement = document.getElementById(`g${i+1}guess`);
      let confElement = document.getElementById(`g${i+1}conf`);
      guessElement.textContent = label.replaceAll('_',' ');
      confElement.textContent = `${Math.floor(confidence * 10000) / 100}%`;
    }
    withBackground.remove();
    return results;
  });
}

export async function getPrompt() {
  // prepare categories
  let guesses_source = "../../Data/categories.txt";
  return fetch(guesses_source).then(response => response.text()).then(data => {
    let categories = data.split("\r\n");
    let new_prompt = categories[Math.floor(Math.random() * categories.length)];
    return new_prompt;
  });
}
export function openModal(modalName) {
  const modal = document.getElementById(modalName); // loadingModal
  modal.style.display = 'block';
  modal.classList.add('show');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-hidden', 'false');
}

export function closeModal(modalName) {
  const modal = document.getElementById(modalName); // loadingModal
  modal.style.display = 'none';
  modal.classList.remove('show');
  modal.setAttribute('aria-modal', 'false');
  modal.setAttribute('aria-hidden', 'true');
}

export function calculatePoints(guesses, prompt) {
  let points = 0;
  let guessTable = document.getElementById("guessTable");
  let rows = guessTable.rows;
  for (let guess_index = 0; guess_index < guesses.length; guess_index++) {
    let guess = guesses[guess_index];
    let label = guess.label.replaceAll("_", " ");
    let row = rows[guess_index];
    if (label === prompt) {
      points = (5 - guess_index) * 100;
      row.classList.add("table-primary");
    } else {
      row.classList.remove("table-primary");
    }
  }
  return points;
}

export async function getImageAsData() {
  let canvas = document.getElementById("DrawingCanvas");
  return cropContent(canvas).then(result => result.toDataURL());
}

export function saveDoodle(image_data) {
  if (localStorage.getItem("user_data")) {
    let user_data = JSON.parse(localStorage.getItem("user_data"));
    let username = user_data.username;
    if (localStorage.getItem("game")) {
      let game = JSON.parse(localStorage.getItem("game"));
      if (!game?.rounds) {
        game.rounds = [];
      }
      if (game.rounds.length > 0) {
        if (!username in game.rounds[game.rounds.length - 1]) {
          game.rounds[rounds.length - 1][username] = {image: image_data};
        } else {
          game.rounds.push({[username]: {image: image_data}});
        }
      } else {
        game.rounds.push({[username]: {image: image_data}});
      }
      localStorage.setItem("game", JSON.stringify(game));
    }
  } else {
    console.error("Not logged in - cannot save drawing!");
  }
}

export function doMusic() {

  console.log("Music loaded!");
  let introSong = new Audio('../../Sounds/Intro.wav');
  let loopSong = new Audio('../../Sounds/Loop.wav');
  introSong.addEventListener('ended', () => {
    loopSong.play();
  });
  
  loopSong.addEventListener('ended', () => {
    loopSong.currentTime = 0;
    loopSong.play();
  });
  
  introSong.play();
}

export class game {
  canvas = document.getElementById('DrawingCanvas');
  guessButton = document.getElementById("GuessButton");
  colorPicker = document.getElementById("colorPicker");
  doodlenetSelect = document.getElementById("doodlenetSelect");
  mobilenetSelect = document.getElementById("mobilenetSelect");
  darknetSelect = document.getElementById("darknetSelect");
  modelButton = document.getElementById("modelButton");
  thicknessSlider = document.getElementById('thicknessSlider');
  classifier;
  tap = false;
  mouseDown = 0;
  newCoords = [0, 0];
  prevCoords = [0, 0];
  primaryMouseButtonDown = false;
  prompt = "...";
  start_time;
  timer_interval;

  constructor(properties) {
    openModal("loadingModal");
    let classifierLoadInterval = setInterval(() => {
      if (ml5) {
        clearInterval(classifierLoadInterval);
        ml5.imageClassifier('doodlenet', closeModal("loadingModal")).then(result => {
          this.classifier = result;
        });
      } else {
        console.log("waiting");
      }
    }, 1000);
    // doMusic();
    resizeCanvasToDisplaySize();
    this.canvas.setAttribute("penColor", "#000000");
    this.newPrompt();
    if (properties.multiplayer == true) this.runTimer();
  }

  startDraw(event) {
    this.prevCoords = calculateMouseCoords(event, this.canvas);
    this.canvas.setAttribute("penColor", this?.colorPicker?.value || "#000000");
    this.mouseDown = 1;
    this.tap = true;
  }
  continueDraw(event) {
    this.tap = false;
    this.primaryMouseButtonDown = setPrimaryButtonState(event);
    if (this.mouseDown == 1 && (event?.touches || this.primaryMouseButtonDown)) {
      this.newCoords = calculateMouseCoords(event, this.canvas);
      let context = this.canvas.getContext("2d");
      let thickness = 16 * this.thicknessSlider.value * Math.min((window.innerWidth / 650), (window.innerHeight / 850));
      if (event?.targetTouches) {
        if (event.targetTouches.length > 0) {
          thickness = 0.5 * thickness + (1.5 * thickness * event?.targetTouches[0].force);
        }
      }
      context.lineWidth = thickness;
      context.lineCap = "round";
      context.strokeStyle = this.canvas.getAttribute("penColor");
      context.moveTo(...this.prevCoords);
      context.lineTo(...this.newCoords);
      context.stroke();
      context.beginPath();
      this.prevCoords = [...this.newCoords];
    }

  }
  endDraw(event) {
    this.mouseDown = 0;
    if (this.tap) {
      this.newCoords = calculateMouseCoords(event, this.canvas);
      this.tap = false;
      let thickness = 16 * this.thicknessSlider.value * Math.min((window.innerWidth / 650), (window.innerHeight / 850));
      if (event?.targetTouches) {
        if (event.targetTouches.length > 0) {
          thickness = 0.5 * thickness + 1.5 * thickness * event?.targetTouches[0].force;
        }        
      }
      let context = this.canvas.getContext("2d");
      context.lineWidth = thickness;
      context.lineCap = "round";
      context.strokeStyle = this.canvas.getAttribute("penColor");
      context.moveTo(...this.newCoords);
      context.lineTo(this.newCoords[0], this.newCoords[1] + 1);
      context.stroke();
      context.beginPath();
    }
  }
  setColor(event) {
    this.canvas.setAttribute("penColor", event.target.value);
  }

  guess(classifier) {
    AIGuess(classifier);
  }

  newPrompt() {
    let new_prompt_promise = getPrompt();
    let promptElement = document.getElementById("Prompt");
    new_prompt_promise.then(result => {
      promptElement.innerText = `${window.innerWidth > 650 ? 'Prompt: ' : ''}${result}`;
      this.prompt = result;
    });
  }

  clear() {
    clearCanvas();
  }

  runTimer() {
    clearInterval(this.timer_interval);
    this.start_time = new Date().getTime();
    this.startPhase("get new prompt");
    this.timer_interval = setInterval(() => {
      let time = document.getElementById("Time");
      
      let phase_info = this.getPhase();
      if (phase_info.elapsed_time == 0) {
        this.startPhase(phase_info.phase);
      }
      if (time) {
        time.innerHTML = phase_info.remaining_time;
      }
    }, 1000);
  }

  getTimer() {
    const new_time = new Date().getTime();
    const seconds = Math.floor(((new_time - this.start_time) % (1000 * 60)) / 1000);
    return seconds;
  }

  endTimer() {
    clearInterval(timer_interval);
  }

  getPhase() {
    let elapsed = this.getTimer();
    let phases = {
      0: "get new prompt",
      2: "draw",
      17: "done drawing",
      19: "review results",
      24: "PHASE_END",
    };
    let phase_times = Object.keys(phases).map(time => parseInt(time));
    phase_times.sort((a, b) => a - b);
    let cycle_time = Math.max(...phase_times);
    let phase_index = phase_times.length - 1;
    while (phase_times[phase_index] > (elapsed % cycle_time)) {
      phase_index--;
    }
    let current_phase = phases[phase_times[phase_index]];
    return {
      phase: current_phase,
      elapsed_time: (elapsed % cycle_time) - phase_times[phase_index],
      remaining_time: phase_times[phase_index + 1] - (elapsed % cycle_time),
    }
  }

  startPhase(phase) {
    if (phase === "get new prompt") {
      this.clear();
      closeModal("guessModal");
      openModal("promptModal");
      // $("#promptModal").modal("show");
      let dingSound = new Audio(`../../Sounds/bell${Math.floor(Math.random() * 3 + 1)}.wav`);
      dingSound.play();
      getPrompt().then((new_prompt) => {
        let promptModalElement = document.getElementById("Prompt");
        let promptReminder = document.getElementById("PromptReminder");
        if (promptReminder) {
          promptReminder.innerText = new_prompt;
          promptModalElement.innerHTML = `Draw ${new_prompt}`;
        }
        this.prompt = new_prompt;
      });

    } else if (phase === "draw") {
      closeModal("promptModal");
      let promptModal = document.getElementById("promptModal");
    } else if (phase === "done drawing") {
      openModal("doneDrawingModal");
      getImageAsData().then(canvasData => {
        saveDoodle(canvasData);
      });
    } else if (phase === "review results") {
      closeModal("doneDrawingModal");
      openModal("guessModal");
      AIGuess(this.classifier).then((guesses) => {
        let pointsAwardedElement = document.getElementById("pointsAwarded");
        let totalPointsElement = document.getElementById("totalPoints");
        let points = calculatePoints(guesses, this.prompt);
        let game = JSON.parse(localStorage.getItem("game"));
        let user_data = JSON.parse(localStorage.getItem("user_data"));
        // get score and add to it.
        let total_points = game.participants[user_data.username]?.score || 0;
        total_points += points;
        game.participants[user_data.username].score = total_points;

        // save data
        localStorage.setItem("game", JSON.stringify(game));

        // display points
        pointsAwardedElement.innerText = `Points awarded: ${points}`;
        totalPointsElement.innerText = `Total Points: ${total_points}`;
      });
    }
  }
};
