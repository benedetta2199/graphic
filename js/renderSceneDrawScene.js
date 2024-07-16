"use strict";

import { renderCloud, setCloud } from './cloud.js';
import { setListener } from './mousePosition.js';
import { renderObj, u_worldElica,  u_worldPlane, u_worldWorld } from './renderObj.js';
import { renderCoin, renderObstacle, setCoin, setObstacle } from './collectibles.js';
import { degToRad, isPaused, rand, speed, timing, alphaEnable, zFar, zNear, light, setTime, clouds, obstacles, coins } from './utils.js';
import { drawScene } from './drawScene.js';
import { createDepthFramebuffer, createDepthTexture } from './objLoad.js';

// Initialize arrays for clouds, obstacles, and coins
/*const clouds = [setCloud(rand(4, 9), 0)];
const obstacles = [setObstacle(0)];
let coins = [setCoin(0, 0, rand(3, 8), rand(45, 90))];*/
let frameCount = 0;

/**
 * Render the scene.
 * @param {WebGLRenderingContext} gl - WebGL context.
 * @param {Object} meshProgramInfo - Shader program information.
 * @param {Object} parts - Object parts to render.
 * @param {Array} cameraPosition - Camera position.
 * @param {Array} cameraTarget - Camera target.
 * @param {Array} objOffset - Object offset.
 */
export function renderScene(gl, meshProgramInfo, colorProgramInfo, parts, cameraPosition, cameraTarget) {
  setListener(gl);

  
  const depthTextureSize = 512;
  const depthTexture = createDepthTexture(gl, depthTextureSize);
  const depthFramebuffer = createDepthFramebuffer(gl, depthTexture);

  clouds.push(setCloud(rand(4, 9)));
  obstacles.push(setObstacle());
  coins.push(setCoin(0, rand(3, 8), rand(45, 90)));

  /**
   * Render function called for each animation frame.
   * @param {number} time - Time in milliseconds.
   */
  function render(time) {

    if (isPaused) {
      return;
    }

    time *= 0.006; // Convert time to seconds
    setTime(time);
    frameCount++;

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

    // Set camera field of view and perspective
    const fieldOfViewRadians = degToRad(60);
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const projection = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);

    const lightProjectionMatrix = m4.orthographic(
        -gl.canvas.clientWidth / 2,   // Sinistra
        gl.canvas.clientWidth / 2,   // Giusto
        -gl.canvas.clientHeight / 2,  // metter il fondo a
        gl.canvas.clientHeight / 2,  // superiore
         0.5,                      // vicino
         10
      );

    // disegna la texture di profondità
    gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer);
    gl.viewport(0, 0, depthTextureSize, depthTextureSize);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    /*? m4.perspective(
        degToRad(settings.fieldOfView),
        settings.projWidth / settings.projHeight,
        0.5,  // vicino
        10)   // lontano
    : m4.orthographic(
        -settings.projWidth / 2,   // Sinistra
         settings.projWidth / 2,   // Giusto
        -settings.projHeight / 2,  // metter il fondo a
         settings.projHeight / 2,  // superiore
         0.5,                      // vicino
         10);                      // lontano*/

    // Set camera position and view
    const up = [0, 1, 0];
    const cameraMatrix = m4.lookAt(cameraPosition, cameraTarget, up); 
    const lightMatrix = m4.lookAt(light, cameraTarget, up); 
    
    const view = m4.inverse(cameraMatrix);

    let textureMatrix = m4.identity();
    textureMatrix = m4.translate(textureMatrix, 0.5, 0.5, 0.5);
    textureMatrix = m4.scale(textureMatrix, 0.5, 0.5, 0.5);
    textureMatrix = m4.multiply(textureMatrix, lightProjectionMatrix);
    // usa l'inverso di questa matrice mondiale per creare una matrice che trasformerà altre posizioni
    // rendere relativo questo spazio mondiale.
    textureMatrix = m4.multiply(textureMatrix, m4.inverse(lightWorldMatrix));

    // Shared uniforms for shaders
    const sharedUniforms = {
      u_lightDirection: m4.normalize(light),
      u_view: view,
      u_projection: projection,
      u_viewWorldPosition: cameraPosition,
      //NUOVI
      u_textureMatrix: textureMatrix,
      u_projectedTexture: depthTexture,
    };

    drawScene(gl, meshProgramInfo, sharedUniforms, parts);

    // Request the next frame
    requestAnimationFrame(render);
  }

  // Start the rendering loop
  requestAnimationFrame(render);
}
