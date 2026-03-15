import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Building2, Mail, ArrowRight, Loader2 } from "lucide-react";
import { loginCompany } from "../../api/companyApi";
import { useAuth } from "../../context/AuthContext";

export default function CompanyLogin() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await loginCompany(email.trim());
      login(res.data, "company");
      navigate("/company/shipments");
    } catch (err) {
      setError(err.response?.data || "No company found with this email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 pt-16 flex items-center justify-center px-6">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">

          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center">
              <Building2 size={24} className="text-orange-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Company Login</h1>
              <p className="text-gray-500 text-sm">Enter your registered email</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="company@example.com"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-orange-500 transition-colors"
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
              disabled={loading || !email.trim()}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
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
            <Link to="/company/register" className="text-orange-400 hover:text-orange-300 transition-colors">
              Register your company
            </Link>
          </p>
        </div>

        {/* Back to home */}
        <p className="text-center text-gray-600 text-sm mt-4">
          <Link to="/" className="hover:text-gray-400 transition-colors">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}