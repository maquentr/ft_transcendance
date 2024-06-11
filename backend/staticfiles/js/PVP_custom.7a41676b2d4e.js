import { quitGame } from "./utilsGame.js";

let Pong;

let DIRECTION = {
    IDLE: 0,
    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4,
};

let power = {
    NONE: 404,
    BIGPADDLE: 10, 
    SMALLPADDLE: 11,
    DOUBLEPTS: 12,
    PADSPEED: 13, 
};

let Ball = {
    new: function (ballColor) {
        return {
            width: 18,
            height: 18,
            color: ballColor,
            x: (this.canvas.width / 2) - 9,
            y: (this.canvas.height / 2) - 9,
            moveX: DIRECTION.IDLE,
            moveY: DIRECTION.IDLE,
            speed: 7
        };
    }
};

let Player = {
    new: function (paddleColor, playerName, side) {
        return {
            name: playerName, // Need a way to get player nickname
            colorPaddle: paddleColor,
            initialWidth: ((this.canvas.width * 1.5) / 100),
            initialHeight: ((this.canvas.height * 15) / 100),
            width: ((this.canvas.width * 1.5) / 100),
            height: ((this.canvas.height * 15) / 100),
            x: side === 'left' ? ((this.canvas.width * 5) / 100) : ((this.canvas.width * 95) / 100),
            y: (this.canvas.height / 2) - 35,
            score: 0,
            powerUp: 0,
            move: DIRECTION.IDLE,
            speed: 8,
            powerChoose: power.BIGPADDLE,
            doublePts: false,
        };
    }
};

const powerUpMapping = {
    "BigPaddle": power.BIGPADDLE,
    "SmallPaddle": power.SMALLPADDLE,
    "DoublePts": power.DOUBLEPTS,
    "FastPaddle": power.PADSPEED,
};

// Function to assign power-ups to players
function assignPowerUps(player, powerUpString) 
{
    if (powerUpMapping.hasOwnProperty(powerUpString)) 
        player.powerChoose = powerUpMapping[powerUpString];
    else
        player.powerChoose = power.NONE; // Default to no power-up
}

let Game = {
    initialize: function (goal) {
        this.canvas = document.querySelector('canvas');
        this.context = this.canvas.getContext('2d');
        this.canvas.style.border = 'solid 0.3em';
        this.canvas.style.borderColor = 'f0f8ff';
        this.victoryScore = Number(goal);
        let parag = document.getElementById('displayName');
        let userName;

        if (!parag || parag.value == '')
            userName = 'Player 1';
        else
            userName = parag.textContent;

        let heightScreen = window.innerHeight;
        let widthScreen = window.innerWidth;
        this.canvas.width = ((widthScreen * 85) / 100);
        this.canvas.height = ((heightScreen * 80) / 100);
 
        this.canvas.style.width = this.canvas.width + 'px';
        this.canvas.style.height = this.canvas.height + 'px';

        let paddleColors = [];
        let powerUp = [];
        for (let i = 1; i <= 2; i++)
        {
            let tmpPaddleColor = document.getElementById(`paddleColorP${i}`);
            let tmpPowerUp = document.getElementById(`powerUpP${i}`);

            if (tmpPaddleColor && tmpPaddleColor.value !== '')
                paddleColors.push(tmpPaddleColor.value);
            else 
                paddleColors.push('#FFFFFF');
            
            if (tmpPowerUp && tmpPowerUp.value !== '')
                powerUp.push(tmpPowerUp.value);
            else
                powerUp.push('BigPaddle');
        }
        let ballColor = document.getElementById('ballColor');
        if (!ballColor || ballColor.value === '')
        {
            ballColor = '#FFFFFF';
        }
        else
            ballColor = ballColor.value;
 

        this.player1 = Player.new.call(this, paddleColors[0], userName,'left');
        this.player2 = Player.new.call(this, paddleColors[1] , 'Player 2','right');
        assignPowerUps(this.player1, powerUp[0]);
        assignPowerUps(this.player2, powerUp[1]);
        this.ball = Ball.new.call(this, ballColor);
 
        this.running = this.over = false;
        this.turn = this.player2;
        this.timer = 0;
        this.color = '#000000';

        this.resolveGameOver = null;
        this.gameOverPromise = new Promise((resolve) => {
            this.resolveGameOver = resolve;
        });
        
        let container = document.getElementById('container');
        while (container.hasChildNodes()){
            container.removeChild(container.lastChild);
        }

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
        if (winner === 'Player 2')
            winner = Pong.player1.name + ';L';
        else
            winner += ';W';

        setTimeout(() => {
            if (this.resolveGameOver) {
                this.resolveGameOver(winner);
            }
        }, 3000);
    },

    usePower: function(player)
    {
        if (player.powerUp >= 20)
        {
           if (player.powerChoose === power.BIGPADDLE)
                    player.height += (player.height / 2);
            else if (player.powerChoose === power.SMALLPADDLE)
            {
                if (player === this.player1)
                    this.player2.height -= (this.player2.height / 4);
                else
                    this.player1.height -= (this.player1.height / 4);
            }
            else if (player.powerChoose === power.PADSPEED)
                player.speed += 2;
            else if (player.powerChoose === power.DOUBLEPTS)
                player.doublePts = true;
            player.powerUp -= 20;
        }
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
                    this.player1.powerUp += 10;
                }
            }
 
            // Handle player2-ball collision
            if (this.ball.x - this.ball.width <= this.player2.x && this.ball.x >= this.player2.x - this.player2.width) {
                if (this.ball.y <= this.player2.y + this.player2.height && this.ball.y + this.ball.height >= this.player2.y) {
                    this.ball.x = (this.player2.x - this.ball.width);
                    this.ball.moveX = DIRECTION.LEFT;
                    this.player2.powerUp += 1;
                }
            }
        }
 
        if (this.player1.score >= this.victoryScore) 
        {
            this.over = true;
            setTimeout(function () { Pong.endGameMenu(Pong.player1.name); }, 1000);
            return;
        }
        else if (this.player2.score >= this.victoryScore) 
        {
            this.over = true;
            setTimeout(function () { Pong.endGameMenu(Pong.player2.name); }, 1000);
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
        
        // Draw the Player 1
        this.context.fillStyle = this.player1.colorPaddle;
        this.context.fillRect(
            this.player1.x,
            this.player1.y,
            this.player1.width,
            this.player1.height
        );
        
        // Draw the Player 2 
        this.context.fillStyle = this.player2.colorPaddle;
        this.context.fillRect(
            this.player2.x,
            this.player2.y,
            this.player2.width,
            this.player2.height 
        );
        
        console.log('ball COlor : ', this.ball.color);
        this.context.fillStyle = this.ball.color;
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
        this.context.moveTo((this.canvas.width / 2), this.canvas.height - 50);
        this.context.lineTo((this.canvas.width / 2), 50);
        this.context.lineWidth = 10;
        this.context.strokeStyle = '#ffffff';
        this.context.stroke();
 
        this.context.font = '100px Courier New';
        this.context.textAlign = 'center';
 
        this.context.fillStyle = '#ffffff'
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

        this.context.font = '15px Courier New';
        this.context.fillText(
            'Power Up : ' + this.player1.powerUp.toString() + ' /20',
            (this.canvas.width / 8),
            (this.canvas.height) - (this.canvas.height / 25)
        );
            
        this.context.fillText(
            'Power Up : ' + this.player2.powerUp.toString() + ' / 20',
            (this.canvas.width) - (this.canvas.width / 8),
            (this.canvas.height) - (this.canvas.height / 25)
        );
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
 
            
        /* This is deprecated but still work for some obscur reason. DON'T ASK ME  */

            // Handle up arrow and w key events
            if (key.keyCode === 87) Pong.player1.move = DIRECTION.UP;
            if (key.keyCode === 38) Pong.player2.move = DIRECTION.UP;

            // Handle down arrow and s key events
            if (key.keyCode === 83) Pong.player1.move = DIRECTION.DOWN;
            if (key.keyCode === 40) Pong.player2.move = DIRECTION.DOWN;

            // Handle 'q' and right arrow key events [81, 39]
            if (key.keyCode === 81)
                Pong.usePower(Pong.player1);
            if (key.keyCode === 39)
                Pong.usePower(Pong.player2);
        });
 
        // Stop the player1 from moving when there are no keys being pressed.
        document.addEventListener('keyup', function (key) {
            if (key.keyCode === 87 || key.keyCode == 83)
                Pong.player1.move = DIRECTION.IDLE;
            if (key.keyCode === 38 || key.keyCode === 40)
                Pong.player2.move = DIRECTION.IDLE;
        });
    },
 
    // Reset the ball location, the player1 turns and set a delay before the next round begins.
    _resetTurn: function(victor, loser) {
        this.ball = Ball.new.call(this, this.ball.color);
        this.turn = loser;
        this.timer = (new Date()).getTime();
        console.log('vicotr object : ', victor);
        console.log('victor double points  : ', victor.doublePts);
        if (victor.doublePts)
        {
            victor.score += 2;
            victor.doublePts = false;
        }
        else
            victor.score++;
        loser.powerUp += 3;
    },
 
    // Wait for a delay to have passed after each turn.
    _turnDelayIsOver: function() {
        return ((new Date()).getTime() - this.timer >= 1000);
    },

    onGameOver: function () {
        return this.gameOverPromise;
    }
};

async function start1v1CustomGame(goal)
{
    Pong = Object.assign({}, Game);
    Pong.initialize(goal);

    let winner = await Pong.onGameOver();

    quitGame('callback-1v1custom', winner);
}

export {start1v1CustomGame};