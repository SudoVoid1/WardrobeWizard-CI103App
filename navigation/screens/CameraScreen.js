import React, { useState, useRef, useEffect } from "react";
import {
  Image,
  View,
  useWindowDimensions,
  TouchableOpacity,
  Text,
  SafeAreaView,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { SelectList } from "react-native-dropdown-select-list";
import { uploadImageWithTag } from "../../FirebaseFunctions/firebaseDatabaseFunctions";
import Icon from "react-native-vector-icons/FontAwesome";
import Icon2 from "react-native-vector-icons/Ionicons";
import Icon3 from "react-native-vector-icons/FontAwesome5";

const HandleTagImage = ({ onTag }) => {
  const [selectedValue, setSelectedValue] = useState("");

  const handleTag = () => {
    if (selectedValue) {
      onTag(selectedValue);
      setSelectedValue("");
    }
  };

  return (
    <SafeAreaView>
      <SelectList
        style={{ backgroundColor: "#BB8BB2" }}
        setSelected={(val) => setSelectedValue(val)}
        data={[
          { key: "1", value: "T-Shirt" },
          { key: "2", value: "Shirt" },
          { key: "3", value: "Blouse" },
          { key: "4", value: "Dress Shirt" },
          { key: "6", value: "Tank Top" },
          { key: "7", value: "Halter Top" },
          { key: "8", value: "Tube Top" },
          { key: "10", value: "Jersey" },
          { key: "11", value: "Pant" },
          { key: "12", value: "Dress Pant" },
          { key: "13", value: "Sweatpant" },
          { key: "14", value: "Short" },
          { key: "15", value: "Jeans" },
          { key: "16", value: "Leggings" },
          { key: "14", value: "Skirt" },
          { key: "15", value: "Jacket" },
          { key: "16", value: "Cardigan" },
          { key: "17", value: "Coat" },
          { key: "18", value: "Flannel" },
          { key: "19", value: "Sweatshirt" },
          { key: "20", value: "Cardigan" },
          { key: "21", value: "Crew Neck" },
          { key: "22", value: "Turtle Neck" },
          { key: "23", value: "Sneakers" },
          { key: "24", value: "Dress Shoes" },
          { key: "25", value: "Heels" },
          { key: "26", value: "Flats" },
          { key: "27", value: "Boots" },
          { key: "28", value: "Flip Flops" },
          { key: "29", value: "Beanie" },
          { key: "30", value: "Cap" },
          { key: "31", value: "Sun Hat" },
          { key: "32", value: "Hat" },
          { key: "33", value: "Athletic Wear" },
          { key: "34", value: "SwimWear" },
          { key: "35", value: "Scarf" },
          { key: "36", value: "Jewelry" },
          { key: "37", value: "Business Casual" },
        ]}
        boxStyles={{ marginHorizontal: 150, backgroundColor: "white" }}
        dropdownStyles={{ maxHeight: 80 }}
        dropdownItemStyles={{ backgroundColor: "white", marginHorizontal: 0 }}
        dropdownTextStyles={{ textAlign: "center", fontWeight: "bold", color: "#90d7f8" }}
        save="value"
      />
      <View style={{ alignItems: "center" }}>
        <TouchableOpacity onPress={handleTag}>
          <Icon name="tag" size={50} color="#BB8BB2" />
          <Text style={{ textAlign: "center", color: "#DD7EA4" }}>Tag </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const CameraScreen = () => {
  const navigator = useNavigation();
  const [image, setImage] = useState("");
  const [tag, setTag] = useState("");
  const [tagVisible, setTagVisible] = useState(false); // To track if tag selection component is visible
  const windowHeight = useWindowDimensions().height;
  const windowWidth = useWindowDimensions().width;
  const photoTaken = useRef(false);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("You've refused to allow this app to access your camera!");
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      photoTaken.current = true;
      setTagVisible(true); // Show tag selection component
    }
  };

  const takeImage = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("You've refused to allow this app to access your camera!");
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      aspect: [1, 1],
      cameraType: ImagePicker.CameraType.back,
      UIImagePickerControllerQualityType: ImagePicker.UIImagePickerControllerQualityType.High,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      photoTaken.current = true;
      setTagVisible(true); // Show tag selection component
    }
  };

  const handleTag = async (value) => {
    setTag(value);
    await uploadImageWithTag(image, "image", value);
    setImage("");
    setTag("");
    photoTaken.current = false;
    setTagVisible(false); // Hide tag selection component after deleting
  };

  const goToCreate = () => {
    navigator.navigate("Create");
  };

  const deleteImage = () => {
    if (!photoTaken.current) {
      Alert.alert("There is no image to delete.");
      return;
    }

    Alert.alert("Delete Image", "Are you sure you want to delete the current image?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: () => {
          setImage("");
          setTag("");
          photoTaken.current = false;
          setTagVisible(); // Hide tag selection component after deleting
        },
      },
    ]);
  };

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#010001",
      }}
    >
      <View style={{ marginTop: 1 }}>
        {!photoTaken.current && (
          <View style={{ flex: "row", alignItems: "center", alignContent: "center" }}>
            <TouchableOpacity onPress={goToCreate}>
              <Icon2 name="shirt" size={70} color="#a7699e" />
            </TouchableOpacity>
            <TouchableOpacity onPress={goToCreate}>
              <Text
                style={{ fontWeight: "bold", textAlign: "center", color: "#DD7EA4", marginTop: 5 }}
              >
                Go to Create or upload a new item!
              </Text>
            </TouchableOpacity>
          </View>
        )}
        {image !== "" && ( // if image taken
          <Image
            source={{ uri: image }} // Display the selected image
            style={{
              marginTop: 1,
              width: Math.min(windowWidth * 0.9, windowHeight * 0.9),
              height: Math.min(windowWidth * 0.9, windowHeight * 0.9),
              aspectRatio: 1,
              borderWidth: 20,
              borderColor: "#90d7f8",
              borderRadius: 10,
              padding: 1,
              alignItems: "center",
            }}
          />
        )}
      </View>
      {tagVisible && <HandleTagImage onTag={handleTag} />}
      {console.log(image, tag)}
      <View
        style={{
          flexDirection: "row",
          position: "absolute",
          bottom: 30,
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        <View style={{ alignItems: "center", marginRight: 40 }}>
          <TouchableOpacity onPress={pickImage}>
            <Icon2 name="albums-sharp" size={70} color="#a7699e" />
            <Text style={{ textAlign: "center", color: "#DD7EA4", marginTop: 5 }}>Upload</Text>
          </TouchableOpacity>
        </View>
        <View style={{ alignItems: "center", marginRight: 40 }}>
          <TouchableOpacity onPress={takeImage}>
            <Icon name="camera" size={70} color="#a7699e" />
            <Text style={{ textAlign: "center", color: "#DD7EA4", marginTop: 5 }}>Take Photo</Text>
          </TouchableOpacity>
        </View>
        <View style={{ alignItems: "center" }}>
          <TouchableOpacity onPress={deleteImage}>
            <Icon3 name="trash-alt" size={70} color="#a7699e" />
            <Text style={{ textAlign: "center", color: "#DD7EA4", marginTop: 5 }}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default CameraScreen;
