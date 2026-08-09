/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/auth.service.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  confirmPasswordReset,
  applyActionCode,
  checkActionCode,
  sendEmailVerification,
  updateProfile as firebaseUpdateProfile,
  type User,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { createUserProfile, touchLastLogin } from "./user.service";
import type { CreateUserPayload } from "../types/user.types";
import { createSession, logLoginActivity } from "./security.service";

// ─────────────────────────────────────────────────────────────
// Error mapping
// ─────────────────────────────────────────────────────────────
export class AuthError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
    this.name = "AuthError";
  }
}

const mapFirebaseError = (err: any): AuthError => {
  const code = err?.code || "auth/unknown";
  const messages: Record<string, string> = {
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/weak-password": "Password should be at least 8 characters.",
    "auth/operation-not-allowed": "Email/password accounts are not enabled.",
    "auth/invalid-credential": "Invalid email or password.",
    "auth/wrong-password": "Invalid email or password.",
    "auth/user-not-found": "No account found with this email.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/network-request-failed": "Network error. Check your connection.",
    "auth/expired-action-code":
      "This link has expired. Please request a new one.",
    "auth/invalid-action-code":
      "This link is invalid or has already been used.",
    "auth/missing-email": "Please enter your email address.",
    "auth/invalid-recipient-email": "This email cannot receive messages.",
  };
  return new AuthError(
    messages[code] || err?.message || "Something went wrong.",
    code,
  );
};

// ─────────────────────────────────────────────────────────────
// Create account
// ─────────────────────────────────────────────────────────────
export const createAccount = async (
  payload: CreateUserPayload,
): Promise<User> => {
  try {
    // 1. Create Firebase Auth user
    const { user } = await createUserWithEmailAndPassword(
      auth,
      payload.email,
      payload.password,
    );

    // 2. Update display name on the auth user
    await firebaseUpdateProfile(user, { displayName: payload.fullName });

    // 3. Create Firestore user document
    const { ...profilePayload } = payload;
    await createUserProfile(user.uid, profilePayload);

    // 4. Send email verification (non-blocking — don't fail signup if this errors)
    try {
      await sendEmailVerification(user);
    } catch (verifyErr) {
      console.warn("Failed to send verification email:", verifyErr);
    }

    return user;
  } catch (err) {
    throw mapFirebaseError(err);
  }
};

// ─────────────────────────────────────────────────────────────
// Sign in
// ─────────────────────────────────────────────────────────────
export const signIn = async (
  email: string,
  password: string,
): Promise<User> => {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);

     await logLoginActivity(user.uid, "success");

     // 🆕 Create session
     const sessionId = await createSession(user.uid);
     localStorage.setItem("currentSessionId", sessionId);

     // Touch lastLoginAt in Firestore (fire-and-forget)
     touchLastLogin(user.uid).catch((err) =>
       console.warn("Failed to update lastLoginAt:", err),
     );

    return user;
  } catch (err) {
    throw mapFirebaseError(err);
  }
};

// ─────────────────────────────────────────────────────────────
// Sign out
// ─────────────────────────────────────────────────────────────
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (err) {
    throw mapFirebaseError(err);
  }
};

// ─────────────────────────────────────────────────────────────
// Forgot password
// ─────────────────────────────────────────────────────────────
export const forgotPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (err) {
    throw mapFirebaseError(err);
  }
};

// ─────────────────────────────────────────────────────────────
// Reset password (after clicking email link)
// ─────────────────────────────────────────────────────────────
export const resetPassword = async (
  oobCode: string,
  newPassword: string,
): Promise<void> => {
  try {
    await confirmPasswordReset(auth, oobCode, newPassword);
  } catch (err) {
    throw mapFirebaseError(err);
  }
};

// ─────────────────────────────────────────────────────────────
// Email verification helpers
// ─────────────────────────────────────────────────────────────
export const verifyEmail = async (oobCode: string): Promise<string> => {
  try {
    // Returns the email associated with the code
    const info = await checkActionCode(auth, oobCode);
    await applyActionCode(auth, oobCode);
    return info.data.email as string;
  } catch (err) {
    throw mapFirebaseError(err);
  }
};

export const resendVerificationEmail = async (): Promise<void> => {
  try {
    if (!auth.currentUser) throw new Error("No user signed in");
    await sendEmailVerification(auth.currentUser);
  } catch (err) {
    throw mapFirebaseError(err);
  }
};
