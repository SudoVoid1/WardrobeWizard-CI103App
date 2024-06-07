import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getProfile, getAllOutfits } from "../../FirebaseFunctions/firebaseDatabaseFunctions";
import * as Sharing from "expo-sharing";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");
const numColumns = 3;
const itemWidth = width / numColumns;

export default function ProfileScreen({ navigation }) {
  const [outfitSet, setOutfitSet] = useState({});
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({ username: "", bio: "", pfp: "" });
  const navigator = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      getAllOutfits()
        .then((data) => {
          setOutfitSet(data);
          setLoading(false);
        })
        .catch((error) => {
          console.log("Error fetching user tags and images:", error);
          setLoading(false);
        });
    }, [])
  );
  useFocusEffect(
    React.useCallback(() => {
      getProfile()
        .then((data) => {
          setProfileData(data);
        })
        .catch((error) => {
          console.log("Error fetching profile data:", error);
        });
    }, [])
  );

  const shareClothing = async (item) => {
    Alert.alert("Do you want to share this piece of clothing?", "", [
      {
        text: "No",
        onPress: () => console.log("User cancelled"),
        style: "cancel",
      },
      {
        text: "Yes",
        onPress: async () => {
          await Sharing.shareAsync(item, { UTI: "image" });
          console.log("Link shared");
        },
      },
    ]);
  };
  //This creates a Flatlist inside of Flatlist so that the outfits are able to be strung vertically
  const renderOutfit = ({ item }) => {
    return (
      <FlatList
        data={item}
        horizontal={false}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => shareClothing(item)}>
            <Image source={{ uri: item }} style={styles.outfitItem} />
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.outfitContainer}
      />
    );
  };
  const editProfile = () => {
    navigator.navigate("Edit Profile");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.iconContainer}>
        <TouchableOpacity onPress={() => editProfile()}>
          <Icon name="edit" size={30} color="#caa5c5" />
        </TouchableOpacity>
      </View>
      <View style={styles.topHalf}>
        <Image
          source={profileData.pfp ? { uri: profileData.pfp } : require("../../assets/blue.png")}
          style={styles.pfp}
        />
      </View>
      <Text style={styles.username}>{profileData.username}</Text>
      <Text style={styles.bio}>{profileData.bio}</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#90d7f8" />
      ) : (
        <FlatList
          data={Object.values(outfitSet)}
          numColumns={numColumns}
          renderItem={renderOutfit}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.flatListContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#010010",
    justifyContent: "center",
    alignItems: "center",
  },
  topHalf: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  iconContainer: {
    alignSelf: "flex-end",
    marginTop: 10,
    marginRight: 10,
  },
  username: {
    fontSize: 20,
    fontWeight: "bold",
    backgroundColor: "#caa5c5",
    padding: 5,
    borderRadius: 12,
    marginBottom: 8,
    width: "90%",
  },
  bio: {
    fontSize: 15,
    borderWidth: 7,
    borderColor: "#caa5c5",
    backgroundColor: "#caa5c5",
    borderRadius: 12,
    width: "90%",
    height: 60,
    textAlignVertical: "top",
    marginBottom: 10,
  },
  pfp: {
    width: 75,
    height: 75,
    borderRadius: 100,
    margin: 10,
  },
  outfitContainer: {
    justifyContent: "space-around",
    alignItems: "center",
  },
  outfitItem: {
    width: 120,
    height: 120,
    borderWidth: 7,
    borderRadius: 15,
    margin: 2,
    borderColor: "#000000",
  },
};
