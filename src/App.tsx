import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { GameProvider } from './context/GameContext';
import AppRouter from './router/AppRouter';
import './styles/global.scss';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <GameProvider>
          <AppRouter />
        </GameProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}