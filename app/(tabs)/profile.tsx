import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  User,
  Car,
  MessageSquare,
  CreditCard,
  Star,
  LogOut,
  ChevronRight,
  Shield,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { useUserStore } from "@/stores/userStore";
import Button from "@/components/Button";

export default function ProfileScreen() {
  const router = useRouter();
  const { currentUser, logout } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set loading to false after a short delay to ensure component is mounted
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle authentication redirect in useEffect
  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.replace("/auth/login");
    }
  }, [currentUser, router, isLoading]);

  // Show loading state while checking authentication
  if (isLoading || !currentUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const handleLogout = () => {
    logout();
    router.replace("/auth/login");
  };

  const menuItems = [
    {
      icon: <User size={24} color={Colors.primary} />,
      title: "Personal Information",
      onPress: () => router.push("/profile/personal-info"),
    },
    {
      icon: <Car size={24} color={Colors.primary} />,
      title: "My Cars",
      onPress: () => router.push("/my-cars"),
      showIf: currentUser.isCarOwner,
    },
    {
      icon: <MessageSquare size={24} color={Colors.primary} />,
      title: "Messages",
      onPress: () => router.push("/messages"),
    },
    {
      icon: <CreditCard size={24} color={Colors.primary} />,
      title: "Payment Methods",
      onPress: () => router.push("/profile/payment-methods"),
    },
    {
      icon: <Star size={24} color={Colors.primary} />,
      title: "Reviews",
      onPress: () => router.push("/profile/reviews"),
    },
    {
      icon: <Shield size={24} color={Colors.primary} />,
      title: "Security",
      onPress: () => router.push("/profile/security"),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            <Image
              source={{
                uri: currentUser.avatar || "https://images.unsplash.com/photo-1633332755192-727a05c4013d",
              }}
              style={styles.avatar}
            />
            <View style={styles.userInfo}>
              <Text style={styles.name}>{currentUser.name}</Text>
              <Text style={styles.email}>{currentUser.email}</Text>
              <View style={styles.balanceContainer}>
                <Text style={styles.balanceLabel}>Balance:</Text>
                <Text style={styles.balance}>${currentUser.balance.toFixed(2)}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push("/profile/edit")}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map(
            (item, index) =>
              (item.showIf === undefined || item.showIf) && (
                <TouchableOpacity
                  key={index}
                  style={styles.menuItem}
                  onPress={item.onPress}
                >
                  <View style={styles.menuItemLeft}>
                    {item.icon}
                    <Text style={styles.menuItemTitle}>{item.title}</Text>
                  </View>
                  <ChevronRight size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              )
          )}
        </View>

        {!currentUser.isCarOwner && (
          <View style={styles.becomeOwnerContainer}>
            <Text style={styles.becomeOwnerTitle}>Become a Car Owner</Text>
            <Text style={styles.becomeOwnerText}>
              List your car on DriveShare and start earning money
            </Text>
            <Button
              title="List Your Car"
              onPress={() => router.push("/become-owner")}
              style={styles.becomeOwnerButton}
            />
          </View>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>DriveShare v1.0.0</Text>
      </ScrollView>
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.card,
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  balanceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginRight: 4,
  },
  balance: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  editButton: {
    backgroundColor: Colors.primaryLight,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  editButtonText: {
    color: Colors.primary,
    fontWeight: "600",
    fontSize: 16,
  },
  menuContainer: {
    marginTop: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemTitle: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 16,
  },
  becomeOwnerContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
  },
  becomeOwnerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 8,
  },
  becomeOwnerText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  becomeOwnerButton: {
    backgroundColor: Colors.primary,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    marginTop: 20,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: 8,
  },
  logoutText: {
    color: Colors.error,
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  versionText: {
    textAlign: "center",
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 20,
    marginBottom: 40,
  },
});