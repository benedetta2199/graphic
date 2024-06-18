"use strict";

import { canvasToWorld} from './mousePosition.js';
import { degToRad } from './utils.js';

export function renderObj(gl,meshProgramInfo, part, u_world) {
  for (const { bufferInfo, material } of part) {
    webglUtils.setBuffersAndAttributes(gl, meshProgramInfo, bufferInfo);
    webglUtils.setUniforms(meshProgramInfo, { u_world: u_world }, material);
    webglUtils.drawBufferInfo(gl, bufferInfo);
  }
}

export function u_worldPlane(width, height, zNear, zFar, time){
  // Movimento dell'aereo in base alla posizione del mouse
  const worldMouseY = -canvasToWorld(height, zNear, zFar);
  //posizione relativa dell'aereo per visualizzazione smartphone
  const posRel = width/56;
  // Imposta la posizione dell'aereo in base alla posizione del mouse e della tastiera
  let u_world = m4.translation(-posRel, worldMouseY, -posRel); 
  u_world = m4.xRotate(u_world, 0.1); // Rotazione attorno all'asse X
  const oscillationAngle = Math.sin(time) * degToRad(3); // Oscillazione sinusoidale
  u_world = m4.zRotate(u_world, oscillationAngle); // Applica rotazione attorno all'asse Z
  //console.log(u_world[12]+" "+u_world[13]+" "+u_world[14]);
  return u_world;
}

export function u_worldElica(u_world_elica, time){
  u_world_elica = m4.xRotate(u_world_elica, -time); // Infine applica la rotazione
  return u_world_elica;
}


export function u_worldWorld(time){
    const prop = 5;
    //let u_world_world = m4.translation(0, -(prop*2.5), -(prop*4)); // Posiziona l'oggetto world in basso
    let u_world_world = m4.translation(0, -(prop*2.5), -(prop*10)); // Posiziona l'oggetto world in basso
    //u_world_world = m4.yRotate(u_world_world, 2); // Applica rotazione attorno all'asse Y
    //u_world_world = m4.scale(u_world_world, 20, 20, 15); // Scala l'oggetto orizzontalmente (asse X)
    //const fixedRotationAngle = ; // Angolo fisso di 45 gradi
    u_world_world = m4.xRotate(u_world_world, degToRad(75)); // Applica rotazione fissa attorno all'asse Y
    u_world_world = m4.yRotate(u_world_world, time/20); // Applica rotazione attorno all'asse Y
    u_world_world = m4.scale(u_world_world, prop*4, prop*3, prop*4); // Scala l'oggetto orizzontalmente (asse X)

  return u_world_world;
}

export function u_worldCloud(time, y, z, scale, rotation){
  const acc= time*(3.5-scale);
  let u_world = m4.translation(100-acc, y, z); // Posiziona l'oggetto world in basso
  u_world = m4.xRotate(u_world, degToRad(rotation)); // Applica rotazione fissa attorno all'asse X
  u_world = m4.scale(u_world, scale, scale, scale); // Scala l'oggetto orizzontalmente (asse X)

return u_world;
}

