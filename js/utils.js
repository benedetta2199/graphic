import { endGame } from "./endGame.js";

export let settings = {
  cameraX: 0,
  cameraY: 0,
  cameraZ: 0,
  posX: 2.5,
  posY: 4.8,
  posZ: 4.3,
  targetX: 0,
  targetY: 0,
  targetZ: 0,
  projWidth: 1,
  projHeight: 1,
  perspective: true,
  fieldOfView: 120,
  bias: -0.006,
};


/*                                CLIPPING                                 */
export let zNear = 0;
export let zFar = 0;
/**
 * Sets the near and far clipping planes.
 * @param {number} zN - Near clipping plane.
 * @param {number} zF - Far clipping plane.
 */
export function setPlaneClipping(zN, zF) {
  zNear = zN;
  zFar = zF;
}

//export let normalMapEnabled = true;
//export let texturesEnabled = true;

export let timing = { obstacle: 1000, coin: 1100, cloud: 600 };
export let speed = { obstacle: 1, coin: 2, cloud: 1 };


export let time = 0;
export function setTime(t) {
  time = t;
}


export const clouds = [];
export const obstacles = [];
export let coins = [];
export function updateCoin(c) {
  coins = c;
}
export function removeObstacle() {
  obstacles.shift();
}
export function removeCloud() {
  coins.shift();
}
export function removeCoin() {
  clouds.shift();
}



/*                                ALPHA                                 */
export let alphaEnable = true;
/**
 * Toggles the alpha enable flag.
 */
export function setAlpha() {
  alphaEnable = !alphaEnable;
}



/*                                NORMALMAP                                 */
/*Normal map is 0.0 (false) or 1.0 (true)*/
export let enableNormalMap = 0.0;
/**
 * Toggles the normalMap enable flag.
 */
export function setNormalMap() {
  enableNormalMap = !enableNormalMap ? 1.0 : 0.0;
}

/*                                TEXTUREMAP                                 */
/*Texture map is 0.0 (false) or 1.0 (true)*/
export let enableTextureMap = 0.0;
/**
 * Toggles the TextureMap enable flag.
 */
export function setTextureMap() {
  enableTextureMap = !enableTextureMap ? 1.0 : 0.0;
}

/*                              LIGHT AND CAMERA                                */
export let lightPosition = [0, 0, 0];
export let lightTarget = [0, 0, 0];
export let cameraTargetOffset = [0, 0, 0];
export let cameraTarget = [0, 0, 0];
/**
 * Sets the light value at the given index.
 * @param {number} i - Index.
 * @param {number} value - Light value.
 */
export function setLight(i, value) {
  lightPosition[i] = value;
}
export function setCameraTargetOffset(i, value) {
  cameraTargetOffset[i] = value;
}
export function setCameraTarget(i, value) {
  cameraTarget[i] = value;
}

export function beginLightCamera(l, lt, c, ct) {
  lightPosition = l;
  lightTarget = lt;
  cameraTargetOffset = c;
  cameraTarget = ct;
}



/*                                POINT                                 */
// Utility functions and game logic
let point = 0;
const elemPoint = document.getElementById('point');
/**
 * Increments the point counter and updates the display.
 */
export function incrementPoint() {
  point++;
  elemPoint.textContent = getPoint();
  if (point > 999) {
    point = 999;
    endGame();
  }
}
/**
 * Gets the point counter as a zero-padded string.
 * @returns {string} - Point counter as a zero-padded string.
 */
export function getPoint() {
  const str = '000' + point;
  return str.substring(str.length - 3);
}



/*                                PAUSE                                 */
export let isPaused = false;
export function setPause() {
  isPaused = true;
  setIsGame(false)
}


/*                         DINAMICA DI GIOCO                            */
export let isGame = false;
export let accumulatedTime = 0
let startTime = Date.now();
export function setIsGame(val) {
  if (val) {
    startTime = Date.now();
  }
  else {
    const currentTime = Date.now();
    accumulatedTime += Math.abs(currentTime - startTime);   
  }
  console.log(accumulatedTime);
  isGame = val;
}

/*                                SOUND                                 */
//Gestione tramite l'API Web Audio
export let isSound = false;
export let audioContext = null;
export let soundBuffer = {coin: null, gameover: null};

export function setIsSound(val){
  isSound = val;
}

// È possibile caricare il contesto audio solo dopo il primo click del mouse
document.body.addEventListener('click', ()=>{
  // Crea il contesto audio
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  // Carica e decodifica i file audio di gameover
  fetch('./src/gameover.mp3')
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
    .then(audioBuffer => {
      soundBuffer.gameover = audioBuffer;
    })
    .catch(e => console.error('Error with decoding audio data', e));
  fetch('./src/coin.mp3')
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
    .then(audioBuffer => {
      soundBuffer.coin = audioBuffer;
    })
    .catch(e => console.error('Error with decoding audio data', e));
}, { once: true });


/**
 * Generates a random number between min and max.
 * @param {number} min - Minimum value.
 * @param {number} max - Maximum value.
 * @returns {number} - Random number.
 */
export function rand(min, max) {
  return Math.random() * (max - min) + min;
}


/**
 * Converts degrees to radians.
 * @param {number} deg - Value in degrees.
 * @returns {number} - Value in radians.
 */
export function degToRad(deg) {
  return deg * Math.PI / 180;
}

