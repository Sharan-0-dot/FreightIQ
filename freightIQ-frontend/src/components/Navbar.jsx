import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Truck, LogOut, User, Package, ClipboardList, PlusCircle, Search, Navigation } from "lucide-react";

export default function Navbar() {
  const { user, role, logout, isCompany, isDriver } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <Truck size={18} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">
            Freight<span className="text-orange-500">IQ</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {!user && (
            <>
              <Link to="/company/login" className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
                Company
              </Link>
              <Link to="/driver/login" className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
                Driver
              </Link>
            </>
          )}

          {isCompany() && (
            <>
              <Link to="/company/shipments" className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
                <ClipboardList size={15} /> My Shipments
              </Link>
              <Link to="/company/post-shipment" className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
                <PlusCircle size={15} /> Post Shipment
              </Link>
              <Link to="/company/profile" className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
                <User size={15} /> Profile
              </Link>
            </>
          )}

          {isDriver() && (
            <>
              <Link to="/driver/shipments" className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
                <Search size={15} /> Browse
              </Link>
              <Link to="/driver/ongoing" className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
                <Navigation size={15} /> My Shipment
              </Link>
              <Link to="/driver/bids" className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
                <Package size={15} /> My Bids
              </Link>
              <Link to="/driver/profile" className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
                <User size={15} /> Profile
              </Link>
            </>
          )}

          {/* User pill + logout */}
          {user && (
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-800">
              <div className="text-right">
                <p className="text-sm text-white font-medium leading-none">{user.name}</p>
                <p className="text-xs text-orange-400 mt-0.5 capitalize">{role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}