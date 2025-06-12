class ScenePilihHero extends Phaser.Scene {
  constructor() {
    super({ key: "scenePilihHero" });
  }

  preload() {
    this.load.setBaseURL("assets/");
    this.load.image("BGPilihPesawat", "images/BGPilihPesawat.png");
    this.load.image("ButtonMenu", "images/ButtonMenu.png");
    this.load.image("ButtonNext", "images/ButtonNext.png");
    this.load.image("ButtonPrev", "images/ButtonPrev.png");
    this.load.image("ButtonSoundOn", "images/ButtonSoundOn.png");
    this.load.image("ButtonSoundOff", "images/ButtonSoundOff.png");
    this.load.image("Pesawat1", "images/Pesawat1.png");
    this.load.image("Pesawat2", "images/Pesawat2.png");
    this.load.audio("snd_shoot", "audio/fx_shoot.mp3");
    this.load.audio("snd_explode", "audio/fx_explode.mp3");
    this.load.audio("snd_touchshooter", "audio/fx_touch.mp3");
  }

  create() {
    const X = this.game.canvas.width / 2;
    const Y = this.game.canvas.height / 2;

    this.add.image(0, 0, "BGPilihPesawat").setOrigin(0, 0);

    this.ButtonMenu = this.add.image(X_POSITION.LEFT + 70, Y_POSITION.TOP + 120, "ButtonMenu").setInteractive();
    this.ButtonNext = this.add.image(X + 200, Y, "ButtonNext").setInteractive();
    this.ButtonPrevious = this.add.image(X - 200, Y, "ButtonPrev").setInteractive();
    this.heroShip = this.add.image(X, Y, "Pesawat" + (currentHero + 1)).setInteractive();

    this.input.on("gameobjectover", (_, gameObject) => {
      if ([this.ButtonMenu, this.ButtonNext, this.ButtonPrevious, this.heroShip].includes(gameObject)) {
        gameObject.setTint(0x999999);
      }
    });

    this.input.on("gameobjectdown", (_, gameObject) => {
      if ([this.ButtonMenu, this.ButtonNext, this.ButtonPrevious, this.heroShip].includes(gameObject)) {
        gameObject.setTint(0x999999);
      }
    });

    this.input.on("gameobjectout", (_, gameObject) => {
      if ([this.ButtonMenu, this.ButtonNext, this.ButtonPrevious, this.heroShip].includes(gameObject)) {
        gameObject.clearTint();
      }
    });

    this.input.on("gameobjectup", (_, gameObject) => {
      gameObject.clearTint();
      this.sound.play("snd_touchshooter", { volume: 0.5 });

      if (gameObject === this.ButtonMenu) {
        this.scene.start("sceneMenu");
      }

      if (gameObject === this.ButtonNext) {
        currentHero = (currentHero + 1) % countHero;
        this.heroShip.setTexture("Pesawat" + (currentHero + 1));
      }

      if (gameObject === this.ButtonPrevious) {
        currentHero = (currentHero - 1 + countHero) % countHero;
        this.heroShip.setTexture("Pesawat" + (currentHero + 1));
      }

      if (gameObject === this.heroShip) {
        this.scene.start("scenePlay", { selectedHero: currentHero });
      }
    });
  }

  update() {}
}
