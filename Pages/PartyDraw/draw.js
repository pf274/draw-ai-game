import {
  calculateMouseCoords,
  clearCanvas,
  setPrimaryButtonState,
  resizeCanvasToDisplaySize,
  AIGuess,
  newPrompt,
  startLoading,
  endLoading,
  calculatePoints,
  getImageAsData,
  saveDoodle,
  doMusic,
} from '../FreeDraw/helper_functions.js';

/**
 * When the page loads up, set up the drawing experience!
 */
window.onload = function () {
  // get elements
  let canvas = document.getElementById('DrawingCanvas');
  // let guessButton = document.getElementById("GuessButton");
  // let colorPicker = document.getElementById("colorPicker");
  // let doodlenetSelect = document.getElementById("doodlenetSelect");
  // let mobilenetSelect = document.getElementById("mobilenetSelect");
  // let darknetSelect = document.getElementById("darknetSelect");
  // let modelButton = document.getElementById("modelButton");


  // prepare AI model
  startLoading();
  let classifier = ml5.imageClassifier('doodlenet', modelReady); // 'mobilenet', 'darknet', 'doodlenet'
  function modelReady() { // loading the AI model
    // console.log('ml5 version:', ml5.version);
    // console.log("Model Ready!");
    endLoading();
  }

  // play music
  doMusic();

  // prepare prompt
  newPrompt();
  
  // prepare canvas
  resizeCanvasToDisplaySize();
  let context = canvas.getContext("2d");
  canvas.setAttribute("penColor", "#000000");

  // prepare drawing variables
  let mouseDown = 0;
  let newCoords = [0, 0];
  let prevCoords = [0, 0];
  let primaryMouseButtonDown = false;

  // define the drawing functions
  let tap = false;

  function startDraw(event) {
    prevCoords = calculateMouseCoords(event, canvas);
    // canvas.setAttribute("penColor", document.getElementById("colorPicker")?.value);
    canvas.setAttribute("penColor", "#000000");
    mouseDown = 1;
    tap = true;
  }

  function continueDraw(event) {
    primaryMouseButtonDown = setPrimaryButtonState(event);
    tap = false;
    if (mouseDown == 1 && (event?.touches || primaryMouseButtonDown)) {
      newCoords = calculateMouseCoords(event, canvas);
      context = canvas.getContext("2d");
      let thickness = 16 * document.getElementById('thicknessSlider').value * Math.min((window.innerWidth / 650), (window.innerHeight / 850));
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
    if (tap) {
      newCoords = calculateMouseCoords(event, canvas);
      tap = false;
      let thickness = 16 * document.getElementById('thicknessSlider').value * Math.min((window.innerWidth / 650), (window.innerHeight / 850));
      if (event?.targetTouches) {
        if (event.targetTouches.length > 0) {
          thickness = 0.5 * thickness + 1.5 * thickness * event?.targetTouches[0].force;
        }        
      }
      context.lineWidth = thickness;
      context.lineCap = "round";
      context.strokeStyle = canvas.getAttribute("penColor");
      context.moveTo(...newCoords);
      context.lineTo(newCoords[0], newCoords[1] + 1);
      context.stroke();
      context.beginPath();
    }
  }

  function setColor(event) {
    canvas.setAttribute("penColor", event.target.value);
  }

  // Start Draw Event Listeners
  canvas.addEventListener('mousedown', function (event) {
    startDraw(event);
  });
  canvas.addEventListener('touchstart', function (event) {
    startDraw(event);
  });

  // Continue Draw Event Listeners
  canvas.addEventListener('mousemove', function (event) {
    continueDraw(event);
  });
  canvas.addEventListener('touchmove', function (event) {
    continueDraw(event);
  });

  // End Draw Event Listeners
  canvas.addEventListener('mouseup', function (event) {
    endDraw(event);
  });
  canvas.addEventListener('touchend', function (event) {
    endDraw(event);
  });

  // Timer
  let start_time;
  let timer_interval;
  let bpm = 100;
  let interval_duration = 1000;
  console.log(interval_duration);
  function runTimer() {
    clearInterval(timer_interval);
    start_time = new Date().getTime();
    startPhase("get new prompt");
    timer_interval = setInterval(() => {
      let time = document.getElementById("Time");
      time.innerHTML = getPhase().remaining_time;
      let phase_info = getPhase();
      if (phase_info.elapsed_time == 0) {
        startPhase(phase_info.phase);
      }
    }, interval_duration);
  }

  function getTimer() {
    const new_time = new Date().getTime();
    const seconds = Math.floor(((new_time - start_time) % (1000 * 60)) / 1000);
    return seconds;
  }
  
  function endTimer() {
    clearInterval(timer_interval);
  }

  function getPhase() {
    let elapsed = getTimer();
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

  async function startPhase(phase) {
    if (phase === "get new prompt") {
      clearCanvas();
      $("#guessModal").modal("hide");
      $("#promptModal").modal("show");
      let promptModalElement = document.getElementById("Prompt");
      let promptReminder = document.getElementById("PromptReminder");
      let new_prompt = await newPrompt();
      let dingSound = new Audio(`../../Sounds/bell${Math.floor(Math.random() * 3 + 1)}.wav`);
      dingSound.play();
      promptReminder.innerText = new_prompt;
      promptModalElement.innerHTML = `Draw ${new_prompt}`;
      promptReminder.innerText = new_prompt;
    } else if (phase === "draw") {
      $("#promptModal").modal("hide");
    } else if (phase === "done drawing") {
      $("#doneDrawingModal").modal("show");
      getImageAsData().then(canvasData => {
        saveDoodle(canvasData);
      });
    } else if (phase === "review results") {
      $("#doneDrawingModal").modal("hide");
      $("#guessModal").modal("show");
      let guessing = AIGuess(classifier);
      let pointsAwardedElement = document.getElementById("pointsAwarded");
      let totalPointsElement = document.getElementById("totalPoints");
      let promptReminder = document.getElementById("PromptReminder");
      let prompt = promptReminder.innerText;
      guessing.then((guesses) => {
        let points = calculatePoints(guesses, prompt);
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
      })
      
    }
  }
  runTimer();
}

addEventListener("resize", (event) => {
  resizeCanvasToDisplaySize()
});
