import Phaser from "phaser";
import { useGameStore } from "../store/gameStore";
import { GAME_HEIGHT, GAME_WIDTH } from "./constants";
import { GameScene } from "./GameScene";

export function createGame(container: HTMLDivElement) {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: container,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: "#090b12",
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 1800, x: 0 },
        debug: false
      }
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [GameScene]
  });

  const unsubscribe = useGameStore.subscribe((state, prev) => {
    const scene = game.scene.getScene("GameScene") as GameScene | undefined;
    if (!scene) return;
    if (state.screen === "paused" && prev.screen !== "paused") {
      scene.scene.pause();
    }
    if (state.screen === "playing" && prev.screen === "paused") {
      scene.scene.resume();
    }
  });

  game.events.once(Phaser.Core.Events.DESTROY, () => unsubscribe());
  return game;
}
