import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Package, Loader2, Clock, CheckCircle,
  XCircle, MinusCircle, DollarSign, Calendar,
  ChevronRight, Truck
} from "lucide-react";
import { getBidsByDriver, getShipmentById, withdrawBid } from "../../api/shipmentApi";
import { useAuth } from "../../context/AuthContext";

const BID_STATUS_STYLES = {
  PENDING:   { label: "Pending",   class: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", icon: <Clock size={12} /> },
  ACCEPTED:  { label: "Accepted",  class: "bg-green-500/10 text-green-400 border-green-500/20",  icon: <CheckCircle size={12} /> },
  REJECTED:  { label: "Rejected",  class: "bg-red-500/10 text-red-400 border-red-500/20",        icon: <XCircle size={12} /> },
  WITHDRAWN: { label: "Withdrawn", class: "bg-gray-500/10 text-gray-400 border-gray-500/20",     icon: <MinusCircle size={12} /> },
};

const ALL_FILTERS = ["ALL", "PENDING", "ACCEPTED", "REJECTED", "WITHDRAWN"];

const formatLabel = (str) =>
  str?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "";

export default function MyBids() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bids, setBids] = useState([]);
  const [shipmentMap, setShipmentMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [withdrawing, setWithdrawing] = useState("");

  useEffect(() => {
    fetchBids();
  }, []);

  const fetchBids = async () => {
    setLoading(true);
    try {
      const res = await getBidsByDriver(user.id);
      const bidsData = res.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setBids(bidsData);

      // fetch shipment details for each bid
      const uniqueShipmentIds = [...new Set(bidsData.map((b) => b.shipmentId))];
      const entries = await Promise.all(
        uniqueShipmentIds.map(async (sId) => {
          try {
            const sRes = await getShipmentById(sId);
            return [sId, sRes.data];
          } catch {
            return [sId, null];
          }
        })
      );
      setShipmentMap(Object.fromEntries(entries));
    } catch {
      setBids([]);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (bidId) => {
    if (!window.confirm("Withdraw this bid?")) return;
    setWithdrawing(bidId);
    try {
      await withdrawBid(bidId);
      await fetchBids();
    } catch {
      // silently fail
    } finally {
      setWithdrawing("");
    }
  };

  const filtered = filter === "ALL"
    ? bids
    : bids.filter((b) => b.status === filter);

  return (
    <div className="min-h-screen bg-gray-950 pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">My Bids</h1>
          <p className="text-gray-500 text-sm mt-1">{bids.length} total bids placed</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { status: "PENDING",   count: bids.filter((b) => b.status === "PENDING").length },
            { status: "ACCEPTED",  count: bids.filter((b) => b.status === "ACCEPTED").length },
            { status: "REJECTED",  count: bids.filter((b) => b.status === "REJECTED").length },
            { status: "WITHDRAWN", count: bids.filter((b) => b.status === "WITHDRAWN").length },
          ].map(({ status, count }) => {
            const style = BID_STATUS_STYLES[status];
            return (
              <div key={status}
                onClick={() => setFilter(status)}
                className={`bg-gray-900 border rounded-xl p-4 cursor-pointer transition-all hover:-translate-y-0.5 ${
                  filter === status ? "border-blue-500/50" : "border-gray-800"
                }`}>
                <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs border mb-2 ${style.class}`}>
                  {style.icon} {style.label}
                </div>
                <p className="text-2xl font-bold text-white">{count}</p>
              </div>
            );
          })}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          {ALL_FILTERS.map((f) => (
            <button key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === f
                  ? "bg-blue-500 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-white border border-gray-700"
              }`}>
              {f === "ALL" ? "All bids" : BID_STATUS_STYLES[f]?.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={28} className="text-blue-400 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Truck size={28} className="text-gray-600" />
            </div>
            <p className="text-gray-400 font-medium">No bids found</p>
            <p className="text-gray-600 text-sm mt-1">
              {filter === "ALL" ? "Browse shipments to start bidding." : `No ${BID_STATUS_STYLES[filter]?.label.toLowerCase()} bids.`}
            </p>
            {filter === "ALL" && (
              <Link to="/driver/shipments"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-xl transition-colors">
                Browse shipments
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((bid) => {
              const shipment = shipmentMap[bid.shipmentId];
              const style = BID_STATUS_STYLES[bid.status];
              return (
                <div key={bid.id}
                  className={`bg-gray-900 border rounded-2xl p-5 transition-all ${
                    bid.status === "ACCEPTED"
                      ? "border-green-500/30"
                      : "border-gray-800"
                  }`}>
                  <div className="flex items-start justify-between gap-4">

                    {/* Left */}
                    <div className="flex items-start gap-3 flex-1 min-w-0"
                      onClick={() => shipment && navigate(`/driver/shipments/${bid.shipmentId}`)}
                      style={{ cursor: shipment ? "pointer" : "default" }}>
                      <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
                        <Package size={18} className="text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        {/* Shipment route */}
                        {shipment ? (
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-semibold text-sm">{shipment.originCity}</span>
                            <span className="text-gray-600">→</span>
                            <span className="text-white font-semibold text-sm">{shipment.destinationCity}</span>
                            {shipment.distanceKm && (
                              <span className="text-gray-500 text-xs">· {shipment.distanceKm} km</span>
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm mb-1">Shipment details unavailable</p>
                        )}

                        {/* Shipment meta */}
                        {shipment && (
                          <p className="text-gray-500 text-xs mb-2">
                            {formatLabel(shipment.cargoType)}
                            {shipment.weightKg && ` · ${shipment.weightKg?.toLocaleString()} kg`}
                            {shipment.deadlineDate && ` · due ${shipment.deadlineDate}`}
                          </p>
                        )}

                        {/* Bid details */}
                        <div className="flex items-center gap-4 text-sm">
                          <div>
                            <span className="text-gray-500 text-xs">Your bid</span>
                            <p className="text-green-400 font-bold">₹{bid.bidAmount?.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 text-xs">Est. delivery</span>
                            <p className="text-white font-medium">{bid.estimatedDeliveryDays} days</p>
                          </div>
                          {shipment?.budgetAmount && (
                            <div>
                              <span className="text-gray-500 text-xs">Budget</span>
                              <p className="text-gray-400 text-sm">₹{shipment.budgetAmount?.toLocaleString()}</p>
                            </div>
                          )}
                        </div>

                        {bid.note && (
                          <p className="text-gray-500 text-xs mt-2 italic">"{bid.note}"</p>
                        )}

                        {/* Accepted banner */}
                        {bid.status === "ACCEPTED" && (
                          <div className="flex items-center gap-2 mt-3 text-green-400 text-xs">
                            <CheckCircle size={13} /> Bid accepted — prepare for pickup
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border font-medium ${style.class}`}>
                        {style.icon} {style.label}
                      </span>
                      <p className="text-gray-600 text-xs">
                        {new Date(bid.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short"
                        })}
                      </p>
                      {bid.status === "PENDING" && (
                        <button
                          onClick={() => handleWithdraw(bid.id)}
                          disabled={withdrawing === bid.id}
                          className="text-xs text-gray-600 hover:text-red-400 transition-colors flex items-center gap-1"
                        >
                          {withdrawing === bid.id
                            ? <Loader2 size={11} className="animate-spin" />
                            : <MinusCircle size={11} />}
                          Withdraw
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}