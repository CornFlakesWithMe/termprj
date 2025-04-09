import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Colors from "@/constants/colors";
import { useUserStore } from "@/stores/userStore";
import { useBookingStore } from "@/stores/bookingStore";
import BookingItem from "@/components/BookingItem";

type BookingTab = "renter" | "owner";

export default function BookingsScreen() {
  const router = useRouter();
  const { currentUser } = useUserStore();
  const { bookings, getBookingsByUserId, fetchBookings } = useBookingStore();
  const [activeTab, setActiveTab] = useState<BookingTab>("renter");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
    
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

  // Show loading state while checking authentication
  if (isLoading || !currentUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const userBookings = getBookingsByUserId(
    currentUser.id,
    activeTab === "renter"
  );

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === "renter" && styles.activeTab]}
        onPress={() => setActiveTab("renter")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "renter" && styles.activeTabText,
          ]}
        >
          My Rentals
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === "owner" && styles.activeTab]}
        onPress={() => setActiveTab("owner")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "owner" && styles.activeTabText,
          ]}
        >
          My Car Bookings
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {renderTabs()}

      <FlatList
        data={userBookings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <BookingItem booking={item} />}
        contentContainerStyle={styles.bookingsList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No bookings found</Text>
            <Text style={styles.emptyText}>
              {activeTab === "renter"
                ? "You haven't rented any cars yet"
                : "Your cars haven't been booked yet"}
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
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
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
  bookingsList: {
    padding: 16,
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