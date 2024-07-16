"use strict";

import { renderCloud, setCloud } from './cloud.js';
import { setListener } from './mousePosition.js';
import { renderObj, u_worldElica,  u_worldPlane, u_worldWorld } from './renderObj.js';
import { renderCoin, renderObstacle, setCoin, setObstacle } from './collectibles.js';
import { degToRad, isPaused, rand, speed, timing, alphaEnable, zFar, zNear, light, setTime } from './utils.js';
import { drawScene } from './drawScene.js';

// Initialize arrays for clouds, obstacles, and coins
const clouds = [setCloud(rand(4, 9), 0)];
const obstacles = [setObstacle(0)];
let coins = [setCoin(0, 0, rand(3, 8), rand(45, 90))];
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

    // Set camera position and view
    const up = [0, 1, 0];
    const camera = m4.lookAt(cameraPosition, cameraTarget, up);
    const view = m4.inverse(camera);

    // Shared uniforms for shaders
    const sharedUniforms = {
      u_lightDirection: m4.normalize(light),
      u_view: view,
      u_projection: projection,
      u_viewWorldPosition: cameraPosition,
    };

    drawScene(gl, meshProgramInfo, sharedUniforms, parts);

    /*

    // Use the specified shader program
    gl.useProgram(meshProgramInfo.program);
    webglUtils.setUniforms(meshProgramInfo, sharedUniforms);

    // Render PLANE
    let u_world = u_worldPlane(gl.canvas.height);
    console.log(parts.plane)
    
    console.log(u_world)
    renderObj(gl, meshProgramInfo, parts.plane, u_world);

    // Render ELICA
    renderObj(gl, meshProgramInfo, parts.elica, u_worldElica(u_world));

    // Render WORLD
    renderObj(gl, meshProgramInfo, parts.world, u_worldWorld());

    // Render OBSTACLES periodically
    if (frameCount % timing.obstacle === 0) {
      obstacles.push(setObstacle());
      if (obstacles.length > 5000 / (timing.obstacle * speed.obstacle)) {
        obstacles.shift();
      }
    }
    obstacles.forEach(data => {
      renderObstacle(gl, meshProgramInfo, parts.obstacle, data);
    });

    // Render COINS periodically
    if (frameCount % timing.coin === 0) {
      const numCoins = rand(1, 6);
      const amplitude = rand(3, 8);
      const yRotation = rand(45, 90);
      const y = rand(40, 120);
      for (let i = 0; i < numCoins; i++) {
        coins.push(setCoin(i, y, amplitude, yRotation));
      }
      if (coins.length > 30000 / (timing.coin * speed.coin)) {
        coins.shift();
      }
    }

    coins = coins.filter(data => !renderCoin(gl, meshProgramInfo, parts.coin, data));

    // Render CLOUD periodically
    if (frameCount % timing.cloud === 0) {
      clouds.push(setCloud(rand(3, 9)));
      if (clouds.length > 5000 / (timing.cloud * speed.cloud)) {
        clouds.shift();
      }
    }
    clouds.forEach(data => {
      renderCloud(gl, meshProgramInfo, parts.cube, data);
    });
*/
    // Request the next frame
    requestAnimationFrame(render);
  }

  // Start the rendering loop
  requestAnimationFrame(render);
}
