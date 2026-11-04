// src/components/admin/security/KYCReviewModal.tsx
import React, { useState, useEffect } from "react";
import {
  X,
  IdCard,
  MapPin,
  Receipt,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { toast } from "react-toastify";
import { updateUserKYC } from "../../../../services/admin.service";
import { createNotification } from "../../../../services/notification.service";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../../lib/firebase";
import type { KycFilterStatus } from "../../../../services/security.service";

interface Props {
  user: { id: string; fullName: string; email: string };
  currentStatus: KycFilterStatus;
  onClose: () => void;
  onReviewed: () => void;
}

export const KYCReviewModal: React.FC<Props> = ({
  user,
  currentStatus,
  onClose,
  onReviewed,
}) => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const snap = await getDoc(doc(db, "users", user.id));
      if (snap.exists()) setUserData(snap.data());
      setLoading(false);
    };
    fetchUser();
  }, [user.id]);

  const handleAction = async (newStatus: "verified" | "rejected" | "none") => {
    let reason = "";
    if (newStatus === "rejected" || newStatus === "none") {
      reason =
        prompt("Reason for this action (shown to user):") ||
        "Compliance review required";
    }

    setIsProcessing(true);
    try {
      await updateUserKYC(user.id, newStatus);

      let title = "",
        message = "",
        type: any = "info";
      if (newStatus === "verified") {
        title = "KYC Approved";
        message =
          "Your identity and tax information have been successfully verified. Full access unlocked.";
        type = "success";
      } else if (newStatus === "rejected") {
        title = "KYC Rejected";
        message = `Your KYC was rejected. Reason: ${reason}. Please resubmit correct documents.`;
        type = "error";
      } else {
        title = "KYC Revoked";
        message = `Your KYC verification has been revoked by an admin. Reason: ${reason}. Please resubmit.`;
        type = "warning";
      }

      await createNotification(user.id, {
        title,
        message,
        category: "account",
        type,
        priority: "high",
        actionUrl: "/dashboard/kyc",
        sendEmail: true,
      });

      toast.success(`User KYC updated to ${newStatus}`);
      onReviewed();
    } catch (err) {
      toast.error("Failed to update KYC status");
    } finally {
      setIsProcessing(false);
    }
  };

  const v = userData?.verification || {};
  const docs = v.identity?.documents || {};
  const tax = v.tax || {};

  const DocumentPreview = ({
    title,
    url,
    icon: Icon,
  }: {
    title: string;
    url?: string;
    icon: any;
  }) => (
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4 text-slate-400" />
        <h4 className="text-sm font-semibold text-white">{title}</h4>
      </div>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition"
        >
          View Document <ExternalLink className="h-3 w-3" />
        </a>
      ) : (
        <p className="text-xs text-slate-500 italic flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" /> Not provided
        </p>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl max-h-[90vh] overflow-y-auto custom-scroll">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-4 z-10">
          <div>
            <h2 className="text-lg font-bold text-white">
              KYC Document Review
            </h2>
            <p className="text-xs text-slate-400">
              {user.fullName} • {user.email}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : (
            <>
              {/* Identity Documents */}
              <div>
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <IdCard className="h-4 w-4 text-violet-400" /> Identity
                  Verification
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DocumentPreview
                    title="Government ID"
                    url={docs.govIdUrl}
                    icon={IdCard}
                  />
                  <DocumentPreview
                    title="Proof of Address"
                    url={docs.proofOfAddressUrl}
                    icon={MapPin}
                  />
                </div>
              </div>

              {/* 🆕 TAX INFORMATION (Prominently Displayed) */}
              <div>
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-emerald-400" /> Tax
                  Information
                </h3>
                <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                        Tax ID / TIN
                      </p>
                      <p className="font-mono text-sm font-semibold text-white bg-slate-900/50 p-2 rounded border border-slate-800">
                        {tax.tin || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                        Tax Country
                      </p>
                      <p className="text-sm font-semibold text-white bg-slate-900/50 p-2 rounded border border-slate-800">
                        {tax.country || "—"}
                      </p>
                    </div>
                  </div>

                  {tax.documentUrl ? (
                    <a
                      href={tax.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition"
                    >
                      <Receipt className="h-4 w-4" />
                      View Tax Document
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/5 border border-amber-500/20 p-3 rounded-lg">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      No tax document was uploaded by the user.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 flex gap-3 border-t border-slate-800 bg-slate-900 px-6 py-4">
          {currentStatus === "verified" ? (
            <button
              onClick={() => handleAction("none")}
              disabled={isProcessing || loading}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 py-2.5 text-sm font-semibold text-amber-400 transition hover:bg-amber-500/20 disabled:opacity-50"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              Revoke KYC
            </button>
          ) : (
            <>
              <button
                onClick={() => handleAction("rejected")}
                disabled={isProcessing || loading}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                Reject KYC
              </button>
              <button
                onClick={() => handleAction("verified")}
                disabled={isProcessing || loading}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:shadow-emerald-500/40 disabled:opacity-50"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Approve KYC
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
