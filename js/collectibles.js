"use strict";

import { checkCollisionObstacle } from './mousePosition.js';
import { changeColor } from './planeLoader.js';
import { renderObj } from './renderObj.js';
import { degToRad, rand } from './utils.js';

/*OBSTACLE*/
const sizeO = 5;
let speed = 1;
/*  range X > 110
    range Y 40-145
    range Z < -50
    velocità oscillzione 50 100
*/
export function setObstacle(time){
    const s = rand(1, sizeO);
    const vel = rand(0.5,1.5);
    const data={
      elemS: s, 
      elemT: {x:rand(110,170)+time*speed*vel, y:rand(40, 125), z:-rand(20, 30)}, 
      elemR: {x:rand(0,1), y:rand(0,1),z:rand(0,1)},
      elemO: rand(-0.5,0.5),
      color: [rand(120,255),rand(120,255),rand(120,255)],
      speed: vel
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
    const pos = {x: elemT.x-(time*speed*data.speed), y:elemT.y+Math.sin(time*speed*elemO)};
    var u_world = m4.translation(pos.x,pos.y, elemT.z+Math.sin(time*speed*elemO)); // Posiziona l'oggetto 
    //var u_world = m4.translation(-35,50,-35); // Posiziona l'oggetto 
    u_world = m4.xRotate(u_world, 0-elemR.x );
    u_world = m4.yRotate(u_world, 90-rotationY-elemR.y );
    u_world = m4.zRotate(u_world, 45+elemR.z );
    //u_world = m4.yRotate(u_world, elemR*time*speed); // Applica rotazione fissa attorno all'asse Y
    //u_world = m4.xRotate(u_world, -elemR*time*speed); // Applica rotazione attorno all'asse Yworld
    u_world = m4.scale(u_world, elemS, elemS, elemS); // Scala l'oggetto
    //console.log(u_world)
    const collision = checkCollisionObstacle(pos);
    return {u_world, collision};
}

export function renderObstacle(gl, meshProgramInfo, obstacle, time, data) {
  for (const { bufferInfo, material } of obstacle) {
    webglUtils.setBuffersAndAttributes(gl, meshProgramInfo, bufferInfo);
    const updatedMaterial = { ...material, diffuse: data.color.map(c => c / 255) };
    const {u_world, collision} = u_worldObstacle(time, data);
    webglUtils.setUniforms(meshProgramInfo, { u_world: u_world, u_color: data.color }, updatedMaterial);
    webglUtils.drawBufferInfo(gl, bufferInfo);
    return collision;
  }
}

const sizeC = 6;
/*COIN*/
export function setCoin(n,time){
  const data = [];
  const yDistr = rand(3,8);
  const yRot = rand(45,90);
  
  for (let i = 0; i < n; i++) {
      const rangeX = sizeC * n/3;
      //const oscillationAngle = Math.sin(time) * degToRad(3); // Oscillazione sinusoidale
      data[i]={
          elemS: sizeC, 
          //elemT: [rand(110,170)+time*speed*2, rand(40, 125), -rand(20, 30)], 
          elemT: {x:120+i*10+(time*speed*2), y:60+Math.sin(i)*yDistr, z:-23},
          elemR: {x: rand(20,60), y:yRot, z:0},
          elemO: rand(-0.5,0.5)/*
          elemT: [150-rand(-rangeX, rangeX)+(time), yCloud + rand(-sizeC, sizeC), -(zCloud + rand(0, sizeC))], 
          elemR: sizeC/rand(sizeC*25,sizeC*100),
          elemO: rand(-0.5,0.5)*/
      };
  }

  return data;
}

function u_worldCoin(data, time) {
  const elemT= data.elemT;
  const elemS= data.elemS;
  const elemR= data.elemR;
  const elemO= data.elemO;
  //var u_world = m4.translation(elemT[0], elemT[1]+Math.sin(time*elemO), elemT[2]+Math.sin(time*elemO)); // Posiziona l'oggetto 
  var u_world = m4.translation(elemT.x-(time*speed*2), elemT.y+Math.sin(time*elemO), elemT.z); // Posiziona l'oggetto 
  u_world = m4.xRotate(u_world, -degToRad(elemR.x));
  u_world = m4.yRotate(u_world, degToRad(elemR.y-time*speed));
  //u_world = m4.yRotate(u_world, elemR*time); // Applica rotazione fissa attorno all'asse Y
  //u_world = m4.xRotate(u_world, -elemR*time); // Applica rotazione attorno all'asse Yworld
  u_world = m4.scale(u_world, elemS, elemS, elemS); // Scala l'oggetto
  return u_world;
}

export function renderCoin(gl, meshProgramInfo, coin, time, data) {
  for(var i = 0; i < data.length; i++) {
      renderObj(gl, meshProgramInfo, coin, u_worldCoin(data[i], time));
  }    
}