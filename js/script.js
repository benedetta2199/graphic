// WebGL - load obj - w/mtl, textures
// from https://webglfundamentals.org/webgl/webgl-load-obj-w-mtl-w-textures.html
"use strict";
import { loadPlane, getGeometriesExtents } from './planeLoader.js';
import { setupCameraAndLight} from './cameraAndLightSetup.js';
import { renderScene } from './renderScene.js';
import { vs, fs } from './const.js';

async function main() {
  const canvas = document.querySelector("#canvas");
  const gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }

  // Crea un programma WebGL utilizzando shader vertex e fragment
  const meshProgramInfo = webglUtils.createProgramInfo(gl, [vs, fs]);
  
  //Carica il primo oggetto (aereo) in modo asincrono
  const planeObjHref = './src/plane.obj';
  const { parts: planeParts, obj: planeObj } = await loadPlane(gl, planeObjHref, false);
  // Calcola le dimensioni geometriche (bounding box) dell'oggetto aereo
  const planeExtents = getGeometriesExtents(planeObj.geometries);

  // Carica il secondo oggetto (elica) in modo asincrono
  const elicaObjHref = './src/elica.obj';
  const { parts: elicaParts, obj: elicaObj } = await loadPlane(gl, elicaObjHref, true);
  // Calcola le dimensioni geometriche (bounding box) dell'oggetto elica
  const elicaExtents = getGeometriesExtents(elicaObj.geometries);

  // Carica il terzo oggetto (world) in modo asincrono
  const worldObjHref = './src/world.obj';
  const { parts: worldParts, obj: worldObj } = await loadPlane(gl, worldObjHref, false);
  // Calcola le dimensioni geometriche (bounding box) dell'oggetto world
  const worldExtents = getGeometriesExtents(worldObj.geometries);

  // Combina le estensioni per impostare la telecamera
  /*const combinedExtents = {
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
  };*/

  // Combina le estensioni per impostare la telecamera
  const combinedExtents = {
    min: [
      Math.min(planeExtents.min[0], elicaExtents.min[0], worldExtents.min[0]),
      Math.min(planeExtents.min[1], elicaExtents.min[1], worldExtents.min[1]),
      Math.min(planeExtents.min[2], elicaExtents.min[2], worldExtents.min[2]),
    ],
    max: [
      Math.max(planeExtents.max[0], elicaExtents.max[0], worldExtents.max[0]),
      Math.max(planeExtents.max[1], elicaExtents.max[1], worldExtents.max[1]),
      Math.max(planeExtents.max[2], elicaExtents.max[2], worldExtents.max[2]),
    ],
  };

  // Ottiene posizione della telecamera, target, offset oggetto, e piani di clipping basati sulle estensioni combinate
  const { cameraPosition, cameraTarget, objOffset, zNear, zFar } = setupCameraAndLight(gl, combinedExtents);
  
  // Renderizza la scena con gli oggetti caricati e la configurazione della telecamera
  //renderScene(gl, meshProgramInfo, planeParts, elicaParts, cameraPosition, cameraTarget, objOffset, zNear, zFar);
  renderScene(gl, meshProgramInfo, planeParts, elicaParts, worldParts, cameraPosition, cameraTarget, objOffset, zNear, zFar);

}

main();
