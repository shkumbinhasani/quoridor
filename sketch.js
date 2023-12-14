// Define game variables
let boardSize = 9;
let cellSize;
let board;
let players = [
    {x: 4, y: 0, animatedX: 4, animatedY: 0, color: [255, 0, 0], wallsPlaced: 0}, // Red color for player 1
    {x: 4, y: 8, animatedX: 4, animatedY: 8, color: [0, 0, 255], wallsPlaced: 0}, // Blue color for player 2
];
let walls = []; // Array to store wall positions
let currentPlayer = 0; // Start with the first player
let toggleButton;
let isPlacingWall = false;

function setup() {
    createCanvas(400, 400);
    cellSize = width / boardSize;
    board = createBoard();
    drawPlayers();
    // walls.push({ x: 0, y: 1, orientation: 'horizontal' });
    // walls.push({ x: 5, y: 5, orientation: 'vertical' });
    toggleButton = createButton('Place Wall');
    toggleButton.mousePressed(toggleWallPlacement);
}

function drawPlayers() {
    for (let player of players) {
        fill(player.color);
        ellipse(
            player.animatedX * cellSize + cellSize / 2,
            player.animatedY * cellSize + cellSize / 2,
            cellSize / 2
        );
    }
}

function draw() {
    background(220);
    drawBoard();
    drawPlayers();
    updateAnimation();
    displayWallsLeft(); // Display the number of walls left for each player
    let playableSquares = getPlayableSquares(players[currentPlayer]);


    if (!isPlacingWall) {
        // Highlight playable squares
        for (let square of playableSquares) {
            fill(200, 200, 0, 128); // Yellow color for playable squares
            rect(square.x * cellSize, square.y * cellSize, cellSize, cellSize);
        }
    } else {
        drawPotentialWall();
    }

    drawWalls();
}

function toggleWallPlacement() {
    isPlacingWall = !isPlacingWall;
    toggleButton.html(isPlacingWall ? 'Move Player' : 'Place Wall');
}

function bfs(start, end) {
    let queue = [];
    let visited = new Array(boardSize).fill(false).map(() => new Array(boardSize).fill(false));

    queue.push(start);
    visited[start.y][start.x] = true;

    while (queue.length > 0) {
        let current = queue.shift();

        if (current.x === end.x && current.y === end.y) {
            return true;
        }

        let directions = [
            {dx: -1, dy: 0}, // left
            {dx: 1, dy: 0}, // right
            {dx: 0, dy: -1}, // up
            {dx: 0, dy: 1}, // down
        ];

        for (let dir of directions) {
            let newX = current.x + dir.dx;
            let newY = current.y + dir.dy;

            if (newX >= 0 && newX < boardSize && newY >= 0 && newY < boardSize &&
                !isWallInWay(current.x, current.y, newX, newY) && !visited[newY][newX]) {
                queue.push({x: newX, y: newY});
                visited[newY][newX] = true;
            }
        }
    }

    return false;
}

function canPlaceWall(x, y, orientation) {
    if (players[currentPlayer].wallsPlaced >= 10) {
        console.log('No more walls left');
        return false;
    }

    if (orientation === 'vertical') {
        if (x <= 0 || x >= boardSize || y < 0 || y >= boardSize - 1) {
            console.log('Vertical Wall out of bounds');
            return false;
        }
    } else {
        if (x < 0 || x >= boardSize - 1 || y <= 0 || y >= boardSize) {
            console.log('Horizontal Wall out of bounds');
            return false;
        }
    }

    for (let wall of walls) {
        if (wall.x === x && wall.y === y && wall.orientation === orientation) {
            console.log('Wall already exists');
            return false;
        }
    }

    for (let wall of walls) {
        if (wall.orientation === 'vertical' && orientation === 'horizontal' && wall.x - 1 === x && wall.y + 1 === y) {
            console.log('Wall would cross another wall');
            return false;
        }
        if (wall.orientation === 'horizontal' && orientation === 'vertical' && wall.x + 1 === x && wall.y - 1 === y) {
            console.log('Wall would cross another wall');
            return false;
        }
        if (wall.orientation === 'vertical' && orientation === 'vertical' && wall.x === x && wall.y + 1 === y) {
            console.log('Wall would overlap with another wall');
            return false;
        }
        if (wall.orientation === 'horizontal' && orientation === 'horizontal' && wall.x + 1 === x && wall.y === y) {
            console.log('Wall would overlap with another wall');
            return false;
        }

        if (wall.orientation === 'vertical' && orientation === 'vertical' && wall.x === x && wall.y - 1 === y) {
            console.log('Wall would overlap with another wall');
            return false;
        }
        if (wall.orientation === 'horizontal' && orientation === 'horizontal' && wall.x - 1 === x && wall.y === y) {
            console.log('Wall would overlap with another wall');
            return false;
        }
    }

    walls.push({x: x, y: y, orientation: orientation});

    // Check if there is a path for each player
    for (let player of players) {
        let end = {x: player.x, y: player.color[0] === 255 ? boardSize - 1 : 0}; // Assuming red player moves towards the bottom and blue player moves towards the top
        if (!bfs(player, end)) {
            // If there is no path, remove the temporary wall and return false
            walls.pop();
            console.log('Wall would block player');
            return false;
        }
    }

    // If there is a path for each player, remove the temporary wall and return true
    walls.pop();
    // If there is no wall and the new wall would not cross an existing wall or overlap with half of an existing wall, return true
    return true;
}

function createBoard() {
    let b = new Array(boardSize);
    for (let i = 0; i < boardSize; i++) {
        b[i] = new Array(boardSize).fill(0);
    }
    return b;
}

function drawBoard() {
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            stroke(0);
            fill(255);
            rect(i * cellSize, j * cellSize, cellSize, cellSize);
        }
    }
}

function drawWalls() {
    for (let wall of walls) {
        fill(128); // Gray color for walls
        if (wall.orientation === 'horizontal') {
            rect(wall.x * cellSize, (wall.y * cellSize) - 5, cellSize * 2, cellSize / 4);
        } else { // vertical
            rect((wall.x * cellSize) - 5, wall.y * cellSize, cellSize / 4, cellSize * 2);
        }
    }
}

function getPlayableSquares(player) {
    let playableSquares = [];

    // Check the squares around the player's current position
    let directions = [
        {dx: -1, dy: 0}, // left
        {dx: 1, dy: 0}, // right
        {dx: 0, dy: -1}, // up
        {dx: 0, dy: 1}, // down
    ];
    for (let dir of directions) {
        let newX = player.x + dir.dx;
        let newY = player.y + dir.dy;

        // If the square is inside the board and there is no wall in the way, it's playable
        if (newX >= 0 && newX < boardSize && newY >= 0 && newY < boardSize &&
            !isWallInWay(player.x, player.y, newX, newY)) {
            // Check if the opponent is in the square
            let opponent = players[(currentPlayer + 1) % players.length];
            if (newX !== opponent.x || newY !== opponent.y) {
                playableSquares.push({x: newX, y: newY});
            }
        }

        // Check if the opponent is in the way and the square beyond the opponent is playable
        let opponent = players[(currentPlayer + 1) % players.length];
        if (newX === opponent.x && newY === opponent.y) {
            let beyondX = newX + dir.dx;
            let beyondY = newY + dir.dy;
            if (beyondX >= 0 && beyondX < boardSize && beyondY >= 0 && beyondY < boardSize &&
                !isWallInWay(newX, newY, beyondX, beyondY)) {
                playableSquares.push({x: beyondX, y: beyondY});
            }
        }
    }

    return playableSquares;
}

function isWallInWay(x1, y1, x2, y2) {
    // Check if there is a wall between the squares (x1, y1) and (x2, y2)
    for (let wall of walls) {
        if (wall.orientation === 'horizontal' && y2 > y1 && wall.y === y1 + 1 && wall.x <= x1 && wall.x + 2 > x1 ||
            wall.orientation === 'horizontal' && y2 < y1 && wall.y === y2 + 1 && wall.x <= x1 && wall.x + 2 > x1 ||
            wall.orientation === 'vertical' && x2 > x1 && wall.x === x1 + 1 && wall.y <= y1 && wall.y + 2 > y1 ||
            wall.orientation === 'vertical' && x2 < x1 && wall.x === x2 + 1 && wall.y <= y1 && wall.y + 2 > y1) {
            return true;
        }
    }
    return false;
}

function mouseClicked() {
    let x = Math.floor(mouseX / cellSize);
    let y = Math.floor(mouseY / cellSize);

    if (isPlacingWall) {
        let orientation = getWallOrientation();
        if (canPlaceWall(x, y, orientation)) {
            walls.push({x: x, y: y, orientation: orientation});
            isPlacingWall = !isPlacingWall;
            toggleButton.html(isPlacingWall ? 'Move Player' : 'Place Wall');
            players[currentPlayer].wallsPlaced++;
            currentPlayer = (currentPlayer + 1) % players.length;
        }
    } else {
        let playableSquares = getPlayableSquares(players[currentPlayer]);
        for (let square of playableSquares) {
            if (square.x === x && square.y === y) {
                players[currentPlayer].x = x;
                players[currentPlayer].y = y;
                currentPlayer = (currentPlayer + 1) % players.length;
                break;
            }
        }
    }
}

function displayWallsLeft() {
    document.getElementById('info').innerHTML = `
        <p>Player 1 Walls Left: ${(10 - players[0].wallsPlaced)}</p>
        <p>Player 2 Walls Left: ${(10 - players[1].wallsPlaced)}</p>
    `;

}

function updateAnimation() {
    for (let player of players) {
        player.animatedX = lerp(player.animatedX, player.x, 0.1);
        player.animatedY = lerp(player.animatedY, player.y, 0.1);
    }
}

function getWallOrientation() {
    let x = Math.floor(mouseX / cellSize);
    let y = Math.floor(mouseY / cellSize);

    let distToVerticalLine = Math.abs(mouseX - (x * cellSize));
    let distToHorizontalLine = Math.abs(mouseY - (y * cellSize));

    if (distToVerticalLine < distToHorizontalLine) {
        return 'vertical';
    } else {
        return 'horizontal';
    }
}

function drawPotentialWall() {
    let x = Math.floor(mouseX / cellSize);
    let y = Math.floor(mouseY / cellSize);
    let orientation = getWallOrientation();

    if (canPlaceWall(x, y, orientation)) {
        fill(128, 128, 128, 128); // Semi-transparent gray color for potential walls
        if (orientation === 'vertical') {
            // Draw vertical wall
            rect((x * cellSize) - 5, y * cellSize, cellSize / 4, cellSize * 2);
        } else {
            // Draw horizontal wall
            rect(x * cellSize, (y * cellSize) - 5, cellSize * 2, cellSize / 4);
        }
    }
}

// Add more functions for game logic, player movement, wall placement, etc.
