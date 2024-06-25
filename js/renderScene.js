"use strict";

import { renderCloud, setCloud } from './cloud.js';
import { checkCollisionObstacle, setListener } from './mousePosition.js';
import { renderObj, u_worldElica, u_worldFoto, u_worldPlane, u_worldWorld } from './renderObj.js';
import { renderCoin, renderObstacle, setCoin, setObstacle } from './collectibles.js';
import { degToRad, isPaused, rand, speed, timing, alphaEnable, zFar, zNear } from './utils.js';

  const clouds = [setCloud(rand(4,9),0)];
  const obstacles = [setObstacle(0)];
  let coins = [setCoin(0, 0, rand(3,8), rand(45,90))];
  let i=0;


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
export function renderScene(gl, meshProgramInfo, parts, cameraPosition, cameraTarget, objOffset) {
  
  setListener(gl);

  function render(time) {
    if (isPaused) {
      return;
    }

    time *= 0.006;
    i++;

    // Ridimensiona il canvas WebGL alla dimensione dello schermo
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    
    gl.enable(gl.DEPTH_TEST);

    if(alphaEnable){
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    }else{
      gl.disable(gl.BLEND); 
    }


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
    let u_world = u_worldPlane(gl.canvas.width, gl.canvas.height, zNear, zFar, time); 
    renderObj(gl,meshProgramInfo, parts.plane, u_world);
    /**ELICA */
    renderObj(gl,meshProgramInfo, parts.elica, u_worldElica(u_world, time));
    /**MONDO */
    renderObj(gl,meshProgramInfo, parts.world, u_worldWorld(time));

    /**OSTACOLO */
    if(i%timing.obstacle==0){
      obstacles.push(setObstacle(time));
      if(obstacles.length>5000/(timing.obstacle*speed.obstacle)){
        obstacles.shift();
      }
    }
    obstacles.forEach(data => {
      renderObstacle(gl,meshProgramInfo, parts.obstacle, time, data);
    });   

    /**MONETE */
    if(i%timing.coin==0){
      const n = rand(1,6);
      const ampiezza = rand(3,8);
      const yRot = rand(45,90);
      const y = rand(40,120);
      for(let i=0; i<n; i++){
        coins.push(setCoin(time, i, y, ampiezza, yRot));
      }
      if(coins.length>30000/(timing.coin*speed.coin)){
        coins.shift();
      }
    }

    const newCoin = [];
    coins.forEach(data => {
      const isCollision = renderCoin(gl,meshProgramInfo, parts.coin, time, data);
      if(!isCollision){
        newCoin.push(data);
      }
    }); 
    coins=newCoin;


     /** CLOUD */
    if(i%timing.cloud==0){
      clouds.push(setCloud(rand(3,9),time));
      if(clouds.length>5000/(timing.cloud*speed.cloud)){
        clouds.shift();
      }
    }
    clouds.forEach(data => {
      renderCloud(gl,meshProgramInfo, parts.cube, time, data);
    });    
    
    // Richiede il rendering della scena alla prossima animazione frame
    requestAnimationFrame(render);
  }

  // Avvia il ciclo di rendering della scena
  requestAnimationFrame(render);
}
