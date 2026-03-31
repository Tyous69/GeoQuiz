import { createContext, useContext, useState, ReactNode } from 'react';
import { GameConfig } from '../types';

interface GameContextType {
  config: GameConfig | null;
  setConfig: (config: GameConfig) => void;
  clearConfig: () => void;
}

const GameContext = createContext<GameContextType>({
  config: null,
  setConfig: () => {},
  clearConfig: () => {},
});

export function GameProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<GameConfig | null>(null);

  return (
    <GameContext.Provider
      value={{
        config,
        setConfig: setConfigState,
        clearConfig: () => setConfigState(null),
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export const useGameConfig = () => useContext(GameContext);
