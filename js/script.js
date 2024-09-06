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
  if (!gl) {return;} // Controlla se WebGL è supportato dal browser.
  const ext = gl.getExtension('WEBGL_depth_texture');
  if (!ext) {
    return alert('È necessaria l\'estensione WEBGL_depth_texture');
  }

  // Crea un programma WebGL utilizzando gli shader di vertex e frammento
  const meshProgramInfo = webglUtils.createProgramInfo(gl, [vs, fs]);
  const colorProgramInfo = webglUtils.createProgramInfo(gl, [vsColor, fsColor]);

  // Elenco di nomi di oggetti da caricare in modo asincrono.
  const objects = ['plane', 'elica', 'world', 'cube', 'obstacle', 'coin'];
  // Crea i percorsi dei file degli oggetti .obj da caricare.
  const objectPaths = objects.map(obj => `./src/${obj}.obj`);
  // Carica asincronicamente tutti gli oggetti specificati e calcola le loro estensioni geometriche.
  const loadedObjects = await Promise.all(objectPaths.map(path => loadPlane(gl, path)));
  // Crea un oggetto che mappa ogni nome di oggetto ai suoi componenti 3D caricati.
  const parts = Object.fromEntries(loadedObjects.map((obj, idx) => [objects[idx], obj.parts]));
  // Calcola le estensioni geometriche per ogni oggetto caricato.
  const extents = loadedObjects.map(obj => getGeometriesExtents(obj.obj.geometries));

  // Combina le estensioni dell'aereo e dell'elica per la configurazione della telecamera
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

  // Configura la telecamera e l'illuminazione in base alle estensioni combinate degli oggetti.
  setupCameraAndLight(combinedExtents);

  // Renderizza la scena del gioco utilizzando gli oggetti caricati e le informazioni della telecamera.
  renderSceneGame(gl, meshProgramInfo, colorProgramInfo, parts);
}

// Esegue la funzione principale per avviare l'applicazione
main();