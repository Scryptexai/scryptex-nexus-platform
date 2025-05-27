
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import RootLayout from './app/layout'
import Index from './pages/Index'
import TokensPage from './app/tokens/page'
import NotFound from './pages/NotFound'
import './App.css'

function App() {
  return (
    <Router>
      <RootLayout>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/tokens" element={<TokensPage />} />
          <Route path="/tokens/create" element={<div>Token Creation Page</div>} />
          <Route path="/trading" element={<div>Trading Hub</div>} />
          <Route path="/trading/swap" element={<div>Swap Interface</div>} />
          <Route path="/community" element={<div>Community Hub</div>} />
          <Route path="/quests" element={<div>Quests Page</div>} />
          <Route path="/analytics" element={<div>Analytics Dashboard</div>} />
          <Route path="/settings" element={<div>Settings Page</div>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </RootLayout>
    </Router>
  )
}

export default App
