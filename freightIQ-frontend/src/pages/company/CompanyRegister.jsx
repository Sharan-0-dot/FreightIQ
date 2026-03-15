import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Building2, Loader2, ArrowRight } from "lucide-react";
import { registerCompany } from "../../api/companyApi";
import { useAuth } from "../../context/AuthContext";

const INDUSTRIES = [
  "E-Commerce", "Manufacturing", "Pharmaceuticals", "Agriculture",
  "Automobile", "FMCG", "Construction", "Textiles", "Electronics", "Other"
];

export default function CompanyRegister() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", gstNumber: "",
    industry: "", city: "", state: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await registerCompany(form);
      login(res.data, "company");
      navigate("/company/shipments");
    } catch (err) {
      setError(err.response?.data || "Registration failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-orange-500 transition-colors";
  const labelClass = "block text-sm text-gray-400 mb-2";

  return (
    <div className="min-h-screen bg-gray-950 pt-16 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">

          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center">
              <Building2 size={24} className="text-orange-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Register Company</h1>
              <p className="text-gray-500 text-sm">Create your FreightIQ account</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Company name */}
            <div>
              <label className={labelClass}>Company name</label>
              <input name="name" value={form.name} onChange={handleChange}
                placeholder="Acme Logistics Pvt. Ltd." required className={inputClass} />
            </div>

            {/* Email + Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange}
                  placeholder="admin@acme.com" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange}
                  placeholder="9876543210" required className={inputClass} />
              </div>
            </div>

            {/* GST */}
            <div>
              <label className={labelClass}>GST number</label>
              <input name="gstNumber" value={form.gstNumber} onChange={handleChange}
                placeholder="22AAAAA0000A1Z5" required className={inputClass} />
            </div>

            {/* Industry */}
            <div>
              <label className={labelClass}>Industry</label>
              <select name="industry" value={form.industry} onChange={handleChange}
                required className={inputClass}>
                <option value="" disabled>Select industry</option>
                {INDUSTRIES.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            {/* City + State */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>City</label>
                <input name="city" value={form.city} onChange={handleChange}
                  placeholder="Bengaluru" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>State</label>
                <input name="state" value={form.state} onChange={handleChange}
                  placeholder="Karnataka" required className={inputClass} />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <span>Create account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Already registered?{" "}
            <Link to="/company/login" className="text-orange-400 hover:text-orange-300 transition-colors">
              Login here
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