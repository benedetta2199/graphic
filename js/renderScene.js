"use strict";

import { setListener} from './mousePosition.js';
import { renderObj, u_worldElica, u_worldPlane, u_worldWorld } from './renderObj.js';
import { degToRad } from './utils.js';

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
export function renderScene(gl, meshProgramInfo, planeParts, elicaParts, worldParts, cameraPosition, cameraTarget, objOffset, zNear, zFar) {
  
  setListener(gl)

  function render(time) {
    time *= 0.006; // Converte il tempo in secondi (velocità dell'elica)

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
      u_lightDirection: m4.normalize([20,100,100]), // Direzione della luce
      u_view: view,
      u_projection: projection,
      u_viewWorldPosition: cameraPosition, // Posizione della telecamera nella scena
    };

    // Utilizza il programma shader specificato
    gl.useProgram(meshProgramInfo.program);
    webglUtils.setUniforms(meshProgramInfo, sharedUniforms);


    /**AREOPLANO */
    let u_world = u_worldPlane(gl.canvas.width, gl.canvas.height, zNear, zFar, time); 
    //u_world = m4.translate(u_world, ...objOffset);
    renderObj(gl,meshProgramInfo, planeParts, u_world);
    /**ELICA */
    //u_world_elica = m4.translate(u_world_elica, ...objOffset); // Prima applica la traslazione per centrare l'oggetto
    renderObj(gl,meshProgramInfo, elicaParts, u_worldElica(u_world, time));
    
    /**MONDO */
    renderObj(gl,meshProgramInfo, worldParts, u_worldWorld(time));
    
    // Richiede il rendering della scena alla prossima animazione frame
    requestAnimationFrame(render);
  }

  // Avvia il ciclo di rendering della scena
  requestAnimationFrame(render);
}
