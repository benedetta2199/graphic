"use strict";

import { renderObj } from './renderObj.js';
import { rand } from './utils.js';
let elemS = [];
let elemT = [];
let elemV = [];
const size = 4;

/*  range X > 110
    range Y 40-145
    range Z < -50
*/
export function setCloud(n){
    const yCloud = rand(40, 145);
    const zCloud = rand(50, 90);

    for (let i = 0; i < n; i++) {
        const s = rand(1, size);
        const rangeX = s * size/2;
        elemS[i] = s;
        elemT[i] = [rand(-rangeX, rangeX), yCloud + rand(-s, s), -(zCloud + rand(0, s))];
        elemV[i] = s/rand(200,400);
    }
    console.log("ok");

    //return { elemS: elemS, elemT: elemT, elemV: elemV};
}

function u_worldCube(i, time) {
    var u_world = m4.translation(elemT[i][0]-time, elemT[i][1], elemT[i][2]); // Posiziona l'oggetto 
    u_world = m4.xRotate(u_world, elemV[i]*time); // Applica rotazione fissa attorno all'asse Y
    u_world = m4.yRotate(u_world, -elemV[i]*time); // Applica rotazione attorno all'asse Yworld
    u_world = m4.scale(u_world, elemS[i], elemS[i], elemS[i]); // Scala l'oggetto
    return u_world;
}

export function renderCloud(gl, meshProgramInfo, cube, n, time) {
    for (let i = 0; i < n; i++) {
        renderObj(gl, meshProgramInfo, cube, u_worldCube(i,time));
    }    
}