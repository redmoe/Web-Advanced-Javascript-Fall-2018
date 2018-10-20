//https://gist.github.com/straker/ff00b4b49669ad3dec890306d348adc4
// var player[0];
// var player[1];

var player = [];
var score1 = 0;
var score2 = 0;
var lcdWidth = 16;
var lcdHeight = 12;
var grid = 32;
var lcdBorderWidth = 8;
var lcdBorderHeight = 2;
var ball;
var snakePong = true;
var colliders = [];
function Ball() {
	this.x = width / 2;
	this.y = height / 2;
	this.speed = 3;
	this.angle = 0;
	this.diam = grid;
	colliders.push(this);

	this.Reset = function() {
		this.x = width / 2;
		this.y = height / 2;
		this.speed = 3;
	}
	this.Move = function() {
		if (this.x < width/2-lcdWidth/2-this.diam) {
			score2++;
			this.angle = 0;
			this.Reset();
		} else if (this.x > lcdWidth/2+width/2+this.diam) {
			score1++;
			this.angle = PI;
			this.Reset();
		}
		if (this.y-this.diam/2 < (height-lcdHeight)/2 || this.y+this.diam/2 > height-(height-lcdHeight)/2 ) {
			this.angle = -this.angle;
		}
		this.x += cos(this.angle) * this.speed;
		this.y += sin(this.angle) * this.speed;
		color(255);
		ellipse(this.x, this.y, this.diam, this.diam);
	}
}



function Paddle(tempX, angTemp,snakeDir,index) {
	this.index = index;
	this.control = {x:0,y:0};
	this.snakeControl = {x:snakeDir,y:0};
	this.hei = grid*6;
	this.wid = grid;
	this.x = tempX;
	this.y = height / 2 - this.hei / 2;
	this.speed = grid/8;
	this.angleOffset = angTemp;
	this.cells = [];
	this.color = 255;
	this.lastControl = {x:snakeDir,y:0};
	colliders.push(this.cells);
	this.Move = function() {
		if (snakePong == false) {
			if (this.control.x != 0 || this.control.y !=0) {
				if ((this.y > grid*2 && this.control.y != 1) || (this.y < height -(this.hei +grid*2) && this.control.y != -1)) {
					this.y += this.control.y*this.speed;
				}
				//this.x += this.control.x*this.speed;
			}
			if ((ball.y > this.y && ball.y < this.y + this.hei) && (ball.x + (ball.diam / 2) > this.x && ball.x - (ball.diam / 2) < this.x + this.wid)) {
				ball.speed = 0.4 + ball.speed;
				var relativeIntersectY = ((this.y + (this.hei / 2)) - ball.y);
				var normalizedRelativeIntersectionY = (relativeIntersectY / (this.hei / 2));
				ball.angle = (normalizedRelativeIntersectionY + this.angleOffset);
			}
		}
	}
	this.GridMove = function () {
		if (snakePong == true) {
			this.x += this.snakeControl.x*grid;
			this.y += this.snakeControl.y*grid;

			if (this.y < grid*2) {
			   	this.y = height-(grid*3);
			}
			else if (this.y+grid > height-grid*2) {
			    this.y = grid*2;
  			}
  			else if (this.x < grid*8) {
			   	this.x = width-(grid*9);
			}
			else if (this.x+grid > width-grid*8) {
			    this.x = grid * 8;
  			}  
  			//console.log(this.control);		
			this.lastControl = this.snakeControl;
			//console.log(colliders);

			if (CheckCollision(player[0].cells,this) || CheckCollision(player[1].cells,this)) {
				// console.log(this.hei);
				// this.hei-=grid;
				// console.log(this.hei);
				this.color = 126;
				if (this == player[0])
				score1++;
				else 
				score2++;
			}
			this.cells.unshift({x: this.x, y: this.y});
			while (this.cells.length > this.hei/grid) {
			    this.cells.pop();
			}   			 
		}
	}
	// this.Morph = function () {
	// 	if (snakePong) {

	// 	}
	// 	else {
	// 		this.y =- this.hei / 2;	
	// 	}
	// }
	this.Draw = function () {
		fill(this.color);
		this.color++;
		if (snakePong) {
			this.cells.forEach(function(cell) {
			   	rect(cell.x, cell.y, grid-1, grid-1);  
			});		
		}
		else {
			rect(this.x, this.y, this.wid, this.hei,grid);
		}
	//	console.log("LLOGG");
		fill(0);
		textSize(grid);
		text(this.index, this.x+this.wid/2, this.y+this.wid/2);

	}
}


function CheckCollision (cells, thi) {

	for (var i = 0; i < cells.length; i++) {
	      if (thi.x === cells[i].x && thi.y === cells[i].y) {
	      	return true;
	      }
	}
	return false;
}
var spr;


function setup() {
	grid = (window.innerWidth || document.body.clientWidth)/32;
	createCanvas(32*grid, 16*grid);
	lcdWidth *= grid;
	lcdBorderHeight *= grid;
	lcdHeight *= grid;
	player[1] = new Paddle(grid*8, 0,1,0);
	player[0] = new Paddle(width - grid*9, PI,-1,1);
	ball = new Ball();
	background(255,0,0);
	textAlign(CENTER, CENTER);
	textSize(grid);
	setInterval(GridTime,300);

  	spr = createSprite(
    width/2, height/2, 40, 40);
  	spr.shapeColor = color(255);
	spr.velocity.y = 0.5;	
}

function windowResized() {
	grid = (window.innerWidth || document.body.clientWidth)/32;
	//player[0].
 	resizeCanvas(32*grid, 16*grid);
 	lcdWidth *= grid;
	lcdBorderHeight *= grid;
	lcdHeight *= grid;
}
function GridTime () {
	player[0].GridMove();
	player[1].GridMove();
}


//control stores last direction
//snake stores next direction
document.addEventListener('keydown', function(e) {
	console.log("PRESS");
	if (keyCode == UP_ARROW && player[0].lastControl.y != 1) {
		player[0].snakeControl.y = -1;
		player[0].snakeControl.x = 0;		
	}
	else if (keyCode == DOWN_ARROW && player[0].lastControl.y != -1) {
		player[0].snakeControl.y = 1;
		player[0].snakeControl.x = 0;
	}
	else if (keyCode == LEFT_ARROW && player[0].lastControl.x != 1) {
		player[0].snakeControl.x = -1;
		player[0].snakeControl.y = 0;
	}
	else if (keyCode == RIGHT_ARROW && player[0].lastControl.x != -1) {
		player[0].snakeControl.x = 1;
		player[0].snakeControl.y = 0;
	}	

	if ((key == 'W' || key == 'w')&& player[1].lastControl.y != 1) {
		player[1].snakeControl.y = -1;
		player[1].snakeControl.x = 0;	
	}
	else if ((key == 'S' || key == 's')&& player[1].lastControl.y != -1) {
		player[1].snakeControl.y = 1;
		player[1].snakeControl.x = 0;	
	}
	else if ((key == 'A' || key == 'a')&& player[1].lastControl.x != 1) {
		player[1].snakeControl.x = -1;
		player[1].snakeControl.y = 0;
	}
	else if ((key == 'D' || key == 'd')&& player[1].lastControl.x != -1) {
		player[1].snakeControl.x = 1;
		player[1].snakeControl.y = 0;
	}	
});
function keyPressed() {
	if (key=='R' || key == 'r') {
			snakePong= !snakePong;
	}
	if (keyCode == UP_ARROW) {
		player[0].control.y -= 1;
	}
	if (keyCode == DOWN_ARROW) {
		player[0].control.y += 1;
	}
	if (keyCode == LEFT_ARROW) {
		player[0].control.x -= 1;
	}
	if (keyCode == RIGHT_ARROW) {
		player[0].control.x += 1;
	}	
	if (key == 'W' || key == 'w') {
		player[1].control.y -= 1;
	}
	if (key == 'S' || key == 's') {
		player[1].control.y += 1;
	}
	if (key == 'A' || key == 'a') {
		player[1].control.x -= 1;
	}
	if (key == 'D' || key == 'd') {
		player[1].control.x += 1;
	}	
}

function keyReleased() {
	if (keyCode == UP_ARROW) {
		player[0].control.y += 1;
	}
	if (keyCode == DOWN_ARROW) {
		player[0].control.y -= 1;
	}
	if (keyCode == LEFT_ARROW) {
		player[0].control.x += 1;
	}
	if (keyCode == RIGHT_ARROW) {
		player[0].control.x -= 1;
	}	
	if (key == 'W' || key == 'w') {
		player[1].control.y += 1;
	}
	if (key == 'S' || key == 's') {
		player[1].control.y -= 1;
	}
	if (key == 'A' || key == 'a') {
		player[1].control.x += 1;
	}
	if (key == 'D' || key == 'd') {
		player[1].control.x -= 1;
	}	
}

function draw() {
	noStroke();
	rectMode(CENTER);
	fill(255);
	rect(width/2,height/2, grid*23,grid*14,grid);
	fill(0);
	rect(width/2,height/2, lcdWidth,lcdHeight,grid/2);
	rectMode(CORNER);
	fill(255);
	if (score1 > 9) {
		textSize(grid*2);
		text("PLAYER 1 WINS!", width / 2, height / 2);	
	}
	else if (score2 > 9) {
		textSize(grid*2);
		text("PLAYER 2 WINS!", width / 2, height / 2);	
	}
	else {
		player[0].Move();
		player[1].Move();
		//ball.Move();
		player[0].Draw()
		player[1].Draw();
	}
	rectMode(CENTER);
	fill(0);
	rect(grid*6.25, grid*12.5,grid*3,grid,grid);
	rect(grid*6.25, grid*12.5,grid,grid*3,grid);
	rect(grid*25.75, grid*12.5,grid*3,grid,grid);
	rect(grid*25.75, grid*12.5,grid,grid*3,grid);
	textSize(grid );
	rect(width/2,grid/2,width,grid);
	fill(255);
	text(score1, (width / 4), grid / 2);
	text(score2, width / 2 + (width / 4), grid / 2);
	text("COMBOY", width / 2, grid / 2);
 	drawSprites();
}