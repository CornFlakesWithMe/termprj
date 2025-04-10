import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Notification } from "@/types";
import { useNotificationStore } from "@/stores/notificationStore";
import { router } from "expo-router";

interface NotificationItemProps {
  notification: Notification;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
}) => {
  const { markAsRead } = useNotificationStore();

  const handlePress = () => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case "booking":
        router.push(`/booking/${notification.relatedId}`);
        break;
      case "message":
        router.push(`/messages/${notification.relatedId}`);
        break;
      case "payment":
        router.push(`/payment/${notification.relatedId}`);
        break;
      case "review":
        router.push(`/car/${notification.relatedId}`);
        break;
      default:
        break;
    }
  };

  const getIconName = () => {
    switch (notification.type) {
      case "booking":
        return "calendar";
      case "message":
        return "chatbubble";
      case "payment":
        return "card";
      case "review":
        return "star";
      default:
        return "notifications";
    }
  };

  return (
    <Pressable
      style={[styles.container, !notification.read && styles.unread]}
      onPress={handlePress}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={getIconName()}
          size={24}
          color={notification.read ? "#666" : "#007AFF"}
        />
      </View>
      <View style={styles.contentContainer}>
        <Text style={[styles.title, !notification.read && styles.unreadTitle]}>
          {notification.title}
        </Text>
        <Text style={styles.message}>{notification.message}</Text>
        <Text style={styles.time}>
          {new Date(notification.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  unread: {
    backgroundColor: "#f8f9fa",
  },
  iconContainer: {
    marginRight: 12,
    justifyContent: "center",
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: "bold",
    color: "#007AFF",
  },
  message: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: "#999",
  },
});
