// import {
//   resizeCanvasToDisplaySize,
//   game,
// } from '../../local_modules/helper_functions.js';


document.addEventListener('DOMContentLoaded', function() {
  let gameInstance = new game({multiplayer: true});


  // get elements
  let canvas = document.getElementById('DrawingCanvas');

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

  addEventListener("resize", (event) => {
    resizeCanvasToDisplaySize();
  });
});
