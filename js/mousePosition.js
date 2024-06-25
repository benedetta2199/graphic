// mouseHandler.js
"use strict";

import { incrementPoint, zFar, zNear } from "./utils.js";
import { endGame } from "./endGame.js";

export let mouseY = 200; // Variabile per memorizzare la posizione Y del mouse
export let posRelX = window.innerWidth/56;
export let height;

//let isClick=false; // Per tenere traccia dell'interval
let intervalId = null;

export function setListener(gl){
  // Aggiungi il listener per l'evento mousemove
  gl.canvas.addEventListener('mousemove', updateMousePosition);
  window.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', (event) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        clearInterval(intervalId);
        intervalId = null;
    }
  })

  //smarphone
  const buttonUp = document.getElementById('button-up');
  const buttonDown = document.getElementById('button-down');
  buttonDown.addEventListener('touchstart', (e) => {
    increment();
    intervalId = setInterval(increment, 20);
  });

  buttonUp.addEventListener('touchstart', (e) => {
    decrement();
    intervalId = setInterval(decrement, 20);
  });

  buttonUp.addEventListener('touchend', () => {clearInterval(intervalId);});
  buttonDown.addEventListener('touchend', () => {clearInterval(intervalId);});
}

export function checkCollisionObstacle(pos) {
  const y=-canvasToWorld(height);

  if(pos.y<y+9 && pos.y>y-9){
    if(pos.x< -posRelX+11.9 && pos.x> -posRelX){
      endGame();
    }
  }
  
  /*// Coordinate e raggio della sfera
  const [sx, sy] = sphere.position;
  const sr = sphere.radius;

  // Coordinate e dimensioni del parallelepipedo (aereo)
  const [bx, by] = box.position;
  const [bw, bh] = box.size;

  // Trova il punto più vicino sulla scatola alla sfera
  const nearestX = Math.max(bx, Math.min(sx, bx + bw));
  const nearestY = Math.max(by, Math.min(sy, by + bh));

  // Calcola la distanza tra il punto più vicino e il centro della sfera
  const deltaX = sx - nearestX;
  const deltaY = sy - nearestY;

  // Se la distanza è minore o uguale al raggio della sfera, c'è una collisione
  return (deltaX * deltaX + deltaY * deltaY) <= (sr * sr);*/

  /*if(posRelX==x){
    if(y>mouseY-5 && y<mouseY+5){
      console.log("boom")
    }
  }*/
}

export function checkCollisionCoin(pos) {
  let flag= false;
  const y=-canvasToWorld(height);

  if(pos.y<y+9 && pos.y>y-9){
    if(pos.x< -posRelX+11 && pos.x> -posRelX){
      flag=true;
      incrementPoint();
    }
  }
  return flag;
  
  /*// Coordinate e raggio della sfera
  const [sx, sy] = sphere.position;
  const sr = sphere.radius;

  // Coordinate e dimensioni del parallelepipedo (aereo)
  const [bx, by] = box.position;
  const [bw, bh] = box.size;

  // Trova il punto più vicino sulla scatola alla sfera
  const nearestX = Math.max(bx, Math.min(sx, bx + bw));
  const nearestY = Math.max(by, Math.min(sy, by + bh));

  // Calcola la distanza tra il punto più vicino e il centro della sfera
  const deltaX = sx - nearestX;
  const deltaY = sy - nearestY;

  // Se la distanza è minore o uguale al raggio della sfera, c'è una collisione
  return (deltaX * deltaX + deltaY * deltaY) <= (sr * sr);*/

  /*if(posRelX==x){
    if(y>mouseY-5 && y<mouseY+5){
      console.log("boom")
    }
  }*/
}

/**
 * Listener per tracciare la posizione del mouse
 * @param {MouseEvent} event - Evento mousemove
 */
export function updateMousePosition(event) {
  const canvas = event.target;
  const rect = canvas.getBoundingClientRect();
  mouseY = event.clientY - rect.top;
}

function increment() {mouseY++;}

function decrement() {mouseY--;}

/**
 * Funzione per convertire le coordinate del mouse da canvas a coordinate del mondo
 * @param {number} y - Posizione Y del mouse
 * @param {number} canvasHeight - Altezza del canvas
 * @param {number} zNear - Piano di clipping vicino
 * @param {number} zFar - Piano di clipping lontano
 * @returns {number} - Posizione Y in coordinate del mondo
 */
export function canvasToWorld(canvasHeight,coord=null) {
  let y;
  height = canvasHeight;
  if(coord){
    y=coord
  }else{
    y = mouseY;
  }
  const ndcY = (y / canvasHeight) * 2 - 1; // Converti da pixel a coordinate NDC (Normalized Device Coordinates)
  const viewY = ndcY * (zFar - zNear) / 2; // Converti da NDC a coordinate del mondo
  const constViewY = clamp(viewY, -132, -50);
  return constViewY;
}

/**
 * Limita il valore della posizione Y in modo che non esca dallo schermo
 * @param {number} y - Posizione Y del mondo
 * @param {number} minY - Valore minimo di Y
 * @param {number} maxY - Valore massimo di Y
 * @returns {number} - Posizione Y limitata
 */
function clamp(value, min, max) {
    const cl = Math.max(min, Math.min(max, value));
  return cl;
}

/**
 * Listener per tracciare la pressione dei tasti freccia
 * @param {KeyboardEvent} event - Evento keydown
 */
export function handleKeyDown(event) {
    const passo = 3;
    if (event.key === "ArrowUp") {
      //mouseY =  mouseY-passo; // Incrementa la posizione Y
      decrement();
      if (intervalId === null) {
        intervalId = setInterval(decrement, 20);
      }
    } else if (event.key === "ArrowDown") {
      increment();
      if (intervalId === null) {
        intervalId = setInterval(increment, 20);
    }
      //mouseY = mouseY+passo; // Decrementa la posizione Y
    }
    //mouseY = clamp(mouseY, -57, 35); // Limita la posizione Y
}