import { useGameStore } from "./state/gameStore";
import HomeScreen from "./components/home/HomeScreen";
import MatchmakingScreen from "./components/matchmaking/MatchmakingScreen";
import CountdownScreen from "./components/game/CountdownScreen";
import GameScreen from "./components/game/GameScreen";
import GameOverScreen from "./components/game/GameOverScreen";

export default function App() {
  const screen = useGameStore((s) => s.screen);

  return (
    <div className="min-h-full">
      {screen === "home" && <HomeScreen />}
      {screen === "matchmaking" && <MatchmakingScreen />}
      {screen === "countdown" && <CountdownScreen />}
      {screen === "game" && <GameScreen />}
      {screen === "gameover" && <GameOverScreen />}
    </div>
  );
}
