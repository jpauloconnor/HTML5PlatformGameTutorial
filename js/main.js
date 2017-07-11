// =============================================================================
// sprites
// =============================================================================

//
// hero sprite
//

function Hero(game, x, y) {
    // call Phaser.Sprite constructor
    Phaser.Sprite.call(this, game, x, y, 'hero');
 
 	//Set the start position for the hero
    this.anchor.set(0.5, 0.5);

    //enable physics for the hero
    this.game.physics.enable(this);

    this.body.collideWorldBounds = true;
}

// inherit from Phaser.Sprite
Hero.prototype = Object.create(Phaser.Sprite.prototype);
Hero.prototype.constructor = Hero;

Hero.prototype.move = function(direction){
	const SPEED = 200;
	this.body.velocity.x = direction * SPEED;
}

Hero.prototype.jump = function () {
    const JUMP_SPEED = 600;

    let canJump = this.body.touching.down;

    if (canJump){
	    this.body.velocity.y = -JUMP_SPEED;    	
    }

    return canJump;
};

Hero.prototype.bounce = function () {
    const BOUNCE_SPEED = 200;
    this.body.velocity.y = -BOUNCE_SPEED;
};

// spider

function Spider(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'spider');

    // anchor
    this.anchor.set(0.5);
    // animation
    this.animations.add('crawl', [0, 1, 2], 8, true);
    this.animations.add('die', [0, 4, 0, 4, 0, 4, 3, 3, 3, 3, 3, 3], 12);
    this.animations.add('die', [0, 4, 0, 4, 0, 4, 3, 3, 3, 3, 3, 3], 12);
    this.animations.play('crawl');

    // physic properties
    this.game.physics.enable(this);
    this.body.collideWorldBounds = true;
    this.body.velocity.x = Spider.SPEED;
}

Spider.SPEED = 100;

// inherit from Phaser.Sprite
Spider.prototype = Object.create(Phaser.Sprite.prototype);
Spider.prototype.constructor = Spider;


Spider.prototype.update = function () {
    // check against walls and reverse direction if necessary
    // make the spider go faster to the left...
    if (this.body.touching.right || this.body.blocked.right) {
        this.body.velocity.x = -Spider.SPEED * 2; // turn left
    }
    else if (this.body.touching.left || this.body.blocked.left) {
        this.body.velocity.x = Spider.SPEED; // turn right
    }
};

Spider.prototype.die = function () {
    this.body.enable = false;

    this.animations.play('die').onComplete.addOnce(function () {
        this.kill();
    }, this);
};


// =============================================================================
// game states
// =============================================================================

PlayState = {};

PlayState.init = function(){

	//Handles the LEFT and Right Keys
	this.keys = this.game.input.keyboard.addKeys({
		left: Phaser.KeyCode.LEFT,
		right: Phaser.KeyCode.RIGHT,
		up: Phaser.KeyCode.UP
	});

	this.keys.up.onDown.add(function () {
		let didJump = this.hero.jump();
		if(didJump){
	    	this.sfx.jump.play();			
		}

	}, this);
};

PlayState.preload = function () {
	this.game.load.json('level:1', 'data/level01.json');
    this.game.load.image('background', 'images/background.png');
    this.game.load.image('ground', 'images/ground.png');
    this.game.load.image('grass:8x1', 'images/grass_8x1.png');
    this.game.load.image('grass:6x1', 'images/grass_6x1.png');
    this.game.load.image('grass:4x1', 'images/grass_4x1.png');
    this.game.load.image('grass:2x1', 'images/grass_2x1.png');
    this.game.load.image('grass:1x1', 'images/grass_1x1.png');
	this.game.load.image('hero', 'images/hero_stopped.png');
    this.game.load.image('invisible-wall', 'images/invisible_wall.png');
    this.game.load.audio('sfx:jump', 'audio/jump.wav');
    this.game.load.spritesheet('coin', 'images/coin_animated.png', 22, 22);
    this.game.load.audio('sfx:coin', 'audio/coin.wav');
    this.game.load.spritesheet('spider', 'images/spider.png', 42, 32);

};



// create game entities and set up world here
PlayState.create = function () {
	// create sound entities
    this.sfx = {
        jump: this.game.add.audio('sfx:jump'),
        coin: this.game.add.audio('sfx:coin'),
        stomp: this.game.add.audio('sfx:stomp')
    };
    this.game.add.image(0, 0, 'background');
    this._loadLevel(this.game.cache.getJSON('level:1'));


};

PlayState.update = function () {
    this._handleCollisions();
    this._handleInput();
};

PlayState._handleCollisions = function () {
	this.game.physics.arcade.collide(this.spiders, this.platforms);
    this.game.physics.arcade.collide(this.spiders, this.enemyWalls);
    this.game.physics.arcade.collide(this.hero, this.platforms);

    //collision of coin and hero
    //null would allow us to filter
    this.game.physics.arcade.overlap(this.hero, this.coins, this._onHeroVsCoin, null, this);
	this.game.physics.arcade.overlap(this.hero, this.spiders,
        this._onHeroVsEnemy, null, this);

};

//Function to handle input. If left is pressed, move the character -1
//If right is pressed, move the character -1.
PlayState._handleInput = function () {
    if (this.keys.left.isDown) { // move hero left
        this.hero.move(-5);
    }
    else if (this.keys.right.isDown) { // move hero right
        this.hero.move(1);
    }
    else { //stop
    	this.hero.move(0);
    }
};

//Load levels
PlayState._loadLevel = function (data) {

	//create all the groups/layers that we need
	this.platforms = this.game.add.group();
	this.coins = this.game.add.group();
	this.spiders = this.game.add.group();
    this.enemyWalls = this.game.add.group();
    //Hide the wall
    this.enemyWalls.visible = false;


	console.log(data);
	//spawn all platforms
    data.platforms.forEach(this._spawnPlatform, this);

    //spawn hero and enemies
    this._spawnCharacters({hero: data.hero, spiders: data.spiders});
    data.coins.forEach(this._spawnCoin, this);

    //enable gravity
    const GRAVITY = 1200;
    this.game.physics.arcade.gravity.y = GRAVITY;
};

PlayState._spawnPlatform = function (platform) {
    let sprite = this.platforms.create(
        platform.x, platform.y, platform.image);

    this.game.physics.enable(sprite);

    sprite.body.allowGravity = false;
    sprite.body.immovable = true;

    this._spawnEnemyWall(platform.x, platform.y, 'left');
    this._spawnEnemyWall(platform.x + sprite.width, platform.y, 'right');

};

PlayState._spawnCharacters = function (data) {
  	  // spawn spiders
    data.spiders.forEach(function (spider) {
        let sprite = new Spider(this.game, spider.x, spider.y);
        this.spiders.add(sprite);
    }, this);
    
    // spawn hero
    this.hero = new Hero(this.game, data.hero.x, data.hero.y);
    this.game.add.existing(this.hero);
};

PlayState._spawnEnemyWall = function (x, y, side) {
    let sprite = this.enemyWalls.create(x, y, 'invisible-wall');
    // anchor and y displacement
    sprite.anchor.set(side === 'left' ? 1 : 0, 1);

    // physic properties
    this.game.physics.enable(sprite);
    sprite.body.immovable = true;
    sprite.body.allowGravity = false;
};

PlayState._spawnCoin = function (coin) {
    let sprite = this.coins.create(coin.x, coin.y, 'coin');
    sprite.anchor.set(0.5, 0.5);

    sprite.animations.add('rotate', [0,1,2,1], 12, true);
    sprite.animations.play('rotate');

    //What happens if we set the gravity to true?
    this.game.physics.enable(sprite);
  	sprite.body.allowGravity = false;
};

PlayState._onHeroVsCoin = function (hero, coin) {
	//Make the noise upon collision
	this.sfx.coin.play();

	//Make the coin go away.
    coin.kill();
};


PlayState._onHeroVsEnemy = function (hero, enemy) {
     if (hero.body.velocity.y > 0) { // kill enemies when hero is falling
        hero.bounce();
        enemy.die();
        this.sfx.stomp.play();
    }
    else { // game over -> restart the game
        this.sfx.stomp.play();
        this.game.state.restart();
    }
};


// =============================================================================
// entry point
// =============================================================================

//sets 960 x 600 game size.
//also connects with the "game" id
window.onload = function () {
    let game = new Phaser.Game(960, 600, Phaser.AUTO, 'game');
    game.state.add('play', PlayState);
    game.state.start('play');
};



