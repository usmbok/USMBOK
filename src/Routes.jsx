import React from 'react';
import { BrowserRouter, Routes as RouterRoutes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';

// Import pages
import NotFound from './pages/NotFound';
import Homepage from './pages/homepage';
import LoginScreen from './pages/login-screen';
import RegistrationScreen from './pages/registration-screen';
import UserDashboard from './pages/user-dashboard';
import DomainSelection from './pages/domain-selection';
import AiChatInterface from './pages/ai-chat-interface';
import ConversationHistory from './pages/conversation-history';
import CreditManagement from './pages/credit-management';
import AccountSettings from './pages/account-settings';
import LogoutConfirmation from './pages/logout-confirmation';
import AssistantCatalog from './pages/assistant-catalog';
import FaqPage from './pages/faq-page';
import AdminDashboard from './pages/admin-dashboard';
import AssistantManagement from './pages/assistant-management';
import TrialExpirationManagement from './pages/trial-expiration-management';
import UserManagement from './pages/user-management';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login-screen" element={<LoginScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register" element={<RegistrationScreen />} />
          <Route path="/registration-screen" element={<RegistrationScreen />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/domain-selection" element={<DomainSelection />} />
          <Route path="/ai-chat-interface" element={<AiChatInterface />} />
          <Route path="/conversation-history" element={<ConversationHistory />} />
          <Route path="/credit-management" element={<CreditManagement />} />
          <Route path="/account-settings" element={<AccountSettings />} />
          <Route path="/logout-confirmation" element={<LogoutConfirmation />} />
          <Route path="/assistant-catalog" element={<AssistantCatalog />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/assistant-management" element={<AssistantManagement />} />
          <Route path="/trial-expiration-management" element={<TrialExpirationManagement />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;