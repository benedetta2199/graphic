"use strict";

import { beginLightCamera, setPlaneClipping } from "./utils.js";

/**
 * Calcola i parametri comuni per la configurazione della telecamera e delle luci.
 * @param {Object} extents - Estremi dell'oggetto (min e max).
 * @param {Array} cameraTargetOffset - Offset della posizione della telecamera rispetto al target.
 * @param {Array} lightTarget - Posizione del punto di mira della luce.
 * @param {Array} lightPosition - Posizione della luce.
 * @returns {Object} - Oggetto con le posizioni calcolate per la telecamera e le luci.
 */
function calculateCameraAndLightParams(extents, cameraTarget, cameraTargetOffset, lightTarget, lightPosition) {
  const range = m4.subtractVectors(extents.max, extents.min);
  const radius = m4.length(range) * 1.5;
  const zNear = radius / 20;
  const zFar = radius * 6;
  setPlaneClipping(zNear, zFar);

  //const objOffset = m4.scaleVector(m4.addVectors(extents.min, m4.scaleVector(range, 0.5)), 1);
  
  const cameraPosition = m4.addVectors(cameraTarget, cameraTargetOffset);  // Posizione della telecamera

  return {lightPosition, lightTarget, cameraPosition, cameraTarget,};
}

/**
 * Configura la telecamera e le luci per la scena (Versione 1).
 * @param {Object} extents - Estremi dell'oggetto (min e max).
 */
export function setupCameraAndLight(extents) {
  const params = calculateCameraAndLightParams(
    extents,
    [0, 85, 0],
    [0, 0, m4.length(m4.subtractVectors(extents.max, extents.min)) * 1.5], // cameraTargetOffset
    [0, 20, -50], // lightTarget
    [0, 100, 61] // lightPosition
  );
  beginLightCamera(params.lightPosition, params.lightTarget, params.cameraPosition, params.cameraTarget);
}

/**
 * Configura la telecamera e le luci per la scena (Versione 2).
 * @param {Object} extents - Estremi dell'oggetto (min e max).
 */
export function setupCameraAndLightEnd(extents) {
  const params = calculateCameraAndLightParams(
    extents,
    [0, 85, 0],
    [120, -100, 0], // cameraTargetOffset
    [20, 40, -40], // lightTarget
    [60, 120, 60] // lightPosition
  );
  beginLightCamera(params.lightPosition, params.lightTarget, params.cameraPosition, params.cameraTarget);
}