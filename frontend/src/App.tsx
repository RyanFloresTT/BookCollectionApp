import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ButtonAppBar from './components/AppBar/ButtonAppBar';
import Home from './pages/Home/Home';
import StatsPage from './pages/StatsPage/StatsPage';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Collection from './pages/Collection/Collection';

const App: React.FC = () => {
  return (
    <Router>
      <ButtonAppBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route 
          path="/collection" 
          element={
          <ProtectedRoute>
            <Collection />
          </ProtectedRoute>
        } />
        <Route 
          path="/stats" 
          element={
          <ProtectedRoute>
            <StatsPage />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
};

export default App;
