import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  where,
  getDocs,
  setDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type {
  SupportTicket,
  ChatMessage,
  SenderType,
  AttachmentType,
} from "../types/support.types";

const TICKETS_COLLECTION = "supportTickets";
const USERS_COLLECTION = "users";

export interface UserChatStatus {
  userId: string;
  userName: string;
  userEmail: string;
  ticketId: string | null;
  status: "open" | "closed" | "none";
  lastMessage: string;
  lastMessageAt: Date | null;
  unreadCount: number;
}

/**
 * Fetches ALL registered users and merges them with their support ticket status.
 */
export const fetchUsersWithChatStatus = async (): Promise<UserChatStatus[]> => {
  // 1. Fetch all users
  const usersSnap = await getDocs(collection(db, USERS_COLLECTION));
  const users = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  // 2. Fetch all support tickets
  const ticketsSnap = await getDocs(collection(db, TICKETS_COLLECTION));
  const ticketsMap = new Map<string, any>();

  ticketsSnap.docs.forEach((d) => {
    const data = d.data();
    ticketsMap.set(data.userId, { ticketId: d.id, ...data });
  });

  // 3. Merge and format
  return users
    .map((user: any) => {
      const ticket = ticketsMap.get(user.id);
      return {
        userId: user.id,
        userName: user.fullName || "Unknown User",
        userEmail: user.email || "Unknown Email",
        ticketId: ticket?.ticketId || null,
        status: ticket?.status || "none",
        lastMessage: ticket?.lastMessage || "",
        lastMessageAt: ticket?.lastMessageAt?.toDate() || null,
        unreadCount: ticket?.unreadCount || 0,
      } as UserChatStatus;
    })
    .sort((a, b) => {
      // Sort by unread messages first, then by most recent activity
      if (a.unreadCount !== b.unreadCount) return b.unreadCount - a.unreadCount;
      if (!a.lastMessageAt) return 1;
      if (!b.lastMessageAt) return -1;
      return b.lastMessageAt.getTime() - a.lastMessageAt.getTime();
    });
};

/**
 * Real-time listener for messages in a specific ticket.
 * 🎯 CRITICAL FIX: Now properly maps attachment fields from Firestore.
 */
export const subscribeToMessages = (
  ticketId: string,
  callback: (messages: ChatMessage[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe => {
  const messagesRef = collection(db, TICKETS_COLLECTION, ticketId, "messages");
  const q = query(messagesRef, orderBy("createdAt", "asc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const messages = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          senderId: data.senderId,
          senderType: data.senderType,
          text: data.text,
          read: data.read || false,
          // 🎯 These lines are required for the UI to see the attachments
          attachmentType: (data.attachmentType as AttachmentType) || null,
          attachmentData: data.attachmentData || undefined,
          attachmentName: data.attachmentName || undefined,
          attachmentMimeType: data.attachmentMimeType || undefined,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
        } as ChatMessage;
      });
      callback(messages);
    },
    (error) => {
      console.error("Error subscribing to messages:", error);
      onError?.(error);
    },
  );
};

/**
 * Sends the VERY FIRST message from admin to a user, creating the ticket.
 * 🎯 FIX: Uses setDoc with userId as the ID to prevent duplicate tickets.
 */
export const sendFirstAdminMessage = async (
  userId: string,
  userName: string,
  userEmail: string,
  adminId: string,
  adminName: string,
  text: string,
  attachmentType?: AttachmentType,
  attachmentData?: string,
  attachmentName?: string,
  attachmentMimeType?: string, // 🆕 Added
): Promise<string> => {
  const ticketRef = doc(db, TICKETS_COLLECTION, userId); // 🎯 Ticket ID = User ID
  
  const messagePayload: any = {
    senderId: adminId,
    senderType: "admin" as SenderType,
    text,
    read: false,
    createdAt: serverTimestamp(),
  };

  // 🎯 FIX: Only add attachment fields if they are actually defined to prevent Firestore undefined errors
  if (attachmentData && attachmentType) {
    messagePayload.attachmentType = attachmentType;
    messagePayload.attachmentData = attachmentData;
    if (attachmentName) messagePayload.attachmentName = attachmentName;
    if (attachmentMimeType) messagePayload.attachmentMimeType = attachmentMimeType;
  }

  const displayText = attachmentData
    ? `${adminName} sent an attachment${text ? `: ${text}` : ""}`
    : `${adminName}: ${text}`;

  // Create or Update the ticket document
  await setDoc(
    ticketRef,
    {
      userId,
      userName,
      userEmail,
      status: "open",
      lastMessage: displayText,
      lastMessageAt: serverTimestamp(),
      unreadCount: 0,
      createdAt: serverTimestamp(),
    },
    { merge: true }, // merge: true ensures we don't overwrite if it somehow exists
  );

  await addDoc(collection(db, TICKETS_COLLECTION, userId, "messages"), messagePayload);

  return userId; // Return the userId as the ticketId
};

/**
 * Sends a follow-up message in an existing ticket.
 */
export const sendAdminMessage = async (
  ticketId: string,
  adminId: string,
  adminName: string,
  text: string,
  attachmentType?: AttachmentType,
  attachmentData?: string,
  attachmentName?: string,
  attachmentMimeType?: string, // 🆕 Added
): Promise<void> => {
  const messagesRef = collection(db, TICKETS_COLLECTION, ticketId, "messages");
  const ticketRef = doc(db, TICKETS_COLLECTION, ticketId);

  const messagePayload: any = {
    senderId: adminId,
    senderType: "admin" as SenderType,
    text,
    read: false,
    createdAt: serverTimestamp(),
  };

  // 🎯 FIX: Only add attachment fields if they are actually defined
  if (attachmentData && attachmentType) {
    messagePayload.attachmentType = attachmentType;
    messagePayload.attachmentData = attachmentData;
    if (attachmentName) messagePayload.attachmentName = attachmentName;
    if (attachmentMimeType) messagePayload.attachmentMimeType = attachmentMimeType;
  }

  await addDoc(messagesRef, messagePayload);

  const displayText = attachmentData
    ? `${adminName} sent an attachment${text ? `: ${text}` : ""}`
    : `${adminName}: ${text}`;

  await updateDoc(ticketRef, {
    lastMessage: displayText,
    lastMessageAt: serverTimestamp(),
    status: "open",
  });
};

/**
 * Marks all user messages in a ticket as read by the admin.
 */
export const markMessagesAsRead = async (ticketId: string): Promise<void> => {
  const messagesRef = collection(db, TICKETS_COLLECTION, ticketId, "messages");
  const q = query(
    messagesRef,
    where("senderType", "==", "user"),
    where("read", "==", false),
  );

  const snapshot = await getDocs(q);
  const batch: any[] = [];
  snapshot.forEach((docSnap) => {
    batch.push(updateDoc(docSnap.ref, { read: true }));
  });

  await Promise.all(batch);
  await updateDoc(doc(db, TICKETS_COLLECTION, ticketId), { unreadCount: 0 });
};

/**
 * Closes a support ticket.
 */
export const closeTicket = async (ticketId: string): Promise<void> => {
  await updateDoc(doc(db, TICKETS_COLLECTION, ticketId), { status: "closed" });
};