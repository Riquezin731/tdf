import Game from './game.js';

window.addEventListener('load', () => {
  const canvas = document.getElementById('game-canvas');
  const startScreen = document.getElementById('start-screen');
  const gameOverScreen = document.getElementById('game-over-screen');
  const ui = document.getElementById('ui');
  const scoreEl = document.getElementById('score');
  const startBtn = document.getElementById('start-btn');
  const restartBtn = document.getElementById('restart-btn');
  const finalScoreEl = document.getElementById('final-score');

  const game = new Game(canvas, scoreEl, (score) => {
    ui.classList.add('hidden');
    finalScoreEl.textContent = `Você fez ${score} pontos`;
    gameOverScreen.classList.remove('hidden');
  });

  startBtn.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    ui.classList.remove('hidden');
    game.start();
  });

  restartBtn.addEventListener('click', () => {
    gameOverScreen.classList.add('hidden');
    ui.classList.remove('hidden');
    game.start();
  });
});
