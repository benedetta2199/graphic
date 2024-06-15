// WebGL - load obj - w/mtl, textures
// from https://webglfundamentals.org/webgl/webgl-load-obj-w-mtl-w-textures.html
"use strict";
import { loadPlane, getGeometriesExtents } from './planeLoader.js';
import { setupCameraAndLight, renderScene } from './cameraAndLightSetup.js';
import { vs, fs } from './const.js';

async function main() {
  const canvas = document.querySelector("#canvas");
  const gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }

  const meshProgramInfo = webglUtils.createProgramInfo(gl, [vs, fs]);
  
  // Load first object
  const planeObjHref = './src/plane.obj';
  const { parts: planeParts, obj: planeObj } = await loadPlane(gl, planeObjHref, false);
  const planeExtents = getGeometriesExtents(planeObj.geometries);

  // Load second object
  const elicaObjHref = './src/elica.obj';
  const { parts: elicaParts, obj: elicaObj } = await loadPlane(gl, elicaObjHref, true);
  const elicaExtents = getGeometriesExtents(elicaObj.geometries);

  // Combine extents for camera setup
  const combinedExtents = {
    min: [
      Math.min(planeExtents.min[0], elicaExtents.min[0]),
      Math.min(planeExtents.min[1], elicaExtents.min[1]),
      Math.min(planeExtents.min[2], elicaExtents.min[2]),
    ],
    max: [
      Math.max(planeExtents.max[0], elicaExtents.max[0]),
      Math.max(planeExtents.max[1], elicaExtents.max[1]),
      Math.max(planeExtents.max[2], elicaExtents.max[2]),
    ],
  };

  const { cameraPosition, cameraTarget, objOffset, zNear, zFar } = setupCameraAndLight(gl, combinedExtents);
  
  renderScene(gl, meshProgramInfo, planeParts, elicaParts, cameraPosition, cameraTarget, objOffset, zNear, zFar);
}

main();
