import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CreditCard,
  Plus,
  Trash2,
  DollarSign,
  History,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { useUserStore } from "@/stores/userStore";
import { usePaymentStore } from "@/stores/paymentStore";
import Button from "@/components/Button";

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const { currentUser } = useUserStore();
  const { transactions, getTransactionsByUserId } = usePaymentStore();
  const [isLoading, setIsLoading] = useState(false);

  const userTransactions = getTransactionsByUserId(currentUser?.id || "");

  const handleAddPaymentMethod = () => {
    Alert.alert(
      "Add Payment Method",
      "This feature is coming soon! For now, you can use your account balance for payments.",
      [{ text: "OK" }]
    );
  };

  const handleDeletePaymentMethod = (id: string) => {
    Alert.alert(
      "Delete Payment Method",
      "Are you sure you want to delete this payment method?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // TODO: Implement payment method deletion
            Alert.alert("Success", "Payment method deleted successfully");
          },
        },
      ]
    );
  };

  const handleAddFunds = () => {
    router.push("/profile/add-funds");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen
        options={{
          title: "Payment Methods",
        }}
      />

      <ScrollView style={styles.scrollView}>
        {/* Account Balance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Balance</Text>
          <View style={styles.balanceCard}>
            <View style={styles.balanceInfo}>
              <DollarSign size={24} color={Colors.primary} />
              <Text style={styles.balanceAmount}>
                ${currentUser?.balance.toFixed(2)}
              </Text>
            </View>
            <Button
              title="Add Funds"
              onPress={handleAddFunds}
              variant="outline"
              size="small"
            />
          </View>
        </View>

        {/* Payment Methods Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Payment Methods</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddPaymentMethod}
            >
              <Plus size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.paymentMethodsList}>
            <View style={styles.paymentMethodCard}>
              <View style={styles.paymentMethodInfo}>
                <CreditCard size={24} color={Colors.primary} />
                <View style={styles.paymentMethodDetails}>
                  <Text style={styles.paymentMethodTitle}>Account Balance</Text>
                  <Text style={styles.paymentMethodSubtitle}>
                    Default payment method
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeletePaymentMethod("default")}
              >
                <Trash2 size={20} color={Colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Transaction History Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transaction History</Text>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => router.push("/profile/transactions")}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {userTransactions.length > 0 ? (
            userTransactions.slice(0, 3).map((transaction) => (
              <View key={transaction.id} style={styles.transactionCard}>
                <View style={styles.transactionInfo}>
                  <History size={24} color={Colors.primary} />
                  <View style={styles.transactionDetails}>
                    <Text style={styles.transactionTitle}>
                      {transaction.fromUserId === currentUser?.id
                        ? "Payment Sent"
                        : "Payment Received"}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {new Date(transaction.timestamp).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.transactionAmount,
                    {
                      color:
                        transaction.fromUserId === currentUser?.id
                          ? Colors.error
                          : Colors.success,
                    },
                  ]}
                >
                  {transaction.fromUserId === currentUser?.id ? "-" : "+"}$
                  {transaction.amount.toFixed(2)}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No transactions yet</Text>
            </View>
          )}
        </View>
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
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  balanceCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
    marginLeft: 8,
  },
  paymentMethodsList: {
    gap: 12,
  },
  paymentMethodCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paymentMethodInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentMethodDetails: {
    marginLeft: 12,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  paymentMethodSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    padding: 8,
  },
  transactionCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  transactionInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  transactionDetails: {
    marginLeft: 12,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  transactionDate: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  viewAllButton: {
    padding: 8,
  },
  viewAllText: {
    color: Colors.primary,
    fontWeight: "600",
  },
  emptyContainer: {
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});
