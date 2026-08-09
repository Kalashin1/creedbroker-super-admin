// src/components/auth/MobileLogo.tsx
import React from "react";
import { TrendingUp } from "lucide-react";

const MobileLogo: React.FC = () => (
  <div className="lg:hidden flex items-center gap-3 mb-8">
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500">
      <TrendingUp className="h-5 w-5 text-slate-950" strokeWidth={2.5} />
    </div>
    <div>
      <h1 className="text-lg font-bold text-white">
        Vertex<span className="text-emerald-400">Capital</span>
      </h1>
    </div>
  </div>
);

export default MobileLogo;
