"use strict";

import { canvasToWorld, posRelX } from './mousePosition.js';
import { degToRad, enableNormalMap, enableTextureMap, time } from './utils.js';

/**
 * Renderizza l'oggetto nella scena 3D.
 * @param {WebGLRenderingContext} gl - Contesto WebGL.
 * @param {Object} meshProgramInfo - Informazioni sul programma shader.
 * @param {Array} part - Parte dell'oggetto da renderizzare.
 * @param {Object} u_world - Matrice di trasformazione del mondo.
 * @param {boolean} isTextured - Indica se applicare le texture.
 */
export function renderObj(gl, meshProgramInfo, part, u_world, isTextured=false) {
  part.forEach(({ bufferInfo, material }) => {
    // Aggiungi il flag `useNormalMap` ai uniform
    const uniforms = { u_world, useNormalMap: enableNormalMap, useTextureMap: enableTextureMap && isTextured, ...material,};
    webglUtils.setBuffersAndAttributes(gl, meshProgramInfo, bufferInfo);
    webglUtils.setUniforms(meshProgramInfo, uniforms);
    webglUtils.drawBufferInfo(gl, bufferInfo);
  });
}

/**
 * Calcola la matrice di trasformazione del mondo per il piano.
 * @param {number} height - Altezza del canvas.
 * @returns {Object} - Matrice di trasformazione del mondo per il piano.
 */
export function u_worldPlane(height) {
  // Ottieni la posizione Y del mouse nel sistema di coordinate del mondo
  const worldMouseY = -canvasToWorld(height);
  
  // Imposta la posizione del piano in base all'input del mouse e della tastiera
  let u_world = m4.translation(-posRelX, worldMouseY, -25);
  u_world = m4.xRotate(u_world, degToRad(20));
  u_world = m4.yRotate(u_world, degToRad(5));
  
  // Applica un'oscillazione sinusoidale
  const oscillationAngle = Math.sin(time) * degToRad(3);
  u_world = m4.zRotate(u_world, oscillationAngle);
  
  return u_world;
}

/**
 * Calcola la matrice di trasformazione del mondo per il piano finale.
 * @param {number} width - Larghezza del canvas.
 * @returns {Object} - Matrice di trasformazione del mondo per il piano finale.
 */
export function u_worldPlaneEnd(width) {
  let u_world = m4.translation(20, 120 + Math.sin(time * 0.2) * 2, 22 + width * 0.03);
  //  let u_world = m4.translation(160, -30 + Math.sin(time * 0.2) * 2, 8 + width * 0.03);
  u_world = m4.xRotate(u_world, degToRad(10));
  u_world = m4.yRotate(u_world, degToRad(30));
  u_world = m4.zRotate(u_world, degToRad(-40));
  u_world = m4.scale(u_world, 0.5, 0.5, 0.5);
  return u_world;
}

/**
 * Calcola la matrice di trasformazione del mondo per l'elica.
 * @param {Object} u_world_plane - Matrice di trasformazione del mondo del piano.
 * @param {number} time - Tempo corrente.
 * @returns {Object} - Matrice di trasformazione del mondo per l'elica.
 */
export function u_worldElica(u_world_plane) {
  return m4.xRotate(u_world_plane, -time);
}

/**
 * Calcola la matrice di trasformazione del mondo per la foto.
 * @param {Object} u_world_plane - Matrice di trasformazione del mondo del piano.
 * @returns {Object} - Matrice di trasformazione del mondo per la foto.
 */
export function u_worldFoto(u_world_plane) {
  let u_world = u_world_plane;
  u_world = m4.zRotate(u_world, degToRad(0));
  return u_world;
}

/**
 * Calcola la matrice di trasformazione del mondo per l'oggetto mondo.
 * @param {number} time - Tempo corrente.
 * @returns {Object} - Matrice di trasformazione del mondo per l'oggetto mondo.
 */
export function u_worldWorld() {
  const prop = 5;
  let u_world_world = m4.translation(0, -(prop * 10), -(prop * 25));
  u_world_world = m4.zRotate(u_world_world, time / 20);
  u_world_world = m4.scale(u_world_world, prop * 15, prop * 15, prop*15);
  return u_world_world;
}

/**
 * Calcola la matrice di trasformazione del mondo per l'oggetto mondo finale.
 * @param {number} time - Tempo corrente.
 * @returns {Object} - Matrice di trasformazione del mondo per l'oggetto mondo finale.
 */
export function u_worldWorldEnd() {
  const prop = 20;
  let u_world_world = m4.translation(prop, prop*2, -prop * 2);
  u_world_world = m4.xRotate(u_world_world, degToRad(45));
  u_world_world = m4.yRotate(u_world_world, time / 20);
  u_world_world = m4.scale(u_world_world, prop, prop, prop);
  return u_world_world;
}