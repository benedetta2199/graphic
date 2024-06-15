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
  const objHref = './src/plane.obj';

  const { parts, obj } = await loadPlane(gl, objHref);
  const extents = getGeometriesExtents(obj.geometries);

  const { cameraPosition, cameraTarget, objOffset, zNear, zFar } = setupCameraAndLight(gl, extents);
  renderScene(gl, meshProgramInfo, parts, cameraPosition, cameraTarget, objOffset, zNear, zFar);
}

main();
