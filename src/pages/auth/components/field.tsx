// src/components/auth/Field.tsx
import React from "react";
import { AlertCircle } from "lucide-react";

interface FieldProps {
  label: string;
  icon: React.ReactNode;
  error?: string;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}

const Field: React.FC<FieldProps> = ({
  label,
  icon,
  error,
  trailing,
  children,
}) => (
  <div>
    <label className="mb-1.5 block text-sm font-medium text-slate-300">
      {label}
    </label>
    <div
      className={`group relative flex items-center rounded-xl border bg-slate-900/50 backdrop-blur transition focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/20 ${
        error ? "border-red-500/50" : "border-slate-800 hover:border-slate-700"
      }`}
    >
      <span className="pl-4 text-slate-500 group-focus-within:text-emerald-400 transition">
        {icon}
      </span>
      <div className="flex-1">{children}</div>
      {trailing && <span className="pr-3">{trailing}</span>}
    </div>
    {error && (
      <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
        <AlertCircle className="h-3 w-3" />
        {error}
      </p>
    )}
  </div>
);

export default Field;
