import { speed, timing, clouds, obstacles, coins, rand, removeCoin, removeCloud, removeObstacle, updateCoin  } from "./utils.js";
import { renderObj, u_worldElica,  u_worldPlane, u_worldWorld } from './renderObj.js';
import { renderCoin, renderObstacle, setCoin, setObstacle} from './collectibles.js';
import { renderCloud, setCloud } from './cloud.js';


let frameElement =0

export function drawScene(gl, programInfo, sharedUnifoms, parts) {
  
  frameElement++;
    
    gl.useProgram(programInfo.program);
    // set uniforms that are the same for both the sphere and plane
    webglUtils.setUniforms(programInfo, sharedUnifoms);


    // Render PLANE
    let u_world = u_worldPlane(gl.canvas.height);
    renderObj(gl, programInfo, parts.plane, u_world);

    
    // Render ELICA
    renderObj(gl, programInfo, parts.elica, u_worldElica(u_world));

    
    // Render WORLD
    renderObj(gl, programInfo, parts.world, u_worldWorld());

     // Render P
    /*let u_worldP = m4.translation(0, 60, -50);
    u_worldP = m4.scale(u_worldP, 80, 80, 80);
     renderObj(gl, programInfo, parts.p, u_worldP);*/

    // Render OBSTACLES periodically
    if (frameElement % timing.obstacle === 0) {
      obstacles.push(setObstacle());
      if (obstacles.length > 5000 / (timing.obstacle * speed.obstacle)) {
        removeObstacle();
      }
    }
    obstacles.forEach(data => {
      renderObstacle(gl, programInfo, parts.obstacle, data);
    });

    // Render COINS periodically
    if (frameElement % timing.coin === 0) {
      const numCoins = rand(1, 6);
      const amplitude = rand(3, 8);
      const yRotation = rand(45, 90);
      const y = rand(40, 120);
      for (let i = 0; i < numCoins; i++) {
        coins.push(setCoin(i, y, amplitude, yRotation));
      }
      if (coins.length > 30000 / (timing.coin * speed.coin)) {
        removeCoin();
      }
    }

    const newCoin = coins.filter(data => !renderCoin(gl, programInfo, parts.coin, data));
    if(newCoin.length<coins.length){
      updateCoin(newCoin);
    }

    // Render CLOUD periodically
    if (frameElement % timing.cloud === 0) {
      clouds.push(setCloud(rand(3, 9)));
      if (clouds.length > 5000 / (timing.cloud * speed.cloud)) {
        removeCloud();
      }
    }
    clouds.forEach(data => {
      renderCloud(gl, programInfo, parts.cube, data);
    });

  }
  