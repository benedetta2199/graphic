"use strict";

import { renderCloud, setCloud } from './cloud.js';
import { checkCollisionObstacle, setListener } from './mousePosition.js';
import { renderObj, u_worldElica, u_worldFoto, u_worldPlane, u_worldWorld } from './renderObj.js';
import { renderCoin, renderObstacle, setCoin, setObstacle } from './collectibles.js';
import { degToRad, rand } from './utils.js';
import { zFar, zNear } from "./utils.js";

  const clouds = [setCloud(rand(4,9),0)];
  let obstacles = [setObstacle(0)];
  const coins = [setCoin(rand(1,6), 0)];
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
    time *= 0.006; // Converte il tempo in secondi (velocità dell'elica)
    i++;

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
    //u_world = m4.translate(u_world, ...objOffset);
    renderObj(gl,meshProgramInfo, parts.plane, u_world);
    /**ELICA */
    //u_world_elica = m4.translate(u_world_elica, ...objOffset); // Prima applica la traslazione per centrare l'oggetto
    renderObj(gl,meshProgramInfo, parts.elica, u_worldElica(u_world, time));

    /**MONDO */
    renderObj(gl,meshProgramInfo, parts.world, u_worldWorld(time));

    /**OSTACOLO */
    if(i%1200==0){
      obstacles.push(setObstacle(time));
      if(obstacles.length>5){
        obstacles.shift();
      }
    }
    const newObstacle = []
    obstacles.forEach(c => {
      //checkCollisionObstacle(c.elemT);
      const isCollision = renderObstacle(gl,meshProgramInfo, parts.obstacle, time, c);
      if(!isCollision){
        newObstacle.push(c);
      }
      //console.log(meshProgramInfo)
      // Estrai la posizione dal centro del bounding box
      //const bf = parts.obstacle[0].bufferInfo.a_position;
      //console.log(bf)
      /*const centerX = (boundingBox.min[0] + boundingBox.max[0]) / 2;
      const centerY = (boundingBox.min[1] + boundingBox.max[1]) / 2;
      const centerZ = (boundingBox.min[2] + boundingBox.max[2]) / 2;
      const center = m4.transformPoint(u_world, [centerX, centerY, centerZ]);

      // Calcola il raggio approssimato (utilizzando la metà della diagonale del bounding box)
      const radius = m4.length(m4.subtractVectors(boundingBox.max, boundingBox.min)) / 2;
      
      console.log(centerX+" "+centerY+" "+centerZ+" "+radius);*/
    }); 
    obstacles=newObstacle;
    

    /**MONETE */
    if(i%900==0){
      coins.push(setCoin(rand(1,6),time));
      if(coins.length>8){
        coins.shift();
      }
    }
    coins.forEach(c => {
      renderCoin(gl,meshProgramInfo, parts.coin, time, c);
    }); 
    //renderObstacle(gl,meshProgramInfo, parts.coin, time, d);


     /** CLOUD */
    if(i%600==0){
      clouds.push(setCloud(rand(3,9),time));
      if(clouds.length>8){
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
