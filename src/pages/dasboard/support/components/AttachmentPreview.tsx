import React, { useMemo, useState } from "react";
import { FileText, Download, X, Image as ImageIcon } from "lucide-react";
import {
  hexStringToBlob,
  detectMimeTypeFromHex,
} from "../../../../utils/fileEncoder";

interface Props {
  type: "image" | "pdf";
  hexData: string;
  fileName: string;
  mimeType?: string;
}

export const AttachmentPreview: React.FC<Props> = ({
  type,
  hexData,
  fileName,
  mimeType,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const blobUrl = useMemo(() => {
    try {
      let finalMimeType = mimeType;

      // 🎯 FIX: If mimeType is missing from DB, detect it from the hex data
      if (!finalMimeType) {
        finalMimeType = detectMimeTypeFromHex(hexData);
      }

      // Final fallback
      if (!finalMimeType || finalMimeType === "application/octet-stream") {
        finalMimeType = type === "image" ? "image/jpeg" : "application/pdf";
      }

      const blob = hexStringToBlob(hexData, finalMimeType);
      return URL.createObjectURL(blob);
    } catch (err) {
      console.error("Failed to decode attachment:", err);
      setError(true);
      return null;
    }
  }, [hexData, type, mimeType]);

  if (error || !blobUrl) {
    return (
      <div className="mt-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-rose-400 text-xs">
        <X className="w-4 h-4" />
        Failed to load attachment
      </div>
    );
  }

  if (type === "image") {
    return (
      <div className="mt-2 relative group">
        <img
          src={blobUrl}
          alt={fileName}
          onLoad={() => setIsLoading(false)}
          onError={() => setError(true)}
          className={`max-w-[250px] rounded-lg border border-slate-700 shadow-sm transition-opacity ${isLoading ? "opacity-0" : "opacity-100"}`}
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800 rounded-lg">
            <ImageIcon className="w-6 h-6 text-slate-500 animate-pulse" />
          </div>
        )}
        <a
          href={blobUrl}
          download={fileName}
          className="absolute bottom-2 right-2 p-2 rounded-full bg-slate-900/80 text-white opacity-0 group-hover:opacity-100 transition shadow-lg"
          title="Download image"
        >
          <Download className="w-4 h-4" />
        </a>
      </div>
    );
  }

  return (
    <a
      href={blobUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 flex items-center gap-3 p-3 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 transition group"
    >
      <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center">
        <FileText className="w-5 h-5 text-rose-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{fileName}</p>
        <p className="text-xs text-slate-400">PDF Document</p>
      </div>
      <Download className="w-4 h-4 text-slate-400 group-hover:text-white transition" />
    </a>
  );
};
