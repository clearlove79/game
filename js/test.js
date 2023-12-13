//state可以是一个自定义对象
var state1 = {
  preload: function () {},
  create: function () {},
  update: function () {},
};
//state也可以是一个构造函数
var state2 = function () {
  this.preload = function () {};
  this.create = function () {};
  this.update = function () {};
};
//只要存在preload、create、update三个方法中的一个就可以了
var state3 = function () {
  this.update = function () {};
};
//当然state里也可以存在其他属性或方法
var state4 = function () {
  this.create = function () {};
  this.aaa = function () {};
  //其他方法
  this.bbb = "hello";
  //其他属性
};

var game = new Phaser.Game(288, 505, Phaser.AUTO, "game");
game.States = {};
//创建一个对象来存放要用到的state
game.State.boot = function () {};
//boot场景，用来做一些游戏启动前的准备
game.State.prelaod = function () {};
//prelaod场景，用来显示资源加载进度
game.State.menu = function () {};
//menu场景，游戏菜单
game.State.play = function () {};
//play场景，正式的游戏部分
//把定义好的场景添加到游戏中
game.state.add("boot", game.States.boot);
game.state.add("preload", game.States.preload);
game.state.add("menu", game.States.menu);
game.state.add("play", game.States.play); //调用boot场景来启动游戏 game.state.start('boot');

game.States.boot = function () {
  this.preload = function () {
    game.load.image("loading", "assets/preloader.gif");
    //加载进度条图片资源
  };
  this.create = function () {
    game.state.start("preload");
    //加载完成后，调用preload场景
  };
};

game.States.menu = function () {
  this.create = function () {
    var titleGroup = game.add.group();
    //创建存放标题的组
    titleGroup.create(0, 0, "title");
    //通过组的create方法创建标题图片并添加到组里
    var bird = titleGroup.create(190, 10, "bird");
    //创建bird对象并添加到组里
    bird.animations.add("fly");
    //给鸟添加动画
    bird.animations.play("fly", 12, true);
    //播放动画
    titleGroup.x = 35;
    //调整组的水平位置
    titleGroup.y = 100;
    //调整组的垂直位置
    game.add
      .tween(titleGroup)
      .to({ y: 120 }, 1000, null, true, 0, Number.MAX_VALUE, true);
    //对这个组添加一个tween动画，让它不停的上下移动
  };
};

game.States.menu = function () {
  this.create = function () {
    var btn = game.add.button(
      game.width / 2,
      game.height / 2,
      "btn",
      function () {
        //添加一个按钮
        game.state.start("play");
        //点击按钮时跳转到play场景
      }
    );
    btn.anchor.setTo(0.5, 0.5);
    //设置按钮的中心点
  };
};
