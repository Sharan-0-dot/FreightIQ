import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package, MapPin, Calendar, Loader2, Search,
  Flame, Snowflake, Weight, DollarSign, Filter
} from "lucide-react";
import { getAllShipments } from "../../api/shipmentApi";

const CARGO_TYPES = [
  "ALL", "GENERAL", "FRAGILE", "PERISHABLE", "HAZARDOUS",
  "REFRIGERATED", "HEAVY_MACHINERY", "LIQUID",
  "ELECTRONICS", "FURNITURE", "PHARMACEUTICALS"
];

const PRIORITY_STYLES = {
  SAFETY: { label: "Safety", class: "text-blue-400" },
  SPEED:  { label: "Speed",  class: "text-yellow-400" },
  COST:   { label: "Cost",   class: "text-green-400" },
};

const formatLabel = (str) =>
  str?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "";

export default function BrowseShipments() {
  const navigate = useNavigate();

  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cargoFilter, setCargoFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const res = await getAllShipments();
        // only show OPEN shipments to drivers
        const open = res.data.filter((s) => s.status === "OPEN");
        setShipments(open);
      } catch {
        setShipments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchShipments();
  }, []);

  const filtered = shipments
    .filter((s) => {
      const matchSearch =
        s.originCity?.toLowerCase().includes(search.toLowerCase()) ||
        s.destinationCity?.toLowerCase().includes(search.toLowerCase());
      const matchCargo =
        cargoFilter === "ALL" || s.cargoType === cargoFilter;
      return matchSearch && matchCargo;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "budget_high") return (b.budgetAmount || 0) - (a.budgetAmount || 0);
      if (sortBy === "budget_low") return (a.budgetAmount || 0) - (b.budgetAmount || 0);
      if (sortBy === "deadline") return new Date(a.deadlineDate) - new Date(b.deadlineDate);
      return 0;
    });

  return (
    <div className="min-h-screen bg-gray-950 pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Browse Shipments</h1>
          <p className="text-gray-500 text-sm mt-1">
            {shipments.length} open shipments available
          </p>
        </div>

        {/* Search + Sort bar */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by city..."
              className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-4 py-2.5 text-gray-300 text-sm focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer"
            >
              <option value="newest">Newest first</option>
              <option value="budget_high">Budget: high to low</option>
              <option value="budget_low">Budget: low to high</option>
              <option value="deadline">Deadline: soonest</option>
            </select>
          </div>
        </div>

        {/* Cargo filter pills */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          {CARGO_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setCargoFilter(type)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                cargoFilter === type
                  ? "bg-blue-500 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-white border border-gray-700"
              }`}
            >
              {type === "ALL" ? "All types" : formatLabel(type)}
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
              <Package size={28} className="text-gray-600" />
            </div>
            <p className="text-gray-400 font-medium">No shipments found</p>
            <p className="text-gray-600 text-sm mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((shipment) => (
              <ShipmentCard
                key={shipment.id}
                shipment={shipment}
                onClick={() => navigate(`/driver/shipments/${shipment.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ShipmentCard({ shipment, onClick }) {
  const priority = PRIORITY_STYLES[shipment.priorityType];
  const daysLeft = shipment.deadlineDate
    ? Math.ceil((new Date(shipment.deadlineDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div
      onClick={onClick}
      className="bg-gray-900 border border-gray-800 hover:border-blue-500/40 rounded-2xl p-5 cursor-pointer transition-all hover:-translate-y-0.5 group"
    >
      <div className="flex items-start justify-between gap-4">

        {/* Left */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
            <Package size={18} className="text-blue-400" />
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

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-2">
              <span className="flex items-center gap-1">
                <Package size={11} /> {formatLabel(shipment.cargoType)}
              </span>
              {shipment.weightKg && (
                <span className="flex items-center gap-1">
                  <Weight size={11} /> {shipment.weightKg?.toLocaleString()} kg
                </span>
              )}
              {shipment.deadlineDate && (
                <span className={`flex items-center gap-1 ${daysLeft !== null && daysLeft <= 3 ? "text-red-400" : ""}`}>
                  <Calendar size={11} />
                  {daysLeft !== null && daysLeft >= 0
                    ? `${daysLeft} days left`
                    : shipment.deadlineDate}
                </span>
              )}
            </div>

            {/* Flags */}
            <div className="flex flex-wrap items-center gap-2">
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

        {/* Right — budget */}
        <div className="text-right shrink-0">
          {shipment.budgetAmount && (
            <div className="mb-2">
              <p className="text-xs text-gray-500 mb-0.5">Budget</p>
              <p className="text-green-400 font-bold text-lg">
                ₹{shipment.budgetAmount?.toLocaleString()}
              </p>
            </div>
          )}
          <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded-full font-medium">
            Open
          </span>
        </div>
      </div>
    </div>
  );
}