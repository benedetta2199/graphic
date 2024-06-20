"use strict";

import { renderObj } from './renderObj.js';
import { rand } from './utils.js';

const size = 5;
let speed = 1.4;
/*  range X > 110
    range Y 40-145
    range Z < -50
    velocità oscillzione 50 100
*/
export function setObstacle(time){
    const s = rand(1, size);
    const data={
      elemS: s, 
      elemT: [120, rand(48, 130), -rand(10, 30)], 
      elemR: [rand(0,1),rand(0,1),rand(0,1)],
      elemO: rand(-0.5,0.5)
    };

    return data;
}

function u_worldObstacle(time, data) {
  const amplitude = 2.0;  // Ampiezza dell'oscillazione
  const frequency = 0.5;  // Frequenza dell'oscillazione

  const rotationY = Math.PI/2 * Math.sin(time*speed/100 * frequency); // Rotazione oscillatoria (mezza circonferenza)

  const oscillation = Math.sin(time*speed * frequency) * amplitude;
    
    const elemT= data.elemT;
    const elemS= data.elemS;
    const elemR= data.elemR;
    const elemO= data.elemO;
    //var u_world = m4.translation(elemT[0]-(time*speed), elemT[1]+Math.sin(time*speed*elemO), elemT[2]+Math.sin(time*speed*elemO)); // Posiziona l'oggetto 
    var u_world = m4.translation(elemT[0]-(time*speed*2), elemT[1]+Math.sin(time*speed*elemO)+oscillation, elemT[2]+Math.sin(time*speed*elemO)); // Posiziona l'oggetto 
    //var u_world = m4.translation(-35,50,-35); // Posiziona l'oggetto 
    u_world = m4.xRotate(u_world, 0+-elemR[0] );
    u_world = m4.yRotate(u_world, 90-rotationY-elemR[1] );
    u_world = m4.zRotate(u_world, 45+elemR[2] );
    //u_world = m4.yRotate(u_world, elemR*time*speed); // Applica rotazione fissa attorno all'asse Y
    //u_world = m4.xRotate(u_world, -elemR*time*speed); // Applica rotazione attorno all'asse Yworld
    u_world = m4.scale(u_world, elemS, elemS, elemS); // Scala l'oggetto
    //console.log(u_world)
    return u_world;
}

export function renderObstacle(gl, meshProgramInfo, obstacle, time, data) {
    renderObj(gl, meshProgramInfo, obstacle, u_worldObstacle(time, data));
}