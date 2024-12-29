import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { Auth0Context, User } from '@auth0/auth0-react';
import theme from './theme';

const defaultAuth0Context = {
  isAuthenticated: true,
  isLoading: false,
  user: undefined,
  loginWithRedirect: jest.fn(),
  logout: jest.fn(),
  getAccessTokenSilently: jest.fn(),
  getAccessTokenWithPopup: jest.fn(),
  getIdTokenClaims: jest.fn(),
  loginWithPopup: jest.fn(),
  handleRedirectCallback: jest.fn()
};

const customRender = (
  ui: React.ReactElement,
  {
    route = '/',
    auth0Value = defaultAuth0Context,
    ...renderOptions
  } = {}
) => {
  window.history.pushState({}, 'Test page', route);

  return rtlRender(
    <Auth0Context.Provider value={auth0Value}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          {ui}
        </BrowserRouter>
      </ThemeProvider>
    </Auth0Context.Provider>,
    renderOptions
  );
};

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render };
export { defaultAuth0Context }; 