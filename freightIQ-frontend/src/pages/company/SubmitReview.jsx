import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Star, ChevronLeft, Loader2, CheckCircle, Truck } from "lucide-react";
import { getShipmentById } from "../../api/shipmentApi";
import { submitReview, getReviewByShipment } from "../../api/shipmentApi";
import { getDriverById } from "../../api/driverApi";
import { useAuth } from "../../context/AuthContext";

export default function SubmitReview() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shipment, setShipment] = useState(null);
  const [driver, setDriver] = useState(null);
  const [existingReview, setExistingReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    rating: 0,
    delayOccurred: false,
    damageReported: false,
    comments: "",
  });

  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const shipRes = await getShipmentById(id);
        const s = shipRes.data;
        setShipment(s);

        if (s.assignedDriverId) {
          const driverRes = await getDriverById(s.assignedDriverId);
          setDriver(driverRes.data);
        }

        try {
          const reviewRes = await getReviewByShipment(id);
          setExistingReview(reviewRes.data);
        } catch {
          // no review yet — that's fine
        }
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
    if (form.rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await submitReview({
        shipmentId: id,
        driverId: shipment.assignedDriverId,
        companyId: user.id,
        rating: form.rating,
        delayOccurred: form.delayOccurred,
        damageReported: form.damageReported,
        comments: form.comments,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 pt-24 flex items-center justify-center">
        <Loader2 size={28} className="text-orange-400 animate-spin" />
      </div>
    );
  }

  // Already reviewed
  if (existingReview) {
    return (
      <div className="min-h-screen bg-gray-950 pt-24 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-400" />
          </div>
          <h2 className="text-white font-bold text-xl mb-2">Review already submitted</h2>
          <p className="text-gray-400 text-sm mb-2">You rated this shipment</p>
          <div className="flex items-center justify-center gap-1 mb-6">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={22}
                className={s <= existingReview.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-700"} />
            ))}
          </div>
          {existingReview.comments && (
            <p className="text-gray-400 text-sm italic mb-6">"{existingReview.comments}"</p>
          )}
          <Link to="/company/shipments"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-xl transition-colors">
            Back to shipments
          </Link>
        </div>
      </div>
    );
  }

  // Submitted success
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-950 pt-24 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-400" />
          </div>
          <h2 className="text-white font-bold text-xl mb-2">Review submitted!</h2>
          <p className="text-gray-400 text-sm mb-6">
            Your feedback helps build the driver's reputation on FreightIQ.
          </p>
          <Link to="/company/shipments"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-xl transition-colors">
            Back to shipments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-24 pb-16 px-6">
      <div className="max-w-xl mx-auto">

        <Link to={`/company/shipments/${id}`}
          className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-300 text-sm mb-6 transition-colors">
          <ChevronLeft size={16} /> Back to shipment
        </Link>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-xl font-bold text-white mb-1">Submit a review</h1>
            <p className="text-gray-500 text-sm">
              {shipment?.originCity} → {shipment?.destinationCity}
            </p>
          </div>

          {/* Driver info */}
          {driver && (
            <div className="flex items-center gap-3 bg-gray-800 rounded-xl p-4 mb-8">
              <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
                <Truck size={18} className="text-blue-400" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">{driver.name}</p>
                <p className="text-gray-500 text-xs">{driver.experienceYears} yrs experience · {driver.totalCompletedTrips ?? 0} trips completed</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Star rating */}
            <div>
              <label className="block text-sm text-gray-400 mb-3">Overall rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setForm({ ...form, rating: star })}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      size={36}
                      className={`transition-colors ${
                        star <= (hoverRating || form.rating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-700"
                      }`}
                    />
                  </button>
                ))}
                {form.rating > 0 && (
                  <span className="ml-2 text-gray-400 text-sm">
                    {["", "Poor", "Below average", "Average", "Good", "Excellent"][form.rating]}
                  </span>
                )}
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <label className="block text-sm text-gray-400 mb-2">Trip flags</label>
              {[
                { key: "delayOccurred", label: "Delivery was delayed", color: "accent-yellow-500" },
                { key: "damageReported", label: "Cargo damage reported", color: "accent-red-500" },
              ].map((flag) => (
                <label key={flag.key}
                  className="flex items-center gap-3 p-3 bg-gray-800 rounded-xl cursor-pointer hover:bg-gray-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={form[flag.key]}
                    onChange={(e) => setForm({ ...form, [flag.key]: e.target.checked })}
                    className={`w-4 h-4 ${flag.color}`}
                  />
                  <span className="text-gray-300 text-sm">{flag.label}</span>
                </label>
              ))}
            </div>

            {/* Comments */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Comments <span className="text-gray-600">— optional</span>
              </label>
              <textarea
                value={form.comments}
                onChange={(e) => setForm({ ...form, comments: e.target.value })}
                placeholder="Describe your experience with this driver..."
                rows={4}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-orange-500 transition-colors resize-none"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={submitting || form.rating === 0}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
              {submitting
                ? <Loader2 size={18} className="animate-spin" />
                : <><Star size={16} /> Submit review</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}