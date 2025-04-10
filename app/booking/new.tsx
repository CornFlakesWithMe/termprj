import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, Image, Alert } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar, MapPin, CreditCard, DollarSign } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useCarStore } from "@/stores/carStore";
import { useUserStore } from "@/stores/userStore";
import { useBookingStore } from "@/stores/bookingStore";
import { usePaymentStore } from "@/stores/paymentStore";
import Button from "@/components/Button";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function NewBookingScreen() {
  const { carId, startDate, endDate, totalPrice } = useLocalSearchParams();
  const router = useRouter();
  const { cars } = useCarStore();
  const { currentUser } = useUserStore();
  const { createBooking } = useBookingStore();
  const { processPayment } = usePaymentStore();
  const [isLoading, setIsLoading] = useState(false);
  const [car, setCar] = useState<any>(null);
  const [owner, setOwner] = useState<any>(null);

  useEffect(() => {
    if (carId) {
      const foundCar = cars.find((c) => c.id === carId);
      if (foundCar) {
        setCar(foundCar);
        const carOwner = useUserStore.getState().getUserById(foundCar.ownerId);
        if (carOwner) {
          setOwner(carOwner);
        }
      }
    }
  }, [carId, cars]);

  if (!car || !currentUser) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleConfirmBooking = async () => {
    if (!currentUser || !car || !startDate || !endDate) return;

    setIsLoading(true);

    try {
      // Create booking
      const booking = await createBooking(
        car.id,
        currentUser.id,
        startDate as string,
        endDate as string
      );

      if (!booking) {
        Alert.alert("Error", "Failed to create booking");
        setIsLoading(false);
        return;
      }

      // Process payment
      const paymentSuccess = await processPayment(
        booking.id,
        currentUser.id,
        car.ownerId,
        booking.totalPrice
      );

      if (!paymentSuccess) {
        Alert.alert("Error", "Payment failed");
        setIsLoading(false);
        return;
      }

      // Navigate to booking confirmation
      router.replace(`/booking/${booking.id}`);
    } catch (error) {
      Alert.alert("Error", "Something went wrong");
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen
        options={{
          title: "Confirm Booking",
        }}
      />

      <ScrollView style={styles.scrollView}>
        <View style={styles.carContainer}>
          <Image source={{ uri: car.images[0] }} style={styles.carImage} />
          <View style={styles.carInfo}>
            <Text style={styles.carName}>
              {car.year} {car.make} {car.model}
            </Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={20} color="#666" />
              <Text style={styles.locationText}>
                {typeof car.location?.address === "string"
                  ? car.location.address.split(",")[0]
                  : "Location not specified"}
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
                  {formatDate(startDate as string)}
                </Text>
              </View>
            </View>
            <View style={styles.dateDivider} />
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>End Date</Text>
              <View style={styles.dateValueContainer}>
                <Calendar size={16} color={Colors.primary} />
                <Text style={styles.dateValue}>
                  {formatDate(endDate as string)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Details</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              ${car.pricePerDay} x{" "}
              {Math.ceil(
                (new Date(endDate as string).getTime() -
                  new Date(startDate as string).getTime()) /
                  (1000 * 60 * 60 * 24)
              )}{" "}
              days
            </Text>
            <Text style={styles.priceValue}>${totalPrice}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Service fee</Text>
            <Text style={styles.priceValue}>$0</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${totalPrice}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentMethod}>
            <CreditCard size={24} color={Colors.primary} />
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentTitle}>Account Balance</Text>
              <Text style={styles.paymentSubtitle}>
                Current balance: ${currentUser.balance}
              </Text>
            </View>
          </View>
          {parseFloat(totalPrice as string) > currentUser.balance && (
            <Text style={styles.insufficientFunds}>
              Warning: Insufficient funds in your account
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Car Owner</Text>
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

        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            By confirming this booking, you agree to the DriveShare Terms of
            Service and acknowledge the Cancellation Policy.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerPriceContainer}>
          <DollarSign size={20} color={Colors.text} />
          <Text style={styles.footerPrice}>${totalPrice}</Text>
        </View>
        <Button
          title="Confirm & Pay"
          onPress={handleConfirmBooking}
          loading={isLoading}
          disabled={
            isLoading || parseFloat(totalPrice as string) > currentUser.balance
          }
          style={styles.confirmButton}
        />
      </View>
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
    paddingBottom: 100,
  },
  carContainer: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  carImage: {
    width: 80,
    height: 80,
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
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: Colors.textSecondary,
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
    backgroundColor: Colors.card,
    borderRadius: 12,
    overflow: "hidden",
  },
  dateItem: {
    flex: 1,
    padding: 16,
  },
  dateLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  dateValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "500",
  },
  dateDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 16,
    color: Colors.text,
  },
  priceValue: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: "500",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
    marginTop: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
  },
  paymentInfo: {
    marginLeft: 16,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text,
    marginBottom: 4,
  },
  paymentSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  insufficientFunds: {
    color: Colors.error,
    fontSize: 14,
    marginTop: 12,
  },
  ownerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
  },
  ownerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
  termsContainer: {
    padding: 16,
  },
  termsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  footerPriceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  footerPrice: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
    marginLeft: 4,
  },
  confirmButton: {
    flex: 1,
  },
});
