import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { UserCreditProvider } from './contexts/UserCreditContext';
import { UserProfileProvider } from './contexts/UserProfileContext';
import Routes from './Routes';

import './styles/index.css';

function App() {
  return (
    <AuthProvider>
      <UserProfileProvider>
        <UserCreditProvider>
          <Routes />
        </UserCreditProvider>
      </UserProfileProvider>
    </AuthProvider>
  );
}

export default App;