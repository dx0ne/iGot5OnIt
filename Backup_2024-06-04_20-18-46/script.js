let isFirstDrop = true;
let firstDropCoords = null; // Variable to store the coordinates of the first drop

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('grid');
    const cells = Array.from({ length: 25 }, (_, i) => {
        const row = Math.floor(i / 5);
        const col = i % 5;
        return `<div id="drag_${row}_${col}" class="grid-cell" ondrop="drop(event)" ondragover="allowDrop(event)"></div>`;
    }).join('');
    grid.innerHTML = cells;
});

function rollDice() {
    const numberOfDice = 2; //document.getElementById('diceCount').value;
    let results = [];
    for (let i = 0; i < numberOfDice; i++) {
        const roll = Math.floor(Math.random() * 6) + 1;
        results.push(roll);
    }
    document.getElementById('result').innerHTML = results.map((result, index) => 
        `<span draggable="true" id="drag${index}" ondragstart="drag(event)">${result}</span>`
    ).join('');
    isFirstDrop = true; // Reset the flag after each roll
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
    } else {
        // Check if the drop target is adjacent to the first drop coordinates
        if (isAdjacent(firstDropCoords, dropTargetCoords)) {
            dropTarget.appendChild(draggedElement);
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