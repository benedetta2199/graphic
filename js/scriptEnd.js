"use strict";

import { loadPlane, getGeometriesExtents } from './planeLoader.js';
import { setupCameraAndLight } from './cameraAndLightSetupEnd.js';
import { renderScene } from './renderSceneEnd.js';
import { vs, fs, setPlaneClipping } from './utils.js';
import { posCamTarget, posCamPos, posPlane, light } from './renderSceneEnd.js';

/**
 * Main function to initialize and render the scene.
 */
export async function main() {
  setListener();

  const canvas = document.querySelector("#canvas");
  const gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }

  // Create a WebGL program using vertex and fragment shaders
  const meshProgramInfo = webglUtils.createProgramInfo(gl, [vs, fs]);

  // Load objects asynchronously
  const objects = ['plane', 'elica', 'world', 'foto', 'cube'];
  const objectPaths = objects.map(obj => `./src/${obj}.obj`);
  const loadedObjects = await Promise.all(objectPaths.map(path => loadPlane(gl, path)));
  const parts = Object.fromEntries(loadedObjects.map((obj, idx) => [objects[idx], obj.parts]));
  const extents = loadedObjects.map(obj => getGeometriesExtents(obj.obj.geometries));

  // Combine extents for camera setup
  const combinedExtents = {
    min: [
      Math.min(extents[0].min[0], extents[1].min[0]),
      Math.min(extents[0].min[1], extents[1].min[1]),
      Math.min(extents[0].min[2], extents[1].min[2]),
    ],
    max: [
      Math.max(extents[0].max[0], extents[1].max[0]),
      Math.max(extents[0].max[1], extents[1].max[1]),
      Math.max(extents[0].max[2], extents[1].max[2]),
    ],
  };

  // Get camera position, target, object offset, and clipping planes based on combined extents
  const { cameraPosition, cameraTarget, objOffset, zNear, zFar } = setupCameraAndLight(gl, combinedExtents);

  setPlaneClipping(zNear, zFar);

  // Render the scene with the loaded objects and camera setup
  renderScene(gl, meshProgramInfo, parts, cameraPosition, cameraTarget, combinedExtents);
}

/**
 * Sets up event listeners for camera and light controls.
 */
function setListener() {
  const inputElements = [
    { id: 'camPosX', target: posCamPos, index: 0 },
    { id: 'camPosY', target: posCamPos, index: 1 },
    { id: 'camPosZ', target: posCamPos, index: 2 },
    { id: 'camTargX', target: posCamTarget, index: 0 },
    { id: 'camTargY', target: posCamTarget, index: 1 },
    { id: 'camTargZ', target: posCamTarget, index: 2 },
    { id: 'planeTargX', target: posPlane, index: 0 },
    { id: 'planeTargY', target: posPlane, index: 1 },
    { id: 'planeTargZ', target: posPlane, index: 2 },
    { id: 'lightTarX', target: light, index: 0 },
    { id: 'lightTarX', target: light, index: 1 },
    { id: 'lightTarX', target: light, index: 2 },

  ];

  inputElements.forEach(({ id, target, index }) => {
    document.getElementById(id).addEventListener('input', (event) => {
      target[index] = parseInt(event.target.value);
    });
  });
}