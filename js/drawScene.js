import { speed, timing, clouds, obstacles, coins, rand, removeCoin, removeCloud, removeObstacle, updateCoin } from "./utils.js";
import { renderCoin, renderObstacle, setCoin, setObstacle } from "./collectibles.js";
import { renderCloud, setCloud } from "./cloud.js";
import { renderObj, u_worldElica, u_worldPlane, u_worldFoto, u_worldPlaneEnd, u_worldWorldEnd, u_worldWorld } from "./renderObj.js";
import { posPlane } from "./renderScene.js";

let frameElement = 0;

/**
 * Esegue il rendering della scena principale, gestendo la logica di rendering
 * degli oggetti e la loro visualizzazione nelle fasi di gioco normale e di fine gioco.
 * @param {WebGLRenderingContext} gl - Contesto WebGL.
 * @param {Object} programInfo - Informazioni sul programma WebGL utilizzato per il rendering.
 * @param {Object} sharedUnifoms - Uniform comuni tra vari oggetti nella scena.
 * @param {Object} parts - Parti del modello (aereo, elica, mondo, ecc.).
 * @param {boolean} isEndScene - Indica se è la scena di fine gioco.
 */
export function drawScene(gl, programInfo, sharedUnifoms, parts, isEndScene) {
  frameElement++;

  gl.useProgram(programInfo.program);
  webglUtils.setUniforms(programInfo, sharedUnifoms);

  // Render AEREO
  let u_world = isEndScene ? u_worldPlaneEnd(gl.canvas.height) : u_worldPlane(gl.canvas.width);
  if (isEndScene) {
    u_world = m4.translate(u_world, posPlane[0], posPlane[1], posPlane[2]);
  }
  renderObj(gl, programInfo, parts.plane, u_world, true);

  // Render ELICA
  renderObj(gl, programInfo, parts.elica, u_worldElica(u_world));

  // Render MONDO
  let u_worldW = isEndScene ? u_worldWorldEnd() : u_worldWorld();
  renderObj(gl, programInfo, parts.world, u_worldW, true);

  // Renderizza la FOTO nella scena finale
  if (isEndScene) {
    renderObj(gl, programInfo, parts.foto, u_worldFoto(u_world), true);
  }

  
  if (!isEndScene){ 
    // Aggiunta e rimozione OSTACOLO periodicamente
    if(frameElement % timing.obstacle === 0) {
      obstacles.push(setObstacle());
      if (obstacles.length > 7000 / (timing.obstacle * speed.obstacle)) {
        removeObstacle();
      }
    }

    // Render OSTACOLI
    obstacles.forEach((data) => {
      renderObstacle(gl, programInfo, parts.obstacle, data);
    });


    // Aggiunta e/o rimozione MONETE periodicamente
    if (frameElement % timing.coin === 0) {
      const numCoins = rand(1, 6);
      const amplitude = rand(3, 8);
      const yRotation = rand(45, 90);
      const y = rand(40, 120);
      for (let i = 0; i < numCoins; i++) {
        coins.push(setCoin(i, y, amplitude, yRotation));
      }
      if (coins.length > 40000 / (timing.coin * speed.coin)) {
        removeCoin();
      }
    }

    // Render MONETE
    const newCoin = coins.filter((data) => !renderCoin(gl, programInfo, parts.coin, data));
    if (newCoin.length < coins.length) {
      updateCoin(newCoin);
    }
  }

  // Aggiunta e/o rimozione NUVOLE periodicamente
  const cloudTiming = isEndScene ? 300 : timing.cloud;
  if (frameElement % cloudTiming === 0) {
    clouds.push(setCloud(rand(3, isEndScene ? 6 : 9), isEndScene), isEndScene);
    const maxClouds = isEndScene ? 20 : 5000 / (timing.cloud * speed.cloud);
    if (clouds.length > maxClouds) {
      removeCloud();
    }
  }

  // Render NUVOLE
  clouds.forEach((data) => {
    renderCloud(gl, programInfo, parts.cube, data);
  });
}
