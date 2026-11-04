// src/components/admin/profile/ProfileHeader.tsx
import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Ban,
  Clock,
} from "lucide-react";
import type { UserProfile } from "../../../../types/user.types";

interface Props {
  profile: UserProfile;
}

const statusConfig: Record<
  string,
  { label: string; icon: React.ReactNode; classes: string }
> = {
  active: {
    label: "Active",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    classes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  restricted: {
    label: "Restricted",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    classes: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  blocked: {
    label: "Blocked",
    icon: <Ban className="h-3.5 w-3.5" />,
    classes: "bg-red-500/10 text-red-400 border-red-500/20",
  },
  deleted: {
    label: "Deleted",
    icon: <XCircle className="h-3.5 w-3.5" />,
    classes: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  },
};

const kycConfig: Record<
  string,
  { label: string; icon: React.ReactNode; classes: string }
> = {
  none: {
    label: "Not Started",
    icon: <Clock className="h-3.5 w-3.5" />,
    classes: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  },
  pending: {
    label: "Pending",
    icon: <Clock className="h-3.5 w-3.5" />,
    classes: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  verified: {
    label: "Verified",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    classes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  rejected: {
    label: "Rejected",
    icon: <XCircle className="h-3.5 w-3.5" />,
    classes: "bg-red-500/10 text-red-400 border-red-500/20",
  },
};

const ProfileHeader: React.FC<Props> = ({ profile }) => {
  const [imageError, setImageError] = useState(false);

  const status = statusConfig[profile.accountStatus || "active"];
  const kyc = kycConfig[profile.kycStatus || "none"];

  // 🆕 Check for profile image URL (common field names)
  const profileImageUrl = profile.photoUrl || null;

  const showImage = profileImageUrl && !imageError;

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
    <div className="rounded-2xl border border-slate-800 bg-linear-to-br from-slate-900 to-slate-950 p-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        {/* 🆕 Avatar — shows profile image if available, fallback to letter */}
        <div className="relative">
          {showImage ? (
            <img
              src={profileImageUrl}
              alt={profile.fullName || "User"}
              onError={() => setImageError(true)}
              className="h-24 w-24 shrink-0 rounded-2xl object-cover shadow-lg ring-2 ring-slate-700"
            />
          ) : (
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-400 to-cyan-500 text-3xl font-bold text-slate-950 shadow-lg">
              {profile.fullName?.charAt(0).toUpperCase() || "?"}
            </div>
          )}

          {/* Online indicator */}
          {profile.accountStatus === "active" && (
            <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold text-white truncate">
              {profile.fullName || "Unnamed User"}
            </h1>
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                profile.role === "admin"
                  ? "bg-violet-500/10 text-violet-400 border-violet-500/20"
                  : "bg-slate-500/10 text-slate-400 border-slate-500/20"
              }`}
            >
              <Shield className="h-3 w-3" />
              {profile.role === "admin" ? "Admin" : "Client"}
            </span>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-1.5">
              <Mail className="h-4 w-4" />
              <span className="truncate">{profile.email}</span>
              {profile.emailVerified ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <XCircle className="h-3.5 w-3.5 text-red-400" />
              )}
            </div>
            {profile.phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="h-4 w-4" />
                <span>{profile.phone}</span>
              </div>
            )}
            {profile.country && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                <span>{profile.country}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>Joined {formatDate(profile.createdAt)}</span>
            </div>
          </div>

          {/* Status badges */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${status.classes}`}
            >
              {status.icon}
              Account: {status.label}
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${kyc.classes}`}
            >
              {kyc.icon}
              KYC: {kyc.label}
            </span>
            {profile.emailVerified && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                Email Verified
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
