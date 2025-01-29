import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AuthenicationPage from './AuthenticationPage';
import LandingPage from './LandingPage';
import MainPage from './MainPage';
import ManagementPage from './ManagementPage';
import ChatPage from './ChatPage';
import ProtectedRoute from './ProtectedRoute';
import PropertyForm from './propertyform';
import OpenRoute from './OpenRoute';
import RenterForm from './renterform';
import SettingPage from './SettingPage';
import AvailibilityPage from './AvailibilityPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route element={<OpenRoute/>}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/Auth" element={<AuthenicationPage />} />
        </Route>
        <Route element ={<ProtectedRoute/>}>
          <Route path="/Home" element={<MainPage />} />
          <Route path="/Manage/:id" element={<ManagementPage/>} />
          <Route path="/Chat" element={<ChatPage />} />
          <Route path="/addproperty" element={<PropertyForm/>} />
          <Route path="/settings" element={<SettingPage/>} />
          <Route path="/availability" element={<AvailibilityPage/>} />
        </Route>
        <Route path="/renterform/:id" element={<RenterForm/>} />
      </Routes>
    </Router>
  );
};

export default App;
