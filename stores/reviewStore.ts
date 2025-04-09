import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { NotificationCenter } from "@/patterns/observer";
import { useCarStore } from "./carStore";

export interface Review {
  id: string;
  bookingId: string;
  carId: string;
  reviewerId: string;
  reviewedId: string;
  rating: number;
  comment: string;
  createdAt: string;
  type: "owner" | "renter";
}

interface ReviewState {
  reviews: Review[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createReview: (
    bookingId: string,
    carId: string,
    reviewerId: string,
    reviewedId: string,
    rating: number,
    comment: string,
    type: "owner" | "renter"
  ) => Promise<Review | null>;
  getReviewsByCarId: (carId: string) => Review[];
  getReviewsByUserId: (userId: string) => Review[];
  getReviewByBookingId: (bookingId: string) => Review | undefined;
  getAverageRating: (carId: string) => number;
  getReviewsByTargetId: (targetId: string) => Review[];
}

export const useReviewStore = create<ReviewState>()(
  persist(
    (set, get) => ({
      reviews: [],
      isLoading: false,
      error: null,
      
      createReview: async (
        bookingId: string,
        carId: string,
        reviewerId: string,
        reviewedId: string,
        rating: number,
        comment: string,
        type: "owner" | "renter"
      ) => {
        set({ isLoading: true, error: null });
        
        try {
          // Validate rating
          if (rating < 1 || rating > 5) {
            set({ isLoading: false, error: "Rating must be between 1 and 5" });
            return null;
          }
          
          // Check if review already exists for this booking
          const existingReview = get().reviews.find(
            (r) => r.bookingId === bookingId && r.type === type
          );
          
          if (existingReview) {
            set({ isLoading: false, error: "Review already exists for this booking" });
            return null;
          }
          
          const newReview: Review = {
            id: Date.now().toString(),
            bookingId,
            carId,
            reviewerId,
            reviewedId,
            rating,
            comment,
            createdAt: new Date().toISOString(),
            type,
          };
          
          set((state) => ({
            reviews: [...state.reviews, newReview],
            isLoading: false,
          }));
          
          // If it's a car review, update the car's rating
          if (type === "owner") {
            const carStore = useCarStore.getState();
            const car = carStore.cars.find(c => c.id === carId);
            
            if (car) {
              const carReviews = [...get().getReviewsByCarId(carId), newReview];
              const newRating = carReviews.reduce((sum, review) => sum + review.rating, 0) / carReviews.length;
              
              await carStore.updateCar(carId, {
                rating: parseFloat(newRating.toFixed(1)),
                reviewCount: carReviews.length,
              });
            }
          }
          
          // Send notification to target user if it's a user review
          if (type === "renter") {
            const notificationCenter = NotificationCenter.getInstance();
            notificationCenter.sendReviewNotification(
              reviewedId,
              `You received a new review with ${rating} stars`,
              newReview.id
            );
          }
          
          return newReview;
        } catch (error) {
          set({ isLoading: false, error: "Failed to create review" });
          return null;
        }
      },
      
      getReviewsByCarId: (carId: string) => {
        return get().reviews.filter((review) => review.carId === carId);
      },
      
      getReviewsByUserId: (userId: string) => {
        return get().reviews.filter(
          (review) => review.reviewedId === userId || review.reviewerId === userId
        );
      },
      
      getReviewByBookingId: (bookingId: string) => {
        return get().reviews.find((review) => review.bookingId === bookingId);
      },
      
      getAverageRating: (carId: string) => {
        const carReviews = get().reviews.filter((review) => review.carId === carId);
        if (carReviews.length === 0) return 0;
        
        const totalRating = carReviews.reduce((sum, review) => sum + review.rating, 0);
        return totalRating / carReviews.length;
      },

      getReviewsByTargetId: (targetId: string) => {
        return get().reviews.filter((review) => review.reviewedId === targetId);
      },
    }),
    {
      name: "drive-share-review-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);