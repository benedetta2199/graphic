"use strict";

import { parseOBJ, parseMTL, create1PixelTexture, createTexture, generateTangents } from './objLoad.js';

/**
 * Carica e analizza un file OBJ insieme ai relativi file MTL e texture.
 * @param {WebGLRenderingContext} gl - Contesto WebGL.
 * @param {string} objHref - Percorso del file OBJ.
 * @returns {Object} - Oggetto contenente le parti (buffer e materiali) e l'oggetto OBJ analizzato.
 */
export async function loadPlane(gl, objHref) {
  // Fetch e parsing del file OBJ
  const response = await fetch(objHref);
  const text = await response.text();
  const obj = parseOBJ(text);
  const baseHref = new URL(objHref, window.location.href);

  // Fetch e parsing dei file MTL associati
  const matTexts = await Promise.all(obj.materialLibs.map(async filename => {
    const matHref = new URL(filename, baseHref).href;
    const response = await fetch(matHref);
    return await response.text();
  }));
  const materials = parseMTL(matTexts.join('\n'));

  // Texture bianca di default
  const textures = {
    defaultWhite: create1PixelTexture(gl, [255, 255, 255, 255]),
  };

  // Caricamento delle texture definite nei file MTL
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

  // Proprietà del materiale di default
  const defaultMaterial = getDefaultMaterial(gl);

  // Elaborazione delle geometrie e creazione dei buffer
  const parts = obj.geometries.map(({ material, data }) => {
    // Gestione dei colori dei vertici o impostazione del colore bianco di default
    if (data.color) {
      if (data.position.length === data.color.length) {
        data.color = { numComponents: 3, data: data.color };
      }
    } else {
      data.color = { value: [1, 1, 1, 1] };
    }

    // Generazione delle tangenti se possibile
    if (data.texcoord && data.normal) {
      data.tangent = generateTangents(data.position, data.texcoord);
    } else {
      data.tangent = { value: [1, 0, 0] };
    }

    // Texcoord e normali di default se non presenti
    if (!data.texcoord) {
      data.texcoord = { value: [0, 0] };
    }
    if (!data.normal) {
      data.normal = { value: [0, 0, 1] };
    }

    // Unione delle proprietà dei materiali con i valori di default
    const materialProps = { ...defaultMaterial, ...materials[material] };

    // Creazione dei buffer
    const bufferInfo = webglUtils.createBufferInfoFromArrays(gl, data);
    return { material: materialProps, bufferInfo };
  });

  return { parts, obj };
}

/**
 * Ottiene le estensioni (bounding box) di un insieme di geometrie.
 * @param {Array} geometries - Array di oggetti geometria.
 * @returns {Object} - Oggetto contenente i valori minimi e massimi delle estensioni.
 */
export function getGeometriesExtents(geometries) {
  /**
   * Calcola le estensioni minime e massime di un insieme di posizioni.
   * @param {Array} positions - Array di posizioni dei vertici.
   * @returns {Object} - Oggetto contenente i valori minimi e massimi.
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

  // Riduce le geometrie a un singolo bounding box contenente le estensioni minime e massime
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

/**
 * Ottiene le proprietà del materiale di default.
 * @param {WebGLRenderingContext} gl - Contesto WebGL.
 * @returns {Object} - Oggetto contenente le proprietà del materiale di default.
 */
export function getDefaultMaterial(gl) {
  return {
    diffuse: [1, 1, 1],
    diffuseMap: create1PixelTexture(gl, [255, 255, 255, 255]),
    ambient: [0, 0, 0],
    specular: [1, 1, 1],
    shininess: 20,
    opacity: 1,
  };
}
