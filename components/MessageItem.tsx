import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Message, User } from "@/types";
import Colors from "@/constants/colors";
import { useUserStore } from "@/stores/userStore";

interface MessageItemProps {
  message: Message;
  currentUserId: string;
}

export default function MessageItem({ message, currentUserId }: MessageItemProps) {
  const isCurrentUser = message.senderId === currentUserId;
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <View
      style={[
        styles.container,
        isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isCurrentUser ? styles.currentUserText : styles.otherUserText,
          ]}
        >
          {message.content}
        </Text>
      </View>
      <Text
        style={[
          styles.timeText,
          isCurrentUser ? styles.currentUserTimeText : styles.otherUserTimeText,
        ]}
      >
        {formatTime(message.createdAt)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    maxWidth: "80%",
  },
  currentUserContainer: {
    alignSelf: "flex-end",
  },
  otherUserContainer: {
    alignSelf: "flex-start",
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  currentUserBubble: {
    backgroundColor: Colors.primary,
  },
  otherUserBubble: {
    backgroundColor: Colors.card,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  currentUserText: {
    color: Colors.white,
  },
  otherUserText: {
    color: Colors.text,
  },
  timeText: {
    fontSize: 12,
    marginTop: 4,
  },
  currentUserTimeText: {
    color: Colors.textSecondary,
    textAlign: "right",
  },
  otherUserTimeText: {
    color: Colors.textSecondary,
    textAlign: "left",
  },
});