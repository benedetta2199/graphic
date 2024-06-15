"use strict";

/**
 * Configura la posizione della telecamera e le luci per la scena.
 * @param {WebGLRenderingContext} gl - Contesto WebGL.
 * @param {Object} extents - Estremi dell'oggetto (min e max).
 * @returns {Object} - Oggetto con informazioni sulla telecamera e le luci.
 */
export function setupCameraAndLight(gl, extents) {
  const range = m4.subtractVectors(extents.max, extents.min);
  const objOffset = m4.scaleVector(
    m4.addVectors(
      extents.min,
      m4.scaleVector(range, 0.5)),
    -1
  );
  const cameraTarget = [10, -8, 30];
  const radius = m4.length(range) * 1.5;
  const cameraPosition = m4.addVectors(cameraTarget, [12, 12, radius]);
  const zNear = radius / 100;
  const zFar = radius * 3;

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
    time *= 0.006;  // convert to seconds -> modifica la velocità dell'elica

    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.DEPTH_TEST);

    const fieldOfViewRadians = degToRad(60);
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const projection = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);

    const up = [0, 1, 0];
    const camera = m4.lookAt(cameraPosition, cameraTarget, up);
    const view = m4.inverse(camera);

    const sharedUniforms = {
      u_lightDirection: m4.normalize([0, 3, 0]),
      u_view: view,
      u_projection: projection,
      u_viewWorldPosition: cameraPosition,
    };

    gl.useProgram(meshProgramInfo.program);
    webglUtils.setUniforms(meshProgramInfo, sharedUniforms);

    // Render plane parts
    let u_world = m4.identity();
    u_world = m4.translate(u_world, ...objOffset);

    for (const { bufferInfo, material } of planeParts) {
      webglUtils.setBuffersAndAttributes(gl, meshProgramInfo, bufferInfo);
      webglUtils.setUniforms(meshProgramInfo, { u_world }, material);
      webglUtils.drawBufferInfo(gl, bufferInfo);
    }

    // Render elica parts with rotation
    let u_world_elica = m4.xRotation(-time);  // Rotate elica around X axis
    u_world_elica = m4.translate(u_world_elica, ...objOffset);

    for (const { bufferInfo, material } of elicaParts) {
      webglUtils.setBuffersAndAttributes(gl, meshProgramInfo, bufferInfo);
      webglUtils.setUniforms(meshProgramInfo, { u_world: u_world_elica }, material);
      webglUtils.drawBufferInfo(gl, bufferInfo);
    }

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}