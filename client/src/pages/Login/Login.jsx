import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./login.scss";
import { UserContext } from "../../UserContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useContext(UserContext);
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "mobileNumber") {
      setMobileNumber(value);
    } else if (name === "password") {
      setPassword(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:8800/login", {
        mobile_number: mobileNumber,
        password,
      });
      const userData = response.data.user;
      const { user_id, ...userInfo } = userData; // Extract user_id from userData
      login({ user_id, ...userInfo }); // Store user_id and other user information in UserContext
      navigate("/");
    } catch (error) {
      setError("Invalid credentials");
      console.error("Error logging in:", error);
    }

    setMobileNumber("");
    setPassword("");
  };

  const handleRegisterClick = () => {
    navigate("/register"); // Navigate to registration page
  };

  const handleGuestClick = () => {
    navigate("/"); // Navigate as a guest
  };

  return (
    <div className="login-page">
      <h2>Login</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="mobileNumber">Mobile Number:</label>
          <input
            type="text"
            id="mobileNumber"
            name="mobileNumber"
            value={mobileNumber}
            onChange={handleInputChange}
            required
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
        <button type="submit">Login</button>
        <button type="button" onClick={handleRegisterClick}>
          Register
        </button>
        <button type="button" onClick={handleGuestClick}>
          Continue as Guest
        </button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
};

export default LoginPage;
