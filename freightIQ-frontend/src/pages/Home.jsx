import { useNavigate } from "react-router-dom";
import { Truck, Building2, Shield, Zap, TrendingDown, Star, ArrowRight, CheckCircle } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 pt-16">

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-orange-500/10 via-transparent to-blue-500/10 pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 mb-8">
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
            <span className="text-orange-400 text-sm font-medium">India's Intelligent Freight Platform</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
            Move Freight
            <span className="block text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-orange-600">
              Smarter.
            </span>
          </h1>

          <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-16 leading-relaxed">
            FreightIQ eliminates middlemen between truck drivers and companies.
            Post shipments, bid intelligently, and get matched by our AI — not a broker.
          </p>

          {/* Two portal cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Company card */}
            <div
              onClick={() => navigate("/company/login")}
              className="group relative bg-gray-900 border border-gray-800 hover:border-orange-500/50 rounded-2xl p-8 cursor-pointer transition-all duration-300 hover:bg-gray-900/80 hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-linear-to-br from-orange-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-14 h-14 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-orange-500/20 transition-colors">
                  <Building2 size={28} className="text-orange-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">I'm a Company</h2>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  Post shipments, review driver bids, and let our system recommend the best match for your cargo.
                </p>
                <div className="flex items-center gap-2 text-orange-400 text-sm font-medium">
                  <span>Get started</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Driver card */}
            <div
              onClick={() => navigate("/driver/login")}
              className="group relative bg-gray-900 border border-gray-800 hover:border-blue-500/50 rounded-2xl p-8 cursor-pointer transition-all duration-300 hover:bg-gray-900/80 hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                  <Truck size={28} className="text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">I'm a Driver</h2>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  Browse available shipments, place competitive bids, and build your reputation — no middlemen.
                </p>
                <div className="flex items-center gap-2 text-blue-400 text-sm font-medium">
                  <span>Get started</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem we're solving */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">The Problem We're Solving</h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            India's freight industry runs on brokers and phone calls. Drivers lose money, companies lose visibility. FreightIQ fixes that.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: <TrendingDown size={24} className="text-red-400" />,
              bg: "bg-red-500/10 border-red-500/20",
              title: "Drivers pay 10–20% commission",
              desc: "Every trip, a broker takes a cut. Drivers do the work, brokers take the margin. There's no direct channel.",
            },
            {
              icon: <Shield size={24} className="text-yellow-400" />,
              bg: "bg-yellow-500/10 border-yellow-500/20",
              title: "Companies have zero trust data",
              desc: "No visibility into driver reliability, safety record, or cargo experience. Every hire is a leap of faith.",
            },
            {
              icon: <Zap size={24} className="text-purple-400" />,
              bg: "bg-purple-500/10 border-purple-500/20",
              title: "Matching is inefficient",
              desc: "The right driver for a fragile electronics shipment is never the same as for heavy machinery. No system knows that.",
            },
          ].map((item, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className={`w-12 h-12 ${item.bg} border rounded-xl flex items-center justify-center mb-4`}>
                {item.icon}
              </div>
              <h3 className="text-white font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-900/50 border-y border-gray-800 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">How FreightIQ Works</h2>
            <p className="text-gray-400">Four steps from shipment to delivery.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {[
              { step: "01", title: "Company posts shipment", desc: "Origin, destination, cargo type, budget, and priority — safety, speed, or cost." },
              { step: "02", title: "Drivers bid", desc: "Eligible drivers browse open shipments and place competitive bids with their offer." },
              { step: "03", title: "AI recommends top 3", desc: "Our ML model scores each driver based on history, rating, and shipment fit." },
              { step: "04", title: "Company selects & ships", desc: "Company picks their driver, shipment is assigned, and tracking begins." },
            ].map((item, i) => (
              <div key={i} className="relative">
                {i < 3 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px bg-linear-to-r from-gray-700 to-transparent z-10" />
                )}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                  <div className="text-4xl font-bold text-orange-500/20 mb-4">{item.step}</div>
                  <h3 className="text-white font-semibold mb-2 text-sm">{item.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold text-white mb-4">Built for the Indian Logistics Market</h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Designed with the real problems of freight in India — GST verification, regional routes, cargo types from pharmaceuticals to heavy machinery.
            </p>
            <div className="space-y-3">
              {[
                "Driver reputation scoring with trip history",
                "Cargo-type aware matching (fragile, hazardous, refrigerated)",
                "Priority-based recommendations — safety, speed, or cost",
                "Post-delivery review system to build trust",
                "No broker fees — direct company to driver",
              ].map((feat, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle size={18} className="text-orange-400 mt-0.5 shrink-0" />
                  <span className="text-gray-300 text-sm">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: "0%", label: "Broker commission", sub: "Direct marketplace" },
              { value: "AI", label: "Driver matching", sub: "ML-powered scoring" },
              { value: "10+", label: "Cargo types", sub: "Fragile to heavy machinery" },
              { value: "Real", label: "Trust scores", sub: "Built from trip history" },
            ].map((stat, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <div className="text-3xl font-bold text-orange-400 mb-1">{stat.value}</div>
                <div className="text-white text-sm font-medium">{stat.label}</div>
                <div className="text-gray-500 text-xs mt-1">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
              <Truck size={13} className="text-white" />
            </div>
            <span className="text-gray-400 text-sm font-medium">FreightIQ</span>
          </div>
          <p className="text-gray-600 text-xs">Built for India's freight industry · Student Project</p>
        </div>
      </footer>
    </div>
  );
}