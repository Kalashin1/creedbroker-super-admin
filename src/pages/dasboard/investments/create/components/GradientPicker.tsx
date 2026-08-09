// src/components/admin/packages/GradientPicker.tsx
import React, { useState } from "react";

interface Props {
  fromValue: string;
  toValue: string;
  onChange: (from: string, to: string) => void;
}

const GRADIENT_PRESETS: { from: string; to: string; label: string }[] = [
  { from: "from-orange-500", to: "to-amber-600", label: "Bitcoin" },
  { from: "from-indigo-500", to: "to-purple-600", label: "Ethereum" },
  { from: "from-yellow-500", to: "to-amber-500", label: "BNB" },
  { from: "from-purple-500", to: "to-pink-500", label: "Solana" },
  { from: "from-emerald-500", to: "to-cyan-500", label: "Emerald" },
  { from: "from-blue-500", to: "to-cyan-500", label: "Ocean" },
  { from: "from-violet-500", to: "to-purple-500", label: "Royal" },
  { from: "from-amber-500", to: "to-orange-500", label: "Gold" },
  { from: "from-red-500", to: "to-rose-500", label: "Ruby" },
  { from: "from-teal-500", to: "to-emerald-500", label: "Teal" },
  { from: "from-pink-500", to: "to-rose-500", label: "Pink" },
  { from: "from-slate-600", to: "to-slate-800", label: "Slate" },
];

const GradientPicker: React.FC<Props> = ({ fromValue, toValue, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <label className="mb-1.5 block text-xs font-semibold text-slate-300">
        Gradient Colors
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-left transition hover:border-slate-700"
      >
        <div
          className={`h-10 w-10 rounded-lg bg-gradient-to-br ${fromValue} ${toValue}`}
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-mono text-white truncate">
            {fromValue.replace("from-", "")} → {toValue.replace("to-", "")}
          </p>
          <p className="text-[10px] text-slate-500">Click to change</p>
        </div>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 right-0 top-full z-50 mt-2 grid grid-cols-4 gap-2 rounded-xl border border-slate-800 bg-slate-900 p-3 shadow-2xl">
            {GRADIENT_PRESETS.map((preset) => {
              const isSelected =
                preset.from === fromValue && preset.to === toValue;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    onChange(preset.from, preset.to);
                    setIsOpen(false);
                  }}
                  className={`flex flex-col items-center gap-1 rounded-lg p-2 transition ${
                    isSelected
                      ? "bg-slate-800 ring-2 ring-emerald-500/50"
                      : "hover:bg-slate-800"
                  }`}
                >
                  <div
                    className={`h-8 w-8 rounded-md bg-gradient-to-br ${preset.from} ${preset.to}`}
                  />
                  <span className="text-[9px] text-slate-400">
                    {preset.label}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export { GRADIENT_PRESETS };
export default GradientPicker;
