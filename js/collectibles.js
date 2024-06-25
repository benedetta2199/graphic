"use strict";

import { checkCollisionCoin, checkCollisionObstacle } from './mousePosition.js';
import { renderObj } from './renderObj.js';
import { degToRad, rand, speed } from './utils.js';

/*OBSTACLE*/
const sizeO = 5;
/*  range X > 110
    range Y 40-145 ??120??
    range Z < -50
    velocità oscillzione 50 100
*/
export function setObstacle(time){
    const s = rand(1, sizeO);
    const vel = rand(0.5,1.5);
    const data={
      elemS: s, 
      elemT: {x:rand(110,170)+time*speed.obstacle*vel, y:rand(40, 120), z:-rand(20, 30)}, 
      elemR: {x:rand(0,1), y:rand(0,1),z:rand(0,1)},
      elemO: rand(-0.5,0.5),
      color: [rand(120,255),rand(120,255),rand(120,255)],
      speed: vel
    };

    return data;
}

function u_worldObstacle(time, data) {
  const frequency = 0.5;  // Frequenza dell'oscillazione

  const rotationY = Math.PI/2 * Math.sin(time/100 * frequency); // Rotazione oscillatoria (mezza circonferenza)
    const elemT= data.elemT;
    const elemS= data.elemS;
    const elemR= data.elemR;
    const elemO= data.elemO;
    const pos = {x: elemT.x-(time*speed.obstacle*data.speed), y:elemT.y+Math.sin(time*elemO)};
    var u_world = m4.translation(pos.x,pos.y, elemT.z+Math.sin(time*elemO)); // Posiziona l'oggetto 
    //var u_world = m4.translation(-35,50,-35); // Posiziona l'oggetto 
    u_world = m4.xRotate(u_world, 0-elemR.x );
    u_world = m4.yRotate(u_world, 90-rotationY-elemR.y );
    u_world = m4.zRotate(u_world, 45+elemR.z );
    //u_world = m4.yRotate(u_world, elemR*time*speed); // Applica rotazione fissa attorno all'asse Y
    //u_world = m4.xRotate(u_world, -elemR*time*speed); // Applica rotazione attorno all'asse Yworld
    u_world = m4.scale(u_world, elemS, elemS, elemS); // Scala l'oggetto
    checkCollisionObstacle(pos);
    return u_world;
}

export function renderObstacle(gl, meshProgramInfo, obstacle, time, data) {
  for (const { bufferInfo, material } of obstacle) {
    webglUtils.setBuffersAndAttributes(gl, meshProgramInfo, bufferInfo);
    const updatedMaterial = { ...material, diffuse:  data.color.map(c => c / 255)};
    webglUtils.setUniforms(meshProgramInfo, { u_world: u_worldObstacle(time, data), u_color: data.color }, updatedMaterial);
    webglUtils.drawBufferInfo(gl, bufferInfo);
  }
}

/*COIN*/
export function setCoin(time, i, yDistr, ampiezza, yRot){
  return{
      elemS: 6, 
      elemT: {x:120+i*rand(8,12)+(time*speed.coin), y:yDistr+Math.sin(i)*ampiezza, z:-23},
      elemR: {x: rand(20,60), y:yRot, z:0},
      elemO: rand(-0.5,0.5)
  };
}

function u_worldCoin(d, time) {
  const elemS= d.elemS;
  const pos = {x:d.elemT.x-(time*speed.coin), y: d.elemT.y+Math.sin(time*d.elemO)};
  var u_world = m4.translation(pos.x, pos.y, d.elemT.z);
  u_world = m4.xRotate(u_world, -degToRad(d.elemR.x));
  u_world = m4.yRotate(u_world, degToRad(d.elemR.y-time));
  u_world = m4.scale(u_world, elemS, elemS, elemS); // Scala l'oggetto
  const collision = checkCollisionCoin(pos);
  return {u_world, collision};
}

export function renderCoin(gl, meshProgramInfo, coin, time, data) {
  const {u_world, collision} = u_worldCoin(data, time);
  renderObj(gl, meshProgramInfo, coin, u_world);

  return collision  
}