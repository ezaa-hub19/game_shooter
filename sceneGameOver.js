class SceneGameOver extends Phaser.Scene {
  constructor() {
    super({ key: "sceneGameOver" });
  }

  init(data) {
    this.currentScore = parseInt(localStorage.getItem("currentScore")) || 0;
    this.highScore = parseInt(localStorage.getItem("highScore")) || 0;

    if (this.currentScore > this.highScore) {
      this.highScore = this.currentScore;
      localStorage.setItem("highScore", this.highScore);
    }
  }

  preload() {
    this.load.setBaseURL("assets/");
    this.load.image("BGPlay", "images/BGPlay.png");
    this.load.image("ButtonPlay", "images/ButtonPlay.png");
    this.load.image("ButtonMenu", "images/ButtonMenu.png");
    this.load.audio("snd_gameover", "audio/music_gameover.mp3");
    this.load.audio("snd_touchshooter", "audio/fx_touch.mp3");
  }

  create() {
    this.add.image(0, 0, "BGPlay").setOrigin(0, 0);

    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // Background untuk GAME OVER
    const gameOverBg = this.add.graphics();
    gameOverBg.fillStyle(0x000000, 0.7); // hitam dengan transparansi 70%
    gameOverBg.fillRoundedRect(centerX - 270, centerY - 310, 530, 110, 15);

    // GAME OVER text dengan efek
    const gameOverText = this.add.text(centerX, centerY - 260, "GAME OVER😔", {
      fontSize: "80px",
      color: "#ff0000",
      fontFamily: "Impact",
      stroke: "#ffffff",
      strokeThickness: 4,
      shadow: {
        offsetX: 3,
        offsetY: 3,
        color: "#fcfffc",
        blur: 8,
        fill: true
      }
    }).setOrigin(0.5);

    // Animasi pulse untuk GAME OVER
    this.tweens.add({
      targets: gameOverText,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 1300,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Background untuk Score
    const scoreBg = this.add.graphics();
    scoreBg.fillStyle(0x1a1a1a, 0.8); // abu gelap dengan transparansi 80%
    scoreBg.fillRoundedRect(centerX - 200, centerY - 165, 400, 70, 10);

    // Score text dengan glow effect
    this.add.text(centerX, centerY - 135, `Score : ${this.currentScore}`, {
      fontSize: "48px",
      color: "#ffffff",
      fontFamily: "Cooper Black",
      stroke: "#00ffff",
      strokeThickness: 3,
      shadow: {
        offsetX: 0,
        offsetY: 0,
        color: "#00ffff",
        blur: 10,
        fill: true
      }
    }).setOrigin(0.5);

    // Background untuk High Score
    const highScoreBg = this.add.graphics();
    highScoreBg.fillStyle(0x4a4a00, 0.8); // kuning gelap dengan transparansi 80%
    highScoreBg.fillRoundedRect(centerX - 220, centerY - 80, 440, 70, 10);

    // High Score text dengan gradient effect
    this.add.text(centerX, centerY - 50, `High Score : ${this.highScore}`, {
      fontSize: "44px",
      fontFamily: "Cosmic",
      fill: ['#ffff00', '#ffd700', '#ff8c00'], // gradient kuning ke orange
      stroke: "#4e44fd",
      strokeThickness: 3,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: "#4e44fd",
        blur: 5,
        fill: true
      }
    }).setOrigin(0.5);

    this.buttonPlay = this.add.image(centerX, centerY + 200, "ButtonPlay").setInteractive();
    this.buttonMenu = this.add.image(X_POSITION.LEFT + 70, Y_POSITION.TOP + 120, "ButtonMenu").setInteractive();

    this.gameOverMusic = this.sound.add("snd_gameover", { volume: 0.5, loop: false });
    if (!this.gameOverMusic.isPlaying) this.gameOverMusic.play();

    this.input.on("gameobjectover", (_, go) => go.setTint(0x999999));
    this.input.on("gameobjectdown", (_, go) => go.setTint(0x999999));
    this.input.on("gameobjectout", (_, go) => go.clearTint());

    this.input.on("gameobjectup", (_, go) => {
      go.clearTint();
      this.sound.play("snd_touchshooter", { volume: 0.5 });
      if (this.gameOverMusic.isPlaying) this.gameOverMusic.stop();

      if (go === this.buttonPlay) {
        this.scene.start("scenePlay");
      } else if (go === this.buttonMenu) {
        this.scene.start("sceneMenu");
      }
    });
  }

  update() {}
}