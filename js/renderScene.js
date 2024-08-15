"use strict";

import { setCloud } from './cloud.js';
import { setListener } from './mousePosition.js';
import { setCoin, setObstacle } from './collectibles.js';
import { degToRad, rand, alphaEnable, zFar, zNear, setTime, clouds, obstacles, coins, lightPosition, lightTarget, cameraTargetOffset, cameraTarget } from './utils.js';
import { drawScene } from './drawScene.js';
import { createDepthFramebuffer, createDepthTexture } from './objLoad.js';

export let posPlane = [0, 0, 0];

export function renderSceneGame(gl, meshProgramInfo, colorProgramInfo, parts) {
    setListener(gl);

    clouds.push(setCloud(rand(4, 9), false)); //*
    obstacles.push(setObstacle()); //*
    coins.push(setCoin(0, rand(3, 8), rand(45, 90))); //*

    renderScene(gl, meshProgramInfo, colorProgramInfo, parts, false)
}

export function renderSceneEnd(gl, meshProgramInfo, colorProgramInfo, parts) {
    clouds.push(setCloud(rand(4, 9), true));
    
    renderScene(gl, meshProgramInfo, colorProgramInfo, parts, true)
}

export function renderScene(gl, meshProgramInfo, colorProgramInfo, parts, isEndScene ) {
    const up = [0, 1, 0];
    const fieldOfViewRadians = degToRad(60);

    const depthTextureSize = 2048;
    const depthTexture = createDepthTexture(gl, depthTextureSize);
    const depthFramebuffer = createDepthFramebuffer(gl, depthTexture);

    const cubeLinesBufferInfo = webglUtils.createBufferInfoFromArrays(gl, {
        position: [-1, -1, -1, 1, -1, -1, -1, 1, -1, 1, 1, -1, -1, -1, 1, 1, -1, 1, -1, 1, 1, 1, 1, 1],
        indices: [0, 1, 1, 3, 3, 2, 2, 0, 4, 5, 5, 7, 7, 6, 6, 4, 0, 4, 1, 5, 3, 7, 2, 6],
    });

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    function render(time) {

        time *= 0.006; // Convert time to seconds
        setTime(time);

        const cameraPosition = m4.addVectors(cameraTarget, cameraTargetOffset);  // Posizione della telecamera
        
        webglUtils.resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        if (alphaEnable) {
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        } else {
            gl.disable(gl.BLEND);
        }

        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const projection = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);
        
        const lightMatrix = m4.lookAt(lightPosition, lightTarget, up);
        // luce diversa o uguale??
        let lightProjectionMatrix;
        if(isEndScene){
            lightProjectionMatrix = m4.perspective(fieldOfViewRadians, aspect, 0.1,  // vicino
                250)   // lontano*/
        }else{
            lightProjectionMatrix = m4.orthographic(-100, 100, -150, 50, 0.5, 200);
        }
        

        gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer);
        gl.viewport(0, 0, depthTextureSize, depthTextureSize);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const sharedShadowUniforms = {
            u_lightDirection: m4.normalize(lightPosition),
            u_view: m4.inverse(lightMatrix),
            u_projection: lightProjectionMatrix,
            u_textureMatrix: m4.identity(),
            u_projectedTexture: depthTexture,
            u_bias: -0.0099,
        };
        drawScene(gl, colorProgramInfo, sharedShadowUniforms, parts, isEndScene);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        let textureMatrix = m4.identity();
        textureMatrix = m4.translate(textureMatrix, 0.5, 0.5, 0.5);
        textureMatrix = m4.scale(textureMatrix, 0.5, 0.5, 0.5);
        textureMatrix = m4.multiply(textureMatrix, lightProjectionMatrix);
        textureMatrix = m4.multiply(textureMatrix, m4.inverse(lightMatrix));

        const cameraMatrix = m4.lookAt(cameraPosition, cameraTarget, up);
        const view = m4.inverse(cameraMatrix);

        const sharedUniforms = {
            u_lightDirection: m4.normalize(lightPosition),
            u_view: view,
            u_projection: projection,
            u_viewWorldPosition: cameraPosition,
            u_textureMatrix: textureMatrix,
            u_projectedTexture: depthTexture,
            u_bias: -0.0099,
        };
        drawScene(gl, meshProgramInfo, sharedUniforms, parts, isEndScene);

        {
            const viewMatrix = m4.inverse(cameraMatrix);
            gl.useProgram(colorProgramInfo.program);
            webglUtils.setBuffersAndAttributes(gl, colorProgramInfo, cubeLinesBufferInfo);

            const mat = m4.multiply(lightMatrix, m4.inverse(lightProjectionMatrix));
            webglUtils.setUniforms(colorProgramInfo, {
                u_color: [0, 0, 0, 1],
                u_view: viewMatrix,
                u_projection: projection,
                u_world: mat,
            });

            webglUtils.drawBufferInfo(gl, cubeLinesBufferInfo, gl.LINES);
        }

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}