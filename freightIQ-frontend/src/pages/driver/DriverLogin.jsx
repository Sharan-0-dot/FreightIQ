import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Truck, Phone, ArrowRight, Loader2 } from "lucide-react";
import { loginDriver } from "../../api/driverApi";
import { useAuth } from "../../context/AuthContext";

export default function DriverLogin() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await loginDriver(phone.trim());
      login(res.data, "driver");
      navigate("/driver/shipments");
    } catch (err) {
      setError(err.response?.data || "No driver found with this phone number.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 pt-16 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">

          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
              <Truck size={24} className="text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Driver Login</h1>
              <p className="text-gray-500 text-sm">Enter your registered phone number</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Phone number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !phone.trim()}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Not registered yet?{" "}
            <Link to="/driver/register" className="text-blue-400 hover:text-blue-300 transition-colors">
              Register as driver
            </Link>
          </p>
        </div>

        <p className="text-center text-gray-600 text-sm mt-4">
          <Link to="/" className="hover:text-gray-400 transition-colors">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}