import React from "react";
import { StyleSheet, Text, View, Image } from "react-native";
import { Review, User } from "@/types";
import Colors from "@/constants/colors";
import { Star } from "lucide-react-native";
import { useUserStore } from "@/stores/userStore";

interface ReviewItemProps {
  review: Review;
}

export default function ReviewItem({ review }: ReviewItemProps) {
  const { getUserById } = useUserStore();
  const reviewer = getUserById(review.reviewerId);

  if (!reviewer) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            color={Colors.warning}
            fill={star <= rating ? Colors.warning : "transparent"}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: reviewer.avatar || "https://images.unsplash.com/photo-1633332755192-727a05c4013d" }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.name}>{reviewer.name}</Text>
            <Text style={styles.date}>{formatDate(review.createdAt)}</Text>
          </View>
        </View>
        {renderStars(review.rating)}
      </View>
      <Text style={styles.comment}>{review.comment}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  date: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 2,
  },
  comment: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
});