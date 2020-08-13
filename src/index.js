let gameScene = new Phaser.Scene('Game');

gameScene.init = function () { };

gameScene.create = function () { };

let config = {
  type: Phaser.AUTO,
  width: 360,
  height: 640,
  scene: gameScene,
  title: 'Monster Kong',
  pixelArt: false
};

let game = new Phaser.Game(config);