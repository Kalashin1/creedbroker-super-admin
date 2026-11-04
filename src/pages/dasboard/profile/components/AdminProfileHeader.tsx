// src/components/admin/profile/AdminProfileHeader.tsx
import React, { useState } from "react";
import { Shield, Mail, Calendar, BadgeCheck } from "lucide-react";
import type { UserProfile } from "../../../../types/user.types";

interface Props {
  profile: UserProfile;
}

export const AdminProfileHeader: React.FC<Props> = ({ profile }) => {
  const [imageError, setImageError] = useState(false);
  const showImage = profile.photoUrl && !imageError;

  const formatDate = (date: any) => {
    if (!date) return "—";
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-center">
        {/* Avatar */}
        <div className="relative">
          {showImage ? (
            <img
              src={profile.photoUrl}
              alt={profile.fullName}
              onError={() => setImageError(true)}
              className="h-24 w-24 shrink-0 rounded-2xl object-cover shadow-lg ring-2 ring-slate-700"
            />
          ) : (
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-3xl font-bold text-white shadow-lg">
              {profile.fullName?.charAt(0).toUpperCase() || "A"}
            </div>
          )}
          <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-violet-500 ring-2 ring-slate-900">
            <Shield className="h-3.5 w-3.5 text-white" />
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold text-white truncate">
              {profile.fullName || "Admin"}
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-violet-400">
              <Shield className="h-3 w-3" />
              {profile.role === "admin" ? "Administrator" : "Super Admin"}
            </span>
            {profile.emailVerified && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                <BadgeCheck className="h-3 w-3" />
                Verified
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-1.5">
              <Mail className="h-4 w-4" />
              <span className="truncate">{profile.email}</span>
            </div>
            {profile.phone && (
              <div className="flex items-center gap-1.5">
                <span>📱</span>
                <span>{profile.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>Member since {formatDate(profile.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
