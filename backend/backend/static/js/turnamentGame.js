let DIRECTION = {
    IDLE: 0,
    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4
};

let Pong;

let Ball = {
    new: function (incrementedSpeed) {
        return {
            width: 18,
            height: 18,
            x: (this.canvas.width / 2) - 9,
            y: (this.canvas.height / 2) - 9,
            moveX: DIRECTION.IDLE,
            moveY: DIRECTION.IDLE,
            speed: incrementedSpeed || 7
        };
    }
};

let Player = {
    new: function (playerName, side) {
        return {
            name: playerName,
            width: ((this.canvas.width * 1.5) / 100),
            height: ((this.canvas.height * 20) / 100),
            x: side === 'left' ? ((this.canvas.width * 5) / 100) : ((this.canvas.width * 95) / 100),
            y: (this.canvas.height / 2) - 35,
            score: 0,
            move: DIRECTION.IDLE,
            speed: 8
        };
    }
};

let Game = {
    initialize: function (user1, user2) {
        this.canvas = document.querySelector('canvas');
        this.context = this.canvas.getContext('2d');
        this.canvas.style.border = 'solid 0.3em';
        this.canvas.style.borderColor = 'f0f8ff';
        this.victoryScore = 5;

        let heightScreen = window.innerHeight;
        let widthScreen = window.innerWidth;
        this.canvas.width = ((widthScreen * 85) / 100);
        this.canvas.height = ((heightScreen * 80) / 100);

        this.canvas.style.width = this.canvas.width + 'px';
        this.canvas.style.height = this.canvas.height + 'px';

        this.player1 = Player.new.call(this, user1, 'left');
        this.player2 = Player.new.call(this, user2, 'right');
        this.ball = Ball.new.call(this);

        this.running = this.over = false;
        this.turn = this.player2;
        this.timer = 0;
        this.color = '#000000';

        this.resolveGameOver = null;
        this.gameOverPromise = new Promise((resolve) => {
            this.resolveGameOver = resolve;
        });

        Pong.menu();
        Pong.listen();
    },

    endGameMenu: function (winner) {
        Pong.context.font = '25px Courier New';
        Pong.context.fillStyle = this.color;

        Pong.context.fillRect(
            Pong.canvas.width / 2 - 350,
            Pong.canvas.height / 2 - 48,
            700,
            100
        );

        // Change the canvas color;
        Pong.context.fillStyle = '#ffffff';

        Pong.context.fillText('Winner is ' + winner,
            Pong.canvas.width / 2,
            Pong.canvas.height / 2 + 15
        );

        setTimeout(() => {
            if (this.resolveGameOver) {
                this.resolveGameOver(winner);
            }
        }, 3000);
    },

    menu: function () {
        Pong.draw();

        this.context.font = '50px Courier New';
        this.context.fillStyle = this.color;

        this.context.fillRect(
            this.canvas.width / 2 - 350,
            this.canvas.height / 2 - 48,
            700,
            100
        );

        this.context.fillStyle = '#ffffff';

        this.context.fillText('Press any key to begin',
            this.canvas.width / 2,
            this.canvas.height / 2 + 15
        );
        return;
    },

    // Update all objects (move the player1, player2, ball, increment the score, etc.)
    update: function () {
        if (!this.over) {
            // If the ball collides with the bound limits - correct the x and y coords.
            if (this.ball.x <= 0) Pong._resetTurn.call(this, this.player2, this.player1);
            if (this.ball.x >= this.canvas.width - this.ball.width) Pong._resetTurn.call(this, this.player1, this.player2);
            if (this.ball.y <= 0) this.ball.moveY = DIRECTION.DOWN;
            if (this.ball.y >= this.canvas.height - this.ball.height) this.ball.moveY = DIRECTION.UP;

            // Move player1 if they player1.move value was updated by a keyboard event
            if (this.player1.move === DIRECTION.UP) this.player1.y -= this.player1.speed;
            else if (this.player1.move === DIRECTION.DOWN) this.player1.y += this.player1.speed;
            if (this.player2.move === DIRECTION.UP) this.player2.y -= this.player2.speed;
            else if (this.player2.move === DIRECTION.DOWN) this.player2.y += this.player2.speed;

            // On new serve (start of each turn) move the ball to the correct side
            // and randomize the direction to add some challenge.
            if (Pong._turnDelayIsOver.call(this) && this.turn) {
                this.ball.moveX = this.turn === this.player1 ? DIRECTION.LEFT : DIRECTION.RIGHT;
                this.ball.moveY = [DIRECTION.UP, DIRECTION.DOWN][Math.round(Math.random())];
                this.ball.y = Math.floor(Math.random() * this.canvas.height - 200) + 200;
                this.turn = null;
            }

            // If the player1 collides with the bound limits, update the x and y coords.
            if (this.player1.y <= 0) this.player1.y = 0;
            else if (this.player1.y >= (this.canvas.height - this.player1.height)) this.player1.y = (this.canvas.height - this.player1.height);

            // Move ball in intended direction based on moveY and moveX values
            if (this.ball.moveY === DIRECTION.UP) this.ball.y -= (this.ball.speed / 1.5);
            else if (this.ball.moveY === DIRECTION.DOWN) this.ball.y += (this.ball.speed / 1.5);
            if (this.ball.moveX === DIRECTION.LEFT) this.ball.x -= this.ball.speed;
            else if (this.ball.moveX === DIRECTION.RIGHT) this.ball.x += this.ball.speed;

            // Handle player2  wall collision
            if (this.player2.y >= this.canvas.height - this.player2.height) this.player2.y = this.canvas.height - this.player2.height;
            else if (this.player2.y <= 0) this.player2.y = 0;

            // Handle Player-Ball collisions
            if (this.ball.x - this.ball.width <= this.player1.x && this.ball.x >= this.player1.x - this.player1.width) {
                if (this.ball.y <= this.player1.y + this.player1.height && this.ball.y + this.ball.height >= this.player1.y) {
                    this.ball.x = (this.player1.x + this.ball.width);
                    this.ball.moveX = DIRECTION.RIGHT;
                }
            }

            // Handle player2-ball collision
            if (this.ball.x - this.ball.width <= this.player2.x && this.ball.x >= this.player2.x - this.player2.width) {
                if (this.ball.y <= this.player2.y + this.player2.height && this.ball.y + this.ball.height >= this.player2.y) {
                    this.ball.x = (this.player2.x - this.ball.width);
                    this.ball.moveX = DIRECTION.LEFT;
                }
            }
        }

        if (this.player1.score === this.victoryScore) {
            this.over = true;
            setTimeout(() => {
                Pong.endGameMenu(Pong.player1.name);
            }, 1000);
            return;
        } else if (this.player2.score === this.victoryScore) {
            this.over = true;
            setTimeout(() => {
                Pong.endGameMenu(Pong.player2.name);
            }, 1000);
            return;
        }
    },

    // Draw the objects to the canvas element
    draw: function () {
        // Clear the Canvas
        this.context.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

        this.context.fillStyle = this.color;

        this.context.fillRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

        // Set the fill style to white (For the paddles and the ball)
        this.context.fillStyle = '#ffffff';

        // Draw the Player
        this.context.fillRect(
            this.player1.x,
            this.player1.y,
            this.player1.width,
            this.player1.height
        );

        // Draw the Ai
        this.context.fillRect(
            this.player2.x,
            this.player2.y,
            this.player2.width,
            this.player2.height
        );

        // Draw the Ball
        if (Pong._turnDelayIsOver.call(this)) {
            this.context.fillRect(
                this.ball.x,
                this.ball.y,
                this.ball.width,
                this.ball.height
            );
        }

        // Draw the net (Line in the middle)
        this.context.beginPath();
        this.context.setLineDash([7, 15]);
        this.context.moveTo((this.canvas.width / 2), this.canvas.height - 120);
        this.context.lineTo((this.canvas.width / 2), 50);
        this.context.lineWidth = 10;
        this.context.strokeStyle = '#ffffff';
        this.context.stroke();

        this.context.font = '100px Courier New';
        this.context.textAlign = 'center';

        // Draw the players score (left)
        this.context.fillText(
            this.player1.score.toString(),
            (this.canvas.width / 2) - 300,
            200
        );

        // Draw the paddles score (right)
        this.context.fillText(
            this.player2.score.toString(),
            (this.canvas.width / 2) + 300,
            200
        );

        // Change the font size for the center score text
        this.context.font = '30px Courier New';

        // Draw the winning score (center)
        this.context.fillText(
            'Goal ' + (Pong.victoryScore),
            (this.canvas.width / 2),
            35
        );

        // Change the font size for the center score value
        this.context.font = '40px Courier';

        // Draw the current round number
    },

    loop: function () {
        Pong.update();
        Pong.draw();

        // If the game is not over, draw the next frame.
        if (!Pong.over) requestAnimationFrame(Pong.loop);
    },

    listen: function () {
        document.addEventListener('keydown', function (key) {
            // Handle the 'Press any key to begin' function and start the game.
            if (Pong.running === false) {
                Pong.running = true;
                window.requestAnimationFrame(Pong.loop);
            }

            // Handle up arrow and w key events
            if (key.keyCode === 87) Pong.player1.move = DIRECTION.UP;
            if (key.keyCode === 38) Pong.player2.move = DIRECTION.UP;

            // Handle down arrow and s key events
            if (key.keyCode === 83) Pong.player1.move = DIRECTION.DOWN;
            if (key.keyCode === 40) Pong.player2.move = DIRECTION.DOWN;
        });

        // Stop the player1 from moving when there are no keys being pressed.
        document.addEventListener('keyup', function (key) {
            if (key.keyCode === 87 || key.keyCode == 83)
                Pong.player1.move = DIRECTION.IDLE;
            if (key.keyCode === 38 || key.keyCode === 40)
                Pong.player2.move = DIRECTION.IDLE;
        });
        if (Pong.over)
            return;
    },

    // Reset the ball location, the player1 turns and set a delay before the next round begins.
    _resetTurn: function (victor, loser) {
        this.ball = Ball.new.call(this, this.ball.speed);
        this.turn = loser;
        this.timer = (new Date()).getTime();

        victor.score++;
    },

    // Wait for a delay to have passed after each turn.
    _turnDelayIsOver: function () {
        return ((new Date()).getTime() - this.timer >= 1000);
    },

    // Return the game over Promise
    onGameOver: function () {
        return this.gameOverPromise;
    }
};

async function startTournamentGame(username1, username2) {
    Pong = Object.assign({}, Game);
    Pong.initialize(username1, username2);

    let winner = await Pong.onGameOver();

    console.log(winner);
    let canvas = document.querySelector('canvas');
    canvas.remove();
    let newCan = document.createElement('canvas');
    document.body.appendChild(newCan);
    return (winner);
}

export { startTournamentGame };
