"use strict";

import { renderObj } from './renderObj.js';
import { rand, time } from './utils.js';

const size = 4;
/*  range X > 110
    range Y 40-145
    range Z < -50
*/
export function setCloud(n){
    const data = [];
    const yCloud = rand(20, 145);
    let zCloud= rand(-100,100);

    for (let i = 0; i < n; i++) {
        const s = rand(1, size);
        const rangeX = s * n/3;
        data[i]={
            elemS: s, 
            elemT: [70-rand(-rangeX, rangeX)+(time), yCloud + rand(-s, s), -(zCloud + rand(0, s))], 
            elemR: s/rand(size*25,size*100),
            elemO: rand(-0.5,0.5),
        };
    }

    return data;
}

function u_worldCube(data) {
    const elemT= data.elemT;
    const elemS= data.elemS;
    const elemR= data.elemR;
    const elemO= data.elemO;
    var u_world = m4.translation(elemT[0]-(time), elemT[1]+Math.sin(time*elemO), elemT[2]+Math.sin(time*elemO)); // Posiziona l'oggetto 
    u_world = m4.yRotate(u_world, elemR*time); // Applica rotazione fissa attorno all'asse Y
    u_world = m4.xRotate(u_world, -elemR*time); // Applica rotazione attorno all'asse Yworld
    u_world = m4.scale(u_world, elemS, elemS, elemS); // Scala l'oggetto
    return u_world;
}

export function renderCloud(gl, meshProgramInfo, cube, data) {
    for(var i = 0; i < data.length; i++) {
        renderObj(gl, meshProgramInfo, cube, u_worldCube(data[i]));
    }    
}