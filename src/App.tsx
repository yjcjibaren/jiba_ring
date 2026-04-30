import { useEffect } from "react";
import { gsap } from "gsap";
import { GameShell } from "./ui/GameShell";
import { MainMenu } from "./ui/MainMenu";
import { HUD } from "./ui/HUD";
import { PauseMenu } from "./ui/PauseMenu";
import { GameOver } from "./ui/GameOver";
import { VictoryScreen } from "./ui/VictoryScreen";
import { ControlsOverlay } from "./ui/ControlsOverlay";
import { useGameStore } from "./store/gameStore";

export default function App() {
  const store = useGameStore();

  useEffect(() => {
    gsap.fromTo(
      ".app-frame",
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
    );
  }, []);

  return (
    <div className="app-frame">
      {(store.screen === "playing" || store.screen === "paused" || store.screen === "gameover" || store.screen === "victory") && (
        <GameShell runId={store.resetRun} />
      )}

      {store.screen === "menu" && <MainMenu onStart={store.startGame} />}

      {(store.screen === "playing" || store.screen === "paused" || store.screen === "gameover" || store.screen === "victory") && (
        <HUD
          hp={store.playerHp}
          maxHp={store.playerMaxHp}
          stamina={store.playerStamina}
          maxStamina={store.playerMaxStamina}
          energy={store.playerEnergy}
          maxEnergy={store.playerMaxEnergy}
          potions={store.potions}
          weapon={store.currentWeapon}
          summonHp={store.summonHp}
          summonMaxHp={store.summonMaxHp}
          chapterTitle={store.chapterTitle}
          bossVisible={store.bossVisible}
          bossName={store.bossName}
          bossSubtitle={store.bossSubtitle}
          bossHp={store.bossHp}
          bossMaxHp={store.bossMaxHp}
        />
      )}

      {(store.screen === "playing" || store.screen === "paused") && <ControlsOverlay />}

      {store.screen === "paused" && (
        <PauseMenu onResume={() => store.setScreen("playing")} onQuit={store.quitToMenu} />
      )}
      {store.screen === "gameover" && (
        <GameOver onRestart={store.restartGame} onQuit={store.quitToMenu} />
      )}
      {store.screen === "victory" && (
        <VictoryScreen onRestart={store.restartGame} onQuit={store.quitToMenu} />
      )}
    </div>
  );
}
