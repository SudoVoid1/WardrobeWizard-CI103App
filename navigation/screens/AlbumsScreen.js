import * as React from "react";
import { useState, useEffect } from "react";
import {
  View,
  FlatList,
  Dimensions,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
} from "react-native";
import {
  getUserTagsAndImages,
  getAllOutfits,
} from "../../FirebaseFunctions/firebaseDatabaseFunctions";
import { useFocusEffect } from "@react-navigation/native";
import Icon1 from "react-native-vector-icons/FontAwesome5";
import Icon2 from "react-native-vector-icons/Feather";
import * as Sharing from "expo-sharing";
import * as SMS from "expo-sms";

export default function AlbumsScreen({ navigation }) {
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const windowSize = Dimensions.get("window").width;
  const [dataSet, setDataSet] = useState([{ tag: "", images: [{ uri: "", uri: "" }] }]);
  const [outfitSet, setOutfitSet] = useState({ "": [""] });
  const [pageType, setPageType] = useState(true);
  const [loadingImages, setLoadingImages] = useState(true);
  const [loadingOutfits, setLoadingOutfits] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      // Gets user images with tags from the database
      getUserTagsAndImages()
        .then((data) => {
          // Stores return data in state
          setDataSet(data);
          setLoadingImages(false);
        })
        .catch((error) => {
          console.log("Error fetching user tags and images:", error);
          setLoadingImages(false);
        });
    }, [])
  );
  useFocusEffect(
    React.useCallback(() => {
      // Gets user outfits from the database
      getAllOutfits()
        .then((data) => {
          setOutfitSet(data);
          setLoadingOutfits(false);
        })
        .catch((error) => {
          console.log("Error fetching user tags and images:", error);
          setLoadingOutfits(false);
        });
    }, [])
  );

  const setAlbum = (albumName) => {
    setSelectedAlbum(albumName);
  };
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
  const shareOutfit = async () => {
    Alert.alert("Do you want to share this outfit?", "", [
      {
        text: "No",
        onPress: () => console.log("User cancelled"),
        style: "cancel",
      },
      {
        text: "Yes",
        onPress: async () => {
          const isAvailable = await SMS.isAvailableAsync();
          if (isAvailable) {
            // Gets all the links to each of the clothing pieces in the outfit
            let message = "";
            if (selectedOutfit != null) {
              links = Object.values(outfitSet[selectedOutfit]);
              message = links.join("\n");
            }
            try {
              //https://docs.expo.dev/versions/latest/sdk/sms/
              const { result } = await SMS.sendSMSAsync(
                [],
                "Check out my amazing outfit pieces:\n" + message
              );
              console.log(result);
            } catch (error) {
              console.log(error);
            }
          } else {
            console.log("No SMS available");
          }
        },
      },
    ]);
  };
  const switchPage = () => {
    setPageType(!pageType);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
      {pageType ? (
        <>
          <View style={{ flexDirection: "row", justifyContent: "space-around", padding: 20 }}>
            <TouchableOpacity onPress={switchPage}>
              <Icon1 name="sync-alt" size={40} color="#caa5c5" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  "Trying to share a photo?",
                  "Click any image you want to share!\n Or switch to outfits to share everything!",
                  [{ text: "OK" }]
                );
              }}
            >
              <Icon2 name="share" size={40} color="#caa5c5" />
            </TouchableOpacity>
          </View>
          {Object.keys(dataSet).length !== 0 && loadingImages ? (
            <Text>Go to the camera to take pictures!</Text>
          ) : (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={dataSet}
              style={{ marginTop: 15 }}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => setAlbum(item.tag)}>
                  <Image
                    //setting first image to be album cover
                    //could give user option later so im just marking it
                    source={{
                      uri: item.images[0].uri,
                    }}
                    style={{
                      width: windowSize / 3,
                      height: windowSize / 3,
                      borderWidth: 7,
                      borderColor: "#a7699e",
                      marginHorizontal: 2,
                      borderRadius: 15,
                    }}
                  />
                </TouchableOpacity>
              )}
            />
          )}
          {selectedAlbum && (
            <FlatList
              ListHeaderComponent={
                <Text style={{ fontSize: 30, textAlign: "center", color: "#90d7f8" }}>
                  {selectedAlbum}
                </Text>
              }
              data={dataSet.find((item) => item.tag === selectedAlbum).images}
              horizontal={false}
              numColumns={2}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => shareClothing(item.uri)}>
                  <Image
                    source={{ uri: item.uri }}
                    style={{
                      marginVertical: 3,
                      width: windowSize / 2.5,
                      height: windowSize / 2.5,
                      borderWidth: 7,
                      borderColor: "#90d7f8",
                      marginHorizontal: 3,
                      borderRadius: 15,
                    }}
                  />
                </TouchableOpacity>
              )}
              contentContainerStyle={{
                justifyContent: "center",
                alignItems: "center",
              }}
            />
          )}
        </>
      ) : (
        <>
          <View style={{ flexDirection: "row", justifyContent: "space-around", padding: 20 }}>
            <TouchableOpacity onPress={switchPage}>
              <Icon1 name="sync-alt" size={40} color="#caa5c5" />
            </TouchableOpacity>
            <TouchableOpacity onPress={shareOutfit}>
              <Icon2 name="share" size={40} color="#caa5c5" />
            </TouchableOpacity>
          </View>
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
              <Text
                style={{
                  fontSize: 30,
                  textAlign: "center",
                  color: "#90d7f8",
                  marginVertical: 10,
                }}
              >
                {selectedOutfit}
              </Text>
              <FlatList
                data={outfitSet[selectedOutfit]}
                horizontal={false}
                numColumns={2}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => shareClothing(item)}>
                    <Image
                      source={{ uri: item }}
                      style={{
                        marginVertical: 3,
                        width: windowSize / 2.5,
                        height: windowSize / 2.5,
                        borderWidth: 7,
                        borderColor: "#90d7f8",
                        marginHorizontal: 3,
                        borderRadius: 15,
                      }}
                    />
                  </TouchableOpacity>
                )}
                contentContainerStyle={{
                  justifyContent: "center",
                  alignItems: "center",
                }}
              />
            </>
          )}
        </>
      )}
    </SafeAreaView>
  );
}
