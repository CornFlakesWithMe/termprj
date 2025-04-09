import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User, SecurityQuestion } from "@/types";
import { MOCK_USERS } from "@/constants/mockData";
import { UserSession } from "@/patterns/singleton";
import { useResetTokenStore } from "@/stores/resetTokenStore";
import { sendPasswordResetEmail } from "@/utils/emailService";

interface UserState {
  currentUser: User | null;
  users: User[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  initializeUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, name: string, password: string, securityQuestions: SecurityQuestion[]) => Promise<boolean>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
  recoverPassword: (email: string, securityAnswers: Map<string, string>) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  getUserById: (userId: string) => User | undefined;
  updateBalance: (userId: string, newBalance: number) => Promise<boolean>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: MOCK_USERS,
      isLoading: false,
      error: null,
      
      initializeUser: async () => {
        // Check if there's a stored session
        const userSession = UserSession.getInstance();
        const userId = userSession.getUserId();
        
        if (userId) {
          // Find the user in our store
          const user = get().users.find(u => u.id === userId);
          if (user) {
            set({ currentUser: user });
          }
        }
      },
      
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // In a real app, this would be an API call
          // For demo purposes, we're using mock data
          const user = get().users.find(u => u.email.toLowerCase() === email.toLowerCase());
          
          if (!user) {
            set({ isLoading: false, error: "User not found" });
            return false;
          }
          
          // In a real app, we would verify the password hash
          // For demo purposes, we're skipping password verification
          
          // Update the singleton user session
          const userSession = UserSession.getInstance();
          userSession.login(user.id, "mock-token");
          
          set({ currentUser: user, isLoading: false });
          return true;
        } catch (error) {
          set({ isLoading: false, error: "Login failed" });
          return false;
        }
      },
      
      register: async (email: string, name: string, password: string, securityQuestions: SecurityQuestion[]) => {
        set({ isLoading: true, error: null });
        
        try {
          // Check if user already exists
          const existingUser = get().users.find(u => u.email.toLowerCase() === email.toLowerCase());
          
          if (existingUser) {
            set({ isLoading: false, error: "Email already in use" });
            return false;
          }
          
          // Create new user
          const newUser: User = {
            id: Date.now().toString(),
            email,
            name,
            securityQuestions,
            isCarOwner: false,
            balance: 500, // Starting balance
            createdAt: new Date().toISOString(),
          };
          
          // Update users list
          set(state => ({
            users: [...state.users, newUser],
            currentUser: newUser,
            isLoading: false,
          }));
          
          // Update the singleton user session
          const userSession = UserSession.getInstance();
          userSession.login(newUser.id, "mock-token");
          
          return true;
        } catch (error) {
          set({ isLoading: false, error: "Registration failed" });
          return false;
        }
      },
      
      logout: () => {
        // Update the singleton user session
        const userSession = UserSession.getInstance();
        userSession.logout();
        
        set({ currentUser: null });
      },
      
      updateProfile: async (userData: Partial<User>) => {
        set({ isLoading: true, error: null });
        
        try {
          const { currentUser, users } = get();
          
          if (!currentUser) {
            set({ isLoading: false, error: "No user logged in" });
            return false;
          }
          
          // Update user data
          const updatedUser = { ...currentUser, ...userData };
          
          // Update users list
          const updatedUsers = users.map(user => 
            user.id === currentUser.id ? updatedUser : user
          );
          
          set({
            currentUser: updatedUser,
            users: updatedUsers,
            isLoading: false,
          });
          
          return true;
        } catch (error) {
          set({ isLoading: false, error: "Profile update failed" });
          return false;
        }
      },
      
      recoverPassword: async (email: string, securityAnswers: Map<string, string>) => {
        set({ isLoading: true, error: null });
        
        try {
          // Find user by email
          const user = get().users.find(u => u.email.toLowerCase() === email.toLowerCase());
          
          if (!user) {
            set({ isLoading: false, error: "User not found" });
            return false;
          }
          
          // Verify security answers
          const allCorrect = user.securityQuestions.every(q => 
            securityAnswers.get(q.question)?.toLowerCase() === q.answer.toLowerCase()
          );
          
          if (!allCorrect) {
            set({ isLoading: false, error: "Incorrect security answers" });
            return false;
          }
          
          // Generate reset token
          const resetToken = useResetTokenStore.getState().generateToken(user.id);
          
          // Send reset email
          const emailResult = await sendPasswordResetEmail(user.email, resetToken);
          
          if (!emailResult.success) {
            set({ isLoading: false, error: emailResult.error || "Failed to send reset email" });
            return false;
          }
          
          set({ isLoading: false });
          return true;
        } catch (error) {
          console.error('Password recovery error:', error);
          set({ isLoading: false, error: "Password recovery failed" });
          return false;
        }
      },
      
      resetPassword: async (token: string, newPassword: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Verify token
          const { isValid, userId } = useResetTokenStore.getState().verifyToken(token);
          
          if (!isValid || !userId) {
            set({ isLoading: false, error: "Invalid or expired reset token" });
            return false;
          }
          
          // Find user
          const user = get().users.find(u => u.id === userId);
          
          if (!user) {
            set({ isLoading: false, error: "User not found" });
            return false;
          }
          
          // Update password
          // In a real app, we would hash the password
          const updatedUser = { ...user, password: newPassword };
          
          // Update users list
          const updatedUsers = get().users.map(u => 
            u.id === userId ? updatedUser : u
          );
          
          // Update current user if it's the same user
          const updatedCurrentUser = get().currentUser?.id === userId
            ? updatedUser
            : get().currentUser;
          
          set({
            users: updatedUsers,
            currentUser: updatedCurrentUser,
            isLoading: false,
          });
          
          // Remove used token
          useResetTokenStore.getState().removeToken(token);
          
          return true;
        } catch (error) {
          set({ isLoading: false, error: "Password reset failed" });
          return false;
        }
      },
      
      getUserById: (userId: string) => {
        return get().users.find(user => user.id === userId);
      },
      
      updateBalance: async (userId: string, newBalance: number) => {
        try {
          const { users, currentUser } = get();
          
          // Update users list
          const updatedUsers = users.map(user => 
            user.id === userId ? { ...user, balance: newBalance } : user
          );
          
          // Update current user if it's the same user
          const updatedCurrentUser = currentUser && currentUser.id === userId
            ? { ...currentUser, balance: newBalance }
            : currentUser;
          
          set({
            users: updatedUsers,
            currentUser: updatedCurrentUser,
          });
          
          return true;
        } catch (error) {
          set({ error: "Balance update failed" });
          return false;
        }
      },
    }),
    {
      name: "drive-share-user-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);