import { Routes, Route, Navigate } from 'react-router-dom';
import Header from '../components/Header/Header';
import Home from '../pages/Home/Home';
import GameSetup from '../pages/GameSetup/GameSetup';
import Game from '../pages/Game/Game';
import Summary from '../pages/Summary/Summary';
import Scores from '../pages/Scores/Scores';

export default function AppRouter() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/jouer" element={<GameSetup />} />
        <Route path="/partie" element={<Game />} />
        <Route path="/résultats" element={<Summary />} />
        <Route path="/scores" element={<Scores />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}