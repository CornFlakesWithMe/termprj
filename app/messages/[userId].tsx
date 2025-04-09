import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Send } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useUserStore } from "@/stores/userStore";
import { useMessageStore } from "@/stores/messageStore";
import MessageItem from "@/components/MessageItem";

export default function ConversationScreen() {
  const { userId } = useLocalSearchParams();
  const router = useRouter();
  const { currentUser } = useUserStore();
  const { messages, sendMessage, setCurrentConversation } = useMessageStore();
  const [messageText, setMessageText] = useState("");
  const [otherUser, setOtherUser] = useState<any>(null);
  const [conversationMessages, setConversationMessages] = useState<any[]>([]);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!currentUser) {
      router.replace("/auth/login");
      return;
    }

    if (userId) {
      const user = useUserStore.getState().getUserById(userId as string);
      if (user) {
        setOtherUser(user);
      }

      // Set current conversation and mark messages as read
      setCurrentConversation(currentUser.id, userId as string);
    }
  }, [userId, currentUser]);

  useEffect(() => {
    if (currentUser && userId) {
      // Get conversation messages
      const conversation = useMessageStore
        .getState()
        .getConversation(currentUser.id, userId as string);
      
      setConversationMessages(conversation);
    }
  }, [currentUser, userId, messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !currentUser || !otherUser) return;

    const newMessage = await sendMessage(
      currentUser.id,
      otherUser.id,
      messageText.trim()
    );

    if (newMessage) {
      setMessageText("");
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  if (!currentUser || !otherUser) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen
        options={{
          title: otherUser.name,
          headerTitleStyle: styles.headerTitle,
          headerLeft: () => (
            <TouchableOpacity
              style={styles.headerAvatar}
              onPress={() => router.push(`/profile/${otherUser.id}`)}
            >
              <Image
                source={{
                  uri: otherUser.avatar || "https://images.unsplash.com/photo-1633332755192-727a05c4013d",
                }}
                style={styles.avatar}
              />
            </TouchableOpacity>
          ),
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={conversationMessages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageItem message={item} currentUserId={currentUser.id} />
          )}
          contentContainerStyle={styles.messagesList}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No messages yet. Start the conversation!
              </Text>
            </View>
          }
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={messageText}
            onChangeText={setMessageText}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !messageText.trim() && styles.disabledSendButton,
            ]}
            onPress={handleSendMessage}
            disabled={!messageText.trim()}
          >
            <Send
              size={20}
              color={!messageText.trim() ? Colors.inactive : Colors.white}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerAvatar: {
    marginRight: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.white,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  disabledSendButton: {
    backgroundColor: Colors.card,
  },
});