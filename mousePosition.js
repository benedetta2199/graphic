// mouseHandler.js
"use strict";

export let mouseY = 0; // Variabile per memorizzare la posizione Y del mouse

/**
 * Listener per tracciare la posizione del mouse
 * @param {MouseEvent} event - Evento mousemove
 */
export function updateMousePosition(event) {
  const canvas = event.target;
  const rect = canvas.getBoundingClientRect();
  mouseY = event.clientY - rect.top;
}

/**
 * Funzione per convertire le coordinate del mouse da canvas a coordinate del mondo
 * @param {number} y - Posizione Y del mouse
 * @param {number} canvasHeight - Altezza del canvas
 * @param {number} zNear - Piano di clipping vicino
 * @param {number} zFar - Piano di clipping lontano
 * @returns {number} - Posizione Y in coordinate del mondo
 */
export function canvasToWorld(canvasHeight, zNear, zFar) {
  const y = mouseY;
  const ndcY = (y / canvasHeight) * 2 - 1; // Converti da pixel a coordinate NDC (Normalized Device Coordinates)
  const viewY = ndcY * (zFar - zNear) / 2; // Converti da NDC a coordinate del mondo
  return viewY;
}
