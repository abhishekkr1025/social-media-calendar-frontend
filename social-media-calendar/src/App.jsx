import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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


export default function App() {
  return (
    <>
    <Router>
      <Routes>
        <Route element={<AppLayout />}>

        <Route path="/" element={<Dashboard />} />
        <Route path="/add-clients" element={<Onboarding />} />
        <Route path="/connect-success" element={<ConnectSuccess />} />
        <Route path="/connect-platform" element={<ConnectToPlatforms />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/add-client" element={<Onboarding />} />
        <Route path="/wp-sites" element={<WordPressSites />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/wp-posts" element={<WPPosts />} />

       

        </Route>
        

      </Routes>
    </Router>
    <Toaster position="top-right" richColors closeButton/>
    </>
    
  );
}
