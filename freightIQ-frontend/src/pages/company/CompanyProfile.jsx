import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Mail, Phone, MapPin, Briefcase, Hash, Edit3, Save, X, Loader2, Trash2, TrendingUp, Package, CheckCircle } from "lucide-react";
import { updateCompany, deleteCompany } from "../../api/companyApi";
import { useAuth } from "../../context/AuthContext";

export default function CompanyProfile() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    gstNumber: user?.gstNumber || "",
    industry: user?.industry || "",
    city: user?.city || "",
    state: user?.state || "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await updateCompany(user.id, form);
      login(res.data, "company");
      setEditing(false);
    } catch (err) {
      setError(err.response?.data || "Update failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This cannot be undone.")) return;
    try {
      await deleteCompany(user.id);
      logout();
      navigate("/");
    } catch (err) {
      setError("Failed to delete account.");
    }
  };

  const inputClass = "w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-orange-500 transition-colors";
  const labelClass = "block text-sm text-gray-500 mb-1";

  return (
    <div className="min-h-screen bg-gray-950 pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center">
                <Building2 size={32} className="text-orange-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
                <p className="text-gray-400 text-sm">{user?.industry} · {user?.city}, {user?.state}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-green-400 text-xs">Active company</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-gray-300 text-sm transition-colors"
                >
                  <Edit3 size={14} /> Edit
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setEditing(false); setError(""); }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-gray-300 text-sm transition-colors"
                  >
                    <X size={14} /> Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-xl text-white text-sm font-medium transition-colors"
                  >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    Save
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: <Package size={20} className="text-orange-400" />, label: "Shipments posted", value: user?.totalShipmentsPosted ?? 0, bg: "bg-orange-500/10 border-orange-500/20" },
            { icon: <CheckCircle size={20} className="text-green-400" />, label: "Completed", value: user?.totalShipmentsCompleted ?? 0, bg: "bg-green-500/10 border-green-500/20" },
            { icon: <TrendingUp size={20} className="text-blue-400" />, label: "Avg rating given", value: user?.ratingAverage ? user.ratingAverage.toFixed(1) : "—", bg: "bg-blue-500/10 border-blue-500/20" },
          ].map((stat, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className={`w-10 h-10 ${stat.bg} border rounded-xl flex items-center justify-center mb-3`}>
                {stat.icon}
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-gray-500 text-xs mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Details / Edit form */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-6">Company details</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm mb-4">
              {error}
            </div>
          )}

          {!editing ? (
            <div className="space-y-4">
              {[
                { icon: <Mail size={15} />, label: "Email", value: user?.email },
                { icon: <Phone size={15} />, label: "Phone", value: user?.phone },
                { icon: <Hash size={15} />, label: "GST number", value: user?.gstNumber },
                { icon: <Briefcase size={15} />, label: "Industry", value: user?.industry },
                { icon: <MapPin size={15} />, label: "Location", value: `${user?.city}, ${user?.state}` },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-800 last:border-0">
                  <span className="text-gray-500">{item.icon}</span>
                  <div>
                    <p className="text-gray-500 text-xs">{item.label}</p>
                    <p className="text-white text-sm">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Company name</label>
                <input name="name" value={form.name} onChange={handleChange} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Email</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <input name="phone" value={form.phone} onChange={handleChange} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>GST number</label>
                <input name="gstNumber" value={form.gstNumber} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Industry</label>
                <input name="industry" value={form.industry} onChange={handleChange} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>City</label>
                  <input name="city" value={form.city} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>State</label>
                  <input name="state" value={form.state} onChange={handleChange} className={inputClass} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Danger zone */}
        <div className="bg-gray-900 border border-red-500/20 rounded-2xl p-6">
          <h2 className="text-red-400 font-semibold mb-2">Danger zone</h2>
          <p className="text-gray-500 text-sm mb-4">Permanently delete your company account and all associated data.</p>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm transition-colors"
          >
            <Trash2 size={14} /> Delete account
          </button>
        </div>

      </div>
    </div>
  );
}