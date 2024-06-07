import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { attemptLogin, attemptSignup, resetPassword } from "../../FirebaseFunctions/firebaseLogin";
import AppIcon from "../../assets/AppIcon.jpg";

export default function LoginScreen({ navigation, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUpMode, setIsSignUpMode] = useState(true); // Default state is signup mode

  const handleAuthentication = async () => {
    if (isSignUpMode) {
      // If in signup mode, call attemptSignup
      await attemptSignup(
        email,
        password,
        (message) => {
          console.log(message);
          onLogin(); // Call onLogin if signup is successful
        },
        (errorMessage) => console.log("Signup error:", errorMessage)
      );
    } else {
      // If in login mode, call attemptLogin
      await attemptLogin(email, password, onLogin, passwordReset);
    }
  };
  const passwordReset = (message) => {
    Alert.alert("Incorrect Password?", message, [
      { text: "Cancel" },
      {
        text: "Reset",
        onPress: () => {
          resetPassword(email);
        },
      },
    ]);
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "#90d7f8" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#90d7f8",
          }}
        >
          <Image
            source={AppIcon}
            style={{
              marginTop: 1,
              width: "4%",
              height: "30%",
              aspectRatio: 1,
              borderWidth: 5,
              borderColor: "#DD7EA4",
              borderRadius: 20,
              alignItems: "center",
              marginBottom: 5,
            }}
          ></Image>
          <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 30 }}>Wardobe Wizard</Text>
          <TextInput
            style={{
              height: 50,
              width: "80%",
              backgroundColor: "white",
              borderRadius: 10,
              fontSize: 15,
              marginBottom: 10,
            }}
            placeholder="Email"
            onChangeText={(value) => setEmail(value)}
          />
          <TextInput
            style={{
              height: 50,
              width: "80%",
              backgroundColor: "white",
              borderRadius: 10,
              fontSize: 15,
              marginBottom: 10,
            }}
            placeholder="Password"
            onChangeText={(value) => setPassword(value)}
            secureTextEntry
          />
          <TouchableOpacity
            style={{
              backgroundColor: isSignUpMode ? "#DD7EA4" : "blue", // Change color based on mode
              width: "80%",
              height: 50,
              borderRadius: 10,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 10,
            }}
            onPress={handleAuthentication}
          >
            <Text style={{ color: "white", fontSize: 15, fontWeight: "bold" }}>
              {isSignUpMode ? "Sign Up" : "Login"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: "#BB8BB2",
              width: "80%",
              height: 50,
              borderRadius: 10,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => setIsSignUpMode(!isSignUpMode)} // Toggle between signup and login mode
          >
            <Text style={{ color: "white", fontSize: 15, fontWeight: "bold" }}>
              {isSignUpMode ? "Already have an account? Login" : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
