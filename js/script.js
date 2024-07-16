"use strict";

import { loadPlane, getGeometriesExtents } from './planeLoader.js';
import { setupCameraAndLight } from './cameraAndLightSetup.js';
import { renderScene } from './renderScene.js';
import { vs, fs, vsColor, fsColor, rand, setPlaneClipping } from './utils.js';
import { loadEndGameContent } from './endGame.js';

/**
 * Main function to initialize and render the scene.
 */
async function main() {
  // Store the start time of the game
  localStorage.setItem('startTime', new Date());
  // Preload end game content
  loadEndGameContent();
  
  const canvas = document.querySelector("#canvas");
  const gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }

  // Create a WebGL program using vertex and fragment shaders
  const meshProgramInfo = webglUtils.createProgramInfo(gl, [vs, fs]);
  const colorProgramInfo = webglUtils.createProgramInfo(gl, [vsColor, fsColor]);

  // Object paths for asynchronous loading
  const objectPaths = {
    plane: './src/plane.obj',
    elica: './src/elica.obj',
    world: './src/world.obj',
    foto: './src/foto.obj',
    cube: './src/cube.obj',
    obstacle: './src/icosfera.obj',
    coin: './src/coin.obj',
  };

  // Asynchronously load all objects and calculate their extents
  const loadObject = async (href, color = null) => {
    return await loadPlane(gl, href, color ? [parseInt(rand(50, 255)), parseInt(rand(50, 255)), parseInt(rand(50, 255))] : null);
  };

  const loadedObjects = await Promise.all(Object.entries(objectPaths).map(([key, path]) =>
    loadObject(path, key === 'obstacle')
  ));

  const parts = Object.fromEntries(loadedObjects.map((obj, idx) => [Object.keys(objectPaths)[idx], obj.parts]));
  const extents = loadedObjects.slice(0, 2).map(obj => getGeometriesExtents(obj.obj.geometries)); // Only calculate extents for plane and elica

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
  renderScene(gl, meshProgramInfo,  colorProgramInfo, parts, cameraPosition, cameraTarget, objOffset);
}

// Execute the main function to start the application
main()