import Phaser from "phaser";
import { audio } from "./audio";
import { Boss } from "./Boss";
import { Enemy } from "./Enemy";
import { FlyingBug } from "./FlyingBug";
import { Familiar } from "./Familiar";
import { NutEnemy } from "./NutEnemy";
import { Player } from "./Player";
import { Projectile } from "./Projectile";
import { useGameStore } from "../store/gameStore";
import {
  BOSS_MAX_HP,
  BOSS_PHASE_TWO_TITLE,
  GAME_HEIGHT,
  GAME_WIDTH,
  GROUND_Y,
  SUMMON_MAX_HP
} from "./constants";

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private playerVisual!: Phaser.GameObjects.Sprite;
  private familiar!: Familiar;
  private boss!: Boss;
  private bossVisual!: Phaser.GameObjects.Sprite;
  private enemies: Enemy[] = [];
  private enemyVisuals = new Map<Enemy, Phaser.GameObjects.Sprite>();
  private projectiles!: Phaser.GameObjects.Group;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private ground!: Phaser.Physics.Arcade.StaticGroup;
  private bossTriggered = false;
  private victoryHandled = false;
  private gameOverHandled = false;
  private hitStopActive = false;
  private goldTreeGlow!: Phaser.GameObjects.Arc;
  private fogLayers: Phaser.GameObjects.Rectangle[] = [];
  private store = useGameStore;
  private lastArrowTrailAt = 0;
  private ultimateOverlay?: Phaser.GameObjects.Container;

  constructor() {
    super("GameScene");
  }

  preload() {
    this.load.image("goldenRuinsBg", "images/golden-ruins-bg.png");
    this.load.image("ultimateCg", "summoner/ultimate-cg-raw.png");
    this.load.spritesheet("summonerArt", "summoner/summoner-sheet.png", { frameWidth: 410, frameHeight: 705 });
    this.load.spritesheet("hamsterArt", "summoner/hamster-sheet.png", { frameWidth: 410, frameHeight: 579 });
    this.load.spritesheet("enemyArt", "sprites/enemy-normalized.png", { frameWidth: 410, frameHeight: 772 });
    this.load.spritesheet("bossArt", "sprites/boss-normalized.png", { frameWidth: 410, frameHeight: 772 });
    this.load.image("bugEnemy", "enemies/bug-enemy.png");
    this.load.image("nutEnemy", "enemies/nut-enemy.png");
    this.makeTextures();
  }

  create() {
    this.createBackdrop();
    this.createVisualAnimations();
    this.physics.world.setBounds(0, 0, 3200, GAME_HEIGHT);
    this.cameras.main.setBounds(0, 0, 3200, GAME_HEIGHT);

    this.ground = this.physics.add.staticGroup();
    this.createTerrain();

    this.player = new Player(this, 160, 520);
    this.player.setAlpha(0.01);
    this.physics.add.collider(this.player, this.ground);
    this.playerVisual = this.add.sprite(this.player.x, this.player.y, "summonerArt", 0).setDepth(2.6).setScale(0.27);

    this.familiar = new Familiar(this, this.player.x + 70, this.player.y + 8);
    this.familiar.setScale(0.16);
    this.physics.add.collider(this.familiar, this.ground);

    this.spawnEnemies();
    this.boss = new Boss(this, 2860, 478);
    this.boss.setAlpha(0.01);
    this.physics.add.collider(this.boss, this.ground);
    this.bossVisual = this.add.sprite(this.boss.x, this.boss.y, "bossArt", 0).setDepth(2.65).setScale(0.38).setVisible(false);

    this.projectiles = this.add.group({ classType: Projectile, runChildUpdate: false });
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12, -180, 0);
    this.input.mouse?.disableContextMenu();

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keys = {
      a: this.input.keyboard!.addKey("A"),
      d: this.input.keyboard!.addKey("D"),
      w: this.input.keyboard!.addKey("W"),
      space: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      shift: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
      j: this.input.keyboard!.addKey("J"),
      k: this.input.keyboard!.addKey("K"),
      l: this.input.keyboard!.addKey("L"),
      q: this.input.keyboard!.addKey("Q"),
      r: this.input.keyboard!.addKey("R"),
      f: this.input.keyboard!.addKey("F"),
      i: this.input.keyboard!.addKey("I"),
      e: this.input.keyboard!.addKey("E"),
      esc: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
      p: this.input.keyboard!.addKey("P")
    };

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (this.store.getState().screen !== "playing") return;
      if (pointer.leftButtonDown()) this.tryBasicCast();
      if (pointer.rightButtonDown()) this.tryHeavyCast();
    });

    this.syncStore();
  }

  private makeTextures() {
    const g = this.add.graphics();

    g.clear();
    g.fillStyle(0xf4a7e4, 0.95);
    g.fillStyle(0xffd8f6, 0.95);
    g.fillCircle(15, 15, 12);
    g.fillStyle(0xff68d0, 0.35);
    g.fillCircle(15, 15, 18);
    g.lineStyle(2, 0xfff2ff, 0.86);
    g.strokeCircle(15, 15, 12);
    g.generateTexture("magicBolt", 36, 36);

    g.clear();
    g.fillStyle(0xff82d3, 0.94);
    g.fillEllipse(26, 18, 50, 28);
    g.fillStyle(0xff2fb8, 0.28);
    g.fillEllipse(26, 18, 62, 38);
    g.lineStyle(3, 0xfff2ff, 0.85);
    g.strokeEllipse(26, 18, 50, 28);
    g.generateTexture("heavyBolt", 64, 42);

    g.clear();
    g.fillStyle(0xfbc3eb, 0.96);
    g.fillCircle(10, 10, 8);
    g.lineStyle(2, 0xffffff, 0.8);
    g.strokeCircle(10, 10, 8);
    g.generateTexture("hamsterBolt", 20, 20);

    g.clear();
    g.fillStyle(0xffffff, 0.9);
    g.fillTriangle(2, 14, 74, 0, 108, 14);
    g.fillStyle(0xffa8e7, 0.65);
    g.fillTriangle(18, 14, 74, 4, 104, 14);
    g.generateTexture("spellArc", 110, 24);

    g.destroy();
  }

  private createBackdrop() {
    this.add.rectangle(1600, 360, 3200, GAME_HEIGHT, 0x090b12).setScrollFactor(0);
    this.add.image(1600, 330, "goldenRuinsBg").setDisplaySize(3260, 860).setAlpha(0.52).setScrollFactor(0.16);
    this.add.rectangle(1600, 146, 3200, 220, 0x17141c, 0.46).setScrollFactor(0);
    this.goldTreeGlow = this.add.circle(1040, 118, 220, 0xdebe66, 0.26).setScrollFactor(0.24);
    this.add.rectangle(1010, 312, 22, 420, 0x8d7130, 0.65).setScrollFactor(0.3);

    for (let i = 0; i < 8; i += 1) {
      this.add.ellipse(860 + i * 42, 166 + (i % 3) * 16, 240, 78, 0xd6ba68, 0.13).setScrollFactor(0.28);
    }
    for (let i = 0; i < 8; i += 1) {
      this.add.rectangle(160 + i * 390, 488 - (i % 2) * 60, 148, 240, 0x242631, 0.9).setOrigin(0.5, 1).setScrollFactor(0.48);
      this.add.rectangle(130 + i * 390, 520, 30, 118, 0x38241f, 0.55).setOrigin(0.5, 1).setRotation(-0.18).setScrollFactor(0.6);
    }
    for (let i = 0; i < 8; i += 1) {
      this.add.triangle(160 + i * 380, 622, 0, 0, 56, -156, 110, 0, 0x42261d, 0.62).setOrigin(0.5, 1).setScrollFactor(0.72);
    }
    this.fogLayers = [
      this.add.rectangle(1200, 554, 2600, 82, 0x9f8a65, 0.08).setScrollFactor(0.82),
      this.add.rectangle(1880, 596, 2300, 54, 0xffffff, 0.05).setScrollFactor(0.92)
    ];
  }

  private createTerrain() {
    this.addGroundSegment(170, 620, 360, 118, 0x36291f);
    this.addGroundSegment(520, 632, 310, 106, 0x2b241f);
    this.addGroundSegment(845, 610, 360, 128, 0x3b3025);
    this.addGroundSegment(1210, 628, 380, 110, 0x30261f);
    this.addGroundSegment(1580, 604, 360, 136, 0x3f3122);
    this.addGroundSegment(1950, 622, 420, 118, 0x30251e);
    this.addGroundSegment(2370, 604, 420, 136, 0x3a2d23);
    this.addGroundSegment(2810, 622, 520, 118, 0x30251e);
    this.addGroundSegment(3160, 636, 220, 104, 0x2b221c);

    this.addPlatform(405, 548, 190, 0x6b5943);
    this.addPlatform(735, 500, 150, 0x705c43);
    this.addPlatform(1040, 536, 210, 0x604e3e);
    this.addPlatform(1405, 476, 240, 0x755f43);
    this.addPlatform(1708, 538, 170, 0x62503d);
    this.addPlatform(2050, 500, 190, 0x705a3f);
    this.addPlatform(2325, 462, 180, 0x6d573e);
    this.addPlatform(2590, 530, 230, 0x705f45);

    for (let i = 0; i < 19; i += 1) {
      const x = 70 + i * 168;
      const top = 606 + Math.sin(i * 1.7) * 16;
      this.add.rectangle(x, top + 8, Phaser.Math.Between(34, 86), Phaser.Math.Between(8, 16), 0x7e674b, 0.35)
        .setOrigin(0.5, 0)
        .setRotation(Phaser.Math.FloatBetween(-0.08, 0.08))
        .setDepth(0.8);
    }

    for (let i = 0; i < 10; i += 1) {
      const x = 310 + i * 285;
      this.add.rectangle(x, 598, 18, Phaser.Math.Between(68, 120), 0x17161b, 0.48)
        .setOrigin(0.5, 1)
        .setDepth(0.7);
      this.add.rectangle(x, 588, 62, 14, 0x5c4a38, 0.75)
        .setRotation(Phaser.Math.FloatBetween(-0.12, 0.12))
        .setDepth(0.9);
    }
  }

  private addGroundSegment(x: number, top: number, width: number, height: number, color: number) {
    const body = this.add.rectangle(x, top + height / 2, width, height, color).setOrigin(0.5);
    this.physics.add.existing(body, true);
    this.ground.add(body as unknown as Phaser.Physics.Arcade.Sprite);

    this.add.rectangle(x, top + 8, width, 16, 0x7b6548, 0.9).setOrigin(0.5).setDepth(0.9);
    this.add.rectangle(x, top + 24, width, 8, 0x15151a, 0.24).setOrigin(0.5).setDepth(0.91);
    const capCount = Math.max(2, Math.floor(width / 86));
    for (let i = 0; i < capCount; i += 1) {
      const slabX = x - width / 2 + 38 + i * (width - 76) / Math.max(1, capCount - 1);
      this.add.rectangle(slabX, top + 4, Phaser.Math.Between(42, 72), 7, 0xc1a265, 0.18)
        .setOrigin(0.5)
        .setDepth(1);
    }
  }

  private createVisualAnimations() {
    this.anims.create({
      key: "summoner-idle",
      frames: [{ key: "summonerArt", frame: 0 }],
      frameRate: 2,
      repeat: -1
    });
    this.anims.create({
      key: "summoner-run",
      frames: [{ key: "summonerArt", frame: 1 }],
      frameRate: 7,
      repeat: -1
    });
    this.anims.create({
      key: "hamster-idle",
      frames: [{ key: "hamsterArt", frame: 0 }, { key: "hamsterArt", frame: 4 }],
      frameRate: 3,
      repeat: -1
    });
    this.anims.create({
      key: "hamster-run",
      frames: [{ key: "hamsterArt", frame: 1 }, { key: "hamsterArt", frame: 3 }],
      frameRate: 7,
      repeat: -1
    });
    this.anims.create({
      key: "enemy-idle",
      frames: [{ key: "enemyArt", frame: 0 }, { key: "enemyArt", frame: 1 }],
      frameRate: 3,
      repeat: -1
    });
    this.anims.create({
      key: "boss-idle",
      frames: [{ key: "bossArt", frame: 0 }, { key: "bossArt", frame: 1 }],
      frameRate: 3,
      repeat: -1
    });
  }

  private playIfNeeded(target: Phaser.GameObjects.Sprite, key: string) {
    if (target.anims.currentAnim?.key === key && target.anims.isPlaying) return;
    target.play(key, true);
  }

  private addPlatform(x: number, y: number, width: number, color = 0x54463d) {
    const platform = this.add.rectangle(x, y, width, 24, color);
    this.physics.add.existing(platform, true);
    this.ground.add(platform as unknown as Phaser.Physics.Arcade.Sprite);
    this.add.rectangle(x, y - 13, width + 10, 10, 0xb99b62, 0.6).setDepth(1.1);
    this.add.rectangle(x, y + 12, width - 18, 18, 0x17151a, 0.34).setDepth(1);
  }

  private spawnEnemies() {
    const positions: Array<{ x: number; y: number; kind: "grunt" | "bug" | "nut" }> = [
      { x: 520, y: 500, kind: "grunt" },
      { x: 760, y: 500, kind: "bug" },
      { x: 1050, y: 460, kind: "nut" },
      { x: 1340, y: 430, kind: "grunt" },
      { x: 1660, y: 430, kind: "bug" },
      { x: 1985, y: 570, kind: "nut" },
      { x: 2255, y: 420, kind: "grunt" },
      { x: 2520, y: 380, kind: "bug" }
    ];
    this.enemies = positions.map((pos) => {
      const enemy =
        pos.kind === "bug"
          ? new FlyingBug(this, pos.x, pos.y)
          : pos.kind === "nut"
            ? new NutEnemy(this, pos.x, pos.y)
            : new Enemy(this, pos.x, pos.y);
      enemy.setAlpha(0.01);
      if (!(enemy instanceof FlyingBug)) {
        this.physics.add.collider(enemy, this.ground);
      }
      const visualKey = enemy instanceof FlyingBug ? "bugEnemy" : enemy instanceof NutEnemy ? "nutEnemy" : "enemyArt";
      const visualScale = enemy instanceof FlyingBug ? 0.078 : enemy instanceof NutEnemy ? 0.082 : 0.22;
      const visual = this.add.sprite(pos.x, pos.y, visualKey, 0).setDepth(2.55).setScale(visualScale);
      this.enemyVisuals.set(enemy, visual);
      return enemy;
    });
  }

  update(_time: number, delta: number) {
    if (this.hitStopActive) return;
    const screen = this.store.getState().screen;
    if (screen !== "playing") return;

    const now = this.time.now;
    this.handleInput(now);
    this.player.updateStamina(delta);
    this.updateFamiliar(now);
    this.updateCharacterPoses(now);
    this.updateAtmosphere(now);

    this.enemies.forEach((enemy) => enemy.update(this.player.x, now));
    this.processPlayerStomps();
    this.processEnemyAttacks(now);
    this.processBoss(now);
    this.processProjectiles(now);
    this.checkBossTrigger();
    this.syncStore();
    this.updatePhaseVisuals();

    if (!this.player.alive && !this.gameOverHandled) {
      audio.play("death");
      this.gameOverHandled = true;
      this.time.delayedCall(700, () => this.store.getState().setScreen("gameover"));
    }
    if (this.bossTriggered && !this.boss.alive && !this.victoryHandled) {
      audio.play("victory");
      this.victoryHandled = true;
      this.store.getState().setBossState(true, 0, BOSS_PHASE_TWO_TITLE);
      this.time.delayedCall(1200, () => this.store.getState().setScreen("victory"));
    }
  }

  private handleInput(now: number) {
    if (Phaser.Input.Keyboard.JustDown(this.keys.esc) || Phaser.Input.Keyboard.JustDown(this.keys.p)) {
      this.store.getState().setScreen("paused");
      return;
    }
    const left = this.keys.a.isDown || this.cursors.left.isDown;
    const right = this.keys.d.isDown || this.cursors.right.isDown;
    const dir = left === right ? 0 : left ? -1 : 1;
    const previousFacing = this.player.facing;
    this.player.move(dir as -1 | 0 | 1);
    if (dir !== 0 && previousFacing !== this.player.facing) {
      this.spawnTurnDust(this.player.x - this.player.facing * 18, this.player.y + 34, -this.player.facing as -1 | 1);
    }

    if (
      Phaser.Input.Keyboard.JustDown(this.keys.w) ||
      Phaser.Input.Keyboard.JustDown(this.keys.space) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.up)
    ) {
      this.player.jump();
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.shift)) {
      if (this.player.dodge()) audio.play("dodge");
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.j)) {
      this.tryBasicCast();
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.k)) {
      this.tryHeavyCast();
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.l) || Phaser.Input.Keyboard.JustDown(this.keys.q)) {
      this.recallFamiliar();
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.r) || Phaser.Input.Keyboard.JustDown(this.keys.f)) {
      this.tryUltimate(now);
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.i) || Phaser.Input.Keyboard.JustDown(this.keys.e)) {
      this.player.drinkPotion();
    }
  }

  private tryBasicCast() {
    const profile = this.player.castBasic();
    if (!profile) return;
    audio.play("attack");
    this.showSpellCastFx(false);
    this.cameras.main.shake(45, 0.002);
    this.time.delayedCall(55, () => this.spawnPlayerBolt(profile.damage, profile.speed, false));
  }

  private tryHeavyCast() {
    const profile = this.player.castHeavy();
    if (!profile) return;
    audio.play("attack");
    this.showSpellCastFx(true);
    this.cameras.main.shake(75, 0.0035);
    this.time.delayedCall(135, () => this.spawnPlayerBolt(profile.damage, profile.speed, true));
  }

  private tryUltimate(now: number) {
    if (!this.player.castUltimate()) return;
    this.physics.world.pause();
    this.showUltimateCg();
    if (!this.familiar.alive) {
      this.familiar.restore();
      this.familiar.recall(this.player.x + this.player.facing * 48, this.player.y + 8);
    } else {
      this.familiar.hp = SUMMON_MAX_HP;
    }
    this.player.invulnerableUntil = now + 1700;
    audio.play("phase_two");
    this.time.delayedCall(1050, () => {
      this.physics.world.resume();
      this.destroyUltimateCg();
    });
  }

  private recallFamiliar() {
    if (!this.familiar.alive) return;
    this.familiar.recall(this.player.x + this.player.facing * 48, this.player.y + 8);
  }

  private showSpellCastFx(heavy: boolean) {
    const fx = this.add
      .image(this.player.x + this.player.facing * 54, this.player.y - 12, "spellArc")
      .setFlipX(this.player.facing < 0)
      .setDepth(3)
      .setTint(heavy ? 0xff96e3 : 0xffd6f5)
      .setAlpha(0.9);
    fx.setScale(heavy ? 1.35 : 1, heavy ? 1.2 : 1);
    this.tweens.add({
      targets: fx,
      x: fx.x + this.player.facing * (heavy ? 54 : 32),
      alpha: 0,
      scaleX: heavy ? 1.8 : 1.3,
      scaleY: heavy ? 1.6 : 1.1,
      duration: heavy ? 260 : 130,
      onComplete: () => fx.destroy()
    });
  }

  private spawnPlayerBolt(damage: number, speed: number, heavy: boolean) {
    const key = heavy ? "heavyBolt" : "magicBolt";
    const bolt = new Projectile(this, this.player.x + this.player.facing * 70, this.player.y - 20);
    bolt.setTexture(key);
    bolt.damage = damage;
    bolt.owner = "player";
    bolt.heavy = heavy;
    bolt.bornAt = this.time.now;
    bolt.setVelocityX(this.player.facing * speed);
    bolt.setScale(heavy ? 1.18 : 1);
    bolt.setTint(heavy ? 0xff9fe7 : 0xffd2f5);
    bolt.setBlendMode(Phaser.BlendModes.ADD);
    const body = bolt.body as Phaser.Physics.Arcade.Body;
    body.setSize(heavy ? 50 : 30, heavy ? 18 : 12);
    this.projectiles.add(bolt);

    const flash = this.add.circle(this.player.x + this.player.facing * 58, this.player.y - 18, heavy ? 24 : 16, 0xffb4ef, 0.8)
      .setDepth(3.2)
      .setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      scale: heavy ? 2.2 : 1.8,
      duration: heavy ? 180 : 110,
      onComplete: () => flash.destroy()
    });
  }

  private spawnFamiliarBolt(targetX: number, targetY: number) {
    if (!this.familiar.alive) return;
    const dirX = targetX - this.familiar.x;
    const dirY = targetY - this.familiar.y;
    const len = Math.max(1, Math.hypot(dirX, dirY));
    const speed = this.player.isEmpowered ? 540 : 460;
    const bolt = new Projectile(this, this.familiar.x, this.familiar.y - 10);
    bolt.setTexture("hamsterBolt");
    bolt.damage = this.player.isEmpowered ? 14 : 9;
    bolt.owner = "familiar";
    bolt.bornAt = this.time.now;
    bolt.setVelocity((dirX / len) * speed, (dirY / len) * speed);
    bolt.setTint(0xffd1f7);
    this.projectiles.add(bolt);
    audio.play("arrow");
  }

  private spawnTurnDust(x: number, y: number, dir: -1 | 1) {
    for (let i = 0; i < 4; i += 1) {
      const dust = this.add.circle(x, y + Phaser.Math.Between(-6, 8), Phaser.Math.Between(3, 6), 0xd7b782, 0.32)
        .setDepth(1.4);
      this.tweens.add({
        targets: dust,
        x: x + dir * Phaser.Math.Between(22, 46),
        y: dust.y + Phaser.Math.Between(-8, 4),
        alpha: 0,
        scale: 0.3,
        duration: 190,
        onComplete: () => dust.destroy()
      });
    }
  }

  private updateFamiliar(now: number) {
    if (!this.familiar.alive) return;
    const target = this.pickNearestTarget(this.familiar.x, this.familiar.y, 520);
    const familiarBody = this.familiar.body as Phaser.Physics.Arcade.Body;
    if (target) {
      const dx = target.x - this.familiar.x;
      const dy = target.y - this.familiar.y;
      const dist = Math.hypot(dx, dy);
      this.familiar.setFlipX(dx < 0);
      if (dist > 84) {
        this.physics.moveTo(this.familiar, target.x, target.y - 8, this.familiar.moveSpeed);
      } else {
        familiarBody.setVelocity(0, 0);
      }
      if (now >= this.familiar.attackCooldownUntil && dist < 360) {
        this.familiar.attackCooldownUntil = now + (this.player.isEmpowered ? 420 : 620);
        this.spawnFamiliarBolt(target.x, target.y - 18);
      }
    } else {
      const anchorX = this.player.x + this.player.facing * 72;
      const anchorY = this.player.y + 10;
      const dx = anchorX - this.familiar.x;
      const dy = anchorY - this.familiar.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 20) {
        this.physics.moveTo(this.familiar, anchorX, anchorY, this.familiar.moveSpeed);
      } else {
        familiarBody.setVelocity(0, 0);
      }
      this.familiar.setFlipX(this.player.facing < 0);
    }
  }

  private pickNearestTarget(x: number, y: number, range: number) {
    let best: Enemy | Boss | null = null;
    let bestDist = range;
    this.enemies.forEach((enemy) => {
      if (!enemy.alive) return;
      const dist = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
      if (dist < bestDist) {
        best = enemy;
        bestDist = dist;
      }
    });
    if (this.bossTriggered && this.boss.alive) {
      const dist = Phaser.Math.Distance.Between(x, y, this.boss.x, this.boss.y);
      if (dist < bestDist) {
        best = this.boss;
      }
    }
    return best;
  }

  private processProjectiles(now: number) {
    this.projectiles.getChildren().forEach((child) => {
      const projectile = child as Projectile;
      if (!projectile.active) return;
      if (now - projectile.bornAt > 3000) {
        projectile.destroy();
        return;
      }
      if (projectile.owner !== "enemy" && now - this.lastArrowTrailAt > 55) {
        this.lastArrowTrailAt = now;
        const trail = this.add.rectangle(projectile.x, projectile.y, projectile.heavy ? 32 : 20, projectile.heavy ? 8 : 5, 0xffd7f3, 0.34)
          .setDepth(1)
          .setBlendMode(Phaser.BlendModes.ADD);
        this.tweens.add({
          targets: trail,
          alpha: 0,
          scaleX: 0.2,
          duration: 160,
          onComplete: () => trail.destroy()
        });
      }

      if (projectile.owner === "player" || projectile.owner === "familiar") {
        this.enemies.forEach((enemy) => {
          if (!enemy.alive || !projectile.active) return;
          if (Phaser.Geom.Intersects.RectangleToRectangle(projectile.getBounds(), this.bodyRect(enemy))) {
            const body = projectile.body as Phaser.Physics.Arcade.Body;
            enemy.takeDamage(projectile.damage, body.velocity.x > 0 ? 120 : -120);
            if (projectile.owner === "player") {
              this.player.gainEnergy(projectile.heavy ? 20 : 12);
            } else {
              this.player.gainEnergy(4);
            }
            projectile.destroy();
            this.spawnImpact(enemy.x, enemy.y - 8, 0xffd0f5);
          }
        });
        if (this.boss.alive && projectile.active && this.bossTriggered) {
          if (Phaser.Geom.Intersects.RectangleToRectangle(projectile.getBounds(), this.bodyRect(this.boss))) {
            const body = projectile.body as Phaser.Physics.Arcade.Body;
            this.boss.takeDamage(projectile.damage, body.velocity.x > 0 ? 100 : -100);
            if (projectile.owner === "player") {
              this.player.gainEnergy(projectile.heavy ? 18 : 10);
            } else {
              this.player.gainEnergy(3);
            }
            projectile.destroy();
            this.spawnImpact(this.boss.x, this.boss.y - 20, 0xffb8ec);
          }
        }
      }
    });
  }

  private bodyRect(target: Phaser.Physics.Arcade.Sprite | Phaser.Physics.Arcade.Image) {
    const body = target.body as Phaser.Physics.Arcade.Body;
    return new Phaser.Geom.Rectangle(body.x, body.y, body.width, body.height);
  }

  private processPlayerStomps() {
    if (!this.player.alive) return;
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    if (playerBody.velocity.y < 120) return;

    this.enemies.forEach((enemy) => {
      if (!(enemy instanceof NutEnemy) || !enemy.alive) return;
      const playerBounds = this.bodyRect(this.player);
      const enemyBounds = this.bodyRect(enemy);
      const descendingFromAbove = playerBounds.bottom <= enemyBounds.top + 28;
      if (!descendingFromAbove || !Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, enemyBounds)) return;

      if (enemy.stompBreak()) {
        this.player.setVelocityY(-620);
        this.player.gainEnergy(18);
        audio.play("hit");
        this.cameras.main.shake(130, 0.006);
        this.spawnImpact(enemy.x, enemy.y - 20, 0xf1d38a);
      }
    });
  }

  private processEnemyAttacks(now: number) {
    this.enemies.forEach((enemy) => {
      if (!enemy.wantsAttack(this.player.x, now)) return;
      enemy.markAttack(now);
      enemy.setVelocityX(0);
      const enemyVisual = this.enemyVisuals.get(enemy);
      if (enemyVisual) this.flashSprite(enemyVisual, 0xfff1a8, 180);
      const isBug = enemy instanceof FlyingBug;
      const isNut = enemy instanceof NutEnemy;
      const width = isBug ? 112 : isNut ? 78 : 92;
      const height = isBug ? 72 : isNut ? 52 : 54;
      this.showTelegraphZone(enemy.x + (this.player.x >= enemy.x ? 24 : -24), enemy.y - 4, width, height, 0xffd884, 220);
      this.time.delayedCall(220, () => {
        if (!enemy.alive || !this.player.alive) return;
        const reach = new Phaser.Geom.Rectangle(enemy.x - width / 2, enemy.y - height / 2, width, height);
        if (Phaser.Geom.Intersects.RectangleToRectangle(reach, this.bodyRect(this.player))) {
          const damage = isBug ? 10 : isNut ? 18 : 12;
          const hit = this.player.takeDamage(damage, this.player.x < enemy.x ? -260 : 260);
          if (hit) {
            audio.play("hit");
            this.cameras.main.shake(110, 0.006);
            this.spawnImpact(this.player.x, this.player.y - 10, 0xffd8e8);
          }
        }
        if (this.familiar.alive && Phaser.Geom.Intersects.RectangleToRectangle(reach, this.bodyRect(this.familiar))) {
          this.familiar.takeDamage(10, this.familiar.x < enemy.x ? -160 : 160);
        }
      });
    });
  }

  private processBoss(now: number) {
    if (!this.bossTriggered || !this.boss.alive) return;
    const bossBody = this.boss.body as Phaser.Physics.Arcade.Body;
    bossBody.setAllowGravity(true);

    if (!this.boss.phaseTwo && this.boss.hp <= BOSS_MAX_HP / 2) {
      this.boss.phaseTwo = true;
      this.store.getState().triggerPhaseTwo();
      this.store.getState().setBossState(true, this.boss.hp, BOSS_PHASE_TWO_TITLE);
      audio.play("phase_two");
      this.cameras.main.shake(340, 0.008);
      this.boss.setTint(0xe6bc52);
      this.time.delayedCall(900, () => this.boss.clearTint());
    }

    this.boss.updateFacing(this.player.x);
    const dx = this.player.x - this.boss.x;
    const distance = Math.abs(dx);
    if (now < this.boss.moveEndsAt) return;
    if (!this.boss.canChooseMove(now)) {
      if (bossBody.blocked.down) this.boss.setVelocityX(0);
      return;
    }
    const behind = Math.sign(dx) !== this.boss.lastPlayerSide && distance < 130;
    let move: Boss["activeMove"] = "sweep";
    if (this.boss.phaseTwo) {
      if (distance > 320) move = Phaser.Math.RND.pick(["doublecharge", "shockwave"]);
      else if (behind) move = "turnslash";
      else if (distance < 120) move = Phaser.Math.RND.pick(["trample", "slamcombo", "shockwave"]);
      else move = Phaser.Math.RND.pick(["sweep", "slamcombo"]);
    } else {
      if (distance > 360) move = "charge";
      else if (behind) move = "turnslash";
      else if (distance < 110) move = "trample";
      else move = "sweep";
    }
    this.executeBossMove(move, dx);
  }

  private executeBossMove(move: Boss["activeMove"], dx: number) {
    const dir = dx >= 0 ? 1 : -1;
    this.boss.activeMove = move;
    this.boss.moveStartedAt = this.time.now;
    switch (move) {
      case "sweep":
        this.boss.moveEndsAt = this.time.now + 950;
        this.boss.cooldownUntil = this.time.now + (this.boss.phaseTwo ? 1020 : 1320);
        this.flashSprite(this.bossVisual, 0xffd576, 220);
        this.showTelegraphZone(this.boss.x + dir * 68, this.boss.y - 40, 162, 92, 0xf0c569, 320, dir * 0.08);
        this.time.delayedCall(360, () => this.resolveBossHit(164, 86, 30, dir * 320));
        break;
      case "charge":
        this.boss.moveEndsAt = this.time.now + 1280;
        this.boss.cooldownUntil = this.time.now + 1520;
        audio.play("boss_roar");
        this.flashSprite(this.bossVisual, 0xffe29b, 320);
        this.showTelegraphZone(this.boss.x + dir * 140, this.boss.y - 6, 340, 104, 0xf0c569, 260);
        this.time.delayedCall(280, () => {
          this.boss.setVelocityX(dir * 560);
          this.time.delayedCall(380, () => this.resolveBossHit(190, 102, 36, dir * 410));
          this.time.delayedCall(540, () => this.boss.setVelocityX(0));
        });
        break;
      case "trample":
        this.boss.moveEndsAt = this.time.now + 860;
        this.boss.cooldownUntil = this.time.now + 1160;
        this.flashSprite(this.bossVisual, 0xffd576, 180);
        this.showTelegraphZone(this.boss.x + dir * 24, this.boss.y + 12, 132, 102, 0xf0c569, 220);
        this.time.delayedCall(260, () => this.resolveBossHit(132, 102, 28, dir * 290));
        break;
      case "turnslash":
        this.boss.moveEndsAt = this.time.now + 720;
        this.boss.cooldownUntil = this.time.now + 1040;
        this.flashSprite(this.bossVisual, 0xffefb4, 120);
        this.showTelegraphZone(this.boss.x + dir * 36, this.boss.y - 30, 136, 84, 0xf0c569, 140, dir * 0.1);
        this.time.delayedCall(180, () => this.resolveBossHit(136, 86, 26, dir * 300));
        break;
      case "shockwave":
        this.boss.moveEndsAt = this.time.now + 1320;
        this.boss.cooldownUntil = this.time.now + 1680;
        this.flashSprite(this.bossVisual, 0xffefb4, 260);
        this.showTelegraphZone(this.boss.x, this.boss.y + 8, 180, 120, 0xffd976, 420);
        this.time.delayedCall(520, () => {
          this.resolveBossHit(120, 116, 34, dir * 250);
          this.spawnShockwave(-1);
          this.spawnShockwave(1);
        });
        break;
      case "doublecharge":
        this.boss.moveEndsAt = this.time.now + 1640;
        this.boss.cooldownUntil = this.time.now + 1940;
        this.flashSprite(this.bossVisual, 0xffd576, 260);
        this.showTelegraphZone(this.boss.x + dir * 140, this.boss.y - 6, 350, 104, 0xf0c569, 220);
        this.time.delayedCall(240, () => {
          this.boss.setVelocityX(dir * 540);
          this.time.delayedCall(260, () => this.resolveBossHit(178, 100, 31, dir * 360));
          this.time.delayedCall(410, () => this.boss.setVelocityX(0));
          this.time.delayedCall(660, () => {
            const redirect = this.player.x >= this.boss.x ? 1 : -1;
            this.showTelegraphZone(this.boss.x + redirect * 140, this.boss.y - 6, 330, 104, 0xf0c569, 180);
            this.boss.setVelocityX(redirect * 590);
            this.time.delayedCall(230, () => this.resolveBossHit(178, 100, 31, redirect * 380));
            this.time.delayedCall(420, () => this.boss.setVelocityX(0));
          });
        });
        break;
      case "slamcombo":
        this.boss.moveEndsAt = this.time.now + 1450;
        this.boss.cooldownUntil = this.time.now + 1660;
        this.flashSprite(this.bossVisual, 0xffd576, 260);
        this.showTelegraphZone(this.boss.x + dir * 72, this.boss.y - 26, 172, 96, 0xf0c569, 260, dir * 0.08);
        this.time.delayedCall(320, () => this.resolveBossHit(170, 90, 31, dir * 285));
        this.time.delayedCall(540, () => this.showTelegraphZone(this.boss.x + dir * 32, this.boss.y + 8, 124, 122, 0xffd977, 180));
        this.time.delayedCall(780, () => this.resolveBossHit(124, 118, 38, dir * 340));
        break;
      default:
        break;
    }
  }

  private resolveBossHit(width: number, height: number, damage: number, knockback: number) {
    if (!this.boss.alive || !this.player.alive) return;
    const rect = new Phaser.Geom.Rectangle(
      this.boss.x + (this.player.x >= this.boss.x ? 1 : -1) * 10 - width / 2,
      this.boss.y - 44,
      width,
      height
    );
    const telegraph = this.add
      .image(rect.centerX, rect.centerY + 2, "spellArc")
      .setDepth(2)
      .setTint(0xe9c86d)
      .setAlpha(0.8)
      .setFlipX(this.player.x < this.boss.x)
      .setRotation((this.player.x >= this.boss.x ? 1 : -1) * 0.08)
      .setDisplaySize(width, Math.max(18, height * 0.34));
    this.time.delayedCall(110, () => telegraph.destroy());

    if (Phaser.Geom.Intersects.RectangleToRectangle(rect, this.bodyRect(this.player))) {
      const hit = this.player.takeDamage(damage, knockback);
      if (hit) {
        audio.play("hit");
        this.applyHitStop(90);
        this.cameras.main.shake(150, 0.008);
        this.spawnImpact(this.player.x, this.player.y - 8, 0xffc8e4);
      }
    }
    if (this.familiar.alive && Phaser.Geom.Intersects.RectangleToRectangle(rect, this.bodyRect(this.familiar))) {
      this.familiar.takeDamage(Math.round(damage * 0.7), knockback * 0.5);
    }
  }

  private spawnShockwave(dir: -1 | 1) {
    const wave = this.add.rectangle(this.boss.x + dir * 50, GROUND_Y - 24, 84, 22, 0xe1c96f, 0.78).setDepth(1);
    this.tweens.add({
      targets: wave,
      x: wave.x + dir * 340,
      scaleX: 3,
      alpha: 0,
      duration: 620,
      onUpdate: () => {
        const rect = wave.getBounds();
        if (wave.active && Phaser.Geom.Intersects.RectangleToRectangle(rect, this.bodyRect(this.player))) {
          this.player.takeDamage(28, dir * 280);
          wave.destroy();
        }
        if (this.familiar.alive && wave.active && Phaser.Geom.Intersects.RectangleToRectangle(rect, this.bodyRect(this.familiar))) {
          this.familiar.takeDamage(16, dir * 150);
        }
      },
      onComplete: () => wave.destroy()
    });
  }

  private checkBossTrigger() {
    const cleared = this.enemies.every((enemy) => !enemy.alive);
    if (!this.bossTriggered && cleared && this.player.x > 2580) {
      this.bossTriggered = true;
      this.boss.awaken(2860, 475);
      this.bossVisual.setVisible(true);
      this.store.getState().setBossState(true, this.boss.hp);
      this.cameras.main.shake(280, 0.008);
      audio.play("boss_roar");
      const intro = this.add.text(this.player.x - 160, 120, "守门重骑自雾中现身", {
        fontFamily: "Segoe UI",
        fontSize: "24px",
        color: "#f1d98a"
      });
      intro.setScrollFactor(1);
      this.tweens.add({
        targets: intro,
        alpha: 0,
        y: intro.y - 24,
        duration: 1600,
        onComplete: () => intro.destroy()
      });
    }
  }

  private showUltimateCg() {
    this.destroyUltimateCg();
    const shade = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x09020f, 0.82).setScrollFactor(0);
    const image = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, "ultimateCg").setScrollFactor(0).setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
    const title = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 96, "绯镜魔装 · 星坠宣判", {
      fontFamily: "Segoe UI",
      fontSize: "38px",
      color: "#ffd2f5",
      stroke: "#12040f",
      strokeThickness: 6
    }).setOrigin(0.5).setScrollFactor(0);
    this.ultimateOverlay = this.add.container(0, 0, [shade, image, title]).setDepth(50).setAlpha(0);
    this.tweens.add({ targets: this.ultimateOverlay, alpha: 1, duration: 180 });
    this.tweens.add({ targets: image, scaleX: 1.05, scaleY: 1.05, duration: 980 });
  }

  private destroyUltimateCg() {
    if (!this.ultimateOverlay) return;
    this.ultimateOverlay.destroy(true);
    this.ultimateOverlay = undefined;
  }

  private spawnImpact(x: number, y: number, color = 0xf3d994) {
    for (let i = 0; i < 8; i += 1) {
      const dot = this.add.circle(x, y, Phaser.Math.Between(2, 4), color, 0.9).setDepth(4);
      this.tweens.add({
        targets: dot,
        x: x + Phaser.Math.Between(-26, 26),
        y: y + Phaser.Math.Between(-22, 22),
        alpha: 0,
        duration: 220,
        onComplete: () => dot.destroy()
      });
    }
  }

  private showTelegraphZone(
    x: number,
    y: number,
    width: number,
    height: number,
    color: number,
    duration: number,
    rotation = 0
  ) {
    const warning = this.add.graphics({ x, y }).setDepth(2);
    warning.fillStyle(color, 0.16);
    warning.lineStyle(2, color, 0.95);
    warning.fillRoundedRect(-width / 2, -height / 2, width, height, 10);
    warning.strokeRoundedRect(-width / 2, -height / 2, width, height, 10);
    warning.setRotation(rotation);
    warning.setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: warning,
      alpha: 0,
      scaleX: 1.06,
      scaleY: 1.06,
      duration,
      onComplete: () => warning.destroy()
    });
  }

  private flashSprite(target: Phaser.GameObjects.Sprite, color: number, duration: number) {
    target.setTint(color);
    this.time.delayedCall(duration, () => {
      if (target.active) target.clearTint();
    });
  }

  private updateCharacterPoses(now: number) {
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    this.playerVisual.setPosition(this.player.x, this.player.y - 6);
    this.playerVisual.setFlipX(this.player.facing < 0);
    this.playerVisual.setVisible(this.player.alive);
    if (this.player.scene.time.now < this.player.hitStunUntil) {
      this.playerVisual.setTintFill(0xff9a9a);
    } else {
      this.playerVisual.clearTint();
    }

    if (this.player.isDodging) {
      this.playerVisual.anims.stop();
      this.playerVisual.setAngle(this.player.facing * -14).setScale(0.28, 0.22);
      this.playerVisual.setFrame(4);
    } else if (now < this.player.attackLockUntil) {
      this.playerVisual.anims.stop();
      this.playerVisual.setAngle(this.player.facing * 6).setScale(0.27, 0.27);
      this.playerVisual.setFrame(this.player.attackLockUntil - now > 400 ? 3 : 2);
    } else if (Math.abs(playerBody.velocity.x) > 10) {
      this.playIfNeeded(this.playerVisual, "summoner-run");
      const turnSquash = this.player.justTurned ? 0.04 : 0;
      this.playerVisual.setAngle(Math.sin(now / 90) * 4 + (this.player.justTurned ? this.player.facing * -5 : 0))
        .setScale(0.27 + turnSquash, 0.27 - turnSquash * 0.45);
    } else {
      this.playIfNeeded(this.playerVisual, "summoner-idle");
      this.playerVisual.setAngle(Math.sin(now / 240) * 1.6).setScale(this.player.justTurned ? 0.29 : 0.27, 0.27);
    }

    if (this.familiar.alive) {
      if (Math.abs((this.familiar.body as Phaser.Physics.Arcade.Body).velocity.x) > 8) {
        this.playIfNeeded(this.familiar, "hamster-run");
      } else {
        this.playIfNeeded(this.familiar, "hamster-idle");
      }
      this.familiar.setDepth(2.58);
    }

    this.enemies.forEach((enemy, index) => {
      const visual = this.enemyVisuals.get(enemy);
      if (!visual) return;
      if (!enemy.alive) {
        visual.setVisible(false);
        return;
      }
      const enemyBody = enemy.body as Phaser.Physics.Arcade.Body;
      visual.setVisible(true);
      const isBug = enemy instanceof FlyingBug;
      const isNut = enemy instanceof NutEnemy;
      visual.setPosition(enemy.x, enemy.y + (isBug ? -2 : isNut ? 3 : -8));
      visual.setFlipX(enemy.flipX);
      visual.setAngle(Math.sin(now / (isBug ? 95 : 180) + index) * (isBug ? 8 : 2));
      visual.setScale(isBug ? 0.078 + Math.sin(now / 120 + index) * 0.004 : isNut ? 0.082 : 0.22);
      if (isBug || isNut) {
        if (enemy.tintTimer > now) {
          visual.setTintFill(isNut ? 0xffd078 : 0xff8fba);
        } else {
          visual.clearTint();
        }
        return;
      }
      if (enemy.tintTimer > now) {
        visual.anims.stop();
        visual.setTintFill(0xff8f8f);
        visual.setFrame(4);
      } else {
        visual.clearTint();
        const attackAge = now - enemy.lastAttackAt;
        if (attackAge >= 0 && attackAge < 220) {
          visual.anims.stop();
          visual.setFrame(2);
        } else if (attackAge >= 220 && attackAge < 420) {
          visual.anims.stop();
          visual.setFrame(3);
        } else if (Math.abs(enemyBody.velocity.x) > 8) {
          this.playIfNeeded(visual, "enemy-idle");
        } else {
          this.playIfNeeded(visual, "enemy-idle");
        }
      }
    });

    this.bossVisual.setVisible(this.boss.alive && this.bossTriggered);
    this.bossVisual.setPosition(this.boss.x, this.boss.y - 6);
    this.bossVisual.setFlipX(this.boss.flipX);
    this.bossVisual.setScale(0.38);
    if (this.boss.alive && this.bossTriggered) {
      const bossPulse = this.boss.phaseTwo ? 1 + Math.sin(now / 140) * 0.02 : 1;
      this.bossVisual.setScale(0.38 * bossPulse);
      const bossBody = this.boss.body as Phaser.Physics.Arcade.Body;
      if (this.boss.phaseTwo) this.bossVisual.setTint(0xf2d67b);
      else this.bossVisual.clearTint();
      const moveAge = now - this.boss.moveStartedAt;
      if (this.boss.activeMove === "charge" || this.boss.activeMove === "doublecharge") {
        this.bossVisual.anims.stop();
        this.bossVisual.setFrame(moveAge < 260 ? 4 : 5);
      } else if (
        this.boss.activeMove === "sweep" ||
        this.boss.activeMove === "trample" ||
        this.boss.activeMove === "turnslash" ||
        this.boss.activeMove === "slamcombo"
      ) {
        this.bossVisual.anims.stop();
        this.bossVisual.setFrame(moveAge < 320 ? 2 : 3);
      } else if (this.boss.activeMove === "shockwave") {
        this.bossVisual.anims.stop();
        this.bossVisual.setFrame(moveAge < 520 ? 4 : 5);
      } else if (Math.abs(bossBody.velocity.x) > 20) {
        this.playIfNeeded(this.bossVisual, "boss-idle");
      } else {
        this.playIfNeeded(this.bossVisual, "boss-idle");
      }
    }
  }

  private updateAtmosphere(now: number) {
    this.fogLayers.forEach((fog, index) => {
      fog.x += Math.sin(now / (900 + index * 260)) * 0.16;
      fog.alpha = 0.05 + index * 0.02 + Math.sin(now / (1200 + index * 300)) * 0.008;
    });
  }

  private applyHitStop(duration: number) {
    if (this.hitStopActive) return;
    this.hitStopActive = true;
    this.physics.world.pause();
    this.time.delayedCall(duration, () => {
      if (!this.ultimateOverlay) this.physics.world.resume();
      this.hitStopActive = false;
    });
  }

  private syncStore() {
    this.store.getState().setPlayerStats(
      this.player.hp,
      this.player.stamina,
      this.player.energy,
      this.player.potions,
      this.player.weapon,
      this.familiar.alive ? this.familiar.hp : 0
    );
    this.store.getState().setBossState(
      this.bossTriggered,
      this.boss.alive ? this.boss.hp : 0,
      this.boss.phaseTwo ? BOSS_PHASE_TWO_TITLE : ""
    );
  }

  private updatePhaseVisuals() {
    const alpha = this.boss.phaseTwo ? 0.34 : 0.26;
    this.goldTreeGlow.setFillStyle(0xd7b052, alpha);
    const cameraBg = this.boss.phaseTwo ? 0x09060b : 0x090b12;
    this.cameras.main.setBackgroundColor(cameraBg);
  }
}
