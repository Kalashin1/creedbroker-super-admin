// src/components/auth/utils.ts
export const inputClass = (hasError?: boolean) =>
  `w-full bg-transparent py-3 pl-2 pr-2 text-sm text-white placeholder-slate-500 outline-none ${
    hasError ? "" : ""
  }`;
