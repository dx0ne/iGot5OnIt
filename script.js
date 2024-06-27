let isFirstDrop = true;
let firstDropCoords = null; // Variable to store the coordinates of the first drop
let initialDraggedElement = null; // Store the initial dragged element
let initialDropTarget = null; // Store the initial drop target

const symbols = ['♠', '♥', '♦', '♣', '★', '☀'];
const colors = ['red', 'blue', 'green', 'purple', 'orange', 'pink'];

const gridRows = 6;
const gridCols = 6;

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('grid');
    const cells = Array.from({ length: gridRows*gridCols }, (_, i) => {
        const row = Math.floor(i / gridCols);
        const col = i % gridCols;
        const isLocked = row === gridRows - 1 || col === gridCols - 1;
        return `<div id="drag_${row}_${col}" class="grid-cell${isLocked ? ' locked' : ''}" ondrop="drop(event)" ondragover="allowDrop(event)"></div>`;
    }).join('');
    grid.innerHTML = cells;
    document.getElementById('revertButton').disabled = true; // Enable the revert button

    // Add event listener for the debug button
    document.getElementById('debugButton').addEventListener('click', () => {
        const score = computeScore();
        document.getElementById('score').innerHTML = '<span>Score: ' + score + '</span>';
    });

    document.getElementById('debugButtonRandomFill').addEventListener('click', () => {
        const filledCells = new Set();
        const cells = document.querySelectorAll('.grid-cell');
        const lastRowStartIndex = (gridRows - 1) * gridCols;
        const lastColIndices = Array.from({ length: gridRows }, (_, i) => i * gridCols + (gridCols - 1));

        while (filledCells.size < 10) {
            const randomIndex = Math.floor(Math.random() * cells.length);

            // Skip cells in the last row and last column
            if (randomIndex >= lastRowStartIndex || lastColIndices.includes(randomIndex)) {
                continue;
            }

            if (!filledCells.has(randomIndex)) {
                filledCells.add(randomIndex);
                const randomSymbolIndex = Math.floor(Math.random() * symbols.length);
                const randomSymbol = symbols[randomSymbolIndex];
                const randomColor = colors[randomSymbolIndex];
                cells[randomIndex].innerHTML = `<span style="color: ${randomColor};">${randomSymbol}</span>`;
            }
        }
    });
    
    setup();
});

function setup() {
    // Clear the board
    const cells = document.querySelectorAll('.grid-cell');
    cells.forEach(cell => {
        cell.innerHTML = '';
    });

    // Fill the uppermost left cell with a random symbol
    const randomIndex = Math.floor(Math.random() * symbols.length);
    const randomSymbol = symbols[randomIndex];
    const randomColor = colors[randomIndex];

    const upperLeftCell = document.getElementById('drag_0_0');
    upperLeftCell.innerHTML = `<span style="color: ${randomColor};">${randomSymbol}</span>`;

    rollDice();
}

function rollDice() {
    const numberOfDice = 2; //document.getElementById('diceCount').value;
   let results = [];
    for (let i = 0; i < numberOfDice; i++) {
        const roll = Math.floor(Math.random() * symbols.length);
        results.push({ symbol: symbols[roll], color: colors[roll] });
    }
    document.getElementById('rollResult').innerHTML = results.map((result, index) => 
        `<span draggable="true" id="drag${index}" class="grid-cell" ondragstart="drag(event)" style="color: ${result.color};">${result.symbol}</span>`
    ).join('');
    isFirstDrop = true; // Reset the flag after each roll
    document.getElementById('revertButton').disabled = true; // Enable the revert button
    document.getElementById('rollButton').disabled = true; // Enable the revert button
}

function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    event.dataTransfer.setData("text", event.target.id);
}

function drop(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData("text");

    const draggedElement = document.getElementById(data);
    const dropTarget = event.target;

    // Ensure the drop target is a valid cell and not locked
    if (!dropTarget.id.startsWith('drag') || dropTarget.classList.contains('locked')) {
        return;
    }

    // Extract row and column indices from the IDs
    const dropTargetCoords = extractCoordinates(dropTarget.id);

    // Allow the first drop on any empty field
    if (isFirstDrop) {
        dropTarget.appendChild(draggedElement);
 
        isFirstDrop = false; // Reset the flag after the first drop
        firstDropCoords = dropTargetCoords; // Store the coordinates of the first drop
        initialDraggedElement = draggedElement; // Store the initial dragged element
        initialDropTarget = dropTarget; // Store the initial drop target
        document.getElementById('revertButton').disabled = false; // Enable the revert button

        // Highlight eligible cells
        highlightEligibleCells(firstDropCoords);
    } else {
        // Check if the drop target is adjacent to the first drop coordinates
        if (isAdjacent(firstDropCoords, dropTargetCoords)) {
            dropTarget.appendChild(draggedElement);
            isFirstDrop = true;
            document.getElementById('revertButton').disabled = true; // Disable the revert button after the second drop
            clearHighlight(); // Clear the highlight after the second drop
            if(checkForPossibleMoves()){
                document.getElementById('rollButton').disabled = false; // Disable the revert button after the second drop
            }
            else{
                //compute score
                const score = computeScore();
            // Create a popup element
            const popup = document.createElement('div');
            popup.id = 'popup';
            popup.style.position = 'absolute';
            popup.style.top = '50%';
            popup.style.left = '50%';
            popup.style.transform = 'translate(-50%, -50%)';
            popup.style.padding = '20px';
            popup.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            popup.style.color = 'white';
            popup.style.fontSize = '20px';
            popup.style.textAlign = 'center';
            popup.style.zIndex = '1000';
            popup.innerText = `No more moves!`;

            // Append the popup to the body
            document.body.appendChild(popup);

            // Remove the popup after 3 seconds
            setTimeout(() => {
                document.body.removeChild(popup);
            }, 3000);
            }
        }
    }

    draggedElement.classList.add('droppedElement');
}

function extractCoordinates(id) {
    return id.replace('drag_', '').split('_').map(Number);
}

function isAdjacent(coords1, coords2) {
    const rowDiff = Math.abs(coords1[0] - coords2[0]);
    const colDiff = Math.abs(coords1[1] - coords2[1]);
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

function revertFirstMove() {
    if (initialDraggedElement && initialDropTarget && isFirstDrop==false) {
        document.getElementById('rollResult').appendChild(initialDraggedElement);
        initialDraggedElement.classList.remove('droppedElement');
        initialDropTarget.innerHTML = ''; // Clear the initial drop target
        isFirstDrop = true; // Reset the flag
        firstDropCoords = null; // Clear the stored coordinates
        initialDraggedElement = null; // Clear the stored dragged element
        initialDropTarget = null; // Clear the stored drop target
        document.getElementById('revertButton').disabled = true; // Enable the revert button
        clearHighlight();
    }
}

function checkForPossibleMoves() {
    const cells = document.querySelectorAll('.grid-cell');
    let possibleMoves = false;

    outerLoop: for (const cell of cells) {
        const coords = extractCoordinates(cell.id);
        // Skip the rightmost and bottommost cells
        if (coords[0] === gridRows - 1 || coords[1] === gridCols - 1) {
            continue;
        }

        if (cell.children.length === 0) {
            for (const otherCell of cells) {
                const otherCoords = extractCoordinates(otherCell.id);
                // Skip the rightmost and bottommost cells
                if (otherCoords[0] === gridRows - 1 || otherCoords[1] === gridCols - 1) {
                    continue;
                }

                if (otherCell.children.length === 0 && isAdjacent(coords, otherCoords)) {
                    possibleMoves = true;
                    break outerLoop;
                }
            }
        }
    }

    return possibleMoves;
}

function computeScore() {
    const grid = document.querySelectorAll('.grid-cell');
   let score = 0;

    // Create a 2D array to store the symbols in the grid
    const gridSymbols = Array.from({ length: gridRows }, () => Array(gridCols).fill(null));

    // Populate the gridSymbols array with the symbols from the grid
    grid.forEach(cell => {
        const coords = extractCoordinates(cell.id);
        if (cell.children.length > 0) {
            gridSymbols[coords[0]][coords[1]] = cell.children[0].textContent;
        }
    });

    // Function to calculate points for a line (row or column)
    function calculateLinePoints(line) {
        let points = 0;
        let count = 1;

        for (let i = 1; i < line.length; i++) {
            if (line[i] && line[i] === line[i - 1]) {
                count++;
            } else {
                points += calculatePoints(count);
                count = 1;
            }
        }

        points += calculatePoints(count); // Add points for the last sequence

        return points;
    }

    function calculatePoints(count) {
        if (count === 2) return 1;
        if (count === 3) return 2;
        if (count === 4) return 4;
        if (count >= 5) return 8;
        return 0;
    }

    // Calculate points for rows and display the score in the last column of each row
    for (let row = 0; row < gridRows - 1; row++) { // Exclude the last row
        const rowScore = calculateLinePoints(gridSymbols[row]);
        score += rowScore;
        const rowElement = document.getElementById(`drag_${row}_${gridCols - 1}`);
        rowElement.textContent = rowScore;
    }

    // Calculate points for columns and display the score in the last row of each column
    for (let col = 0; col < gridCols - 1; col++) { // Exclude the last column
        const column = gridSymbols.map(row => row[col]);
        const colScore = calculateLinePoints(column);
        score += colScore;
        const colElement = document.getElementById(`drag_${gridRows - 1}_${col}`);
        colElement.textContent = colScore;
    }

    const bottomRightCell = document.getElementById(`drag_${gridRows - 1}_${gridCols - 1}`);
    bottomRightCell.textContent = score;

    return score;
}

function highlightEligibleCells(coords) {
    const cells = document.querySelectorAll('.grid-cell');
    cells.forEach(cell => {
        const cellCoords = extractCoordinates(cell.id);
        if (cellCoords[0] === gridRows - 1 || cellCoords[1] === gridCols - 1) {
            return; // Skip the last row and last column cells
        }
        if (isAdjacent(coords, cellCoords) && cell.children.length === 0) {
            cell.classList.add('highlight');
        }
    });
}

function clearHighlight() {
    const cells = document.querySelectorAll('.grid-cell.highlight');
    cells.forEach(cell => {
        cell.classList.remove('highlight');
    });
}
