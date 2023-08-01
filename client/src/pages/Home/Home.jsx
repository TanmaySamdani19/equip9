import { useContext } from "react";
import { UserContext } from "../../UserContext";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import "./home.scss";

const HomePage = () => {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();

  const handleDeleteProfile = async () => {
    try {
      await axios.delete(`http://localhost:8800/api/users/${user.user_id}`);
      logout();
      navigate("/register"); // Navigate to the register page after deleting the profile
    } catch (error) {
      console.error("Error deleting user account:", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/register");
  };

  const renderGreeting = () => {
    const date = new Date();
    const hour = date.getHours();

    if (hour >= 5 && hour < 12) {
      return "Good Morning";
    } else if (hour >= 12 && hour < 17) {
      return "Good Afternoon";
    } else {
      return "Good Evening";
    }
  };

  return (
    <div className="home-page">
      <h2>
        {user
          ? `Welcome, ${user.first_name} ${user.last_name}`
          : renderGreeting()}
      </h2>
      {user ? (
        <div className="user-profile">
          {user.profile_picture_base64 && (
            <img
              src={`data:image/jpeg;base64,${user.profile_picture_base64}`}
              alt="Profile"
              className="profile-picture"
            />
          )}
          <div className="user-info">
            <p className="mobile-number">Mobile Number: {user.mobile_number}</p>
          </div>
          <div className="button-group">
            <button
              className="update-profile"
              onClick={() => navigate("/updateprofile")}
            >
              Update Profile
            </button>
            <button className="delete-profile" onClick={handleDeleteProfile}>
              Delete Profile
            </button>
            <button className="logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      ) : (
        <div className="login-section">
          <p>Please log in to see your information</p>
          <div className="button-group">
            <Link to="/login" className="login-button">
              Login
            </Link>
            <Link to="/register" className="register-button">
              Register
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
