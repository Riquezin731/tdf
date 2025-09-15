// ======================================
// CONFIGURAÇÃO DO JOGO
// ======================================
const config = {
    width: 10,
    height: 10,
    mines: 15
};

// ======================================
// SELETORES DO DOM
// ======================================
const gridElement = document.getElementById('grid');
const mineCountElement = document.getElementById('mine-count');
const timerElement = document.getElementById('timer');
const resetButton = document.getElementById('reset-button');
const gameMessageElement = document.getElementById('game-message');

// ======================================
// VARIÁVEIS GLOBAIS DE ESTADO
// ======================================
let board = [];
let isGameOver = false;
let squaresRevealed = 0;
let timerInterval = null;
let mineCounter = config.mines;

// ======================================
// FUNÇÕES PRINCIPAIS DO JOGO
// ======================================

function startGame() {
    // Reseta todas as variáveis de estado
    isGameOver = false;
    squaresRevealed = 0;
    mineCounter = config.mines;
    board = [];
    gridElement.innerHTML = ''; // Limpa a grade antiga
    gameMessageElement.classList.add('hidden');
    resetButton.textContent = '😊';

    // Para e reseta o cronômetro
    clearInterval(timerInterval);
    timerInterval = null;
    timerElement.textContent = '000';

    // Atualiza a exibição de minas
    mineCountElement.textContent = String(mineCounter).padStart(2, '0');

    // Cria o tabuleiro e os quadrados
    createBoard();
    
    // Posiciona as minas e calcula os números
    placeMines();
    calculateAdjacentMines();
}

function createBoard() {
    gridElement.style.gridTemplateColumns = `repeat(${config.width}, 1fr)`;
    gridElement.style.gridTemplateRows = `repeat(${config.height}, 1fr)`;

    for (let y = 0; y < config.height; y++) {
        board[y] = [];
        for (let x = 0; x < config.width; x++) {
            const square = document.createElement('div');
            square.classList.add('square');
            square.dataset.x = x;
            square.dataset.y = y;

            // Adiciona o ouvinte de eventos de clique
            square.addEventListener('click', () => handleLeftClick(x, y));
            square.addEventListener('contextmenu', (e) => handleRightClick(e, x, y));

            gridElement.appendChild(square);
            board[y][x] = {
                element: square,
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                adjacentMines: 0
            };
        }
    }
}

function placeMines() {
    let minesPlaced = 0;
    while (minesPlaced < config.mines) {
        const x = Math.floor(Math.random() * config.width);
        const y = Math.floor(Math.random() * config.height);

        if (!board[y][x].isMine) {
            board[y][x].isMine = true;
            minesPlaced++;
        }
    }
}

function calculateAdjacentMines() {
    for (let y = 0; y < config.height; y++) {
        for (let x = 0; x < config.width; x++) {
            if (board[y][x].isMine) continue;

            let count = 0;
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    const nx = x + dx;
                    const ny = y + dy;
                    
                    if (nx >= 0 && nx < config.width && ny >= 0 && ny < config.height) {
                        if (board[ny][nx].isMine) {
                            count++;
                        }
                    }
                }
            }
            board[y][x].adjacentMines = count;
        }
    }
}

function handleLeftClick(x, y) {
    if (isGameOver) return;
    if (!timerInterval) {
        startTimer();
    }

    const square = board[y][x];

    if (square.isRevealed || square.isFlagged) {
        return;
    }

    if (square.isMine) {
        square.element.classList.add('mine');
        endGame(false);
    } else {
        revealSquare(x, y);
        checkWinCondition();
    }
}

function handleRightClick(e, x, y) {
    e.preventDefault();
    if (isGameOver) return;
    const square = board[y][x];
    if (square.isRevealed) {
        return;
    }
    if (square.isFlagged) {
        square.isFlagged = false;
        square.element.classList.remove('flag');
        mineCounter++;
    } else {
        square.isFlagged = true;
        square.element.classList.add('flag');
        mineCounter--;
    }
    mineCountElement.textContent = String(mineCounter).padStart(2, '0');
}

function revealSquare(x, y) {
    const square = board[y][x];
    if (square.isRevealed || square.isFlagged) {
        return;
    }

    square.isRevealed = true;
    squaresRevealed++;
    square.element.classList.add('revealed');

    if (square.adjacentMines > 0) {
        square.element.textContent = square.adjacentMines;
        square.element.classList.add(`number-${square.adjacentMines}`);
    } else {
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < config.width && ny >= 0 && ny < config.height) {
                    revealSquare(nx, ny);
                }
            }
        }
    }
}

function checkWinCondition() {
    if (squaresRevealed === (config.width * config.height) - config.mines) {
        endGame(true);
    }
}

function endGame(didWin) {
    isGameOver = true;
    clearInterval(timerInterval);
    if (didWin) {
        gameMessageElement.textContent = 'Você venceu! 🎉';
        gameMessageElement.classList.remove('hidden');
        resetButton.textContent = '🥳';
    } else {
        gameMessageElement.textContent = 'Game Over! 💥';
        gameMessageElement.classList.remove('hidden');
        resetButton.textContent = '😵';
        board.flat().filter(s => s.isMine).forEach(s => s.element.classList.add('mine'));
    }
}

function startTimer() {
    let time = 0;
    timerInterval = setInterval(() => {
        time++;
        timerElement.textContent = String(time).padStart(3, '0');
    }, 1000);
}

// ======================================
// EVENTOS DE INICIALIZAÇÃO
// ======================================

// O comando abaixo garante que o jogo inicia automaticamente assim que a página é carregada.
document.addEventListener('DOMContentLoaded', startGame);

// E este comando garante que o botão de reinício funciona.
resetButton.addEventListener('click', startGame);
