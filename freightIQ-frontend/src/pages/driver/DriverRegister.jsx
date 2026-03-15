import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Truck, Loader2, ArrowRight } from "lucide-react";
import { registerDriver } from "../../api/driverApi";
import { useAuth } from "../../context/AuthContext";

export default function DriverRegister() {
  const [form, setForm] = useState({
    name: "", age: "", experienceYears: "",
    licenseNumber: "", licenseValidTill: "", phone: "",
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
      const payload = {
        ...form,
        age: parseInt(form.age),
        experienceYears: parseInt(form.experienceYears),
      };
      const res = await registerDriver(payload);
      login(res.data, "driver");
      navigate("/driver/profile");
    } catch (err) {
      setError(err.response?.data || "Registration failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-blue-500 transition-colors";
  const labelClass = "block text-sm text-gray-400 mb-2";

  return (
    <div className="min-h-screen bg-gray-950 pt-16 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">

          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
              <Truck size={24} className="text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Register as Driver</h1>
              <p className="text-gray-500 text-sm">Create your FreightIQ driver account</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className={labelClass}>Full name</label>
              <input name="name" value={form.name} onChange={handleChange}
                placeholder="Ravi Kumar" required className={inputClass} />
            </div>

            {/* Age + Experience */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Age</label>
                <input name="age" type="number" min="18" max="70"
                  value={form.age} onChange={handleChange}
                  placeholder="32" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Experience (years)</label>
                <input name="experienceYears" type="number" min="0" max="50"
                  value={form.experienceYears} onChange={handleChange}
                  placeholder="8" required className={inputClass} />
              </div>
            </div>

            {/* License number */}
            <div>
              <label className={labelClass}>License number</label>
              <input name="licenseNumber" value={form.licenseNumber} onChange={handleChange}
                placeholder="KA0120230012345" required className={inputClass} />
            </div>

            {/* License valid till */}
            <div>
              <label className={labelClass}>License valid till</label>
              <input name="licenseValidTill" type="date" value={form.licenseValidTill}
                onChange={handleChange} required
                className={inputClass + " scheme-dark"} />
            </div>

            {/* Phone */}
            <div>
              <label className={labelClass}>Phone number</label>
              <input name="phone" type="tel" value={form.phone} onChange={handleChange}
                placeholder="9876543210" required className={inputClass} />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
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
            <Link to="/driver/login" className="text-blue-400 hover:text-blue-300 transition-colors">
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