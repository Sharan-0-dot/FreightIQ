import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Navigation, Package, MapPin, Calendar, Loader2,
  Truck, CheckCircle, Clock, ArrowRight, Building2,
  Weight, DollarSign, Flame, Snowflake, RefreshCw,
  PartyPopper, Search
} from "lucide-react";
import { getAllShipments, updateShipmentStatus } from "../../api/shipmentApi";
import { getCompanyById } from "../../api/companyApi";
import { useAuth } from "../../context/AuthContext";

const STATUS_CONFIG = {
  ASSIGNED: {
    label: "Assigned — awaiting pickup",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    dot: "bg-blue-400",
    actionLabel: "Confirm pickup — mark in transit",
    actionNext: "IN_TRANSIT",
    actionColor: "bg-blue-500 hover:bg-blue-600",
    icon: <Truck size={18} />,
    tip: "Once you have picked up the cargo and are on the road, mark this shipment as in transit.",
  },
  IN_TRANSIT: {
    label: "In transit — on the road",
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/20",
    dot: "bg-orange-400",
    actionLabel: "Confirm delivery — mark delivered",
    actionNext: "DELIVERED",
    actionColor: "bg-orange-500 hover:bg-orange-600",
    icon: <Navigation size={18} />,
    tip: "Once you have successfully delivered the cargo, mark this shipment as delivered.",
  },
};

const formatLabel = (str) =>
  str?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "";

export default function DriverOngoingShipment() {
  const { user } = useAuth();

  const [shipment, setShipment] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [delivered, setDelivered] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOngoingShipment();
  }, []);

  const fetchOngoingShipment = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAllShipments();
      const all = res.data;

      // find shipments assigned to this driver that are active
      const active = all
        .filter(
          (s) =>
            s.assignedDriverId === user.id &&
            (s.status === "ASSIGNED" || s.status === "IN_TRANSIT")
        )
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      if (active.length > 0) {
        const current = active[0];
        setShipment(current);

        // fetch company details
        try {
          const compRes = await getCompanyById(current.companyId);
          setCompany(compRes.data);
        } catch {
          // company fetch failed — not critical
        }
      }
    } catch {
      setError("Failed to load shipment data.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    const config = STATUS_CONFIG[shipment.status];
    if (!config) return;
    setActionLoading(true);
    setError("");
    try {
      await updateShipmentStatus(shipment.id, config.actionNext);
      if (config.actionNext === "DELIVERED") {
        setDelivered(true);
      } else {
        await fetchOngoingShipment();
      }
    } catch (err) {
      setError(err.response?.data || "Failed to update status.");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 pt-24 flex items-center justify-center">
        <Loader2 size={28} className="text-blue-400 animate-spin" />
      </div>
    );
  }

  // ── Delivered success state ──────────────────────────────
  if (delivered) {
    return (
      <div className="min-h-screen bg-gray-950 pt-24 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-gray-900 border border-green-500/20 rounded-2xl p-10 text-center">
          <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Delivery complete!</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            Great work. The company will now review your delivery and submit a rating.
            This will be reflected in your driver score.
          </p>
          <div className="flex flex-col gap-3">
            <Link to="/driver/bids"
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
              <Package size={16} /> View my bids
            </Link>
            <Link to="/driver/shipments"
              className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-xl transition-colors flex items-center justify-center gap-2">
              <Search size={16} /> Browse new shipments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── No active shipment ───────────────────────────────────
  if (!shipment) {
    return (
      <div className="min-h-screen bg-gray-950 pt-24 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Navigation size={36} className="text-gray-600" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No active shipment</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            You don't have any shipment currently assigned to you.
            Browse open shipments and place a bid to get started.
          </p>
          <Link to="/driver/shipments"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition-colors">
            <Search size={16} /> Browse shipments
          </Link>
        </div>
      </div>
    );
  }

  // ── Active shipment ──────────────────────────────────────
  const config = STATUS_CONFIG[shipment.status];
  const daysLeft = shipment.deadlineDate
    ? Math.ceil((new Date(shipment.deadlineDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;
  const isOverdue = daysLeft !== null && daysLeft < 0;

  return (
    <div className="min-h-screen bg-gray-950 pt-24 pb-16 px-6">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-white">My Shipment</h1>
          <p className="text-gray-500 text-sm mt-1">Your currently active delivery</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Status banner */}
        <div className={`border rounded-2xl p-4 flex items-center gap-3 ${config.bg}`}>
          <div className={`w-2.5 h-2.5 rounded-full ${config.dot} animate-pulse shrink-0`} />
          <div className="flex-1">
            <p className={`text-sm font-semibold ${config.color}`}>{config.label}</p>
            <p className="text-gray-500 text-xs mt-0.5">{config.tip}</p>
          </div>
          {config.icon && <span className={config.color}>{config.icon}</span>}
        </div>

        {/* Shipment details card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">

          {/* Route header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
              <Package size={24} className="text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white">{shipment.originCity}</h2>
                <ArrowRight size={18} className="text-gray-500" />
                <h2 className="text-xl font-bold text-white">{shipment.destinationCity}</h2>
              </div>
              {shipment.distanceKm && (
                <p className="text-gray-500 text-sm mt-0.5 flex items-center gap-1">
                  <MapPin size={12} /> {shipment.distanceKm} km
                </p>
              )}
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              {
                icon: <Package size={14} />,
                label: "Cargo type",
                value: formatLabel(shipment.cargoType),
              },
              {
                icon: <Weight size={14} />,
                label: "Weight",
                value: shipment.weightKg
                  ? `${shipment.weightKg?.toLocaleString()} kg`
                  : "—",
              },
              {
                icon: <DollarSign size={14} />,
                label: "Agreed budget",
                value: shipment.budgetAmount
                  ? `₹${shipment.budgetAmount?.toLocaleString()}`
                  : "—",
                highlight: true,
              },
              {
                icon: <Calendar size={14} />,
                label: "Deadline",
                value: shipment.deadlineDate
                  ? `${shipment.deadlineDate}${daysLeft !== null ? ` (${isOverdue ? "overdue" : `${daysLeft}d left`})` : ""}`
                  : "—",
                warn: isOverdue,
              },
            ].map((item, i) => (
              <div key={i} className="bg-gray-800 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
                  {item.icon} {item.label}
                </div>
                <p className={`text-sm font-medium ${
                  item.highlight ? "text-green-400" :
                  item.warn ? "text-red-400" :
                  "text-white"
                }`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* Cargo flags */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {shipment.fragile && (
              <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-400 text-xs">
                ⚠ Fragile — handle with care
              </span>
            )}
            {shipment.hazardous && (
              <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-xs flex items-center gap-1">
                <Flame size={10} /> Hazardous materials
              </span>
            )}
            {shipment.requiresRefrigeration && (
              <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs flex items-center gap-1">
                <Snowflake size={10} /> Refrigeration required
              </span>
            )}
          </div>

          {/* Company info */}
          {company && (
            <div className="border-t border-gray-800 pt-4">
              <p className="text-gray-500 text-xs mb-2">Assigned by</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center">
                  <Building2 size={16} className="text-orange-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{company.name}</p>
                  <p className="text-gray-500 text-xs">{company.industry} · {company.city}, {company.state}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Deadline warning */}
        {isOverdue && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
            <Clock size={16} className="text-red-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-red-400 text-sm font-medium">Deadline has passed</p>
              <p className="text-gray-500 text-xs mt-0.5">
                This delivery is overdue. Complete the delivery as soon as possible
                to minimize impact on your rating.
              </p>
            </div>
          </div>
        )}

        {/* Action button */}
        <button
          onClick={handleStatusUpdate}
          disabled={actionLoading}
          className={`w-full py-4 ${config.actionColor} disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-2xl transition-colors flex items-center justify-center gap-2 text-base`}
        >
          {actionLoading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <>
              {config.icon}
              {config.actionLabel}
            </>
          )}
        </button>

        {/* Refresh */}
        <button
          onClick={fetchOngoingShipment}
          className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-500 hover:text-gray-300 text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <RefreshCw size={14} /> Refresh status
        </button>

      </div>
    </div>
  );
}