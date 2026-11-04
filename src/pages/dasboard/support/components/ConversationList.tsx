// src/components/admin/support/ConversationList.tsx
import React from "react";
import { MessageSquare } from "lucide-react";
import type { SupportTicket } from "../../../../types/support.types";

interface Props {
  tickets: SupportTicket[];
  selectedTicketId: string | null;
  onSelect: (ticket: SupportTicket) => void;
}

export const ConversationList: React.FC<Props> = ({
  tickets,
  selectedTicketId,
  onSelect,
}) => {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0)
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    if (days === 1) return "Yesterday";
    if (days < 7) return date.toLocaleDateString([], { weekday: "short" });
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 text-center">
        <MessageSquare className="h-10 w-10 text-slate-600 mb-3" />
        <p className="text-sm text-slate-400">No active conversations</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scroll">
      {tickets.map((ticket) => {
        const isSelected = selectedTicketId === ticket.id;
        return (
          <button
            key={ticket.id}
            onClick={() => onSelect(ticket)}
            className={`flex items-start gap-3 p-4 text-left transition border-b border-slate-800/50 ${
              isSelected
                ? "bg-emerald-500/10 border-l-4 border-l-emerald-500"
                : "hover:bg-slate-800/50 border-l-4 border-l-transparent"
            }`}
          >
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-sm font-bold text-white">
                {ticket.userName.charAt(0).toUpperCase()}
              </div>
              {ticket.status === "open" && (
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <p
                  className={`text-sm font-semibold truncate ${isSelected ? "text-white" : "text-slate-200"}`}
                >
                  {ticket.userName}
                </p>
                <span className="text-[10px] text-slate-500 shrink-0 ml-2">
                  {formatTime(ticket.lastMessageAt)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400 truncate pr-2">
                  {ticket.lastMessage || "Started conversation"}
                </p>
                {ticket.unreadCount > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[10px] font-bold text-white">
                    {ticket.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
