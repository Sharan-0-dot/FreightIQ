import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Package, MapPin, Calendar, ChevronLeft, Loader2,
  DollarSign, Weight, Shield, Zap, Flame, Snowflake,
  CheckCircle, Clock, AlertTriangle, Send
} from "lucide-react";
import { getShipmentById, placeBid, getBidsByDriver } from "../../api/shipmentApi";
import { useAuth } from "../../context/AuthContext";

const PRIORITY_STYLES = {
  SAFETY: { label: "Safety first", class: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  SPEED:  { label: "Speed first",  class: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
  COST:   { label: "Cost first",   class: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
};

const formatLabel = (str) =>
  str?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "";

export default function DriverShipmentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shipment, setShipment] = useState(null);
  const [existingBid, setExistingBid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    bidAmount: "",
    estimatedDeliveryDays: "",
    note: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [shipRes, bidsRes] = await Promise.all([
          getShipmentById(id),
          getBidsByDriver(user.id),
        ]);
        setShipment(shipRes.data);
        const myBid = bidsRes.data.find((b) => b.shipmentId === id);
        if (myBid) setExistingBid(myBid);
      } catch {
        setError("Failed to load shipment.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await placeBid({
        shipmentId: id,
        driverId: user.id,
        bidAmount: parseFloat(form.bidAmount),
        estimatedDeliveryDays: parseInt(form.estimatedDeliveryDays),
        note: form.note || null,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data || "Failed to place bid.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 pt-24 flex items-center justify-center">
        <Loader2 size={28} className="text-blue-400 animate-spin" />
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="min-h-screen bg-gray-950 pt-24 flex items-center justify-center">
        <p className="text-gray-400">Shipment not found.</p>
      </div>
    );
  }

  const priority = PRIORITY_STYLES[shipment.priorityType];
  const daysLeft = shipment.deadlineDate
    ? Math.ceil((new Date(shipment.deadlineDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  const inputClass = "w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-blue-500 transition-colors";

  return (
    <div className="min-h-screen bg-gray-950 pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto space-y-6">

        <Link to="/driver/shipments"
          className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-300 text-sm transition-colors">
          <ChevronLeft size={16} /> Back to shipments
        </Link>

        {/* Shipment info card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
              <Package size={24} className="text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                {shipment.originCity} → {shipment.destinationCity}
              </h1>
              <p className="text-gray-500 text-sm">
                Posted {new Date(shipment.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric"
                })}
              </p>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            {[
              { icon: <Package size={14} />, label: "Cargo type", value: formatLabel(shipment.cargoType) },
              { icon: <Weight size={14} />, label: "Weight", value: shipment.weightKg ? `${shipment.weightKg?.toLocaleString()} kg` : "—" },
              { icon: <MapPin size={14} />, label: "Distance", value: shipment.distanceKm ? `${shipment.distanceKm} km` : "—" },
              {
                icon: <Calendar size={14} />, label: "Deadline",
                value: daysLeft !== null
                  ? `${shipment.deadlineDate} (${daysLeft}d left)`
                  : shipment.deadlineDate || "—"
              },
              {
                icon: <DollarSign size={14} />, label: "Budget",
                value: shipment.budgetAmount ? `₹${shipment.budgetAmount?.toLocaleString()}` : "—",
                highlight: true
              },
            ].map((item, i) => (
              <div key={i} className="bg-gray-800 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
                  {item.icon} {item.label}
                </div>
                <p className={`text-sm font-medium ${item.highlight ? "text-green-400" : "text-white"}`}>
                  {item.value}
                </p>
              </div>
            ))}

            {/* Priority card */}
            {priority && (
              <div className={`bg-gray-800 rounded-xl p-3 border ${priority.bg}`}>
                <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
                  <Shield size={14} /> Priority
                </div>
                <p className={`text-sm font-medium ${priority.class}`}>{priority.label}</p>
              </div>
            )}
          </div>

          {/* Flags */}
          <div className="flex flex-wrap items-center gap-2">
            {shipment.fragile && (
              <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-400 text-xs">⚠ Fragile</span>
            )}
            {shipment.hazardous && (
              <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-xs flex items-center gap-1">
                <Flame size={10} /> Hazardous
              </span>
            )}
            {shipment.requiresRefrigeration && (
              <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs flex items-center gap-1">
                <Snowflake size={10} /> Refrigerated
              </span>
            )}
          </div>
        </div>

        {/* Priority tip */}
        {priority && (
          <div className={`border rounded-2xl p-4 flex items-start gap-3 ${priority.bg}`}>
            <Zap size={16} className={`${priority.class} mt-0.5 shrink-0`} />
            <div>
              <p className={`text-sm font-medium ${priority.class}`}>
                This company prioritizes {priority.label.toLowerCase()}
              </p>
              <p className="text-gray-500 text-xs mt-0.5">
                {shipment.priorityType === "SAFETY" && "Emphasize your safety record and on-time delivery history in your bid."}
                {shipment.priorityType === "SPEED" && "Offer the fastest estimated delivery time you can reliably commit to."}
                {shipment.priorityType === "COST" && "A competitive bid amount will work in your favour for this shipment."}
              </p>
            </div>
          </div>
        )}

        {/* Already bid */}
        {existingBid && !submitted ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-4">Your bid</h2>
            <div className={`border rounded-xl p-4 ${
              existingBid.status === "ACCEPTED" ? "border-green-500/30 bg-green-500/5" :
              existingBid.status === "WITHDRAWN" ? "border-gray-700 bg-gray-800/50" :
              "border-gray-700 bg-gray-800/50"
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2 py-0.5 rounded-full text-xs border font-medium ${
                  existingBid.status === "ACCEPTED" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                  existingBid.status === "PENDING" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                  "bg-gray-500/10 text-gray-400 border-gray-500/20"
                }`}>
                  {existingBid.status}
                </span>
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-gray-500 text-xs">Bid amount</p>
                  <p className="text-green-400 font-bold text-lg">₹{existingBid.bidAmount?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Est. delivery</p>
                  <p className="text-white font-medium">{existingBid.estimatedDeliveryDays} days</p>
                </div>
              </div>
              {existingBid.note && (
                <p className="text-gray-400 text-xs mt-3 italic">"{existingBid.note}"</p>
              )}
            </div>
            {existingBid.status === "ACCEPTED" && (
              <div className="flex items-center gap-2 mt-4 text-green-400 text-sm">
                <CheckCircle size={16} /> Your bid was accepted! Get ready to pick up the shipment.
              </div>
            )}
          </div>
        ) : submitted ? (
          /* Success state */
          <div className="bg-gray-900 border border-green-500/20 rounded-2xl p-8 text-center">
            <div className="w-14 h-14 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-green-400" />
            </div>
            <h2 className="text-white font-bold text-lg mb-2">Bid placed successfully!</h2>
            <p className="text-gray-400 text-sm mb-6">
              The company will review your bid and notify you if accepted.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link to="/driver/bids"
                className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-colors">
                View my bids
              </Link>
              <Link to="/driver/shipments"
                className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-xl transition-colors">
                Browse more
              </Link>
            </div>
          </div>
        ) : (
          /* Bid form */
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-6">Place your bid</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Bid amount (₹)
                    {shipment.budgetAmount && (
                      <span className="text-gray-600 ml-1">· budget ₹{shipment.budgetAmount?.toLocaleString()}</span>
                    )}
                  </label>
                  <input
                    type="number"
                    value={form.bidAmount}
                    onChange={(e) => setForm({ ...form, bidAmount: e.target.value })}
                    placeholder="40000"
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Estimated delivery (days)</label>
                  <input
                    type="number"
                    value={form.estimatedDeliveryDays}
                    onChange={(e) => setForm({ ...form, estimatedDeliveryDays: e.target.value })}
                    placeholder="3"
                    required
                    min="1"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Note <span className="text-gray-600">— optional</span>
                </label>
                <textarea
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  placeholder="Tell the company why you're the best fit for this shipment..."
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {submitting
                  ? <Loader2 size={18} className="animate-spin" />
                  : <><Send size={16} /> Place bid</>}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}