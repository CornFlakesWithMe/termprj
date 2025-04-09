import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { Message, User } from "@/types";
import Colors from "@/constants/colors";
import { useUserStore } from "@/stores/userStore";

interface ConversationItemProps {
  otherUserId: string;
  lastMessage: Message;
  unreadCount: number;
  currentUserId: string;
}

export default function ConversationItem({
  otherUserId,
  lastMessage,
  unreadCount,
  currentUserId,
}: ConversationItemProps) {
  const router = useRouter();
  const { getUserById } = useUserStore();
  const otherUser = getUserById(otherUserId);

  if (!otherUser) {
    return null;
  }

  const isLastMessageFromCurrentUser = lastMessage.senderId === currentUserId;

  const formatTime = (dateString: string) => {
    const messageDate = new Date(dateString);
    const now = new Date();
    
    // If message is from today, show time
    if (messageDate.toDateString() === now.toDateString()) {
      return messageDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
    
    // If message is from this week, show day name
    const diffDays = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return messageDate.toLocaleDateString("en-US", { weekday: "short" });
    }
    
    // Otherwise show date
    return messageDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const handlePress = () => {
    router.push(`/messages/${otherUserId}`);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: otherUser.avatar || "https://images.unsplash.com/photo-1633332755192-727a05c4013d" }}
        style={styles.avatar}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{otherUser.name}</Text>
          <Text style={styles.time}>{formatTime(lastMessage.createdAt)}</Text>
        </View>
        <View style={styles.messageRow}>
          <Text style={styles.message} numberOfLines={1}>
            {isLastMessageFromCurrentUser ? "You: " : ""}
            {lastMessage.content}
          </Text>
          {unreadCount > 0 && !isLastMessageFromCurrentUser && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
    backgroundColor: Colors.card,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  time: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  message: {
    fontSize: 15,
    color: Colors.textSecondary,
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadCount: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
});