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
  const cameraTarget = [0, 20, -2];
  // Calcola la distanza della telecamera dall'oggetto basata sulla dimensione dell'oggetto
  const radius = m4.length(range) * 1.5;
  // Posizione della telecamera
  const cameraPosition = m4.addVectors(cameraTarget, [0, 10, radius]);
  // Piani di clipping per la telecamera
  const zNear = radius / 100;
  const zFar = radius * 3;

  // Restituisce un oggetto con le informazioni sulla telecamera e le luci
  return { cameraPosition, cameraTarget, objOffset, zNear, zFar };
}

/**
 * Converte gradi in radianti.
 * @param {number} deg - Valore in gradi.
 * @returns {number} - Valore in radianti.
 */
function degToRad(deg) {
  return deg * Math.PI / 180;
}

/**
 * Renderizza la scena.
 * @param {WebGLRenderingContext} gl - Contesto WebGL.
 * @param {Object} meshProgramInfo - Informazioni sul programma shader.
 * @param {Array} planeParts - Parti dell'oggetto piano.
 * @param {Array} elicaParts - Parti dell'elica.
 * @param {Array} cameraPosition - Posizione della telecamera.
 * @param {Array} cameraTarget - Punto di mira della telecamera.
 * @param {Array} objOffset - Offset dell'oggetto.
 * @param {number} zNear - Piano di clipping vicino.
 * @param {number} zFar - Piano di clipping lontano.
 */
export function renderScene(gl, meshProgramInfo, planeParts, elicaParts, cameraPosition, cameraTarget, objOffset, zNear, zFar) {
  function render(time) {
    time *= 0.006;  // Converte il tempo in secondi (velocità dell'elica)

    // Ridimensiona il canvas WebGL alla dimensione dello schermo
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.DEPTH_TEST);

    // Angolo di campo visivo della telecamera e prospettiva
    const fieldOfViewRadians = degToRad(60);
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const projection = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);

     // Posizione della telecamera e vista della scena
    const up = [0, 1, 0];
    const camera = m4.lookAt(cameraPosition, cameraTarget, up);
    const view = m4.inverse(camera);

    // Parametri uniformi condivisi per i shader
    const sharedUniforms = {
      u_lightDirection: m4.normalize([0, 25, 5]), // Direzione della luce
      u_view: view,
      u_projection: projection,
      u_viewWorldPosition: cameraPosition, // Posizione della telecamera nella scena
    };

    // Utilizza il programma shader specificato
    gl.useProgram(meshProgramInfo.program);
    webglUtils.setUniforms(meshProgramInfo, sharedUniforms);

    // Renderizza le parti dell'oggetto piano
    let u_world = m4.translation(-40, 20, -40);
    let u_world_elica = u_world; //in modo che l'elica sia posizionata correttamente rispetto all'aereo
    u_world = m4.translate(u_world, ...objOffset);

    for (const { bufferInfo, material } of planeParts) {
      webglUtils.setBuffersAndAttributes(gl, meshProgramInfo, bufferInfo);
      webglUtils.setUniforms(meshProgramInfo, { u_world }, material);
      webglUtils.drawBufferInfo(gl, bufferInfo);
    }

    // Renderizza le parti dell'elica con rotazione intorno all'asse X
    u_world_elica = m4.translate(u_world_elica, ...objOffset); // Prima applica la traslazione per centrare l'oggetto
    u_world_elica = m4.xRotate(u_world_elica, -time); // Infine applica la rotazione

    for (const { bufferInfo, material } of elicaParts) {
      webglUtils.setBuffersAndAttributes(gl, meshProgramInfo, bufferInfo);
      webglUtils.setUniforms(meshProgramInfo, { u_world: u_world_elica }, material);
      webglUtils.drawBufferInfo(gl, bufferInfo);
    }

    // Richiede il rendering della scena alla prossima animazione frame
    requestAnimationFrame(render);
  }
  // Avvia il ciclo di rendering della scena
  requestAnimationFrame(render);
}