import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Calendar,
  MapPin,
  ChevronRight,
  Clock,
  History,
  Car,
  User,
  Star,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { useCarStore } from "@/stores/carStore";
import { useUserStore } from "@/stores/userStore";
import { useBookingStore } from "@/stores/bookingStore";

type BookingTab = "active" | "history";
type BookingType = "renter" | "owner";

export default function BookingsScreen() {
  const router = useRouter();
  const { cars, getCarsByOwner } = useCarStore();
  const { currentUser } = useUserStore();
  const { bookings, getBookingsByUserId } = useBookingStore();
  const [renterBookings, setRenterBookings] = useState<any[]>([]);
  const [ownerBookings, setOwnerBookings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<BookingTab>("active");
  const [activeType, setActiveType] = useState<BookingType>("renter");
  const [ownedCars, setOwnedCars] = useState<Car[]>([]);

  useEffect(() => {
    if (currentUser) {
      const renterBookings = getBookingsByUserId(currentUser.id, true);
      const ownerBookings = getBookingsByUserId(currentUser.id, false);
      const userCars = getCarsByOwner(currentUser.id);
      setRenterBookings(renterBookings);
      setOwnerBookings(ownerBookings);
      setOwnedCars(userCars);
    }
  }, [currentUser, bookings, cars, getCarsByOwner, getBookingsByUserId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return Colors.success;
      case "pending":
        return Colors.warning;
      case "cancelled":
        return Colors.error;
      default:
        return Colors.textSecondary;
    }
  };

  const filterBookings = (bookings: any[]) => {
    const now = new Date();
    return bookings.filter((booking) => {
      const endDate = new Date(booking.endDate);
      if (activeTab === "active") {
        return endDate >= now && booking.status !== "cancelled";
      } else {
        return endDate < now || booking.status === "cancelled";
      }
    });
  };

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === "active" && styles.activeTab]}
        onPress={() => setActiveTab("active")}
      >
        <Clock
          size={16}
          color={activeTab === "active" ? Colors.primary : Colors.textSecondary}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === "active" && styles.activeTabText,
          ]}
        >
          Active
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === "history" && styles.activeTab]}
        onPress={() => setActiveTab("history")}
      >
        <History
          size={16}
          color={
            activeTab === "history" ? Colors.primary : Colors.textSecondary
          }
        />
        <Text
          style={[
            styles.tabText,
            activeTab === "history" && styles.activeTabText,
          ]}
        >
          History
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderTypeTabs = () => (
    <View style={styles.typeTabsContainer}>
      <TouchableOpacity
        style={[
          styles.typeTab,
          activeType === "renter" && styles.activeTypeTab,
        ]}
        onPress={() => setActiveType("renter")}
      >
        <Car
          size={16}
          color={
            activeType === "renter" ? Colors.primary : Colors.textSecondary
          }
        />
        <Text
          style={[
            styles.typeTabText,
            activeType === "renter" && styles.activeTypeTabText,
          ]}
        >
          Rented Vehicles
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.typeTab, activeType === "owner" && styles.activeTypeTab]}
        onPress={() => setActiveType("owner")}
      >
        <User
          size={16}
          color={activeType === "owner" ? Colors.primary : Colors.textSecondary}
        />
        <Text
          style={[
            styles.typeTabText,
            activeType === "owner" && styles.activeTypeTabText,
          ]}
        >
          My Vehicles
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <Text>Please sign in to view your bookings</Text>
      </View>
    );
  }

  const currentBookings =
    activeType === "renter" ? renterBookings : ownerBookings;
  const filteredBookings = filterBookings(currentBookings);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen
        options={{
          title: "My Bookings",
        }}
      />

      {renderTabs()}
      {renderTypeTabs()}

      {activeType === "owner" && ownedCars.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Vehicles Listed</Text>
          <Text style={styles.emptyText}>
            You haven't listed any vehicles yet. List your first vehicle to
            start earning!
          </Text>
          <TouchableOpacity
            style={styles.listCarButton}
            onPress={() => router.push("/become-owner")}
          >
            <Text style={styles.listCarButtonText}>List Your Car</Text>
          </TouchableOpacity>
        </View>
      ) : activeType === "owner" ? (
        <ScrollView style={styles.scrollView}>
          {ownedCars.map((car) => (
            <TouchableOpacity
              key={car.id}
              style={styles.bookingCard}
              onPress={() => router.push(`/car/${car.id}`)}
            >
              <Image source={{ uri: car.images[0] }} style={styles.carImage} />
              <View style={styles.bookingInfo}>
                <View style={styles.headerRow}>
                  <Text style={styles.carName}>
                    {car.year} {car.make} {car.model}
                  </Text>
                  <Text
                    style={[
                      styles.status,
                      {
                        color: car.isAvailable ? Colors.success : Colors.error,
                      },
                    ]}
                  >
                    {car.isAvailable ? "Available" : "Booked"}
                  </Text>
                </View>

                <View style={styles.locationContainer}>
                  <MapPin size={16} color={Colors.textSecondary} />
                  <Text style={styles.locationText} numberOfLines={1}>
                    {typeof car.location?.address === "string"
                      ? car.location.address.split(",")[0]
                      : "Location not specified"}
                  </Text>
                </View>

                <View style={styles.footer}>
                  <Text style={styles.price}>
                    <Text style={styles.priceValue}>${car.pricePerDay}</Text>
                    <Text style={styles.priceUnit}>/day</Text>
                  </Text>
                  <View style={styles.ratingContainer}>
                    <Star
                      size={16}
                      color={Colors.warning}
                      fill={Colors.warning}
                    />
                    <Text style={styles.rating}>
                      {car.rating} ({car.reviewCount})
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : filteredBookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>
            {activeTab === "active" ? "No Active Bookings" : "No Past Bookings"}
          </Text>
          <Text style={styles.emptyText}>
            {activeTab === "active"
              ? `Your upcoming ${activeType} bookings will appear here`
              : `Your past ${activeType} bookings will appear here`}
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          {filteredBookings.map((booking) => {
            const car = cars.find((c) => c.id === booking.carId);
            if (!car) return null;

            return (
              <TouchableOpacity
                key={booking.id}
                style={styles.bookingCard}
                onPress={() => router.push(`/booking/${booking.id}`)}
              >
                <Image
                  source={{ uri: car.images[0] }}
                  style={styles.carImage}
                />
                <View style={styles.bookingInfo}>
                  <View style={styles.headerRow}>
                    <Text style={styles.carName}>
                      {car.year} {car.make} {car.model}
                    </Text>
                    <Text
                      style={[
                        styles.status,
                        { color: getStatusColor(booking.status) },
                      ]}
                    >
                      {booking.status}
                    </Text>
                  </View>

                  <View style={styles.locationContainer}>
                    <MapPin size={16} color={Colors.textSecondary} />
                    <Text style={styles.locationText} numberOfLines={1}>
                      {typeof car.location?.address === "string"
                        ? car.location.address.split(",")[0]
                        : "Location not specified"}
                    </Text>
                  </View>

                  <View style={styles.dateContainer}>
                    <View style={styles.dateItem}>
                      <Text style={styles.dateLabel}>Start</Text>
                      <View style={styles.dateValueContainer}>
                        <Calendar size={16} color={Colors.primary} />
                        <Text style={styles.dateValue}>
                          {formatDate(booking.startDate)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.dateDivider} />
                    <View style={styles.dateItem}>
                      <Text style={styles.dateLabel}>End</Text>
                      <View style={styles.dateValueContainer}>
                        <Calendar size={16} color={Colors.primary} />
                        <Text style={styles.dateValue}>
                          {formatDate(booking.endDate)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.priceContainer}>
                    <Text style={styles.priceLabel}>Total Price</Text>
                    <Text style={styles.priceValue}>${booking.totalPrice}</Text>
                  </View>
                </View>
                <ChevronRight size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.primary,
  },
  typeTabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  typeTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
  },
  activeTypeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  typeTabText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textSecondary,
  },
  activeTypeTabText: {
    color: Colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  bookingCard: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    alignItems: "center",
  },
  carImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  bookingInfo: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  carName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  status: {
    fontSize: 14,
    fontWeight: "500",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  dateContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  dateItem: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  dateValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateValue: {
    fontSize: 14,
    color: Colors.text,
  },
  dateDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  priceUnit: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  listCarButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  listCarButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.white,
  },
});
