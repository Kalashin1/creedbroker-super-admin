// src/components/admin/packages/IconPicker.tsx
import React, { useState } from 'react';
import {
  TrendingUp,
  Zap,
  Crown,
  Gem,
  Building2,
  Rocket,
  Shield,
  Target,
  Award,
  Flame,
  Star,
  Diamond,
  type LucideIcon,
} from 'lucide-react';

interface Props {
  value: string;
  onChange: (iconName: string) => void;
}

const AVAILABLE_ICONS: { name: string; icon: LucideIcon }[] = [
  { name: 'TrendingUp', icon: TrendingUp },
  { name: 'Zap', icon: Zap },
  { name: 'Crown', icon: Crown },
  { name: 'Gem', icon: Gem },
  { name: 'Building2', icon: Building2 },
  { name: 'Rocket', icon: Rocket },
  { name: 'Shield', icon: Shield },
  { name: 'Target', icon: Target },
  { name: 'Award', icon: Award },
  { name: 'Flame', icon: Flame },
  { name: 'Star', icon: Star },
  { name: 'Diamond', icon: Diamond },
];

const IconPicker: React.FC<Props> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedIcon = AVAILABLE_ICONS.find((i) => i.name === value);
  const SelectedIcon = selectedIcon?.icon || TrendingUp;

  return (
    <div className="relative">
      <label className="mb-1.5 block text-xs font-semibold text-slate-300">
        Package Icon
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-left transition hover:border-slate-700"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20">
          <SelectedIcon className="h-5 w-5 text-emerald-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">{value || 'Select icon'}</p>
          <p className="text-[10px] text-slate-500">Click to change</p>
        </div>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 right-0 top-full z-50 mt-2 grid grid-cols-6 gap-2 rounded-xl border border-slate-800 bg-slate-900 p-3 shadow-2xl">
            {AVAILABLE_ICONS.map((item) => {
              const Icon = item.icon;
              const isSelected = item.name === value;
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => {
                    onChange(item.name);
                    setIsOpen(false);
                  }}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg transition ${
                    isSelected
                      ? 'bg-emerald-500/20 border border-emerald-500/30'
                      : 'hover:bg-slate-800 border border-transparent'
                  }`}
                  title={item.name}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      isSelected ? 'text-emerald-400' : 'text-slate-400'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default IconPicker;