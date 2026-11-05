import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  CheckCheck,
  Check,
  XCircle,
  Loader2,
  MessageSquare,
  Paperclip,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../../../context/AuthContext"; // Adjust path if needed
import {
  subscribeToMessages,
  sendAdminMessage,
  sendFirstAdminMessage,
  markMessagesAsRead,
  closeTicket,
} from "../../../../services/support.service";
import { fileToHexString, validateFile } from "../../../../utils/fileEncoder";
import { AttachmentPreview } from "./AttachmentPreview"; // Adjust path to where you saved AttachmentPreview
import type { ChatMessage, AttachmentType } from "../../../../types/support.types";
import type { UserChatStatus } from "../../../../services/support.service";

interface Props {
  user: UserChatStatus;
  onCloseChat: () => void;
  onTicketCreated: (newTicketId: string) => void;
}

export const ChatWindow: React.FC<Props> = ({
  user,
  onCloseChat,
  onTicketCreated,
}) => {
  const { user: currentUser } = useAuth();

  const [currentTicketId, setCurrentTicketId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isMessagesLoaded, setIsMessagesLoaded] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  // 🆕 File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reset state whenever the selected user changes
  useEffect(() => {
    setCurrentTicketId(user.ticketId);
    setMessages([]);
    setIsMessagesLoaded(false);
    setNewMessage("");
    setSelectedFile(null);
  }, [user.userId, user.ticketId]);

  // Subscribe to messages
  useEffect(() => {
    if (!currentTicketId) {
      setIsMessagesLoaded(true);
      return;
    }

    setIsMessagesLoaded(false);
    const unsubscribe = subscribeToMessages(
      currentTicketId,
      (msgs) => {
        setMessages(msgs);
        setIsMessagesLoaded(true);

        const hasUnread = msgs.some((m) => m.senderType === "user" && !m.read);
        if (hasUnread) {
          markMessagesAsRead(currentTicketId).catch(console.error);
        }
      },
      (err) => {
        console.error("Failed to load messages:", err);
        toast.error("Failed to load messages");
        setIsMessagesLoaded(true);
      },
    );

    return () => unsubscribe();
  }, [currentTicketId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isMessagesLoaded) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isMessagesLoaded]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !currentUser || isSending) return;

    setIsSending(true);
    setIsProcessingFile(true);
    try {
      let attachmentType: AttachmentType = null;
      let attachmentData: string | undefined = undefined;
      let attachmentName: string | undefined = undefined;
      let attachmentMimeType: string | undefined = undefined;

      if (selectedFile) {
        const validation = validateFile(selectedFile);
        if (!validation.valid) {
          toast.error(validation.error);
          setIsSending(false);
          setIsProcessingFile(false);
          return;
        }
        attachmentType = selectedFile.type.includes("pdf") ? "pdf" : "image";
        attachmentData = await fileToHexString(selectedFile);
        attachmentName = selectedFile.name;
        attachmentMimeType = selectedFile.type;
      }

      let ticketId = currentTicketId;

      if (!ticketId) {
        // Create new ticket with first message
        ticketId = await sendFirstAdminMessage(
          user.userId,
          user.userName,
          user.userEmail,
          currentUser.uid,
          currentUser.displayName || "Admin",
          newMessage.trim(),
          attachmentType,
          attachmentData,
          attachmentName,
          attachmentMimeType,
        );
        setCurrentTicketId(ticketId);
        onTicketCreated(ticketId);
      } else {
        // Send follow-up message
        await sendAdminMessage(
          ticketId,
          currentUser.uid,
          currentUser.displayName || "Admin",
          newMessage.trim(),
          attachmentType,
          attachmentData,
          attachmentName,
          attachmentMimeType,
        );
      }
      
      setNewMessage("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
      setIsProcessingFile(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!currentTicketId) {
      onCloseChat();
      return;
    }
    if (window.confirm("Close this support ticket?")) {
      try {
        await closeTicket(currentTicketId);
        toast.success("Ticket closed");
        onCloseChat();
      } catch (err) {
        toast.error("Failed to close ticket");
      }
    }
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const formatDateSeparator = (date: Date) =>
    date.toLocaleDateString([], {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

  return (
    <div className="flex flex-col h-full bg-slate-950/30">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-6 py-4 backdrop-blur shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-sm font-bold text-white">
            {user.userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{user.userName}</h3>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="truncate max-w-[150px]">{user.userEmail}</span>
              <span className="flex items-center gap-1 ml-2 shrink-0">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${user.status === "open" ? "bg-emerald-500" : "bg-slate-500"}`}
                />
                {currentTicketId
                  ? user.status === "open"
                    ? "Active"
                    : "Closed"
                  : "No Chat History"}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={handleCloseTicket}
          disabled={user.status === "closed" && currentTicketId !== null}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <XCircle className="h-3.5 w-3.5" />{" "}
          {currentTicketId ? "Close Ticket" : "Cancel"}
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 custom-scroll">
        {!currentTicketId ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/50 mb-4">
              <Send className="h-8 w-8 text-slate-500" />
            </div>
            <p className="text-sm font-semibold text-white mb-1">
              Start a conversation
            </p>
            <p className="text-xs text-slate-400 max-w-xs">
              This user hasn't contacted support yet. Type a message below to
              proactively reach out to them.
            </p>
          </div>
        ) : !isMessagesLoaded ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Loader2 className="h-8 w-8 animate-spin text-slate-500 mb-3" />
            <p className="text-sm text-slate-400">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare className="h-8 w-8 text-slate-500 mb-3" />
            <p className="text-sm text-slate-400">
              No messages in this conversation yet.
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isAdmin = msg.senderType === "admin";
            const showDateSeparator =
              index === 0 ||
              new Date(msg.createdAt).toDateString() !==
                new Date(messages[index - 1].createdAt).toDateString();

            return (
              <React.Fragment key={msg.id}>
                {showDateSeparator && (
                  <div className="flex items-center justify-center my-4">
                    <div className="h-px flex-1 bg-slate-800" />
                    <span className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      {formatDateSeparator(msg.createdAt)}
                    </span>
                    <div className="h-px flex-1 bg-slate-800" />
                  </div>
                )}

                <div
                  className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex max-w-[75%] gap-2 ${isAdmin ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {!isAdmin && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-xs font-bold text-white">
                        {user.userName.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div
                      className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                          isAdmin
                            ? "bg-gradient-to-br from-emerald-500 to-cyan-600 text-white rounded-br-sm"
                            : "bg-slate-800 text-slate-100 rounded-bl-sm border border-slate-700"
                        }`}
                      >
                        {msg.text && (
                          <p className="whitespace-pre-wrap break-words leading-relaxed">
                            {msg.text}
                          </p>
                        )}
                        
                        {/* 🎯 Render Attachment (Works for both Admin and User uploads) */}
                        {msg.attachmentData && msg.attachmentType && (
                          <AttachmentPreview 
                            type={msg.attachmentType} 
                            hexData={msg.attachmentData} 
                            fileName={msg.attachmentName || "attachment"} 
                            mimeType={msg.attachmentMimeType} 
                          />
                        )}
                      </div>
                      <div
                        className={`flex items-center gap-1 mt-1 text-[10px] ${isAdmin ? "text-slate-500" : "text-slate-500"}`}
                      >
                        <span>{formatTime(msg.createdAt)}</span>
                        {isAdmin &&
                          (msg.read ? (
                            <CheckCheck className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <Check className="h-3 w-3 text-slate-500" />
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-800 bg-slate-900/80 p-4 backdrop-blur shrink-0">
        {/* Selected File Preview */}
        {selectedFile && (
          <div className="mb-3 flex items-center gap-2 p-2 rounded-lg bg-slate-800 border border-slate-700 w-fit">
            <span className="text-xs text-slate-300 truncate max-w-[200px]">{selectedFile.name}</span>
            <button 
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }} 
              className="text-slate-400 hover:text-rose-400 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSend} className="flex items-center gap-3">
          {/* 🆕 File Input & Paperclip Button */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setSelectedFile(file);
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending || isProcessingFile || user.status === "closed"}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-950/50 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            title="Attach file (Max 250KB)"
          >
            {isProcessingFile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
          </button>

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message ${user.userName}...`}
            disabled={isProcessingFile || user.status === "closed"}
            className="flex-1 rounded-xl border border-slate-700 bg-slate-950/50 py-3 px-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isSending || isProcessingFile || (!newMessage.trim() && !selectedFile) || user.status === "closed"}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/20 transition hover:shadow-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending || isProcessingFile ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
        <p className="text-[10px] text-slate-600 mt-2 text-center">
          Max file size: 250KB · Supported: JPG, PNG, WebP, PDF
        </p>
      </div>
    </div>
  );
};