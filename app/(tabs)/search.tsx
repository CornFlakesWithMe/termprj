import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { X, SlidersHorizontal } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useCarStore } from "@/stores/carStore";
import { useUserStore } from "@/stores/userStore";
import { SearchFilters } from "@/types";
import SearchBar from "@/components/SearchBar";
import CarCard from "@/components/CarCard";
import DateRangePicker from "@/components/DateRangePicker";
import Button from "@/components/Button";
import { CAR_TYPES, CAR_FEATURES } from "@/constants/mockData";

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { currentUser } = useUserStore();
  const { cars, filteredCars, searchCars } = useCarStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedType, setSelectedType] = useState<string | undefined>(
    params.type as string | undefined
  );
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{
    min?: number;
    max?: number;
  }>({});
  const [seatsFilter, setSeatsFilter] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize filters from params only once
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Handle authentication redirect
  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.replace("/auth/login");
    }
  }, [currentUser, isLoading]);

  // Apply initial filters from params only once
  useEffect(() => {
    if (!isLoading && currentUser) {
      const newFilters: SearchFilters = {};

      if (params.type) {
        newFilters.carType = params.type as string;
        setSelectedType(params.type as string);
      }

      if (params.category) {
        if (params.category === "topRated") {
          const sortedCars = [...cars].sort((a, b) => b.rating - a.rating);
          setFilters(newFilters);
        } else if (params.category === "nearby") {
          setFilters(newFilters);
        }
      } else {
        setFilters(newFilters);
      }
    }
  }, [params, currentUser, isLoading]);

  // Show loading state while checking authentication
  if (isLoading || !currentUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const applyFilters = (newFilters: SearchFilters) => {
    console.log("Applying new filters:", newFilters); // Debug log
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    searchCars(updatedFilters);
  };

  const handleSearch = () => {
    const newFilters = { ...filters };
    if (searchQuery) {
      newFilters.location = searchQuery;
    }
    applyFilters(newFilters);
  };

  const handleDateChange = (start: Date | null, end: Date | null) => {
    const newFilters = { ...filters };
    if (start && end) {
      newFilters.startDate = start.toISOString();
      newFilters.endDate = end.toISOString();
    } else {
      delete newFilters.startDate;
      delete newFilters.endDate;
    }

    setStartDate(start);
    setEndDate(end);
    applyFilters(newFilters);
  };

  const handlePriceRangeChange = (
    min: number | undefined,
    max: number | undefined
  ) => {
    console.log("Price range changed:", { min, max }); // Debug log
    setPriceRange({ min, max });
    const newFilters = { ...filters };
    if (min !== undefined) {
      newFilters.priceMin = min;
    } else {
      delete newFilters.priceMin;
    }
    if (max !== undefined) {
      newFilters.priceMax = max;
    } else {
      delete newFilters.priceMax;
    }
    applyFilters(newFilters);
  };

  const handleApplyFilters = () => {
    console.log("Applying filters..."); // Debug log
    const newFilters: SearchFilters = {};

    if (searchQuery) {
      newFilters.location = searchQuery;
    }

    if (startDate && endDate) {
      newFilters.startDate = startDate.toISOString();
      newFilters.endDate = endDate.toISOString();
    }

    if (selectedType) {
      newFilters.carType = selectedType;
    }

    if (selectedFeatures.length > 0) {
      newFilters.features = selectedFeatures;
    }

    if (priceRange.min !== undefined) {
      newFilters.priceMin = priceRange.min;
    }

    if (priceRange.max !== undefined) {
      newFilters.priceMax = priceRange.max;
    }

    if (seatsFilter) {
      newFilters.seats = seatsFilter;
    }

    console.log("New filters to apply:", newFilters); // Debug log
    applyFilters(newFilters);
    setIsFilterModalVisible(false);
  };

  const handleResetFilters = () => {
    console.log("Resetting filters..."); // Debug log
    setStartDate(null);
    setEndDate(null);
    setSelectedType(undefined);
    setSelectedFeatures([]);
    setPriceRange({});
    setSeatsFilter(undefined);
    applyFilters({});
    setIsFilterModalVisible(false);
  };

  const toggleFeature = (feature: string) => {
    console.log("Toggling feature:", feature); // Debug log
    const newFeatures = selectedFeatures.includes(feature)
      ? selectedFeatures.filter((f) => f !== feature)
      : [...selectedFeatures, feature];

    setSelectedFeatures(newFeatures);

    const newFilters = { ...filters };
    if (newFeatures.length > 0) {
      newFilters.features = newFeatures;
    } else {
      delete newFilters.features;
    }

    applyFilters(newFilters);
  };

  const renderFilterModal = () => (
    <Modal
      visible={isFilterModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsFilterModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity onPress={() => setIsFilterModalVisible(false)}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <Text style={styles.filterSectionTitle}>Dates</Text>
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onDateChange={handleDateChange}
              minDate={new Date()}
            />

            <Text style={styles.filterSectionTitle}>Car Type</Text>
            <View style={styles.typeContainer}>
              {CAR_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    selectedType === type && styles.selectedTypeButton,
                  ]}
                  onPress={() =>
                    setSelectedType(type === selectedType ? undefined : type)
                  }
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      selectedType === type && styles.selectedTypeButtonText,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterSectionTitle}>Price Range (per day)</Text>
            <View style={styles.priceRangeContainer}>
              <TouchableOpacity
                style={[
                  styles.priceButton,
                  priceRange.max === 50 && styles.selectedPriceButton,
                ]}
                onPress={() => {
                  setPriceRange({ max: 50 });
                  const newFilters = { ...filters, priceMax: 50 };
                  delete newFilters.priceMin;
                  applyFilters(newFilters);
                }}
              >
                <Text
                  style={[
                    styles.priceButtonText,
                    priceRange.max === 50 && styles.selectedPriceButtonText,
                  ]}
                >
                  Under $50
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.priceButton,
                  priceRange.min === 50 &&
                    priceRange.max === 100 &&
                    styles.selectedPriceButton,
                ]}
                onPress={() => {
                  setPriceRange({ min: 50, max: 100 });
                  applyFilters({ ...filters, priceMin: 50, priceMax: 100 });
                }}
              >
                <Text
                  style={[
                    styles.priceButtonText,
                    priceRange.min === 50 &&
                      priceRange.max === 100 &&
                      styles.selectedPriceButtonText,
                  ]}
                >
                  $50 - $100
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.priceButton,
                  priceRange.min === 100 && styles.selectedPriceButton,
                ]}
                onPress={() => {
                  setPriceRange({ min: 100 });
                  applyFilters({ ...filters, priceMin: 100 });
                }}
              >
                <Text
                  style={[
                    styles.priceButtonText,
                    priceRange.min === 100 && styles.selectedPriceButtonText,
                  ]}
                >
                  $100+
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.filterSectionTitle}>Number of Seats</Text>
            <View style={styles.seatsContainer}>
              {[2, 4, 5, 7].map((seats) => (
                <TouchableOpacity
                  key={seats}
                  style={[
                    styles.seatsButton,
                    seatsFilter === seats && styles.selectedSeatsButton,
                  ]}
                  onPress={() => {
                    const newSeatsFilter =
                      seatsFilter === seats ? undefined : seats;
                    setSeatsFilter(newSeatsFilter);
                    applyFilters({ ...filters, seats: newSeatsFilter });
                  }}
                >
                  <Text
                    style={[
                      styles.seatsButtonText,
                      seatsFilter === seats && styles.selectedSeatsButtonText,
                    ]}
                  >
                    {seats}+
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterSectionTitle}>Features</Text>
            <View style={styles.featuresContainer}>
              {CAR_FEATURES.slice(0, 12).map((feature) => (
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
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              title="Reset"
              onPress={handleResetFilters}
              variant="outline"
              style={styles.footerButton}
            />
            <Button
              title="Apply Filters"
              onPress={handleApplyFilters}
              style={styles.footerButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmit={handleSearch}
          onFilterPress={() => setIsFilterModalVisible(true)}
        />
      </View>

      <View style={styles.filtersContainer}>
        {Object.keys(filters).length > 0 && (
          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={handleResetFilters}
          >
            <Text style={styles.clearFiltersText}>Clear Filters</Text>
            <X size={16} color={Colors.primary} />
          </TouchableOpacity>
        )}

        {selectedType && (
          <View style={styles.activeFilter}>
            <Text style={styles.activeFilterText}>{selectedType}</Text>
            <TouchableOpacity
              onPress={() => {
                setSelectedType(undefined);
                applyFilters({ ...filters, carType: undefined });
              }}
            >
              <X size={14} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        )}

        {startDate && endDate && (
          <View style={styles.activeFilter}>
            <Text style={styles.activeFilterText}>
              {startDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}{" "}
              -
              {endDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setStartDate(null);
                setEndDate(null);
                applyFilters({
                  ...filters,
                  startDate: undefined,
                  endDate: undefined,
                });
              }}
            >
              <X size={14} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <FlatList
        data={filteredCars}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CarCard car={item} style={styles.carCard} />}
        contentContainerStyle={styles.carsList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No cars found</Text>
            <Text style={styles.emptyText}>
              Try adjusting your filters or search criteria
            </Text>
          </View>
        }
      />

      {renderFilterModal()}
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filtersContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 8,
    paddingBottom: 0,
    gap: 8,
  },
  clearFiltersButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  clearFiltersText: {
    color: Colors.primary,
    fontWeight: "500",
    fontSize: 14,
  },
  activeFilter: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  activeFilterText: {
    color: Colors.primary,
    fontWeight: "500",
    fontSize: 14,
  },
  carsList: {
    padding: 16,
  },
  carCard: {
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    marginTop: 40,
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
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
  },
  modalBody: {
    padding: 16,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginTop: 16,
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  typeButtonText: {
    color: Colors.text,
    fontSize: 14,
  },
  selectedTypeButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  selectedTypeButtonText: {
    color: Colors.white,
    fontWeight: "500",
  },
  priceRangeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  priceButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    marginHorizontal: 4,
  },
  priceButtonText: {
    color: Colors.text,
    fontSize: 14,
  },
  selectedPriceButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  selectedPriceButtonText: {
    color: Colors.white,
    fontWeight: "500",
  },
  seatsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  seatsButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    marginHorizontal: 4,
  },
  seatsButtonText: {
    color: Colors.text,
    fontSize: 14,
  },
  selectedSeatsButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  selectedSeatsButtonText: {
    color: Colors.white,
    fontWeight: "500",
  },
  featuresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  featureButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  featureButtonText: {
    color: Colors.text,
    fontSize: 14,
  },
  selectedFeatureButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  selectedFeatureButtonText: {
    color: Colors.white,
    fontWeight: "500",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
  },
  footerButton: {
    flex: 1,
  },
});
