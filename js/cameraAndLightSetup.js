"use strict";

/**
 * Configura la posizione della telecamera e le luci per la scena.
 * @param {WebGLRenderingContext} gl - Contesto WebGL.
 * @param {Object} extents - Estremi dell'oggetto (min e max).
 * @returns {Object} - Oggetto con informazioni sulla telecamera e le luci.
 */
export function setupCameraAndLight(gl, extents) {
  // Calcola la distanza tra i massimi e minimi degli estremi dell'oggetto
  const range = m4.subtractVectors(extents.max, extents.min);

  // Calcola l'offset dell'oggetto per centrarlo nella scena
  const objOffset = m4.scaleVector(
    m4.addVectors(
      extents.min,
      m4.scaleVector(range, 0.5)),
    -1
  );

  // Posizione del punto di mira della telecamera
  //const cameraTarget = [-5, 20, 0];
  const cameraTarget = [0, 85, 0];
  // Calcola la distanza della telecamera dall'oggetto basata sulla dimensione dell'oggetto
  const radius = m4.length(range) * 1.5;
  // Posizione della telecamera
  const cameraPosition = m4.addVectors(cameraTarget, [0, 0, radius]);
  // Piani di clipping per la telecamera
  const zNear = radius / 20;
  const zFar = radius * 6;

  // Restituisce un oggetto con le informazioni sulla telecamera e le luci
  return { cameraPosition, cameraTarget, objOffset, zNear, zFar };
}