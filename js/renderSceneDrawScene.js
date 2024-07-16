"use strict";

import { renderCloud, setCloud } from './cloud.js';
import { setListener } from './mousePosition.js';
import { renderObj, u_worldElica,  u_worldPlane, u_worldWorld } from './renderObj.js';
import { renderCoin, renderObstacle, setCoin, setObstacle } from './collectibles.js';
import { degToRad, settings, isPaused, rand, speed, timing, alphaEnable, zFar, zNear, light, clouds, obstacles, coins, setTime } from './utils.js';
import { create1PixelTexture, createDepthFramebuffer, createDepthTexture } from './objLoad.js';
import { drawScene } from './drawScene.js';

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

  clouds.push(setCloud(rand(4, 9)));
  obstacles.push(setObstacle());
  coins.push(setCoin(0, rand(3, 8), rand(45, 90)));

  const depthTextureSize = 512;
  const depthTexture = createDepthTexture(gl, depthTextureSize);
  const depthBuffer = createDepthFramebuffer(gl, depthTexture);
  //const unusedTexture = createUnusedTexture(gl, depthTextureSize);

  /**POI DA RIMUOVERE */
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

    // Resize WebGL canvas to display size
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.DEPTH_TEST);

    if (alphaEnable) {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    } else {
      gl.disable(gl.BLEND);
    }

    // Set camera field of view and perspective
    const fieldOfViewRadians = degToRad(60);
    
    const up = [0, 1, 0];

    // first draw from the POV of the light
  const lightWorldMatrix = m4.lookAt(light,  [0, 0, 0],  [0, 1, 0], );
  const lightProjectionMatrix = settings.perspective
      ? m4.perspective(
          degToRad(settings.fieldOfView),
          settings.projWidth / settings.projHeight,
          0.5,  // near
          10)   // far
      : m4.orthographic(
          -settings.projWidth / 2,   // left
           settings.projWidth / 2,   // right
          -settings.projHeight / 2,  // bottom
           settings.projHeight / 2,  // top
           0.5,                      // near
           10);                      // far
/*
    console.log("before sharedShadowUnifoms");
    const sharedShadowUnifoms ={
      u_projection: lightProjectionMatrix,
      u_view: m4.inverse(lightWorldMatrix), //view
      u_textureMatrix: m4.identity(),
      u_bias: 0.6,
      u_projectedTexture: depthTexture,

      //u_lightDirection: m4.normalize(light),
      //u_reverseLightDirection: lightWorldMatrix.slice(8, 11), QUESTO è DA CAPIRE
      u_projectedTexture: lightWorldMatrix,
      u_viewWorldPosition: cameraPosition,
    }
    //drawScene(lightProjectionMatrix, lightWorldMatrix, m4.identity(), lightWorldMatrix, colorProgramInfo);    
    //            projectionMatrix,     cameraMatrix,    textureMatrix, lightWorldMatrix,   programInfo
    drawScene(gl, colorProgramInfo, sharedShadowUnifoms, parts);

    console.log("after sharedShadowUnifoms");

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);*/

    let textureMatrix = m4.identity();
    textureMatrix = m4.translate(textureMatrix, 0.5, 0.5, 0.5);
    textureMatrix = m4.scale(textureMatrix, 0.5, 0.5, 0.5);
    textureMatrix = m4.multiply(textureMatrix, lightProjectionMatrix);
    // use the inverse of this world matrix to make
    // a matrix that will transform other positions
    // to be relative this world space.
    textureMatrix = m4.multiply( textureMatrix, m4.inverse(lightWorldMatrix));

    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const projection = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);

    // Set camera position and view
    const camera = m4.lookAt(cameraPosition, cameraTarget, up);

    console.log("before sharedUnifoms");
    const view = m4.inverse(camera);

/*    const sharedUniforms = {
      u_lightDirection: m4.normalize(light),
      u_view: view,
      u_projection: projection,
      u_viewWorldPosition: cameraPosition,
    };
   */ 
    const sharedUnifoms ={
      u_projection: projection,
      u_view: view, //view
      //u_textureMatrix: textureMatrix,
      //u_bias: 0.6,
      //u_projectedTexture: depthTexture,
      u_lightDirection: m4.normalize(light),
      //u_reverseLightDirection: lightWorldMatrix.slice(8, 11), //QUESTO è DA CAPIRE
      //u_projectedTexture: depthBuffer,
      u_viewWorldPosition: cameraPosition,
    }

    //drawScene( projectionMatrix, cameraMatrix, textureMatrix, lightWorldMatrix, textureProgramInfo);  
    //           projectionMatrix, cameraMatrix, textureMatrix, lightWorldMatrix,   programInfo
    drawScene(gl, meshProgramInfo, sharedUnifoms, parts);

    const viewMatrix = m4.inverse(camera);
    gl.useProgram(meshProgramInfo.program);
    webglUtils.setBuffersAndAttributes(gl, meshProgramInfo, cubeLinesBufferInfo);

      //scale the cube in Z so it's really long to represent the texture is being projected to infinity
      //const mat = m4.multiply(lightWorldMatrix, m4.inverse(lightProjectionMatrix));

      webglUtils.setUniforms(colorProgramInfo, {
        u_color: [1, 1, 1, 1],
        u_view: view,
        u_projection: projection,
        u_world: cameraPosition,
      });

      //calls gl.drawArrays or gl.drawElements
      webglUtils.drawBufferInfo(gl, cubeLinesBufferInfo, gl.LINES);

    console.log("after sharedUnifoms");

    // use the inverse of this world matrix to make
    // a matrix that will transform other positions
    // to be relative this world space.
    //const textureMatrix = m4.inverse(textureWorldMatrix);

    // Request the next frame
    requestAnimationFrame(render);
  }

  // Start the rendering loop
  requestAnimationFrame(render);
}
