"use strict";

import { loadPlane, getGeometriesExtents } from './createObj.js';
import { vs, fs, setPlaneClipping, zNear, zFar, vsColor, fsColor, setCameraTargetOffset, setCameraTarget } from './utils.js';
import { setAlpha, alphaEnable, setLight, enableNormalMap, setNormalMap, enableTextureMap, setTextureMap} from "./utils.js";
import { setupCameraAndLightEnd } from './cameraAndLightSetup.js';
import { renderSceneEnd, posPlane } from './renderScene.js';
  

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
  const colorProgramInfo = webglUtils.createProgramInfo(gl, [vsColor, fsColor]);

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
  setupCameraAndLightEnd(combinedExtents);

  setPlaneClipping(zNear, zFar);

  // Render the scene with the loaded objects and camera setup
  renderSceneEnd(gl, meshProgramInfo, colorProgramInfo, parts);
}

/**
 * Sets up event listeners for camera and light controls.
 */
function setListener() {
  const buttons = {
    alpha: document.getElementById('alpha'),
    normalMap: document.getElementById('normalMap'),
    textureMap: document.getElementById('textureMap'),
  };

  buttons.alpha.addEventListener('click', () => {
    setAlpha();
    toggleButton(buttons.alpha, !alphaEnable);
  });

  buttons.normalMap.addEventListener('click', () => {
    setNormalMap();
    toggleButton(buttons.normalMap, !enableNormalMap);
  });

  buttons.textureMap.addEventListener('click', () => {
    setTextureMap();
    toggleButton(buttons.textureMap, !enableTextureMap);
  });


  const inputElements = [
    { id: 'camPosX', setter: setCameraTargetOffset, index: 0 },
    { id: 'camPosY', setter: setCameraTargetOffset, index: 1 },
    { id: 'camPosZ', setter: setCameraTargetOffset, index: 2 },
    { id: 'camTargX', setter: setCameraTarget, index: 0 },
    { id: 'camTargY', setter: setCameraTarget, index: 1 },
    { id: 'camTargZ', setter: setCameraTarget, index: 2 },
    { id: 'lightTarX', setter: setLight, index: 0 },
    { id: 'lightTarY', setter: setLight, index: 1 },
    { id: 'lightTarZ', setter: setLight, index: 2 },
    { id: 'planeTargX', setter: (i, value) => posPlane[i] = value, index: 0 },
    { id: 'planeTargY', setter: (i, value) => posPlane[i] = value, index: 1 },
    { id: 'planeTargZ', setter: (i, value) => posPlane[i] = value, index: 2 },
  ];

  inputElements.forEach(({ id, setter, index }) => {
    document.getElementById(id).addEventListener('input', (event) => {
      const value = parseInt(event.target.value);
      console.log(`Setting ${id} to ${value}`);
      setter(index, value);
    });
  });
}

function toggleButton(button, isActive) {
  button.classList.toggle('active', !isActive);
  button.classList.toggle('inactive', isActive);
}