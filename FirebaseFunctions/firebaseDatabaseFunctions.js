import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import {
  addDoc,
  collection,
  onSnapshot,
  getDocs,
  query,
  where,
  getDoc,
  setDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { firebaseApp, storage, db, auth } from "./firebaseConfig";

import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

const uploadImageWithTag = async (imageURI, fileType, tag) => {
  try {
    // Fetch the image as a blob
    // Work around since easy way was broken with expo
    // Credit: sjchmiela
    // Source: https://github.com/expo/expo/issues/2402#issuecomment-443726662
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        console.log(e);
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", imageURI, true);
      xhr.send(null);
    });

    // CREDIT TO: Code with Beto, absolute goat
    // Source https://www.youtube.com/watch?v=cq5TGA6sBQQ
    const storageRef = ref(storage, "images/" + uuidv4());
    const uploadImage = uploadBytesResumable(storageRef, blob);
    uploadImage.on(
      "state_change",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Progress", progress);
      },
      (error) => {
        console.error(error);
      },
      () => {
        getDownloadURL(uploadImage.snapshot.ref).then(async (downloadURl) => {
          console.log("File available at", downloadURl);
          await saveImageWithTag(fileType, downloadURl, tag);
        });
      }
    );
  } catch (error) {
    console.log("Error uploading image:", error);
  }
};

const saveImageWithTag = async (fileType, url, tag) => {
  try {
    //This will change the path of the database
    // Can thus be used to list out all a users images under a tag
    const docRef = await addDoc(collection(db, auth.currentUser.uid), {
      fileType,
      tag,
      url,
    });
    console.log("Document saved correctly", docRef.id);
  } catch (error) {
    console.log(error);
  }
};
const getUserTagsAndImages = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, auth.currentUser.uid));
    const userImages = {};
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (doc.id !== "outfitNames") {
        const { tag, url } = data;
        if (!userImages[tag]) {
          userImages[tag] = [];
        }
        userImages[tag].push({ url });
      }
    });

    // Transform data into the desired format
    const organizeData = Object.entries(userImages).map((entry) => ({
      tag: entry[0], // Accessing the tag directly from the first element of the entry
      images: entry[1].map((obj) => ({ uri: obj.url })),
    }));

    return organizeData;
  } catch (error) {
    console.log("Error fetching user tags:", error);
  }
};

//Credit: ChatGpt
//Helped organize all the tags instead of me manually doing it
const getCategory = (tag) => {
  switch (tag) {
    case "Beanie":
    case "Cap":
    case "Sun Hat":
    case "Hat":
      return "Hats";
    case "Scarf":
    case "Jewelry":
      return "Accessories/Jewelry";
    case "T-Shirt":
    case "Shirt":
    case "Blouse":
    case "Dress Shirt":
    case "Tank Top":
    case "Halter Top":
    case "Tube Top":
    case "Jersey":
    case "Jacket":
    case "Cardigan":
    case "Coat":
    case "Flannel":
    case "Sweatshirt":
    case "Crew Neck":
    case "Turtle Neck":
    case "Athletic Wear":
    case "Swimwear":
    case "Business Casual":
      return "Shirts";
    case "Pant":
    case "Dress Pant":
    case "Sweatpant":
    case "Short":
    case "Jeans":
    case "Leggings":
    case "Skirt":
      return "Pants";
    case "Sneakers":
    case "Dress Shoes":
    case "Heels":
    case "Flats":
    case "Boots":
    case "Flip Flops":
      return "Shoes";
    default:
      return "Other";
  }
};

const getImagesIntoCategory = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, auth.currentUser.uid));
    const userImagesByCategory = {};
    const categorizedTags = {};

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const { tag, url } = data;

      // Determine the category for the tag using the other function
      const category = getCategory(tag);

      if (!userImagesByCategory[category]) {
        userImagesByCategory[category] = [];
      }
      userImagesByCategory[category].push({ url });

      categorizedTags[tag] = true;
    });

    // Transform data into the desired format
    const organizedData = Object.entries(userImagesByCategory).map(([category, images]) => ({
      category,
      images,
    }));
    const categoryOrder = ["Hats", "Accessories/Jewelry", "Shirts", "Pants", "Shoes"];
    const inOrder = organizedData.sort((a, b) => {
      return categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
    });
    //console.log("User images categorized successfully");
    return inOrder;
  } catch (error) {
    console.log("Error fetching user category images:", error);
  }
};

const saveOutfit = async (outfitName, selectedImages) => {
  try {
    const docRef = doc(db, auth.currentUser.uid, "outfitNames");
    // Retrieve the current data from the document
    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
      // Extract the current outfit names array
      const data = docSnapshot.data();
      const currentOutfitNames = data.outFitNames || [];

      // Add the new outfit name to the array
      const newOutfitNames = [...currentOutfitNames, outfitName];

      // Update the document with the new array
      await updateDoc(docRef, {
        outFitNames: newOutfitNames,
      });

      console.log("Document successfully updated with new outfit name");
    } else {
      // Document does not exist, create a new one with the outfit name
      await setDoc(docRef, {
        outFitNames: [outfitName],
      });

      console.log("Document created and outfit name added");
    }
  } catch (error) {
    console.error("Error updating or creating document: ", error);
  }

  try {
    const outfitCollectionRef = collection(db, auth.currentUser.uid, "outfits", outfitName);
    for (const [category, image] of Object.entries(selectedImages)) {
      const docRef = await addDoc(outfitCollectionRef, {
        category,
        url: image.url,
      });
      console.log("Document saved correctly for category", category, "ID:", docRef.id);
    }
    console.log("Outfit saved successfully:", outfitName);
  } catch (error) {
    console.log(error);
  }
};
const getOutfit = async (outfitName) => {
  try {
    const outfitCollectionRef = collection(db, auth.currentUser.uid, "outfits", outfitName);
    const querySnapshot = await getDocs(outfitCollectionRef);

    const urlsWithCategorys = {};
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const category = data.category;
      const url = data.url;
      urlsWithCategorys[category] = url;
    });

    console.log("URLs for outfit", outfitName, ":", urlsWithCategorys);
    return urlsWithCategorys;
  } catch (error) {
    console.log("Error getting URLs for outfit", outfitName, ":", error);
    return {};
  }
};

const getAllOutfits = async () => {
  try {
    let outfitNames = [];
    const docRef = doc(db, auth.currentUser.uid, "outfitNames");

    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      outfitNames = data.outFitNames || []; // Return the outfitNames array or an empty array if it doesn't exist
    } else {
      console.log("No such document!");
      outfitNames = []; // Return an empty array if the document doesn't exist
    }

    const allOutfits = {};
    for (const outfitName of outfitNames) {
      const outfitRef = collection(db, auth.currentUser.uid, "outfits", outfitName);
      const outfitSnapshot = await getDocs(outfitRef);
      const outfits = [];
      outfitSnapshot.forEach((doc) => {
        outfits.push(doc.data());
      });

      // Sort outfits based on category order
      outfits.sort((a, b) => {
        const categoryOrder = {
          Hats: 0,
          Shirts: 1,
          Pants: 2,
          Shoes: 3,
        };
        return categoryOrder[a.category] - categoryOrder[b.category];
      });

      const urls = outfits.map((outfit) => outfit.url);
      allOutfits[outfitName] = urls;
    }
    return allOutfits;
  } catch (error) {
    console.log(error);
  }
};
const saveProfile = async (imageURI, username, bio) => {
  try {
    // Fetch the image as a blob
    // Work around since easy way was broken with expo
    // Credit: sjchmiela
    // Source: https://github.com/expo/expo/issues/2402#issuecomment-443726662
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        console.log(e);
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", imageURI, true);
      xhr.send(null);
    });

    // CREDIT TO: Code with Beto, absolute goat
    // Source https://www.youtube.com/watch?v=cq5TGA6sBQQ
    const storageRef = ref(storage, "profilePictures/" + uuidv4());
    const uploadImage = uploadBytesResumable(storageRef, blob);
    uploadImage.on(
      "state_change",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Progress", progress);
      },
      (error) => {
        console.error(error);
      },
      () => {
        getDownloadURL(uploadImage.snapshot.ref).then(async (downloadURl) => {
          console.log("File available at", downloadURl);
          await saveProfilePicture(downloadURl);
          await saveBio(bio);
          await saveUsername(username);
        });
      }
    );
  } catch (error) {
    console.log("Error uploading image:", error);
  }
};

const saveProfilePicture = async (profilePic) => {
  try {
    const docRef = doc(db, auth.currentUser.uid, "Profile", "userInfo", "profilePic");
    await setDoc(docRef, { profilePic });
    console.log("Profile picture saved", docRef.id);
  } catch (error) {
    console.log(error);
  }
};
const saveUsername = async (username) => {
  try {
    const docRef = doc(db, auth.currentUser.uid, "Profile", "userInfo", "username");
    await setDoc(docRef, { username }, { merge: true });
    console.log("Username saved", docRef.id);
  } catch (error) {
    console.log(error);
  }
};
const saveBio = async (bio) => {
  try {
    const docRef = doc(db, auth.currentUser.uid, "Profile", "userInfo", "bio");
    await setDoc(docRef, { bio }, { merge: true });
    console.log("Bio saved", docRef.id);
  } catch (error) {
    console.log(error);
  }
};
const getProfile = async () => {
  try {
    let profileData = { username: "", bio: "", pfp: "" };
    const usernameRef = doc(db, auth.currentUser.uid, "Profile", "userInfo", "username");
    const bioRef = doc(db, auth.currentUser.uid, "Profile", "userInfo", "bio");
    const pfpRef = doc(db, auth.currentUser.uid, "Profile", "userInfo", "profilePic");
    const usernameSnapshot = await getDoc(usernameRef);
    const bioSnapshot = await getDoc(bioRef);
    const pfpSnapshot = await getDoc(pfpRef);

    if (usernameSnapshot.exists() && bioSnapshot.exists && pfpSnapshot.exists()) {
      const username = usernameSnapshot.data().username;
      const bio = bioSnapshot.data().bio;
      const pfp = pfpSnapshot.data().profilePic;
      profileData["username"] = username;
      profileData["bio"] = bio;
      profileData["pfp"] = pfp;
    } else {
      console.log("No such document!");
      // Return an empty dictionary if any of the documents dont exist
      return profileData;
    }
    return profileData;
  } catch (error) {
    console.log(error);
  }
};
const savePost = async (outfitURIs, purchasedFrom, caption) => {
  try {
    const docRef = await addDoc(collection(db, "Posts"), {
      id: uuidv4(),
      outfitURIs,
      pfpURI: doc(db, auth.currentUser.uid, "Profile", "userInfo", "profilePic"),
      username: doc(db, auth.currentUser.uid, "Profile", "userInfo", "username"),
      purchasedFrom,
      caption,
      comments: [""],
    });
    console.log("Document saved correctly", docRef.id);
  } catch (error) {
    console.log(error);
  }
};
const getAllPosts = async () => {
  try {
    const postRef = collection(db, "Posts");
    const postSnapshot = await getDocs(postRef);
    const posts = [];
    for (const postDoc of postSnapshot.docs) {
      const postData = postDoc.data();
      const usernameDoc = await getDoc(postData.username);
      const pfpDoc = await getDoc(postData.pfpURI);
      const usernameData = usernameDoc.data();
      const pfpData = pfpDoc.data();

      posts.push({
        id: postData.id,
        username: usernameData.username,
        pfp: pfpData.profilePic,
        purchasedFrom: postData.purchasedFrom,
        caption: postData.caption,
        outfitUris: postData.outfitURIs,
      });
    }
    return posts;
  } catch (error) {
    console.log(error);
  }
};

const saveAllComments = async (comments, postID) => {
  console.log(comments);
  try {
    // Query to find the document where the postID matches
    const postsCollectionRef = collection(db, "Posts");
    const q = query(postsCollectionRef, where("id", "==", postID));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docSnapshot = querySnapshot.docs[0];
      await updateDoc(doc(db, "Posts", docSnapshot.id), { comments: comments });
      console.log("Comments updated for post with postID:", postID);
    } else {
      console.log("No posts found with the given postID:", postID);
    }
  } catch (error) {
    console.error("Error updating comments:", error);
  }
};
const getComments = async (postID) => {
  try {
    const postsCollectionRef = collection(db, "Posts");
    const q = query(postsCollectionRef, where("id", "==", postID));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docSnapshot = querySnapshot.docs[0];
      const data = docSnapshot.data();
      return data.comments || []; // Return the comments or an empty array if none
    } else {
      console.log("No post found with the given postID");
      return [];
    }
  } catch (error) {
    console.log("Error getting comments:", error);
    return [];
  }
};

export {
  uploadImageWithTag,
  getUserTagsAndImages,
  getImagesIntoCategory,
  saveOutfit,
  getOutfit,
  getAllOutfits,
  saveProfile,
  getProfile,
  savePost,
  getAllPosts,
  getComments,
  saveAllComments,
};
