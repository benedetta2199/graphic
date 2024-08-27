import { main } from "./scriptEnd.js";
import { setPause, getPoint, getTime } from "./utils.js";
  

/**
 * Carica il contenuto della schermata di fine gioco dal server e lo memorizza in `localStorage`.
 */
export async function loadEndGameContent() {
    const response = await fetch('/endGame.html');
    const text = await response.text();
    localStorage.setItem('endGameContent', text);
}

/**
 * Termina il gioco e visualizza la schermata di fine gioco.
 */
export function endGame() {
    setPause();
    const endGameContent = localStorage.getItem('endGameContent');
    document.body.innerHTML = endGameContent;
    setTimeout(initializeEndGamePage, 1);
}
  
/**
 * Inizializza i valori della pagina di fine gioco, visualizzando il punteggio e il tempo di gioco
 * e attivando il pulsante per rigiocare.
 */
function initializeEndGamePage() {
    main();   

    document.getElementById('points').textContent = `Punti ottenuti: ${getPoint()}`;
    document.getElementById('playTime').textContent = `Tempo di gioco: ${getTime()}`;

    document.getElementById('playAgainButton').addEventListener('click', () => {
        window.location.href = '/index.html';
    });
}
