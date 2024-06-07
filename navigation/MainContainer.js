import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { View } from "react-native";
import Icon from "react-native-vector-icons/AntDesign";
import Icon2 from "react-native-vector-icons/Ionicons";
import Icon3 from "react-native-vector-icons/Entypo";

// Screens
import FeedScreen from "./screens/FeedScreen";
import CameraScreen from "./screens/CameraScreen";
import CreateScreen from "./screens/CreateScreen";
import ProfileScreen from "./screens/ProfileScreen";
import AlbumsScreen from "./screens/AlbumsScreen";
import LoginScreen from "./screens/LoginScreen";
import CommentScreen from "./screens/CommentScreen.js";
import EditProfileScreen from "./screens/EditProfileScreen";
import PostOutfitScreen from "./screens/PostOutfitScreen";

const FeedName = "Feed";
const CameraName = "Camera";
const ProfileName = "Profile";
const CreateName = "Create";
const AlbumsName = "Albums";
const LoginName = "Login";
const CommentName = "Comment";
const EditProfileName = "Edit Profile";
const PostOutfitName = "Make Post";

// Creates the bottom navigation bar on each of the screens
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainContainer() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  const handleUserLogin = () => {
    setIsLoggedIn(true);
  };
  return (
    <NavigationContainer>
      {!isLoggedIn ? (
        <LoginScreen onLogin={handleUserLogin} />
      ) : (
        <Stack.Navigator>
          <Stack.Screen
            name="Back"
            component={MainTabs}
            options={{ headerShown: false, headerStyle: { backgroundColor: "#010001" } }}
          />
          <Stack.Screen
            name={CommentName}
            component={CommentScreen}
            options={{ headerShown: false, headerStyle: { backgroundColor: "#010001" } }}
          />
          <Stack.Screen
            name={EditProfileName}
            component={EditProfileScreen}
            options={{ headerShown: false, headerStyle: { backgroundColor: "#000000" } }}
          />
          <Stack.Screen
            name={PostOutfitName}
            component={PostOutfitScreen}
            options={{ headerShown: false, headerStyle: { backgroundColor: "#010001" } }}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
function MainTabs() {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{ headerShown: false, tabBarStyle: { backgroundColor: "#010001" } }}
      >
        <Tab.Screen
          name={FeedName}
          component={FeedScreen}
          options={{
            tabBarIcon: (
              { color, size } //Icons and Color added by Kaylee
            ) => <Icon name="home" size={30} color="#90d7f8" />,
            tabBarLabelStyle: { color: "#90d7f8" },
          }}
        />

        <Tab.Screen
          name={CreateName}
          component={CreateScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icon2 name="shirt-outline" size={30} color="#90d7f8" />
            ),
            tabBarLabelStyle: { color: "#90d7f8" },
          }}
        />

        <Tab.Screen
          name={CameraName}
          component={CameraScreen}
          options={{
            tabBarIcon: ({ color, size }) => <Icon3 name="camera" size={30} color="#90d7f8" />,
            tabBarLabelStyle: { color: "#90d7f8" },
          }}
        />

        <Tab.Screen
          name={AlbumsName}
          component={AlbumsScreen}
          options={{
            tabBarIcon: ({ color, size }) => <Icon3 name="images" size={30} color="#90d7f8" />,
            tabBarLabelStyle: { color: "#90d7f8" },
          }}
        />

        <Tab.Screen
          name={ProfileName}
          component={ProfileScreen}
          options={{
            tabBarIcon: ({ color, size }) => <Icon name="meh" size={30} color="#90d7f8" />,
            tabBarLabelStyle: { color: "#90d7f8" },
          }}
        />
      </Tab.Navigator>
    </View>
  );
}

export default MainContainer;
