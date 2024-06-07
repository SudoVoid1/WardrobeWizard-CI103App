import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { getComments, saveAllComments } from "../../FirebaseFunctions/firebaseDatabaseFunctions";

const CommentScreen = () => {
  const [comments, setComments] = useState([]); // Start with no comments
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [parentCommentId, setParentCommentId] = useState(null);
  const [idCounter, setIdCounter] = useState(1);
  const [loading, setLoading] = useState(true);
  const [postID, setPostID] = useState("");
  const route = useRoute();

  useFocusEffect(
    React.useCallback(() => {
      getComments(route.params?.postID)
        .then((data) => {
          setComments(data);
          setPostID(route.params?.postID);
          setLoading(false);
        })
        .catch((error) => {
          console.log("Error fetching outfits:", error);
          setLoading(false);
        });
    }, [])
  );

  const saveComments = async (updatedComments) => {
    try {
      await saveAllComments(updatedComments, postID);
      console.log("Saved Comments");
    } catch (error) {
      console.log("Error saving comments", error);
    }
  };

  const addComment = async () => {
    if (newComment.trim() === "") {
      return;
    }
    let updatedComments;
    if (replyTo) {
      const newReply = { id: idCounter, text: newComment, replies: [] };
      updatedComments = comments.map((comment) => {
        if (comment.id === replyTo) {
          return {
            ...comment,
            replies: [...comment.replies, newReply],
          };
        }
        return comment;
      });
      setReplyTo(null);
      setParentCommentId(null);
    } else {
      const newCommentObj = { id: idCounter, text: newComment, replies: [] };
      updatedComments = [...comments, newCommentObj];
    }
    setComments(updatedComments);
    setNewComment("");
    setIdCounter(idCounter + 1);
    await saveComments(updatedComments);
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.commentContainer}>
        <Text style={styles.commentText}>{item.text}</Text>
        <Button
          title="Reply"
          color="#90d7f8"
          onPress={() => {
            setReplyTo(item.id);
            setParentCommentId(item.id);
          }}
        />
        {item.replies.length > 0 && (
          <FlatList
            data={item.replies}
            renderItem={({ item }) => (
              <View style={styles.replyContainer}>
                <Text style={styles.replyText}>{item.text}</Text>
              </View>
            )}
            keyExtractor={(item) => item.id.toString()}
          />
        )}
        {parentCommentId === item.id && (
          <TextInput
            placeholder="Add a reply"
            value={newComment}
            onChangeText={(text) => setNewComment(text)}
            onSubmitEditing={addComment}
            style={styles.input}
          />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <FlatList
          data={comments}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Add a comment to start the conversation.</Text>
          }
        />
        <TextInput
          placeholder="Add a comment"
          value={newComment}
          onChangeText={(text) => setNewComment(text)}
          onSubmitEditing={addComment}
          style={styles.input}
        />
        <Button title="Add Comment" onPress={addComment} color="#90d7f8" />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#010001",
  },
  header: {
    fontSize: 20,
    marginBottom: 10,
  },
  commentContainer: {
    borderWidth: 1,
    borderColor: "#a7699e",
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#010001",
    borderRadius: 10,
  },
  commentText: {
    fontSize: 16,
    color: "#fdfdfc",
  },
  replyContainer: {
    marginLeft: 20,
    marginTop: 5,
    borderWidth: 1,
    borderColor: "#a7699e",
    padding: 10,
    backgroundColor: "#010001",
    borderRadius: 10,
  },
  replyText: {
    fontSize: 14,
    color: "#fdfdfc",
  },
  input: {
    borderWidth: 1,
    borderColor: "#a7699e",
    padding: 10,
    marginTop: 10,
    color: "#fdfdfc",
    borderRadius: 10,
  },
});

export default CommentScreen;
