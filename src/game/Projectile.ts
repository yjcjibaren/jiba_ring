import Phaser from "phaser";

export class Projectile extends Phaser.Physics.Arcade.Image {
  damage = 8;
  fromPlayer = true;
  bornAt = 0;
  owner: "player" | "familiar" | "enemy" = "player";
  heavy = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "arrow");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setActive(true);
    this.setVisible(true);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(30, 8);
    this.setDepth(2);
  }
}
