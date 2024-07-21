"use strict";

import { setupCameraAndLight } from './cameraAndLightSetupEnd.js';
import { renderCloud, setCloud } from './cloudEnd.js';
import { renderObj, u_worldElica, u_worldFoto, u_worldPlane, u_worldWorld } from './renderObjEnd.js';
import { degToRad, rand } from './utils.js';
import { zFar, zNear } from "./utils.js";

// Initial settings
const clouds = [setCloud(rand(3, 6), 0, { min: 0, max: 40 })];
let frameCount = 0;

export let posCamTarget = [0, 0, 0];
export let posCamPos = [0, 0, 0];
export let posPlane = [0, 0, 0];
export let light = [60, 60, 30];

/**
 * Render the scene.
 * @param {WebGLRenderingContext} gl - WebGL context.
 * @param {Object} meshProgramInfo - Shader program information.
 * @param {Object} parts - Object parts to render.
 * @param {Array} cP - Camera position.
 * @param {Array} cT - Camera target.
 * @param {Array} objOffset - Object offset.
 */
export function renderScene(gl, meshProgramInfo, parts, cP, cT) {
  let cPtemp = [];
  let cameraTarget = [];

  /**
   * Render function called for each animation frame.
   * @param {number} time - Time in milliseconds.
   */
  function render(time) {
    // Update camera position and target based on inputs
    for (let j = 0; j < 3; j++) {
      cPtemp[j] = cP[j] + posCamPos[j];
      cameraTarget[j] = cT[j] + posCamTarget[j];
    }
    const cameraPosition = m4.addVectors(cameraTarget, cPtemp);
    time *= 0.006; // Convert time to seconds (propeller speed)
    frameCount++;

    // Resize WebGL canvas to display size
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Camera field of view and perspective
    const fieldOfViewRadians = degToRad(60);
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const projection = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);

    // Camera position and view
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

    // Use the specified shader program
    gl.useProgram(meshProgramInfo.program);
    webglUtils.setUniforms(meshProgramInfo, sharedUniforms);

    // Render PLANE
    let u_world = u_worldPlane(gl.canvas.width, gl.canvas.height, time);
    u_world = m4.translate(u_world, posPlane[0], posPlane[1], posPlane[2]);
    renderObj(gl, meshProgramInfo, parts.plane, u_world);

    // Render ELICA
    renderObj(gl, meshProgramInfo, parts.elica, u_worldElica(u_world, time));

    // Render WORLD
    renderObj(gl, meshProgramInfo, parts.world, u_worldWorld(time));

    // Render PHOTO
    renderObj(gl, meshProgramInfo, parts.foto, u_worldFoto(u_world));

    // Render CLOUD periodically
    if (frameCount % 300 === 0) {
      clouds.push(setCloud(rand(3, 6), time, { min: -20, max: 40 }));
      if (clouds.length > 20) {
        clouds.shift();
      }
    }
    clouds.forEach(c => {
      renderCloud(gl, meshProgramInfo, parts.cube, time, c);
    });

    // Request the next frame
    requestAnimationFrame(render);
  }

  // Start the rendering loop
  requestAnimationFrame(render);
}
