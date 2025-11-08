let currentBoard = [];
let solution = [];
let errors = 0;
let hintUsed = false;
let timer;
let seconds = 0;
let boardSize = 9;
let boxSize = 3; // tamaño del subcuadro

function startGame(difficulty) {
  document.getElementById('menu').classList.add('hidden');
  document.getElementById('game').classList.remove('hidden');
  document.getElementById('difficulty-title').textContent = `Nivel: ${difficulty.toUpperCase()}`;

  // Ajustar tamaño del tablero según dificultad
  if(difficulty === 'facil'){
    boardSize = 4;
    boxSize = 2;
  } else if(difficulty === 'medio'){
    boardSize = 6;
    boxSize = 2; // simplificado para 6x6
  } else {
    boardSize = 9;
    boxSize = 3;
  }

  solution = generateSudoku(boardSize, boxSize);
  currentBoard = JSON.parse(JSON.stringify(solution));
  removeCells(difficulty); // dejar algunas celdas vacías según dificultad

  errors = 0;
  hintUsed = false;
  renderBoard();
  startTimer();
}

// --- Generar tablero Sudoku completo ---
function generateSudoku(size, boxSize) {
  let board = Array.from({length: size}, () => Array(size).fill(0));

  function isSafe(row, col, num){
    // fila y columna
    for(let i=0;i<size;i++){
      if(board[row][i]===num || board[i][col]===num) return false;
    }
    // subcuadro
    let startRow = row - row % boxSize;
    let startCol = col - col % boxSize;
    for(let i=0;i<boxSize;i++){
      for(let j=0;j<boxSize;j++){
        if(board[startRow+i][startCol+j]===num) return false;
      }
    }
    return true;
  }

  function fillBoard(){
    for(let row=0;row<size;row++){
      for(let col=0;col<size;col++){
        if(board[row][col]===0){
          let numbers = shuffle([...Array(size).keys()].map(n=>n+1)); // 1 a size
          for(let num of numbers){
            if(isSafe(row,col,num)){
              board[row][col]=num;
              if(fillBoard()) return true;
              board[row][col]=0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  fillBoard();
  return board;
}

// --- Mezclar números aleatoriamente ---
function shuffle(array){
  for(let i=array.length-1;i>0;i--){
    let j=Math.floor(Math.random()*(i+1));
    [array[i],array[j]]=[array[j],array[i]];
  }
  return array;
}

// --- Eliminar celdas según dificultad ---
function removeCells(difficulty){
  let emptyCells;
  if(difficulty==='facil') emptyCells = Math.floor(boardSize*boardSize*0.4);
  else if(difficulty==='medio') emptyCells = Math.floor(boardSize*boardSize*0.5);
  else emptyCells = Math.floor(boardSize*boardSize*0.6);

  while(emptyCells>0){
    let row = Math.floor(Math.random()*boardSize);
    let col = Math.floor(Math.random()*boardSize);
    if(currentBoard[row][col]!==0){
      currentBoard[row][col]=0;
      emptyCells--;
    }
  }
}

// --- Renderizado ---
function renderBoard() {
  const grid = document.getElementById('sudoku-grid');
  grid.innerHTML = '';
  grid.style.gridTemplateColumns = `repeat(${boardSize}, 40px)`;
  grid.style.gridTemplateRows = `repeat(${boardSize}, 40px)`;

  currentBoard.forEach((row,i)=>{
    row.forEach((num,j)=>{
      const cell=document.createElement('input');
      cell.maxLength=1;
      cell.classList.add('cell');
      if(num!==0){
        cell.value=num;
        cell.disabled=true;
      }
      cell.addEventListener('input',()=>checkCell(i,j,cell));
      grid.appendChild(cell);
    });
  });
}

// --- Validar celda ---
function checkCell(i,j,cell){
  const val=parseInt(cell.value);
  if(val===solution[i][j]){
    currentBoard[i][j]=val;
    cell.classList.remove('error');

    if(isBoardComplete()){
      clearInterval(timer);
      alert("¡Felicidades! Has completado el Sudoku 🎉");
    }

  } else {
    cell.classList.add('error');
    errors++;
    document.getElementById('errors').textContent=`Errores: ${errors}/3`;
    if(errors>=3){
      clearInterval(timer);
      alert("Has perdido 😢 Vuelve a intentarlo, ¡tú puedes!");
      resetGame();
    }
  }
}

// --- Verificar si el tablero está completo ---
function isBoardComplete(){
  for(let i=0;i<boardSize;i++){
    for(let j=0;j<boardSize;j++){
      if(currentBoard[i][j]===0) return false;
    }
  }
  return true;
}

// --- Usar pista ---
function useHint(){
  if(hintUsed){
    alert("Ya has usado tu pista.");
    return;
  }
  hintUsed=true;
  for(let i=0;i<boardSize;i++){
    for(let j=0;j<boardSize;j++){
      if(currentBoard[i][j]===0){
        currentBoard[i][j]=solution[i][j];
        renderBoard();
        return;
      }
    }
  }
}

// --- Timer ---
function startTimer(){
  seconds=0;
  clearInterval(timer);
  timer=setInterval(()=>{
    seconds++;
    document.getElementById('timer').textContent=`Tiempo: ${seconds}s`;
  },1000);
}

// --- Reiniciar juego ---
function resetGame(){
  clearInterval(timer);
  document.getElementById('menu').classList.remove('hidden');
  document.getElementById('game').classList.add('hidden');
  errors=0;
  hintUsed=false;
  document.getElementById('errors').textContent="Errores: 0/3";
}

// --- Volver al menú ---
function goBack(){
  resetGame();
}
