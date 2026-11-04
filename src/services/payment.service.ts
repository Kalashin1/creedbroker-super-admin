// src/services/adminPaymentMethods.service.ts
import {
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { PaymentMethod, PaymentCategory } from '../types/payments.types';

const COLLECTION_NAME = 'paymentMethods';

/**
 * Fetches all payment methods with comprehensive error handling
 */
export const fetchPaymentMethods = async (): Promise<PaymentMethod[]> => {
  console.log('🔍 [PaymentMethods] Fetching payment methods...');
  
  try {
    const q = query(collection(db, COLLECTION_NAME));
    const snapshot = await getDocs(q);
    
    console.log(`✅ [PaymentMethods] Found ${snapshot.size} payment methods`);
    
    const methods = snapshot.docs.map((d) => {
      const data = d.data();
      console.log(`📄 [PaymentMethods] Document ${d.id}:`, data);
      
      return {
        id: d.id,
        name: data.name || 'Unnamed Method',
        category: (data.category as PaymentCategory) || 'third_party',
        asset: data.asset || undefined,
        iconName: data.iconName || 'Wallet',
        enabled: data.enabled !== undefined ? data.enabled : true,
        minAmount: typeof data.minAmount === 'number' ? data.minAmount : 0,
        maxAmount: typeof data.maxAmount === 'number' ? data.maxAmount : 10000,
        feePercentage: typeof data.feePercentage === 'number' ? data.feePercentage : 0,
        feeFlat: typeof data.feeFlat === 'number' ? data.feeFlat : 0,
        processingTime: data.processingTime || 'Instant',
        instructions: data.instructions || '',
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      } as PaymentMethod;
    });
    
    return methods;
  } catch (error: any) {
    console.error('❌ [PaymentMethods] Error fetching:', error);
    console.error('❌ [PaymentMethods] Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack,
    });
    return [];
  }
};

/**
 * Creates a new payment method with validation and debugging
 */
export const createPaymentMethod = async (
  data: Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  console.log('🔍 [PaymentMethods] Creating payment method with data:', data);
  
  try {
    // Validate required fields
    if (!data.name || data.name.trim() === '') {
      throw new Error('Payment method name is required');
    }
    
    if (!data.category) {
      throw new Error('Payment method category is required');
    }
    
    // Build payload with explicit type conversions
    const payload: any = {
      name: data.name.trim(),
      category: data.category,
      enabled: Boolean(data.enabled),
      minAmount: Number(data.minAmount) || 0,
      maxAmount: Number(data.maxAmount) || 10000,
      feePercentage: Number(data.feePercentage) || 0,
      feeFlat: Number(data.feeFlat) || 0,
      processingTime: String(data.processingTime || 'Instant'),
      instructions: String(data.instructions || ''),
      iconName: String(data.iconName || 'Wallet'),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    // Only add asset if it has a value
    if (data.asset && data.asset.trim() !== '') {
      payload.asset = data.asset.trim();
    }
    
    console.log('📝 [PaymentMethods] Payload to be saved:', payload);
    
    // Validate payload before saving
    if (payload.minAmount >= payload.maxAmount) {
      throw new Error('Minimum amount must be less than maximum amount');
    }
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), payload);
    
    console.log(`✅ [PaymentMethods] Successfully created payment method with ID: ${docRef.id}`);
    
    return docRef.id;
  } catch (error: any) {
    console.error('❌ [PaymentMethods] Error creating payment method:', error);
    console.error('❌ [PaymentMethods] Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack,
    });
    throw new Error(error.message || 'Failed to create payment method');
  }
};

/**
 * Updates an existing payment method
 */
export const updatePaymentMethod = async (
  id: string,
  data: Partial<PaymentMethod>
): Promise<void> => {
  console.log(`🔍 [PaymentMethods] Updating payment method ${id} with:`, data);
  
  try {
    const updateData: any = {
      updatedAt: serverTimestamp(),
    };
    
    // Only include fields that are provided
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.category !== undefined) updateData.category = data.category;
    if (data.asset !== undefined) updateData.asset = data.asset || null;
    if (data.iconName !== undefined) updateData.iconName = data.iconName;
    if (data.enabled !== undefined) updateData.enabled = Boolean(data.enabled);
    if (data.minAmount !== undefined) updateData.minAmount = Number(data.minAmount);
    if (data.maxAmount !== undefined) updateData.maxAmount = Number(data.maxAmount);
    if (data.feePercentage !== undefined) updateData.feePercentage = Number(data.feePercentage);
    if (data.feeFlat !== undefined) updateData.feeFlat = Number(data.feeFlat);
    if (data.processingTime !== undefined) updateData.processingTime = data.processingTime;
    if (data.instructions !== undefined) updateData.instructions = data.instructions;
    
    console.log('📝 [PaymentMethods] Update payload:', updateData);
    
    await updateDoc(doc(db, COLLECTION_NAME, id), updateData);
    
    console.log(`✅ [PaymentMethods] Successfully updated payment method ${id}`);
  } catch (error: any) {
    console.error(`❌ [PaymentMethods] Error updating payment method ${id}:`, error);
    throw new Error(error.message || 'Failed to update payment method');
  }
};

/**
 * Deletes a payment method
 */
export const deletePaymentMethod = async (id: string): Promise<void> => {
  console.log(`🔍 [PaymentMethods] Deleting payment method ${id}`);
  
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    console.log(`✅ [PaymentMethods] Successfully deleted payment method ${id}`);
  } catch (error: any) {
    console.error(`❌ [PaymentMethods] Error deleting payment method ${id}:`, error);
    throw new Error(error.message || 'Failed to delete payment method');
  }
};