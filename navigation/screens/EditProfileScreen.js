import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { saveProfile } from "../../FirebaseFunctions/firebaseDatabaseFunctions";
import * as ImagePicker from "expo-image-picker";

export default function EditProfileScreen() {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [imageURI, setImageURI] = useState("");

  const handleDone = async () => {
    await saveProfile(imageURI, username, bio);
  };
  const takepfp = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("You've refused to allow this app to access your camera!");
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImageURI(result.assets[0].uri);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        <View style={styles.topHalf}>
          <TouchableOpacity onPress={() => takepfp()}>
            <Image
              source={imageURI ? { uri: imageURI } : require("../../assets/blue.png")}
              style={styles.pfp}
            />
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.username}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          multiline
          maxLength={66}
          style={styles.bio}
          placeholder="Enter Bio Here:"
          value={bio}
          onChangeText={setBio}
        />
        <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#010010",
    justifyContent: "center",
    alignItems: "center",
  },
  topHalf: {
    alignItems: "center",
    marginBottom: 20,
  },
  pfp: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  username: {
    fontSize: 20,
    fontWeight: "bold",
    backgroundColor: "#caa5c5",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    width: "80%",
  },
  bio: {
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#caa5c5",
    backgroundColor: "#caa5c5",
    borderRadius: 10,
    padding: 10,
    width: "80%",
    height: 100,
    textAlignVertical: "top",
  },
  doneButton: {
    backgroundColor: "#90d7f8",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 20,
  },
  doneButtonText: {
    fontSize: 18,
    color: "white",
  },
});
