import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Onboarding from "./pages/Onboarding.jsx";
import ConnectSuccess from "./components/ConnectSuccess.jsx";
import ConnectToPlatforms from "./pages/ConnectToPlatform.jsx";
import ClientDetails from "@/pages/ClientDetails";
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/onboard" element={<Onboarding />} />
        <Route path="/connect-success" element={<ConnectSuccess />} />
        <Route path="/connect-platform" element={<ConnectToPlatforms />} />
        <Route path="/clients/:clientId" element={<ClientDetails />} />
        <Route path="/client-details" element={<ClientDetails />} />

      </Routes>
    </Router>
  );
}
