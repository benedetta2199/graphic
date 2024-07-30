import { main } from "./scriptEnd.js";
import { setPause, getPoint } from "./utils.js";

/**
 * Gets the play time as a formatted string.
 * @returns {string} - Play time as a formatted string.
 */
export function getPlayTime(){
    const endTime = new Date(localStorage.getItem('endTime'));
    const startTime = new Date(localStorage.getItem('startTime'));
    const playTimeMs = Math.abs(endTime - startTime);
    const playTimeSeconds = Math.floor((playTimeMs / 1000) % 60);
    const playTimeMinutes = Math.floor((playTimeMs / (1000 * 60)) % 60);
    return playTimeMinutes + "m " + playTimeSeconds + "s";
  }
  
/**
 * Loads the end game content from the server.
 */
export async function loadEndGameContent() {
    const response = await fetch('/endGame.html');
    const text = await response.text();
    localStorage.setItem('endGameContent', text);
}
  
let isEnd = false;

/**
 * Ends the game and displays the end game screen.
 */
export function endGame() {
setPause();
localStorage.setItem('point', getPoint());
localStorage.setItem('endTime', new Date());

const endGameContent = localStorage.getItem('endGameContent');
if (endGameContent) {
    // Inject the content into the current page
    document.body.innerHTML = endGameContent;
    if (!isEnd) {
    initializeEndGamePage();
    isEnd = true;
    }
} else {
    // Fallback in case the content wasn't preloaded correctly
    window.location.href = '/endGame.html';
}
}
  
/**
 * Initializes the end game page.
 */
function initializeEndGamePage() {
    console.log(localStorage.getItem('point'));

    const endTime = new Date(localStorage.getItem('endTime'));
    const startTime = new Date(localStorage.getItem('startTime'));
    const playTime = Math.floor((endTime - startTime) / 1000);
    const formattedPlayTime = `${Math.floor(playTime / 60)}m ${playTime % 60}s`;

    const point = document.getElementById('points');
    console.log(point)
    point.textContent = `Punti ottenuti: ${localStorage.getItem('point')}`;
    document.getElementById('playTime').textContent = `Tempo di gioco: ${formattedPlayTime}`;

    document.getElementById('playAgainButton').addEventListener('click', () => {
        window.location.href = '/index.html';
    });

main();
}