import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./register.scss";

const RegisterForm = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "firstName") {
      setFirstName(value);
    } else if (name === "lastName") {
      setLastName(value);
    } else if (name === "mobileNumber") {
      const formattedValue = value.replace(/\D/g, "");
      setMobileNumber(formattedValue);
    } else if (name === "password") {
      setPassword(value);
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    setProfilePicture(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mobileNumber.length !== 10) {
      setError("Mobile number must be 10 digits long");
      return;
    }

    setError("");
    setIsLoading(true);

    const formData = new FormData();
    formData.append("first_name", firstName);
    formData.append("last_name", lastName);
    formData.append("mobile_number", mobileNumber);
    formData.append("password", password);

    if (profilePicture) {
      formData.append("profile_picture", profilePicture);
    }

    try {
      const response = await axios.post(
        "http://localhost:8800/register",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(response.data);
      navigate("/login"); // Redirect to login page after successful registration
    } catch (error) {
      console.error("Error registering user:", error);
      setError("Registration failed. Please try again."); // Set error message for registration failure
    }

    setIsLoading(false);
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleGuestClick = () => {
    navigate("/");
  };

  return (
    <div className="registration-form">
      <h2>Registration Form</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="firstName">First Name:</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={firstName}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="lastName">Last Name:</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={lastName}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="mobileNumber">Mobile Number:</label>
          <input
            type="tel"
            id="mobileNumber"
            name="mobileNumber"
            value={mobileNumber}
            onChange={handleInputChange}
            required
            pattern="[0-9]{10}"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="profilePicture">Profile Picture:</label>
          <input
            type="file"
            id="profilePicture"
            name="profilePicture"
            onChange={handleProfilePictureChange}
            required
            accept="image/*" // Accept only image files
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <div className="button-group">
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Registering..." : "Register"}
          </button>
          <button type="button" onClick={handleLoginClick}>
            Login
          </button>
          <button type="button" onClick={handleGuestClick}>
            Continue as Guest
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
