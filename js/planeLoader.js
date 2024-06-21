"use strict";
import { parseOBJ, parseMTL, create1PixelTexture, createTexture, generateTangents } from './objLoad.js';

export async function loadPlane(gl, objHref, color = null) {
  // Ottiene il contenuto del file obj tramite fetch
  const response = await fetch(objHref);
  const text = await response.text();
  // Parsa il contenuto obj in un formato utilizzabile
  const obj = parseOBJ(text);
  // Ottiene il percorso di base del file obj
  const baseHref = new URL(objHref, window.location.href);
  // Carica e parsa i materiali (MTL) associati al modello
  const matTexts = await Promise.all(obj.materialLibs.map(async filename => {
    const matHref = new URL(filename, baseHref).href;
    const response = await fetch(matHref);
    return await response.text();
  }));
  const materials = parseMTL(matTexts.join('\n'));

  // Oggetti texture predefiniti (bianco)
  const textures = {
    defaultWhite: create1PixelTexture(gl, [255, 255, 255, 255]),
  };

  // Carica le texture per i materiali definiti nel MTL
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

  // Proprietà predefinite per i materiali se non specificate nel MTL
  const defaultMaterial = {
    diffuse: [1, 1, 1],
    diffuseMap: textures.defaultWhite,
    ambient: [0, 0, 0],
    specular: [1, 1, 1],
    shininess: 20,
    opacity: 1,
  };

  const parts = obj.geometries.map(({material, data}) => {

    if (data.color) {
      if (data.position.length === data.color.length) {
        // it's 3. The our helper library assumes 4 so we need
        // to tell it there are only 3.
        data.color = { numComponents: 3, data: data.color };
      }
    } else {
      // there are no vertex colors so just use constant white
      data.color = { value: [1, 1, 1, 1] };
    }

    // generate tangents if we have the data to do so.
    if (data.texcoord && data.normal) {
      data.tangent = generateTangents(data.position, data.texcoord);
    } else {
      // There are no tangents
      data.tangent = { value: [1, 0, 0] };
    }

    if (!data.texcoord) {
      data.texcoord = { value: [0, 0] };
    }

    if (!data.normal) {
      // we probably want to generate normals if there are none
      data.normal = { value: [0, 0, 1] };
    }

    // Se viene fornito un colore, sovrascrivi il materiale diffuso
    const materialProps = {
      ...defaultMaterial,
      ...materials[material],
    };

    if (color) {
      console.log(color)
      materialProps.diffuse = color.map(c => c / 255); // Convert RGB to [0, 1]
    }

    // create a buffer for each array by calling
    // gl.createBuffer, gl.bindBuffer, gl.bufferData
    const bufferInfo = webglUtils.createBufferInfoFromArrays(gl, data);
    return {
      material: materialProps,
      bufferInfo,
    };
  });
  return { parts, obj };
}

export function changeColor(gl, materials, color=null) {
  /*const textures = {
    defaultWhite: create1PixelTexture(gl, [255, 255, 255, 255]),
  };

  // Copia le proprietà del materiale esistente
  const defaultMaterial = {
    diffuse: [1, 1, 1],
    diffuseMap: textures.defaultWhite,
    ambient: [0, 0, 0],
    specular: [1, 1, 1],
    shininess: 20,
    opacity: 1,
  };


  const materialProps = {
    ...defaultMaterial,
    ...materials
  };

  materialProps.diffuse = color.map(c => c / 255); // Converti RGB in [0, 1]

  return materialProps;*/
}

 /* 
  // Crea le parti del modello, associando materiali e dati geometrici
  const parts = obj.geometries.map(({ material, data }) => {
    if (data.color) {
      if (data.position.length === data.color.length) {
        data.color = { numComponents: 3, data: data.color };
      }
    } else {
      data.color = { value: [1, 1, 1, 1] };
    }

    // Se viene fornito un colore, sovrascrivi il materiale diffuso
    const materialProps = {
      ...defaultMaterial,
      ...materials[material],
    };
    if (color) {
      materialProps.diffuse = color.map(c => c / 255); // Convert RGB to [0, 1]
    }

    // Crea le informazioni di buffer WebGL dai dati geometrici
    const bufferInfo = webglUtils.createBufferInfoFromArrays(gl, data);
    return {
      material: materialProps,
      bufferInfo,
    };
  });

  // Restituisce le parti del modello e l'oggetto parsato
  return { parts, obj };
}*/


// Funzione per ottenere le estensioni geometriche (bounding box) di un insieme di geometrie
export function getGeometriesExtents(geometries) {
  // Funzione interna per calcolare le estensioni (minimo e massimo) di un set di posizioni
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

  // Riduce le geometrie in un singolo oggetto contenente minimo e massimo delle estensioni
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
