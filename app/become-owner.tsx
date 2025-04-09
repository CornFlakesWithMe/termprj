import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useUserStore } from "@/stores/userStore";
import { useCarStore } from "@/stores/carStore";
import Button from "@/components/Button";
import { CarBuilder } from "@/patterns/builder";
import { CarType } from "@/types/car";

export default function BecomeOwnerScreen() {
  const router = useRouter();
  const { currentUser } = useUserStore();
  const { createCar } = useCarStore();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: "",
    type: "Sedan" as CarType,
    seats: "",
    color: "",
    licensePlate: "",
    mileage: "",
    pricePerDay: "",
    location: "",
    description: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
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
        .setFeatures([]) // Empty features array by default
        .setAvailability([]) // Empty availability calendar by default
        .build();

      // Add car to store with correct parameters
      await createCar(currentUser.id, car);

      // Update user to be a car owner
      useUserStore.getState().updateUser(currentUser.id, { isCarOwner: true });

      Alert.alert("Success", "Your car has been listed successfully!");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to list your car. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>List Your Car</Text>
          <Text style={styles.subtitle}>Fill in your car details below</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Make *</Text>
            <TextInput
              style={styles.input}
              value={formData.make}
              onChangeText={(value) => handleInputChange("make", value)}
              placeholder="e.g., Toyota"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Model *</Text>
            <TextInput
              style={styles.input}
              value={formData.model}
              onChangeText={(value) => handleInputChange("model", value)}
              placeholder="e.g., Camry"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Year *</Text>
            <TextInput
              style={styles.input}
              value={formData.year}
              onChangeText={(value) => handleInputChange("year", value)}
              placeholder="e.g., 2020"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Type</Text>
            <View style={styles.typeButtons}>
              {["Sedan", "SUV", "Electric", "Luxury"].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    formData.type === type && styles.typeButtonActive,
                  ]}
                  onPress={() => handleInputChange("type", type)}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      formData.type === type && styles.typeButtonTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Number of Seats</Text>
            <TextInput
              style={styles.input}
              value={formData.seats}
              onChangeText={(value) => handleInputChange("seats", value)}
              placeholder="e.g., 5"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Color</Text>
            <TextInput
              style={styles.input}
              value={formData.color}
              onChangeText={(value) => handleInputChange("color", value)}
              placeholder="e.g., Red"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>License Plate</Text>
            <TextInput
              style={styles.input}
              value={formData.licensePlate}
              onChangeText={(value) => handleInputChange("licensePlate", value)}
              placeholder="e.g., ABC123"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mileage</Text>
            <TextInput
              style={styles.input}
              value={formData.mileage}
              onChangeText={(value) => handleInputChange("mileage", value)}
              placeholder="e.g., 50000"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Price Per Day *</Text>
            <TextInput
              style={styles.input}
              value={formData.pricePerDay}
              onChangeText={(value) => handleInputChange("pricePerDay", value)}
              placeholder="e.g., 50"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              value={formData.location}
              onChangeText={(value) => handleInputChange("location", value)}
              placeholder="e.g., New York, NY"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(value) => handleInputChange("description", value)}
              placeholder="Describe your car..."
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        <Button
          title="List Car"
          onPress={handleSubmit}
          style={styles.submitButton}
          loading={isLoading}
        />
      </ScrollView>
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
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  typeButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.card,
  },
  typeButtonActive: {
    backgroundColor: Colors.primary,
  },
  typeButtonText: {
    fontSize: 14,
    color: Colors.text,
  },
  typeButtonTextActive: {
    color: Colors.white,
  },
  submitButton: {
    margin: 16,
  },
});
