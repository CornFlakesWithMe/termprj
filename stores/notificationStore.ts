import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Notification } from "@/types";
import { NotificationCenter } from "@/patterns/observer";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { useUserStore } from "@/stores/userStore";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  addNotification: (notification: Omit<Notification, "id" | "read" | "createdAt">) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  getUnreadCount: () => number;
  initializeNotifications: () => void;
}

class NotificationObserver {
  private userId: string;
  private callback: (notification: Notification) => void;

  constructor(userId: string, callback: (notification: Notification) => void) {
    this.userId = userId;
    this.callback = callback;
  }

  public update(notification: Notification): void {
    if (notification.userId === this.userId) {
      this.callback(notification);
    }
  }
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: null,

      initializeNotifications: () => {
        const currentUser = useUserStore.getState().currentUser;
        if (!currentUser) return;

        const notificationCenter = NotificationCenter.getInstance();
        const observer = new NotificationObserver(currentUser.id, (notification) => {
          get().addNotification(notification);
        });
        notificationCenter.attach(observer);
      },

      addNotification: (notification) => {
        const newNotification: Notification = {
          id: Date.now().toString(),
          ...notification,
          read: false,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }));

        // Show alert for new notifications
        Alert.alert(
          newNotification.title,
          newNotification.message,
          [
            {
              text: "View",
              onPress: () => {
                // Navigate to the relevant screen based on notification type
                const router = useRouter();
                switch (newNotification.type) {
                  case "booking":
                    router.push(`/booking/${newNotification.relatedId}`);
                    break;
                  case "payment":
                    router.push(`/payment/${newNotification.relatedId}`);
                    break;
                  case "review":
                    router.push(`/review/${newNotification.relatedId}`);
                    break;
                  case "message":
                    router.push(`/messages/${newNotification.relatedId}`);
                    break;
                }
              },
            },
            {
              text: "Dismiss",
              style: "cancel",
            },
          ]
        );
      },

      markAsRead: (notificationId) => {
        set((state) => {
          const updatedNotifications = state.notifications.map((notification) =>
            notification.id === notificationId ? { ...notification, read: true } : notification
          );
          const unreadCount = updatedNotifications.filter((n) => !n.read).length;

          return {
            notifications: updatedNotifications,
            unreadCount,
          };
        });
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((notification) => ({
            ...notification,
            read: true,
          })),
          unreadCount: 0,
        }));
      },

      clearNotifications: () => {
        set({
          notifications: [],
          unreadCount: 0,
        });
      },

      getUnreadCount: () => {
        return get().unreadCount;
      },
    }),
    {
      name: "drive-share-notification-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 