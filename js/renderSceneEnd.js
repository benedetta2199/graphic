"use strict";

import { setupCameraAndLight } from './cameraAndLightSetupEnd.js';
import { renderCloud, setCloud } from './cloudEnd.js';
import { renderObj, u_worldElica, u_worldFoto, u_worldPlane, u_worldWorld } from './renderObjEnd.js';
import { degToRad, rand } from './utils.js';
import { zFar, zNear } from "./utils.js";

  const clouds = [setCloud(rand(3,6),0, {min:0, max:40})];
  let i=0;
  
export let posCamTarget = [0,0,0];
export let posCamPos = [0,0,0];
export let posPlane = [0,0,0];



/**
 * Renderizza la scena.
 * @param {WebGLRenderingContext} gl - Contesto WebGL.
 * @param {Object} meshProgramInfo - Informazioni sul programma shader.
 * @param {Array} planeParts - Parti dell'oggetto piano.
 * @param {Array} elicaParts - Parti dell'elica.
 * @param {Array} cameraPosition - Posizione della telecamera.
 * @param {Array} cameraTarget - Punto di mira della telecamera.
 * @param {Array} objOffset - Offset dell'oggetto.
 */
export function renderScene(gl, meshProgramInfo, parts, cP, cT, objOffset) {

  let cPtemp = [];
  let cameraTarget = [];

  function render(time) {
    for(let j=0; j<3; j++){
      cPtemp[j] = cP[j] + posCamPos[j];
      cameraTarget[j] =  cT[j] + posCamTarget[j];
    }
    const cameraPosition = m4.addVectors(cameraTarget, cPtemp);
    time *= 0.006; // Converte il tempo in secondi (velocità dell'elica)
    i++;

    // Ridimensiona il canvas WebGL alla dimensione dello schermo
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    /***PERSONALIZZA */
    //const cameraTarget = [camPos.x, camPos.y, camPos.z];
    //const cameraPosition = m4.addVectors(cameraTarget, [camTarget.x, camTarget.y, camTarget.z])

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
      //[60,60,30] -[60,450,450]
      u_lightDirection: m4.normalize([60,60,30]), // Direzione della luce
      u_view: view,
      u_projection: projection,
      u_viewWorldPosition: cameraPosition, // Posizione della telecamera nella scena
    };

    // Utilizza il programma shader specificato
    gl.useProgram(meshProgramInfo.program);
    webglUtils.setUniforms(meshProgramInfo, sharedUniforms);


    /**AREOPLANO */
    let u_world = u_worldPlane(gl.canvas.width, gl.canvas.height, time); 
    u_world = m4.translate(u_world, posPlane[0], posPlane[1], posPlane[2]);
    //u_world = m4.translate(u_world, ...objOffset);
    renderObj(gl,meshProgramInfo, parts.plane, u_world);
    /**ELICA */
    //u_world_elica = m4.translate(u_world_elica, ...objOffset); // Prima applica la traslazione per centrare l'oggetto
    renderObj(gl,meshProgramInfo, parts.elica, u_worldElica(u_world, time));

    /**MONDO */
    renderObj(gl,meshProgramInfo, parts.world, u_worldWorld(time));

    /**FOTO */
    renderObj(gl,meshProgramInfo, parts.foto, u_worldFoto(u_world));

     /** CLOUD */
    if(i%300==0){
      clouds.push(setCloud(rand(3,6),time, {min:-20, max:40}));
      if(clouds.length>20){
        clouds.shift();
      }
    }
    clouds.forEach(c => {
      renderCloud(gl,meshProgramInfo, parts.cube, time, c);
    });    
    
    // Richiede il rendering della scena alla prossima animazione frame
    requestAnimationFrame(render);
  }

  // Avvia il ciclo di rendering della scena
  requestAnimationFrame(render);
}
