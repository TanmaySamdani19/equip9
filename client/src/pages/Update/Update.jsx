import { useEffect, useState, useContext } from "react";
import { UserContext } from "../../UserContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./update.scss";

const UpdateProfilePage = () => {
  const { user, updateUser } = useContext(UserContext);
  const [updatedUserInfo, setUpdatedUserInfo] = useState({
    first_name: user ? user.first_name : "",
    last_name: user ? user.last_name : "",
    mobile_number: user ? user.mobile_number : "",
    profile_picture: null,
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setUpdatedUserInfo({
        first_name: user.first_name,
        last_name: user.last_name,
        mobile_number: user.mobile_number,
        profile_picture: null,
      });
    }
  }, [user]);

  const handleInputChange = (event) => {
    if (event.target.name === "profile_picture") {
      setUpdatedUserInfo((prevState) => ({
        ...prevState,
        profile_picture: event.target.files[0],
      }));
    } else {
      setUpdatedUserInfo((prevState) => ({
        ...prevState,
        [event.target.name]: event.target.value,
      }));
    }
  };

  const handleUpdateUserInfo = async (event) => {
    event.preventDefault();

    try {
      const formData = new FormData();

      // Append fields that have been updated
      if (updatedUserInfo.first_name !== user.first_name) {
        formData.append("first_name", updatedUserInfo.first_name);
      }
      if (updatedUserInfo.last_name !== user.last_name) {
        formData.append("last_name", updatedUserInfo.last_name);
      }
      if (updatedUserInfo.mobile_number !== user.mobile_number) {
        formData.append("mobile_number", updatedUserInfo.mobile_number);
      }
      if (updatedUserInfo.profile_picture) {
        formData.append("profile_picture", updatedUserInfo.profile_picture);
      }

      // Check if any fields have been updated
      const hasChanges =
        formData.has("first_name") ||
        formData.has("last_name") ||
        formData.has("mobile_number") ||
        formData.has("profile_picture");

      if (hasChanges) {
        // Send the update request only if there are changes
        await axios.put(
          `http://localhost:8800/api/users/${user.user_id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        console.log("User information updated:", updatedUserInfo);

        // Fetch the updated user information from the server
        const response = await axios.get(
          `http://localhost:8800/api/users/${user.user_id}`
        );

        // Update the user object in the UserContext with the complete updated user object
        updateUser(response.data);

        navigate("/");
      } else {
        console.log("No changes to update.");
        navigate("/");
      }
    } catch (error) {
      console.error("Error updating user information:", error);
    }
  };

  return (
    <div className="update-profile-page">
      <h2>Update Profile</h2>
      {user && user.profile_picture_base64 && (
        <img
          src={`data:image/jpeg;base64,${user.profile_picture_base64}`}
          alt="Profile"
          className="profile-picture"
        />
      )}
      <form onSubmit={handleUpdateUserInfo}>
        <label>
          First Name:
          <input
            type="text"
            name="first_name"
            value={updatedUserInfo.first_name}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Last Name:
          <input
            type="text"
            name="last_name"
            value={updatedUserInfo.last_name}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Mobile Number:
          <input
            type="text"
            name="mobile_number"
            value={updatedUserInfo.mobile_number}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Profile Picture:
          <input
            type="file"
            name="profile_picture"
            accept="image/*"
            onChange={handleInputChange}
          />
        </label>
        <button type="submit">Update</button>
      </form>
    </div>
  );
};

export default UpdateProfilePage;
