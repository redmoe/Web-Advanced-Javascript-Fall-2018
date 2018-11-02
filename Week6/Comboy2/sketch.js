	//https://gist.github.com/straker/ff00b4b49669ad3dec890306d348adc4
	var player = [];
	var charSelect = true;
	var selectables = ["Pong","Snake","Space"];
	var grid = 32;
	var gridSize = {x:48,y:27};
	var border = {x:4,y:2};

	var ball;

	var mainFont;

	var noises = [];
	var intros = [];
	var bestOf = 5;
	function preload () {
		mainFont = loadFont("assets/Hyperspace Bold.otf");
		noises[0] = loadSound('assets/ping_pong_8bit_plop.ogg');
		noises[1] = loadSound('assets/ping_pong_8bit_beeep.ogg');
		noises[2] = loadSound('assets/ping_pong_8bit_peeeeeep.ogg');
		noises[3] = loadSound('assets/ChunkyExplosion.wav');
		for (var i = 0; i < selectables.length; i++) {
			intros[i] = loadSound("assets/"+selectables[i]+".wav");
		}
	}

	function setup() {
		grid = Math.min((window.innerWidth || document.body.clientWidth)-20,1280)/gridSize.x;
		//grid = 640/gridSize.x;
		var cnv = createCanvas(grid*gridSize.x, grid*gridSize.y);

		cnv.style('display', 'block');

		border.x *= grid;
		border.y *= grid;

		ball = new Ball();
		var color0 = color(0,0,255);
		if (Cookies.get('player0Color')) {
			var col = JSON.parse(Cookies.get('player0Color'));
			color0 = color(col.levels[0],col.levels[1],col.levels[2]);
		}
		player[0] = new Player(width-border.x-grid/2, 180,-1,0,1,color0);
		player[0].Morph(player[0].form);

		var color1 = color(255,0,0);
		if (Cookies.get('player1Color')) {
			var col = JSON.parse(Cookies.get('player1Color'));
			color1 = color(col.levels[0],col.levels[1],col.levels[2]);
		}
		player[1] = new Player(border.x+grid/2, 0,1,1,0,color1);
		player[1].Morph(player[1].form);
	 	textFont(mainFont);

		textAlign(CENTER, CENTER);
		textSize(grid);
		if (Cookies.get('gameWins')) {
			var win = JSON.parse(Cookies.get('gameWins'));
			player[0].gameWins = win[0];
			player[1].gameWins = win[0];

		}
		setInterval(GridTime,100);
		if (Cookies.get('highScore')) {
			var sco = Cookies.get('highScore');
			Cookies.set('highScore',parseInt(sco)+1);
		}
		else {
			Cookies.set('highScore', 0);
		} 
	}
	function Ball() {
		this.speed = grid/4;
		this.diam = grid;
		this.sprite = createSprite (width/2,height/2,grid,grid);

		this.sprite.draw = function() {  ellipse(0,0,grid,grid) } 
		this.Reset = function() {
			this.sprite.position.x = width / 2;
			this.sprite.position.y = height / 2;
			this.sprite.setVelocity(0,0);
			this.speed = grid/4;
		}
		this.Start = function () {
			this.speed = grid/4;
			this.sprite.setSpeed(this.speed,0);
			this.sprite.setCollider ("circle",0,0,grid/2);
		}
		this.SpeedUp = function () {
			noises[1].play();
			this.speed += grid/20;
			this.sprite.setSpeed(this.speed);

		}
		this.Move = function() {
			if (this.sprite.position.x+this.diam < border.x) {
				player[1].score++;
				this.sprite.position.x = width-border.x;
				this.speed = grid/4;
				this.sprite.setSpeed(this.speed);
				noises[2].play();
				if (player[1].score > bestOf) {
					EndGame();
					player[1].gameWins++;
					Cookies.set('gameWins',[player[0].gameWins,player[1].gameWins]);
				}				

			} else if (this.sprite.position.x-this.diam > width-border.x) {
				player[0].score++;
				this.sprite.position.x = border.x;
				this.speed = grid/4;
				this.sprite.setSpeed(this.speed);
				noises[2].play();
				if (player[0].score > bestOf) {
					EndGame();
					player[0].gameWins++;
					Cookies.set('gameWins',[player[0].gameWins,player[1].gameWins]);
				}
			}
			if (this.sprite.position.y-this.diam/2 < border.y || this.sprite.position.y+this.diam/2 > height-border.y) {
				this.sprite.setVelocity(this.sprite.velocity.x, -this.sprite.velocity.y);
				noises[0].play();
			}
			drawSprite(this.sprite);
		}
	}

	function Player(tempX, ang, snakeDir,index,otherIndex,color) {
		this.index = index;
		this.opIndex = otherIndex;
		this.control = {x:0,y:0};
		this.snakeControl = {x:snakeDir,y:0};
		this.snakeLength =12;
		this.speed = grid/2;
		this.angleOffset = ang; 
		this.cells = new Group();
		this.color = color;
		this.lastControl = {x:snakeDir,y:0};
		this.sprite = createSprite (tempX, height / 2,grid,grid*4);
		this.storedX = tempX;
		this.sprite.shapeColor = this.color;
		this.dir = snakeDir;
		this.form = "Pong";
		this.storedDraw = this.sprite.draw;
		this.score = 0;
		this.storedPos =this.sprite.position;
		this.ready = false;
		this.gameWins = 0;
		this.lerpVar = 0;
		this.changeDirection = 1;
		this.getOut = false;
		this.Move = function() {
			if(charSelect) return;
			if (this.form == "Pong") {
				if (this.control.x != 0 || this.control.y !=0) {
					if ((this.sprite.position.y-this.sprite.height/2 > border.y && this.control.y != 1) || (this.sprite.position.y < height -(this.sprite.height/2 +border.y) && this.control.y != -1)) {
						this.sprite.position.y += this.control.y*this.speed;
					}
				}
				if (this.sprite.collide(ball.sprite)) {
					var normalizedRelativeIntersectionY = ((ball.sprite.position.y*this.dir-this.sprite.position.y*this.dir)/(this.sprite.height/2)*45)+this.angleOffset;
					ball.sprite.setSpeed(0.4 + ball.speed,normalizedRelativeIntersectionY);
					ball.SpeedUp();
				}
			}
			else if (this.form == "Snake") {
				if (ball.sprite.bounce(this.sprite) || ball.sprite.bounce(	this.cells)) {
					//ball.SpeedUp();
				}				
				return;
				fill(this.color);
				rectMode(CENTER);
				if (this.lastControl.x == 1) {
					this.sprite.width += grid/8;
					rect(this.sprite.position.x-grid/2,this.sprite.position.y,this.sprite.width,grid);
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
				if (ball.sprite.bounce(this.sprite)) {
					ball.SpeedUp();
				}
				//this.sprite.bounce(player[this.opIndex].sprite);
				if (this.control.y > 0 && this.cells.length == 0) {
					var newBullet = createSprite(this.sprite.position.x,this.sprite.position.y);		
					newBullet.draw = function() {  ellipse(0,0,grid/2,grid/2) } 
					this.cells.add(newBullet);
					newBullet.setCollider ("circle",0,0,grid/2);
					newBullet.setSpeed(this.speed,this.sprite.rotation);
				}	
				if (this.cells.length != 0) {
					if (this.cells[0].bounce(ball.sprite)) {
						ball.SpeedUp();
						this.cells[0].remove();
					}
					else if (this.cells[0].position.x < border.x || this.cells[0].position.x > width-border.x || this.cells[0].position.y < border.y || this.cells[0].position.y > height-border.y) {
						this.cells[0].remove();
					}				
				}		
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
		this.GridMove = function () {
			if (this.form == "Snake") {
				this.sprite.position.x += this.snakeControl.x*grid;
				this.sprite.position.y += this.snakeControl.y*grid;
				var newSprite = createSprite(this.sprite.previousPosition.x,this.sprite.previousPosition.y,grid,grid);
				newSprite.shapeColor = this.color;
				newSprite.immovable = true;
				newSprite.restitution = 2;
				this.cells.add(newSprite);
				while (this.cells.length > this.snakeLength) {
					this.cells[0].remove();
				}  				
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
				if (player[this.opIndex].sprite.overlap(this.sprite) || this.cells.overlap(this.sprite) || player[this.opIndex].cells.overlap(this.sprite) ) {
					for (var i = 0; i < this.cells.length; i++) {
						this.cells[i].shapeColor = 255;
					}
					this.Reset();
					noises[3].play();
				}				 
			}
		}
		this.Reset = function () {
			this.sprite.position = {x:this.storedX,y:height/2};
			this.sprite.setVelocity(0,0);
			this.sprite.rotation = this.angleOffset;
			this.snakeControl = {x:this.dir,y:0};
			this.sprite.setCollider ("rectangle",0,0,grid-2,grid-2);
			if (charSelect)
			this.cells = new Group();
		}

		this.Morph = function (newForm) {
			this.form = newForm;
			if (this.form == "Snake") {
				this.sprite.height = grid;
				this.sprite.width = grid;
				this.sprite.immovable = true;
				this.sprite.draw = this.storedDraw;
			}
			else if (this.form == "Space") {
				this.sprite.draw = function() {  triangle(grid/2, 0, -grid/2, -grid/2, -grid/2, grid/2); } 
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
		this.Draw = function () {
			if (this.form=="Snake") {
				drawSprites(this.cells);
			}
			else if (this.form=="Player") {
				this.sprite.height = (this.lerpVar*grid*4)-grid*4;
				this.lerpVar+=0.01*this.changeDirection;
		  		if (this.lerpVar > 1 ) {
		  			this.changeDirection = -1;
		  		}
		  		else if (this.lerpVar < 0) {
		  			this.changeDirection = 1;
		  		}
		  	}
		  	else if (this.form=="Space") {
		  		fill(this.color);
		  		drawSprite(this.cells[0]);
		  	}
		    drawSprite(this.sprite);
		  	fill(0);
		  	textSize(grid);
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
				if (player[0].ready) {
					player[0].ready = false;
				}
				else {
					player[0].color = color((Math.floor(Math.random() * 224))+32,(Math.floor(Math.random() * 224))+32, (Math.floor(Math.random() * 224))+32);
					player[0].sprite.shapeColor = player[0].color;
					Cookies.set('player0Color',player[0].color);
				}
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
				intros[selectables.indexOf(player[0].form)].play();
			}	
			if (key == 'W' || key == 'w') {
				player[1].ready = true;
			}
			if (key == 'S' || key == 's') {
				if (player[1].ready) {
					player[1].ready = false;
				}
				else {
					player[1].color = color((Math.floor(Math.random() * 224))+32,(Math.floor(Math.random() * 224))+32, (Math.floor(Math.random() * 224))+32);
					player[1].sprite.shapeColor = player[1].color;
					Cookies.set('player1Color',player[1].color);
				}
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
			if ((key == 'W' || key == 'w') && player[1].lastControl.y != 1) {
				player[1].snakeControl.y = -1;
				player[1].snakeControl.x = 0;	
			}
			else if ((key == 'S' || key == 's') && player[1].lastControl.y != -1) {
				player[1].snakeControl.y = 1;
				player[1].snakeControl.x = 0;	
			}
			else if ((key == 'A' || key == 'a') && player[1].lastControl.x != 1) {
				player[1].snakeControl.x = -1;
				player[1].snakeControl.y = 0;
			}
			else if ((key == 'D' || key == 'd') && player[1].lastControl.x != -1) {
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
		player[0].Reset();
		player[1].Reset();
		ball.Reset();
	}
	function CharctherSelect () {
		if (player[0].ready && player[1].ready ) {
			charSelect = false;
			player[0].ready = null;
			player[1].ready = null;
			player[0].score = 0;
			player[1].score = 0;
			ball.Start();
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
		if (Cookies.get('gameWins') && charSelect) {
			var win = JSON.parse(Cookies.get('gameWins'));
			text(win[0] + "/" + win[1], width / 2, grid);
		}
		else {
			text("COMBOY", width / 2, grid);
		}
		if (charSelect) {
			textSize(grid*.5 );
			if (player[0].ready) textSize(grid*.9 );
			text(player[0].form, width / 2 + (width / 4), grid );
			textSize(grid*.5 );
			if (player[1].ready)textSize(grid*.9 );
			text(player[1].form, (width / 3.5), grid);
			CharctherSelect();
		}
		else if (!charSelect) {
			text(player[0].score, (width / 4), grid );
			text(player[1].score, width / 2 + (width / 4), grid);
			ball.Move();			
			player[0].Move();
			player[1].Move();
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
		text("PLAYER 1\n" + player[1].form + "\nArrow\nto control",border.x/2,border.y*5.5,border.x,height);
		fill(255);
	}
