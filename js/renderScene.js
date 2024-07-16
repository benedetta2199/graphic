"use strict";

import { renderCloud, setCloud } from './cloud.js';
import { setListener } from './mousePosition.js';
import { renderObj, u_worldElica,  u_worldPlane, u_worldWorld } from './renderObj.js';
import { renderCoin, renderObstacle, setCoin, setObstacle } from './collectibles.js';
import { degToRad, isPaused, rand, speed, timing, alphaEnable, zFar, zNear, setTime, clouds, obstacles, coins, lightPosition, lightTarget, cameraPosition, cameraTarget } from './utils.js';
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
export function renderScene(gl, meshProgramInfo, colorProgramInfo, parts) {
  setListener(gl);

  const up = [0, 1, 0];
  const fieldOfViewRadians = degToRad(60);

  const depthTextureSize = 2048;
  const depthTexture = createDepthTexture(gl, depthTextureSize);
  const depthFramebuffer = createDepthFramebuffer(gl, depthTexture);

   //buffer for viewLight
   const cubeLinesBufferInfo = webglUtils.createBufferInfoFromArrays(gl, {
    position: [
      -1, -1, -1,
       1, -1, -1,
      -1,  1, -1,
       1,  1, -1,
      -1, -1,  1,
       1, -1,  1,
      -1,  1,  1,
       1,  1,  1,
    ],
    indices: [
      0, 1,
      1, 3,
      3, 2,
      2, 0,

      4, 5,
      5, 7,
      7, 6,
      6, 4,

      0, 4,
      1, 5,
      3, 7,
      2, 6,
    ],
  });

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

    //console.log( gl.canvas.clientWidth /2 ,  gl.canvas.clientHeight/2)

    const lightProjectionMatrix = m4.orthographic(
      -100,   // Sinistra
      100,   // Giusto
      -100,  // metter il fondo a
      100,  // superiore
       0.5,                      // vicino
       200);                      // lontano
    /* m4.perspective(
      degToRad(120),
      gl.canvas.clientWidth /  gl.canvas.clientHeight,
      0.5,  // vicino
      10)   // lontano*/
      
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
    const lightMatrix = m4.lookAt(lightPosition, lightTarget, up); 


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
      u_bias: -0.007,
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
    const cameraMatrix = m4.lookAt(cameraPosition, cameraTarget, up); 
    const view = m4.inverse(cameraMatrix);


    // Shared uniforms for shaders
    const sharedUniforms = {
      u_lightDirection: m4.normalize(lightPosition),
      u_view: view, //camera matrix
      u_projection: projection,
      u_viewWorldPosition: cameraPosition,
      //NUOVI
      u_textureMatrix: textureMatrix, //questo toglie tutte le texture
      u_projectedTexture: depthTexture,
      u_bias: -0.007,
    };

    drawScene(gl, meshProgramInfo, sharedUniforms, parts);

    {
      const viewMatrix = m4.inverse(cameraMatrix);

      gl.useProgram(colorProgramInfo.program);

      // Setup all the needed attributes.
      webglUtils.setBuffersAndAttributes(gl, colorProgramInfo, cubeLinesBufferInfo);

      // scale the cube in Z so it's really long
      // to represent the texture is being projected to
      // infinity
      const mat = m4.multiply(
          lightMatrix, m4.inverse(lightProjectionMatrix));

      // Set the uniforms we just computed
      webglUtils.setUniforms(colorProgramInfo, {
        u_color: [0, 0, 0, 1],
        u_view: viewMatrix,
        u_projection: projection,
        u_world: mat,
      });

      // calls gl.drawArrays or gl.drawElements
      webglUtils.drawBufferInfo(gl, cubeLinesBufferInfo, gl.LINES);
    }


    requestAnimationFrame(render);
  }

  // Start the rendering loop
  requestAnimationFrame(render);
}
