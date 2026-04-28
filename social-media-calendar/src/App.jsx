import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Onboarding from "./pages/Onboarding.jsx";
import ConnectSuccess from "./components/ConnectSuccess.jsx";
import ConnectToPlatforms from "./pages/ConnectToPlatform.jsx";
import DashboardDummy from "./pages/DashboardDummy.jsx";
import { Toaster } from "sonner";
import AppLayout from "./layouts/AppLayout.jsx";
import Clients from "./pages/Clients.jsx";
import WordPressSites from "./pages/WordpressSites.jsx";
import Settings from "./pages/Settings.jsx";
import WPPosts from "./pages/WPPosts.jsx";
import CategoryManagement from "./pages/CategoryManagement.jsx";
import Login from "./pages/Login.jsx";
import ProtectedRoute from "./layouts/ProtectedRoute.jsx";
import InviteUser from './pages/InviteUser.jsx';
import { isAdmin } from './lib/auth';
import AdminRoute from './layouts/AdminRoute.jsx';
import InsightsDashboard from "./pages/InsightsDashboard.jsx";


export default function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Protected — wrap AppLayout */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/calendar" element={<DashboardDummy />} />
            <Route path="/add-clients" element={<Onboarding />} />
            <Route path="/connect-success" element={<ConnectSuccess />} />
            <Route path="/connect-platform" element={<ConnectToPlatforms />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/add-client" element={<Onboarding />} />
            <Route path="/wp-sites" element={<WordPressSites />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/wp-posts" element={<WPPosts />} />
            <Route path="/wordpress-sites/:id/categories" element={<CategoryManagement />} />
            <Route path="/" element={<InsightsDashboard />} />

            <Route
              path="/invite"
              element={<AdminRoute><InviteUser /></AdminRoute>}
            />

          </Route>
        </Routes>
      </Router>
      <Toaster position="top-right" richColors closeButton />
    </>
  );
}