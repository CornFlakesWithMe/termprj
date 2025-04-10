import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, SplashScreen } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";
import { ErrorBoundary } from "./error-boundary";
import Colors from "@/constants/colors";
import { useUserStore } from "@/stores/userStore";
import { useNotificationStore } from "@/stores/notificationStore";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  // Initialize user store
  const initializeUser = useUserStore((state) => state.initializeUser);

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    // Initialize user from storage
    initializeUser();

    if (loaded) {
      SplashScreen.hideAsync();
      // Initialize notifications
      useNotificationStore.getState().initializeNotifications();
    }
  }, [loaded, initializeUser]);

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <RootLayoutNav />
    </ErrorBoundary>
  );
}

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.white,
        },
        headerTitleStyle: {
          fontWeight: "600",
          fontSize: 18,
        },
        headerTintColor: Colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth/login" options={{ headerShown: false }} />
      <Stack.Screen name="auth/register" options={{ headerShown: false }} />
      <Stack.Screen
        name="auth/forgot-password"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="car/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="booking/new" options={{ title: "Confirm Booking" }} />
      <Stack.Screen
        name="booking/[id]"
        options={{ title: "Booking Details" }}
      />
      <Stack.Screen
        name="messages/[userId]"
        options={{ title: "Conversation" }}
      />
      <Stack.Screen name="my-cars" options={{ title: "My Cars" }} />
      <Stack.Screen
        name="become-owner"
        options={{ title: "Become a Car Owner" }}
      />
      <Stack.Screen name="profile/edit" options={{ title: "Edit Profile" }} />
      <Stack.Screen
        name="profile/personal-info"
        options={{ title: "Personal Information" }}
      />
      <Stack.Screen
        name="profile/payment-methods"
        options={{ title: "Payment Methods" }}
      />
      <Stack.Screen name="profile/reviews" options={{ title: "Reviews" }} />
      <Stack.Screen name="profile/security" options={{ title: "Security" }} />
      <Stack.Screen name="reviews/[id]" options={{ title: "Reviews" }} />
    </Stack>
  );
}
