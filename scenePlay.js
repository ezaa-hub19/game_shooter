// ScenePlay.js
class ScenePlay extends Phaser.Scene {
  constructor() {
    super({ key: "scenePlay" });
  }

  preload() {
    this.load.setBaseURL("assets/");
    this.load.image("BG1", "images/BG1.png");
    this.load.image("BG2", "images/BG2.png");
    this.load.image("BG3", "images/BG3.png");
    this.load.image("GroundTransisi", "images/Transisi.png");
    this.load.image("EfekLedakan", "images/Efekledakan.png");
    this.load.image("Pesawat1", "images/Pesawat1.png");
    this.load.image("Pesawat2", "images/Pesawat2.png");
    this.load.image("Peluru", "images/Peluru.png");
    this.load.image("Musuh1", "images/Musuh1.png");
    this.load.image("Musuh2", "images/Musuh2.png");
    this.load.image("Musuh3", "images/Musuh3.png");
    this.load.image("MusuhBos", "images/MusuhBos.png");
    this.load.image("cloud", "images/cloud.png");
    this.load.audio("snd_shoot", "audio/fx_shoot.mp3");
    this.load.audio("snd_explode", "audio/fx_explode.mp3");
    this.load.audio("snd_play", "audio/music_play.mp3");
  }

  init(data) {
    this.selectedHero = data.selectedHero ?? 0;
    this.gameOver = false;
  }

  create() {
    this.createBackground();
    this.createScore();
    this.createHero();
    this.createControls();
    this.createEnemies();
    this.createBullets();
    this.createExplosions();

    if (!this.sound.get("snd_play")) {
      this.sound.play("snd_play", { volume: 0.3, loop: true });
    }
  }

  createBackground() {
    this.lastBgIndex = Phaser.Math.Between(1, 3);
    this.bgBottomSize = { width: 768, height: 1664 };
    this.bgCloudSize = { width: 768, height: 1962 };
    this.arrBgBottom = [];
    this.arrBgTop = [];

    this.createBGBottom = (x, y) => {
      let bg = this.add.image(x, y, "BG" + this.lastBgIndex).setDepth(1);
      bg.setData("kecepatan", 3);
      bg.flipX = Phaser.Math.Between(0, 1);
      this.arrBgBottom.push(bg);

      let newIndex = Phaser.Math.Between(1, 3);
      if (newIndex !== this.lastBgIndex) {
        let transisi = this.add.image(
          x,
          y - this.bgBottomSize.height / 2,
          "GroundTransisi"
        );
        transisi.setData("kecepatan", 3);
        transisi.setDepth(1);
        transisi.flipX = Phaser.Math.Between(0, 1);
        transisi.setData("tambahan", true);
        this.arrBgBottom.push(transisi);
      }
      this.lastBgIndex = newIndex;
    };

    this.addBGBottom = () => {
      if (this.arrBgBottom.length > 0) {
        let lastBG = this.arrBgBottom[this.arrBgBottom.length - 1];
        if (lastBG.getData("tambahan")) {
          lastBG = this.arrBgBottom[this.arrBgBottom.length - 2];
        }
        this.createBGBottom(
          this.cameras.main.width / 2,
          lastBG.y - this.bgBottomSize.height
        );
      } else {
        this.createBGBottom(
          this.cameras.main.width / 2,
          this.cameras.main.height / 2
        );
      }
    };

    this.createBGTop = (x, y) => {
      let bg = this.add.image(x, y, "cloud").setDepth(5);
      bg.setData("kecepatan", 6);
      bg.flipX = Phaser.Math.Between(0, 1);
      bg.setAlpha(Phaser.Math.Between(4, 7) / 10);
      this.arrBgTop.push(bg);
    };

    this.addBGTop = () => {
      if (this.arrBgTop.length > 0) {
        let lastBG = this.arrBgTop[this.arrBgTop.length - 1];
        this.createBGTop(
          this.cameras.main.width / 2, 
          lastBG.y - this.bgCloudSize.height * Phaser.Math.Between(1, 3)
        );
      } else {
        this.createBGTop(this.cameras.main.width / 2, -this.bgCloudSize.height);
      }
    };

    this.addBGBottom();
    this.addBGTop();
  }

  createScore() {
    this.scoreValue = 0;

    this.scoreLabel = this.add
      .text(400, 50, "0", {
        fontSize: "80px",
        color: "#ffffff",
        fontFamily: "Arial",
      })
      .setOrigin(0.5);
    this.scoreLabel.setDepth(4);
    this.scoreLabel.setScale(0.5);
  }

  updateScore(amount) {
    this.scoreValue += amount;
    this.scoreLabel.setText(this.scoreValue.toString());
  }

  createHero() {
    const X_POSITION = {
      CENTER: this.cameras.main.width / 2,
      RIGHT: this.cameras.main.width,
    };
    const Y_POSITION = {
      BOTTOM: this.cameras.main.height,
    };

    this.heroShip = this.add.image(
      X_POSITION.CENTER,
      Y_POSITION.BOTTOM - 200,
      "Pesawat" + (this.selectedHero + 1)
    );
    this.heroShip.setDepth(4);
    this.heroShip.setScale(0.5);
  }

  createControls() {
    this.cursorKeyListener = this.input.keyboard.createCursorKeys();
    this.keyWASD = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });

    const X_POSITION = { RIGHT: this.cameras.main.width };
    const Y_POSITION = { BOTTOM: this.cameras.main.height };

    this.input.on("pointermove", (pointer) => {
      if (!this.gameOver) {
        let x = Phaser.Math.Clamp(pointer.x, 70, X_POSITION.RIGHT - 70);
        let y = Phaser.Math.Clamp(pointer.y, 70, Y_POSITION.BOTTOM - 70);
        let a = this.heroShip.x - x;
        let b = this.heroShip.y - y;
        let dur = Math.sqrt(a * a + b * b) * 0.8;
        this.tweens.add({ targets: this.heroShip, x: x, y: y, duration: dur });
      }
    });
  }

  createEnemies() {
    const Y_POSITION = { BOTTOM: this.cameras.main.height };

    this.points = [
      [
        new Phaser.Math.Vector2(-200, 100),
        new Phaser.Math.Vector2(250, 200),
        new Phaser.Math.Vector2(200, (Y_POSITION.BOTTOM + 200) / 2),
        new Phaser.Math.Vector2(200, Y_POSITION.BOTTOM + 200),
      ],
      [
        new Phaser.Math.Vector2(900, 100),
        new Phaser.Math.Vector2(550, 200),
        new Phaser.Math.Vector2(500, (Y_POSITION.BOTTOM + 200) / 2),
        new Phaser.Math.Vector2(500, Y_POSITION.BOTTOM + 200),
      ],
      [
        new Phaser.Math.Vector2(900, 100),
        new Phaser.Math.Vector2(550, 200),
        new Phaser.Math.Vector2(400, (Y_POSITION.BOTTOM + 200) / 2),
        new Phaser.Math.Vector2(0, Y_POSITION.BOTTOM + 200),
      ],
      [
        new Phaser.Math.Vector2(-200, 100),
        new Phaser.Math.Vector2(550, 200),
        new Phaser.Math.Vector2(650, (Y_POSITION.BOTTOM + 200) / 2),
        new Phaser.Math.Vector2(0, Y_POSITION.BOTTOM + 200),
      ],
    ];

    this.arrEnemies = [];
    const Enemy = new Phaser.Class({
      Extends: Phaser.GameObjects.Image,
      initialize: function Enemy(scene, idxPath) {
        Phaser.GameObjects.Image.call(
          this,
          scene,
          0,
          0,
          "Musuh" + Phaser.Math.Between(1, 3)
        );
        scene.add.existing(this);
        this.setDepth(4);
        this.setScale(0.25);
        this.curve = new Phaser.Curves.Spline(scene.points[idxPath]);
        this.path = { t: 0, vec: new Phaser.Math.Vector2() };
        this.curve.getPoint(this.path.t, this.path.vec);
        this.setPosition(this.path.vec.x, this.path.vec.y);
        scene.tweens.add({
          targets: this.path,
          t: 1,
          duration: 3000,
          onUpdate: () => {
            this.curve.getPoint(this.path.t, this.path.vec);
            this.setPosition(this.path.vec.x, this.path.vec.y);
          },
          onComplete: () => {
            this.setActive(false);
            this.setVisible(false);
            scene.arrEnemies = scene.arrEnemies.filter((e) => e !== this);
          },
        });
      },
    });

    this.enemySpawnTimer = this.time.addEvent({
      delay: 250,
      callback: function () {
        if (!this.gameOver && this.arrEnemies.length < 3) {
          const enemy = new Enemy(
            this,
            Phaser.Math.Between(0, this.points.length - 1)
          );
          this.arrEnemies.push(enemy);
        }
      },
      callbackScope: this,
      loop: true,
    });
  }

  createBullets() {
    this.arrBullets = [];
    const Bullet = new Phaser.Class({
      Extends: Phaser.GameObjects.Image,
      initialize: function Bullet(scene, x, y) {
        Phaser.GameObjects.Image.call(this, scene, x, y, "Peluru");
        scene.add.existing(this);
        this.setDepth(3);
        this.setScale(0.5);
        this.speed = Phaser.Math.GetSpeed(500, 1);
      },
      move: function (delta) {
        this.y -= this.speed * delta;
        if (this.y < -50) this.setActive(false).setVisible(false);
      },
    });

    this.bulletSpawnTimer = this.time.addEvent({
      delay: 450,
      callback: function () {
        if (!this.gameOver) {
          const bullet = new Bullet(
            this,
            this.heroShip.x,
            this.heroShip.y - 30
          );
          this.children.add(bullet);
          this.arrBullets.push(bullet);
          this.sound.play("snd_shoot", { volume: 0.5 });
        }
      },
      callbackScope: this,
      loop: true,
    });
  }

  createExplosions() {
    const partikel = this.add.particles("EfekLedakan");
    partikel.setDepth(4);
    this.emmiterExplode1 = partikel.createEmitter({
      speed: { min: -800, max: 800 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.8, end: 0 },
      blendMode: "SCREEN",
      lifespan: 200,
      tint: 0xffa500,
      on: false,
    });

    this.sndShoot = this.sound.add("snd_shoot");
    this.sndExplode = this.sound.add("snd_explode");
  }

  update() {
    if (!this.gameOver) {
      this.updateBackground();
      this.updateHeroControls();
      this.updateBullets();
      this.checkCollisions();
    }
  }

  updateBackground() {
    this.arrBgBottom.forEach((bg, i) => {
      bg.y += bg.getData("kecepatan");
      if (bg.y > this.cameras.main.height + this.bgBottomSize.height / 2) {
        this.addBGBottom();
        bg.destroy();
        this.arrBgBottom.splice(i, 1);
      }
    });

    this.arrBgTop.forEach((bg, i) => {
      bg.y += bg.getData("kecepatan");
      if (bg.y > this.cameras.main.height + this.bgCloudSize.height / 2) {
        bg.destroy();
        this.arrBgTop.splice(i, 1);
        this.addBGTop();
      }
    });
  }

  updateHeroControls() {
    const X_POSITION = { RIGHT: this.cameras.main.width };
    const Y_POSITION = { BOTTOM: this.cameras.main.height };

    const speed = 7;
    if (
      (this.cursorKeyListener.left.isDown || this.keyWASD.left.isDown) &&
      this.heroShip.x > 70
    )
      this.heroShip.x -= speed;
    if (
      (this.cursorKeyListener.right.isDown || this.keyWASD.right.isDown) &&
      this.heroShip.x < X_POSITION.RIGHT - 70
    )
      this.heroShip.x += speed;
    if (
      (this.cursorKeyListener.up.isDown || this.keyWASD.up.isDown) &&
      this.heroShip.y > 70
    )
      this.heroShip.y -= speed;
    if (
      (this.cursorKeyListener.down.isDown || this.keyWASD.down.isDown) &&
      this.heroShip.y < Y_POSITION.BOTTOM - 70
    )
      this.heroShip.y += speed;
  }

  updateBullets() {
    for (let i = this.arrBullets.length - 1; i >= 0; i--) {
      const bullet = this.arrBullets[i];
      if (!bullet.active) {
        bullet.destroy();
        this.arrBullets.splice(i, 1);
      } else {
        bullet.move(this.game.loop.delta);
      }
    }
  }

  checkCollisions() {
    for (let i = 0; i < this.arrEnemies.length; i++) {
      for (let j = 0; j < this.arrBullets.length; j++) {
        if (
          this.arrEnemies[i] &&
          this.arrBullets[j] &&
          this.arrEnemies[i].active &&
          this.arrBullets[j].active &&
          this.arrEnemies[i]
            .getBounds()
            .contains(this.arrBullets[j].x, this.arrBullets[j].y)
        ) {
          this.arrEnemies[i].setActive(false);
          this.arrBullets[j].setActive(false);
          this.updateScore(1); // Use updateScore method for consistency
          this.emmiterExplode1.setPosition(
            this.arrBullets[j].x,
            this.arrBullets[j].y
          );
          this.emmiterExplode1.explode();
          this.sound.play("snd_explode", { volume: 0.5 });
          this.arrEnemies[i].destroy();
          this.arrEnemies.splice(i, 1);
          break;
        }
      }
    }

    for (let i = 0; i < this.arrEnemies.length; i++) {
      if (
        this.arrEnemies[i] &&
        this.arrEnemies[i].active &&
        this.heroShip.active &&
        Phaser.Geom.Intersects.RectangleToRectangle(
          this.heroShip.getBounds(),
          this.arrEnemies[i].getBounds()
        )
      ) {
        this.emmiterExplode1.setPosition(this.heroShip.x, this.heroShip.y);
        this.emmiterExplode1.explode();
        this.sound.play("snd_explode", { volume: 0.5 });
        this.heroShip.setActive(false).setVisible(false);
        this.arrEnemies[i].setActive(false).setVisible(false);

        this.gameOver = true;

        if (this.enemySpawnTimer) this.enemySpawnTimer.destroy();
        if (this.bulletSpawnTimer) this.bulletSpawnTimer.destroy();

        this.sound.stopAll();

        this.time.delayedCall(500, () => {
          const highScore = parseInt(localStorage.getItem("highScore")) || 0;
          const currentScore = parseInt(localStorage.getItem("currentScore")) || 0;
          if (this.scoreValue > highScore) {
            localStorage.setItem("highScore", this.scoreValue);
          }
          localStorage.setItem("currentScore", this.scoreValue);
          this.scene.start("sceneGameOver");
        });
        break;
      }
    }
  }
}
