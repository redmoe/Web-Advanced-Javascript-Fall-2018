	//https://gist.github.com/straker/ff00b4b49669ad3dec890306d348adc4
	var player = [];
	var charSelect = true;
	var selectables = ["Pong","Snake","Space"];
	var grid = 32;
	var gridSize = {x:32,y:18};
	var border = {x:4,y:2};

	var ball;

	var spriteGroup;

	var mainFont;

	var noises = [];
	var intros = [];
	var bestOf = 99;
	function preload () {
		mainFont = loadFont("assets/Hyperspace Bold.otf");
		noises[0] = loadSound('assets/ping_pong_8bit_plop.ogg');
		noises[1] = loadSound('assets/ping_pong_8bit_beeep.ogg');
		noises[2] = loadSound('assets/ping_pong_8bit_peeeeeep.ogg');

		for (var i = 0; i < selectables.length; i++) {
			intros[i] = loadSound("assets/"+selectables[i]+".wav");
		}
	}

	function setup() {
		spriteGroup = new Group();
	//	console.log((window.innerWidth || document.body.clientWidth));
		grid = Math.min((window.innerWidth || document.body.clientWidth)-20,1280)/gridSize.x;
		var cnv = createCanvas(grid*gridSize.x, grid*gridSize.y);

		cnv.style('display', 'block');

		border.x *= grid;
		border.y *= grid;

		ball = new Ball();

		player[0] = new Player(width-border.x-grid/2, 180,-1,1);
		player[0].Morph(player[0].form);

		player[1] = new Player(border.x+grid/2, 0,1,0);
		player[1].Morph(player[1].form);
	 	textFont(mainFont);

		textAlign(CENTER, CENTER);
		textSize(grid);

		setInterval(GridTime,200);

		// spr = createSprite(width/2, height/2, 40, 40);
		// spr.shapeColor = color(255);
		// spr.velocity.y = 0.5;	
	}

	function Ball() {
		this.speed = grid/8;
		this.diam = grid;
		this.sprite = createSprite (width/2,height/2,grid,grid);
		this.sprite.setSpeed (this.speed,0);

		this.sprite.draw = function() {  ellipse(0,0,grid,grid) } 
		this.Reset = function() {
			this.sprite.position.x = width / 2;
			this.sprite.position.y = height / 2;
			this.speed = grid/8;
		}
		this.Move = function() {
			// if (this.sprite.position.x+this.diam < border.x) {
			// 	player[1].score++;
			// 	this.sprite.setSpeed (this.speed,0);
			// 	this.Reset();
			// } else if (this.sprite.position.x-this.diam > width-border.x) {
			// 	player[0].score++;
			// 	this.sprite.setSpeed (this.speed,180);

			// 	this.Reset();
			// }
			if (this.sprite.position.x+this.diam < border.x) {
				player[1].score++;
				this.sprite.position.x = width-border.x;
				noises[2].play();
				if (player[1].score > bestOf) {
					EndGame();
				}				

			} else if (this.sprite.position.x-this.diam > width-border.x) {
				player[0].score++;
				this.sprite.position.x = border.x;
				noises[2].play();
				if (player[0].score > bestOf) {
					EndGame();
				}

			}
			console.log(this.sprite.velocity.x);

			if (this.sprite.position.y-this.diam/2 < border.y || this.sprite.position.y+this.diam/2 > height-border.y) {
				this.sprite.setVelocity(this.sprite.velocity.x, -this.sprite.velocity.y);
				noises[0].play();
			}
			drawSprite(this.sprite);
		}
	}

	function Player(tempX, ang, snakeDir,index) {
		this.index = index;
		this.control = {x:0,y:0};
		this.snakeControl = {x:snakeDir,y:0};
		this.speed = grid/6;
		this.angleOffset = ang; 
		this.cells = new Group();
		this.color = 255;
		this.lastControl = {x:snakeDir,y:0};
		this.sprite = createSprite (tempX, height / 2,grid,grid*4);
		this.storedX = tempX;
		this.sprite.shapeColor = "white";
		this.dir = snakeDir;
		this.sprite.addToGroup ( spriteGroup );
		this.form = "Pong";
		this.snakeLength =8;
		this.storedDraw = this.sprite.draw;
		this.score = 0;
		this.storedPos =this.sprite.position;
		this.ready = false;
		this.Move = function() {
			if (this.form == "Pong") {
				if (this.control.x != 0 || this.control.y !=0) {
					if ((this.sprite.position.y-this.sprite.height/2 > border.y && this.control.y != 1) || (this.sprite.position.y < height -(this.sprite.height/2 +border.y) && this.control.y != -1)) {
						this.sprite.position.y += this.control.y*this.speed;
					}
				}
				if (this.sprite.collide(ball.sprite)) {
					var normalizedRelativeIntersectionY = ((ball.sprite.position.y*this.dir-this.sprite.position.y*this.dir)/(this.sprite.height/2)*45)+this.angleOffset;
					ball.sprite.setSpeed(0.4 + ball.speed,normalizedRelativeIntersectionY);
					noises[1].play();
				}
			}
			else if (this.form == "Snake") {
				ball.sprite.bounce(this.sprite);
				ball.sprite.bounce(	this.cells);

				return;
				fill(255);
				rectMode(CENTER);
				if (this.lastControl.x == 1) {
					this.sprite.width += grid/8;
					rect(this.sprite.position.x-grid/2,this.sprite.position.y,this.sprite.width,grid);
					this.cells[this.cells.length-1]
					if (this.sprite.width >= 1) {
						this.GridMove();
					}
				}
				else if (this.lastControl.x == -1){
					this.sprite.width -= grid/8;
					rect(this.sprite.position.x+grid/2,this.sprite.position.y,this.sprite.width,grid);	
					if (this.sprite.width <= 0) {
						this.GridMove();
					}				
				}
				else if (this.lastControl.y == 1) {
					this.sprite.height += grid/8;
					rect(this.sprite.position.x,this.sprite.position.y-grid/2,grid,this.sprite.height);
					if (this.sprite.height >= 1) {
						this.GridMove();
					}	
				}				
				else if (this.lastControl.y == -1){
					this.sprite.height  -= grid/8;
					rect(this.sprite.position.x,this.sprite.position.y+grid/2,grid,this.sprite.height);			
					if (this.sprite.height <= 0) {
						this.GridMove();
					}			
				}	
			}
			else if (this.form=="Space") {
				if (index==1) {
					this.sprite.bounce(player[0].sprite);

				}
				else {
					this.sprite.bounce(player[1].sprite);
				}
				ball.sprite.bounce(this.sprite)
				if (this.control.y != 0) {
					this.sprite.addSpeed(-this.control.y*this.speed/16,this.sprite.rotation);
					this.sprite.limitSpeed (this.speed);
				}
				else {
					this.sprite.friction = 0.05;
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

				if (this.snakeControl.x == 1) {
					this.sprite.width = 0;
					this.sprite.height = grid;
				}
				else {
					this.sprite.width = grid;
					this.sprite.height = 0;					
				}

				var newSprite = createSprite(this.sprite.position.x,this.sprite.position.y,grid,grid);
				newSprite.shapeColor = 255;
				newSprite.immovable = true;
				newSprite.restitution = 2;
				this.cells.add(newSprite);

				while (this.cells.length > this.snakeLength) {
					//console.log(0);
					//this.cells[this.cells.length-1].remove();
					this.cells[0].remove();
				  //  console.log(this.cells[0].position.x/grid)
				   // 				console.log(this.cells.length);

				  //  console.log(this.cells[this.cells.length-1]);
				    //this.cells.remove(this.cells.length-1);
				}   	

			//	console.log((180*Math.atan2(this.snakeControl.x, this.snakeControl.y)/PI)95));
				this.sprite.rotation = (180*Math.atan2(this.snakeControl.x, this.snakeControl.y)/PI);
				this.sprite.position.x += this.snakeControl.x*grid;
				this.sprite.position.y += this.snakeControl.y*grid;

				var addY = border.y+grid/2;
				var addX = border.x+grid/2;			
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

		this.Reset = function () {
			this.sprite.position = {x:this.storedX,y:height/2};
			this.sprite.setVelocity(0,0);
			this.sprite.rotation = this.angleOffset;
		}

		this.Morph = function (newForm) {

			this.form = newForm;
			console.log(this.sprite);
			if (this.form == "Snake") {
				this.sprite.draw = this.storedDraw;
				this.sprite.height = grid;
				this.sprite.width = grid;
			//	this.sprite.position.x = floor(this.sprite.position.x/grid)*grid+grid/2;
				//this.sprite.position.y = floor(this.sprite.position.y/grid)*grid+grid/2;
				this.sprite.immovable = true;
				//console.log(this.sprite.width);
			}
			else if (this.form == "Space") {
				// 			this.sprite.height = grid*2;
				// this.sprite.draw = function() {   triangle(-grid, 0, grid, -grid, grid, grid); } 
				this.sprite.draw = function() { fill(255);  triangle(grid/2, 0, -grid/2, -grid/2, -grid/2, grid/2); } 
				this.sprite.immovable = false;
				this.sprite.mass = 2;
				this.sprite.rotation = this.angleOffset;
				this.sprite.height = grid;
			}
			else if (this.form == "Pong") {
				this.sprite.immovable = true;
				this.sprite.height = grid*4;
				this.sprite.draw = this.storedDraw;

			}
		}
		this.lerpVar = 0;
		this.changeDirection = 1
		this.Draw = function () {
			if (this.form=="Snake") {
				drawSprites(this.cells);
			}
			// else if (this.form=="Space") {
			// 	this.sprite.draw = function() { fill(255);  triangle(grid/2, 0, -grid/2, -grid/2, -grid/2, grid/2); } 

			// }
			else if (this.form=="Player") {
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
		  	else {
		  	}
		    drawSprite(this.sprite);

		  	fill(0);
		  	textSize(grid);
			//text(this.index, this.sprite.position.x, this.sprite.position.y);

			//this.sprite.height = Math.cos(this.lerpVar)*grid*4;

		}
	}

	function windowResized() {
		return;
		grid = (window.innerWidth || document.body.clientWidth)/32;
		resizeCanvas(32*grid, 16*grid);
	}
	function GridTime () {
		if (charSelect) return;
		player[0].GridMove();
		player[1].GridMove();
	}

	function keyPressed() {
		if (charSelect) {
			if (keyCode == UP_ARROW) {
				player[0].ready = true;

			}
			if (keyCode == DOWN_ARROW) {
				player[0].ready = false;
			}
			if (keyCode == LEFT_ARROW) {
				player[0].ready = false;

				if (selectables.indexOf(player[0].form)-1 < 0) {
					player[0].Morph(selectables[selectables.length-1]);
				}
				else
				player[0].Morph(selectables[selectables.indexOf(player[0].form)-1]);
				intros[selectables.indexOf(player[0].form)].play();
			}
			if (keyCode == RIGHT_ARROW) {
				player[0].ready = false;

				if (selectables.indexOf(player[0].form)+1 >= selectables.length) {
					player[0].Morph(selectables[0]);
				}
				else
				player[0].Morph(selectables[selectables.indexOf(player[0].form)+1]);	
				console.log(player[0].form);
				intros[selectables.indexOf(player[0].form)].play();
		
			}	
			if (key == 'W' || key == 'w') {
				player[1].ready = true;

			}
			if (key == 'S' || key == 's') {
				player[1].ready = false;

			}
			if (key == 'A' || key == 'a') {
				player[1].ready = false;

				if (selectables.indexOf(player[1].form)-1 < 0) {
					player[1].Morph(selectables[selectables.length-1]);
				}
				else
				player[1].Morph(selectables[selectables.indexOf(player[1].form)-1]);				
				intros[selectables.indexOf(player[1].form)].play();

			}
			if (key == 'D' || key == 'd') {
				player[1].ready = false;

				if (selectables.indexOf(player[1].form)+1 >= selectables.length) {
					player[1].Morph(selectables[0]);
				}
				else
				player[1].Morph(selectables[selectables.indexOf(player[1].form)+1]);				
				intros[selectables.indexOf(player[1].form)].play();

			}				
		}
		else {
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
		//if (charSelect) return;
		if (keyCode == UP_ARROW ) {
			player[0].control.y += 1;
		}
		if (keyCode == DOWN_ARROW) {
			player[0].control.y -= 1;
		}
		if (keyCode == LEFT_ARROW ) {
			player[0].control.x += 1;
		}
		if (keyCode == RIGHT_ARROW ) {
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



	function EndGame () {
		charSelect = true;
	//	ball.Reset();
		player[0].Reset();
		player[1].Reset();
	}
	function CharctherSelect () {
		if (player[0].ready && player[1].ready ) {
			charSelect = false;
			player[0].ready = null;
			player[1].ready = null;
			player[0].score = 0;
			player[1].score = 0;
			ball.Reset();

		}
	}
	function draw() {
		noStroke();
		rectMode(CENTER);
		fill(255);
		rect(width/2,height/2, width,height,grid);
		fill(0);
		rect(width/2,height/2, width-border.x*2,height-border.y*2,grid/2);
		rect(width/2,grid,width/1.75,grid,grid/2);
		fill(255);
		textSize(grid*.75 );

		text("COMBOY", width / 2, grid);


		if (charSelect) {
			textSize(grid*.5 );
			if (player[0].ready) textSize(grid*.9 );
			text(player[0].form, width / 2 + (width / 4), grid );
			textSize(grid*.5 );
			if (player[1].ready)		textSize(grid*.9 );
			text(player[1].form, (width / 3.5), grid);
			CharctherSelect();
		}
		else {
			text(player[0].score, (width / 4), grid );
			text(player[1].score, width / 2 + (width / 4), grid);
			player[0].Move();
			player[1].Move();
			ball.Move();
		}
		textSize(grid*2);
		if (player[0].score > bestOf) {
			text("PLAYER 1 WINS!", width / 2, height / 2);	
		}
		else if (player[1].score > bestOf) {
			text("PLAYER 2 WINS!", width / 2, height / 2);	
		}
		player[0].Draw()
		player[1].Draw();
		rectMode(CENTER);
		fill(0);
		rect(border.x/2, height-border.y*2,border.x*.75,grid,grid);
		rect(border.x/2, height-border.y*2,grid,border.x*.75,grid);
		rect(width-border.x/2, height-border.y*2,border.x*.75,grid,grid);
		rect(width-border.x/2, height-border.y*2,grid,border.x*.75,grid);
		textSize(grid/2);
		textAlign(CENTER, TOP);

		text("PLAYER 2\n" + player[0].form + "\nWASD\nto control",width-border.x/2,border.y*5.5,border.x,height);
		//fill(255,0,0);
	//	rect(border.x/2,border.y*5.5,border.x,height);
		//		fill(255);
		text("PLAYER 1\n" + player[1].form + "\nArrow\nto control",border.x/2,border.y*5.5,border.x,height);
		fill(255);


		// fill(255,0,0);
		// var testSprite = createSprite(200,500,200,100);
		// rotate(.1)		;
		// var testSprite2 = rect(200,300,200,100);
		// testSprite2.rotate(70)		;
		//drawSprites();
		// drawSprite(testObject1);
		// drawSprite(testObject2);
		// testObject2.bounce(testObject1);	
	}
	// function CreateTesting () {
	// 	testObject1 = createSprite(width/2,height/2,100,100);
	// 			console.log(testObject1.position.x);

	// 	testObject2 = createSprite(width/2-300	,height/2,100,100);
	// 	testObject2.addSpeed(1,0);
	// 	testObject1.immovable = true;
	// }
	// var testObject1;
	// var testObject2;
	// function TestingBounce () {
	// 	//testObject1.draw();
	// //	testObject1.bounce(testObject2)		
	// }