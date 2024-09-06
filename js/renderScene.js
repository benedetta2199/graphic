"use strict";

import { setCloud } from './cloud.js';
import { setListener } from './mousePosition.js';
import { setCoin, setObstacle } from './collectibles.js';
import { degToRad, rand, alphaEnable, zFar, zNear, setTime, clouds, obstacles, coins, intensityLight, lightPosition, lightTarget, cameraTargetOffset, cameraTarget } from './utils.js';
import { drawScene } from './drawScene.js';
import { createDepthFramebuffer, createDepthTexture } from './objLoad.js';

export let posPlane = [170, -30, -20];

/**
 * Renderizza la scena di gioco, impostando gli oggetti di gioco e chiamando la funzione di rendering.
 * @param {WebGLRenderingContext} gl - Contesto WebGL.
 * @param {Object} meshProgramInfo - Informazioni sul programma shader per il rendering.
 * @param {Object} colorProgramInfo - Informazioni sul programma shader per il colore.
 * @param {Array} parts - Parti dell'oggetto da renderizzare.
 */
export function renderSceneGame(gl, meshProgramInfo, colorProgramInfo, parts) {
    setListener(gl);

    clouds.push(setCloud(rand(4, 9), false)); // Aggiunge una nuvola alla scena
    obstacles.push(setObstacle()); // Aggiunge un ostacolo alla scena
    coins.push(setCoin(0, rand(3, 8), rand(45, 90))); // Aggiunge una moneta alla scena

    renderScene(gl, meshProgramInfo, colorProgramInfo, parts, false);
}

/**
 * Renderizza la scena finale, impostando gli oggetti di gioco e chiamando la funzione di rendering.
 * @param {WebGLRenderingContext} gl - Contesto WebGL.
 * @param {Object} meshProgramInfo - Informazioni sul programma shader per il rendering.
 * @param {Object} colorProgramInfo - Informazioni sul programma shader per il colore.
 * @param {Array} parts - Parti dell'oggetto da renderizzare.
 */
export function renderSceneEnd(gl, meshProgramInfo, colorProgramInfo, parts) {
    clouds.push(setCloud(rand(4, 9), true)); // Aggiunge una nuvola alla scena finale
    
    renderScene(gl, meshProgramInfo, colorProgramInfo, parts, true);
}

/**
 * Renderizza la scena in base ai parametri forniti, gestendo la prospettiva e le ombre.
 * @param {WebGLRenderingContext} gl - Contesto WebGL.
 * @param {Object} meshProgramInfo - Informazioni sul programma shader per il rendering.
 * @param {Object} colorProgramInfo - Informazioni sul programma shader per il colore.
 * @param {Array} parts - Parti dell'oggetto da renderizzare.
 * @param {boolean} isEndScene - Indica se si tratta della scena finale.
 */
export function renderScene(gl, meshProgramInfo, colorProgramInfo, parts, isEndScene ) {
    const up = [0, 1, 0]; // orientamento verso l'alto nella scena (asse Y positivo).
    const fieldOfViewRadians = degToRad(60); // campo visivo della telecamera in radianti.

    const depthTextureSize = 2048; // dimensione della texture di profondità
    const depthTexture = createDepthTexture(gl, depthTextureSize); // texture di profondità
    const depthFramebuffer = createDepthFramebuffer(gl, depthTexture); // framebuffer associato alla texture di profondità per renderizzare ombre.

    gl.enable(gl.CULL_FACE); // Abilita la cull face, che scarta i poligoni non visibili (ottimizzazione).
    gl.enable(gl.DEPTH_TEST); // Abilita il depth test, che assicura che i pixel più vicini alla telecamera siano renderizzati.

    webglUtils.resizeCanvasToDisplaySize(gl.canvas); // ridimensiona il canvas WebGL alla dimensione effettiva di visualizzazione.

    function render(time) {

        time *= 0.006; // Converti il tempo in secondi
        setTime(time);

        const cameraPosition = m4.addVectors(cameraTarget, cameraTargetOffset);
        
        if (alphaEnable) {
            gl.enable(gl.BLEND); // abilita il blending e definisce la funzione di blending.
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); // definisce la funzione di blending.
        } else {
            gl.disable(gl.BLEND);
        }

        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const projection = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar); // matrice di proiezione prospettica.
        
        const lightMatrix = m4.lookAt(lightPosition, lightTarget, up);
        const lightProjectionMatrix = isEndScene ?
            m4.perspective(fieldOfViewRadians, aspect, 15, 250) :
            m4.orthographic(-100, 100, -150, 50, 0.5, 250 );

        gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer); // Associa il framebuffer di profondità per renderizzare le ombre.
        gl.viewport(0, 0, depthTextureSize, depthTextureSize);  // Imposta il viewport alla dimensione della texture di profondità.
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // Pulisce (clear) il buffer del colore e della profondità.

        // Uniform per il rendering delle ombre
        const sharedShadowUniforms = {
            u_lightDirection: m4.normalize(lightPosition),
            u_view: m4.inverse(lightMatrix),
            u_projection: lightProjectionMatrix,
            u_textureMatrix: m4.identity(),
            u_projectedTexture: depthTexture,
            u_bias: -0.02,
        };
        drawScene(gl, colorProgramInfo, sharedShadowUniforms, parts, isEndScene);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null); // Disassocia il framebuffer (torna a renderizzare sul canvas).
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height); // Reimposta il viewport alla dimensione del canvas.
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // Pulisce di nuovo il buffer del colore e della profondità per il rendering finale.

        let textureMatrix = m4.identity();
        textureMatrix = m4.translate(textureMatrix, 0.5, 0.5, 0.5);
        textureMatrix = m4.scale(textureMatrix, 0.5, 0.5, 0.5);
        textureMatrix = m4.multiply(textureMatrix, lightProjectionMatrix);
        textureMatrix = m4.multiply(textureMatrix, m4.inverse(lightMatrix));

        const cameraMatrix = m4.lookAt(cameraPosition, cameraTarget, up);
        const view = m4.inverse(cameraMatrix);

        // Uniform per il rendering degli oggetti,
        let sharedUniforms = {
            u_lightDirection: m4.normalize(lightPosition),
            u_view: view,
            u_projection: projection,
            u_viewWorldPosition: cameraPosition,
            u_textureMatrix: textureMatrix,
            u_projectedTexture: depthTexture,
            u_bias: -0.02,
            useIntensityLight: intensityLight,
        };

        drawScene(gl, meshProgramInfo, sharedUniforms, parts, isEndScene);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}