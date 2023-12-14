const game = new Phaser.Game(288, 505, Phaser.AUTO, "game");

game.States = {};

game.States.boot = function () {
  this.preload = function () {
    if (!game.device.desktop) {
      this.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
      this.scale.forcePortrait = true;
      this.scale.refresh();
    }
    game.load.image("loading", "assets/preloader.gif");
  };

  this.create = function () {
    game.state.start("preload");
  };
};

game.States.preload = function () {
  this.preload = function () {
    const preloadSprite = game.add.sprite(35, game.height / 2, "loading");
    game.load.setPreloadSprite(preloadSprite);

    game.load.image("background", "assets/background.png");
    game.load.image("ground", "assets/ground.png");
    game.load.image("title", "assets/title.png");
    game.load.spritesheet("bird", "assets/bird.png", 34, 24, 3);
    game.load.image("btn", "assets/start-button.png");
    game.load.spritesheet("pipe", "assets/pipes.png", 54, 320, 2);
    game.load.bitmapFont(
      "flappy_font",
      "assets/fonts/flappyfont/flappyfont.png",
      "assets/fonts/flappyfont/flappyfont.fnt"
    );
    game.load.audio("fly_sound", "assets/flap.wav");
    game.load.audio("score_sound", "assets/score.wav");
    game.load.audio("hit_pipe_sound", "assets/pipe-hit.wav");
    game.load.audio("hit_ground_sound", "assets/ouch.wav");

    game.load.image("ready_text", "assets/get-ready.png");
    game.load.image("play_tip", "assets/instructions.png");
    game.load.image("game_over", "assets/gameover.png");
    game.load.image("score_board", "assets/scoreboard.png");
  };

  this.create = function () {
    game.state.start("menu");
  };
};

game.States.menu = function () {
  this.create = function () {
    game.add
      .tileSprite(0, 0, game.width, game.height, "background")
      .autoScroll(-10, 0);
    game.add
      .tileSprite(0, game.height - 112, game.width, 112, "ground")
      .autoScroll(-100, 0);

    const titleGroup = game.add.group();
    titleGroup.create(0, 0, "title");
    const bird = titleGroup.create(190, 10, "bird");
    bird.animations.add("fly");
    bird.animations.play("fly", 12, true);
    titleGroup.x = 35;
    titleGroup.y = 100;
    game.add
      .tween(titleGroup)
      .to({ y: 120 }, 1000, null, true, 0, Number.MAX_VALUE, true);

    const btn = game.add.button(game.width / 2, game.height / 2, "btn", () =>
      game.state.start("play")
    );
    btn.anchor.setTo(0.5, 0.5);
  };
};

// 创建 game.States.play
game.States.play = function () {
  // play 状态的初始化函数
  this.create = function () {
	// 初始化游戏对象和设置
    this.initGameObjects();

    // 创建用于启动游戏的输入事件
    game.input.onDown.addOnce(this.startGame, this);
  };

  this.update = function () {
    // 更新游戏状态
    if (this.hasStarted) {
      this.handleCollisions();
      this.updateBirdRotation();
      this.pipeGroup.forEachExists(this.checkScore, this);
    }
  };

  // 初始化游戏对象和设置的函数
  this.initGameObjects = function () {
    // 设置背景、地面、鸟、声音和文本
    this.bg = game.add.tileSprite(0, 0, game.width, game.height, "background");
    this.pipeGroup = game.add.group();
    this.pipeGroup.enableBody = true;
    this.ground = game.add.tileSprite(
      0,
      game.height - 112,
      game.width,
      112,
      "ground"
    );

    this.bird = game.add.sprite(50, 150, "bird");
    this.bird.animations.add("fly");
    this.bird.animations.play("fly", 12, true);
    this.bird.anchor.setTo(0.5, 0.5);

    game.physics.enable(this.bird, Phaser.Physics.ARCADE);
    this.bird.body.gravity.y = 0;

    game.physics.enable(this.ground, Phaser.Physics.ARCADE);
    this.ground.body.immovable = true;

    this.soundFly = game.add.sound("fly_sound");
    this.soundScore = game.add.sound("score_sound");
    this.soundHitPipe = game.add.sound("hit_pipe_sound");
    this.soundHitGround = game.add.sound("hit_ground_sound");

    this.scoreText = game.add.bitmapText(
      game.world.centerX - 20,
      30,
      "flappy_font",
      "0",
      36
    );

    this.readyText = game.add.image(game.width / 2, 40, "ready_text");
    this.playTip = game.add.image(game.width / 2, 300, "play_tip");
    this.readyText.anchor.setTo(0.5, 0);
    this.playTip.anchor.setTo(0.5, 0);

    this.hasStarted = false;
  };

  this.startGame = function () {
    // 启动游戏
    this.gameSpeed = 200;
    this.gameIsOver = false;
    this.hasHitGround = false;
    this.hasStarted = true;
    this.score = 0;

    // 加载游戏元素并且把题目元素移除
    this.bg.autoScroll(-(this.gameSpeed / 10), 0);
    this.ground.autoScroll(-this.gameSpeed, 0);
    this.bird.body.gravity.y = 1150;
    this.readyText.destroy();
    this.playTip.destroy();

    // 启用鸟的飞行输入
    game.input.onDown.add(this.fly, this);

    // 开始生成管道
    game.time.events.loop(900, this.generatePipes, this);
    game.time.events.start();
  };

  this.handleCollisions = function () {
    // 处理与地面和管道的碰撞的函数
    game.physics.arcade.collide(
      this.bird,
      this.ground,
      this.hitGround,
      null,
      this
    );
    game.physics.arcade.overlap(
      this.bird,
      this.pipeGroup,
      this.hitPipe,
      null,
      this
    );
  };

  this.updateBirdRotation = function () {
    // 更新鸟的旋转角度的函数
    if (this.bird.angle < 90) {
      this.bird.angle += 2.5;
    }
  };

  this.fly = function () {
    // 让鸟飞翔的函数
    this.bird.body.velocity.y = -350;
    game.add.tween(this.bird).to({ angle: -30 }, 100, null, true, 0, 0, false);
    this.soundFly.play();
  };

  this.hitPipe = function () {
    // 处理鸟撞到管道的函数
    if (this.gameIsOver) return;
    this.soundHitPipe.play();
    this.gameOver();
  };

  this.hitGround = function () {
    // 处理鸟撞到地面的函数
    if (this.hasHitGround) return;
    this.hasHitGround = true;
    this.soundHitGround.play();
    this.gameOver(true);
  };

  this.gameOver = function (showText) {
    // 处理游戏结束的函数
    this.gameIsOver = true;
    this.stopGame();

    if (showText) this.showGameOverText();
  };

  this.stopGame = function () {
    // 停止游戏元素的函数
    this.bg.stopScroll();
    this.ground.stopScroll();
    this.pipeGroup.forEachExists(function (pipe) {
      pipe.body.velocity.x = 0;
    }, this);

    this.bird.animations.stop("fly", 0);
    game.input.onDown.remove(this.fly, this);
    game.time.events.stop(true);
  };

  this.showGameOverText = function () {
    // 显示游戏结束文本和分数板的函数
    this.scoreText.destroy();
    game.bestScore = game.bestScore || 0;

    if (this.score > game.bestScore) game.bestScore = this.score;

    this.gameOverGroup = game.add.group();
    const gameOverText = this.gameOverGroup.create(
      game.width / 2,
      0,
      "game_over"
    );
    const scoreboard = this.gameOverGroup.create(
      game.width / 2,
      70,
      "score_board"
    );

    const replayBtn = game.add.button(
      game.width / 2,
      210,
      "btn",
      function () {
        game.state.start("play");
      },
      this,
      null,
      null,
      null,
      null,
      this.gameOverGroup
    );

    gameOverText.anchor.setTo(0.5, 0);
    scoreboard.anchor.setTo(0.5, 0);
    replayBtn.anchor.setTo(0.5, 0);
    this.gameOverGroup.y = 30;
  };

  this.generatePipes = function (gap) {
    // 生成管道的函数
    gap = gap || 100;
    const position =
      505 -
      320 -
      gap +
      Math.floor((505 - 112 - 30 - gap - 505 + 320 + gap) * Math.random());
    const topPipeY = position - 360;
    const bottomPipeY = position + gap;

    if (this.resetPipe(topPipeY, bottomPipeY)) return;

    const topPipe = game.add.sprite(
      game.width,
      topPipeY,
      "pipe",
      0,
      this.pipeGroup
    );
    const bottomPipe = game.add.sprite(
      game.width,
      bottomPipeY,
      "pipe",
      1,
      this.pipeGroup
    );

    this.pipeGroup.setAll("checkWorldBounds", true);
    this.pipeGroup.setAll("outOfBoundsKill", true);
    this.pipeGroup.setAll("body.velocity.x", -this.gameSpeed);
  };

  this.resetPipe = function (topPipeY, bottomPipeY) {
    // 重置越界的管道的函数
    let i = 0;

    this.pipeGroup.forEachDead(function (pipe) {
      if (pipe.y <= 0) {
        pipe.reset(game.width, topPipeY);
        pipe.hasScored = false;
      } else {
        pipe.reset(game.width, bottomPipeY);
      }
      pipe.body.velocity.x = -this.gameSpeed;
      i++;
    }, this);

    return i === 2;
  };

  this.checkScore = function (pipe) {
    // 检查并更新分数的函数
    if (!pipe.hasScored && pipe.y <= 0 && pipe.x <= this.bird.x - 17 - 54) {
      pipe.hasScored = true;
      this.scoreText.text = ++this.score;
      this.soundScore.play();
      return true;
    }
    return false;
  };
};

// 添加场景并且开始游戏
game.state.add("boot", game.States.boot);
game.state.add("preload", game.States.preload);
game.state.add("menu", game.States.menu);
game.state.add("play", game.States.play);
game.state.start("boot");
