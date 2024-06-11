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
        function getX(canvasWidth, side)
        {
            if (side === 'left')
                return ((canvasWidth * 5) / 100);
            else if (side === 'right')
                return ((canvasWidth * 95) / 100);
            else
                return ((canvasWidth * 50) / 100);
        }

        function getY(canvasHeight, side)
        {
            if (side === 'down')
                return ((canvasHeight * 95) / 100);
            else if (side === 'up')
                return ((canvasHeight * 5 ) / 100);
            else
                return (canvasHeight / 2);
        }

        function getWidth(canvasWidth, side)
        {
            if (side === 'left' || side === 'right')
                return ((canvasWidth * 1.5) / 100);
            else
                return ((canvasWidth * 20) / 100);
        }

        function getHeight(canvasHeight, side)
        {
            if (side === 'left' || side === 'right')
                return ((canvasHeight * 20) / 100);
            else
                return ((canvasHeight * 1.5) / 100);
        }

        const initialWidth = getWidth(this.canvas.width, side);
        const initialHeight = getHeight(this.canvas.height, side);

        return {
            name: playerName, // Need a way to get player nickname
            colorPaddle: paddleColor,
            initialWidth,
            initialHeight,
            width: initialWidth,
            height: initialHeight,
            x: getX(this.canvas.width, side),
            y: getY(this.canvas.height, side),
            move: DIRECTION.IDLE,
            speed: 8,
            score: 0,
            powerUp: 0,
            powerChoose: power.BIGPADDLE,
        };
    }
};

const powerUpMapping = {
    "BigPaddle": power.BIGPADDLE,
    "DoublePts": power.DOUBLEPTS,
    "FastPaddle": power.PADSPEED,
};

// Function to assign power-ups to players
function assignPowerUps(team, powerUpString) 
{
    if (powerUpMapping.hasOwnProperty(powerUpString)) 
        team.powerChoose = powerUpMapping[powerUpString];
    else
        team.powerChoose = power.NONE; // Default to no power-up
}


let Game = {
    initialize: function(goal){

        this.canvas = document.querySelector('canvas');
        this.context = this.canvas.getContext('2d');
        this.canvas.style.border = 'solid 0.3em';
        this.canvas.style.borderColor = '#f0f8ff';

        let heightScreen = window.innerHeight;
        let widthScreen = window.innerWidth;

        this.canvas.width = ((widthScreen * 90) / 100);
        this.canvas.height = ((heightScreen * 80) / 100);
        
        this.canvas.style.width = this.canvas.width + 'px';
        this.canvas.style.height = this.canvas.height + 'px';

        this.victoryScore = goal;
        let paddleColors = [];
        let powerUp = [];
        for (let i = 1; i <= 4; i++)
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
            ballColor = '#FFFFFF';
        else
            ballColor = ballColor.value;
        
        this.player1 = Player.new.call(this, paddleColors[0], 'Jean', 'left');
        this.player2 = Player.new.call(this, paddleColors[1], 'Sarkozy', 'up');
        this.player3 = Player.new.call(this, paddleColors[2], 'Balkany', 'right');
        this.player4 = Player.new.call(this, paddleColors[3], 'Macron', 'down');
        this.ball = Ball.new.call(this, ballColor);

        assignPowerUps(this.player1, powerUp[0]);
        assignPowerUps(this.player2, powerUp[1]);
        assignPowerUps(this.player3, powerUp[2]);
        assignPowerUps(this.player4, powerUp[3]);
        
        
        this.running = this.over = false;
        this.turn = this.player3;
        this.timer = 0;
        this.color = '#000000';

        let container = document.getElementById('container');
        while (container.hasChildNodes()){
            container.removeChild(container.lastChild);
        }
        
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

    UsePower: function (player)
    {
        if (player.powerUp >= 20)
        {
            if (player.powerChoose === power.BIGPADDLE)
            {
                if (player === Pong.player1 || player === Pong.player3)
                {
                    player.height += player.initialHeight / 4;
                }
                else
                {
                    player.width += player.initialWidth / 4;
                }
            }
            else if (player.powerChoose === power.DOUBLEPTS)
            {
                player.score += 1;
            }
            else if (player.powerChoose === power.PADSPEED)
            {
                player.speed += 2;
            }
            player.powerUp -= 20;
        }
    },

    endGameMenu: function (text) 
    {
        Pong.context.font = '25px Courier New';
        Pong.context.fillStyle = this.color;
 
        Pong.context.fillRect(
            Pong.canvas.width / 2 - 350,
            Pong.canvas.height / 2 - 48,
            700,
            100
        );
 
        Pong.context.fillStyle = '#ffffff';
 
        Pong.context.fillText(text,
            Pong.canvas.width / 2,
            Pong.canvas.height / 2 + 15
        );
 
        setTimeout(function () {
            return;
        }, 3000);
    },

    update: function () 
    {
        if (!this.over)
        {
            // If the ball collides with the bound limits - correct the x and y coords.
            if (this.ball.x <= 0) Pong._resetTurn.call(this, this.player1);
            if (this.ball.x >= this.canvas.width - this.ball.width) Pong._resetTurn.call(this, this.player3);
            if (this.ball.y <= 0) Pong._resetTurn.call(this, this.player2);
            if (this.ball.y >= this.canvas.height - this.ball.height) Pong._resetTurn.call(this, this.player4);
            
            // Move player if they player.move value was updated by a keyboard event
            if (this.player1.move === DIRECTION.UP) this.player1.y -= this.player1.speed;
            else if (this.player1.move === DIRECTION.DOWN) this.player1.y += this.player1.speed;
            // MOve second player
            if (this.player2.move === DIRECTION.LEFT) this.player2.x -= this.player2.speed;
            else if (this.player2.move === DIRECTION.RIGHT) this.player2.x += this.player2.speed;
            // Move third player
            if (this.player3.move === DIRECTION.UP) this.player3.y -= this.player3.speed;
            else if (this.player3.move === DIRECTION.DOWN) this.player3.y += this.player3.speed;
            //Move fourth player
            if (this.player4.move === DIRECTION.LEFT) this.player4.x -= this.player4.speed;
            else if (this.player4.move === DIRECTION.RIGHT) this.player4.x += this.player4.speed;
            
            
            // On new serve (start of each turn) move the ball to the correct side
            // and randomize the direction to add some challenge.
            if (Pong._turnDelayIsOver.call(this) && this.turn) 
            {
                if (this.turn === this.player1 || this.turn === this.player3)
                {
                    this.ball.moveX = this.turn === this.player1 ? DIRECTION.LEFT : DIRECTION.RIGHT;
                    this.ball.moveY = [DIRECTION.UP, DIRECTION.DOWN][Math.round(Math.random())];
                  //  this.ball.y = Math.floor(Math.random() * this.canvas.height - 200) + 200;
                    this.turn = null;
                }
                else if (this.turn === this.player2 || this.turn === this.player4)
                {
                    this.ball.moveY = this.turn === this.player2 ? DIRECTION.UP : DIRECTION.DOWN;
                    this.ball.moveX = [DIRECTION.RIGHT, DIRECTION.LEFT][Math.round(Math.random())]
                    //this.ball.x = Math.floor(Math.random() * this.canvas.width - 400) + 400;
                    this.turn = null;
                }
            }
            
            // If the player collides with the bound limits, update the x and y coords.
            if (this.player1.y <= 0) this.player1.y = 0;
            else if (this.player1.y >= (this.canvas.height - this.player1.height )) this.player1.y = (this.canvas.height - this.player1.height );

            if (this.player2.x <= 0) this.player2.x = 0;
            else if (this.player2.x >= (this.canvas.width - this.player2.width)) this.player2.x = (this.canvas.width - this.player2.width);
            
            if (this.player3.y <= 0) this.player3.y = 0;
            else if (this.player3.y >= (this.canvas.height - this.player3.height)) this.player3.y = (this.canvas.height - this.player3.height);
            
            if (this.player4.x <= 0) this.player4.x = 0;
            else if (this.player4.x >= (this.canvas.width - this.player4.width)) this.player4.x = (this.canvas.width - this.player4.width);
            

          //  console.log('P1 color : ', this.player1.colorPaddle);
          //  console.log('P2 color : ', this.player2.colorPaddle);
          //  console.log('P1 y : ',this.player1.y, 'P1 y+height :', this.player1.y + this.player1.height ,' P2 y : ', this.player2.y);

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
                    this.player1.powerUp += 1;
                }
            }
            if (this.ball.y - this.ball.height <= this.player2.y && this.ball.y >= this.player2.y - this.player2.height)
            {
                if (this.ball.x <= this.player2.x + this.player2.width && this.ball.x + this.ball.width >= this.player2.x)
                {
                    this.ball.y = this.player2.y + this.ball.height;
                    this.ball.moveY = DIRECTION.DOWN;
                    this.ball.speed += 0.5;
                    this.player2.powerUp += 1;
                }
            }
            if (this.ball.x - this.ball.width <= this.player3.x && this.ball.x >= this.player3.x - this.player3.width)
            {
                if (this.ball.y <= this.player3.y + this.player3.height && this.ball.y + this.ball.height >= this.player3.y) {
                    this.ball.x = (this.player3.x - this.ball.width);
                    this.ball.moveX = DIRECTION.LEFT;
                    this.ball.speed += 0.5;
                    this.player3.powerUp += 1;
                }
            }
            if (this.ball.y - this.ball.height <= this.player4.y && this.ball.y >= this.player4.y - this.player4.height)
            {
                if (this.ball.x <= this.player4.x + this.player4.width && this.ball.x + this.ball.width >= this.player4.x)
                {
                    this.ball.y = this.player4.y - this.ball.height;
                    this.ball.moveY = DIRECTION.UP
                    this.ball.speed += 0.5;
                    this.player4.powerUp += 1;
                }
            }
            

        if (this.player1.score === this.victoryScore) 
        {
            this.over = true;
            // Change function endGameMenu
            setTimeout(function () { Pong.endGameMenu(Pong.player1.name + ' is a LOSER'); }, 1000);
        } 
        else if (this.player2.score === this.victoryScore) 
        {
            this.over = true;
            // Change function EndgGameMenu
            setTimeout(function () { Pong.endGameMenu(Pong.player2.name + ' is a LOSER'); }, 1000);
        }
        else if (this.player3.score === this.victoryScore)
        {
            this.over = true;
            setTimeout(function () { Pong.endGameMenu(Pong.player3.name + ' is a LOSER');}, 1000);
        }
        else if (this.player4.score === this.victoryScore)
        {
            this.over = true;
            setTimeout(function () { Pong.endGameMenu(Pong.player4.name + ' is a LOSER');}, 1000);
        }
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
        this.context.font = '20px Courier New';
        this.context.textAlign = 'center';
        
        this.context.fillStyle = "#ffffff";
        // Draw the players score (left)
        this.context.fillText(
            this.player1.name + ' :' + this.player1.score.toString() + '\n' + this.player2.name + ' :' + this.player2.score.toString(),
            (canvasWidth / 4),
            canvasHeight / 7
        );

        this.context.fillText(
            this.player3.name + ' :' + this.player3.score.toString() + '\n' + this.player4.name +  ' :' + this.player4.score.toString(),
            (canvasWidth / 2) + (canvasWidth / 4),
            canvasHeight / 7
        );
    
     // Change the font size for the center score text
        this.context.font = '30px Courier New';
    
    // Draw the winning score (center)
       this.context.fillText(
            'Ending Score : ' + this.victoryScore,
            (canvasWidth / 2),
            (canvasHeight / 2)
        );

        this.context.font = '15px Courier New';
        this.context.fillText(
            this.player1.name + ' powerUp :' + this.player1.powerUp.toString() + '/20',
            ((canvasWidth * 12)/ 100),
            (canvasHeight * 87) /100
            );

        this.context.fillText(
            this.player2.name + ' powerUp :' + this.player2.powerUp.toString() + '/20',
            ((canvasWidth * 12) / 100),
            (canvasHeight * 93) /100
        );
            
        this.context.fillText(
            this.player3.name + ' powerUp : ' + this.player3.powerUp.toString() + '/20',
            (canvasWidth) - (canvasWidth / 8),
            (canvasHeight * 87) / 100
        );
        this.context.fillText(
            this.player4.name + ' powerUp : ' + this.player4.powerUp.toString() + ' /20',
            (canvasWidth) - (canvasWidth / 8),
            (canvasHeight * 93) / 100
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
            
            // Handle [w r o j] key event
            if (key.keyCode === 87) Pong.player1.move = DIRECTION.UP;
            if (key.keyCode === 82) Pong.player2.move = DIRECTION.LEFT;
            if (key.keyCode === 85) Pong.player3.move = DIRECTION.UP;
            if (key.keyCode === 79) Pong.player4.move = DIRECTION.LEFT;
            
            // Handle[s f l n] key events
            if (key.keyCode === 83) Pong.player1.move = DIRECTION.DOWN;
            if (key.keyCode === 70 ) Pong.player2.move = DIRECTION.RIGHT;
            if (key.keyCode === 74 ) Pong.player3.move = DIRECTION.DOWN;
            if (key.keyCode === 76 ) Pong.player4.move = DIRECTION.RIGHT;

            // Handle team PowerUp use 
            // MISS 2 key for power Up

            // 90:z 67:c 77:m 190:.
            if (key.keyCode === 90) Pong.UsePower(Pong.player1);
            else if (key.keyCode === 67) Pong.UsePower(Pong.player2);
            else if (key.keyCode === 77) Pong.UsePower(Pong.player3);
            else if (key.keyCode === 190) Pong.UsePower(Pong.player4);

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

    _resetTurn: function(loser) {
        this.ball = Ball.new.call(this, this.ball.color);
        this.turn = loser;
        this.timer = (new Date()).getTime();
        loser.powerUp += 3;
        loser.score++;
    },

    _turnDelayIsOver: function() {
        return ((new Date()).getTime() - this.timer >= 1000);
    },
};

function start4PlayerCustom(goal)
{
    Pong = Object.assign({}, Game);
    Pong.initialize(goal);
}

export {start4PlayerCustom};