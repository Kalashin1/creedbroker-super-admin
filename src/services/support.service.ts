// src/services/adminSupport.service.ts
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  where,
  getDocs,
  type Unsubscribe,
  setDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type {
  SupportTicket,
  ChatMessage,
  SenderType,
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
          createdAt: data.createdAt?.toDate() || new Date(),
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
): Promise<string> => {
  const ticketRef = doc(db, TICKETS_COLLECTION, userId); // 🎯 Ticket ID = User ID

  // 1. Create or Update the ticket document
  await setDoc(ticketRef, {
    userId,
    userName,
    userEmail,
    status: "open",
    lastMessage: `${adminName}: ${text}`,
    lastMessageAt: serverTimestamp(),
    unreadCount: 0,
    createdAt: serverTimestamp(),
  }, { merge: true }); // merge: true ensures we don't overwrite if it somehow exists

  // 2. Add the first message to the subcollection
  await addDoc(collection(db, TICKETS_COLLECTION, userId, "messages"), {
    senderId: adminId,
    senderType: "admin" as SenderType,
    text,
    read: false,
    createdAt: serverTimestamp(),
  });

  return userId; // Return the userId as the ticketId
};

/**
 * Sends a follow-up message in an existing ticket.
 */
export const sendAdminMessage = async (
  ticketId: string, // This is the userId
  adminId: string,
  adminName: string,
  text: string,
): Promise<void> => {
  const messagesRef = collection(db, TICKETS_COLLECTION, ticketId, "messages");
  const ticketRef = doc(db, TICKETS_COLLECTION, ticketId);

  await addDoc(messagesRef, {
    senderId: adminId,
    senderType: "admin" as SenderType,
    text,
    read: false,
    createdAt: serverTimestamp(),
  });

  await updateDoc(ticketRef, {
    lastMessage: `${adminName}: ${text}`,
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
