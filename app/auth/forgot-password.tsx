import React, { useState, useEffect } from "react";
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
import { ArrowLeft } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useUserStore } from "@/stores/userStore";
import Button from "@/components/Button";
import { PasswordRecoveryChain } from "@/patterns/chainOfResponsibility";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { recoverPassword, isLoading, error, getUserById } = useUserStore();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);
  const [securityAnswers, setSecurityAnswers] = useState<Map<string, string>>(
    new Map()
  );
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const handleFindAccount = async () => {
    if (!email) return;

    // In a real app, this would be an API call to find the user
    // For demo purposes, we're using the mock data
    const users = useUserStore.getState().users;
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (user) {
      setUserId(user.id);
      setQuestions(user.securityQuestions.map((q) => q.question));
      setStep(2);
    } else {
      setRecoveryError("No account found with this email");
    }
  };

  const handleNextQuestion = () => {
    if (!currentAnswer) return;

    // Save the current answer
    securityAnswers.set(questions[currentQuestionIndex], currentAnswer);
    setSecurityAnswers(new Map(securityAnswers));

    if (currentQuestionIndex < questions.length - 1) {
      // Move to the next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentAnswer("");
    } else {
      // All questions answered, verify using Chain of Responsibility
      verifySecurityAnswers();
    }
  };

  const verifySecurityAnswers = async () => {
    if (!userId) return;

    // Create a password recovery chain
    const passwordRecoveryChain = new PasswordRecoveryChain(
      { getUserById },
      questions.length
    );

    // Verify the security answers
    const isVerified = await passwordRecoveryChain.verifySecurityAnswers(
      userId,
      securityAnswers
    );

    if (isVerified) {
      setIsSendingEmail(true);
      try {
        const success = await recoverPassword(email, securityAnswers);
        if (success) {
          setStep(3);
        }
      } catch (error) {
        setRecoveryError("Failed to send reset email");
      } finally {
        setIsSendingEmail(false);
      }
    } else {
      setRecoveryError("Incorrect security answers");
      // Reset to the first question
      setCurrentQuestionIndex(0);
      setCurrentAnswer("");
      setSecurityAnswers(new Map());
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.subtitle}>Enter your email to find your account</Text>

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

      {recoveryError && <Text style={styles.errorText}>{recoveryError}</Text>}

      <Button
        title="Find Account"
        onPress={handleFindAccount}
        disabled={!email}
        style={styles.button}
      />
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Security Verification</Text>
      <Text style={styles.subtitle}>
        Answer your security questions to reset your password
      </Text>

      <View style={styles.progressContainer}>
        {questions.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index === currentQuestionIndex && styles.activeProgressDot,
              index < currentQuestionIndex && styles.completedProgressDot,
            ]}
          />
        ))}
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.questionNumber}>
          Question {currentQuestionIndex + 1} of {questions.length}
        </Text>
        <Text style={styles.question}>{questions[currentQuestionIndex]}</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Your Answer</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your answer"
            value={currentAnswer}
            onChangeText={setCurrentAnswer}
          />
        </View>
      </View>

      {recoveryError && <Text style={styles.errorText}>{recoveryError}</Text>}

      <Button
        title={
          currentQuestionIndex < questions.length - 1
            ? "Next Question"
            : "Verify"
        }
        onPress={handleNextQuestion}
        disabled={!currentAnswer || isSendingEmail}
        style={styles.button}
      />
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.successIcon}>
        <Text style={styles.successIconText}>✓</Text>
      </View>
      <Text style={styles.title}>Check Your Email</Text>
      <Text style={styles.subtitle}>
        We've sent a password reset link to your email address. Please check
        your inbox and follow the instructions to reset your password.
      </Text>
      <Text style={styles.note}>
        Note: The reset link will expire in 1 hour.
      </Text>

      <Button
        title="Back to Login"
        onPress={() => router.replace("/auth/login")}
        style={styles.button}
      />
    </View>
  );

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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (step > 1) {
                setStep(step - 1);
                if (step === 2) {
                  setCurrentQuestionIndex(0);
                  setCurrentAnswer("");
                  setSecurityAnswers(new Map());
                }
              } else {
                router.back();
              }
            }}
          >
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
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
  backButton: {
    marginBottom: 24,
  },
  stepContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 32,
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
  errorText: {
    color: Colors.error,
    marginBottom: 16,
    fontSize: 14,
  },
  button: {
    marginTop: 16,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
    gap: 8,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.border,
  },
  activeProgressDot: {
    backgroundColor: Colors.primary,
    width: 12,
    height: 12,
  },
  completedProgressDot: {
    backgroundColor: Colors.success,
  },
  questionContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  questionNumber: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  question: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 16,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.success,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 24,
  },
  successIconText: {
    fontSize: 40,
    color: Colors.white,
    fontWeight: "bold",
  },
  note: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    fontStyle: "italic",
  },
});
