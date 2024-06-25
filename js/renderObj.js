"use strict";

import { canvasToWorld, posRelX } from './mousePosition.js';
import { getDefaultMaterial } from './planeLoader.js';
import { degToRad, enableNormalMap } from './utils.js';

/**
 * Render an object part with the specified world transformation matrix.
 * @param {WebGLRenderingContext} gl - WebGL context.
 * @param {Object} meshProgramInfo - Shader program information.
 * @param {Array} part - Object part to render.
 * @param {Object} u_world - World transformation matrix.
 */
/*
export function renderObj(gl, meshProgramInfo, part, u_world) {
  for (const { bufferInfo, material } of part) {
    webglUtils.setBuffersAndAttributes(gl, meshProgramInfo, bufferInfo);

    // Imposta le uniformi in base a useNormalMap
    const uniforms = { 
      u_world,
      u_useNormalMap: useNormalMap 
    };

    if (useNormalMap && material.normalMap) {
      uniforms.u_normalMap = material.normalMap;
    } else {
      uniforms.u_normalMap = getDefaultMaterial(gl).diffuseMap // Imposta una normalMap nulla
    }

    webglUtils.setUniforms(meshProgramInfo, uniforms, material);
    webglUtils.drawBufferInfo(gl, bufferInfo);
  }
}*/
export function renderObj(gl, meshProgramInfo, part, u_world) {
  for (const { bufferInfo, material } of part) {
    webglUtils.setBuffersAndAttributes(gl, meshProgramInfo, bufferInfo);

    // Aggiungi il flag `useNormalMap` ai uniform
    const uniforms = {
      u_world,
      useNormalMap: enableNormalMap?1.0:0.0,
      useTexure: enableNormalMap?1.0:0.0,
      ...material,
    };

    webglUtils.setUniforms(meshProgramInfo, uniforms);
    webglUtils.drawBufferInfo(gl, bufferInfo);
  }
}

/*
export function renderObj(gl, meshProgramInfo, part, u_world) {
  for (const { bufferInfo, material } of part) {
    webglUtils.setBuffersAndAttributes(gl, meshProgramInfo, bufferInfo);
    material.material = true;
    if (useNormalMap) {
      webglUtils.setUniforms(meshProgramInfo, { u_world }, material);
    } else {
      // Crea una copia del material senza la normal map
      const materialWithoutNormalMap = { ...material };
      useNormalMap
      delete materialWithoutNormalMap.u_normalMap; // Assumendo che la normal map sia in 'u_normalMap'
      console.log(materialWithoutNormalMap);
      webglUtils.setUniforms(meshProgramInfo, { u_world }, materialWithoutNormalMap);
    }
    webglUtils.drawBufferInfo(gl, bufferInfo);
  }
}*/

/**
 * Calculate the world transformation matrix for the plane.
 * @param {number} width - Canvas width.
 * @param {number} height - Canvas height.
 * @param {number} time - Current time.
 * @returns {Object} - World transformation matrix for the plane.
 */
export function u_worldPlane(width, height, time) {
  // Get the mouse Y position in the world coordinate system
  const worldMouseY = -canvasToWorld(height);
  
  // Set the plane's position based on mouse and keyboard input
  let u_world = m4.translation(-posRelX, worldMouseY, -25);
  u_world = m4.xRotate(u_world, degToRad(20));
  u_world = m4.yRotate(u_world, degToRad(5));
  
  // Apply a sinusoidal oscillation
  const oscillationAngle = Math.sin(time) * degToRad(3);
  u_world = m4.zRotate(u_world, oscillationAngle);
  
  return u_world;
}

/**
 * Calculate the world transformation matrix for the propeller.
 * @param {Object} u_world_plane - World transformation matrix of the plane.
 * @param {number} time - Current time.
 * @returns {Object} - World transformation matrix for the propeller.
 */
export function u_worldElica(u_world_plane, time) {
  return m4.xRotate(u_world_plane, -time);
}


/**
 * Calculate the world transformation matrix for the world object.
 * @param {number} time - Current time.
 * @returns {Object} - World transformation matrix for the world object.
 */
export function u_worldWorld(time) {
  const prop = 5;
  let u_world_world = m4.translation(0, -(prop * 2.5), -(prop * 10));
  u_world_world = m4.xRotate(u_world_world, degToRad(75));
  u_world_world = m4.yRotate(u_world_world, time / 20);
  u_world_world = m4.scale(u_world_world, prop * 4, prop * 3, prop * 4);
  return u_world_world;
}

/**
 * Calculate the world transformation matrix for the photo.
 * @returns {Object} - World transformation matrix for the photo.
 */
export function u_worldFoto() {
  const prop = 0.5;
  let u_world_foto = m4.translation(39, 111, 0);
  u_world_foto = m4.yRotate(u_world_foto, degToRad(-2));
  u_world_foto = m4.xRotate(u_world_foto, degToRad(2));
  u_world_foto = m4.scale(u_world_foto, prop, prop, prop);
  return u_world_foto;
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
export function u_worldCloud(time, y, z, scale, rotation) {
  const acc = time * (3.5 - scale);
  let u_world = m4.translation(100 - acc, y, z);
  u_world = m4.xRotate(u_world, degToRad(rotation));
  u_world = m4.scale(u_world, scale, scale, scale);
  return u_world;
}
