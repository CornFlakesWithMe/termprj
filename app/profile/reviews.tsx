import React from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  ActivityIndicator,
} from "react-native";
import { useReviewStore } from "@/stores/reviewStore";
import { useUserStore } from "@/stores/userStore";
import Colors from "@/constants/colors";
import { Star } from "lucide-react-native";

export default function ReviewsScreen() {
  const { currentUser } = useUserStore();
  const { getReviewsByTargetId, isLoading } = useReviewStore();

  const reviews = currentUser ? getReviewsByTargetId(currentUser.id) : [];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (reviews.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No reviews yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.ratingContainer}>
                <Star size={16} color={Colors.primary} fill={Colors.primary} />
                <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
              </View>
              <Text style={styles.dateText}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.commentText}>{item.comment}</Text>
            <Text style={styles.typeText}>
              {item.type === "owner" ? "Car Review" : "User Review"}
            </Text>
          </View>
        )}
        contentContainerStyle={styles.listContainer}
      />
    </View>
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.white,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  listContainer: {
    padding: 16,
  },
  reviewCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginLeft: 4,
  },
  dateText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  commentText: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 8,
  },
  typeText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
