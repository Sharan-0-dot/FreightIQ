import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Package, MapPin, Calendar, ChevronLeft, Loader2,
  Truck, Star, CheckCircle, Clock, AlertTriangle,
  Flame, Snowflake, Trash2, RefreshCw, User,
  Weight, Zap, DollarSign, Shield, Sparkles, Trophy, Medal, Award
} from "lucide-react";
import {
  getShipmentById, getBidsForShipment, acceptBid,
  updateShipmentStatus, assignDriver, deleteShipment
} from "../../api/shipmentApi";
import { getDriverById } from "../../api/driverApi";
import { getMLRecommendations } from "../../api/mlApi";

const STATUS_STYLES = {
  OPEN:       { label: "Open",        class: "bg-green-500/10 text-green-400 border-green-500/20" },
  ASSIGNED:   { label: "Assigned",    class: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  IN_TRANSIT: { label: "In transit",  class: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  DELIVERED:  { label: "Delivered",   class: "bg-gray-500/10 text-gray-400 border-gray-500/20" },
  CANCELLED:  { label: "Cancelled",   class: "bg-red-500/10 text-red-400 border-red-500/20" },
};

const BID_STATUS_STYLES = {
  PENDING:   { label: "Pending",   class: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  ACCEPTED:  { label: "Accepted",  class: "bg-green-500/10 text-green-400 border-green-500/20" },
  REJECTED:  { label: "Rejected",  class: "bg-red-500/10 text-red-400 border-red-500/20" },
  WITHDRAWN: { label: "Withdrawn", class: "bg-gray-500/10 text-gray-400 border-gray-500/20" },
};

const NEXT_STATUSES = {
  ASSIGNED:   "IN_TRANSIT",
  IN_TRANSIT: "DELIVERED",
};

const STATUS_ACTION_LABELS = {
  IN_TRANSIT: "Mark as in transit",
  DELIVERED:  "Mark as delivered",
};

const formatLabel = (str) =>
  str?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "";

export default function ShipmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [shipment, setShipment] = useState(null);
  const [bids, setBids] = useState([]);
  const [driverMap, setDriverMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState("");
  const [recFetched, setRecFetched] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [id]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [shipRes, bidRes] = await Promise.all([
        getShipmentById(id),
        getBidsForShipment(id),
      ]);
      setShipment(shipRes.data);
      const bidsData = bidRes.data;
      setBids(bidsData);

      // fetch driver details for each unique driverId
      const uniqueDriverIds = [...new Set(bidsData.map((b) => b.driverId))];
      const driverEntries = await Promise.all(
        uniqueDriverIds.map(async (dId) => {
          try {
            const res = await getDriverById(dId);
            return [dId, res.data];
          } catch {
            return [dId, null];
          }
        })
      );
      setDriverMap(Object.fromEntries(driverEntries));
    } catch {
      setError("Failed to load shipment details.");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptBid = async (bid) => {
    if (!window.confirm(`Accept bid from driver for ₹${bid.bidAmount?.toLocaleString()}?`)) return;
    setActionLoading(`accept-${bid.id}`);
    try {
      await acceptBid(bid.id);
      await assignDriver(id, bid.driverId);
      await fetchAll();
    } catch {
      setError("Failed to accept bid.");
    } finally {
      setActionLoading("");
    }
  };

  const handleStatusUpdate = async () => {
    const nextStatus = NEXT_STATUSES[shipment.status];
    if (!nextStatus) return;
    setActionLoading("status");
    try {
      await updateShipmentStatus(id, nextStatus);
      await fetchAll();
    } catch {
      setError("Failed to update status.");
    } finally {
      setActionLoading("");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this shipment? This cannot be undone.")) return;
    try {
      await deleteShipment(id);
      navigate("/company/shipments");
    } catch {
      setError("Failed to delete shipment.");
    }
  };

  const handleGetRecommendations = async () => {
    setRecLoading(true);
    setRecError("");
    try {
      const res = await getMLRecommendations(id);
      setRecommendations(res.data.recommendations);
      setRecFetched(true);
    } catch {
      setRecError("Failed to get recommendations. Make sure the ML service is running on port 8000.");
    } finally {
      setRecLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 pt-24 flex items-center justify-center">
        <Loader2 size={28} className="text-orange-400 animate-spin" />
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

  const status = STATUS_STYLES[shipment.status] || STATUS_STYLES.OPEN;
  const pendingBids = bids.filter((b) => b.status === "PENDING");
  const acceptedBid = bids.find((b) => b.status === "ACCEPTED");
  const assignedDriver = shipment.assignedDriverId ? driverMap[shipment.assignedDriverId] : null;
  const canAdvanceStatus = !!NEXT_STATUSES[shipment.status];

  return (
    <div className="min-h-screen bg-gray-950 pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Back */}
        <Link to="/company/shipments"
          className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-300 text-sm transition-colors">
          <ChevronLeft size={16} /> Back to shipments
        </Link>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Shipment header card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center">
                <Package size={24} className="text-orange-400" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-xl font-bold text-white">
                    {shipment.originCity} → {shipment.destinationCity}
                  </h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${status.class}`}>
                    {status.label}
                  </span>
                </div>
                <p className="text-gray-500 text-sm">
                  Posted {new Date(shipment.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric"
                  })}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {canAdvanceStatus && (
                <button onClick={handleStatusUpdate} disabled={actionLoading === "status"}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-xl transition-colors">
                  {actionLoading === "status"
                    ? <Loader2 size={14} className="animate-spin" />
                    : <RefreshCw size={14} />}
                  {STATUS_ACTION_LABELS[NEXT_STATUSES[shipment.status]]}
                </button>
              )}
              {shipment.status === "DELIVERED" && (
                <Link to={`/company/shipments/${id}/review`}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 text-sm font-medium rounded-xl transition-colors">
                  <Star size={14} /> Submit review
                </Link>
              )}
              {shipment.status === "OPEN" && (
                <button onClick={handleDelete}
                  className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <Package size={15} />, label: "Cargo type", value: formatLabel(shipment.cargoType) },
              { icon: <Weight size={15} />, label: "Weight", value: shipment.weightKg ? `${shipment.weightKg?.toLocaleString()} kg` : "—" },
              { icon: <MapPin size={15} />, label: "Distance", value: shipment.distanceKm ? `${shipment.distanceKm} km` : "—" },
              { icon: <Calendar size={15} />, label: "Deadline", value: shipment.deadlineDate || "—" },
              { icon: <DollarSign size={15} />, label: "Budget", value: shipment.budgetAmount ? `₹${shipment.budgetAmount?.toLocaleString()}` : "—" },
              { icon: <Shield size={15} />, label: "Priority", value: formatLabel(shipment.priorityType) },
              {
                icon: <Zap size={15} />, label: "Special requirements",
                value: [
                  shipment.fragile && "Fragile",
                  shipment.hazardous && "Hazardous",
                  shipment.requiresRefrigeration && "Refrigerated",
                ].filter(Boolean).join(", ") || "None"
              },
              { icon: <Truck size={15} />, label: "Assigned driver", value: assignedDriver?.name || (shipment.assignedDriverId ? "Loading..." : "Not assigned") },
            ].map((item, i) => (
              <div key={i} className="bg-gray-800 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
                  {item.icon} {item.label}
                </div>
                <p className="text-white text-sm font-medium">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Assigned driver card */}
        {assignedDriver && (
          <div className="bg-gray-900 border border-blue-500/20 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Truck size={16} className="text-blue-400" /> Assigned driver
            </h2>
            <DriverCard driver={assignedDriver} bid={acceptedBid} isAssigned />
          </div>
        )}

        {/* AI Recommendation section */}
        {shipment.status === "OPEN" && pendingBids.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-center">
                  <Sparkles size={16} className="text-purple-400" />
                </div>
                <div>
                  <h2 className="text-white font-semibold">AI Driver Recommendation</h2>
                  <p className="text-gray-500 text-xs mt-0.5">
                    Ranks drivers based on rating, experience, on-time rate, and your priority
                  </p>
                </div>
              </div>
        
              {!recFetched && (
                <button
                  onClick={handleGetRecommendations}
                  disabled={recLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 text-sm font-medium rounded-xl transition-colors shrink-0"
                >
                  {recLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Sparkles size={14} />
                  )}
                  {recLoading ? "Analysing drivers..." : "Get recommendation"}
                </button>
              )}

              {recFetched && (
                <button
                  onClick={() => { setRecFetched(false); setRecommendations([]); }}
                  className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
            
            {recError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm mt-4">
                {recError}
              </div>
            )}

            {/* Recommendation cards */}
            {recFetched && recommendations.length > 0 && (
              <div className="mt-6 space-y-3">
                {recommendations.map((rec) => {
                  const driver = driverMap[rec.driverId];
                  const bid = pendingBids.find((b) => b.driverId === rec.driverId);
                  const onTimeRate = driver?.totalAcceptedTrips
                    ? (((driver.totalAcceptedTrips - (driver.totalDelayedTrips || 0)) / driver.totalAcceptedTrips) * 100).toFixed(0)
                    : null;
                
                  const rankConfig = {
                    1: {
                      icon: <Trophy size={16} className="text-yellow-400" />,
                      label: "Best match",
                      border: "border-yellow-500/30",
                      bg: "bg-yellow-500/5",
                      badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
                      scoreColor: "text-yellow-400",
                    },
                    2: {
                      icon: <Medal size={16} className="text-gray-400" />,
                      label: "2nd choice",
                      border: "border-gray-600/40",
                      bg: "bg-gray-800/40",
                      badge: "bg-gray-500/10 text-gray-400 border-gray-500/20",
                      scoreColor: "text-gray-300",
                    },
                    3: {
                      icon: <Award size={16} className="text-orange-400/70" />,
                      label: "3rd choice",
                      border: "border-orange-500/20",
                      bg: "bg-orange-500/5",
                      badge: "bg-orange-500/10 text-orange-400/70 border-orange-500/20",
                      scoreColor: "text-orange-400/70",
                    },
                  }[rec.rank];
                
                  return (
                    <div
                      key={rec.driverId}
                      className={`border rounded-2xl p-5 ${rankConfig.border} ${rankConfig.bg}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                  
                          {/* Rank badge */}
                          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium shrink-0 ${rankConfig.badge}`}>
                            {rankConfig.icon}
                            {rankConfig.label}
                          </div>
                  
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold text-sm mb-1">
                              {driver?.name || "Driver"}
                            </p>
                  
                            {/* Driver stats */}
                            {driver && (
                              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">
                                {driver.ratingAverage && (
                                  <span className="flex items-center gap-1 text-yellow-400">
                                    <Star size={11} className="fill-yellow-400" />
                                    {driver.ratingAverage.toFixed(1)}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <CheckCircle size={11} />
                                  {driver.totalCompletedTrips ?? 0} trips
                                </span>
                                {onTimeRate && (
                                  <span className="flex items-center gap-1 text-green-400">
                                    <Clock size={11} /> {onTimeRate}% on time
                                  </span>
                                )}
                                <span>{driver.experienceYears} yrs exp</span>
                                {driver.incidentCount > 0 && (
                                  <span className="flex items-center gap-1 text-red-400">
                                    <AlertTriangle size={11} /> {driver.incidentCount} incidents
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Bid info */}
                            {bid && (
                              <div className="flex items-center gap-4 text-sm">
                                <div>
                                  <p className="text-gray-500 text-xs">Bid amount</p>
                                  <p className="text-green-400 font-bold">
                                    ₹{bid.bidAmount?.toLocaleString()}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500 text-xs">Est. delivery</p>
                                  <p className="text-white font-medium">
                                    {bid.estimatedDeliveryDays} days
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                          
                        {/* Score + Accept */}
                        <div className="flex flex-col items-end gap-3 shrink-0">
                          <div className="text-right">
                            <p className="text-gray-500 text-xs">Match score</p>
                            <p className={`text-2xl font-bold ${rankConfig.scoreColor}`}>
                              {rec.score}
                            </p>
                            <p className="text-gray-600 text-xs">out of 100</p>
                          </div>
                          
                          {bid && shipment.status === "OPEN" && (
                            <button
                              onClick={() => handleAcceptBid(bid)}
                              disabled={actionLoading === `accept-${bid.id}`}
                              className="flex items-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-medium rounded-xl transition-colors"
                            >
                              {actionLoading === `accept-${bid.id}`
                                ? <Loader2 size={14} className="animate-spin" />
                                : <CheckCircle size={14} />}
                              Accept
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                <p className="text-gray-600 text-xs text-center pt-1">
                  Scores are generated by the FreightIQ ML model
                </p>
              </div>
            )}

            {/* Empty state — no pending bids to rank */}
            {recFetched && recommendations.length === 0 && (
              <div className="mt-4 text-center py-6 text-gray-500 text-sm">
                No drivers to rank yet.
              </div>
            )}
          </div>
        )}

        {/* Bids section */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-semibold">
              Bids received
              <span className="ml-2 text-sm text-gray-500 font-normal">
                {bids.length} total · {pendingBids.length} pending
              </span>
            </h2>
          </div>

          {bids.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Truck size={22} className="text-gray-600" />
              </div>
              <p className="text-gray-400 text-sm">No bids yet</p>
              <p className="text-gray-600 text-xs mt-1">Drivers will bid once your shipment is visible</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bids
                .sort((a, b) => {
                  // accepted first, then pending, then others
                  const order = { ACCEPTED: 0, PENDING: 1, REJECTED: 2, WITHDRAWN: 3 };
                  return (order[a.status] ?? 9) - (order[b.status] ?? 9);
                })
                .map((bid) => (
                  <BidCard
                    key={bid.id}
                    bid={bid}
                    driver={driverMap[bid.driverId]}
                    shipment={shipment}
                    onAccept={() => handleAcceptBid(bid)}
                    actionLoading={actionLoading === `accept-${bid.id}`}
                  />
                ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ── Bid Card ─────────────────────────────────────────────
function BidCard({ bid, driver, shipment, onAccept, actionLoading }) {
  const bidStyle = BID_STATUS_STYLES[bid.status] || BID_STATUS_STYLES.PENDING;
  const canAccept = bid.status === "PENDING" && shipment.status === "OPEN";

  const onTimeRate = driver?.totalAcceptedTrips
    ? (((driver.totalAcceptedTrips - (driver.totalDelayedTrips || 0)) / driver.totalAcceptedTrips) * 100).toFixed(0)
    : null;

  return (
    <div className={`border rounded-2xl p-5 transition-all ${
      bid.status === "ACCEPTED"
        ? "border-green-500/30 bg-green-500/5"
        : "border-gray-800 bg-gray-800/50"
    }`}>
      <div className="flex items-start justify-between gap-4">

        {/* Driver info */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
            <User size={18} className="text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-white font-semibold text-sm">
                {driver?.name || "Driver"}
              </p>
              <span className={`px-2 py-0.5 rounded-full text-xs border ${bidStyle.class}`}>
                {bidStyle.label}
              </span>
            </div>

            {/* Driver stats row */}
            {driver && (
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-2">
                {driver.ratingAverage && (
                  <span className="flex items-center gap-1 text-yellow-400">
                    <Star size={11} className="fill-yellow-400" />
                    {driver.ratingAverage.toFixed(1)}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <CheckCircle size={11} /> {driver.totalCompletedTrips ?? 0} trips
                </span>
                {onTimeRate && (
                  <span className="flex items-center gap-1 text-green-400">
                    <Clock size={11} /> {onTimeRate}% on time
                  </span>
                )}
                {driver.incidentCount > 0 && (
                  <span className="flex items-center gap-1 text-red-400">
                    <AlertTriangle size={11} /> {driver.incidentCount} incidents
                  </span>
                )}
                <span>{driver.experienceYears} yrs exp</span>
              </div>
            )}

            {/* Bid details */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div>
                <span className="text-gray-500 text-xs">Bid amount</span>
                <p className="text-green-400 font-bold">₹{bid.bidAmount?.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Est. delivery</span>
                <p className="text-white font-medium">{bid.estimatedDeliveryDays} days</p>
              </div>
              {bid.note && (
                <div className="w-full">
                  <span className="text-gray-500 text-xs">Note</span>
                  <p className="text-gray-300 text-xs mt-0.5 italic">"{bid.note}"</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Accept button */}
        {canAccept && (
          <button onClick={onAccept} disabled={actionLoading}
            className="flex items-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-medium rounded-xl transition-colors shrink-0">
            {actionLoading
              ? <Loader2 size={14} className="animate-spin" />
              : <CheckCircle size={14} />}
            Accept
          </button>
        )}
      </div>
    </div>
  );
}

// ── Assigned Driver Card ──────────────────────────────────
function DriverCard({ driver, bid }) {
  const onTimeRate = driver?.totalAcceptedTrips
    ? (((driver.totalAcceptedTrips - (driver.totalDelayedTrips || 0)) / driver.totalAcceptedTrips) * 100).toFixed(0)
    : null;

  return (
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
        <Truck size={22} className="text-blue-400" />
      </div>
      <div className="flex-1">
        <p className="text-white font-semibold">{driver.name}</p>
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
          {driver.ratingAverage && (
            <span className="flex items-center gap-1 text-yellow-400">
              <Star size={11} className="fill-yellow-400" /> {driver.ratingAverage.toFixed(1)}
            </span>
          )}
          <span>{driver.experienceYears} yrs experience</span>
          <span className="flex items-center gap-1">
            <CheckCircle size={11} /> {driver.totalCompletedTrips ?? 0} trips
          </span>
          {onTimeRate && (
            <span className="text-green-400">{onTimeRate}% on time</span>
          )}
        </div>
        {bid && (
          <div className="flex items-center gap-4 mt-3 text-sm">
            <div>
              <span className="text-gray-500 text-xs">Accepted bid</span>
              <p className="text-green-400 font-bold">₹{bid.bidAmount?.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">Est. delivery</span>
              <p className="text-white font-medium">{bid.estimatedDeliveryDays} days</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}