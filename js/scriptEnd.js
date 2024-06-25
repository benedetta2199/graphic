//http://127.0.0.1:5500/
// WebGL - load obj - w/mtl textures
// from https://webglfundamentals.org/webgl/webgl-load-obj-w-mtl-textures.html
"use strict";
import { loadPlane, getGeometriesExtents } from './planeLoader.js';
import { setupCameraAndLight} from './cameraAndLightSetupEnd.js';
import { renderScene } from './renderSceneEnd.js';
import { vs, fs, setPlaneClipping } from './utils.js';
import {posCamTarget, posCamPos, posPlane, setLight} from './renderSceneEnd.js'

export async function main() {
  
  setListener();

  const canvas = document.querySelector("#canvas");
  const gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }

  // Crea un programma WebGL utilizzando shader vertex e fragment
  const meshProgramInfo = webglUtils.createProgramInfo(gl, [vs, fs]);
  
  //Carica il primo oggetto (aereo) in modo asincrono
  const planeObjHref = './src/plane.obj';
  const { parts: planeParts, obj: planeObj } = await loadPlane(gl, planeObjHref);
  // Calcola le dimensioni geometriche (bounding box) dell'oggetto aereo
  const planeExtents = getGeometriesExtents(planeObj.geometries);

  // Carica il secondo oggetto (elica) in modo asincrono
  const elicaObjHref = './src/elica.obj';
  const { parts: elicaParts, obj: elicaObj } = await loadPlane(gl, elicaObjHref);
  // Calcola le dimensioni geometriche (bounding box) dell'oggetto elica
  const elicaExtents = getGeometriesExtents(elicaObj.geometries);

  // Carica il terzo oggetto (world) in modo asincrono
  const worldObjHref = './src/world.obj';
  const { parts: worldParts, obj: worldObj } = await loadPlane(gl, worldObjHref);

   // Carica il terzo oggetto (world) in modo asincrono
   const fotoObjHref = './src/foto.obj';
   const { parts: fotoParts, obj: fotoObj } = await loadPlane(gl, fotoObjHref);

  // Carica il terzo oggetto (world) in modo asincrono
  const cubeObjHref = './src/cube.obj';
  const { parts: cubeParts, obj: cubeObj } = await loadPlane(gl, cubeObjHref);

  const parts = {
    plane: planeParts,
    elica: elicaParts,
    world: worldParts,
    foto: fotoParts,
    cube: cubeParts,
  };

  // Combina le estensioni per impostare la telecamera
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

  // Ottiene posizione della telecamera, target, offset oggetto, e piani di clipping basati sulle estensioni combinate
  const { cameraPosition, cameraTarget, objOffset, zNear, zFar } = setupCameraAndLight(gl, combinedExtents);

  setPlaneClipping(zNear,zFar);
  
  // Renderizza la scena con gli oggetti caricati e la configurazione della telecamera
  //renderScene(gl, meshProgramInfo, planeParts, elicaParts, cameraPosition, cameraTarget, objOffset, zNear, zFar);
  renderScene(gl, meshProgramInfo, parts, cameraPosition, cameraTarget, combinedExtents);

}


function setListener(){
  document.getElementById('camPosX').addEventListener('input', (event) => {
    console.log("CC")
    posCamPos[0] = parseInt(event.target.value);
  });
  
  document.getElementById('camPosY').addEventListener('input', (event) => {
    console.log("CC")
    posCamPos[1] = parseInt(event.target.value);
  });
  
  document.getElementById('camPosZ').addEventListener('input', (event) => {
    console.log("CC")
    posCamPos[2] = parseInt(event.target.value);
  });
  
  document.getElementById('camTargX').addEventListener('input', (event) => {
    posCamTarget[0] = parseInt(event.target.value);
  });
  
  document.getElementById('camTargY').addEventListener('input', (event) => {
    posCamTarget[1] = parseInt(event.target.value);
  });
  
  document.getElementById('camTargZ').addEventListener('input', (event) => {
    posCamTarget[2] = parseInt(event.target.value);
  });
  
  document.getElementById('planeTargX').addEventListener('input', (event) => {
    posPlane[0] = parseInt(event.target.value);
  });
  
  document.getElementById('planeTargY').addEventListener('input', (event) => {
    posPlane[1] = parseInt(event.target.value);
  });
  
  document.getElementById('planeTargZ').addEventListener('input', (event) => {
    posPlane[2] = parseInt(event.target.value);
  });
  
  
  document.getElementById('lX').addEventListener('input', (event) => {
    setLight(0,event.target.value);
  });
  document.getElementById('lY').addEventListener('input', (event) => {
    setLight(1,event.target.value);
  });
  document.getElementById('lZ').addEventListener('input', (event) => {
    setLight(2,event.target.value);
  });

}