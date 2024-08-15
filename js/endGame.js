import { main } from "./scriptEnd.js";
import { setPause, getPoint, accumulatedTime } from "./utils.js";

  
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
    localStorage.setItem('time', accumulatedTime);

    const endGameContent = localStorage.getItem('endGameContent');
    document.body.innerHTML = endGameContent;
    if (!isEnd) {
        setTimeout(initializeEndGamePage, 1);
        //initializeEndGamePage();
        isEnd = true;
    }
}
  
/**
 * Initializes the end game page.
 */
function initializeEndGamePage() {
    main();

    const time = localStorage.getItem('time'); //number of millisecond
    var min = Math.floor(time / 60000);
    var sec = ((time % 60000) / 1000).toFixed(0);
    const formattedPlayTime = `${min}m ${sec}s`;

    document.getElementById('points').textContent = `Punti ottenuti: ${localStorage.getItem('point')}`;
    document.getElementById('playTime').textContent = `Tempo di gioco: ${formattedPlayTime}`;

    document.getElementById('playAgainButton').addEventListener('click', () => {
        window.location.href = '/index.html';
    });

}