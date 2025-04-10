import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Message } from "@/types";
import { MOCK_MESSAGES } from "@/constants/mockData";
import { NotificationCenter } from "@/patterns/observer";

interface MessageState {
  messages: Message[];
  currentConversation: {
    userId: string;
    otherUserId: string;
    messages: Message[];
  } | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchMessages: () => Promise<void>;
  sendMessage: (senderId: string, receiverId: string, content: string, bookingId?: string) => Promise<Message | null>;
  markAsRead: (messageId: string) => Promise<boolean>;
  getConversation: (userId: string, otherUserId: string) => Message[];
  getUnreadCount: (userId: string) => number;
  setCurrentConversation: (userId: string, otherUserId: string) => void;
}

export const useMessageStore = create<MessageState>()(
  persist(
    (set, get) => ({
      messages: MOCK_MESSAGES,
      currentConversation: null,
      isLoading: false,
      error: null,
      
      fetchMessages: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // Get existing messages from state
          const existingMessages = get().messages;
          
          // If we have existing messages, use those instead of mock data
          const messagesToUse = existingMessages.length > 0 ? existingMessages : MOCK_MESSAGES;
          
          set({ 
            messages: messagesToUse,
            isLoading: false,
            error: null
          });
        } catch (error) {
          set({ isLoading: false, error: "Failed to fetch messages" });
        }
      },
      
      sendMessage: async (senderId: string, receiverId: string, content: string, bookingId?: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Create new message
          const newMessage: Message = {
            id: Date.now().toString(),
            senderId,
            receiverId,
            bookingId,
            content,
            createdAt: new Date().toISOString(),
            read: false,
          };
          
          // Update messages list
          set(state => ({
            messages: [...state.messages, newMessage],
            isLoading: false,
          }));
          
          // Update current conversation if applicable
          const { currentConversation } = get();
          if (
            currentConversation &&
            ((currentConversation.userId === senderId && currentConversation.otherUserId === receiverId) ||
             (currentConversation.userId === receiverId && currentConversation.otherUserId === senderId))
          ) {
            set(state => ({
              currentConversation: {
                ...state.currentConversation!,
                messages: [...state.currentConversation!.messages, newMessage],
              },
            }));
          }
          
          // Send notification to receiver
          const notificationCenter = NotificationCenter.getInstance();
          notificationCenter.sendMessageNotification(
            receiverId,
            `New message from ${senderId}`,
            newMessage.id
          );
          
          return newMessage;
        } catch (error) {
          set({ isLoading: false, error: "Failed to send message" });
          return null;
        }
      },
      
      markAsRead: async (messageId: string) => {
        try {
          const { messages } = get();
          
          // Find message by ID
          const messageIndex = messages.findIndex(m => m.id === messageId);
          
          if (messageIndex === -1) {
            return false;
          }
          
          // Update message as read
          const updatedMessage = { ...messages[messageIndex], read: true };
          const updatedMessages = [...messages];
          updatedMessages[messageIndex] = updatedMessage;
          
          set({ messages: updatedMessages });
          
          // Update current conversation if applicable
          const { currentConversation } = get();
          if (currentConversation) {
            const conversationMessageIndex = currentConversation.messages.findIndex(m => m.id === messageId);
            
            if (conversationMessageIndex !== -1) {
              const updatedConversationMessages = [...currentConversation.messages];
              updatedConversationMessages[conversationMessageIndex] = updatedMessage;
              
              set(state => ({
                currentConversation: {
                  ...state.currentConversation!,
                  messages: updatedConversationMessages,
                },
              }));
            }
          }
          
          return true;
        } catch (error) {
          set({ error: "Failed to mark message as read" });
          return false;
        }
      },
      
      getConversation: (userId: string, otherUserId: string) => {
        const { messages } = get();
        
        return messages.filter(
          message =>
            (message.senderId === userId && message.receiverId === otherUserId) ||
            (message.senderId === otherUserId && message.receiverId === userId)
        ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      },
      
      getUnreadCount: (userId: string) => {
        const { messages } = get();
        
        return messages.filter(message => message.receiverId === userId && !message.read).length;
      },
      
      setCurrentConversation: (userId: string, otherUserId: string) => {
        const conversation = get().getConversation(userId, otherUserId);
        
        set({
          currentConversation: {
            userId,
            otherUserId,
            messages: conversation,
          },
        });
        
        // Mark all received messages as read
        conversation.forEach(message => {
          if (message.receiverId === userId && !message.read) {
            get().markAsRead(message.id);
          }
        });
      },
    }),
    {
      name: "drive-share-message-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ messages: state.messages }), // Only persist messages
    }
  )
);