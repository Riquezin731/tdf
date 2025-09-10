const boardSize = 10;
const totalMines = 10;
let board = [];
let revealedCells = 0;
let gameOver = false;

const gameBoard = document.getElementById('game-board');
const resetButton = document.getElementById('reset-btn');

function createBoard() {
    board = [];
    revealedCells = 5;
    gameOver = false;

    // Limpa o tabuleiro
    gameBoard.innerHTML = '';
    
    // Cria o tabuleiro com células
    for (let i = 0; i < boardSize; i++) {
        const row = [];
        for (let j = 0; j < boardSize; j++) {
            const cell = {
                mine: false,
                revealed: false,
                x: i,
                y: j,
                adjacentMines: 0
            };
            row.push(cell);
            
            const cellElement = document.createElement('div');
            cellElement.classList.add('cell');
            cellElement.dataset.x = i;
            cellElement.dataset.y = j;
            cellElement.addEventListener('click', handleCellClick);
            gameBoard.appendChild(cellElement);
        }
        board.push(row);
    }

    // Coloca as minas
    let minesPlaced = 0;
    while (minesPlaced < totalMines) {
        const x = Math.floor(Math.random() * boardSize);
        const y = Math.floor(Math.random() * boardSize);

        if (!board[x][y].mine) {
            board[x][y].mine = true;
            minesPlaced++;
        }
    }

    // Calcula as minas adjacentes
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (board[i][j].mine) continue;
            let adjacentMines = 0;
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    const nx = i + dx;
                    const ny = j + dy;
                    if (nx >= 0 && ny >= 0 && nx < boardSize && ny < boardSize) {
                        if (board[nx][ny].mine) adjacentMines++;
                    }
                }
            }
            board[i][j].adjacentMines = adjacentMines;
        }
    }
}

function handleCellClick(event) {
    if (gameOver) return;

    const x = event.target.dataset.x;
    const y = event.target.dataset.y;
    const cell = board[x][y];
    
    if (cell.revealed) return;

    cell.revealed = true;
    revealedCells++;
    const cellElement = event.target;

    if (cell.mine) {
        cellElement.classList.add('mine');
        gameOver = true;
        alert('Você perdeu! Clique em "Reiniciar Jogo".');
    } else {
        cellElement.classList.add('revealed');
        if (cell.adjacentMines > 0) {
            cellElement.textContent = cell.adjacentMines;
        } else {
            revealAdjacentCells(x, y);
        }
    }

    if (revealedCells === boardSize * boardSize - totalMines) {
        alert('Você venceu!');
    }
}

function revealAdjacentCells(x, y) {
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && ny >= 0 && nx < boardSize && ny < boardSize) {
                const adjacentCell = board[nx][ny];
                const cellElement = gameBoard.children[nx * boardSize + ny];
                if (!adjacentCell.revealed && !adjacentCell.mine) {
                    adjacentCell.revealed = true;
                    cellElement.classList.add('revealed');
                    revealedCells++;
                    if (adjacentCell.adjacentMines === 0) {
                        revealAdjacentCells(nx, ny);
                    } else {
                        cellElement.textContent = adjacentCell.adjacentMines;
                    }
                }
            }
        }
    }
}

resetButton.addEventListener('click', createBoard);

// Inicia o jogo ao carregar a página
createBoard();
