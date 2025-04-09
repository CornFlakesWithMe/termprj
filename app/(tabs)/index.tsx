import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Car, MapPin, Search } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useUserStore } from "@/stores/userStore";
import { useCarStore } from "@/stores/carStore";
import CarCard from "@/components/CarCard";
import Button from "@/components/Button";

export default function HomeScreen() {
  const router = useRouter();
  const { currentUser } = useUserStore();
  const { cars } = useCarStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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

  const topRatedCars = [...cars]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  const nearbyCars = [...cars].slice(0, 5);

  const handleSearchPress = () => {
    router.push("/search");
  };

  const handleSeeAllPress = (category: string) => {
    router.push({
      pathname: "/search",
      params: { category },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Hello, {currentUser.name.split(" ")[0]}
            </Text>
            <Text style={styles.subtitle}>Find your perfect ride today</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/profile")}
            style={styles.avatarContainer}
          >
            <Image
              source={{
                uri:
                  currentUser.avatar ||
                  "https://images.unsplash.com/photo-1633332755192-727a05c4013d",
              }}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.searchBar}
          onPress={handleSearchPress}
          activeOpacity={0.8}
        >
          <Search size={20} color={Colors.textSecondary} />
          <Text style={styles.searchText}>Search for cars...</Text>
        </TouchableOpacity>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => router.push("/search?type=Electric")}
          >
            <View
              style={[styles.quickActionIcon, { backgroundColor: "#E6F7FF" }]}
            >
              <Car size={24} color="#0091FF" />
            </View>
            <Text style={styles.quickActionText}>Electric</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => router.push("/search?type=SUV")}
          >
            <View
              style={[styles.quickActionIcon, { backgroundColor: "#FFF2E6" }]}
            >
              <Car size={24} color="#FF8C00" />
            </View>
            <Text style={styles.quickActionText}>SUVs</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => router.push("/search?type=Luxury")}
          >
            <View
              style={[styles.quickActionIcon, { backgroundColor: "#F7E6FF" }]}
            >
              <Car size={24} color="#9C27B0" />
            </View>
            <Text style={styles.quickActionText}>Luxury</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => router.push("/search")}
          >
            <View
              style={[styles.quickActionIcon, { backgroundColor: "#E6FFE6" }]}
            >
              <MapPin size={24} color="#00C853" />
            </View>
            <Text style={styles.quickActionText}>Nearby</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Rated Cars</Text>
          <TouchableOpacity onPress={() => handleSeeAllPress("topRated")}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={topRatedCars}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carsList}
          renderItem={({ item }) => (
            <CarCard car={item} style={styles.carCard} />
          )}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby Cars</Text>
          <TouchableOpacity onPress={() => handleSeeAllPress("nearby")}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={nearbyCars}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carsList}
          renderItem={({ item }) => (
            <CarCard car={item} style={styles.carCard} />
          )}
        />

        {currentUser.isCarOwner ? (
          <View style={styles.ownerSection}>
            <Text style={styles.ownerSectionTitle}>Manage Your Cars</Text>
            <Text style={styles.ownerSectionSubtitle}>
              List your car or manage your existing listings
            </Text>
            <Button
              title="My Listings"
              onPress={() => router.push("/my-cars")}
              style={styles.ownerButton}
            />
          </View>
        ) : (
          <View style={styles.ownerSection}>
            <Text style={styles.ownerSectionTitle}>Become a Car Owner</Text>
            <Text style={styles.ownerSectionSubtitle}>
              List your car on DriveShare and start earning
            </Text>
            <Button
              title="List Your Car"
              onPress={() => router.push("/become-owner")}
              style={styles.ownerButton}
            />
          </View>
        )}
      </ScrollView>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: Colors.card,
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  searchText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginLeft: 12,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  quickActionItem: {
    alignItems: "center",
  },
  quickActionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "500",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
  },
  seeAllText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "500",
  },
  carsList: {
    paddingLeft: 16,
    paddingRight: 8,
    paddingBottom: 8,
  },
  carCard: {
    width: 300,
    marginRight: 16,
    marginBottom: 8,
  },
  ownerSection: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 16,
    padding: 24,
    margin: 16,
    marginTop: 8,
    alignItems: "center",
  },
  ownerSectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  ownerSectionSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 16,
    textAlign: "center",
  },
  ownerButton: {
    width: "100%",
  },
});
