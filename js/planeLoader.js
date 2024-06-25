"use strict";

import { parseOBJ, parseMTL, create1PixelTexture, createTexture, generateTangents } from './objLoad.js';

/**
 * Load and parse an OBJ file along with its associated MTL files and textures.
 * @param {WebGLRenderingContext} gl - WebGL context.
 * @param {string} objHref - Path to the OBJ file.
 * @returns {Object} - Object containing parts (buffers and materials) and the parsed OBJ object.
 */
export async function loadPlane(gl, objHref) {
  // Fetch and parse the OBJ file
  const response = await fetch(objHref);
  const text = await response.text();
  const obj = parseOBJ(text);
  const baseHref = new URL(objHref, window.location.href);

  // Fetch and parse the associated MTL files
  const matTexts = await Promise.all(obj.materialLibs.map(async filename => {
    const matHref = new URL(filename, baseHref).href;
    const response = await fetch(matHref);
    return await response.text();
  }));
  const materials = parseMTL(matTexts.join('\n'));

  // Default white texture
  const textures = {
    defaultWhite: create1PixelTexture(gl, [255, 255, 255, 255]),
  };

  // Load textures defined in the MTL files
  for (const material of Object.values(materials)) {
    Object.entries(material)
      .filter(([key]) => key.endsWith('Map'))
      .forEach(([key, filename]) => {
        let texture = textures[filename];
        if (!texture) {
          const textureHref = new URL(filename, baseHref).href;
          texture = createTexture(gl, textureHref);
          textures[filename] = texture;
        }
        material[key] = texture;
      });
  }

  // Default material properties
  const defaultMaterial = getDefaultMaterial(gl);

  // Process geometries and create buffers
  const parts = obj.geometries.map(({ material, data }) => {
    // Handle vertex colors or default to white
    if (data.color) {
      if (data.position.length === data.color.length) {
        data.color = { numComponents: 3, data: data.color };
      }
    } else {
      data.color = { value: [1, 1, 1, 1] };
    }

    // Generate tangents if possible
    if (data.texcoord && data.normal) {
      data.tangent = generateTangents(data.position, data.texcoord);
    } else {
      data.tangent = { value: [1, 0, 0] };
    }

    // Default texcoords and normals if not present
    if (!data.texcoord) {
      data.texcoord = { value: [0, 0] };
    }
    if (!data.normal) {
      data.normal = { value: [0, 0, 1] };
    }

    // Merge material properties with defaults
    const materialProps = { ...defaultMaterial, ...materials[material] };

    // Create buffers
    const bufferInfo = webglUtils.createBufferInfoFromArrays(gl, data);
    return { material: materialProps, bufferInfo };
  });

  return { parts, obj };
}

/**
 * Get the bounding box extents of a set of geometries.
 * @param {Array} geometries - Array of geometry objects.
 * @returns {Object} - Object containing min and max extents.
 */
export function getGeometriesExtents(geometries) {
  /**
   * Calculate the min and max extents of a set of positions.
   * @param {Array} positions - Array of vertex positions.
   * @returns {Object} - Object containing min and max values.
   */
  function getExtents(positions) {
    const min = positions.slice(0, 3);
    const max = positions.slice(0, 3);
    for (let i = 3; i < positions.length; i += 3) {
      for (let j = 0; j < 3; ++j) {
        const v = positions[i + j];
        min[j] = Math.min(v, min[j]);
        max[j] = Math.max(v, max[j]);
      }
    }
    return { min, max };
  }

  // Reduce geometries to a single bounding box containing the min and max extents
  return geometries.reduce(({ min, max }, { data }) => {
    const minMax = getExtents(data.position);
    return {
      min: min.map((min, ndx) => Math.min(minMax.min[ndx], min)),
      max: max.map((max, ndx) => Math.max(minMax.max[ndx], max)),
    };
  }, {
    min: Array(3).fill(Number.POSITIVE_INFINITY),
    max: Array(3).fill(Number.NEGATIVE_INFINITY),
  });
}

export function getDefaultMaterial(gl){
  return{
    diffuse: [1, 1, 1],
    diffuseMap: create1PixelTexture(gl, [255, 255, 255, 255]),
    ambient: [0, 0, 0],
    specular: [1, 1, 1],
    shininess: 20,
    opacity: 1,
  };
}