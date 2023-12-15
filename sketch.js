// Define game variables
let boardSize = 9;
let cellSize;
let board;
let players = [
    {
        x: 4,
        y: 0,
        startPoints: {
            x: 4,
            y: 0
        },
        animatedX: 4,
        animatedY: 0,
        color: [255, 0, 0],
        wallsPlaced: 0
    }, // Red color for player 1
    {
        x: 4,
        y: 8,
        startPoints: {
            x: 4,
            y: 8
        },
        animatedX: 4,
        animatedY: 8,
        color: [0, 0, 255],
        wallsPlaced: 0
    }, // Blue color for player 2
];
let walls = []; // Array to store wall positions
let currentPlayer = 0; // Start with the first player
let isPlacingWall = false;
let toggleHtmlButton;

const interval = setInterval(() => {
    toggleHtmlButton = document.getElementById("toggle-wall");
    console.log(toggleHtmlButton)
    if (toggleHtmlButton) {
        toggleHtmlButton.addEventListener("click", toggleWallPlacement);
        clearInterval(interval);
    }
}, 100);


function setup() {
    const canvas = createCanvas(400, 400);
    canvas.parent('game');
    cellSize = width / boardSize;
    board = createBoard();
    drawPlayers();
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
    toggleHtmlButton.innerHTML = isPlacingWall ? 'Move Player' : 'Place Wall';
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

    // Simulate placing the wall
    let simulatedWalls = walls.slice(); // Copy the current walls
    simulatedWalls.push({x: x, y: y, orientation: orientation});

    // Check if there is still a path for each player
    for (let player of players) {
        if (!isPathToGoal(player, simulatedWalls)) {
            console.log('Wall would block a player');
            return false;
        }
    }
    // If there is no wall and the new wall would not cross an existing wall or overlap with half of an existing wall, return true
    return true;
}

function isPathToGoal(player, walls) {
    let queue = [{x: player.x, y: player.y}];
    let visited = new Set([`${player.x},${player.y}`]);

    while (queue.length > 0) {
        let {x, y} = queue.shift();

        // If this position is on the goal line, return true
        if ((player.startPoints.y === 0 && y === boardSize - 1) ||
            (player.startPoints.y === boardSize - 1 && y === 0)) {
            // Check if there is a wall on the goal line that would block the player's path
            if (!isWallInWay(x, y, x, y + (player.startPoints.y === 0 ? 1 : -1), walls)) {
                return true;
            }
        }

        // Check the adjacent positions
        let directions = [
            {dx: -1, dy: 0}, // left
            {dx: 1, dy: 0}, // right
            {dx: 0, dy: -1}, // up
            {dx: 0, dy: 1}, // down
        ];
        for (let dir of directions) {
            let newX = x + dir.dx;
            let newY = y + dir.dy;

            // If the position is inside the board and not blocked by a wall
            if (newX >= 0 && newX < boardSize && newY >= 0 && newY < boardSize &&
                !isWallInWay(x, y, newX, newY, walls)) {
                let pos = `${newX},${newY}`;
                // If this position has not been visited yet
                if (!visited.has(pos)) {
                    queue.push({x: newX, y: newY});
                    visited.add(pos);
                }
            }
        }
    }

    // If we have explored all reachable positions and have not found the goal line, return false
    return false;
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
            stroke(148, 148, 148); // Change the stroke color to red
            fill(255);
            for (const player of players) {
                if (player.startPoints.x === 4 && player.startPoints.y === boardSize - j - 1) {
                    fill([...player.color, 45]);
                } else if (player.startPoints.y === 4 && player.startPoints.x === boardSize - i - 1) {
                    fill([...player.color, 45]);
                }
            }

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
            !isWallInWay(player.x, player.y, newX, newY, walls)) {
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
                !isWallInWay(newX, newY, beyondX, beyondY, walls) &&
                !isWallInWay(player.x, player.y, newX, newY, walls)) { // Check if there is a wall between the current player and the opponent
                playableSquares.push({x: beyondX, y: beyondY});
            }
        }
    }

    return playableSquares;
}
function isWallInWay(x1, y1, x2, y2, walls) {
    // Check if there is a wall between the squares (x1, y1) and (x2, y2)
    for (let wall of walls) {
        if (wall.orientation === 'horizontal' && y2 > y1 && wall.y === y1 + 1 && wall.x <= x1 && wall.x + 2 > x1 ||
            wall.orientation === 'horizontal' && y2 < y1 && wall.y === y2 + 1 && wall.x <= x1 && wall.x + 2 > x1 ||
            wall.orientation === 'vertical' && x2 > x1 && wall.x === x1 + 1 && wall.y <= y1 && wall.y + 2 > y1 ||
            wall.orientation === 'vertical' && x2 < x1 && wall.x === x2 + 1 && wall.y <= y1 && wall.y + 2 > y1) {
            return true;
        }
    }
    // Check if there is a wall on the goal line that would block the player's path
    if ((y1 === 0 && y2 === boardSize - 1) || (y1 === boardSize - 1 && y2 === 0)) {
        for (let wall of walls) {
            if (wall.orientation === 'horizontal' && wall.y === y2 && wall.x <= x1 && wall.x + 2 > x1) {
                return true;
            }
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
            players[currentPlayer].wallsPlaced++;
            currentPlayer = (currentPlayer + 1) % players.length;
            toggleHtmlButton.innerHTML = isPlacingWall ? 'Move Player' : 'Place Wall';
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
    document.getElementById("player-1-walls-left").innerHTML = (10 - players[0].wallsPlaced);
    document.getElementById("player-2-walls-left").innerHTML = (10 - players[1].wallsPlaced);
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
