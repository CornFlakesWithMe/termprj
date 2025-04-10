import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ViewStyle,
} from "react-native";
import { useRouter } from "expo-router";
import { Car } from "@/types";
import Colors from "@/constants/colors";
import { Star, Users, MapPin } from "lucide-react-native";

interface CarCardProps {
  car: Car;
  style?: ViewStyle;
  compact?: boolean;
}

export default function CarCard({ car, style, compact = false }: CarCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/car/${car.id}`);
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactContainer, style]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: car.images[0] }}
          style={styles.compactImage}
          resizeMode="cover"
        />
        <View style={styles.compactContent}>
          <Text style={styles.compactTitle} numberOfLines={1}>
            {car.make} {car.model}
          </Text>
          <Text style={styles.compactPrice}>${car.pricePerDay}/day</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: car.images[0] }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {car.year} {car.make} {car.model}
          </Text>
          <View style={styles.ratingContainer}>
            <Star size={16} color={Colors.warning} fill={Colors.warning} />
            <Text style={styles.rating}>
              {car.rating} ({car.reviewCount})
            </Text>
          </View>
        </View>

        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Users size={16} color={Colors.textSecondary} />
            <Text style={styles.detailText}>{car.seats} seats</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.typeTag}>{car.type}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.locationContainer}>
            <MapPin size={14} color={Colors.textSecondary} />
            <Text style={styles.location} numberOfLines={1}>
              {typeof car.location?.address === "string"
                ? car.location.address.split(",")[0]
                : "Location not specified"}
            </Text>
          </View>
          <Text style={styles.price}>
            <Text style={styles.priceValue}>${car.pricePerDay}</Text>
            <Text style={styles.priceUnit}>/day</Text>
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: "100%",
    height: 180,
    backgroundColor: Colors.card,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rating: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "500",
  },
  details: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  typeTag: {
    fontSize: 12,
    color: Colors.primary,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  location: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  price: {
    textAlign: "right",
  },
  priceValue: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  priceUnit: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  // Compact styles
  compactContainer: {
    width: 160,
    backgroundColor: Colors.white,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  compactImage: {
    width: "100%",
    height: 100,
    backgroundColor: Colors.card,
  },
  compactContent: {
    padding: 12,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  compactPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
  },
});
