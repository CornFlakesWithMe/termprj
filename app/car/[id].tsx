import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Star,
  Users,
  Calendar,
  MapPin,
  MessageSquare,
  ChevronLeft,
  Heart,
  Share2,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { useCarStore } from "@/stores/carStore";
import { useUserStore } from "@/stores/userStore";
import { useReviewStore } from "@/stores/reviewStore";
import Button from "@/components/Button";
import DateRangePicker from "@/components/DateRangePicker";
import ReviewItem from "@/components/ReviewItem";

const { width } = Dimensions.get("window");

export default function CarDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { cars, selectCar, selectedCar, isCarAvailable } = useCarStore();
  const { currentUser } = useUserStore();
  const { reviews, getReviewsByTargetId } = useReviewStore();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [carReviews, setCarReviews] = useState<any[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      selectCar(id as string);
    }
  }, [id]);

  useEffect(() => {
    if (selectedCar) {
      const reviews = getReviewsByTargetId(selectedCar.id, "car");
      setCarReviews(reviews);
    }
  }, [selectedCar, reviews]);

  if (!selectedCar) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const owner = useUserStore.getState().getUserById(selectedCar.ownerId);

  const handleDateChange = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
  };

  const isAvailable = startDate && endDate && isCarAvailable(
    selectedCar.id,
    startDate.toISOString(),
    endDate.toISOString()
  );

  const calculateTotalPrice = () => {
    if (!startDate || !endDate) return 0;
    
    const days = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return days * selectedCar.pricePerDay;
  };

  const handleBookNow = () => {
    if (!currentUser || !startDate || !endDate) return;
    
    router.push({
      pathname: "/booking/new",
      params: {
        carId: selectedCar.id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        totalPrice: calculateTotalPrice().toString(),
      },
    });
  };

  const handleContactOwner = () => {
    if (!currentUser || !owner) return;
    
    router.push(`/messages/${owner.id}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen
        options={{
          title: "",
          headerShown: true,
          headerTransparent: true,
          headerLeft: () => (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ChevronLeft size={24} color={Colors.white} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity style={styles.headerButton}>
                <Heart size={24} color={Colors.white} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton}>
                <Share2 size={24} color={Colors.white} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <FlatList
            data={selectedCar.images}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const newIndex = Math.floor(
                event.nativeEvent.contentOffset.x / width
              );
              setActiveImageIndex(newIndex);
            }}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.carImage} />
            )}
          />
          <View style={styles.paginationContainer}>
            {selectedCar.images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === activeImageIndex && styles.activePaginationDot,
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.header}>
            <View>
              <Text style={styles.carName}>
                {selectedCar.year} {selectedCar.make} {selectedCar.model}
              </Text>
              <View style={styles.ratingContainer}>
                <Star size={16} color={Colors.warning} fill={Colors.warning} />
                <Text style={styles.rating}>
                  {selectedCar.rating} ({selectedCar.reviewCount} reviews)
                </Text>
              </View>
            </View>
            <Text style={styles.price}>
              <Text style={styles.priceValue}>${selectedCar.pricePerDay}</Text>
              <Text style={styles.priceUnit}>/day</Text>
            </Text>
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Users size={20} color={Colors.primary} />
              <Text style={styles.detailText}>{selectedCar.seats} seats</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.typeTag}>{selectedCar.type}</Text>
            </View>
            <View style={styles.detailItem}>
              <MapPin size={20} color={Colors.primary} />
              <Text style={styles.detailText} numberOfLines={1}>
                {selectedCar.location.address.split(",")[0]}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{selectedCar.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Features</Text>
            <View style={styles.featuresContainer}>
              {selectedCar.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Owner</Text>
            {owner && (
              <TouchableOpacity
                style={styles.ownerContainer}
                onPress={() => router.push(`/profile/${owner.id}`)}
              >
                <Image
                  source={{
                    uri: owner.avatar || "https://images.unsplash.com/photo-1633332755192-727a05c4013d",
                  }}
                  style={styles.ownerAvatar}
                />
                <View style={styles.ownerInfo}>
                  <Text style={styles.ownerName}>{owner.name}</Text>
                  <Text style={styles.ownerJoined}>
                    Joined {new Date(owner.createdAt).getFullYear()}
                  </Text>
                </View>
                <Button
                  title="Contact"
                  onPress={handleContactOwner}
                  variant="outline"
                  size="small"
                  icon={<MessageSquare size={16} color={Colors.primary} />}
                />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Availability</Text>
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onDateChange={handleDateChange}
              minDate={new Date()}
            />
          </View>

          {carReviews.length > 0 && (
            <View style={styles.section}>
              <View style={styles.reviewsHeader}>
                <Text style={styles.sectionTitle}>Reviews</Text>
                <TouchableOpacity
                  onPress={() => router.push(`/reviews/${selectedCar.id}`)}
                >
                  <Text style={styles.viewAllText}>View all</Text>
                </TouchableOpacity>
              </View>
              {carReviews.slice(0, 2).map((review) => (
                <ReviewItem key={review.id} review={review} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>
            ${calculateTotalPrice()}
            <Text style={styles.totalPriceUnit}>
              {startDate && endDate ? ` for ${Math.ceil(
                (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
              )} days` : ""}
            </Text>
          </Text>
        </View>
        <Button
          title="Book Now"
          onPress={handleBookNow}
          disabled={!startDate || !endDate || !isAvailable}
          style={styles.bookButton}
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerButtons: {
    flexDirection: "row",
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  imageContainer: {
    position: "relative",
    height: 300,
  },
  carImage: {
    width,
    height: 300,
    resizeMode: "cover",
  },
  paginationContainer: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  activePaginationDot: {
    backgroundColor: Colors.white,
    width: 16,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  carName: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rating: {
    fontSize: 14,
    color: Colors.text,
  },
  price: {
    textAlign: "right",
  },
  priceValue: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
  },
  priceUnit: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  detailsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 24,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: Colors.text,
  },
  typeTag: {
    fontSize: 14,
    color: Colors.primary,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    overflow: "hidden",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  featuresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  featureItem: {
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: Colors.text,
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
  reviewsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "500",
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
    justifyContent: "space-between",
  },
  totalContainer: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
  },
  totalPriceUnit: {
    fontSize: 14,
    fontWeight: "400",
    color: Colors.textSecondary,
  },
  bookButton: {
    flex: 1,
    marginLeft: 16,
  },
});