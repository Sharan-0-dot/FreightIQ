import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Package, PlusCircle, MapPin, Weight, Calendar,
  ChevronRight, Loader2, AlertCircle, Truck, Flame, Snowflake
} from "lucide-react";
import { getShipmentsByCompany } from "../../api/shipmentApi";
import { useAuth } from "../../context/AuthContext";

const STATUS_STYLES = {
  OPEN:       { label: "Open",       class: "bg-green-500/10 text-green-400 border-green-500/20" },
  ASSIGNED:   { label: "Assigned",   class: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  IN_TRANSIT: { label: "In transit", class: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  DELIVERED:  { label: "Delivered",  class: "bg-gray-500/10 text-gray-400 border-gray-500/20" },
  CANCELLED:  { label: "Cancelled",  class: "bg-red-500/10 text-red-400 border-red-500/20" },
};

const PRIORITY_STYLES = {
  SAFETY: { label: "Safety", class: "text-blue-400" },
  SPEED:  { label: "Speed",  class: "text-yellow-400" },
  COST:   { label: "Cost",   class: "text-green-400" },
};

const ALL_STATUSES = ["ALL", "OPEN", "ASSIGNED", "IN_TRANSIT", "DELIVERED", "CANCELLED"];

const formatLabel = (str) =>
  str?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "";

export default function MyShipments() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const res = await getShipmentsByCompany(user.id);
        // newest first
        setShipments(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } catch {
        setShipments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchShipments();
  }, []);

  const filtered = filter === "ALL"
    ? shipments
    : shipments.filter((s) => s.status === filter);

  return (
    <div className="min-h-screen bg-gray-950 pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">My Shipments</h1>
            <p className="text-gray-500 text-sm mt-1">{shipments.length} total shipments</p>
          </div>
          <Link to="/company/post-shipment"
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors">
            <PlusCircle size={16} /> Post shipment
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          {ALL_STATUSES.map((s) => (
            <button key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === s
                  ? "bg-orange-500 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-white border border-gray-700"
              }`}>
              {s === "ALL" ? "All" : STATUS_STYLES[s]?.label}
              {s !== "ALL" && (
                <span className="ml-1.5 text-xs opacity-70">
                  {shipments.filter((sh) => sh.status === s).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={28} className="text-orange-400 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package size={28} className="text-gray-600" />
            </div>
            <p className="text-gray-400 font-medium">No shipments found</p>
            <p className="text-gray-600 text-sm mt-1">
              {filter === "ALL" ? "Post your first shipment to get started." : `No ${STATUS_STYLES[filter]?.label.toLowerCase()} shipments.`}
            </p>
            {filter === "ALL" && (
              <Link to="/company/post-shipment"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-xl transition-colors">
                <PlusCircle size={14} /> Post shipment
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((shipment) => (
              <ShipmentCard
                key={shipment.id}
                shipment={shipment}
                onClick={() => navigate(`/company/shipments/${shipment.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ShipmentCard({ shipment, onClick }) {
  const status = STATUS_STYLES[shipment.status] || STATUS_STYLES.OPEN;
  const priority = PRIORITY_STYLES[shipment.priorityType];

  return (
    <div onClick={onClick}
      className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl p-5 cursor-pointer transition-all hover:-translate-y-0.5 group">
      <div className="flex items-start justify-between gap-4">

        {/* Left */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="w-10 h-10 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
            <Package size={18} className="text-orange-400" />
          </div>
          <div className="flex-1 min-w-0">
            {/* Route */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-white font-semibold text-sm">{shipment.originCity}</span>
              <span className="text-gray-600">→</span>
              <span className="text-white font-semibold text-sm">{shipment.destinationCity}</span>
              {shipment.distanceKm && (
                <span className="text-gray-500 text-xs">· {shipment.distanceKm} km</span>
              )}
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Package size={11} /> {formatLabel(shipment.cargoType)}
              </span>
              {shipment.weightKg && (
                <span className="flex items-center gap-1">
                  <Weight size={11} /> {shipment.weightKg?.toLocaleString()} kg
                </span>
              )}
              {shipment.deadlineDate && (
                <span className="flex items-center gap-1">
                  <Calendar size={11} /> {shipment.deadlineDate}
                </span>
              )}
              {shipment.budgetAmount && (
                <span className="text-green-400 font-medium">
                  ₹{shipment.budgetAmount?.toLocaleString()}
                </span>
              )}
            </div>

            {/* Flags */}
            <div className="flex items-center gap-2 mt-2">
              {shipment.fragile && (
                <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-400 text-xs">
                  ⚠ Fragile
                </span>
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
              {priority && (
                <span className={`text-xs ${priority.class}`}>
                  · {priority.label} priority
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3 shrink-0">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${status.class}`}>
            {status.label}
          </span>
          {shipment.assignedDriverId && (
            <div className="flex items-center gap-1 text-xs text-blue-400">
              <Truck size={12} /> Assigned
            </div>
          )}
          <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
        </div>
      </div>
    </div>
  );
}