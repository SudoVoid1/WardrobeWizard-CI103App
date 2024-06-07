import React, { useState } from "react";
import {
  View,
  FlatList,
  Dimensions,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  getAllOutfits,
  getProfile,
  savePost,
} from "../../FirebaseFunctions/firebaseDatabaseFunctions";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Entypo";
import Icon2 from "react-native-vector-icons/SimpleLineIcons";
import Icon3 from "react-native-vector-icons/Feather";
import blue from "../../assets/blue.png";

const windowSize = Dimensions.get("window").width;

export default function PostOutfit({ navigation }) {
  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const [outfitSet, setOutfitSet] = useState({});
  const [loadingOutfits, setLoadingOutfits] = useState(true);
  const [username, setUsername] = useState("");
  const [pfp, setPfp] = useState("");
  const [caption, setCaption] = useState("Check out this outfit");
  const [purchasedFrom, setPurchasedFrom] = useState("");
  const navigator = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      getAllOutfits()
        .then((data) => {
          setOutfitSet(data);
          setLoadingOutfits(false);
        })
        .catch((error) => {
          console.log("Error fetching outfits:", error);
          setLoadingOutfits(false);
        });
    }, [])
  );

  useFocusEffect(
    React.useCallback(() => {
      getProfile()
        .then((data) => {
          setUsername(data.username);
          setPfp(data.pfp);
        })
        .catch((error) => {
          console.log("Error fetching username:", error);
        });
    }, [])
  );

  const submitOutfit = async () => {
    console.log(outfitSet[selectedOutfit]);
    console.log(pfp);
    console.log(username);
    console.log(purchasedFrom);
    console.log(caption);
    await savePost(outfitSet[selectedOutfit], purchasedFrom, caption);
    navigator.navigate("Feed");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <Text style={{ textAlign: "center", color: "#BB8BB2", fontSize: 30 }}>
            Preview Post For
          </Text>
          {Object.keys(outfitSet).length !== 0 && loadingOutfits ? (
            <Text>Go to the create screen to make an outfit!</Text>
          ) : (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={Object.keys(outfitSet)}
              style={{ marginTop: 15 }}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => setSelectedOutfit(item)}>
                  <Text style={{ color: "#caa5c5", marginHorizontal: 10, fontSize: 30 }}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}
          {selectedOutfit && (
            <>
              <View
                style={{
                  flexDirection: "row",
                  padding: 10,
                  alignItems: "center",
                }}
              >
                <TouchableOpacity>
                  <Image
                    source={pfp ? { uri: pfp } : blue}
                    style={{ width: 55, height: 55, borderRadius: 100, marginRight: 15 }}
                  />
                </TouchableOpacity>
                <View>
                  <TouchableOpacity>
                    <Text style={{ color: "#BB8BB2", fontSize: 30 }}>{username}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Text style={{ color: "#BB8BB2", fontSize: 15 }}>Purchased From:</Text>
                    <TextInput
                      multiline={false}
                      maxLength={30}
                      style={{ color: "#BB8BB2", fontSize: 15 }}
                      placeholder="Abercombie, Target, J-Crew,..."
                      onChangeText={setPurchasedFrom}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={{ alignItems: "center", backgroundColor: "#8b8589" }}>
                {outfitSet[selectedOutfit].map((item, index) => (
                  <View key={index} style={{ marginVertical: 10 }}>
                    <TouchableOpacity>
                      <Image
                        source={{ uri: item }}
                        style={{
                          width: windowSize / 3,
                          height: windowSize / 3,
                          borderRadius: 20,
                        }}
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
              <View style={{ flexDirection: "row", paddingLeft: 15, alignItems: "flex-start" }}>
                <TouchableOpacity>
                  <Icon name={"heart-outlined"} size={50} color={"#90d7f8"}></Icon>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Icon2 name={"bubble"} size={45} color={"#90d7f8"}></Icon2>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Icon3 name={"share"} size={45} color={"#90d7f8"}></Icon3>
                </TouchableOpacity>
              </View>

              <Text
                style={{
                  color: "#BB8BB2",
                  fontSize: 20,
                  paddingLeft: 15,
                }}
              >
                {username}:
              </Text>

              <TextInput
                multiline={false}
                maxLength={30}
                style={{ color: "#BB8BB2", fontSize: 20, paddingLeft: 15 }}
                placeholder="Click to edit your caption!"
                onChangeText={setCaption}
              />
              <View style={{ width: windowSize, paddingHorizontal: 20 }}>
                <TouchableOpacity
                  style={{
                    marginTop: 30,
                    backgroundColor: "#90d7f8",
                    paddingVertical: 15,
                    borderRadius: 5,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onPress={() => submitOutfit()}
                >
                  <Text
                    style={{
                      color: "#BB8BB2",
                      fontSize: 18,
                      fontWeight: "bold",
                    }}
                  >
                    Post Outfit
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
