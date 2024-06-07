import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabase("database.db");
const lg = SQLite.openDatabase("AccountsDB.db", "default");

// Function that initialize the database and create tables
export const initDatabase = () => {
  db.transaction((tx) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS images (
           id INTEGER PRIMARY KEY AUTOINCREMENT,
           uri TEXT NOT NULL,
           tag TEXT NOT NULL
         );`
    );
  });
  lg.transaction((tx) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS (
                + "Users "
                + "(ID INTEGER PRIMARY KEY AUTOINCREMENT,username TEXT,password TEXT);`
    );
  });
};

// Dont mess with the strings inside!!!
// Function to insert image URI and tag into the database
export const insertImageWithTag = (uri, tag) => {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT id FROM images WHERE uri = ? AND tag = ?",
      [uri, tag],
      (_, result) => {
        if (result.rows.length > 0) {
          // If the URI and tag combination already exists, update the tag
          const imageId = result.rows.item(0).id;
          tx.executeSql(
            "UPDATE images SET tag = ? WHERE id = ?",
            [tag, imageId],
            (_, rowsAffected) => {
              if (rowsAffected > 0) {
                console.log("Updated tag for image with URI:", uri);
              } else {
                console.log("No rows were updated.");
              }
            },
            (_, error) => {
              console.error("Error updating tag:", error);
            }
          );
        } else {
          // If the URI and tag combination doesn't exist, insert a new row
          tx.executeSql(
            "INSERT INTO images (uri, tag) VALUES (?, ?)",
            [uri, tag],
            (_, { insertId }) => {
              console.log("Inserted new image with URI and tag:", uri, tag);
            },
            (_, error) => {
              console.error("Error inserting new entry:", error);
            }
          );
        }
      },
      (_, error) => {
        console.error("Error in the database", error);
      }
    );
  });
};
// Will be usual later on to get specific images based on there tags
export const getURIsByTag = (tag, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT uri FROM images WHERE tag = ?",
      [tag],
      (_, result) => {
        const uris = [];
        //searchs through each row of the database
        for (let i = 0; i < result.rows.length; i++) {
          uris.push(result.rows.item(i).uri);
        }
        //callback = return
        //Returns it as an array so will have to unpack on return
        callback(uris);
      },
      (_, error) => {
        //Fallback incase the user has no picture with that tag
        console.error("Error extracting URIs / None Exist:", error);
        callback([]);
      }
    );
  });
};

// Credit to Programming with Mash
// Followed this tutorial "https://www.youtube.com/watch?v=wAyizHBFQEs"
export const getLoginData = (username, password) => {
  try {
    lg.transaction((tx) => {
      tx.executeSql(
        "SELECT username, password FROM Users WHERE username = ? AND password = ?",
        [username, password],
        (_, results) => {
          var len = results.rows.length;
          if (len > 0) {
            console.log("Login Successful");
            return true; // Will then navigate to Main Screen/ Camera
          } else {
            console.log("User doesnt exist yet");
            return false;
          }
        }
      );
    });
  } catch (error) {
    console.log(error);
    return false;
  }
};

// Credit to Programming with Mash
// Followed this tutorial "https://www.youtube.com/watch?v=wAyizHBFQEs"
export const setAccountInfo = async (username, password) => {
  if (username.length === 0 || password.length === 0) {
    console.log("User entered Empty Data");
    return false;
  } else {
    try {
      await lg.transaction(async (tx) => {
        await tx.executeSql(
          "INSERT INTO Users (username, password) VALUES (?,?)"[(username, password)]
        );
        tx.executeSql("COMMIT");
      });
      console.log("New Account Created");
      return true; // // Will then navigate to Main Screen/ Camera
    } catch (error) {
      console.log("Error occurred, rolling back db:", error);
      await lg.transaction(async (tx) => {
        await tx.executeSql("ROLLBACK");
      });
      return false; // Some error occured
    }
  }
};
