let isFirstDrop = true;
let firstDropCoords = null; // Variable to store the coordinates of the first drop
let initialDraggedElement = null; // Store the initial dragged element
let initialDropTarget = null; // Store the initial drop target

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('grid');
    const cells = Array.from({ length: 25 }, (_, i) => {
        const row = Math.floor(i / 5);
        const col = i % 5;
        return `<div id="drag_${row}_${col}" class="grid-cell" ondrop="drop(event)" ondragover="allowDrop(event)"></div>`;
    }).join('');
    grid.innerHTML = cells;
    document.getElementById('revertButton').disabled = true; // Enable the revert button

    // Add event listener for the debug button
    document.getElementById('debugButton').addEventListener('click', () => {
        const score = computeScore();
        document.getElementById('score').innerHTML = '<span>Score: ' + score + '</span>';
    });
});

function rollDice() {
    const numberOfDice = 2; //document.getElementById('diceCount').value;
    const symbols = ['♠', '♥', '♦', '♣', '★', '☀'];
    const colors = ['red', 'blue', 'green', 'purple', 'orange', 'pink']; // Define a color palette
    let results = [];
    for (let i = 0; i < numberOfDice; i++) {
        const roll = Math.floor(Math.random() * symbols.length);
        results.push({ symbol: symbols[roll], color: colors[roll] });
    }
    document.getElementById('result').innerHTML = results.map((result, index) => 
        `<span draggable="true" id="drag${index}" ondragstart="drag(event)" style="color: ${result.color};">${result.symbol}</span>`
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

    // Ensure the drop target is a valid cell
    if (!dropTarget.id.startsWith('drag')) {
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
    } else {
        // Check if the drop target is adjacent to the first drop coordinates
        if (isAdjacent(firstDropCoords, dropTargetCoords)) {
            dropTarget.appendChild(draggedElement);
            isFirstDrop = true;
            document.getElementById('revertButton').disabled = true; // Disable the revert button after the second drop
            if(checkForPossibleMoves()){
                document.getElementById('rollButton').disabled = false; // Disable the revert button after the second drop
            }
            else{
                //compute score
                const score = computeScore();
                document.getElementById('score').innerHTML = '<span>Score: ' + score + '</span>';
            }
        }
    }
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
        document.getElementById('result').appendChild(initialDraggedElement);
        initialDropTarget.innerHTML = ''; // Clear the initial drop target
        isFirstDrop = true; // Reset the flag
        firstDropCoords = null; // Clear the stored coordinates
        initialDraggedElement = null; // Clear the stored dragged element
        initialDropTarget = null; // Clear the stored drop target
        document.getElementById('revertButton').disabled = true; // Enable the revert button
    }
}

function checkForPossibleMoves() {
    const cells = document.querySelectorAll('.grid-cell');
    let possibleMoves = false;

    outerLoop: for (const cell of cells) {
        if (cell.children.length === 0) {
            const coords = extractCoordinates(cell.id);
            for (const otherCell of cells) {
                if (otherCell.children.length === 0) {
                    const otherCoords = extractCoordinates(otherCell.id);
                    if (isAdjacent(coords, otherCoords)) {
                        possibleMoves = true;
                        break outerLoop;
                    }
                }
            }
        }
    }

    if (!possibleMoves) {
        alert('No more possible moves!');
    }
    return possibleMoves;
}

function computeScore() {
    const grid = document.querySelectorAll('.grid-cell');
    const rows = 5;
    const cols = 5;
    let score = 0;

    // Create a 2D array to store the symbols in the grid
    const gridSymbols = Array.from({ length: rows }, () => Array(cols).fill(null));

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
                if (count > 1) {
                    points += count;
                }
                count = 1;
            }
        }

        if (count > 1) {
            points += count;
        }

        return points;
    }

    // Calculate points for rows and display the score on the right of each row
    for (let row = 0; row < rows; row++) {
        const rowScore = calculateLinePoints(gridSymbols[row]);
        score += rowScore;
        const rowElement = document.getElementById(`drag_${row}_${cols - 1}`).parentElement;
        rowElement.insertAdjacentHTML('beforeend', `<div class="row-score">Row ${row + 1} Score: ${rowScore}</div>`);
    }

    // Calculate points for columns and display the score under each column
    for (let col = 0; col < cols; col++) {
        const column = gridSymbols.map(row => row[col]);
        const colScore = calculateLinePoints(column);
        score += colScore;
        const colElement = document.getElementById(`drag_${rows - 1}_${col}`).parentElement;
        colElement.insertAdjacentHTML('beforeend', `<div class="col-score">Col ${col + 1} Score: ${colScore}</div>`);
    }

    return score;
}
