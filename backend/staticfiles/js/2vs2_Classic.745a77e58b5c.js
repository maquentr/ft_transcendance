    import { quitGame } from "./utilsGame.js";

let Pong;

let DIRECTION = {
    IDLE: 0,
    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4,
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

let Team = {
    new: function (teamNb){
        return {
            name: 'Team ' + teamNb,
            score: 0,
        };
    }
};

let Player = {
    new: function (paddleColor, playerName, side, position) {
        return {
            name: playerName, // Need a way to get player nickname
            colorPaddle: paddleColor,
            initialWidth: ((this.canvas.width * 1.5) / 100),
            initialHeight: ((this.canvas.height * 15) / 100),
            width: ((this.canvas.width * 1.5) / 100),
            height: ((this.canvas.height * 15) / 100),
            x: side === 'left' ? ((this.canvas.width * 5) / 100) : ((this.canvas.width * 95) / 100),
            y: position === 'up' ? ((this.canvas.height / 4) - 35) : ((this.canvas.height * 75) / 100),
            move: DIRECTION.IDLE,
            speed: 8,
        };
    }
};

let Game = {
    initialize: function(goal){
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

        this.canvas.width = ((widthScreen * 90) / 100);
        this.canvas.height = ((heightScreen * 80) / 100);
        
        this.canvas.style.width = this.canvas.width + 'px';
        this.canvas.style.height = this.canvas.height + 'px';

        
        this.player1 = Player.new.call(this, '#ffffff', userName, 'left', 'up');
        this.player2 = Player.new.call(this, '#ffffff', 'Sarkozy', 'left', 'down');
        this.player3 = Player.new.call(this, '#ffffff', 'Balkany', 'right', 'up');
        this.player4 = Player.new.call(this, '#ffffff', 'Macron', 'right', 'down');
        this.ball = Ball.new.call(this, '#ffffff');

        this.team1 = Team.new.call(this, '1');
        this.team2 = Team.new.call(this, '2');
        
        this.running = this.over = false;
        this.turn = this.team1;
        this.timer = 0;
        this.color = '#000000';

        this.resolveGameOver = null;
        this.gameOverPromise = new Promise((resolve) => {
            this.resolveGameOver = resolve;
        });
        
        
        Pong.menu();
        Pong.listen();
    },

    menu: function () 
    {
        this.running = false;
        // Draw all the Game objects in their current state
        Pong.draw();
        
        // Change the canvas font size and color
        this.context.font = '50px Courier New';
        this.context.fillStyle = this.color;
        
        // Draw the rectangle behind the 'Press any key to begin' text.
        this.context.fillRect(
        this.canvas.width / 2 - 350,
        this.canvas.height / 2 - 48,
        700,
        100
        );
        
        // Change the canvas color;
        this.context.fillStyle = '#ffffff';
        
        // Draw the 'press any key to begin' text
        this.context.fillText('Press any key to begin',
        this.canvas.width / 2,
        this.canvas.height / 2 + 15
        );
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
        if (winner === 'Team 1')
        {
            winner = Pong.player1.name + ';W';
        }
        else
        {
            winner = Pong.player1.name + ';L';
        }

        setTimeout(() => {
            if (this.resolveGameOver) {
                this.resolveGameOver(winner);
            }
        }, 3000);
    },

    update: function () 
    {
        if (!this.over)
        {
            // If the ball collides with the bound limits - correct the x and y coords.
            if (this.ball.x <= 0) Pong._resetTurn.call(this, this.team2, this.team1);
            if (this.ball.x >= this.canvas.width - this.ball.width) Pong._resetTurn.call(this, this.team1, this.team2);
            if (this.ball.y <= 0) this.ball.moveY = DIRECTION.DOWN;
            if (this.ball.y >= this.canvas.height - this.ball.height) this.ball.moveY = DIRECTION.UP;
            
            // Move player if they player.move value was updated by a keyboard event
            if (this.player1.move === DIRECTION.UP) this.player1.y -= this.player1.speed;
            else if (this.player1.move === DIRECTION.DOWN) this.player1.y += this.player1.speed;
            
            // MOve second player
            if (this.player2.move === DIRECTION.UP) this.player2.y -= this.player2.speed;
            else if (this.player2.move === DIRECTION.DOWN) this.player2.y += this.player2.speed;
            if (this.player3.move === DIRECTION.UP) this.player3.y -= this.player3.speed;
            else if (this.player3.move === DIRECTION.DOWN) this.player3.y += this.player3.speed;
            if (this.player4.move === DIRECTION.UP) this.player4.y -= this.player4.speed;
            else if (this.player4.move === DIRECTION.DOWN) this.player4.y += this.player4.speed;
            
            
            // On new serve (start of each turn) move the ball to the correct side
            // and randomize the direction to add some challenge.
            if (Pong._turnDelayIsOver.call(this) && this.turn) 
            {
                this.ball.moveX = this.turn === this.team1 ? DIRECTION.LEFT : DIRECTION.RIGHT;
                this.ball.moveY = [DIRECTION.UP, DIRECTION.DOWN][Math.round(Math.random())];
                this.ball.y = Math.floor(Math.random() * this.canvas.height - 200) + 200;
                this.turn = null;
            }
            
            // If the player collides with the bound limits, update the x and y coords.
            if (this.player1.y <= 0) this.player1.y = 0;
            else if (this.player1.y >= (this.canvas.height - (this.player1.height + this.player2.height))) this.player1.y = (this.canvas.height - (this.player1.height + this.player2.height));
            if (this.player2.y <= this.player1.height) this.player2.y = this.player1.height;
            else if (this.player2.y >= (this.canvas.height - this.player2.height)) this.player2.y = (this.canvas.height - this.player2.height);
            
            if (this.player3.y <= 0) this.player3.y = 0;
            else if (this.player3.y >= (this.canvas.height - this.player3.height)) this.player3.y = (this.canvas.height - this.player3.height);
            
            if (this.player4.y <= 0) this.player4.y = 0;
            else if (this.player4.y >= (this.canvas.height - this.player4.height)) this.player4.y = (this.canvas.height - this.player4.height);
            

          //  console.log('P1 color : ', this.player1.colorPaddle);
          //  console.log('P2 color : ', this.player2.colorPaddle);
          //  console.log('P1 y : ',this.player1.y, 'P1 y+height :', this.player1.y + this.player1.height ,' P2 y : ', this.player2.y);

            /* Handle team1 collision 
            **  Please use it to trll your teammate */

            if (this.player1.y + this.player1.height > this.player2.y && this.player1.move === DIRECTION.DOWN && this.player2.move === DIRECTION.UP)
            {
                this.player1.y -= this.player1.speed;
                this.player2.y = (this.player1.y + this.player1.height);
            }
            else if (((this.player1.y + this.player1.height) > this.player2.y)  && this.player1.move === DIRECTION.DOWN)
            {
                this.player1.y = this.player2.y - this.player1.height;
            }
            else if (this.player2.y < (this.player1.y + this.player1.height))
            {
                this.player2.y = this.player1.y + this.player1.height;
            }

            /* Handle team2 Collision
            ** Pls Use it to troll your teamMate */

            if (this.player3.y + this.player3.height > this.player4.y && this.player3.move === DIRECTION.DOWN && this.player4.move === DIRECTION.UP)
            {
                this.player3.y -= this.player3.speed;
                this.player4.y = (this.player3.y + this.player3.height);
            }
            else if (this.player3.y + this.player3.height > this.player4.y && this.player3.move === DIRECTION.DOWN)
            {
                this.player3.y = this.player4.y - this.player3.height;
            }
            else if ( this.player4.y < (this.player3.y + this.player3.height))
            {
                this.player4.y = this.player3.y + this.player3.height;
            }
           

            // Move ball in intended direction based on moveY and moveX values
            if (this.ball.moveY === DIRECTION.UP) this.ball.y -= (this.ball.speed / 1.5);
            else if (this.ball.moveY === DIRECTION.DOWN) this.ball.y += (this.ball.speed / 1.5);
            if (this.ball.moveX === DIRECTION.LEFT) this.ball.x -= this.ball.speed;
            else if (this.ball.moveX === DIRECTION.RIGHT) this.ball.x += this.ball.speed;
            
            // Handle Player1-Ball collisions
            if (this.ball.x - this.ball.width <= this.player1.x && this.ball.x >= this.player1.x - this.player1.width)
            {
                if (this.ball.y <= this.player1.y + this.player1.height && this.ball.y + this.ball.height >= this.player1.y) {
                    this.ball.x = (this.player1.x + this.ball.width);
                    this.ball.moveX = DIRECTION.RIGHT;
                    this.ball.speed += 0.5;
                }
            }
            if (this.ball.x - this.ball.width <= this.player2.x && this.ball.x >= this.player2.x - this.player2.width)
            {
                if (this.ball.y <= this.player2.y + this.player2.height && this.ball.y + this.ball.height >= this.player2.y) {
                    this.ball.x = (this.player1.x + this.ball.width);
                    this.ball.moveX = DIRECTION.RIGHT;
                    this.ball.speed += 0.5;
                }
            }
            
            // Handle player3-ball collision
            if (this.ball.x - this.ball.width <= this.player3.x && this.ball.x >= this.player3.x - this.player3.width)
            {
                if (this.ball.y <= this.player3.y + this.player3.height && this.ball.y + this.ball.height >= this.player3.y)
                {
                    this.ball.x = (this.player3.x - this.ball.width);
                    this.ball.moveX = DIRECTION.LEFT;
                    this.ball.speed += 0.5;
                }
            }
            // Handle player4-ball collision
            if (this.ball.x - this.ball.width <= this.player4.x && this.ball.x >= this.player4.x - this.player4.width)
            {
                if (this.ball.y <= this.player4.y + this.player4.height && this.ball.y + this.ball.height >= this.player4.y)
                {
                    this.ball.x = (this.player4.x - this.ball.width);
                    this.ball.moveX = DIRECTION.LEFT;
                    this.ball.speed += 0.5;
                }
            }
        }

        if (this.team1.score >= this.victoryScore) 
        {
            this.over = true;
            // Change function endGameMenu
            setTimeout(function () { Pong.endGameMenu(Pong.team1.name); }, 1000);
        } 
        else if (this.team2.score >= this.victoryScore) 
        {
            this.over = true;
            // Change function EndgGameMenu
            setTimeout(function () { Pong.endGameMenu(Pong.team2.name); }, 1000);
        }
    },

    draw: function () 
    {
        this.context.imageSmoothingEnabled = false;
        let canvasWidth = this.canvas.width;
        let canvasHeight = this.canvas.height

        // Clear the Canvas
        this.context.clearRect(
            0,
            0,
            canvasWidth,
            canvasHeight
        );
        
        // Set the fill style to black
        this.context.fillStyle = this.color;
        
        // Draw the background
        this.context.fillRect(
            0,
            0,
            canvasWidth,
            canvasHeight
        );
            
            // Set the fill style to white (For the paddles and the ball)
        this.context.fillStyle = this.player1.colorPaddle;
            
            // Draw the Player1
        this.context.fillRect(
            this.player1.x,
            this.player1.y,
            this.player1.width,
            this.player1.height
        );

        // Draw the player2
        this.context.fillStyle = this.player2.colorPaddle;
        this.context.fillRect(
            this.player2.x,
            this.player2.y,
            this.player2.width,
            this.player2.height 
        );
        
        // Draw the player3
        this.context.fillStyle = this.player3.colorPaddle;
        this.context.fillRect(
            this.player3.x,
            this.player3.y,
            this.player3.width,
            this.player3.height 
        );

        // Draw Player 4 
        this.context.fillStyle = this.player4.colorPaddle;
        this.context.fillRect(
            this.player4.x,
            this.player4.y,
            this.player4.width,
            this.player4.height 
        );

        // Draw the Ball
        if (Pong._turnDelayIsOver.call(this)) 
        {
            this.context.fillStyle = this.ball.color;
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
        this.context.moveTo((canvasWidth / 2), canvasHeight - 5);
        this.context.lineTo((canvasWidth / 2), 100);
        this.context.lineWidth = 10;
        this.context.strokeStyle = '#ffffff';
        this.context.stroke();
        
        // Set the default canvas font and align it to the center
        this.context.font = '60px Courier New';
        this.context.textAlign = 'center';
        
        this.context.fillStyle = "#ffffff";
        // Draw the players score (left)
        this.context.fillText(
            this.team1.score.toString(),
            (this.canvas.width / 4),
            this.canvas.height / 7
        );
            
            // Draw the paddles score (right)
        this.context.fillText(
            this.team2.score.toString(),
            (this.canvas.width / 2) + (this.canvas.width / 4),
            this.canvas.height / 7
        );
    
     // Change the font size for the center score text
        this.context.font = '30px Courier New';
    
    // Draw the winning score (center)
       this.context.fillText(
            'Victory Score : ' + this.victoryScore,
            (this.canvas.width / 2),
            35
        );
    },


    loop: function () {
        Pong.update();
        Pong.draw();
        // If the game is not over, draw the next frame.
        if (!Pong.over) requestAnimationFrame(Pong.loop);
    },

    listen: function () {
        // Store a reference to the Pong obkect to use inside event listener
        
        document.addEventListener('keydown', function (key)
        {
            // Handle the 'Press any key to begin' function and start the game.
            if (Pong.running === false) {
                Pong.running = true;
                Pong.over = false;
                window.requestAnimationFrame(Pong.loop);
            }
            
            
            /* This is deprecated but still work for some obscur reason. DON'T ASK ME  */
            
        if (key.keyCode === 87) Pong.player1.move = DIRECTION.UP;
        if (key.keyCode === 82) Pong.player2.move = DIRECTION.UP;
        if (key.keyCode === 85) Pong.player3.move = DIRECTION.UP;
        if (key.keyCode === 79) Pong.player4.move = DIRECTION.UP;
        
        if (key.keyCode === 83) Pong.player1.move = DIRECTION.DOWN;
        if (key.keyCode === 70 ) Pong.player2.move = DIRECTION.DOWN;
        if (key.keyCode === 74 ) Pong.player3.move = DIRECTION.DOWN;
        if (key.keyCode === 76 ) Pong.player4.move = DIRECTION.DOWN;
        });
        
        // Stop the player from moving when there are no keys being pressed.
        document.addEventListener('keyup', function (key) 
        { 
          //  console.log('key released: ', key.keyCode);
            if (key.keyCode === 87 || key.keyCode === 83)
                Pong.player1.move = DIRECTION.IDLE;
            else if (key.keyCode === 82 || key.keyCode === 70)
                Pong.player2.move = DIRECTION.IDLE;
            else if (key.keyCode === 85 || key.keyCode === 74)
                Pong.player3.move = DIRECTION.IDLE;
            else if (key.keyCode === 79 || key.keyCode === 76)
                Pong.player4.move = DIRECTION.IDLE;
        });
    },

    _resetTurn: function(winner, loser) {
        this.ball = Ball.new.call(this, this.ball.color);
        this.turn = loser;
        this.timer = (new Date()).getTime();
        winner.score++;
    },

    _turnDelayIsOver: function() {
        return ((new Date()).getTime() - this.timer >= 1000);
    },

    onGameOver: function () {
        return this.gameOverPromise;
    }
};

async function start2v2ClassicGame(goal)
{
    Pong = Object.assign({}, Game);
    Pong.initialize(goal);

    let winner = await Pong.onGameOver();

    quitGame('callback-2v2classic', winner);
}

export {start2v2ClassicGame};