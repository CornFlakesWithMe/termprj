import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useUserStore } from "@/stores/userStore";
import { SecurityQuestion } from "@/types";
import { SECURITY_QUESTIONS } from "@/constants/mockData";
import Button from "@/components/Button";

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error } = useUserStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [securityQuestions, setSecurityQuestions] = useState<SecurityQuestion[]>([
    { question: "", answer: "" },
    { question: "", answer: "" },
    { question: "", answer: "" },
  ]);
  const [showQuestionDropdown, setShowQuestionDropdown] = useState<number | null>(null);

  const handleRegister = async () => {
    if (!name || !email || !password || password !== confirmPassword) {
      return;
    }

    // Validate security questions
    for (const sq of securityQuestions) {
      if (!sq.question || !sq.answer) {
        return;
      }
    }

    const success = await register(email, name, password, securityQuestions);
    if (success) {
      router.replace("/");
    }
  };

  const updateSecurityQuestion = (index: number, field: "question" | "answer", value: string) => {
    const updatedQuestions = [...securityQuestions];
    updatedQuestions[index][field] = value;
    setSecurityQuestions(updatedQuestions);
  };

  const renderQuestionDropdown = (index: number) => {
    if (showQuestionDropdown !== index) return null;

    return (
      <View style={styles.dropdown}>
        <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
          {SECURITY_QUESTIONS.map((question) => (
            <TouchableOpacity
              key={question}
              style={styles.dropdownItem}
              onPress={() => {
                updateSecurityQuestion(index, "question", question);
                setShowQuestionDropdown(null);
              }}
            >
              <Text style={styles.dropdownText}>{question}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Sign up to start renting or listing cars
          </Text>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Create a password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={Colors.textSecondary} />
                  ) : (
                    <Eye size={20} color={Colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color={Colors.textSecondary} />
                  ) : (
                    <Eye size={20} color={Colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.securityTitle}>Security Questions</Text>
            <Text style={styles.securitySubtitle}>
              These will be used to recover your account if you forget your password
            </Text>

            {securityQuestions.map((sq, index) => (
              <View key={index} style={styles.securityQuestionContainer}>
                <Text style={styles.inputLabel}>Question {index + 1}</Text>
                <TouchableOpacity
                  style={styles.questionSelector}
                  onPress={() => setShowQuestionDropdown(showQuestionDropdown === index ? null : index)}
                >
                  <Text style={styles.questionSelectorText}>
                    {sq.question || "Select a security question"}
                  </Text>
                  {showQuestionDropdown === index ? (
                    <ChevronUp size={20} color={Colors.textSecondary} />
                  ) : (
                    <ChevronDown size={20} color={Colors.textSecondary} />
                  )}
                </TouchableOpacity>
                {renderQuestionDropdown(index)}

                <Text style={[styles.inputLabel, { marginTop: 12 }]}>Answer</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your answer"
                  value={sq.answer}
                  onChangeText={(value) => updateSecurityQuestion(index, "answer", value)}
                />
              </View>
            ))}

            {error && <Text style={styles.errorText}>{error}</Text>}

            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={isLoading}
              disabled={
                !name ||
                !email ||
                !password ||
                password !== confirmPassword ||
                securityQuestions.some((sq) => !sq.question || !sq.answer) ||
                isLoading
              }
              style={styles.registerButton}
            />

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => router.push("/auth/login")}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 8,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 32,
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 8,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
  },
  eyeIcon: {
    padding: 12,
  },
  securityTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  securitySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  securityQuestionContainer: {
    marginBottom: 24,
  },
  questionSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  questionSelectorText: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
  },
  dropdown: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dropdownText: {
    fontSize: 16,
    color: Colors.text,
  },
  errorText: {
    color: Colors.error,
    marginBottom: 16,
    fontSize: 14,
  },
  registerButton: {
    marginBottom: 24,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 40,
  },
  loginText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  loginLink: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 4,
  },
});