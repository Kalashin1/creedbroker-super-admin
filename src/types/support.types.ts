// src/types/support.types.ts
import { Timestamp } from "firebase/firestore";

export type TicketStatus = "open" | "closed";
export type SenderType = "user" | "admin";

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: TicketStatus;
  lastMessage: string;
  lastMessageAt: Timestamp | Date;
  unreadCount: number;
  createdAt: Timestamp | Date;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderType: SenderType;
  text: string;
  read: boolean;
  createdAt: Timestamp | Date;
}
