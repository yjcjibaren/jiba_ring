import { useEffect, useRef } from "react";
import { createGame } from "../game/createGame";

type GameShellProps = {
  runId: number;
};

export function GameShell({ runId }: GameShellProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const game = createGame(containerRef.current);
    return () => {
      game.destroy(true);
    };
  }, [runId]);

  return <div ref={containerRef} className="game-shell" />;
}
