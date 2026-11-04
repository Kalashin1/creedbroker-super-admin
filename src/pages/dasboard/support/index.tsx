// src/pages/admin/AdminSupport.tsx
import React, { useState, useEffect } from "react";
import { MessageSquare, Loader2, Users } from "lucide-react";
import { toast } from "react-toastify";
import {
  fetchUsersWithChatStatus,
  type UserChatStatus,
} from "../../../services/support.service";
import { UserChatList } from "./components/UserChatList";
import { ChatWindow } from "./components/ChatWindow";
import DashboardLayout from "../components/Layout";

const AdminSupport: React.FC = () => {
  const [users, setUsers] = useState<UserChatStatus[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserChatStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchUsersWithChatStatus();
      setUsers(data);

      // 🆕 If a user is currently selected, update their data in the background
      // so the sidebar reflects new unread counts or status changes
      if (selectedUser) {
        const updatedUser = data.find((u) => u.userId === selectedUser.userId);
        if (updatedUser) {
          setSelectedUser(updatedUser);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const totalUnread = users.reduce((sum, u) => sum + u.unreadCount, 0);

  const handleTicketCreated = (newTicketId: string) => {
    // Immediately update the selected user's state so the UI reflects the new ticket
    if (selectedUser) {
      setSelectedUser({
        ...selectedUser,
        ticketId: newTicketId,
        status: "open",
      });
    }
    // Refresh the whole list in the background to update sorting (unread first)
    loadUsers();
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/20">
              <MessageSquare className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Support Center
              </h1>
              <p className="mt-0.5 text-sm text-slate-400">
                Live chat with users •{" "}
                {totalUnread > 0 && (
                  <span className="text-emerald-400 font-semibold">
                    {totalUnread} unread messages
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Chat Layout */}
        <div className="flex flex-1 gap-4 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur min-h-0">
          {/* Left Sidebar: All Users */}
          <div className="w-80 shrink-0 border-r border-slate-800 flex flex-col bg-slate-950/30 min-h-0">
            <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-400" />
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  All Users
                </h3>
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                {users.length}
              </span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center flex-1 py-12">
                <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
                <p className="mt-3 text-xs text-slate-500">Loading users...</p>
              </div>
            ) : (
              <UserChatList
                users={users}
                selectedUserId={selectedUser?.userId || null}
                onSelect={setSelectedUser}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            )}
          </div>

          {/* Right Area: Chat Window */}
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            {selectedUser ? (
              <ChatWindow
                user={selectedUser}
                onCloseChat={() => {
                  setSelectedUser(null);
                  loadUsers(); // Refresh to update statuses
                }}
                onTicketCreated={handleTicketCreated}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-800/50 mb-6">
                  <MessageSquare className="h-10 w-10 text-slate-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Select a user
                </h3>
                <p className="text-sm text-slate-400 max-w-md">
                  Choose a registered user from the left sidebar to view their
                  messages or proactively start a new conversation.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminSupport;
