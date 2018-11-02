//https://gist.github.com/straker/ff00b4b49669ad3dec890306d348adc4
// var player[0];
// var player[1];

var player = [];
var score1 = 0;
var score2 = 0;
// var lcdWidth = 16;
// var lcdHeight = 12;
// var lcdBorderWidth = 8;
// var lcdBorderHeight = 2;


var grid = 32;
var gridSize = {x:32,y:18};
var border = {x:4,y:2};




var ball;
var snakePong = false;


//var colliders = [];
var spriteGroup;
function Ball() {
	this.speed = grid/8;
	this.angle = PI;
	this.diam = grid;
	//colliders.push(this);
	this.sprite = createSprite (width/2,height/2,grid,grid);
		this.sprite.setSpeed (this.speed,0);

	this.sprite.draw = function() {  ellipse(0,0,grid,grid) } 
	this.Reset = function() {
		this.sprite.position.x = width / 2;
		this.sprite.position.y = height / 2;
		this.speed = grid/8;
	}
	this.Move = function() {
		if (this.sprite.position.x+this.diam < border.x) {
			score2++;
			//this.angle = 0;
			this.sprite.setSpeed (this.speed,0);

			this.Reset();
		} else if (this.sprite.position.x-this.diam > width-border.x) {
			score1++;
			//this.angle = 180;
			this.sprite.setSpeed (this.speed,180);
			//console.log("HEELLLO");
			this.Reset();
		}
		if (this.sprite.position.y-this.diam/2 < border.y || this.sprite.position.y+this.diam/2 > height-border.y) {
			//	this.sprite.setSpeed(this.speed,-atan2(this.sprite.velocity.x, this.sprite.velocity.y));
					//console.log(atan2(this.sprite.velocity.x, this.sprite.velocity.y));
					//this.angle = -this.angle;
							this.sprite.setVelocity(this.sprite.velocity.x, -this.sprite.velocity.y);

			//this.sprite.setSpeed (this.speed,Mathf.Atan2(this.sprite.velocity.x, this.sprite.velocity.y));

		}
	//	console.log(this.sprite.position.x);
		//this.sprite.bounce(spriteGroup,Collide);
//		this.sprite.velocity.y += sin(this.angle) * this.speed;cos(this.angle) *
		//color(255);
		//ellipse(this.sprite.position.x, this.sprite.position.y, this.diam, this.diam);
		drawSprite(this.sprite);
	}

}

function Collide (thi) {
		//console.log(thi);

		// var relativeIntersectY = ((thi.sprite.position.y + (thi.sprite.height / 2)) - ball.sprite.y);
		// 		var normalizedRelativeIntersectionY = (relativeIntersectY / (thi.sprite.height / 2));
		// 		ball.sprite.setSpeed(0.4 + ball.speed,normalizedRelativeIntersectionY + thi.angleOffset);
}
function mouseDown (LEFT) {
}


function Paddle(tempX, angTemp,snakeDir,index) {
	this.index = index;
	this.control = {x:0,y:0};
	this.snakeControl = {x:snakeDir,y:0};
	this.speed = grid/8;
	this.angleOffset = angTemp;
	this.cells = new Group();
	this.color = 255;
	this.lastControl = {x:snakeDir,y:0};
	this.sprite = createSprite (tempX, height / 2,grid-grid/4,grid*4);
	this.sprite.shapeColor = "red";
	//colliders.push(this.cells);
	this.dir = snakeDir;
	this.sprite.addToGroup ( spriteGroup );
	this.form = "Space";
	this.snakeLength =4;
	this.Move = function() {
		if (this.form == "Pong") {
			if (this.control.x != 0 || this.control.y !=0) {
				if ((this.sprite.position.y-this.sprite.height/2 > border.y && this.control.y != 1) || (this.sprite.position.y < height -(this.sprite.height/2 +border.y) && this.control.y != -1)) {
					this.sprite.position.y += this.control.y*this.speed;
				}
			}
			if (this.sprite.overlap(ball.sprite)) {
				//console.log(((ball.sprite.position.y*this.dir-this.sprite.position.y*this.dir)/(this.sprite.height/2)*60)+this.angleOffset);
				var normalizedRelativeIntersectionY = ((ball.sprite.position.y*this.dir-this.sprite.position.y*this.dir)/(this.sprite.height/2)*60)+this.angleOffset;
				ball.sprite.setSpeed(0.4 + ball.speed,normalizedRelativeIntersectionY);
			}
		}
		else if (this.form == "Snake") {
			//this.cells.bounce(ball.sprite);
			if (!this.getOut) {
				if (this.sprite.overlap(ball.sprite)) {
					ball.Reset();
					this.snakeLength++;
				}
				else {
					for (var c = 0; c < this.cells.length; c++) {
						if (this.cells[c].overlap(ball.sprite)) {

						var dx = Math.abs(ball.sprite.position.x-this.cells[c].position.x);
						var dy = Math.abs(ball.sprite.position.y-this.cells[c].position.y);

				        if(dx > dy){
							ball.sprite.setVelocity(ball.sprite.velocity.x, -ball.sprite.velocity.y);
				        }
				        else{
							ball.sprite.setVelocity(-ball.sprite.velocity.x, ball.sprite.velocity.y);
				        }
					}
				}
		
			       getOut = true;

				}
			 }
			 	else if (!this.cells[c].overlap(ball.sprite)) {
				this.getOut = false;
			}
		}
		else if (this.form=="Space") {
			this.sprite.bounce(ball.sprite)
					//if (this.sprite.bounce(ball.sprite)) {
			if (this.control.y != 0) {
				//console.log("MOVE");

				this.sprite.addSpeed(-this.control.y*this.speed/16,this.sprite.rotation);
							//	console.log(this.sprite.position);
											this.sprite.limitSpeed (this.speed);


			}
			else {
					this.sprite.friction = 0.05;
				//console.log(this.sprite.maxSpeed)

			}
			if (this.control.x != 0) {
				this.sprite.rotation += this.control.x*this.speed/2;

			}

			var halfY = border.y-grid/2;
			var halfX = border.x-grid/2;

			if (this.sprite.position.y < halfY) {
			   	this.sprite.position.y = height-halfY;
			}
			else if (this.sprite.position.y > height-halfY) {
			    this.sprite.position.y = halfY;
  			}
  			else if (this.sprite.position.x < halfX) {
			   	this.sprite.position.x = width-(halfX);
			}
			else if (this.sprite.position.x > width-halfX) {
			    this.sprite.position.x = halfX;
  			} 
		}
	}
	this.getOut = false;
	this.GridMove = function () {
		if (this.form == "Snake") {
			var newSprite = createSprite(this.sprite.position.x,this.sprite.position.y,grid,grid);
			newSprite.immovable = true;
			this.cells.add(newSprite);

			// if (this.cells.overlap(this.sprite)) {
			// 	console.log("TRUEE");
			// 	this.color = 126;
			// 	if (this == player[0])
			// 	score1++;
			// 	else 
			// 	score2++;
			// }
			//newSprite.shapeColor =255;

			//console.log(newSprite);

			while (this.cells.length > this.snakeLength) {
				//console.log(0);
				//this.cells[this.cells.length-1].remove();
			    this.cells[0].remove();
			  //  console.log(this.cells[0].position.x/grid)
			   // 				console.log(this.cells.length);

			  //  console.log(this.cells[this.cells.length-1]);
			    //this.cells.remove(this.cells.length-1);
			}   	
			this.sprite.position.x += this.snakeControl.x*grid;
			this.sprite.position.y += this.snakeControl.y*grid;

			var addY = border.y-grid/2;
			var addX = border.x-grid/2;			
			if (this.sprite.position.y < addY) {
			   	this.sprite.position.y = height-addY;
			}
			else if (this.sprite.position.y > height-addY) {
			    this.sprite.position.y = addY;
  			}
  			else if (this.sprite.position.x < addX) {
			   	this.sprite.position.x = width-addX;
			}
			else if (this.sprite.position.x > width-addX) {
			    this.sprite.position.x = addX;
  			}  
			this.lastControl = this.snakeControl;
					for (var c = 0; c < this.cells.length-1; c++) {
							if (this.cells[c].overlap(this.sprite)) {
								console.log("WWW");
							}
					}					 
		}
	}
	this.Morph = function (newForm) {
		this.form = newForm;
		if (this.form == "Snake") {
			this.sprite.height = grid;
			this.sprite.width = grid;

			this.sprite.position.x = floor(this.sprite.position.x/grid)*grid+grid/2;
			this.sprite.position.y = floor(this.sprite.position.y/grid)*grid+grid/2;

		}
		else if (this.form == "Space") {
			// 			this.sprite.height = grid*2;
			// this.sprite.draw = function() {   triangle(-grid, 0, grid, -grid, grid, grid); } 
			this.sprite.mass = 2;
			this.sprite.rotation = this.angleOffset;
			this.sprite.height = grid;
			this.sprite.draw = function() { fill(255);  triangle(grid/2, 0, -grid/2, -grid/2, -grid/2, grid/2); } 
		}
		else {
			this.sprite.height = grid*4;
		}
	}
	this.lerpVar = 0;
	this.changeDirection = 1
	this.Draw = function () {
		if (this.form=="Snake") {
			drawSprites(this.cells);
		}
		else if (this.form=="Paddle") {
			this.sprite.height = (this.lerpVar*grid*4)-grid*4;
			//this.sprite.height = lerp(0,grid*4,Math.cos(this.lerpVar));
			this.lerpVar+=0.01*this.changeDirection;

		//	console.log(this.changeDirection);
			//console.log(this.sprite.height);
		//	var easing = 0.05;

		  //  var dy = (this.sprite.height - y)* easing;

			  
	  		// this.sprite.height = dy;
			if (this.lerpVar > 1 ) {
				this.changeDirection = -1;
			}
			else if (this.lerpVar < 0) {
				this.changeDirection = 1;

			}
		}
		drawSprite(this.sprite);
		fill(0);
		textSize(grid);
		//text(this.index, this.sprite.position.x, this.sprite.position.y);

		//this.sprite.height = Math.cos(this.lerpVar)*grid*4;
	
	}
}



function setup() {
		spriteGroup = new Group();

	grid = (window.innerWidth || document.body.clientWidth)/gridSize.x;
	createCanvas(grid*gridSize.x, grid*gridSize.y);
	//lcdWidth *= grid;
	//lcdBorderHeight *= grid;
	//lcdHeight *= grid;
	border.x *= grid;
	border.y *= grid;
	ball = new Ball();
	player[0] = new Paddle(width-border.x-grid/2, 180,-1,1);
	player[0].Morph(player[0].form);

	player[1] = new Paddle(border.x+grid/2, 0,1,0);
	player[1].Morph(player[1].form);

	//background(255,0,0);
	textAlign(CENTER, CENTER);
	textSize(grid);
	setInterval(GridTime,200);
  	spr = createSprite(
    width/2, height/2, 40, 40);
  	spr.shapeColor = color(255);
	spr.velocity.y = 0.5;	
}

function windowResized() {
	return;
	grid = (window.innerWidth || document.body.clientWidth)/32;
	//player[0].
 	resizeCanvas(32*grid, 16*grid);
 	//lcdWidth *= grid;
	//lcdBorderHeight *= grid;
	//lcdHeight *= grid;
}
function GridTime () {
	player[0].GridMove();
	player[1].GridMove();
}


//control stores last direction
//snake stores next direction
document.addEventListener('keydown', function(e) {
	//console.log("PRESS");
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
			player[0].Morph("Snake");
		//	player[1].Morph("Snake");
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
	//console.log(millis());
	noStroke();
	rectMode(CENTER);
	fill(255);
	rect(width/2,height/2, width,height,grid);
	fill(0);
	rect(width/2,height/2, width-border.x*2,height-border.y*2,grid/2);
	rectMode(CORNER);
	fill(255);
	 	//drawSprites();

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
		ball.Move();
		player[0].Draw()
		player[1].Draw();
	}
	rectMode(CENTER);
	fill(0);
	rect(border.x/2, height-border.y*2,border.x*.75,grid,grid);
	rect(border.x/2, height-border.y*2,grid,border.x*.75,grid);
	rect(width-border.x/2, height-border.y*2,border.x*.75,grid,grid);
	rect(width-border.x/2, height-border.y*2,grid,border.x*.75,grid);
	textSize(grid );
	rect(width/2,grid,width/1.75,grid,grid/2);
	fill(255);
	text(score1, (width / 4), grid );
	text(score2, width / 2 + (width / 4), grid);
	text("COMBOY", width / 2, grid);
}


				// if (this.snakeControl.x != 0) {
				// 	this.sprite.width+=grid/8;
				// 	this.sprite.position.x = Math.floor(this.sprite.position.x/grid)*grid+this.sprite.width/2;
				// 		console.log(this.sprite.position.x);
				// 		console.log(this.sprite.width);

				// 	//0  1
				// 	//.5- .25 -.25

				// 	if (this.sprite.width>=grid) {
				// 		this.GridMove();
				// 		this.sprite.width = 0;
				// 		this.sprite.height = grid;
				// 		this.sprite.position.x = this.sprite.position.x -grid/2;
				// 	}
				// }
				// else {
				// 	this.sprite.height+=grid/8*this.snakeControl.y;
				// 	this.sprite.position.y = Math.floor(this.sprite.position.y/grid)*grid+this.sprite.height/2;

				// 	if (this.sprite.height>=grid) {
				// 		this.GridMove();
				// 		this.sprite.height = 0;
				// 		this.sprite.width = grid;
				// 		this.sprite.position.y = this.sprite.position.y -grid/2*this.snakeControl.y;
				// 	}
				// }

				// else {
				// 	this.sprite.height+=grid/8;

				// 	if (this.sprite.height>=grid) {
				// 		this.GridMove();
				// 		this.sprite.height = 0;
				// 			this.sprite.width = grid;
					
				// 	}
				// }
					//if (this.sprite.width>=grid && this.sprite.height>=grid) {
					// 	if (this.snakeControl.x != 0) {
					// 		this.sprite.width = 0;
					// 		this.sprite.height = grid;

					// 	}
					// 	else {
					// 		this.sprite.width = grid;
					// 		this.sprite.height = 0;
					// 	}
				 // 		this.sprite.position = {x:Math.floor(this.sprite.position.x/grid)*grid+grid/2,y:Math.floor(this.sprite.position.y/grid)*grid+grid/2};
					// 	this.GridMove();
					// 	this.storedPos = this.sprite.position;
					// }

					if (this.lastControl.x == 1) {		
						this.sprite.width+=grid/8;
						this.sprite.position.x = this.storedPos.x + this.sprite.width/2-grid/2;
					}
					else if (this.lastControl.x == -1) {
						this.sprite.width-=grid/8;
						this.sprite.position.x = this.storedPos.x + this.sprite.width/2+grid/2;						
					}

					else if (this.lastControl.y == 1) {		
						this.sprite.height+=grid/8;
						this.sprite.position.y = this.storedPos.y + this.sprite.height/2-grid/2;
					}
					else if (this.lastControl.y == -1) {
						this.sprite.height-=grid/8;
						this.sprite.position.y = this.storedPos.y + this.sprite.height/2+grid/2;						
					}
					//lerp(this.sprite.)
					rect(this.sprite.position.x,this.sprite.position.x,grid,grid)
				// if (this.sprite.width>=grid && this.sprite.height>=grid) {
				// 		this.GridMove();
				// 		if (this.snakeControl.x != 1) {
				// 			this.sprite.width = 0;
				// 			this.sprite.height = grid;
				// 		}
				// 		else {
				// 			this.sprite.height = 0;
				// 			this.sprite.width = grid;
				// 		}

				// 		//this.sprite.position.x = this.sprite.position.x -grid/2;
				// 		this.sprite.position = {x:Math.round(this.sprite.position.x/grid)*grid,y:Math.round(this.sprite.position.y/grid)*grid};
				// 		this.storedPos = this.sprite.position;
				// 	}



				// 	if (this.snakeControl.x == 1) {
				// 		console.log(this.sprite.rotation)
				// 		this.sprite.height+=grid/8;

				// 		this.sprite.position.x = this.storedPos.x-(this.sprite.width/2)+(grid/4);
				// 	}
					//x = 100
					//pos = 0 wid = 0
					//pos = 25 wid = 50
					//pos = 50 wid = 100
				//	this.sprite.position.x = Math.floor(this.sprite.position.x/grid)*grid-this.sprite.width/2;
					//	console.log(this.sprite.position.x);
					//	console.log(this.sprite.width);

					//0  1
					//.5- .25 -.25




				//console.log(this.sprite.height);
				//if (this.snakeControl)

				//if (!this.getOut) {
					// if (this.sprite.overlap(ball.sprite)) {
					// 	ball.Reset();
					// 	this.snakeLength++;
					// }
				//	else {
					//	for (var c = 0; c < this.cells.length; c++) {
						this.sprite.bounce(ball.sprite);
							this.cells.bounce(ball.sprite);

							// if (this.cells[c].overlap(ball.sprite)) {
							// 	var dx = Math.abs(ball.sprite.position.x-this.cells[c].position.x);
							// 	var dy = Math.abs(ball.sprite.position.y-this.cells[c].position.y);

							// 	if(dx > dy){
							// 		ball.sprite.setVelocity(ball.sprite.velocity.x, -ball.sprite.velocity.y);
							// 	}
							// 	else{
							// 		ball.sprite.setVelocity(-ball.sprite.velocity.x, ball.sprite.velocity.y);
							// 	}
							// 	return;
							// }
						//}
						//getOut = true;
				// 	}
				// }
				// else if (!this.cells[c].overlap(ball.sprite)) {
				// 	this.getOut = false;
				// }

								if (this.snakeControl.x != 0) {
					this.sprite.width = 0;
					this.sprite.height = grid;
				}
				else {
					this.sprite.width = grid;
					this.sprite.height = 0;
				}
		 		this.sprite.position = {x:Math.floor(this.sprite.position.x/grid)*grid+grid/2,y:Math.floor(this.sprite.position.y/grid)*grid+grid/2};
				this.storedPos = this.sprite.position;

					// document.addEventListener('keydown', function(e) {
	// 	if (keyCode == UP_ARROW && player[0].lastControl.y != 1) {
	// 		player[0].snakeControl.y = -1;
	// 		player[0].snakeControl.x = 0;		
	// 	}
	// 	else if (keyCode == DOWN_ARROW && player[0].lastControl.y != -1) {
	// 		player[0].snakeControl.y = 1;
	// 		player[0].snakeControl.x = 0;
	// 	}
	// 	else if (keyCode == LEFT_ARROW && player[0].lastControl.x != 1) {
	// 		player[0].snakeControl.x = -1;
	// 		player[0].snakeControl.y = 0;
	// 	}
	// 	else if (keyCode == RIGHT_ARROW && player[0].lastControl.x != -1) {
	// 		player[0].snakeControl.x = 1;
	// 		player[0].snakeControl.y = 0;
	// 	}	

	// 	if ((key == 'W' || key == 'w')&& player[1].lastControl.y != 1) {
	// 		player[1].snakeControl.y = -1;
	// 		player[1].snakeControl.x = 0;	
	// 	}
	// 	else if ((key == 'S' || key == 's')&& player[1].lastControl.y != -1) {
	// 		player[1].snakeControl.y = 1;
	// 		player[1].snakeControl.x = 0;	
	// 	}
	// 	else if ((key == 'A' || key == 'a')&& player[1].lastControl.x != 1) {
	// 		player[1].snakeControl.x = -1;
	// 		player[1].snakeControl.y = 0;
	// 	}
	// 	else if ((key == 'D' || key == 'd')&& player[1].lastControl.x != -1) {
	// 		player[1].snakeControl.x = 1;
	// 		player[1].snakeControl.y = 0;
	// 	}	
	// });

	
				// if (this.lastControl.x == 1) {
				// 	this.sprite.width += grid/8;
				// 	rect(this.sprite.position.x-grid/2,this.sprite.position.y,this.sprite.width,grid);

				// }
				// else if (this.lastControl.x == -1){
				// 	this.sprite.width -= grid/8;
				// 	rect(this.sprite.position.x+grid/2,this.sprite.position.y,this.sprite.width,grid);					
				// }
				// else if (this.lastControl.y == 1) {
				// 	this.sprite.height += grid/8;
				// 	rect(this.sprite.position.x,this.sprite.position.y-grid/2,grid,this.sprite.height);
				// }				
				// else if (this.lastControl.y == -1){
				// 	this.sprite.height  -= grid/8;
				// 	rect(this.sprite.position.x,this.sprite.position.y+grid/2,grid,this.sprite.height);					
				// }			
			//	rotate(-this.sprite.rotation);		//var spriteGroup;
