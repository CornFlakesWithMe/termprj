import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Car, DateRange, Booking, SearchFilters } from "@/types";
import { CarBuilder } from "@/patterns/builder";
import { MOCK_CARS } from "@/constants/mockData";

interface CarState {
  cars: Car[];
  filteredCars: Car[];
  selectedCar: Car | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createCar: (ownerId: string, carData: Partial<Car>) => Promise<Car>;
  updateCar: (carId: string, carData: Partial<Car>) => Promise<boolean>;
  deleteCar: (carId: string) => Promise<boolean>;
  getCarById: (carId: string) => Car | undefined;
  getCarsByOwner: (ownerId: string) => Car[];
  updateAvailability: (carId: string, availability: DateRange[]) => Promise<boolean>;
  checkAvailability: (carId: string, startDate: string, endDate: string) => boolean;
  addBooking: (carId: string, booking: Booking) => Promise<boolean>;
  searchCars: (filters: SearchFilters) => void;
  selectCar: (carId: string) => void;
  isCarAvailable: (carId: string, startDate: string, endDate: string) => boolean;
}

export const useCarStore = create<CarState>()(
  persist(
    (set, get) => ({
      cars: MOCK_CARS,
      filteredCars: MOCK_CARS,
      selectedCar: null,
      isLoading: false,
      error: null,

      createCar: async (ownerId: string, carData: Partial<Car>) => {
        set({ isLoading: true, error: null });
        
        try {
          const builder = new CarBuilder();
          const newCar = builder
            .setOwnerId(ownerId)
            .setMake(carData.make!)
            .setModel(carData.model!)
            .setYear(carData.year!)
            .setType(carData.type!)
            .setSeats(carData.seats!)
            .setColor(carData.color!)
            .setLicensePlate(carData.licensePlate!)
            .setMileage(carData.mileage!)
            .setPricePerDay(carData.pricePerDay!)
            .setLocation(
              carData.location!.address,
              carData.location!.latitude,
              carData.location!.longitude
            )
            .setDescription(carData.description || "")
            .setImages(carData.images || [])
            .setFeatures(carData.features || [])
            .setAvailability(carData.availabilityCalendar || [])
            .build();

          set(state => ({
            cars: [...state.cars, newCar],
            filteredCars: [...state.cars, newCar],
            isLoading: false,
          }));

          return newCar;
        } catch (error) {
          set({ isLoading: false, error: "Failed to create car listing" });
          throw error;
        }
      },

      updateCar: async (carId: string, carData: Partial<Car>) => {
        set({ isLoading: true, error: null });
        
        try {
          set(state => ({
            cars: state.cars.map(car => 
              car.id === carId ? { ...car, ...carData } : car
            ),
            isLoading: false,
          }));
          
          return true;
        } catch (error) {
          set({ isLoading: false, error: "Failed to update car listing" });
          return false;
        }
      },

      deleteCar: async (carId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          set(state => ({
            cars: state.cars.filter(car => car.id !== carId),
            isLoading: false,
          }));
          
          return true;
        } catch (error) {
          set({ isLoading: false, error: "Failed to delete car listing" });
          return false;
        }
      },

      getCarById: (carId: string) => {
        return get().cars.find(car => car.id === carId);
      },

      getCarsByOwner: (ownerId: string) => {
        return get().cars.filter(car => car.ownerId === ownerId);
      },

      updateAvailability: async (carId: string, availability: DateRange[]) => {
        set({ isLoading: true, error: null });
        
        try {
          set(state => ({
            cars: state.cars.map(car => 
              car.id === carId ? { ...car, availabilityCalendar: availability } : car
            ),
            isLoading: false,
          }));
          
          return true;
        } catch (error) {
          set({ isLoading: false, error: "Failed to update availability" });
          return false;
        }
      },

      checkAvailability: (carId: string, startDate: string, endDate: string) => {
        const car = get().getCarById(carId);
        if (!car) return false;

        // Convert dates to Date objects for comparison
        const requestedStart = new Date(startDate);
        const requestedEnd = new Date(endDate);

        // Check if the requested dates are valid
        if (requestedStart >= requestedEnd) return false;

        // Check if there are any overlapping bookings
        if (car.bookings && car.bookings.length > 0) {
          const hasOverlappingBooking = car.bookings.some(booking => {
            const bookingStart = new Date(booking.startDate);
            const bookingEnd = new Date(booking.endDate);

            return (
              (requestedStart >= bookingStart && requestedStart < bookingEnd) ||
              (requestedEnd > bookingStart && requestedEnd <= bookingEnd) ||
              (requestedStart <= bookingStart && requestedEnd >= bookingEnd)
            );
          });

          if (hasOverlappingBooking) return false;
        }

        // Check if the requested dates are within the car's availability calendar
        if (car.availabilityCalendar && car.availabilityCalendar.length > 0) {
          const isWithinAvailability = car.availabilityCalendar.some(range => {
            const rangeStart = new Date(range.startDate);
            const rangeEnd = new Date(range.endDate);

            return requestedStart >= rangeStart && requestedEnd <= rangeEnd;
          });

          return isWithinAvailability;
        }

        // If no availability calendar is set, the car is available
        return true;
      },

      addBooking: async (carId: string, booking: Booking) => {
        set({ isLoading: true, error: null });
        
        try {
          set(state => ({
            cars: state.cars.map(car => 
              car.id === carId 
                ? { 
                    ...car, 
                    bookings: [...car.bookings, booking],
                    isAvailable: false // Mark as unavailable during the booking period
                  } 
                : car
            ),
            isLoading: false,
          }));
          
          return true;
        } catch (error) {
          set({ isLoading: false, error: "Failed to add booking" });
          return false;
        }
      },

      searchCars: (filters: SearchFilters) => {
        console.log("Searching cars with filters:", filters); // Debug log
        let filtered = [...get().cars];

        // Apply location filter
        if (filters.location) {
          filtered = filtered.filter(car =>
            car.location.address.toLowerCase().includes(filters.location!.toLowerCase())
          );
        }

        // Apply car type filter
        if (filters.carType) {
          filtered = filtered.filter(car => car.type === filters.carType);
        }

        // Apply features filter
        if (filters.features && filters.features.length > 0) {
          filtered = filtered.filter(car =>
            filters.features!.every(feature => car.features.includes(feature))
          );
        }

        // Apply price range filter
        if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
          filtered = filtered.filter(car => {
            const price = car.pricePerDay;
            const min = filters.priceMin !== undefined ? filters.priceMin : 0;
            const max = filters.priceMax !== undefined ? filters.priceMax : Infinity;
            return price >= min && price <= max;
          });
        }

        // Apply seats filter
        if (filters.seats) {
          filtered = filtered.filter(car => car.seats >= filters.seats!);
        }

        // Apply date availability filter
        if (filters.startDate && filters.endDate) {
          filtered = filtered.filter(car => {
            const isAvailable = get().checkAvailability(
              car.id,
              filters.startDate!,
              filters.endDate!
            );
            return isAvailable;
          });
        }

        console.log("Filtered cars:", filtered); // Debug log
        set({ filteredCars: filtered });
      },

      selectCar: (carId: string) => {
        const car = get().cars.find(c => c.id === carId);
        set({ selectedCar: car || null });
      },

      isCarAvailable: (carId: string, startDate: string, endDate: string) => {
        return get().checkAvailability(carId, startDate, endDate);
      },
    }),
    {
      name: "drive-share-car-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state && state.cars.length === 0) {
          state.cars = MOCK_CARS;
          state.filteredCars = MOCK_CARS;
        }
      },
    }
  )
);