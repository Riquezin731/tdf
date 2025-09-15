// ======================================
// CONFIGURAÇÃO DO JOGO
// Altere estes valores para definir a dificuldade.
// ======================================
const config = {
    width: 10,   // Número de colunas
    height: 10,  // Número de linhas
    mines: 15    // Quantidade de minas
};

// ======================================
// SELETORES DO DOM
// Elementos da interface do usuário
// ======================================
const gridElement = document.getElementById('grid');
const mineCountElement = document.getElementById('mine-count');
const timerElement = document.getElementById('timer');
const resetButton = document.getElementById('reset-button');
const gameMessageElement = document.getElementById('game-message');

// ======================================
// VARIÁVEIS GLOBAIS DE ESTADO
// Gerenciam o andamento do jogo
// ======================================
let board = [];             // Matriz que representa o tabuleiro do jogo
let isGameOver = false;     // Se o jogo terminou ou não
let squaresRevealed = 0;    // Contador de quadrados revelados
let timerInterval = null;   // ID do intervalo do cronômetro
let mineCounter = config.mines; // Contador de minas para a interface

// ======================================
// FUNÇÕES PRINCIPAIS DO JOGO
// ======================================

/**
 * @description Inicia um novo jogo. Reseta o tabuleiro, as variáveis e os contadores.
 */
function startGame() {
    // Reseta o estado do jogo
    isGameOver = false;
    squaresRevealed = 0;
    mineCounter = config.mines;
    board = [];
    gridElement.innerHTML = '';
    gameMessageElement.classList.add('hidden');
    resetButton.textContent = '😊';

    // Para e reseta o cronômetro
    clearInterval(timerInterval);
    timerInterval = null;
    timerElement.textContent = '000';

    // Atualiza a exibição de minas
    mineCountElement.textContent = String(mineCounter).padStart(2, '0');

    // Cria a estrutura do tabuleiro e insere os quadrados
    createBoard();
    
    // Adiciona as minas e calcula os números
    placeMines();
    calculateAdjacentMines();
}

/**
 * @description Cria a grade visual do jogo no HTML e inicializa a matriz 'board'.
 */
function createBoard() {
    // Define o layout da grade CSS para corresponder à configuração
    gridElement.style.gridTemplateColumns = `repeat(${config.width}, 1fr)`;
    gridElement.style.gridTemplateRows = `repeat(${config.height}, 1fr)`;

    for (let y = 0; y < config.height; y++) {
        board[y] = [];
        for (let x = 0; x < config.width; x++) {
            const square = document.createElement('div');
            square.classList.add('square');
            square.dataset.x = x;
            square.dataset.y = y;

            // Adiciona um ouvinte de clique esquerdo para revelar o quadrado
            square.addEventListener('click', () => handleLeftClick(x, y));
            // Adiciona um ouvinte de clique direito para marcar a bandeira
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

/**
 * @description Posiciona as minas aleatoriamente no tabuleiro.
 */
function placeMines() {
    let minesPlaced = 0;
    while (minesPlaced < config.mines) {
        const x = Math.floor(Math.random() * config.width);
        const y = Math.floor(Math.random() * config.height);

        // Se o quadrado não for uma mina, coloca uma
        if (!board[y][x].isMine) {
            board[y][x].isMine = true;
            minesPlaced++;
        }
    }
}

/**
 * @description Percorre o tabuleiro e calcula o número de minas vizinhas para cada quadrado.
 */
function calculateAdjacentMines() {
    for (let y = 0; y < config.height; y++) {
        for (let x = 0; x < config.width; x++) {
            if (board[y][x].isMine) continue; // Pula as minas

            let count = 0;
            // Itera sobre os 8 vizinhos (incluindo diagonais)
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    const nx = x + dx;
                    const ny = y + dy;
                    
                    // Verifica se o vizinho está dentro dos limites do tabuleiro
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

/**
 * @description Lida com o clique esquerdo do mouse. Revela um quadrado.
 * @param {number} x - Coordenada X do quadrado.
 * @param {number} y - Coordenada Y do quadrado.
 */
function handleLeftClick(x, y) {
    if (isGameOver) return;

    // Inicia o cronômetro na primeira jogada
    if (!timerInterval) {
        startTimer();
    }

    const square = board[y][x];

    // Impede a ação se o quadrado já está revelado ou tem uma bandeira
    if (square.isRevealed || square.isFlagged) {
        return;
    }

    if (square.isMine) {
        // Se for uma mina, o jogador perde
        square.element.classList.add('mine');
        endGame(false);
    } else {
        // Se não for uma mina, revela o quadrado e os vizinhos se necessário
        revealSquare(x, y);
        checkWinCondition();
    }
}

/**
 * @description Lida com o clique direito do mouse. Coloca ou remove uma bandeira.
 * @param {Event} e - O evento de clique.
 * @param {number} x - Coordenada X do quadrado.
 * @param {number} y - Coordenada Y do quadrado.
 */
function handleRightClick(e, x, y) {
    e.preventDefault(); // Evita o menu de contexto padrão do navegador

    if (isGameOver) return;

    const square = board[y][x];

    // Se o quadrado já foi revelado, não pode ter bandeira
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

/**
 * @description Revela um quadrado e, se ele for vazio, chama a si mesma para os vizinhos.
 * @param {number} x - Coordenada X do quadrado.
 * @param {number} y - Coordenada Y do quadrado.
 */
function revealSquare(x, y) {
    const square = board[y][x];

    // Se o quadrado já foi revelado ou tem bandeira, para a recursão
    if (square.isRevealed || square.isFlagged) {
        return;
    }

    square.isRevealed = true;
    squaresRevealed++;
    square.element.classList.add('revealed');

    if (square.adjacentMines > 0) {
        // Se tiver minas vizinhas, mostra o número
        square.element.textContent = square.adjacentMines;
        square.element.classList.add(`number-${square.adjacentMines}`);
    } else {
        // Se não tiver, revela os vizinhos
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const nx = x + dx;
                const ny = y + dy;
                // Garante que as coordenadas dos vizinhos são válidas
                if (nx >= 0 && nx < config.width && ny >= 0 && ny < config.height) {
                    revealSquare(nx, ny);
                }
            }
        }
    }
}

/**
 * @description Verifica se o jogador venceu. A vitória ocorre quando todos os quadrados não-mina são revelados.
 */
function checkWinCondition() {
    if (squaresRevealed === (config.width * config.height) - config.mines) {
        endGame(true);
    }
}

/**
 * @description Finaliza o jogo, revelando o resultado (vitória ou derrota).
 * @param {boolean} didWin - 'true' se o jogador venceu, 'false' se perdeu.
 */
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
        // Revela todas as minas
        board.flat().filter(s => s.isMine).forEach(s => s.element.classList.add('mine'));
    }
}

/**
 * @description Inicia o cronômetro do jogo.
 */
function startTimer() {
    let time = 0;
    timerInterval = setInterval(() => {
        time++;
        timerElement.textContent = String(time).padStart(3, '0');
    }, 1000);
}

// ======================================
// EVENTOS
// ======================================
// Reinicia o jogo quando o botão é clicado
resetButton.addEventListener('click', startGame);

// Inicia o jogo automaticamente ao carregar a página
document.addEventListener('DOMContentLoaded', startGame);
