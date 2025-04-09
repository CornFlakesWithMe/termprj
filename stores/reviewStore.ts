import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Review } from "@/types";
import { MOCK_REVIEWS } from "@/constants/mockData";
import { NotificationCenter } from "@/patterns/observer";
import { useCarStore } from "./carStore";

interface ReviewState {
  reviews: Review[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchReviews: () => Promise<void>;
  addReview: (
    bookingId: string,
    reviewerId: string,
    targetId: string,
    targetType: "user" | "car",
    rating: number,
    comment: string
  ) => Promise<Review | null>;
  getReviewsByTargetId: (targetId: string, targetType: "user" | "car") => Review[];
  getReviewsByReviewerId: (reviewerId: string) => Review[];
  getAverageRating: (targetId: string, targetType: "user" | "car") => number;
}

export const useReviewStore = create<ReviewState>()(
  persist(
    (set, get) => ({
      reviews: MOCK_REVIEWS,
      isLoading: false,
      error: null,
      
      fetchReviews: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // In a real app, this would be an API call
          // For demo purposes, we're using mock data
          set({ reviews: MOCK_REVIEWS, isLoading: false });
        } catch (error) {
          set({ isLoading: false, error: "Failed to fetch reviews" });
        }
      },
      
      addReview: async (
        bookingId: string,
        reviewerId: string,
        targetId: string,
        targetType: "user" | "car",
        rating: number,
        comment: string
      ) => {
        set({ isLoading: true, error: null });
        
        try {
          // Create new review
          const newReview: Review = {
            id: Date.now().toString(),
            bookingId,
            reviewerId,
            targetId,
            targetType,
            rating,
            comment,
            createdAt: new Date().toISOString(),
          };
          
          // Update reviews list
          set(state => ({
            reviews: [...state.reviews, newReview],
            isLoading: false,
          }));
          
          // If it's a car review, update the car's rating
          if (targetType === "car") {
            const carStore = useCarStore.getState();
            const car = carStore.cars.find(c => c.id === targetId);
            
            if (car) {
              const carReviews = [...get().getReviewsByTargetId(targetId, "car"), newReview];
              const newRating = carReviews.reduce((sum, review) => sum + review.rating, 0) / carReviews.length;
              
              await carStore.updateCar(targetId, {
                rating: parseFloat(newRating.toFixed(1)),
                reviewCount: carReviews.length,
              });
            }
          }
          
          // Send notification to target user if it's a user review
          if (targetType === "user") {
            const notificationCenter = NotificationCenter.getInstance();
            notificationCenter.sendReviewNotification(
              targetId,
              `You received a new review with ${rating} stars`,
              newReview.id
            );
          }
          
          return newReview;
        } catch (error) {
          set({ isLoading: false, error: "Failed to add review" });
          return null;
        }
      },
      
      getReviewsByTargetId: (targetId: string, targetType: "user" | "car") => {
        return get().reviews.filter(
          review => review.targetId === targetId && review.targetType === targetType
        );
      },
      
      getReviewsByReviewerId: (reviewerId: string) => {
        return get().reviews.filter(review => review.reviewerId === reviewerId);
      },
      
      getAverageRating: (targetId: string, targetType: "user" | "car") => {
        const targetReviews = get().getReviewsByTargetId(targetId, targetType);
        
        if (targetReviews.length === 0) {
          return 0;
        }
        
        const sum = targetReviews.reduce((total, review) => total + review.rating, 0);
        return parseFloat((sum / targetReviews.length).toFixed(1));
      },
    }),
    {
      name: "drive-share-review-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);