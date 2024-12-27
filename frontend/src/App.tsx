import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ButtonAppBar from './components/AppBar/ButtonAppBar';
import Home from './pages/Home/Home';
import StatsPage from './pages/StatsPage/StatsPage';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Collection from './pages/Collection/Collection';
import SubscriptionPage from './pages/Subscription/Subscription';
import { Auth0Provider } from '@auth0/auth0-react';

const domain = process.env.REACT_APP_AUTH0_DOMAIN || '';
const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID || '';
const audience = process.env.REACT_APP_AUTH0_AUDIENCE || '';
const redirectUri = process.env.REACT_APP_AUTH0_CALLBACK_URL || 'http://localhost:5000';

const App: React.FC = () => {
  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        audience: audience,
      }}
    >
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
          <Route 
            path="/subscription" 
            element={
              <SubscriptionPage />
            } />
        </Routes>
      </Router>
    </Auth0Provider>
  );
};

export default App;
