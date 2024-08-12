"use strict";

import { beginLightCamera, setPlaneClipping } from "./utils.js";

/**
 * Configura la posizione della telecamera e le luci per la scena.
 * @param {Object} extents - Estremi dell'oggetto (min e max).
 * @returns {Object} - Oggetto con informazioni sulla telecamera e le luci.
 */
export function setupCameraAndLight(extents) {
  // Calcola la distanza tra i massimi e minimi degli estremi dell'oggetto
  const range = m4.subtractVectors(extents.max, extents.min);
  // Calcola la distanza della telecamera dall'oggetto basata sulla dimensione dell'oggetto
  const radius = m4.length(range) * 1.5;
  // Piani di clipping per la telecamera
  const zNear = radius / 20;
  const zFar = radius * 6;
  setPlaneClipping(zNear, zFar);

  // Calcola l'offset dell'oggetto per centrarlo nella scena
  const objOffset = m4.scaleVector(m4.addVectors(extents.min, m4.scaleVector(range, 0.5)), -1);

  // Posizione del punto di mira della telecamera
  const cameraTarget = [0, 85, 0];
  //const cameraTarget = [-100, -35, 100];
  // Posizione della telecamera
  const cameraPosition = m4.addVectors(cameraTarget, [120, -100, 0]);
  //const cameraPosition = m4.addVectors(cameraTarget, [200, -100, 0]);

  // Punto di mira della luce
  const lightTarget = [20, 40, -40]; //posizione del mondo
  // Posizione della luce
  const lightPosition = [60, 120, 30];

  beginLightCamera(lightPosition, lightTarget, cameraPosition, cameraTarget);
}