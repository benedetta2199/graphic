import { clouds, rand, removeCloud} from "./utils.js";
import { renderCloud, setCloud } from './cloud.js';
import { posPlane } from "./renderSceneEnd.js";
import { renderObj, u_worldElica,  u_worldPlane, u_worldWorld, u_worldFoto } from "./renderObjEnd.js";


let frameElement =0

export function drawScene(gl, programInfo, sharedUnifoms, parts) {
  
  frameElement++;
    
    gl.useProgram(programInfo.program);
    // set uniforms that are the same for both the sphere and plane
    webglUtils.setUniforms(programInfo, sharedUnifoms);

    // Render PLANE
    let u_world = u_worldPlane(gl.canvas.width, gl.canvas.height);
    u_world = m4.translate(u_world, posPlane[0], posPlane[1], posPlane[2]);
    renderObj(gl, programInfo, parts.plane, u_world);

    // Render ELICA
    renderObj(gl, programInfo, parts.elica, u_worldElica(u_world));

    // Render WORLD
    renderObj(gl, programInfo, parts.world, u_worldWorld(), true);

    // Render PHOTO
    renderObj(gl, programInfo, parts.foto, u_worldFoto(u_world), true);

    // Render CLOUD periodically
    if (frameElement % 300 === 0) {
      clouds.push(setCloud(rand(3, 6), { min: -20, max: 40 }));
      if (clouds.length > 20) {
        removeCloud();
      }
    }
    clouds.forEach(c => {
      renderCloud(gl, programInfo, parts.cube, c);
    });
  }
  