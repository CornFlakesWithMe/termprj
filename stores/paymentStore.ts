import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { NotificationCenter } from "@/patterns/observer";
import { RealPaymentService, PaymentServiceProxy } from "@/patterns/proxy";
import { useUserStore } from "./userStore";

interface PaymentState {
  transactions: {
    id: string;
    bookingId: string;
    fromUserId: string;
    toUserId: string;
    amount: number;
    status: "pending" | "completed" | "failed";
    timestamp: string;
  }[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  processPayment: (bookingId: string, fromUserId: string, toUserId: string, amount: number) => Promise<boolean>;
  getTransactionsByUserId: (userId: string) => any[];
}

// Create payment service with proxy pattern
const realPaymentService = new RealPaymentService();
const paymentServiceProxy = new PaymentServiceProxy(realPaymentService);

export const usePaymentStore = create<PaymentState>()(
  persist(
    (set, get) => ({
      transactions: [],
      isLoading: false,
      error: null,
      
      processPayment: async (bookingId: string, fromUserId: string, toUserId: string, amount: number) => {
        set({ isLoading: true, error: null });
        
        try {
          // Process payment through proxy
          const result = await paymentServiceProxy.processPayment(amount, fromUserId, toUserId);
          
          if (!result.success) {
            set({ isLoading: false, error: result.error || "Payment failed" });
            return false;
          }
          
          // Create transaction record
          const transaction = {
            id: result.transactionId || Date.now().toString(),
            bookingId,
            fromUserId,
            toUserId,
            amount,
            status: "completed" as const,
            timestamp: new Date().toISOString(),
          };
          
          // Update transactions list
          set(state => ({
            transactions: [...state.transactions, transaction],
            isLoading: false,
          }));
          
          // Update user balances
          const userStore = useUserStore.getState();
          const fromUser = userStore.getUserById(fromUserId);
          const toUser = userStore.getUserById(toUserId);
          
          if (fromUser && toUser) {
            await userStore.updateBalance(fromUserId, fromUser.balance - amount);
            await userStore.updateBalance(toUserId, toUser.balance + amount);
          }
          
          // Send notifications to both users
          const notificationCenter = NotificationCenter.getInstance();
          
          notificationCenter.sendPaymentNotification(
            fromUserId,
            `Payment of $${amount} sent successfully`,
            transaction.id
          );
          
          notificationCenter.sendPaymentNotification(
            toUserId,
            `Payment of $${amount} received`,
            transaction.id
          );
          
          return true;
        } catch (error) {
          set({ isLoading: false, error: "Payment processing failed" });
          return false;
        }
      },
      
      getTransactionsByUserId: (userId: string) => {
        const { transactions } = get();
        
        return transactions.filter(
          transaction => transaction.fromUserId === userId || transaction.toUserId === userId
        );
      },
    }),
    {
      name: "drive-share-payment-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);