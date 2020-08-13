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

  this.load.json('levelData', 'assets/json/levelData.json');
};

gameScene.create = function () {
  
  // world bounds
  this.physics.world.bounds.width = 360;
  this.physics.world.bounds.height = 700;
  
  this.platforms = this.add.group();
  // // ground
  // let ground = this.add.sprite(180, 604, 'ground');
  // this.physics.add.existing(ground, true);
  // this.platforms.add(ground);

  // // platform
  // let platform = this.add.tileSprite(180, 500, 4 * 36, 1 * 30, 'block');
  // this.physics.add.existing(platform, true);
  // this.platforms.add(platform);

  // add all level elements
  this.setupLevel();

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

  // fire animation
  this.anims.create({
    key: 'burning',
    frames: this.anims.generateFrameNames('fire', {
      frames: [0, 1]
    }),
    frameRate: 4,
    repeat: -1
  });

  // player
  this.player = this.add.sprite(180, 400, 'player', 3);
  this.physics.add.existing(this.player);

  // constrain player to the game bounds
  this.player.body.setCollideWorldBounds(true);

  // disable gravity
  //ground.body.allowGravity = false;

  // make it immovable
  //ground.body.immovable = true;

  // 2) creating and adding sprites to the physics system
  //let ground2 = this.physics.add.sprite(180, 200, 'ground');

  // collision detection
  //this.physics.add.collider(ground, ground2);
  this.physics.add.collider(this.player, this.platforms);
  this.physics.add.collider(this.goal, this.platforms);

  // enable cursor keys
  this.cursors = this.input.keyboard.createCursorKeys();

  this.input.on('pointerdown', function (pointer) {
    console.log(pointer.x, pointer.y);
  });
};

// executed on every frame
gameScene.update = function () {
  let onGround = this.player.body.blocked.down ||
    this.player.body.touching.down;

  // movement to the left
  if (this.cursors.left.isDown) {
    this.player.body.setVelocityX(-this.playerSpeed);

    this.player.flipX = false;

    // play animation if none is playing
    if (onGround && !this.player.anims.isPlaying)
      this.player.anims.play('walking');
  }

  // movement to the right
  else if (this.cursors.right.isDown) {
    this.player.body.setVelocityX(this.playerSpeed);

    this.player.flipX = true;

    // play animation if none is playing
    if (onGround && !this.player.anims.isPlaying)
      this.player.anims.play('walking');
  }
  else {
    // make the player stop
    this.player.body.setVelocityX(0);

    // stop walking animation
    this.player.anims.stop('walking');

    // set default frame
    if (onGround)
      this.player.setFrame(3);
  }

  // handle jumping
  if (onGround && (this.cursors.space.isDown || this.cursors.up.isDown)) {
    // give the player a velocity in Y
    this.player.body.setVelocityY(this.jumpSpeed);

    // stop the walking animation
    this.player.anims.stop('walking');

    // change frame
    this.player.setFrame(2);
  }
};

// sets up all the elements in the level
gameScene.setupLevel = function () {
  this.platforms = this.add.group();

  // parse json data
  this.levelData = this.cache.json.get('levelData');

  // create all the platforms
  for (let i = 0; i < this.levelData.platforms.length; i++) {
    let curr = this.levelData.platforms[i];

    let newObj;

    // create object
    if (curr.numTiles == 1) {
      // create sprite
      newObj = this.add.sprite(curr.x, curr.y, curr.key).setOrigin(0);
    }
    else {
      // create tilesprite
      let width = this.textures.get(curr.key).get(0).width;
      let height = this.textures.get(curr.key).get(0).height;
      newObj = this.add.tileSprite(curr.x, curr.y, curr.numTiles * width, height, curr.key).setOrigin(0);
    }

    // enable physics
    this.physics.add.existing(newObj, true);

    // add to the group
    this.platforms.add(newObj);
  }

  // create all the fire
  this.fires = this.add.group();
  for (let i = 0; i < this.levelData.fires.length; i++) {
    let curr = this.levelData.fires[i];

    let newObj = this.add.sprite(curr.x, curr.y, 'fire').setOrigin(0);

    // enable physics
    this.physics.add.existing(newObj);
    newObj.body.allowGravity = false;
    newObj.body.immovable = true;

    // play burning animation
    newObj.anims.play('burning');

    // add to the group
    this.fires.add(newObj);

    // this is for level creation
    newObj.setInteractive();
    this.input.setDraggable(newObj);
  }

  // for level creation
  this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
    gameObject.x = dragX;
    gameObject.y = dragY;

    console.log(dragX, dragY);

  });

  // player
  this.player = this.add.sprite(this.levelData.player.x, this.levelData.player.y, 'player', 3);
  this.physics.add.existing(this.player);

  // constraint player to the game bounds
  this.player.body.setCollideWorldBounds(true);

  // goal
  this.goal = this.add.sprite(this.levelData.goal.x, this.levelData.goal.y, 'goal');
  this.physics.add.existing(this.goal);

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