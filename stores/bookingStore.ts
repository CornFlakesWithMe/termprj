import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Booking } from "@/types";
import { MOCK_BOOKINGS } from "@/constants/mockData";
import { NotificationCenter } from "@/patterns/observer";
import { useCarStore } from "./carStore";
import { useUserStore } from "./userStore";

interface BookingState {
  bookings: Booking[];
  selectedBooking: Booking | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchBookings: () => Promise<void>;
  createBooking: (carId: string, renterId: string, startDate: string, endDate: string) => Promise<Booking | null>;
  updateBookingStatus: (bookingId: string, status: Booking["status"]) => Promise<boolean>;
  cancelBooking: (bookingId: string) => Promise<boolean>;
  getBookingsByUserId: (userId: string, asRenter: boolean) => Booking[];
  getBookingById: (bookingId: string) => Booking | undefined;
  selectBooking: (bookingId: string) => void;
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      bookings: MOCK_BOOKINGS,
      selectedBooking: null,
      isLoading: false,
      error: null,
      
      fetchBookings: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // In a real app, this would be an API call
          // For demo purposes, we're using mock data
          set({ bookings: MOCK_BOOKINGS, isLoading: false });
        } catch (error) {
          set({ isLoading: false, error: "Failed to fetch bookings" });
        }
      },
      
      createBooking: async (carId: string, renterId: string, startDate: string, endDate: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Check if car is available
          const carStore = useCarStore.getState();
          const car = carStore.cars.find(c => c.id === carId);
          
          if (!car) {
            set({ isLoading: false, error: "Car not found" });
            return null;
          }
          
          if (!carStore.isCarAvailable(carId, startDate, endDate)) {
            set({ isLoading: false, error: "Car is not available for the selected dates" });
            return null;
          }
          
          // Calculate total price
          const start = new Date(startDate);
          const end = new Date(endDate);
          const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          const totalPrice = days * car.pricePerDay;
          
          // Create new booking
          const newBooking: Booking = {
            id: Date.now().toString(),
            carId,
            renterId,
            startDate,
            endDate,
            totalPrice,
            status: "pending",
            createdAt: new Date().toISOString(),
          };
          
          // Update bookings list
          set(state => ({
            bookings: [...state.bookings, newBooking],
            selectedBooking: newBooking,
            isLoading: false,
          }));
          
          // Update car availability
          await carStore.updateAvailability(carId, [
            ...car.availabilityCalendar,
            { startDate, endDate },
          ]);
          
          // Send notification to car owner
          const notificationCenter = NotificationCenter.getInstance();
          notificationCenter.sendBookingNotification(
            car.ownerId,
            `New booking request for your ${car.make} ${car.model}`,
            newBooking.id
          );
          
          return newBooking;
        } catch (error) {
          set({ isLoading: false, error: "Failed to create booking" });
          return null;
        }
      },
      
      updateBookingStatus: async (bookingId: string, status: Booking["status"]) => {
        set({ isLoading: true, error: null });
        
        try {
          const { bookings } = get();
          
          // Find booking by ID
          const bookingIndex = bookings.findIndex(b => b.id === bookingId);
          
          if (bookingIndex === -1) {
            set({ isLoading: false, error: "Booking not found" });
            return false;
          }
          
          // Update booking status
          const updatedBooking = { ...bookings[bookingIndex], status };
          const updatedBookings = [...bookings];
          updatedBookings[bookingIndex] = updatedBooking;
          
          set({
            bookings: updatedBookings,
            selectedBooking: get().selectedBooking?.id === bookingId ? updatedBooking : get().selectedBooking,
            isLoading: false,
          });
          
          // Send notification to renter
          const notificationCenter = NotificationCenter.getInstance();
          notificationCenter.sendBookingNotification(
            updatedBooking.renterId,
            `Your booking status has been updated to: ${status}`,
            bookingId
          );
          
          return true;
        } catch (error) {
          set({ isLoading: false, error: "Failed to update booking status" });
          return false;
        }
      },
      
      cancelBooking: async (bookingId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const { bookings } = get();
          const booking = bookings.find(b => b.id === bookingId);
          
          if (!booking) {
            set({ isLoading: false, error: "Booking not found" });
            return false;
          }
          
          // Update booking status to cancelled
          const success = await get().updateBookingStatus(bookingId, "cancelled");
          
          if (success) {
            // Remove from car's availability calendar
            const carStore = useCarStore.getState();
            const car = carStore.cars.find(c => c.id === booking.carId);
            
            if (car) {
              const updatedAvailability = car.availabilityCalendar.filter(
                a => a.startDate !== booking.startDate && a.endDate !== booking.endDate
              );
              
              await carStore.updateAvailability(booking.carId, updatedAvailability);
            }
          }
          
          return success;
        } catch (error) {
          set({ isLoading: false, error: "Failed to cancel booking" });
          return false;
        }
      },
      
      getBookingsByUserId: (userId: string, asRenter: boolean) => {
        const { bookings } = get();
        
        if (asRenter) {
          return bookings.filter(booking => booking.renterId === userId);
        } else {
          // Get bookings where user is the car owner
          const carStore = useCarStore.getState();
          const userCars = carStore.getCarsByOwnerId(userId);
          const userCarIds = userCars.map(car => car.id);
          
          return bookings.filter(booking => userCarIds.includes(booking.carId));
        }
      },
      
      getBookingById: (bookingId: string) => {
        return get().bookings.find(booking => booking.id === bookingId);
      },
      
      selectBooking: (bookingId: string) => {
        const booking = get().bookings.find(b => b.id === bookingId);
        set({ selectedBooking: booking || null });
      },
    }),
    {
      name: "drive-share-booking-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);