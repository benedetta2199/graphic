import { endGame } from "./endGame.js";

/*                                VERTEX - FRAGMENT SHADER                                 */
export const vs = `
attribute vec4 a_position;   // Vertex position in model space
attribute vec3 a_normal;     // Vertex normal in model space
attribute vec3 a_tangent;    // Vertex tangent in model space -> NORMAL MAP??
attribute vec2 a_texcoord;   // Texture coordinates
attribute vec4 a_color;      // Vertex color

uniform mat4 u_projection;   // Projection matrix
uniform mat4 u_view;         // View matrix
uniform mat4 u_world;        // World transformation matrix
uniform vec3 u_viewWorldPosition; // Camera position in world space
uniform mat4 u_textureMatrix;

varying vec3 v_normal;       // Normal to be passed to fragment shader
varying vec3 v_tangent;      // Tangent to be passed to fragment shader
varying vec3 v_surfaceToView; // Vector from surface to view to be passed to fragment shader
varying vec2 v_texcoord;     // Texture coordinates to be passed to fragment shader
varying vec4 v_color;        // Color to be passed to fragment shader
varying vec4 v_projectedTexcoord;

void main() {
  vec4 worldPosition = u_world * a_position; // Transform vertex position to world space
  gl_Position = u_projection * u_view * worldPosition; // Transform vertex position to clip space
  v_texcoord = a_texcoord; 
      //v_surfaceToView = u_viewWorldPosition - worldPosition.xyz; // Calculate vector from surface to view
  v_projectedTexcoord = u_textureMatrix * worldPosition;

  mat3 normalMat = mat3(u_world); // Extract 3x3 matrix for normal transformation
  v_normal = normalize(normalMat * a_normal); // Transform and normalize the normal
  v_tangent = normalize(normalMat * a_tangent); // Transform and normalize the tangent
  v_texcoord = a_texcoord; // Pass texture coordinates to fragment shader
  v_projectedTexcoord = u_textureMatrix * worldPosition;
  v_color = a_color; // Pass color to fragment shader
}
`;

export const fs = `
precision highp float; // Set precision for float variables

varying vec3 v_normal; // Interpolated normal from vertex shader
varying vec3 v_tangent; // Interpolated tangent from vertex shader
varying vec3 v_surfaceToView; // Interpolated vector from surface to view from vertex shader
varying vec2 v_texcoord;                // Interpolated texture coordinates from vertex shader
varying vec4 v_color;                   // Interpolated color from vertex shader
varying vec4 v_projectedTexcoord;

uniform vec3 diffuse;                   // Diffuse color -- u_texture di webgl
uniform sampler2D diffuseMap;           // Diffuse texture map
uniform vec3 ambient; // Ambient color
uniform vec3 emissive; // Emissive color
uniform vec3 specular; // Specular color
uniform sampler2D specularMap; // Specular texture map
uniform float shininess; // Shininess coefficient for specular highlight
uniform float opacity; // Opacity of the material
uniform vec3 u_lightDirection; // Direction of the light
uniform vec3 u_ambientLight; // Ambient light color
uniform sampler2D u_projectedTexture;
uniform sampler2D normalMap; // Normal map texture
uniform float useNormalMap; // Flag to determine if normal map should be used

uniform float u_bias;

void main () {
  vec3 normal = normalize(v_normal); // Normalize interpolated normal

  if (useNormalMap == 1.0) {
    vec3 tangent = normalize(v_tangent); // Normalize interpolated tangent
    vec3 bitangent = normalize(cross(normal, tangent)); // Compute bitangent as the cross product of normal and tangent
    
    mat3 tbn = mat3(tangent, bitangent, normal); // Create TBN matrix for transforming normals
    normal = texture2D(normalMap, v_texcoord).rgb * 2.0 - 1.0; // Sample the normal map and convert from [0,1] range to [-1,1] range
    normal = normalize(tbn * normal); // Transform and normalize the sampled normal
  }

  vec3 surfaceToViewDirection = normalize(v_surfaceToView); // Compute the view direction
  vec3 halfVector = normalize(u_lightDirection + surfaceToViewDirection); // Compute the half vector for specular lighting

  float fakeLight = dot(u_lightDirection, normal) * 0.6 + 0.6; // Compute the diffuse lighting component
  float specularLight = clamp(dot(normal, halfVector), 0.00001, 1.0); // Compute the specular lighting component

  vec4 specularMapColor = texture2D(specularMap, v_texcoord); // Sample the specular map
  vec3 effectiveSpecular = specular * specularMapColor.rgb; // Compute the effective specular color

  vec4 diffuseMapColor = texture2D(diffuseMap, v_texcoord); // Sample the diffuse map 
  vec3 effectiveDiffuse = diffuse * diffuseMapColor.rgb * v_color.rgb; // Compute the effective diffuse color
  float effectiveOpacity = opacity * diffuseMapColor.a * v_color.a; // Compute the effective opacity

  vec3 projectedTexcoord = v_projectedTexcoord.xyz / v_projectedTexcoord.w;
  
  float currentDepth = projectedTexcoord.z + u_bias;

   bool inRange = 
        projectedTexcoord.x >= 0.0 &&
        projectedTexcoord.x <= 1.0 &&
        projectedTexcoord.y >= 0.0 &&
        projectedTexcoord.y <= 1.0;
  
        //vec4 projectedTexColor = texture2D(u_projectedTexture, projectedTexcoord.xy);
      //vec4 texColor = texture2D(diffuse, v_texcoord) * u_colorMult;
    float projectedDepth = texture2D(u_projectedTexture, projectedTexcoord.xy).r;
    float shadowLight = (inRange && projectedDepth <= currentDepth) ? 0.6 : 0.8;  
  
  float projectedAmount = inRange ? 1.0 : 0.0;

    vec4 gCol = vec4(
      emissive + // Add emissive color
      ambient * u_ambientLight + // Add ambient color
      effectiveDiffuse * fakeLight + // Add diffuse lighting
      effectiveSpecular * pow(specularLight, shininess), // Add specular lighting
      effectiveOpacity // Set the final opacity
  );

  gl_FragColor = vec4(gCol.rgb * shadowLight, gCol.a);
  //gl_FragColor = mix(gCol, projectedTexColor, projectedAmount);
}
`;


export const vsColor = `
attribute vec4 a_position;

uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_world;

void main() {
  // Multiply the position by the matrices.
  gl_Position = u_projection * u_view * u_world * a_position;
}
`;
export const fsColor = `
precision mediump float;

uniform vec4 u_color;
void main() {
  gl_FragColor = u_color;
}
`;

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
export let enableNormalMap = false;
/**
 * Toggles the normalMap enable flag.
 */
export function setNormalMap() {
  enableNormalMap = !enableNormalMap;
}
;

/*                                LIGHT                                 */
export let lightPosition = [0, 0, 0];
export let lightTarget = [0, 0, 0];
export let cameraPosition = [0, 0, 0];
export let cameraTarget = [0, 0, 0];
/**
 * Sets the light value at the given index.
 * @param {number} i - Index.
 * @param {number} value - Light value.
 */
export function setLight(i, value) {
  lightPosition[i] = value;
}

export function beginLightCamera(l, lt, c, ct) {
  lightPosition = l;
  lightTarget = lt;
  cameraPosition = c;
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
}
/*                         DINAMICA DI GIOCO                            */
export let isGame = false;
export function setIsGame(val) {
  isGame = val;
}

/*                                SOUND                                 */
export let sound = {value:false, coin: null, gameOver: null}
export function setSound(coin, gameOver){
  sound.coin = coin;
  sound.gameOver = gameOver;
}
// Crea il contesto audio
export let audioContext = null;
export let soundBuffer = {coin: null, gameover: null};
document.body.addEventListener('click', ()=>{
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  // Carica e decodifica il file audio di gameover
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

export function setActiveSound(val){
  console.log(val)
  sound.value=val;
}


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

