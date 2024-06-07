// CREDIT: Adapted from Google Inc/Firebase
// https://firebase.google.com/docs/auth/web/password-auth#web-modular-api

import { auth } from "./firebaseConfig";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";

export const attemptLogin = async (email, password, onLogin, passwordReset) => {
  try {
    const credentials = await signInWithEmailAndPassword(auth, email, password);
    console.log("User logged in successfully: ", credentials.user.email);
    onLogin();
  } catch (error) {
    if (error.code === "auth/invalid-credential") {
      passwordReset("Do you want to reset your password?");
    }
    console.log("Some error occured", error.message);
  }
};

export const attemptSignup = async (email, password, Success, Error) => {
  try {
    const credentials = await createUserWithEmailAndPassword(auth, email, password);
    console.log("User signed up", credentials.user.email);
    Success("Signup successful");
  } catch (error) {
    console.log("Signup error:", error.message);
    Error(error.message);
  }
};

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log("Reset sent to", email);
  } catch (error) {
    console.error("Reset Error", error.message);
  }
};
