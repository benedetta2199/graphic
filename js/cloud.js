"use strict";

import { renderObj } from './renderObj.js';
import { rand, speed, time } from './utils.js';

const size = 4;

/**
 * Imposta i parametri delle nuvole da generare nella scena.
 * @param {number} n - Numero di nuvole da creare.
 * @param {boolean} isEndScene - Indica se è la scena finale.
 * @returns {Array} - Un array contenente i dati dei cubi della nuvola creata (dimensione, posizione, rotazione, oscillazione).
 */
export function setCloud(n, isEndScene) {
    const data = [];
    const yCloud = yRandValue(isEndScene);
    const zCloud = zRandValue(isEndScene);
    
    for (let i = 0; i < n; i++) {
        const s = rand(1, size);
        const rangeX = s * n/3;
        data[i] = {
            elemS: s, 
            elemT: [150 - rand(-rangeX, rangeX) + (time * speed.cloud), yCloud + rand(-s, s), -(zCloud + rand(0, s))], 
            elemR: s/rand(size * 25, size * 100),
            elemO: rand(-0.5, 0.5)
        };
    }

    return data;
}

/**
 * Calcola un valore casuale per la posizione Y delle nuvole.
 * @param {boolean} isEndScene - Indica se è la scena finale.
 * @returns {number} - Valore casuale della posizione Y.
 */
function yRandValue(isEndScene) {
    return isEndScene ? rand(20, 145) : rand(15, 180);
}

/**
 * Calcola un valore casuale per la posizione Z delle nuvole.
 * @param {boolean} isEndScene - Indica se è la scena finale.
 * @returns {number} - Valore casuale della posizione Z.
 */
function zRandValue(isEndScene) {
    return isEndScene ? rand(-80, 150) : rand(80, 150);
}

/**
 * Calcola la matrice di trasformazione per un singolo cubo che compone la nuvola.
 * @param {Object} data - Dati del cubo (posizione, dimensione, rotazione, oscillazione).
 * @returns {Object} - Matrice di trasformazione per il cubo.
 */
function u_worldCube(data) {
    const elemT = data.elemT;
    const elemS = data.elemS;
    const elemR = data.elemR;
    const elemO = data.elemO;
    var u_world = m4.translation(elemT[0] - (time * speed.cloud), elemT[1] + Math.sin(time * elemO), elemT[2] + Math.sin(time * elemO)); // Posiziona l'oggetto 
    u_world = m4.yRotate(u_world, elemR * time);
    u_world = m4.xRotate(u_world, -elemR * time);
    u_world = m4.scale(u_world, elemS, elemS, elemS);
    return u_world;
}

/**
 * Renderizza la nuvola nella scena 3D.
 * @param {Object} gl - Contesto WebGL.
 * @param {Object} meshProgramInfo - Informazioni sul programma di rendering.
 * @param {Object} cube - Dati del modello 3D delle nuvole.
 * @param {Array} data - Dati delle nuvole da renderizzare.
 */
export function renderCloud(gl, meshProgramInfo, cube, data) {
    for (var i = 0; i < data.length; i++) {
        renderObj(gl, meshProgramInfo, cube, u_worldCube(data[i]), true);
    }    
}
