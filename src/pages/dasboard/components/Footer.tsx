// src/components/dashboard/Footer.tsx
import React from "react";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-center px-4 sm:px-6">
        <p className="text-xs text-slate-500">
          <span className="text-slate-400">©{currentYear}</span>{" "}
          <span className="font-semibold text-slate-300">CreedMarket</span>
          <span className="hidden sm:inline"> · All rights reserved</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
