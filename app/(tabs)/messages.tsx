import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Colors from "@/constants/colors";
import { useUserStore } from "@/stores/userStore";
import { useMessageStore } from "@/stores/messageStore";
import ConversationItem from "@/components/ConversationItem";

export default function MessagesScreen() {
  const router = useRouter();
  const { currentUser } = useUserStore();
  const { messages, fetchMessages } = useMessageStore();
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
    
    // Set loading to false after a short delay to ensure component is mounted
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle authentication redirect in useEffect
  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.replace("/auth/login");
    }
  }, [currentUser, router, isLoading]);

  useEffect(() => {
    if (currentUser && messages.length > 0) {
      // Group messages by conversation
      const conversationMap = new Map<string, any>();
      
      messages.forEach(message => {
        if (message.senderId === currentUser.id || message.receiverId === currentUser.id) {
          const otherUserId = message.senderId === currentUser.id 
            ? message.receiverId 
            : message.senderId;
          
          const conversationKey = [currentUser.id, otherUserId].sort().join('-');
          
          if (!conversationMap.has(conversationKey)) {
            conversationMap.set(conversationKey, {
              otherUserId,
              messages: [],
            });
          }
          
          conversationMap.get(conversationKey).messages.push(message);
        }
      });
      
      // Sort conversations by latest message
      const sortedConversations = Array.from(conversationMap.values())
        .map(conversation => {
          const sortedMessages = conversation.messages.sort(
            (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          
          return {
            otherUserId: conversation.otherUserId,
            lastMessage: sortedMessages[0],
            unreadCount: sortedMessages.filter(
              (m: any) => m.receiverId === currentUser.id && !m.read
            ).length,
          };
        })
        .sort((a, b) => 
          new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
        );
      
      setConversations(sortedConversations);
    }
  }, [currentUser, messages]);

  // Show loading state while checking authentication
  if (isLoading || !currentUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.otherUserId}
        renderItem={({ item }) => (
          <ConversationItem
            otherUserId={item.otherUserId}
            lastMessage={item.lastMessage}
            unreadCount={item.unreadCount}
            currentUserId={currentUser.id}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptyText}>
              Your conversations will appear here
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.white,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
  },
});