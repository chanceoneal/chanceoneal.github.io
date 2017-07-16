(function () {
	'use strict';

	// Constants
	var COLS = 20;
	var ROWS = 20;
	var SCORES = [0, 0, 0, 0, 0];

	// IDs
	var EMPTY = 0;
	var SNAKE = 1;
	var FRUIT = 2;

	// Directions
	var LEFT = 0;
	var UP = 1;
	var RIGHT = 2;
	var DOWN = 3;

	// Key Codes
	var KEY_LEFT = 37;
	var KEY_UP = 38;
	var KEY_RIGHT = 39;
	var KEY_DOWN = 40;

	var grid = {
		width: null,
		height: null,
		_grid: null,

		init: function (d, columns, rows) {
			this.width = columns;
			this.height = rows;

			this._grid = [];
			for (var x = 0; x < columns; x++) {
				this._grid.push([]);
				for (var y = 0; y < rows; y++) {
					this._grid[x].push(d);
				}
			}
		},

		set: function (val, x, y) {
			this._grid[x][y] = val;
		},

		get: function (x, y) {
			return this._grid[x][y];
		}
	}

	var snake = {
		direction: null,
		last: null,
		_queue: null,

		init: function (direction, x, y) {
			this.direction = direction;
			this._queue = [];
			this.insert(x, y);
		},
		insert: function (x, y) {
			this._queue.unshift({
				x: x,
				y: y
			});
			this.last = this._queue[0];
		},

		remove: function () {
			return this._queue.pop();
		}
	}

	function setFood() {
		var empty = [];

		for (var x = 0; x < grid.width; x++) {
			for (var y = 0; y < grid.height; y++) {
				if (grid.get(x, y) === EMPTY) {
					empty.push({
						x: x,
						y: y
					});
				}
			}
		}

		var randPos = empty[Math.floor(Math.random() * (empty.length - 1))];
		grid.set(FRUIT, randPos.x, randPos.y);
	}

	// Game objects
	var canvas, context, keyState, frames, score;

	function main() {
		document.getElementById("startButton").style.display = "none";
		document.getElementById("scoreTable").style.display = "initial";
		canvas = document.createElement("canvas");
		canvas.width = COLS * 20;
		canvas.height = ROWS * 20;

		context = canvas.getContext("2d");
		document.body.appendChild(canvas);
		context.font = "12pt Helvetica";

		frames = 0;
		keyState = {};

		document.addEventListener("keydown", function (event) {
			keyState[event.keyCode] = true;
		});

		document.addEventListener("keyup", function (event) {
			delete keyState[event.keyCode];
		});

		init();
		loop();
	}

	function init() {
		score = 0;
		var snakePos = {
			x: Math.floor(COLS / 2),
			y: ROWS - 1
		};

		grid.init(EMPTY, COLS, ROWS);
		snake.init(UP, snakePos.x, snakePos.y);
		grid.set(SNAKE, snakePos.x, snakePos.y);

		setFood();
	}

	function loop() {
		update();
		draw();

		window.requestAnimationFrame(loop, canvas);
	}

	function update() {

		frames++;

		if (keyState[KEY_LEFT] && snake.direction !== RIGHT) {
			snake.direction = LEFT;
		}
		if (keyState[KEY_UP] && snake.direction !== DOWN) {
			snake.direction = UP;
		}
		if (keyState[KEY_RIGHT] && snake.direction !== LEFT) {
			snake.direction = RIGHT;
		}
		if (keyState[KEY_DOWN] && snake.direction !== UP) {
			snake.direction = DOWN;
		}

		if (frames % 7 === 0) {
			var newX = snake.last.x;
			var newY = snake.last.y;

			switch (snake.direction) {
				case LEFT:
					newX--;
					break;
				case UP:
					newY--;
					break;
				case RIGHT:
					newX++;
					break;
				case DOWN:
					newY++;
					break;
			}

			// Restarts the game if snake touches sides or itself...
			// Change later to move snake from one end to the other
			if (newX < 0 || newX > grid.width - 1 || newY < 0 || newY > grid.height - 1 || grid.get(newX, newY) === SNAKE) {
				for (var i = 0; i < SCORES.length; i++) {
					if (score > SCORES[i] && i === SCORES.length - 1) {
						SCORES[i] = score;
						break;
					} else if (score > SCORES[i]) {
						var temp = SCORES[i];
						SCORES[i] = score;
						for (var j = i + 1; j < SCORES.length; j++) {
							var temp2 = SCORES[j];
							SCORES[j] = temp;
							temp = temp2;
						}
						break;
					}
				}
				setScoreBoard();
				return init();
			}

			// if (newX < 0 || newX > grid.width - 1 || newY < 0 || newY > grid.height - 1) {

			// }

			if (grid.get(newX, newY) === FRUIT) {
				var tail = {
					x: newX,
					y: newY
				};
				score++;
				setFood();
			} else {
				var tail = snake.remove();
				grid.set(EMPTY, tail.x, tail.y);
				tail.x = newX;
				tail.y = newY;
			}

			grid.set(SNAKE, tail.x, tail.y);

			snake.insert(tail.x, tail.y);
		}
	}

	function draw() {
		var tileWidth = canvas.width / grid.width;
		var tileHeight = canvas.height / grid.height;

		for (var x = 0; x < grid.width; x++) {
			for (var y = 0; y < grid.height; y++) {
				switch (grid.get(x, y)) {
					case EMPTY:
						context.fillStyle = "#000";
						break;
					case SNAKE:
						context.fillStyle = "#0ff";
						break;
					case FRUIT:
						context.fillStyle = "#f00";
						break;
				}
				context.fillRect(x * tileWidth, y * tileHeight, tileWidth, tileHeight);
			}
		}

		context.fillStyle = "#fff";
		context.fillText("SCORE: " + score, 10, canvas.height - 10);
	}

	function initializeScoreBoard() {
		var tableData = document.getElementById("tableId").getElementsByTagName("td");
		for (var j = 1; j < tableData.length; j += 2) {
			tableData[j].innerHTML = 0;
		}
	}

	function setScoreBoard() {
		var tableData = document.getElementById("tableId").getElementsByTagName("td");
		var i = 0;
		for (var j = 1; j < tableData.length; j += 2) {
			tableData[j].innerHTML = SCORES[i];
			i++;
		}
	}

	function pauseGame() {
		canvas.parentNode.removeChild(canvas);
		document.getElementById("startButton").style.display = "initial";

	}

	window.onload = function () {
		initializeScoreBoard();
		document.getElementById("startButton").onclick = main;

		// document.getElementById("stopButton").onclick = stopGame;
		// document.getElementById("pauseButton").onclick = pauseGame;
	}
})();