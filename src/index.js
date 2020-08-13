import './styles/style.css';

let gameScene = new Phaser.Scene('Game');

gameScene.init = function () {
  this.playerSpeed = 150;
  this.jumpSpeed = -600;
};

gameScene.preload = function () {
  this.load.image('ground', 'assets/images/ground.png');
  this.load.image('platform', 'assets/images/platform.png');
  this.load.image('block', 'assets/images/block.png');
  this.load.image('goal', 'assets/images/gorilla3.png');
  this.load.image('barrel', 'assets/images/barrel.png');

  this.load.spritesheet('player', 'assets/images/player_spritesheet.png', {
    frameWidth: 28,
    frameHeight: 30,
    margin: 1,
    spacing: 1
  });

  this.load.spritesheet('fire', 'assets/images/fire_spritesheet.png', {
    frameWidth: 20,
    frameHeight: 21,
    margin: 1,
    spacing: 1
  });
};

gameScene.create = function () {
  this.platforms = this.add.group();

  // ground
  let ground = this.add.sprite(180, 604, 'ground');
  this.physics.add.existing(ground, true);
  this.platforms.add(ground);

  // platform
  let platform = this.add.tileSprite(180, 500, 4 * 36, 1 * 30, 'block');
  this.physics.add.existing(platform, true);
  this.platforms.add(platform);

  // walking animation
  this.anims.create({
    key: 'walking',
    frames: this.anims.generateFrameNames('player', {
      frames: [0, 1, 2]
    }),
    frameRate: 12,
    yoyo: true,
    repeat: -1
  });


  // player
  this.player = this.add.sprite(180, 400, 'player', 3);
  this.physics.add.existing(this.player);

  // disable gravity
  //ground.body.allowGravity = false;

  // make it immovable
  //ground.body.immovable = true;

  // 2) creating and adding sprites to the physics system
  //let ground2 = this.physics.add.sprite(180, 200, 'ground');

  // collision detection
  //this.physics.add.collider(ground, ground2);
  this.physics.add.collider(this.player, this.platforms);

  // enable cursor keys
  this.cursors = this.input.keyboard.createCursorKeys();
};

// executed on every frame
gameScene.update = function () {
  // movement to the left
  if (this.cursors.left.isDown) {
    this.player.body.setVelocityX(-this.playerSpeed);

    this.player.flipX = false;

    // play animation if none is playing
    if (!this.player.anims.isPlaying)
      this.player.anims.play('walking');
  }

  // movement to the right
  else if (this.cursors.right.isDown) {
    this.player.body.setVelocityX(this.playerSpeed);

    this.player.flipX = true;

    // play animation if none is playing
    if (!this.player.anims.isPlaying)
      this.player.anims.play('walking');
  }
  else {
    // make the player stop
    this.player.body.setVelocityX(0);

    // stop walking animation
    this.player.anims.stop('walking');

    // set default frame
    this.player.setFrame(3);
  }
};

let config = {
  type: Phaser.AUTO,
  width: 360,
  height: 640,
  scene: gameScene,
  title: 'Monster Kong',
  pixelArt: false,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1000 },
      debug: true
    }
  }
};

let game = new Phaser.Game(config);