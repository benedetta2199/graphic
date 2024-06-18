"use strict";

import { renderObj } from './renderObj.js';
import { rand } from './utils.js';

  let elemS = [];
  let elemT = [];
  const size = 16;

  /*  range X > 110
            range Y 40-145
            range Z < -50
        */
 export function setCloud(n){
    const yCloud=rand(40,145);
    const zCloud=rand(50,90);
    for(let i=0; i<n; i++){
        console.log(i);
        const s = rand(1,size);
        const rangeX = s*size/2;
        const rangeY = s*size/10;
        elemS[i]=s/4;
        elemT[i]= [ 120 +rand(-rangeX,rangeX), yCloud+rand(-rangeY,rangeY), -(zCloud+rand(0,s))];
    }
    console.log("ok");
  }

function u_worldCube(i){
    const prop=4;
    var u_world_world = m4.translation(50,50,-50); // Posiziona l'oggetto world in basso
    //u_world_world = m4.translation(elemT[i][0], elemT[i][1], elemT[i][2]); // Posiziona l'oggetto world in basso
      //u_world_world = m4.yRotate(u_world_world, 2); // Applica rotazione attorno all'asse Y

      u_world_world = m4.scale(u_world_world, elemS[i], elemS[i], elemS[i]); // Scala l'oggetto orizzontalmente (asse X)
      //const fixedRotationAngle = degToRad(75); // Angolo fisso di 45 gradi
      //u_world_world = m4.xRotate(u_world_world, time/20); // Applica rotazione fissa attorno all'asse Y
      //u_world_world = m4.yRotate(u_world_world, time/20); // Applica rotazione attorno all'asse Y
      //u_world_world = m4.scale(u_world_world, prop, prop, prop); // Scala l'oggetto orizzontalmente (asse X)
  
    return u_world_world;
  }

export function renderCloud(gl,meshProgramInfo, cube, n, time) {
    for(let i=0;i<n;i++){
        const u = u_worldCube(i)
        console.log(u);
        renderObj(gl,meshProgramInfo, cube, m4.translation(50,50,-50));
    }    
 }


/*
import { rand, vs, fs } from './utils.js';

  const n = rand(3,9);
  let elemS = [];
  let elem = [];
  let u_cloud = [];
  let elemT = [];
  let objectsToDraw =[];
  const size = 20;

 export function setCloud(gl, cube, time){
    // setup GLSL program
    var programInfo = webglUtils.createProgramInfo(gl, [vs, fs]);

    for(let i=0; i<n; i++){
        const s = rand(1,size);
        const rangeX = s*size/2;
        const rangeY = s*size/10;
        elemS[i]=s/4;
        elem[i]=cube;
        elemT[i]= [ rand(-rangeX,rangeX), rand(rangeY,rangeY), rand(0,s)];
        u_cloud[i]=getUniform(i);
        objectsToDraw[i]={ programInfo: programInfo, bufferInfo: elem[0],uniforms: u_cloud[i],}
        u_cloud[i].u_matrix = computeMatrix(elemT[i], elemS[i], time);
    }
    return objectsToDraw;
  }

  // Uniforms for each object.
  function getUniform(i){
    const v =i+1;
    let u_mat = m4.translation(elemT[i][0],elemT[i][1],elemT[i][2]);
    u_mat = m4.scale(u_mat, elem[i], elem[i], elem[i]);
    u_mat = m4.yRotate(u_mat, 0.1);
    return {
      u_colorMult: [255-rand(v*10,v*50), 220-rand(v*10,v*50), 220-rand(v*10,v*50), 0.5],
      u_matrix: u_mat
    }
  }

  function computeMatrix(translation, size, time) {
    var matrix = m4.translate(translation[0]-5*time, translation[1], translation[2]);
    matrix = m4.zRotate(matrix, time/8*size);
    matrix = m4.xRotate(matrix, -time/8*size);
    matrix = m4.scale(matrix, size,size,size);
    return matrix;
  }
*/