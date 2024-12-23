import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ButtonAppBar from './components/AppBar/ButtonAppBar';
import Home from './pages/Home/Home';
import CollectionPage from './pages/CollectionPage/CollectionPage';
import StatsPage from './pages/StatsPage/StatsPage';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

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
            <CollectionPage />
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
