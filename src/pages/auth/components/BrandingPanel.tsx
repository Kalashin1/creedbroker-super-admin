// src/components/auth/BrandingPanel.tsx
import React from "react";
import { TrendingUp, Shield, Zap } from "lucide-react";

interface BrandingPanelProps {
  headline: React.ReactNode; // e.g. "Build wealth with <span>confidence</span>"
  description: string;
  badge?: React.ReactNode; // optional top badge (e.g. "Markets open")
}

const FEATURES = [
  {
    icon: Shield,
    title: "Bank-grade Security",
    desc: "Your assets protected with institutional-grade encryption.",
  },
  {
    icon: TrendingUp,
    title: "Proven Returns",
    desc: "Access curated investment packages with transparent performance.",
  },
  {
    icon: Zap,
    title: "Instant Execution",
    desc: "Lightning-fast deposits and withdrawals, 24/7.",
  },
];

const BrandingPanel: React.FC<BrandingPanelProps> = ({
  headline,
  description,
  badge,
}) => (
  <aside className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative flex-col justify-between p-12 xl:p-16 overflow-hidden">
    {/* Gradient overlays */}
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-slate-900 to-cyan-700/20" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.15),transparent_50%)]" />

    {/* Logo */}
    <div className="relative z-10 flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-lg shadow-emerald-500/30">
        <TrendingUp className="h-6 w-6 text-slate-950" strokeWidth={2.5} />
      </div>
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white">
          Vertex<span className="text-emerald-400">Capital</span>
        </h1>
        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
          Global Investments
        </p>
      </div>
    </div>

    {/* Hero content */}
    <div className="relative z-10 max-w-xl space-y-8">
      {badge && <div>{badge}</div>}

      <h2 className="text-4xl xl:text-5xl font-bold leading-[1.1] tracking-tight text-white">
        {headline}
      </h2>

      <p className="text-lg text-slate-300 leading-relaxed">{description}</p>

      {/* Features */}
      <div className="space-y-4 pt-4">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/10 backdrop-blur">
              <feature.icon className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{feature.title}</h3>
              <p className="text-sm text-slate-400">{feature.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Stats */}
    <div className="relative z-10 grid grid-cols-3 gap-6 border-t border-white/10 pt-8">
      <div>
        <div className="text-2xl font-bold text-white">$4.2B+</div>
        <div className="text-xs text-slate-400 mt-1">Assets managed</div>
      </div>
      <div>
        <div className="text-2xl font-bold text-white">120K+</div>
        <div className="text-xs text-slate-400 mt-1">Active investors</div>
      </div>
      <div>
        <div className="text-2xl font-bold text-white">98.7%</div>
        <div className="text-xs text-slate-400 mt-1">Client satisfaction</div>
      </div>
    </div>
  </aside>
);

export default BrandingPanel;
