import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import shirt1 from "../../assets/shirt1.png";
import blue from "../../assets/blue.png";
import Icon from "react-native-vector-icons/Entypo";
import Icon2 from "react-native-vector-icons/SimpleLineIcons";
import Icon3 from "react-native-vector-icons/Feather";
import { FontAwesome } from "@expo/vector-icons";
import { getAllPosts } from "../../FirebaseFunctions/firebaseDatabaseFunctions";

const windowSize = Dimensions.get("window").width;
const Post = ({ post }) => {
  const navigator = useNavigation();

  const goToProfile = (username) => {
    navigator.navigate("Profile", { user: username });
  };
  const goToComments = (id) => {
    navigator.navigate("Comment", { postID: id });
  };
  const [iconName, setIconName] = useState("heart-o");
  const switchIcon = () => {
    setIconName((prevIconName) => (prevIconName === "heart-o" ? "heart" : "heart-o"));
  };

  return (
    <SafeAreaView>
      <View
        style={{
          flex: 1,
          paddingEnd: 10,
        }}
      >
        <View style={{ flex: 1, flexDirection: "row", paddingLeft: 15 }}>
          <TouchableOpacity onPress={() => goToProfile(post.username)}>
            <Image
              source={{ uri: post.pfp }}
              style={{ width: 55, height: 55, borderRadius: 100, marginRight: 15 }}
            />
          </TouchableOpacity>
          <View>
            <TouchableOpacity onPress={() => goToProfile(post.username)}>
              <Text style={{ color: "#BB8BB2", fontSize: 30 }}>{post.username}</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={{ color: "#BB8BB2", fontSize: 15 }}>
                Purchased From: {post.purchasedFrom}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {post.outfitUris.map((uri, index) => (
            <View key={index} style={{ marginVertical: 10 }}>
              <TouchableOpacity>
                <Image
                  source={{ uri: uri }}
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
        <View style={{ flex: 1, flexDirection: "row", paddingLeft: 15 }}>
          <TouchableOpacity onPress={switchIcon}>
            <FontAwesome name={iconName} size={45} color="#90d7f8" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => goToComments(post.id)}>
            <Icon2 name={"bubble"} size={45} color={"#90d7f8"}></Icon2>
          </TouchableOpacity>
          <TouchableOpacity>
            <Icon3 name={"share"} size={45} color={"#90d7f8"}></Icon3>
          </TouchableOpacity>
        </View>
        <Text style={{ color: "#BB8BB2", fontSize: 20, paddingLeft: 15 }}>
          {post.username}: {post.caption}
        </Text>
      </View>
      <View style={{ paddingBottom: 50 }}></View>
    </SafeAreaView>
  );
};

const GroupPostings = ({ posts }) => {
  return (
    <View style={{ marginBottom: 20 }}>
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </View>
  );
};

const FeedScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [post, setPostInfo] = useState([]);
  const navigator = useNavigation();

  const goToPost = () => {
    navigator.navigate("Make Post");
  };
  useFocusEffect(
    React.useCallback(() => {
      getAllPosts()
        .then((data) => {
          setPostInfo(data);
          setLoading(false);
        })
        .catch((error) => {
          console.log("Error fetching outfits:", error);
          setLoading(false);
        });
    }, [])
  );

  return (
    <ScrollView
      style={{ backgroundColor: "#010000" }}
      contentContainerStyle={{ paddingVertical: 20 }}
    >
      <SafeAreaView>
        <View style={{ alignSelf: "flex-end", marginTop: 10, marginRight: 10 }}>
          <TouchableOpacity onPress={() => goToPost()}>
            <Icon name="edit" size={30} color="#caa5c5" />
          </TouchableOpacity>
        </View>
        {loading ? (
          <SafeAreaView>
            <ActivityIndicator size="large" color="#BB8BB2" />
          </SafeAreaView>
        ) : (
          <GroupPostings posts={post}></GroupPostings>
        )}
      </SafeAreaView>
    </ScrollView>
  );
};

export default FeedScreen;
