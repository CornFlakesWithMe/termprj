import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Calendar,
  MapPin,
  CheckCircle,
  Star,
  MessageSquare,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { useCarStore } from "@/stores/carStore";
import { useUserStore } from "@/stores/userStore";
import { useBookingStore } from "@/stores/bookingStore";
import { useReviewStore } from "@/stores/reviewStore";
import Button from "@/components/Button";
import ReviewForm from "@/components/ReviewForm";

export default function BookingConfirmationScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { cars } = useCarStore();
  const { currentUser } = useUserStore();
  const { bookings, getBookingById } = useBookingStore();
  const { reviews, createReview, getReviewByBookingId } = useReviewStore();
  const [booking, setBooking] = useState<any>(null);
  const [car, setCar] = useState<any>(null);
  const [owner, setOwner] = useState<any>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewType, setReviewType] = useState<"owner" | "renter" | null>(null);
  const [existingReview, setExistingReview] = useState<any>(null);

  useEffect(() => {
    if (id) {
      const foundBooking = getBookingById(id as string);
      if (foundBooking) {
        setBooking(foundBooking);
        const foundCar = cars.find((c) => c.id === foundBooking.carId);
        if (foundCar) {
          setCar(foundCar);
          const carOwner = useUserStore
            .getState()
            .getUserById(foundCar.ownerId);
          if (carOwner) {
            setOwner(carOwner);
          }
        }
      }
    }
  }, [id, bookings, cars]);

  useEffect(() => {
    if (booking) {
      const review = getReviewByBookingId(booking.id);
      setExistingReview(review);
    }
  }, [booking, reviews]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleReviewSubmit = async (rating: number, comment: string) => {
    if (!booking || !car || !currentUser || !reviewType) return;

    const reviewedId = reviewType === "owner" ? car.ownerId : booking.renterId;

    const newReview = await createReview(
      booking.id,
      car.id,
      currentUser.id,
      reviewedId,
      rating,
      comment,
      reviewType
    );

    if (newReview) {
      setShowReviewForm(false);
      setReviewType(null);
    }
  };

  if (!booking || !car || !currentUser) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const isRenter = currentUser.id === booking.renterId;
  const canReviewOwner = isRenter && !existingReview;
  const canReviewRenter = !isRenter && !existingReview;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen
        options={{
          title: "Booking Confirmation",
        }}
      />

      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <CheckCircle size={64} color={Colors.success} />
          <Text style={styles.title}>Booking Confirmed!</Text>
          <Text style={styles.subtitle}>
            Your booking has been confirmed. You can find all the details below.
          </Text>
        </View>

        <View style={styles.carContainer}>
          <Image source={{ uri: car.images[0] }} style={styles.carImage} />
          <View style={styles.carInfo}>
            <Text style={styles.carName}>
              {car.year} {car.make} {car.model}
            </Text>
            <View style={styles.locationContainer}>
              <MapPin size={16} color={Colors.textSecondary} />
              <Text style={styles.locationText} numberOfLines={1}>
                {car.location.address.split(",")[0]}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trip Dates</Text>
          <View style={styles.dateContainer}>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Start Date</Text>
              <View style={styles.dateValueContainer}>
                <Calendar size={16} color={Colors.primary} />
                <Text style={styles.dateValue}>
                  {formatDate(booking.startDate)}
                </Text>
              </View>
            </View>
            <View style={styles.dateDivider} />
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>End Date</Text>
              <View style={styles.dateValueContainer}>
                <Calendar size={16} color={Colors.primary} />
                <Text style={styles.dateValue}>
                  {formatDate(booking.endDate)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Details</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Total Price</Text>
            <Text style={styles.priceValue}>${booking.totalPrice}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Status</Text>
            <Text style={styles.priceValue}>{booking.status}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Owner Information</Text>
          {owner && (
            <View style={styles.ownerContainer}>
              <Image
                source={{
                  uri:
                    owner.avatar ||
                    "https://images.unsplash.com/photo-1633332755192-727a05c4013d",
                }}
                style={styles.ownerAvatar}
              />
              <View style={styles.ownerInfo}>
                <Text style={styles.ownerName}>{owner.name}</Text>
                <Text style={styles.ownerJoined}>
                  Joined {new Date(owner.createdAt).getFullYear()}
                </Text>
              </View>
            </View>
          )}
        </View>

        {existingReview ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Review</Text>
            <View style={styles.reviewContainer}>
              <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={20}
                    color={
                      star <= existingReview.rating
                        ? Colors.primary
                        : Colors.border
                    }
                    fill={
                      star <= existingReview.rating ? Colors.primary : "none"
                    }
                  />
                ))}
              </View>
              <Text style={styles.reviewComment}>{existingReview.comment}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Leave a Review</Text>
            <View style={styles.reviewButtonsContainer}>
              {canReviewOwner && (
                <TouchableOpacity
                  style={styles.reviewButton}
                  onPress={() => {
                    setReviewType("owner");
                    setShowReviewForm(true);
                  }}
                >
                  <MessageSquare size={20} color={Colors.primary} />
                  <Text style={styles.reviewButtonText}>Review Owner</Text>
                </TouchableOpacity>
              )}
              {canReviewRenter && (
                <TouchableOpacity
                  style={styles.reviewButton}
                  onPress={() => {
                    setReviewType("renter");
                    setShowReviewForm(true);
                  }}
                >
                  <MessageSquare size={20} color={Colors.primary} />
                  <Text style={styles.reviewButtonText}>Review Renter</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="View My Bookings"
          onPress={() => router.push("/(tabs)/bookings")}
          style={styles.button}
        />
      </View>

      <Modal
        visible={showReviewForm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowReviewForm(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ReviewForm
              title={`Review ${reviewType === "owner" ? "Owner" : "Renter"}`}
              subtitle={`How was your experience with ${
                reviewType === "owner" ? owner?.name : "the renter"
              }?`}
              onSubmit={handleReviewSubmit}
              onCancel={() => setShowReviewForm(false)}
            />
          </View>
        </View>
      </Modal>
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
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    padding: 24,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  carContainer: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  carImage: {
    width: 100,
    height: 75,
    borderRadius: 8,
    marginRight: 16,
  },
  carInfo: {
    flex: 1,
    justifyContent: "center",
  },
  carName: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateItem: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  dateValueContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateValue: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 8,
  },
  dateDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  priceValue: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: "600",
  },
  ownerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ownerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  ownerInfo: {
    flex: 1,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  ownerJoined: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  reviewContainer: {
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  reviewComment: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  reviewButtonsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  reviewButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 8,
  },
  reviewButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.primary,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.white,
  },
  button: {
    width: "100%",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
  },
});
