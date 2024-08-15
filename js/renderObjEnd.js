"use strict";

import { posRelX } from './mousePosition.js';
import { degToRad, enableNormalMap, enableTextureMap, time } from './utils.js';

/**
 * Render an object part with the specified world transformation matrix.
 * @param {WebGLRenderingContext} gl - WebGL context.
 * @param {Object} meshProgramInfo - Shader program information.
 * @param {Array} part - Object part to render.
 * @param {Object} u_world - World transformation matrix.
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
 * Calculate the world transformation matrix for the plane.
 * @param {number} width - Canvas width.
 * @returns {Object} - World transformation matrix for the plane.
 */
export function u_worldPlane(width) {
  let u_world = m4.translation(0, 120 + Math.sin(time * 0.2) * 2, 22 + width * 0.03);
  u_world = m4.xRotate(u_world, degToRad(20));
  u_world = m4.yRotate(u_world, degToRad(25));
  u_world = m4.scale(u_world, 1.5, 1.5, 1.5);
  u_world = m4.zRotate(u_world, degToRad(-30));
  return u_world;
}

/**
 * Calculate the world transformation matrix for the propeller.
 * @param {Object} u_world_plane - World transformation matrix of the plane.
 * @param {number} time - Current time.
 * @returns {Object} - World transformation matrix for the propeller.
 */
export function u_worldElica(u_world_plane) {
  return m4.xRotate(u_world_plane, -time);
}

/**
 * Calculate the world transformation matrix for the photo.
 * @param {Object} u_world_plane - World transformation matrix of the plane.
 * @returns {Object} - World transformation matrix for the photo.
 */
export function u_worldFoto(u_world_plane) {
  let u_world = u_world_plane;
  u_world = m4.zRotate(u_world, degToRad(10));
  return u_world;
}

/**
 * Calculate the world transformation matrix for the world object.
 * @param {number} time - Current time.
 * @returns {Object} - World transformation matrix for the world object.
 */
export function u_worldWorld() {
  const prop = 20;
  let u_world_world = m4.translation(prop, prop*2, -prop * 2);
  u_world_world = m4.xRotate(u_world_world, degToRad(45));
  u_world_world = m4.yRotate(u_world_world, time / 20);
  u_world_world = m4.scale(u_world_world, prop, prop, prop);
  return u_world_world;
}

/**
 * Calculate the world transformation matrix for a cloud.
 * @param {number} time - Current time.
 * @param {number} y - Y position of the cloud.
 * @param {number} z - Z position of the cloud.
 * @param {number} scale - Scale of the cloud.
 * @param {number} rotation - Rotation angle of the cloud.
 * @returns {Object} - World transformation matrix for the cloud.
 */
export function u_worldCloud(y, z, scale, rotation) {
  const acc = time * (3.5 - scale);
  let u_world = m4.translation(100 - acc, y, z);
  u_world = m4.xRotate(u_world, degToRad(rotation));
  u_world = m4.scale(u_world, scale, scale, scale);
  return u_world;
}
