"use strict";


// This is not a full .obj parser.
// see http://paulbourke.net/dataformats/obj/

export function parseOBJ(text) {
    // because indices are base 1 let's just fill in the 0th data
    const objPositions = [[0, 0, 0]];
    const objTexcoords = [[0, 0]];
    const objNormals = [[0, 0, 0]];
    const objColors = [[0, 0, 0]];
  
    // same order as `f` indices
    const objVertexData = [
      objPositions,
      objTexcoords,
      objNormals,
      objColors,
    ];
  
    // same order as `f` indices
    let webglVertexData = [
      [],   // positions
      [],   // texcoords
      [],   // normals
      [],   // colors
    ];
  
    const materialLibs = [];
    const geometries = [];
    let geometry;
    let groups = ['default'];
    let material = 'default';
    let object = 'default';
  
    const noop = () => {};
  
    function newGeometry() {
      // If there is an existing geometry and it's
      // not empty then start a new one.
      if (geometry && geometry.data.position.length) {
        geometry = undefined;
      }
    }
  
    function setGeometry() {
      if (!geometry) {
        const position = [];
        const texcoord = [];
        const normal = [];
        const color = [];
        webglVertexData = [
          position,
          texcoord,
          normal,
          color,
        ];
        geometry = {
          object,
          groups,
          material,
          data: {
            position,
            texcoord,
            normal,
            color,
          },
        };
        geometries.push(geometry);
      }
    }
  
    function addVertex(vert) {
      const ptn = vert.split('/');
      ptn.forEach((objIndexStr, i) => {
        if (!objIndexStr) {
          return;
        }
        const objIndex = parseInt(objIndexStr);
        const index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);
        webglVertexData[i].push(...objVertexData[i][index]);
        // if this is the position index (index 0) and we parsed
        // vertex colors then copy the vertex colors to the webgl vertex color data
        if (i === 0 && objColors.length > 1) {
          geometry.data.color.push(...objColors[index]);
        }
      });
    }
  
    const keywords = {
      v(parts) {
        // if there are more than 3 values here they are vertex colors
        if (parts.length > 3) {
          objPositions.push(parts.slice(0, 3).map(parseFloat));
          objColors.push(parts.slice(3).map(parseFloat));
        } else {
          objPositions.push(parts.map(parseFloat));
        }
      },
      vn(parts) {
        objNormals.push(parts.map(parseFloat));
      },
      vt(parts) {
        // should check for missing v and extra w?
        objTexcoords.push(parts.map(parseFloat));
      },
      f(parts) {
        setGeometry();
        const numTriangles = parts.length - 2;
        for (let tri = 0; tri < numTriangles; ++tri) {
          addVertex(parts[0]);
          addVertex(parts[tri + 1]);
          addVertex(parts[tri + 2]);
        }
      },
      s: noop,    // smoothing group
      mtllib(parts, unparsedArgs) {
        // the spec says there can be multiple filenames here
        // but many exist with spaces in a single filename
        materialLibs.push(unparsedArgs);
      },
      usemtl(parts, unparsedArgs) {
        material = unparsedArgs;
        newGeometry();
      },
      g(parts) {
        groups = parts;
        newGeometry();
      },
      o(parts, unparsedArgs) {
        object = unparsedArgs;
        newGeometry();
      },
    };
  
    const keywordRE = /(\w*)(?: )*(.*)/;
    const lines = text.split('\n');
    for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
      const line = lines[lineNo].trim();
      if (line === '' || line.startsWith('#')) {
        continue;
      }
      const m = keywordRE.exec(line);
      if (!m) {
        continue;
      }
      const [, keyword, unparsedArgs] = m;
      const parts = line.split(/\s+/).slice(1);
      const handler = keywords[keyword];
      if (!handler) {
        /*da rimuovere nel caso*/
        console.warn('unhandled keyword:', keyword);  // eslint-disable-line no-console
        continue;
      }
      handler(parts, unparsedArgs);
    }
  
    // remove any arrays that have no entries.
    for (const geometry of geometries) {
      geometry.data = Object.fromEntries(
          Object.entries(geometry.data).filter(([, array]) => array.length > 0));
    }
  
    return {
      geometries,
      materialLibs,
    };
  }

export function parseMTL(text) {
    const materials = {};
    let material;
  
    const keywords = {
      newmtl(parts, unparsedArgs) {
        material = {};
        materials[unparsedArgs] = material;
      },
      /* eslint brace-style:0 */
      Ns(parts)       { material.shininess      = parseFloat(parts[0]); },
      Ka(parts)       { material.ambient        = parts.map(parseFloat); },
      Kd(parts)       { material.diffuse        = parts.map(parseFloat); },
      Ks(parts)       { material.specular       = parts.map(parseFloat); },
      Ke(parts)       { material.emissive       = parts.map(parseFloat); },
      map_Kd(parts, unparsedArgs)   { material.diffuseMap = parseMapArgs(unparsedArgs); },
      map_Ns(parts, unparsedArgs)   { material.specularMap = parseMapArgs(unparsedArgs); },
      map_Bump(parts, unparsedArgs) { material.normalMap = parseMapArgs(unparsedArgs); },
      Ni(parts)       { material.opticalDensity = parseFloat(parts[0]); },
      d(parts)        { material.opacity        = parseFloat(parts[0]); },
      illum(parts)    { material.illum          = parseInt(parts[0]); },
    };
  
    const keywordRE = /(\w*)(?: )*(.*)/;
    const lines = text.split('\n');
    for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
      const line = lines[lineNo].trim();
      if (line === '' || line.startsWith('#')) {
        continue;
      }
      const m = keywordRE.exec(line);
      if (!m) {
        continue;
      }
      const [, keyword, unparsedArgs] = m;
      const parts = line.split(/\s+/).slice(1);
      const handler = keywords[keyword];
      if (!handler) {
        console.warn('unhandled keyword:', keyword);  // eslint-disable-line no-console
        continue;
      }
      handler(parts, unparsedArgs);
    }
  
    return materials;
  }

  export function create1PixelTexture(gl, pixel) {
  const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
		new Uint8Array(pixel));
	return texture;
}

export function createTexture(gl, url) {
	const texture = create1PixelTexture(gl, [128, 192, 255, 255]);
	// Asynchronously load an image
	const image = new Image();
	image.src = url;
	image.addEventListener('load', function () {
		// Now that the image has loaded make copy it to the texture.
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

		// Check if the image is a power of 2 in both dimensions.
		if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
			// Yes, it's a power of 2. Generate mips.
			gl.generateMipmap(gl.TEXTURE_2D);
		} else {
			// No, it's not a power of 2. Turn of mips and set wrapping to clamp to edge
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		}
	});
	return texture;
}

export function createColoredTexture(gl, width, height, color) {
  // Crea un canvas per manipolare l'immagine della texture
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = width;
  canvas.height = height;

  // Riempie il canvas con il colore specificato
  ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3] || 255})`;
  ctx.fillRect(0, 0, width, height);

  // Crea una nuova texture con l'immagine colorata
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);

  // Gestisce le impostazioni delle texture
  if (isPowerOf2(width) && isPowerOf2(height)) {
    gl.generateMipmap(gl.TEXTURE_2D);
  } else {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  }

  return texture;
}

function parseMapArgs(unparsedArgs) {
  // TODO: handle options
  return unparsedArgs;
}
  
function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
  }

  
function makeIndexIterator(indices) {
  let ndx = 0;
  const fn = () => indices[ndx++];
  fn.reset = () => { ndx = 0; };
  fn.numElements = indices.length;
  return fn;
}

function makeUnindexedIterator(positions) {
  let ndx = 0;
  const fn = () => ndx++;
  fn.reset = () => { ndx = 0; };
  fn.numElements = positions.length / 3;
  return fn;
}

const subtractVector2 = (a, b) => a.map((v, ndx) => v - b[ndx]);

//NUOVE FUNTION
export function generateTangents(position, texcoord, indices) {
  const getNextIndex = indices ? makeIndexIterator(indices) : makeUnindexedIterator(position);
  const numFaceVerts = getNextIndex.numElements;
  const numFaces = numFaceVerts / 3;

  const tangents = [];
  for (let i = 0; i < numFaces; ++i) {
    const n1 = getNextIndex();
    const n2 = getNextIndex();
    const n3 = getNextIndex();

    const p1 = position.slice(n1 * 3, n1 * 3 + 3);
    const p2 = position.slice(n2 * 3, n2 * 3 + 3);
    const p3 = position.slice(n3 * 3, n3 * 3 + 3);

    const uv1 = texcoord.slice(n1 * 2, n1 * 2 + 2);
    const uv2 = texcoord.slice(n2 * 2, n2 * 2 + 2);
    const uv3 = texcoord.slice(n3 * 2, n3 * 2 + 2);

    const dp12 = m4.subtractVectors(p2, p1);
    const dp13 = m4.subtractVectors(p3, p1);

    const duv12 = subtractVector2(uv2, uv1);
    const duv13 = subtractVector2(uv3, uv1);

    const f = 1.0 / (duv12[0] * duv13[1] - duv13[0] * duv12[1]);
    const tangent = Number.isFinite(f)
      ? m4.normalize(m4.scaleVector(m4.subtractVectors(
          m4.scaleVector(dp12, duv13[1]),
          m4.scaleVector(dp13, duv12[1]),
        ), f))
      : [1, 0, 0];

    tangents.push(...tangent, ...tangent, ...tangent);
  }

  return tangents;
}


/*function createTexture(gl, url) {
    const texture = create1PixelTexture(gl, [128, 192, 255, 255]);
    // Asynchronously load an image
    const image = new Image();
    requestCORSIfNotSameOrigin(image, url)
    image.src = url;
    image.addEventListener('load', function() {
      // Now that the image has loaded make copy it to the texture.
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);
  
      // Check if the image is a power of 2 in both dimensions.
      if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
         // Yes, it's a power of 2. Generate mips.
         gl.generateMipmap(gl.TEXTURE_2D);
      } else {
         // No, it's not a power of 2. Turn of mips and set wrapping to clamp to edge
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      }
    });
    return texture;
  }
*/
  
// This is needed if the images are not on the same domain
// NOTE: The server providing the images must give CORS permissions
// in order to be able to use the image with WebGL. Most sites
// do NOT give permission.
// See: https://webglfundamentals.org/webgl/lessons/webgl-cors-permission.html
/*function requestCORSIfNotSameOrigin(img, url) {
    if ((new URL(url, window.location.href)).origin !== window.location.origin) {
      img.crossOrigin = "";
    }
  }*/