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
}

// inherit from Phaser.Sprite
Hero.prototype = Object.create(Phaser.Sprite.prototype);
Hero.prototype.constructor = Hero;

Hero.prototype.move = function(direction){
	this.x += direction * 2.5 //2.5 pixels each frame
}


// =============================================================================
// game states
// =============================================================================

PlayState = {};

PlayState.init = function(){

	//Handles the LEFT and Right Keys
	this.keys = this.game.input.keyboard.addKeys({
		left: Phaser.KeyCode.LEFT,
		right: Phaser.KeyCode.RIGHT
	});
}

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

};



// create game entities and set up world here
PlayState.create = function () {
    this.game.add.image(0, 0, 'background');
    this._loadLevel(this.game.cache.getJSON('level:1'));
};

PlayState.update = function () {
    this._handleInput();
};

//Function to handle input. If left is pressed, move the character -1
//If right is pressed, move the character -1.
//Try change the value to -5 or something different
PlayState._handleInput = function () {
    if (this.keys.left.isDown) { // move hero left
        this.hero.move(-1);
    }
    else if (this.keys.right.isDown) { // move hero right
        this.hero.move(1);
    }
};


// =============================================================================
// game states -- Loading
// =============================================================================

//Load levels
PlayState._loadLevel = function (data) {
	console.log(data);
	//spawn all platforms
    data.platforms.forEach(this._spawnPlatform, this);

    //spawn hero and enemies
    this._spawnCharacters({hero: data.hero});

};

PlayState._spawnCharacters = function (data) {
    // spawn hero
    this.hero = new Hero(this.game, data.hero.x, data.hero.y);
    this.game.add.existing(this.hero);
};



PlayState._spawnPlatform = function (platform) {
    this.game.add.sprite(platform.x, platform.y, platform.image);
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



