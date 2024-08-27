"use strict";

import { checkCollisionCoin, checkCollisionObstacle } from './mousePosition.js';
import { renderObj } from './renderObj.js';
import { degToRad, enableNormalMap, enableTextureMap, rand, speed, time } from './utils.js';

/* OBSTACLE */
const sizeO = 5;
/*  range X > 110
    range Y 40-145 ??120??
    range Z < -50
    velocità oscillzione 50 100
*/

/**
 * Genera i parametri per la creazione di un ostacolo.
 * @returns {Object} - Oggetto con le proprietà dell'ostacolo (dimensione, posizione, rotazione, oscillazione, colore, velocità).
 */
export function setObstacle() {
    const s = rand(1, sizeO);
    const vel = rand(0.5, 1.5);
    const data = {
      elemS: s, 
      elemT: { x: rand(110, 170) + time * speed.obstacle * vel, y: rand(40, 120), z: -rand(20, 30) }, 
      elemR: { x: rand(0, 1), y: rand(0, 1), z: rand(0, 1) },
      elemO: rand(-0.5, 0.5),
      color: [rand(0.3, 0.9), rand(0.3, 0.9), rand(0.3, 0.9)], // Colori normalizzati
      //color: [rand(80, 230) / 255, rand(80, 230) / 255, rand(80, 230) / 255], // Colori normalizzati
      speed: vel
    };

    return data;
}

/**
 * Calcola la matrice di trasformazione per un ostacolo.
 * @param {Object} data - Dati dell'ostacolo (posizione, dimensione, rotazione, oscillazione, velocità).
 * @returns {Object} - Matrice di trasformazione per l'ostacolo.
 */
function u_worldObstacle(data) {
    const frequency = 0.5;  // Frequenza dell'oscillazione
    const rotationY = Math.PI / 2 * Math.sin(time / 100 * frequency); // Rotazione oscillatoria (mezza circonferenza)
    const elemT = data.elemT;
    const elemS = data.elemS;
    const elemR = data.elemR;
    const elemO = data.elemO;
    const pos = { x: elemT.x - (time * speed.obstacle * data.speed), y: elemT.y + Math.sin(time * elemO) };
    var u_world = m4.translation(pos.x, pos.y, elemT.z + Math.sin(time * elemO)); // Posiziona l'oggetto 
    u_world = m4.xRotate(u_world, 0 - elemR.x);
    u_world = m4.yRotate(u_world, 90 - rotationY - elemR.y);
    u_world = m4.zRotate(u_world, 45 + elemR.z);
    u_world = m4.scale(u_world, elemS, elemS, elemS); // Scala l'oggetto
    checkCollisionObstacle(pos);
    return u_world;
}

/**
 * Renderizza gli ostacoli nella scena 3D.
 * @param {Object} gl - Contesto WebGL.
 * @param {Object} meshProgramInfo - Informazioni sul programma di rendering.
 * @param {Object} obstacle - Dati del modello 3D dell'ostacolo.
 * @param {Object} data - Dati dell'ostacolo da renderizzare.
 * @param {boolean} isTextured - Indica se applicare texture o meno.
 */
export function renderObstacle(gl, meshProgramInfo, obstacle, data) {
    for (const { bufferInfo, material } of obstacle) {
        webglUtils.setBuffersAndAttributes(gl, meshProgramInfo, bufferInfo);
        const updatedMaterial = {
            ...material,
            diffuse: data.color,
            u_world: u_worldObstacle(data),
            useNormalMap: enableNormalMap, 
            useTextureMap: 0.0
        };
        webglUtils.setUniforms(meshProgramInfo, updatedMaterial);
        webglUtils.drawBufferInfo(gl, bufferInfo);
    }
}

/* COIN */

/**
 * Genera i parametri per la creazione di una moneta.
 * @param {number} i - Indice della moneta.
 * @param {number} yDistr - Distribuzione verticale della moneta.
 * @param {number} ampiezza - Ampiezza del movimento sinusoidale.
 * @param {number} yRot - Rotazione sull'asse Y.
 * @returns {Object} - Oggetto con le proprietà della moneta.
 */
export function setCoin(i, yDistr, ampiezza, yRot) {
    return {
        elemS: 6, 
        elemT: { x: 120 + i * rand(8, 12) + (time * speed.coin), y: yDistr + Math.sin(i) * ampiezza, z: -23 },
        elemR: { x: rand(20, 60), y: yRot, z: 0 },
        elemO: rand(-0.5, 0.5)
    };
}

/**
 * Calcola la matrice di trasformazione per una moneta e verifica la collisione.
 * @param {Object} d - Dati della moneta (posizione, dimensione, rotazione, oscillazione).
 * @returns {Object} - Matrice di trasformazione e stato della collisione.
 */
function u_worldCoin(d) {
    const elemS = d.elemS;
    const pos = { x: d.elemT.x - (time * speed.coin), y: d.elemT.y + Math.sin(time * d.elemO) };
    var u_world = m4.translation(pos.x, pos.y, d.elemT.z);
    u_world = m4.xRotate(u_world, -degToRad(d.elemR.x));
    u_world = m4.yRotate(u_world, degToRad(d.elemR.y - time));
    u_world = m4.scale(u_world, elemS, elemS, elemS); // Scala l'oggetto
    const collision = checkCollisionCoin(pos);
    return { u_world, collision };
}

/**
 * Renderizza una moneta nella scena 3D.
 * @param {Object} gl - Contesto WebGL.
 * @param {Object} meshProgramInfo - Informazioni sul programma di rendering.
 * @param {Object} coin - Dati del modello 3D della moneta.
 * @param {Object} data - Dati della moneta da renderizzare.
 * @returns {boolean} - Indica se si è verificata una collisione.
 */
export function renderCoin(gl, meshProgramInfo, coin, data) {
    const { u_world, collision } = u_worldCoin(data, time);
    renderObj(gl, meshProgramInfo, coin, u_world, true);

    return collision;  
}
