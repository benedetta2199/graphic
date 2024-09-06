"use strict";

import { loadPlane, getGeometriesExtents } from './createObj.js';
import { setPlaneClipping, zNear, zFar, setCameraTargetOffset, setCameraTarget, setIntensityLight } from './utils.js';
import { setAlpha, alphaEnable, setLight, enableNormalMap, setNormalMap, enableTextureMap, setTextureMap} from "./utils.js";
import { setupCameraAndLightEnd } from './cameraAndLight.js';
import { renderSceneEnd, posPlane } from './renderScene.js';
import { fs, fsColor, vs, vsColor } from './vsfs.js';


/**
 * Main function to initialize and render the scene.
 */
export async function main() {

  setListener();

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
  const objects = ['plane', 'elica', 'world', 'foto', 'cube'];
  // Crea i percorsi dei file degli oggetti .obj da caricare.
  const objectPaths = objects.map(obj => `./src/${obj}.obj`);
  // Carica asincronicamente tutti gli oggetti specificati e calcola le loro estensioni geometriche.
  const loadedObjects = await Promise.all(objectPaths.map(path => loadPlane(gl, path)));
  // Crea un oggetto che mappa ogni nome di oggetto ai suoi componenti 3D caricati.
  const parts = Object.fromEntries(loadedObjects.map((obj, idx) => [objects[idx], obj.parts]));
  // Calcola le estensioni geometriche per ogni oggetto caricato.
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

  // Configura la telecamera e l'illuminazione in base alle estensioni combinate degli oggetti.
  setupCameraAndLightEnd(combinedExtents);

 // Renderizza la scena del gioco utilizzando gli oggetti caricati e le informazioni della telecamera.
  renderSceneEnd(gl, meshProgramInfo, colorProgramInfo, parts);
}

/**
 * Sets up event listeners for camera and light controls.
 */
function setListener() {

  const canvas = document.getElementById('canvas');
  const radioButtons = document.querySelectorAll('input[name="timeOfDay"]');

  const backgrounds = {
      alba: 'radial-gradient(ellipse at center bottom, #f4ecbc 0%, #f4dfbd 43%, #f4bcd6 100%)',
      giorno: 'radial-gradient(ellipse at center bottom, #397cb6 0%, #ccdfef 89%, #e4f0df 105%)',
      notte: 'radial-gradient(ellipse at center bottom, #000b15 0%, #072d4d 89%, #2f456b 105%)'
  };

  radioButtons.forEach(radio => {
      radio.addEventListener('change', (event) => {
          const selectedValue = event.target.value;
          canvas.style.background = backgrounds[selectedValue];
          setIntensityLight(selectedValue);
      });
  });

  const buttons = {
    alpha: document.getElementById('alpha'),
    normalMap: document.getElementById('normalMap'),
    textureMap: document.getElementById('textureMap'),
  };

  toggleButton(buttons.alpha, !alphaEnable);
  toggleButton(buttons.normalMap, !enableNormalMap);
  toggleButton(buttons.textureMap, !enableTextureMap);

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
      setter(index, value);
    });
  });
}

function toggleButton(button, isActive) {
  button.classList.toggle('active', !isActive);
  button.classList.toggle('inactive', isActive);
}