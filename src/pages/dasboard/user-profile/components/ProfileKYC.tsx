// src/components/admin/profile/ProfileKYC.tsx
import React, { useState } from "react";
import {
  FileCheck,
  IdCard,
  MapPin,
  Receipt,
  Eye,
  X,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  FileText,
  ExternalLink,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { detectFileType, getDocumentUrl } from "../../../../utils/fileHelper";
import type { UserProfile } from "../../../../types/user.types";

interface Props {
  profile: UserProfile;
}

const ProfileKYC: React.FC<Props> = ({ profile }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const v = profile.verification || {
    location: { status: "not_started" },
    identity: { status: "not_started" },
    tax: { status: "not_started" },
  };

  const docs = v.identity?.documents || {};
  const tax = v.tax || {};

  const getStatusBadge = (status: string) => {
    const config: Record<
      string,
      { icon: React.ReactNode; classes: string; label: string }
    > = {
      not_started: {
        icon: <Clock className="h-3 w-3" />,
        classes: "bg-slate-500/10 text-slate-400 border-slate-500/20",
        label: "Not Started",
      },
      pending: {
        icon: <Clock className="h-3 w-3" />,
        classes: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        label: "Pending",
      },
      verified: {
        icon: <CheckCircle2 className="h-3 w-3" />,
        classes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        label: "Verified",
      },
      rejected: {
        icon: <XCircle className="h-3 w-3" />,
        classes: "bg-red-500/10 text-red-400 border-red-500/20",
        label: "Rejected",
      },
    };
    const c = config[status] || config.not_started;
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${c.classes}`}
      >
        {c.icon}
        {c.label}
      </span>
    );
  };

  const handlePreview = (url: string, title: string) => {
    setImageLoading(true);
    setImageError(false);
    setPreviewUrl(getDocumentUrl(url)); // Add cache buster
    setPreviewTitle(title);
  };

  const DocumentCard = ({
    title,
    icon: Icon,
    url,
    status,
  }: {
    title: string;
    icon: React.ElementType;
    url?: string;
    status: string;
  }) => {
    const hasUrl = !!url && url.trim() !== "";
    const fileType = hasUrl ? detectFileType(url) : "other";

    return (
      <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800/60">
              <Icon className="h-4 w-4 text-slate-400" />
            </div>
            <h4 className="text-sm font-semibold text-white">{title}</h4>
          </div>
          {getStatusBadge(status)}
        </div>

        {hasUrl ? (
          <div className="space-y-2">
            {/* Mini preview thumbnail for images */}
            {fileType === "image" && (
              <div className="relative h-28 w-full overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
                <img
                  src={getDocumentUrl(url)}
                  alt={title}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                <span className="absolute bottom-2 left-2 text-[10px] font-semibold text-white/80 uppercase">
                  {fileType}
                </span>
              </div>
            )}

            {fileType === "pdf" && (
              <div className="flex h-28 items-center justify-center rounded-lg border border-slate-800 bg-slate-900">
                <FileText className="h-10 w-10 text-red-400" />
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePreview(url, title)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 py-2 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/20"
              >
                <Eye className="h-3.5 w-3.5" />
                Preview
              </button>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center rounded-lg bg-slate-800/60 p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                title="Open in new tab"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <a
                href={url}
                download
                className="flex items-center justify-center rounded-lg bg-slate-800/60 p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                title="Download"
              >
                <Download className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-800 bg-slate-900/30 py-6">
            <FileText className="h-8 w-8 text-slate-600 mb-2" />
            <p className="text-xs text-slate-500 italic">
              No document uploaded
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex items-center gap-2 mb-6">
          <FileCheck className="h-5 w-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            KYC Documents
          </h3>
        </div>

        {/* Identity Documents */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <IdCard className="h-4 w-4 text-slate-400" />
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Identity Verification
            </h4>
            <div className="ml-auto">
              {getStatusBadge(v.identity?.status || "not_started")}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DocumentCard
              title="Government ID"
              icon={IdCard}
              url={docs.govIdUrl}
              status={v.identity?.status || "not_started"}
            />
            <DocumentCard
              title="Proof of Address"
              icon={MapPin}
              url={docs.proofOfAddressUrl}
              status={v.identity?.status || "not_started"}
            />
          </div>
        </div>

        {/* Tax Information */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Receipt className="h-4 w-4 text-slate-400" />
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Tax Information
            </h4>
            <div className="ml-auto">
              {getStatusBadge(v.tax?.status || "not_started")}
            </div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                  Tax ID (TIN)
                </p>
                <p className="mt-1 text-sm font-mono font-semibold text-white">
                  {tax.tin || "—"}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                  Tax Country
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {tax.country || "—"}
                </p>
              </div>
            </div>
            {/* {tax.documentUrl && (
              <button
                onClick={() => handlePreview(tax.documentUrl, "Tax Document")}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/20"
              >
                <Eye className="h-3.5 w-3.5" />
                View Tax Document
              </button>
            )} */}
          </div>
        </div>
      </div>

      {/* 🆕 Document Preview Modal — Robust handling */}
      {previewUrl && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            onClick={() => setPreviewUrl(null)}
          />
          <div className="relative max-h-[90vh] max-w-5xl w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">{previewTitle}</h3>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition"
                  title="Open in new tab"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
                <a
                  href={previewUrl}
                  download
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </a>
                <button
                  onClick={() => setPreviewUrl(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
              {detectFileType(previewUrl) === "image" ? (
                <div className="relative flex items-center justify-center min-h-[300px]">
                  {imageLoading && !imageError && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
                    </div>
                  )}
                  {imageError ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <AlertCircle className="h-12 w-12 text-amber-400 mb-3" />
                      <p className="text-sm font-semibold text-white mb-1">
                        Unable to load image
                      </p>
                      <p className="text-xs text-slate-400 mb-4">
                        The image could not be loaded. It may be private or the
                        URL may have expired.
                      </p>
                      <a
                        href={previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Open in New Tab
                      </a>
                    </div>
                  ) : (
                    <img
                      src={previewUrl}
                      alt={previewTitle}
                      onLoad={() => setImageLoading(false)}
                      onError={() => {
                        setImageLoading(false);
                        setImageError(true);
                      }}
                      className={`max-h-[70vh] w-auto mx-auto object-contain transition-opacity ${
                        imageLoading ? "opacity-0" : "opacity-100"
                      }`}
                    />
                  )}
                </div>
              ) : detectFileType(previewUrl) === "pdf" ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-[70vh] border-0 rounded-lg bg-white"
                  title={previewTitle}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-12 w-12 text-slate-500 mb-3" />
                  <p className="text-sm font-semibold text-white mb-1">
                    Preview not available for this file type
                  </p>
                  <p className="text-xs text-slate-400 mb-4">
                    You can download the file to view it locally.
                  </p>
                  <a
                    href={previewUrl}
                    download
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white"
                  >
                    <Download className="h-4 w-4" />
                    Download File
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileKYC;
