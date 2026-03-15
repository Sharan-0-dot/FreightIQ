import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Truck, Phone, CreditCard, Calendar, Edit3, Save, X,
  Loader2, Trash2, Star, CheckCircle, XCircle, Clock,
  AlertTriangle, PlusCircle, Zap
} from "lucide-react";
import { updateDriver, deleteDriver, addVehicle, getVehiclesByDriver, deleteVehicle } from "../../api/driverApi";
import { useAuth } from "../../context/AuthContext";

const VEHICLE_TYPES = [
  "MINI_TRUCK", "PICKUP_TRUCK", "TRUCK_14FT", "TRUCK_17FT",
  "TRUCK_20FT", "CONTAINER_32FT", "FLATBED_TRUCK",
  "REFRIGERATED_TRUCK", "TANKER_TRUCK", "TRAILER_TRUCK"
];

const formatVehicleType = (type) =>
  type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function DriverProfile() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [vehicleLoading, setVehicleLoading] = useState(false);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [vehicleForm, setVehicleForm] = useState({
    driverId: user?.id || "",
    vehicleType: "",
    capacityKg: "",
    isRefrigerated: false,
    isHazardousSupported: false,
    vehicleAgeYears: "",
    registrationNumber: "",
  });

  const [form, setForm] = useState({
    name: user?.name || "",
    age: user?.age || "",
    experienceYears: user?.experienceYears || "",
    licenseNumber: user?.licenseNumber || "",
    licenseValidTill: user?.licenseValidTill || "",
    phone: user?.phone || "",
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await getVehiclesByDriver(user.id);
      setVehicles(res.data);
    } catch {
      setVehicles([]);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await updateDriver(user.id, {
        ...form,
        age: parseInt(form.age),
        experienceYears: parseInt(form.experienceYears),
      });
      login(res.data, "driver");
      setEditing(false);
    } catch (err) {
      setError(err.response?.data || "Update failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete your driver account? This cannot be undone.")) return;
    try {
      await deleteDriver(user.id);
      logout();
      navigate("/");
    } catch {
      setError("Failed to delete account.");
    }
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    setVehicleLoading(true);
    try {
      await addVehicle({
        ...vehicleForm,
        capacityKg: parseInt(vehicleForm.capacityKg),
        vehicleAgeYears: parseInt(vehicleForm.vehicleAgeYears),
        driverId: user.id,
      });
      await fetchVehicles();
      setShowVehicleForm(false);
      setVehicleForm({
        driverId: user.id, vehicleType: "", capacityKg: "",
        isRefrigerated: false, isHazardousSupported: false,
        vehicleAgeYears: "", registrationNumber: "",
      });
    } catch (err) {
      setError(err.response?.data || "Failed to add vehicle.");
    } finally {
      setVehicleLoading(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm("Remove this vehicle?")) return;
    try {
      await deleteVehicle(vehicleId);
      await fetchVehicles();
    } catch {
      setError("Failed to remove vehicle.");
    }
  };

  const onTimeRate = user?.totalAcceptedTrips
    ? (((user.totalAcceptedTrips - (user.totalDelayedTrips || 0)) / user.totalAcceptedTrips) * 100).toFixed(0)
    : null;

  const inputClass = "w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-blue-500 transition-colors";
  const labelClass = "block text-sm text-gray-500 mb-1";

  return (
    <div className="min-h-screen bg-gray-950 pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center">
                <Truck size={32} className="text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
                <p className="text-gray-400 text-sm">{user?.experienceYears} yrs experience · {user?.age} years old</p>
                <div className="flex items-center gap-3 mt-1">
                  {user?.ratingAverage ? (
                    <div className="flex items-center gap-1">
                      <Star size={13} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-yellow-400 text-xs font-medium">{user.ratingAverage.toFixed(1)}</span>
                    </div>
                  ) : (
                    <span className="text-gray-600 text-xs">No rating yet</span>
                  )}
                  <div className="w-1 h-1 bg-gray-700 rounded-full" />
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-green-400 text-xs">Active driver</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!editing ? (
                <button onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-gray-300 text-sm transition-colors">
                  <Edit3 size={14} /> Edit
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button onClick={() => { setEditing(false); setError(""); }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-gray-300 text-sm transition-colors">
                    <X size={14} /> Cancel
                  </button>
                  <button onClick={handleSave} disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-xl text-white text-sm font-medium transition-colors">
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <CheckCircle size={18} className="text-green-400" />, label: "Completed", value: user?.totalCompletedTrips ?? 0, bg: "bg-green-500/10 border-green-500/20" },
            { icon: <XCircle size={18} className="text-red-400" />, label: "Cancelled", value: user?.totalCancelledTrips ?? 0, bg: "bg-red-500/10 border-red-500/20" },
            { icon: <Clock size={18} className="text-yellow-400" />, label: "Delayed", value: user?.totalDelayedTrips ?? 0, bg: "bg-yellow-500/10 border-yellow-500/20" },
            { icon: <AlertTriangle size={18} className="text-orange-400" />, label: "Incidents", value: user?.incidentCount ?? 0, bg: "bg-orange-500/10 border-orange-500/20" },
          ].map((stat, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
              <div className={`w-9 h-9 ${stat.bg} border rounded-lg flex items-center justify-center mb-2`}>
                {stat.icon}
              </div>
              <div className="text-xl font-bold text-white">{stat.value}</div>
              <div className="text-gray-500 text-xs mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* On time rate banner */}
        {onTimeRate && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
              <Zap size={20} className="text-blue-400" />
            </div>
            <div>
              <p className="text-white font-semibold">{onTimeRate}% on-time delivery rate</p>
              <p className="text-gray-500 text-xs">Based on {user.totalAcceptedTrips} accepted trips</p>
            </div>
          </div>
        )}

        {/* Details / Edit */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-6">Driver details</h2>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm mb-4">{error}</div>
          )}
          {!editing ? (
            <div className="space-y-4">
              {[
                { icon: <Phone size={15} />, label: "Phone", value: user?.phone },
                { icon: <CreditCard size={15} />, label: "License number", value: user?.licenseNumber },
                { icon: <Calendar size={15} />, label: "License valid till", value: user?.licenseValidTill },
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
                <label className={labelClass}>Full name</label>
                <input name="name" value={form.name} onChange={handleChange} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Age</label>
                  <input name="age" type="number" value={form.age} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Experience (years)</label>
                  <input name="experienceYears" type="number" value={form.experienceYears} onChange={handleChange} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>License number</label>
                <input name="licenseNumber" value={form.licenseNumber} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>License valid till</label>
                <input name="licenseValidTill" type="date" value={form.licenseValidTill} onChange={handleChange} className={inputClass + " scheme-dark"} />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} className={inputClass} />
              </div>
            </div>
          )}
        </div>

        {/* Vehicles */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-semibold">My vehicles</h2>
            <button onClick={() => setShowVehicleForm(!showVehicleForm)}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl text-blue-400 text-sm transition-colors">
              <PlusCircle size={14} /> Add vehicle
            </button>
          </div>

          {/* Add vehicle form */}
          {showVehicleForm && (
            <form onSubmit={handleAddVehicle} className="bg-gray-800 rounded-xl p-4 mb-6 space-y-3">
              <div>
                <label className={labelClass}>Vehicle type</label>
                <select value={vehicleForm.vehicleType}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleType: e.target.value })}
                  required className={inputClass}>
                  <option value="" disabled>Select type</option>
                  {VEHICLE_TYPES.map(t => <option key={t} value={t}>{formatVehicleType(t)}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Capacity (kg)</label>
                  <input type="number" value={vehicleForm.capacityKg}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, capacityKg: e.target.value })}
                    placeholder="5000" required className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Vehicle age (years)</label>
                  <input type="number" value={vehicleForm.vehicleAgeYears}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleAgeYears: e.target.value })}
                    placeholder="3" required className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Registration number</label>
                <input value={vehicleForm.registrationNumber}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, registrationNumber: e.target.value })}
                  placeholder="KA01AB1234" required className={inputClass} />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                  <input type="checkbox" checked={vehicleForm.isRefrigerated}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, isRefrigerated: e.target.checked })}
                    className="accent-blue-500" />
                  Refrigerated
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                  <input type="checkbox" checked={vehicleForm.isHazardousSupported}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, isHazardousSupported: e.target.checked })}
                    className="accent-blue-500" />
                  Hazardous supported
                </label>
              </div>
              <button type="submit" disabled={vehicleLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
                {vehicleLoading ? <Loader2 size={14} className="animate-spin" /> : "Add vehicle"}
              </button>
            </form>
          )}

          {/* Vehicle list */}
          {vehicles.length === 0 ? (
            <div className="text-center py-8 text-gray-600 text-sm">No vehicles added yet</div>
          ) : (
            <div className="space-y-3">
              {vehicles.map((v) => (
                <div key={v.id} className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center">
                      <Truck size={16} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{formatVehicleType(v.vehicleType)}</p>
                      <p className="text-gray-500 text-xs">{v.registrationNumber} · {v.capacityKg?.toLocaleString()} kg</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {v.isRefrigerated && (
                      <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs">❄ Cold</span>
                    )}
                    {v.isHazardousSupported && (
                      <span className="px-2 py-0.5 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-400 text-xs">⚠ Hazmat</span>
                    )}
                    <button onClick={() => handleDeleteVehicle(v.id)}
                      className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Danger zone */}
        <div className="bg-gray-900 border border-red-500/20 rounded-2xl p-6">
          <h2 className="text-red-400 font-semibold mb-2">Danger zone</h2>
          <p className="text-gray-500 text-sm mb-4">Permanently delete your driver account and all associated data.</p>
          <button onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm transition-colors">
            <Trash2 size={14} /> Delete account
          </button>
        </div>

      </div>
    </div>
  );
}