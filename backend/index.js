const express = require("express");
const app = express();
const PORT = 8800;
const AWS = require("aws-sdk");
const fileUpload = require("express-fileupload");
app.use(express.json());
const mysql = require("mysql");
const bcrypt = require("bcrypt");
const cors = require("cors");
app.use(fileUpload());
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

AWS.config.update({
  accessKeyId: "AKIA3KZVK3RM6V72UAHV",
  secretAccessKey: "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",
  region: "ap-south-1",
});

const s3 = new AWS.S3();

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "test",
});

// Register route
app.post("/register", async (req, res) => {
  try {
    const { first_name, last_name, mobile_number, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const createUserQuery = `
      INSERT INTO users (first_name, last_name, mobile_number, password, profile_picture_key, created_by, created_date)
      VALUES (?, ?, ?, ?, ?, CONCAT(?, ' ', ?), UTC_TIMESTAMP())
    `;

    const file = req.files.profile_picture;
    const fileContent = file.data;

    const profile_picture_key = file.name;

    const params = {
      Bucket: "equip9-testing",
      Key: profile_picture_key,
      Body: fileContent,
    };

    s3.upload(params, (uploadErr, data) => {
      if (uploadErr) {
        console.error("Error uploading file to S3:", uploadErr);
        res.status(500).json({ error: "Error uploading file to S3" });
      } else {
        const created_by = first_name;
        const created_date = new Date().toISOString();

        db.query(
          createUserQuery,
          [
            first_name,
            last_name,
            mobile_number,
            hashedPassword,
            profile_picture_key,
            created_by,
            last_name,
          ],
          (dbErr, result) => {
            if (dbErr) {
              console.error("Error creating user:", dbErr);
              res.status(500).json({ error: "Error creating user" });
            } else {
              const user_id = result.insertId; // Get the inserted user ID

              res.json({
                response_code: 200,
                response_message: "User registered successfully",
                user_id: user_id,
              });
            }
          }
        );
      }
    });
  } catch (error) {
    console.error("Error hashing password:", error);
    res.status(500).json({ error: "Error hashing password" });
  }
});

// Login route
app.post("/login", (req, res) => {
  const { mobile_number, password } = req.body;

  const getUserQuery = `
    SELECT id, first_name, last_name, mobile_number, password, profile_picture_key
    FROM users
    WHERE mobile_number = ?
  `;

  db.query(getUserQuery, [mobile_number], (dbErr, results) => {
    if (dbErr) {
      console.error("Error retrieving user:", dbErr);
      res.status(500).json({ error: "Error retrieving user" });
    } else {
      if (results.length === 0) {
        res.status(401).json({ error: "Invalid mobile number" });
      } else {
        const user = results[0];
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) {
            console.error("Error comparing passwords:", err);
            res.status(500).json({ error: "Error comparing passwords" });
          } else if (isMatch) {
            const {
              id,
              first_name,
              last_name,
              mobile_number,
              profile_picture_key,
            } = user;

            const params = {
              Bucket: "equip9-testing",
              Key: profile_picture_key,
            };

            s3.getObject(params, (s3Err, data) => {
              if (s3Err) {
                console.error("Error retrieving profile picture:", s3Err);
                res
                  .status(500)
                  .json({ error: "Error retrieving profile picture" });
              } else {
                const profile_picture_base64 = data.Body.toString("base64");
                res.json({
                  message: "Login successful",
                  user: {
                    user_id: id, // Include the user ID in the response
                    profile_picture_base64,
                    first_name,
                    last_name,
                    mobile_number,
                  },
                });
              }
            });
          } else {
            res.status(401).json({ error: "Invalid password" });
          }
        });
      }
    }
  });
});

// GET API to retrieve a user by user ID
app.get("/api/users/:user_id", (req, res) => {
  const user_id = req.params.user_id;

  const getUserQuery = "CALL SelectUser(?)";
  db.query(getUserQuery, [user_id], (err, results) => {
    if (err) {
      console.error("Error retrieving user:", err);
      res.status(500).json({ error: "Error retrieving user" });
    } else {
      if (results.length === 0) {
        res.status(404).json({ error: "User not found" });
      } else {
        const user = results[0][0];

        const s3Params = {
          Bucket: "equip9-testing",
          Key: user.profile_picture_key,
        };

        s3.getObject(s3Params, (err, data) => {
          if (err) {
            console.error("Error retrieving profile picture from S3:", err);
            res.status(500).json({ error: "Error retrieving profile picture" });
          } else {
            const profile_picture_base64 = data.Body.toString("base64");

            const userWithProfilePicture = {
              ...user,
              profile_picture_base64,
            };

            res.json(userWithProfilePicture);
          }
        });
      }
    }
  });
});

// PUT API to update a user by user
const moment = require("moment");

//
app.put("/api/users/:user_id", (req, res) => {
  const user_id = req.params.user_id;
  const { first_name, last_name, mobile_number, password } = req.body;
  const file = req.files && req.files.profile_picture; // Assuming the file field is named "profile_picture"

  if (file) {
    const fileContent = file.data;
    const fileKey = `profile_pictures/${file.name}`;

    const s3Params = {
      Bucket: "equip9-testing",
      Key: fileKey,
      Body: fileContent,
    };

    s3.upload(s3Params, (err, data) => {
      if (err) {
        console.error("Error uploading profile picture to S3:", err);
        res.status(500).json({ error: "Error uploading profile picture" });
      } else {
        const profile_picture_key = fileKey;

        const updateUserQuery = `
          UPDATE users
          SET first_name = COALESCE(?, first_name),
              last_name = COALESCE(?, last_name),
              mobile_number = COALESCE(?, mobile_number),
              password = COALESCE(?, password),
              profile_picture_key = COALESCE(?, profile_picture_key),
              updated_by = ?,
              updated_date = ?
          WHERE id = ?
        `;

        db.query(
          updateUserQuery,
          [
            first_name,
            last_name,
            mobile_number,
            password,
            profile_picture_key,
            `${first_name} ${last_name}`, // updated_by
            moment().format("YYYY-MM-DD HH:mm:ss"), // updated_date
            user_id,
          ],
          (err) => {
            if (err) {
              console.error("Error updating user:", err);
              res.status(500).json({ error: "Error updating user" });
            } else {
              res.json({ message: "User updated successfully" });
            }
          }
        );
      }
    });
  } else {
    const updateUserQuery = `
      UPDATE users
      SET first_name = COALESCE(?, first_name),
          last_name = COALESCE(?, last_name),
          mobile_number = COALESCE(?, mobile_number),
          password = COALESCE(?, password),
          updated_by = ?,
          updated_date = ?
      WHERE id = ?
    `;

    db.query(
      updateUserQuery,
      [
        first_name,
        last_name,
        mobile_number,
        password,
        `${first_name} ${last_name}`, // updated_by
        moment().format("YYYY-MM-DD HH:mm:ss"), // updated_date
        user_id,
      ],
      (err) => {
        if (err) {
          console.error("Error updating user:", err);
          res.status(500).json({ error: "Error updating user" });
        } else {
          res.json({ message: "User updated successfully" });
        }
      }
    );
  }
});

// DELETE API to delete a user by user ID
app.delete("/api/users/:user_id", (req, res) => {
  const user_id = req.params.user_id;

  const deleteUserQuery = "CALL DeleteUser(?)";
  db.query(deleteUserQuery, [user_id], (err) => {
    if (err) {
      console.error("Error deleting user:", err);
      res.status(500).json({ error: "Error deleting user" });
    } else {
      res.json({ message: "User deleted successfully" });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


//  // Generate JWT token
//  const token = jwt.sign({ user_id: user.id }, 'your-secret-key', {
//   expiresIn: '1h',
// });

// res.json({
//   response_code: 200,
//   response_message: 'User registered successfully',
//   user_id: user.id,
//   token: token, // Include the generated token in the response
// });