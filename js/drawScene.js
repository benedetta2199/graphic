import {speed, timing, clouds, obstacles, coins, rand, removeCoin, removeCloud, removeObstacle, updateCoin } from "./utils.js";
import { renderCoin, renderObstacle, setCoin, setObstacle } from "./collectibles.js";
import { renderCloud, setCloud } from "./cloud.js";
import { renderObj, u_worldElica, u_worldPlane, u_worldFoto, u_worldPlaneEnd, u_worldWorldEnd, u_worldWorld } from "./renderObj.js";
import { posPlane } from "./renderScene.js";

let frameElement = 0;

export function drawScene(gl, programInfo, sharedUnifoms, parts, isEndScene) {
  frameElement++;

  gl.useProgram(programInfo.program);
  // Set uniforms that are the same for both the sphere and plane
  webglUtils.setUniforms(programInfo, sharedUnifoms);

  // Render PLANE
  let u_world = isEndScene ? u_worldPlaneEnd(gl.canvas.height) : u_worldPlane(gl.canvas.width);

  if (isEndScene) {
    u_world = m4.translate(u_world, posPlane[0], posPlane[1], posPlane[2]);
  }
  renderObj(gl, programInfo, parts.plane, u_world);

  // Render ELICA
  renderObj(gl, programInfo, parts.elica, u_worldElica(u_world));

  // Render WORLD
  let u_worldW = isEndScene ? u_worldWorldEnd() : u_worldWorld();
  renderObj(gl, programInfo, parts.world, u_worldW, true);

  // Conditionally Render PHOTO in the end scene
  if (isEndScene) {
    renderObj(gl, programInfo, parts.foto, u_worldFoto(u_world), true);
  }

  // Render OBSTACLES periodically (only in the non-end scene)
  if (!isEndScene){ 
    if(frameElement % timing.obstacle === 0) {
      obstacles.push(setObstacle());
      if (obstacles.length > 5000 / (timing.obstacle * speed.obstacle)) {
        removeObstacle();
      }
    }
    obstacles.forEach((data) => {
      renderObstacle(gl, programInfo, parts.obstacle, data);
    });

    // Render COINS periodically (only in the non-end scene)
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

    const newCoin = coins.filter((data) => !renderCoin(gl, programInfo, parts.coin, data));
    if (newCoin.length < coins.length) {
      updateCoin(newCoin);
    }
  }

  // Render CLOUD periodically
  const cloudTiming = isEndScene ? 300 : timing.cloud;
  if (frameElement % cloudTiming === 0) {
    //const cloudRange = isEndScene ? { min: -40, max: 80 } : undefined;
    clouds.push(setCloud(rand(3, isEndScene ? 6 : 9), isEndScene), isEndScene);
    const maxClouds = isEndScene ? 20 : 5000 / (timing.cloud * speed.cloud);
    if (clouds.length > maxClouds) {
      removeCloud();
    }
  }
  clouds.forEach((data) => {
    renderCloud(gl, programInfo, parts.cube, data);
  });
}
