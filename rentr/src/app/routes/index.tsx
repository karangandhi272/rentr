import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import OpenRoute from './OpenRoute';
import LandingPage from './LandingPage';
import AuthenticationPage from '../../features/auth/AuthenticationPage';
import HomePage from '../../features/home/HomePage';
import ManagementPage from '../../features/management/ManagementPage';
import ChatPage from '../../features/chat/ChatPage';
import SettingsPage from '@/features/settings/SettingsPage';
import AvailabilityPage from '@/features/availability/AvailibilityPage';
import InvalidPage from './InvalidPage';
import PropertyForm from '@/propertyform';
import RenterForm from '@/renterform';
import { ProtectedRoute } from './ProtectedRoute';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route element={<OpenRoute />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthenticationPage />} />
        </Route>

        <Route element={<ProtectedRoute layout="default" />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/manage/:id" element={<ManagementPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/availability" element={<AvailabilityPage />} />
        </Route>

        <Route element={<ProtectedRoute layout="minimal" />}>
          <Route path="/add-property" element={<PropertyForm />} />
        </Route>

        <Route path="/renterform/:id" element={<RenterForm />} />
        <Route path="*" element={<InvalidPage />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
