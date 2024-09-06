"use strict";

import { incrementPoint, isGame, zFar, zNear, audioContext, soundBuffer, isSound } from "./utils.js";
import { endGame } from "./endGame.js";

export let mouseY = window.innerWidth/5;
export let posRelX = window.innerWidth / 55;
export let height;

let yMin = window.innerWidth / 35.8;
let yMax = window.innerWidth / 3.1;

addEventListener("resize", () => {
  yMin = window.innerWidth / 35.8;
  yMax = window.innerWidth / 3.1;
});

let intervalId = null;

/**
 * Imposta i listener per il movimento del mouse e la pressione dei tasti.
 * @param {WebGLRenderingContext} gl - Contesto WebGL per cui impostare i listener.
 */
export function setListener(gl) {
  gl.canvas.addEventListener('mousemove', updateMousePosition);
  window.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);

  // Controlli per smartphone
  const buttonUp = document.getElementById('button-up');
  const buttonDown = document.getElementById('button-down');

  buttonDown.addEventListener('touchstart', () => startInterval(increment));
  buttonUp.addEventListener('touchstart', () => startInterval(decrement));

  buttonUp.addEventListener('touchend', clearMouseInterval);
  buttonDown.addEventListener('touchend', clearMouseInterval);
}

/**
 * Verifica la collisione con un ostacolo. Se c'è collisione, termina il gioco e riproduce il suono di game over.
 * @param {Object} pos - La posizione dell'ostacolo.
 */
export function checkCollisionObstacle(pos) {
  if (isGame && collision(pos, 0.9)) {
    playSound('gameover');
    endGame();
  }
}

/**
 * Verifica la collisione con una moneta. Se c'è collisione, incrementa il punteggio e riproduce il suono della moneta.
 * @param {Object} pos - La posizione della moneta.
 * @returns {boolean} - Ritorna true se c'è una collisione, altrimenti false.
 */
export function checkCollisionCoin(pos) {
  if (isGame && collision(pos, 0.9)) {
    playSound('coin');
    incrementPoint();
    return true;
  }
  return false;
}

function collision(pos, offset) {
  const y = -canvasToWorld(height);
  return (pos.y < y + 9 - offset && pos.y > y - 9 + offset) && (pos.x < -posRelX + 11 + offset && pos.x > -posRelX - 4);
}

/**
 * Aggiorna la posizione Y del mouse in base all'evento mousemove.
 * @param {MouseEvent} event - L'evento mousemove.
 */
export function updateMousePosition(event) {
  const rect = event.target.getBoundingClientRect();
  mouseY = event.clientY - rect.top;
}

function increment() { mouseY = Math.min(mouseY + 1, yMax); }
function decrement() { mouseY = Math.max(mouseY - 1, yMin); }

/**
 * Converte le coordinate del mouse da canvas a coordinate del mondo.
 * @param {number} canvasHeight - L'altezza del canvas.
 * @returns {number} - La posizione Y in coordinate del mondo.
 */
export function canvasToWorld(canvasHeight) {
  height = canvasHeight;
  const ndcY = (mouseY / canvasHeight) * 2 - 1;
  return clamp(ndcY * (zFar - zNear) / 2.5, -125, -48);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function handleKeyDown(event) {
  if (event.key === "ArrowUp") startInterval(decrement);
  else if (event.key === "ArrowDown") startInterval(increment);
}

function handleKeyUp(event) {
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') clearMouseInterval();
}

function startInterval(callback) {
  if (intervalId === null) intervalId = setInterval(callback, 20);
}

function clearMouseInterval() {
  clearInterval(intervalId);
  intervalId = null;
}

function playSound(type) {
  if (isSound && soundBuffer[type]) {
    const source = audioContext.createBufferSource();
    source.buffer = soundBuffer[type];
    source.connect(audioContext.destination);
    source.start(0);
  }
}
