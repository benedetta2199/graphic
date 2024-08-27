"use strict";

import { loadPlane, getGeometriesExtents } from './createObj.js';
import { setupCameraAndLight } from './cameraAndLight.js';
import { renderSceneGame } from './renderScene.js';
import { loadEndGameContent } from './endGame.js';
import { fs, fsColor, vs, vsColor } from './vsfs.js';

/**
 * Funzione principale per inizializzare e renderizzare la scena.
 */
async function main() {
  // Carica in anticipo il contenuto della fine del gioco
  loadEndGameContent();
  
  const canvas = document.querySelector("#canvas");
  const gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }
  const ext = gl.getExtension('WEBGL_depth_texture');
  if (!ext) {
    return alert('È necessaria l\'estensione WEBGL_depth_texture');
  }

  // Crea un programma WebGL utilizzando gli shader di vertex e frammento
  const meshProgramInfo = webglUtils.createProgramInfo(gl, [vs, fs]);
  const colorProgramInfo = webglUtils.createProgramInfo(gl, [vsColor, fsColor]);

  // Percorsi degli oggetti per il caricamento asincrono
  const objectPaths = {
    plane: './src/plane.obj',
    elica: './src/elica.obj',
    world: './src/world.obj',
    foto: './src/foto.obj',
    cube: './src/cube.obj',
    obstacle: './src/icosfera.obj',
    coin: './src/coin.obj',
  };

  // Carica asincronicamente tutti gli oggetti e calcola le loro estensioni
  const loadObject = async (href) => {
    return await loadPlane(gl, href);
  };

  const loadedObjects = await Promise.all(Object.entries(objectPaths).map(([key, path]) => loadObject(path)));

  const parts = Object.fromEntries(loadedObjects.map((obj, idx) => [Object.keys(objectPaths)[idx], obj.parts]));
  const extents = loadedObjects.slice(0, 2).map(obj => getGeometriesExtents(obj.obj.geometries)); // Calcola le estensioni solo per plane ed elica

  // Combina le estensioni per la configurazione della telecamera
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

  // Ottieni la posizione della telecamera, il target, l'offset dell'oggetto e i piani di clipping basati sulle estensioni combinate
  setupCameraAndLight(combinedExtents);

  // Renderizza la scena con gli oggetti caricati e la configurazione della telecamera
  renderSceneGame(gl, meshProgramInfo, colorProgramInfo, parts);
}

// Esegue la funzione principale per avviare l'applicazione
main();