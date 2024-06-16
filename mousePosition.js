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