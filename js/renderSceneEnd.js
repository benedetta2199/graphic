"use strict";

import { setupCameraAndLight } from './cameraAndLightSetupEnd.js';
import { renderCloud, setCloud } from './cloudEnd.js';
import { drawScene } from './drawSceneEnd.js';
import { createDepthFramebuffer, createDepthTexture } from './objLoad.js';
import { renderObj, u_worldElica, u_worldFoto, u_worldPlane, u_worldWorld } from './renderObjEnd.js';
import { alphaEnable, cameraPosition, cameraTarget, degToRad, rand, setTime } from './utils.js';
import { zFar, zNear, lightTarget, lightPosition } from "./utils.js";

// Initial settings
const clouds = [setCloud(rand(3, 6), 0, { min: 0, max: 40 })];

export let posCamTarget = [0, 0, 0];
export let posCamPos = [0, 0, 0];
export let posPlane = [0, 0, 0];


/**
 * Render the scene.
 * @param {WebGLRenderingContext} gl - WebGL context.
 * @param {Object} meshProgramInfo - Shader program information.
 * @param {Object} parts - Object parts to render.
 * @param {Array} cP - Camera position.
 * @param {Array} cT - Camera target.
 * @param {Array} objOffset - Object offset.
 */
export function renderScene(gl, meshProgramInfo, colorProgramInfo, parts, cP, cT) {
  //let cPtemp = [];
  //let cameraTarget = [];

  /**
   * Render function called for each animation frame.
   * @param {number} time - Time in milliseconds.
   */
  function render(time) {
    // Update camera position and target based on inputs
    // for (let j = 0; j < 3; j++) {
    //   cPtemp[j] = cP[j] + posCamPos[j];
    //   cameraTarget[j] = cT[j] + posCamTarget[j];
    // }


    const cameraPos = m4.addVectors(cameraTarget, cameraPosition);
    time *= 0.006; // Convert time to seconds (propeller speed)
    setTime(time);
    
    // Resize WebGL canvas to display size
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    if (alphaEnable) {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    } else {
      gl.disable(gl.BLEND);
    }


  
    // Camera position and view
    const up = [0, 1, 0];
    // Camera field of view and perspective
    const fieldOfViewRadians = degToRad(60);

    const depthTextureSize = 2048;
    const depthTexture = createDepthTexture(gl, depthTextureSize);
    const depthFramebuffer = createDepthFramebuffer(gl, depthTexture);
    
    const lightMatrix = m4.lookAt(lightPosition, lightTarget, up);
    const lightProjectionMatrix = m4.orthographic(-100, 100, -150, 50, 0.5, 200);

    // disegna la texture di profondità
    gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer);
    gl.viewport(0, 0, depthTextureSize, depthTextureSize);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Shared uniforms for shaders
    const sharedShadowUniforms = {
      u_lightDirection: m4.normalize(lightPosition),
      u_view: m4.inverse(lightMatrix), //camera matrix
      u_projection: lightProjectionMatrix,
      //NUOVI
      u_textureMatrix: m4.identity(), //questo toglie tutte le texture
      u_projectedTexture: depthTexture,
      u_bias: -0.0099,
    };
    drawScene(gl, colorProgramInfo, sharedShadowUniforms, parts);

    // ora disegna la scena sulla tela proiettando la texture di profondità nella scena
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);




    

    let textureMatrix = m4.identity();
    textureMatrix = m4.translate(textureMatrix, 0.5, 0.5, 0.5);
    textureMatrix = m4.scale(textureMatrix, 0.5, 0.5, 0.5);
    textureMatrix = m4.multiply(textureMatrix, lightProjectionMatrix);
    // usa l'inverso di questa matrice mondiale per creare una matrice che trasformerà altre posizioni
    // rendere relativo questo spazio mondiale.
    textureMatrix = m4.multiply(textureMatrix, m4.inverse(lightMatrix));

    // Set camera field of view and perspective
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const projection = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);
    // Set camera position and view
    const cameraMatrix = m4.lookAt(cameraPos, cameraTarget, up); 
    const view = m4.inverse(cameraMatrix);


    // Shared uniforms for shaders
    const sharedUniforms = {
      u_lightDirection: m4.normalize(lightPosition),
      u_view: view, //camera matrix
      u_projection: projection,
      u_viewWorldPosition: cameraPos,
      //NUOVI
      u_textureMatrix: textureMatrix, //questo toglie tutte le texture
      u_projectedTexture: depthTexture,
      u_bias: -0.0099,
    };

    drawScene(gl, meshProgramInfo, sharedUniforms, parts);

    // Request the next frame
    requestAnimationFrame(render);
  }

  // Start the rendering loop
  requestAnimationFrame(render);
}
