//import { setMouseMove, canvasToWorld } from './mousePosition.js'


  /**
   * Renderizza la scena.
   * @param {WebGLRenderingContext} gl - Contesto WebGL.
   * @param {Object} meshProgramInfo - Informazioni sul programma shader.
   * @param {Array} planeParts - Parti dell'oggetto piano.
   * @param {Array} elicaParts - Parti dell'elica.
   * @param {Array} cameraPosition - Posizione della telecamera.
   * @param {Array} cameraTarget - Punto di mira della telecamera.
   * @param {Array} objOffset - Offset dell'oggetto.
   * @param {number} zNear - Piano di clipping vicino.
   * @param {number} zFar - Piano di clipping lontano.
   */
  export function renderScene(gl, meshProgramInfo, planeParts, elicaParts, cameraPosition, cameraTarget, objOffset, zNear, zFar) {
    function render(time) {
      time *= 0.006;  // Converte il tempo in secondi (velocità dell'elica)
  
      // Ridimensiona il canvas WebGL alla dimensione dello schermo
      webglUtils.resizeCanvasToDisplaySize(gl.canvas);
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      gl.enable(gl.DEPTH_TEST);
  
      // Angolo di campo visivo della telecamera e prospettiva
      const fieldOfViewRadians = degToRad(60);
      const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
      const projection = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);
  
       // Posizione della telecamera e vista della scena
      const up = [0, 1, 0];
      const camera = m4.lookAt(cameraPosition, cameraTarget, up);
      const view = m4.inverse(camera);
  
      // Parametri uniformi condivisi per i shader
      const sharedUniforms = {
        u_lightDirection: m4.normalize([0, 25, 5]), // Direzione della luce
        u_view: view,
        u_projection: projection,
        u_viewWorldPosition: cameraPosition, // Posizione della telecamera nella scena
      };
  
      // Utilizza il programma shader specificato
      gl.useProgram(meshProgramInfo.program);
      webglUtils.setUniforms(meshProgramInfo, sharedUniforms);
  
      // Movimento di default dell'aereo e dell'elica
      let u_world = m4.translation(-40, 20, -40);
      u_world = m4.xRotate(u_world, 0.1);
      //const horizontalOffset = Math.sin(time) * 1.5; // Movimento orizzontale sinusoidale
      //u_world = m4.translate(u_world, 0, horizontalOffset, 0); // Applica traslazione orizzontale
      const oscillationAngle = Math.sin(time) * degToRad(2); // Oscillazione sinusoidale
      u_world = m4.zRotate(u_world, oscillationAngle); // Applica rotazione attorno all'asse Y


      let u_world_elica = u_world; //in modo che l'elica sia posizionata correttamente rispetto all'aereo

      u_world = m4.translate(u_world, ...objOffset);
  
      for (const { bufferInfo, material } of planeParts) {
        webglUtils.setBuffersAndAttributes(gl, meshProgramInfo, bufferInfo);
        webglUtils.setUniforms(meshProgramInfo, { u_world }, material);
        webglUtils.drawBufferInfo(gl, bufferInfo);
      }
  
      // Renderizza le parti dell'elica con rotazione intorno all'asse X
      u_world_elica = m4.translate(u_world_elica, ...objOffset); // Prima applica la traslazione per centrare l'oggetto
      u_world_elica = m4.xRotate(u_world_elica, -time); // Infine applica la rotazione
  
      for (const { bufferInfo, material } of elicaParts) {
        webglUtils.setBuffersAndAttributes(gl, meshProgramInfo, bufferInfo);
        webglUtils.setUniforms(meshProgramInfo, { u_world: u_world_elica }, material);
        webglUtils.drawBufferInfo(gl, bufferInfo);
      }
  
      // Richiede il rendering della scena alla prossima animazione frame
      requestAnimationFrame(render);
    }
    // Avvia il ciclo di rendering della scena
    requestAnimationFrame(render);
  }

/**
 * Converte gradi in radianti.
 * @param {number} deg - Valore in gradi.
 * @returns {number} - Valore in radianti.
 */
function degToRad(deg) {
    return deg * Math.PI / 180;
  }
  
  let mouseY = 0; // Variabile per memorizzare la posizione Y del mouse

  export function setMouseMove(gl) {
      gl.canvas.addEventListener('mousemove', updateMousePosition);
  }
  
  // Listener per tracciare la posizione del mouse
  function updateMousePosition(event) {
      const canvas = event.target;
      const rect = canvas.getBoundingClientRect();
      mouseY = event.clientY - rect.top;
  }
  
  // Funzione per convertire le coordinate del mouse da canvas a coordinate del mondo
  export function canvasToWorld(y, canvasHeight, zNear, zFar) {
      const ndcY = (y / canvasHeight) * 2 - 1; // Converti da pixel a coordinate NDC (Normalized Device Coordinates)
      const viewY = ndcY * (zFar - zNear) / 2; // Converti da NDC a coordinate del mondo
      return viewY;
  }