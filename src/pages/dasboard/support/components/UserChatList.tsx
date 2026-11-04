// src/components/admin/support/UserChatList.tsx
import React from "react";
import { MessageSquare, Search } from "lucide-react";
import type { UserChatStatus } from "../../../../services/support.service";

interface Props {
  users: UserChatStatus[];
  selectedUserId: string | null;
  onSelect: (user: UserChatStatus) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const UserChatList: React.FC<Props> = ({
  users,
  selectedUserId,
  onSelect,
  searchQuery,
  onSearchChange,
}) => {
  const formatTime = (date: Date | null) => {
    if (!date) return "";
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

  const filteredUsers = users.filter(
    (u) =>
      u.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.userEmail.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="p-3 border-b border-slate-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search users..."
            className="w-full rounded-lg border border-slate-700 bg-slate-950/50 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500/50"
          />
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto custom-scroll">
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center px-4">
            <MessageSquare className="h-10 w-10 text-slate-600 mb-3" />
            <p className="text-sm text-slate-400">No users found</p>
          </div>
        ) : (
          filteredUsers.map((user) => {
            const isSelected = selectedUserId === user.userId;
            const hasChat = user.status !== "none";

            return (
              <button
                key={user.userId}
                onClick={() => onSelect(user)}
                className={`w-full flex items-start gap-3 p-4 text-left transition border-b border-slate-800/50 ${
                  isSelected
                    ? "bg-emerald-500/10 border-l-4 border-l-emerald-500"
                    : "hover:bg-slate-800/50 border-l-4 border-l-transparent"
                }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ${
                      hasChat
                        ? "bg-gradient-to-br from-cyan-500 to-blue-600"
                        : "bg-slate-700"
                    }`}
                  >
                    {user.userName.charAt(0).toUpperCase()}
                  </div>
                  {user.status === "open" && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p
                      className={`text-sm font-semibold truncate ${isSelected ? "text-white" : "text-slate-200"}`}
                    >
                      {user.userName}
                    </p>
                    {user.lastMessageAt && (
                      <span className="text-[10px] text-slate-500 shrink-0 ml-2">
                        {formatTime(user.lastMessageAt)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-400 truncate pr-2">
                      {user.lastMessage ||
                        (hasChat ? "Conversation closed" : "No messages yet")}
                    </p>
                    {user.unreadCount > 0 && (
                      <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[10px] font-bold text-white">
                        {user.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
