// src/types/support.types.ts
import { Timestamp } from "firebase/firestore";

export type TicketStatus = "open" | "closed";
export type SenderType = "user" | "admin";
export type AttachmentType = "image" | "pdf" | null;

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhotoUrl?: string;
  status: TicketStatus;
  lastMessage: string;
  lastMessageAt: Timestamp | Date;
  unreadCount: number;
  createdAt: Timestamp | Date;
}

export interface ChatMessage {
  id: string;
  ticketId?: string;
  senderId: string;
  senderType: SenderType;
  text: string;
  read: boolean;
  createdAt: Timestamp | Date;
  // 🆕 Attachment fields
  attachmentType?: AttachmentType;
  attachmentData?: string; // Hex encoded string
  attachmentName?: string;
}