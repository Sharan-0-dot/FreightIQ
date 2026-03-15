import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import CompanyLogin from "./pages/company/CompanyLogin";
import CompanyRegister from "./pages/company/CompanyRegister";
import CompanyProfile from "./pages/company/CompanyProfile";
import PostShipment from "./pages/company/PostShipment";
import MyShipments from "./pages/company/MyShipments";
import ShipmentDetail from "./pages/company/ShipmentDetail";
import SubmitReview from "./pages/company/SubmitReview";

import DriverLogin from "./pages/driver/DriverLogin";
import DriverRegister from "./pages/driver/DriverRegister";
import DriverProfile from "./pages/driver/DriverProfile";
import BrowseShipments from "./pages/driver/BrowseShipments";
import MyBids from "./pages/driver/MyBids";
import DriverShipmentDetail from "./pages/driver/DriverShipmentDetail";
import DriverOngoingShipment from "./pages/driver/DriverOngoingShipment";

const ProtectedRoute = ({ children, allowedRole }) => {
  const { role } = useAuth();
  if (!role) return <Navigate to="/" />;
  if (allowedRole && role !== allowedRole) return <Navigate to="/" />;
  return children;
};

export default function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Company routes */}
        <Route path="/company/login" element={<CompanyLogin />} />
        <Route path="/company/register" element={<CompanyRegister />} />
        <Route path="/company/profile" element={<ProtectedRoute allowedRole="company"><CompanyProfile /></ProtectedRoute>} />
        <Route path="/company/post-shipment" element={<ProtectedRoute allowedRole="company"><PostShipment /></ProtectedRoute>} />
        <Route path="/company/shipments" element={<ProtectedRoute allowedRole="company"><MyShipments /></ProtectedRoute>} />
        <Route path="/company/shipments/:id" element={<ProtectedRoute allowedRole="company"><ShipmentDetail /></ProtectedRoute>} />
        <Route path="/company/shipments/:id/review" element={<ProtectedRoute allowedRole="company"><SubmitReview /></ProtectedRoute>} />

        {/* Driver routes */}
        <Route path="/driver/login" element={<DriverLogin />} />
        <Route path="/driver/register" element={<DriverRegister />} />
        <Route path="/driver/profile" element={<ProtectedRoute allowedRole="driver"><DriverProfile /></ProtectedRoute>} />
        <Route path="/driver/shipments" element={<ProtectedRoute allowedRole="driver"><BrowseShipments /></ProtectedRoute>} />
        <Route path="/driver/bids" element={<ProtectedRoute allowedRole="driver"><MyBids /></ProtectedRoute>} />
        <Route path="/driver/shipments/:id" element={<ProtectedRoute allowedRole="driver"><DriverShipmentDetail /></ProtectedRoute>} />
        <Route path="/driver/ongoing" element={<ProtectedRoute allowedRole="driver"><DriverOngoingShipment /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}