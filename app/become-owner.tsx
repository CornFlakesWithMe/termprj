import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useUserStore } from "@/stores/userStore";
import { useCarStore } from "@/stores/carStore";
import { CarBuilder } from "@/patterns/builder";
import { CAR_FEATURES } from "@/constants/mockData";

export default function BecomeOwnerScreen() {
  const router = useRouter();
  const { currentUser } = useUserStore();
  const { createCar } = useCarStore();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: "",
    type: "Sedan",
    seats: "5",
    color: "",
    licensePlate: "",
    mileage: "",
    pricePerDay: "",
    location: {
      address: "",
      latitude: 0,
      longitude: 0,
    },
    description: "",
  });

  const handleSubmit = async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);

      // Validate required fields
      if (
        !formData.make ||
        !formData.model ||
        !formData.year ||
        !formData.pricePerDay
      ) {
        Alert.alert("Error", "Please fill in all required fields");
        return;
      }

      // Create car using builder pattern
      const car = new CarBuilder()
        .setMake(formData.make)
        .setModel(formData.model)
        .setYear(parseInt(formData.year))
        .setType(formData.type)
        .setSeats(parseInt(formData.seats) || 5)
        .setColor(formData.color)
        .setLicensePlate(formData.licensePlate)
        .setMileage(parseInt(formData.mileage) || 0)
        .setPricePerDay(parseFloat(formData.pricePerDay))
        .setLocation(formData.location)
        .setDescription(formData.description)
        .setOwnerId(currentUser.id)
        .setImages([
          "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2",
        ]) // Default car image
        .setFeatures(selectedFeatures)
        .setAvailability([]) // Empty availability calendar by default
        .build();

      // Add car to store with correct parameters
      await createCar(currentUser.id, car);

      // Update user to be a car owner
      useUserStore.getState().updateUser(currentUser.id, { isCarOwner: true });

      // Redirect to bookings page with My Vehicles tab active
      router.replace({
        pathname: "/(tabs)/bookings",
        params: { tab: "my-vehicles" },
      });
    } catch (error) {
      Alert.alert("Error", "Failed to list your car. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFeature = (feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen
        options={{
          title: "List Your Car",
        }}
      />

      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          <Text style={styles.label}>Make *</Text>
          <TextInput
            style={styles.input}
            placeholder="Toyota"
            value={formData.make}
            onChangeText={(text) => setFormData({ ...formData, make: text })}
          />

          <Text style={styles.label}>Model *</Text>
          <TextInput
            style={styles.input}
            placeholder="Camry"
            value={formData.model}
            onChangeText={(text) => setFormData({ ...formData, model: text })}
          />

          <Text style={styles.label}>Year *</Text>
          <TextInput
            style={styles.input}
            placeholder="2020"
            value={formData.year}
            onChangeText={(text) => setFormData({ ...formData, year: text })}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Type</Text>
          <TextInput
            style={styles.input}
            placeholder="Sedan"
            value={formData.type}
            onChangeText={(text) => setFormData({ ...formData, type: text })}
          />

          <Text style={styles.label}>Seats</Text>
          <TextInput
            style={styles.input}
            placeholder="5"
            value={formData.seats}
            onChangeText={(text) => setFormData({ ...formData, seats: text })}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Color</Text>
          <TextInput
            style={styles.input}
            placeholder="Silver"
            value={formData.color}
            onChangeText={(text) => setFormData({ ...formData, color: text })}
          />

          <Text style={styles.label}>License Plate</Text>
          <TextInput
            style={styles.input}
            placeholder="ABC123"
            value={formData.licensePlate}
            onChangeText={(text) =>
              setFormData({ ...formData, licensePlate: text })
            }
          />

          <Text style={styles.label}>Mileage</Text>
          <TextInput
            style={styles.input}
            placeholder="25000"
            value={formData.mileage}
            onChangeText={(text) => setFormData({ ...formData, mileage: text })}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Price Per Day *</Text>
          <TextInput
            style={styles.input}
            placeholder="50"
            value={formData.pricePerDay}
            onChangeText={(text) =>
              setFormData({ ...formData, pricePerDay: text })
            }
            keyboardType="numeric"
          />

          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            placeholder="123 Main St, City, State"
            value={formData.location.address}
            onChangeText={(text) =>
              setFormData({
                ...formData,
                location: { ...formData.location, address: text },
              })
            }
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your car..."
            value={formData.description}
            onChangeText={(text) =>
              setFormData({ ...formData, description: text })
            }
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Features</Text>
          <View style={styles.featuresContainer}>
            {CAR_FEATURES.map((feature) => (
              <TouchableOpacity
                key={feature}
                style={[
                  styles.featureButton,
                  selectedFeatures.includes(feature) &&
                    styles.selectedFeatureButton,
                ]}
                onPress={() => toggleFeature(feature)}
              >
                <Text
                  style={[
                    styles.featureButtonText,
                    selectedFeatures.includes(feature) &&
                      styles.selectedFeatureButtonText,
                  ]}
                >
                  {feature}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, isLoading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "Listing..." : "List Car"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  featuresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  featureButton: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedFeatureButton: {
    backgroundColor: Colors.primary,
  },
  featureButtonText: {
    fontSize: 14,
    color: Colors.text,
  },
  selectedFeatureButtonText: {
    color: Colors.white,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
