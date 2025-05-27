
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import RootLayout from './app/layout'
import Index from './pages/Index'
import TokensPage from './app/tokens/page'
import TokenCreate from './pages/TokenCreate'
import Trading from './pages/Trading'
import TradingSwap from './pages/TradingSwap'
import Community from './pages/Community'
import Quests from './pages/Quests'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'
import './App.css'

function App() {
  return (
    <Router>
      <RootLayout>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/tokens" element={<TokensPage />} />
          <Route path="/tokens/create" element={<TokenCreate />} />
          <Route path="/trading" element={<Trading />} />
          <Route path="/trading/swap" element={<TradingSwap />} />
          <Route path="/community" element={<Community />} />
          <Route path="/quests" element={<Quests />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </RootLayout>
    </Router>
  )
}

export default App
