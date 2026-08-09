import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { fetchUserSettings } from '../services/settings.service';
import type { UserSettings } from '../types/settings.types';

interface SettingsContextValue {
  settings: UserSettings | null;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  formatCurrency: (amount: number, forceCurrency?: string) => string;
  formatDate: (date: Date | string) => string;
  formatDateTime: (date: Date | string) => string;
  formatNumber: (num: number, decimals?: number) => string;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSettings = async () => {
    if (!user) {
      setSettings(null);
      setLoading(false);
      return;
    }
    try {
      const data = await fetchUserSettings(user.uid);
      setSettings(data);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, [user]);

  const formatCurrency = useMemo(() => {
    return (amount: number, forceCurrency?: string) => {
      const currency = forceCurrency || settings?.preferredCurrency || 'USD';
      const useEuropeanFormat = settings?.numberFormat === '1.234,56';
      return new Intl.NumberFormat(useEuropeanFormat ? 'de-DE' : 'en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    };
  }, [settings?.preferredCurrency, settings?.numberFormat]);

  const formatDate = useMemo(() => {
    return (date: Date | string) => {
      const d = typeof date === 'string' ? new Date(date) : date;
      const format = settings?.dateFormat || 'MM/DD/YYYY';
      const useEuropeanFormat = settings?.numberFormat === '1.234,56';
      const locale = useEuropeanFormat ? 'de-DE' : 'en-US';
      const formatMap: Record<string, Intl.DateTimeFormatOptions> = {
        'MM/DD/YYYY': { month: '2-digit', day: '2-digit', year: 'numeric' },
        'DD/MM/YYYY': { day: '2-digit', month: '2-digit', year: 'numeric' },
        'YYYY-MM-DD': { year: 'numeric', month: '2-digit', day: '2-digit' },
      };
      return new Intl.DateTimeFormat(locale, formatMap[format]).format(d);
    };
  }, [settings?.dateFormat, settings?.numberFormat]);

  const formatDateTime = useMemo(() => {
    return (date: Date | string) => {
      const d = typeof date === 'string' ? new Date(date) : date;
      const timezone = settings?.timezone || 'UTC';
      const useEuropeanFormat = settings?.numberFormat === '1.234,56';
      return new Intl.DateTimeFormat(useEuropeanFormat ? 'de-DE' : 'en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit', timeZone: timezone,
      }).format(d);
    };
  }, [settings?.timezone, settings?.numberFormat]);

  const formatNumber = useMemo(() => {
    return (num: number, decimals: number = 2) => {
      const useEuropeanFormat = settings?.numberFormat === '1.234,56';
      return new Intl.NumberFormat(useEuropeanFormat ? 'de-DE' : 'en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(num);
    };
  }, [settings?.numberFormat]);

  const value = useMemo(() => ({
    settings, loading, refreshSettings, formatCurrency, formatDate, formatDateTime, formatNumber,
  }), [settings, loading, formatCurrency, formatDate, formatDateTime, formatNumber]);

  return React.createElement(SettingsContext.Provider, {value}, children)
  
};

export const useSettings = (): SettingsContextValue => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within a SettingsProvider');
  return ctx;
};