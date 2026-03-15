import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Package, MapPin, Loader2, ArrowRight, ChevronLeft } from "lucide-react";
import { postShipment } from "../../api/shipmentApi";
import { useAuth } from "../../context/AuthContext";

const CARGO_TYPES = [
  "GENERAL", "FRAGILE", "PERISHABLE", "HAZARDOUS", "REFRIGERATED",
  "HEAVY_MACHINERY", "LIQUID", "ELECTRONICS", "FURNITURE", "PHARMACEUTICALS"
];

const PRIORITY_TYPES = [
  { value: "SAFETY", label: "Safety first", desc: "Prioritize driver safety record & reliability" },
  { value: "SPEED", label: "Speed first", desc: "Prioritize fastest estimated delivery" },
  { value: "COST", label: "Cost first", desc: "Prioritize lowest bid amount" },
];

const formatLabel = (str) =>
  str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function PostShipment() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    companyId: user?.id || "",
    originCity: "",
    destinationCity: "",
    distanceKm: "",
    cargoType: "",
    weightKg: "",
    fragile: false,
    hazardous: false,
    requiresRefrigeration: false,
    deadlineDate: "",
    budgetAmount: "",
    priorityType: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...form,
        distanceKm: form.distanceKm ? parseFloat(form.distanceKm) : null,
        weightKg: form.weightKg ? parseFloat(form.weightKg) : null,
        budgetAmount: form.budgetAmount ? parseFloat(form.budgetAmount) : null,
        status: "OPEN",
      };
      await postShipment(payload);
      navigate("/company/shipments");
    } catch (err) {
      setError(err.response?.data || "Failed to post shipment.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-orange-500 transition-colors";
  const labelClass = "block text-sm text-gray-400 mb-2";

  return (
    <div className="min-h-screen bg-gray-950 pt-24 pb-16 px-6">
      <div className="max-w-2xl mx-auto">

        {/* Back */}
        <Link to="/company/shipments"
          className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-300 text-sm mb-6 transition-colors">
          <ChevronLeft size={16} /> Back to shipments
        </Link>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">

          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center">
              <Package size={24} className="text-orange-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Post a shipment</h1>
              <p className="text-gray-500 text-sm">Fill in the details to receive driver bids</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Route */}
            <div>
              <h3 className="text-white text-sm font-medium mb-3 flex items-center gap-2">
                <MapPin size={15} className="text-orange-400" /> Route
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Origin city</label>
                  <input name="originCity" value={form.originCity} onChange={handleChange}
                    placeholder="Bengaluru" required className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Destination city</label>
                  <input name="destinationCity" value={form.destinationCity} onChange={handleChange}
                    placeholder="Mumbai" required className={inputClass} />
                </div>
              </div>
              <div className="mt-4">
                <label className={labelClass}>Distance (km) <span className="text-gray-600">— optional</span></label>
                <input name="distanceKm" type="number" value={form.distanceKm} onChange={handleChange}
                  placeholder="1200" className={inputClass} />
              </div>
            </div>

            <div className="border-t border-gray-800" />

            {/* Cargo */}
            <div>
              <h3 className="text-white text-sm font-medium mb-3 flex items-center gap-2">
                <Package size={15} className="text-orange-400" /> Cargo details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Cargo type</label>
                  <select name="cargoType" value={form.cargoType} onChange={handleChange}
                    required className={inputClass}>
                    <option value="" disabled>Select type</option>
                    {CARGO_TYPES.map(t => (
                      <option key={t} value={t}>{formatLabel(t)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Weight (kg)</label>
                  <input name="weightKg" type="number" value={form.weightKg} onChange={handleChange}
                    placeholder="2500" required className={inputClass} />
                </div>
              </div>

              {/* Flags */}
              <div className="flex items-center gap-6 mt-4">
                {[
                  { name: "fragile", label: "Fragile" },
                  { name: "hazardous", label: "Hazardous" },
                  { name: "requiresRefrigeration", label: "Requires refrigeration" },
                ].map((flag) => (
                  <label key={flag.name} className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                    <input type="checkbox" name={flag.name} checked={form[flag.name]}
                      onChange={handleChange} className="accent-orange-500 w-4 h-4" />
                    {flag.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-800" />

            {/* Budget & Deadline */}
            <div>
              <h3 className="text-white text-sm font-medium mb-3">Budget & timeline</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Budget (₹)</label>
                  <input name="budgetAmount" type="number" value={form.budgetAmount} onChange={handleChange}
                    placeholder="45000" required className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Deadline date</label>
                  <input name="deadlineDate" type="date" value={form.deadlineDate} onChange={handleChange}
                    required className={inputClass + " scheme-dark"} />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-800" />

            {/* Priority */}
            <div>
              <h3 className="text-white text-sm font-medium mb-3">Matching priority</h3>
              <p className="text-gray-500 text-xs mb-4">This tells our AI how to rank and recommend drivers for your shipment.</p>
              <div className="grid grid-cols-3 gap-3">
                {PRIORITY_TYPES.map((p) => (
                  <label key={p.value}
                    className={`relative flex flex-col gap-1 p-4 rounded-xl border cursor-pointer transition-all ${
                      form.priorityType === p.value
                        ? "border-orange-500 bg-orange-500/10"
                        : "border-gray-700 bg-gray-800 hover:border-gray-600"
                    }`}>
                    <input type="radio" name="priorityType" value={p.value}
                      checked={form.priorityType === p.value}
                      onChange={handleChange} className="sr-only" />
                    <span className="text-white text-sm font-medium">{p.label}</span>
                    <span className="text-gray-500 text-xs leading-relaxed">{p.desc}</span>
                    {form.priorityType === p.value && (
                      <div className="absolute top-3 right-3 w-2 h-2 bg-orange-500 rounded-full" />
                    )}
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading || !form.priorityType}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>Post shipment <ArrowRight size={16} /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}