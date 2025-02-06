import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import OpenRoute from "./OpenRoute";
import LandingPage from "./LandingPage";
import AuthenticationPage from "@/features/auth/AuthenticationPage";
import HomePage from "@/features/home/HomePage";
import ManagementPage from "@/features/management/ManagementPage";
import SettingsPage from "@/features/settings/SettingsPage";
import InvalidPage from "./InvalidPage";
import PropertyForm from "@/propertyform";
import RenterForm from "@/renterform";
import { ProtectedRoute } from "./ProtectedRoute";
import AvailibilityPage from "@/features/availability/AvailibilityPage";
import PropertiesPage from "@/features/properties/PropertiesPage";
import CalendarPage from "@/features/calendar/CalendarPage";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route element={<OpenRoute />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthenticationPage />} />
        </Route>

        <Route element={<ProtectedRoute layout="default" />}>
          <Route path="/dashboard" element={<HomePage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          {/* <Route path="/chat" element={<ChatPage />} /> */}
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/manage/:id" element={<ManagementPage />} />
          <Route path="/availability-settings" element={<AvailibilityPage />} />
          <Route path="/settings" element={<SettingsPage />} />
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
