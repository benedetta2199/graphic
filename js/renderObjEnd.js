"use strict";

import { posRelX} from './mousePosition.js';
import { degToRad } from './utils.js';

export function renderObj(gl,meshProgramInfo, part, u_world, color =null) {
  for (const { bufferInfo, material } of part) {
    webglUtils.setBuffersAndAttributes(gl, meshProgramInfo, bufferInfo);
    /*if(color){
      webglUtils.setUniforms(meshProgramInfo, { u_world: u_world, u_color: material.diffuse }, material);
  
    }else{
      webglUtils.setUniforms(meshProgramInfo, { u_world: u_world }, material);
    }*/
      webglUtils.setUniforms(meshProgramInfo, { u_world: u_world }, material);
    webglUtils.drawBufferInfo(gl, bufferInfo);
  }
}

export function u_worldPlane(width, height, time){
  let u_world = m4.translation(0, 120+Math.sin(time*0.2)*2, posRelX + width*0.03); 
  u_world = m4.xRotate(u_world, degToRad(20)); // Rotazione attorno all'asse X
  u_world = m4.yRotate(u_world, degToRad(25)); // Rotazione attorno all'asse X

  u_world = m4.scale(u_world, 1.5,1.5,1.5);
  u_world = m4.zRotate(u_world, degToRad(-30)); // Applica rotazione attorno all'asse Z
  return u_world;
}

export function u_worldElica(u_world_plane, time){
  const u_world_elica = m4.xRotate(u_world_plane, -time); // Infine applica la rotazione
  return u_world_elica;
}

export function u_worldFoto(u_world_plane){
  const prop = 0.5;
  //let u_world_world = m4.translation(0, -(prop*2.5), -(prop*4)); // Posiziona l'oggetto world in basso
  let u_world = u_world_plane;
  //u_world = m4.translation(u_world,[0,10,0]);
  u_world = m4.zRotate(u_world_plane, degToRad(10));
  //u_world = m4.translation(u_world, 0,0.2,0);
  /*m4.translation(39, 111, 0); // Posiziona l'oggetto world in basso
  u_world_world = m4.yRotate(u_world_world, degToRad(-2));
  u_world_world = m4.xRotate(u_world_world, degToRad(2));
  u_world_world = m4.scale(u_world_world, prop, prop, prop); // Scala l'oggetto orizzontalmente (asse X)*/

return u_world;
}


export function u_worldWorld(time){
    const prop = 5;
    //let u_world_world = m4.translation(0, -(prop*2.5), -(prop*4)); // Posiziona l'oggetto world in basso
    let u_world_world = m4.translation(0, -(prop*2.5), -(prop*10)); // Posiziona l'oggetto world in basso
    //u_world_world = m4.yRotate(u_world_world, 2); // Applica rotazione attorno all'asse Y
    //u_world_world = m4.scale(u_world_world, 20, 20, 15); // Scala l'oggetto orizzontalmente (asse X)
    //const fixedRotationAngle = ; // Angolo fisso di 45 gradi
    u_world_world = m4.xRotate(u_world_world, degToRad(45)); // Applica rotazione fissa attorno all'asse Y
    u_world_world = m4.yRotate(u_world_world, time/20); // Applica rotazione attorno all'asse Y
    u_world_world = m4.scale(u_world_world, prop*4, prop*3, prop*4+0.1); // Scala l'oggetto orizzontalmente (asse X)

  return u_world_world;
}

export function u_worldCloud(time, y, z, scale, rotation){
  const acc= time*(3.5-scale);
  let u_world = m4.translation(100-acc, y, z); // Posiziona l'oggetto world in basso
  u_world = m4.xRotate(u_world, degToRad(rotation)); // Applica rotazione fissa attorno all'asse X
  u_world = m4.scale(u_world, scale, scale, scale); // Scala l'oggetto orizzontalmente (asse X)

return u_world;
}

